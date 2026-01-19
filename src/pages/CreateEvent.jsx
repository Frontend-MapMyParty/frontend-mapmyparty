import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check, Calendar as CalendarIcon, Clock, Globe, Upload, X, ChevronLeft, Plus, Ticket, Users, Table2, UsersRound, Loader2, Smile } from "lucide-react";
import Header from "@/components/Header";
import LoadingOverlay from "@/components/LoadingOverlay";
import { toast } from "sonner";
import { useEvents } from "@/hooks/useEvents";
import eventMusic from "@/assets/event-music.jpg";
import TicketTypeModal from "@/components/TicketTypeModal";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { updateEventStep1, updateEventStep2, uploadFlyerImage, deleteFlyerImage, uploadGalleryImages, deleteGalleryImage, generateEventId, createTicket, deleteTicket, createVenue, updateVenue, createArtist, updateEventStep6, uploadArtistImage, uploadTempImage, createEventStep1, persistFlyerUrl, persistGalleryUrls } from "@/services/eventService";
import { apiFetch } from "@/config/api";
import { TEMPLATE_CONFIGS, DETAIL_TEMPLATE_CONFIGS, getTemplateConfig, mapTemplateId, mapTemplateNameToId } from "@/config/templates";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

const CreateEvent = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  // Map URL type query to backend enum values
  const eventTypeMapping = {
    "guest-list": "GUESTLIST",
    "exclusive": "EXCLUSIVE",
    "non-exclusive": "NON_EXCLUSIVE",
  };
  const { addEvent, events, updateEvent } = useEvents();
  const [currentStep, setCurrentStep] = useState(1);
  const [eventType, setEventType] = useState("one-time");
  const [coverImage, setCoverImage] = useState(null);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [existingGalleryUrls, setExistingGalleryUrls] = useState([]); // Existing images from backend (URLs)
  const [galleryImages, setGalleryImages] = useState([]); // All images (existing URLs + new previews)
  const [galleryImageFiles, setGalleryImageFiles] = useState([]); // Only NEW files to upload
  const [tempCoverUpload, setTempCoverUpload] = useState(null); // Cloudinary temp result before event creation
  const [tempGalleryUploads, setTempGalleryUploads] = useState([]); // Temp Cloudinary uploads before event creation
  const [galleryImageIds, setGalleryImageIds] = useState([]); // Map of URL -> ID for deletion
  const [deletedImageIds, setDeletedImageIds] = useState(new Set()); // Track deleted image IDs to filter them out
  const [imagesChanged, setImagesChanged] = useState(false);
  const [textFieldsChanged, setTextFieldsChanged] = useState(false); // Track if text fields changed
  const [removeFlyerImage, setRemoveFlyerImage] = useState(false); // Track if flyer should be removed
  const [removeGalleryIds, setRemoveGalleryIds] = useState([]); // Track gallery image IDs to remove
  const [uploadingCover, setUploadingCover] = useState(false); // Loader for cover image upload
  const [uploadingGallery, setUploadingGallery] = useState(false); // Loader for gallery upload
  const [loadingMessage, setLoadingMessage] = useState(""); // Message for loading overlay
  const [showLoading, setShowLoading] = useState(false); // Control loading overlay visibility
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [selectedTicketType, setSelectedTicketType] = useState(null);
  const [savedTickets, setSavedTickets] = useState([]);
  const [createdTicketIds, setCreatedTicketIds] = useState([]); // Track created tickets
  const [eventId, setEventId] = useState(null);
  const [backendEventId, setBackendEventId] = useState(null); // Store backend's event ID
  const [venueId, setVenueId] = useState(null); // Store venue ID if it exists
  const [venueCreated, setVenueCreated] = useState(false); // Track if venue was created
  const [originalVenueData, setOriginalVenueData] = useState(null); // Store original venue data for change detection
  const [createdArtistIndices, setCreatedArtistIndices] = useState([]); // Track created artists
  const [currentEventType, setCurrentEventType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("Classic"); // Default template (using name)
  const today = new Date();
  const [startCalendarOpen, setStartCalendarOpen] = useState(false);
  const [endCalendarOpen, setEndCalendarOpen] = useState(false);
  const [startTimeOpen, setStartTimeOpen] = useState(false);
  const [endTimeOpen, setEndTimeOpen] = useState(false);
  const [originalDateTime, setOriginalDateTime] = useState({ start: null, end: null }); // Track original start/end for change detection
  const emptySponsor = {
    name: "",
    websiteUrl: "",
    logoUrl: "",
    isPrimary: false,
  };
  const [sponsors, setSponsors] = useState([emptySponsor]);
  const [originalSponsors, setOriginalSponsors] = useState([]);
  const [originalArtists, setOriginalArtists] = useState([]);
  const [sponsorUploadIndex, setSponsorUploadIndex] = useState(null);
  const [sponsorSaving, setSponsorSaving] = useState(false);
  const [isSponsored, setIsSponsored] = useState(false);
  const [originalIsSponsored, setOriginalIsSponsored] = useState(false);
  const [publishState, setPublishState] = useState("DRAFT");
  const [isPublished, setIsPublished] = useState(false);
  const eventCacheRef = useRef(null);
  const sponsorsLoadedRef = useRef(false);
  const artistsLoadedRef = useRef(false);
  const originalAdditionalRef = useRef(null);
  const currentAdditionalRef = useRef(null);

  const normalizeAdditionalFromState = () => ({
    tc: (termsAndConditions || "").trim(),
    advisory: { ...advisory },
    customAdvisories: [...customAdvisories],
    questions: [...customQuestions],
    organizerNote: (organizerNote || "").trim(),
  });

  const hourOptions = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const minuteOptions = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

  const formatDateValue = (value) => {
    if (!value) return "";
    try {
      return format(new Date(`${value}T00:00:00`), "dd MMM yyyy");
    } catch {
      return value;
    }
  };

  const parseTime = (value) => {
    if (!value) return { hour: "", minute: "00", ampm: "AM" };
    const [h, m = "00"] = value.split(":");
    const hourNum = Number(h) || 0;
    const ampm = hourNum >= 12 ? "PM" : "AM";
    const hour12 = hourNum % 12 === 0 ? 12 : hourNum % 12;
    return { hour: String(hour12).padStart(2, "0"), minute: String(m).padStart(2, "0"), ampm };
  };

  const buildTime = (hour12, minute, ampm) => {
    if (!hour12) return "";
    const base = Number(hour12) % 12;
    const h24 = (ampm === "PM" ? base + 12 : base === 12 ? 0 : base).toString().padStart(2, "0");
    return `${h24}:${minute || "00"}`;
  };

  const formatTimeDisplay = (value) => {
    if (!value) return "Pick a time";
    const { hour, minute, ampm } = parseTime(value);
    return `${hour}:${minute} ${ampm}`;
  };

  const TimePicker = ({ value, onChange, onClose }) => {
    const { hour, minute, ampm } = parseTime(value);
    const setPart = (h = hour, m = minute, ap = ampm, close = false) => {
      onChange(buildTime(h, m, ap));
      if (close) onClose?.();
    };

    const itemBase =
      "w-full text-left px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white transition";
    const itemActive = "bg-gradient-to-r from-[#2563eb]/70 to-[#e11d48]/70 text-white border-white/30 shadow";

    return (
      <div className="grid grid-cols-3 gap-3 p-3 bg-[#0b1224]/90 rounded-2xl border border-white/10 shadow-[0_15px_50px_rgba(0,0,0,0.55)] w-[320px]">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.08em] text-white/60">Hour</p>
          <div className="max-h-48 overflow-y-auto pr-1 space-y-2">
            {hourOptions.map((h) => (
              <button
                key={h}
                type="button"
                className={`${itemBase} ${h === hour ? itemActive : ""}`}
                onClick={() => setPart(h, minute, ampm, false)}
              >
                {h}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.08em] text-white/60">Minute</p>
          <div className="max-h-48 overflow-y-auto pr-1 space-y-2">
            {minuteOptions.map((m) => (
              <button
                key={m}
                type="button"
                className={`${itemBase} ${m === minute ? itemActive : ""}`}
                onClick={() => setPart(hour, m, ampm, true)}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.08em] text-white/60">AM/PM</p>
          <div className="space-y-2">
            {["AM", "PM"].map((ap) => (
              <button
                key={ap}
                type="button"
                className={`${itemBase} ${ap === ampm ? itemActive : ""}`}
                onClick={() => setPart(hour, minute, ap, true)}
              >
                {ap}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  const editId = searchParams.get('edit');
  const eventTypeParam = searchParams.get('type');
  const isEditMode = !!editId;

  // Form data
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [mainCategory, setMainCategory] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [venueName, setVenueName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("India");
  const [postalCode, setPostalCode] = useState("");
  const [venueContact, setVenueContact] = useState("");
  const [venueEmail, setVenueEmail] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedEventType, setSelectedEventType] = useState("one-time");
  const [originalDateInputs, setOriginalDateInputs] = useState({
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
  });
  const [ticketPrice, setTicketPrice] = useState("49");
  const [artists, setArtists] = useState([{ name: "", photo: "", image: "", instagram: "", spotify: "", gender: "PREFER_NOT_TO_SAY" }]);
  const initialAdvisoryState = {
    smokingAllowed: false,
    drinkingAllowed: false,
    petsAllowed: false,
    ageRestricted: false,
    camerasAllowed: false,
    outsideFoodAllowed: false,
    seatingProvided: false,
    wheelchairAccessible: false,
    liveMusic: false,
    parkingAvailable: false,
    reentryAllowed: false,
    onsitePayments: false,
    securityCheck: false,
    cloakroom: false,
  };

  const [advisory, setAdvisory] = useState(initialAdvisoryState);
  const [customAdvisories, setCustomAdvisories] = useState([]);
  const [newCustomAdvisory, setNewCustomAdvisory] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [advisoryDialogOpen, setAdvisoryDialogOpen] = useState(false);
  const [termsAndConditions, setTermsAndConditions] = useState("");
  const [customQuestions, setCustomQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [organizerNote, setOrganizerNote] = useState("");
  const [selectedEventTypeCategory, setSelectedEventTypeCategory] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [venueThemePulse, setVenueThemePulse] = useState(false);

  // Ensure backendEventId is set when editing (even if session flags are missing)
  useEffect(() => {
    if (isEditMode && editId && !backendEventId) {
      setBackendEventId(editId);
      sessionStorage.setItem('draftEventId', editId);
      sessionStorage.setItem('draftStarted', 'true');
    }
  }, [isEditMode, editId, backendEventId]);

  // Small pulse to emphasize manual entry section
  useEffect(() => {
    if (currentStep === 4) {
      setVenueThemePulse(true);
      const timer = setTimeout(() => setVenueThemePulse(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  // Neon event theme colors (toned-down)
  const pageTheme = {
    background:
      "radial-gradient(circle at 18% 20%, rgba(37,99,235,0.12), transparent 25%), radial-gradient(circle at 85% 0%, rgba(225,29,72,0.1), transparent 22%), #0b0f18",
    card: "rgba(255,255,255,0.04)",
    border: "rgba(255,255,255,0.08)",
    red: "#e11d48",
    blue: "#2563eb",
    glow: "0 20px 70px rgba(0,0,0,0.45)",
  };

  const fieldClass =
    "bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-0 focus-visible:border-[#2563eb]/60 transition-all duration-200";
  const cardBase =
    "border-white/10 bg-[#0f172a]/85 backdrop-blur-sm shadow-lg";
  const selectMenuClass =
    "bg-[#0f1624] text-white border border-white/10 shadow-xl rounded-lg";

  const ensureBackendEventId = async () => {
    if (backendEventId) return backendEventId;

    if (!eventTitle.trim() || !mainCategory || selectedCategories.length === 0) {
      toast.error("Add title, category, and subcategory before uploading images.");
      return null;
    }

    try {
      setIsSubmitting(true);
      setLoadingMessage("Creating draft event...");
      setShowLoading(true);

      const payload = {
        title: eventTitle,
        description: eventDescription,
        category: mainCategory,
        subCategory: selectedCategories[0] || "",
      };
      if (currentEventType) {
        payload.type = currentEventType;
      }

      const resp = await apiFetch('api/event/create-event', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const backendId = resp.data?.id || resp.data?._id || resp.id || resp._id;
      if (!backendId) {
        toast.error("Could not create draft event. Please try again.");
        return null;
      }
      setBackendEventId(backendId);
      sessionStorage.setItem('draftStarted', 'true');
      sessionStorage.setItem('draftEventId', backendId);
      toast.success("Draft created. You can upload images now.");
      return backendId;
    } catch (err) {
      console.error("Failed to create draft before upload:", err);
      toast.error(err.message || "Failed to create draft event.");
      return null;
    } finally {
      setIsSubmitting(false);
      setShowLoading(false);
    }
  };

  const categoryHierarchy = {
    Music: ["Bollywood", "Hip Hop", "Electronic", "Melodic", "Live Music", "Metal", "Rap", "Music House", "Techno", "K-pop", "Hollywood", "POP", "Punjabi", "Disco", "Rock", "Afrobeat", "Dance Hall", "Thumri", "Bolly Tech"],
    Workshop: ["Sports", "Arts", "Meeting", "Conference", "Seminar", "Yoga", "Cooking", "Dance", "Self Help", "Consultation", "Corporate Event", "Communication"]
  };

  // Load saved tickets and venue data when component mounts or when backendEventId changes
  useEffect(() => {
    if (backendEventId) {
      // Load tickets
      const savedTicketsData = localStorage.getItem(`event_${backendEventId}_tickets`);
      if (savedTicketsData) {
        try {
          const parsedTickets = JSON.parse(savedTicketsData);
          setSavedTickets(parsedTickets);
          
          // Extract ticket IDs that were already created in the backend
          const existingTicketIds = parsedTickets
            .filter(ticket => ticket.id)
            .map(ticket => ticket.id);
            
          if (existingTicketIds.length > 0) {
            setCreatedTicketIds(existingTicketIds);
          }
        } catch (error) {
          console.error("Error parsing saved tickets:", error);
          localStorage.removeItem(`event_${backendEventId}_tickets`);
        }
      }
      
      // Load venue data from localStorage if it exists
      const loadVenueData = async () => {
        try {
          const savedVenueId = localStorage.getItem(`event_${backendEventId}_venueId`);
          const savedVenueData = localStorage.getItem(`event_${backendEventId}_venueData`);
          
          if (savedVenueId && savedVenueData) {
            // Set the venue ID and mark as created first
            setVenueId(savedVenueId);
            setVenueCreated(true);
            
            // Parse and set the venue data
            const venueData = JSON.parse(savedVenueData);
            setVenueName(venueData.name || '');
            setCity(venueData.city || '');
            setState(venueData.state || '');
            setCountry(venueData.country || '');
            setPostalCode(venueData.postalCode || '');
            setVenueContact(venueData.contact || '');
            setVenueEmail(venueData.email || '');
            setFullAddress(venueData.fullAddress || '');
            
            console.log('✅ Loaded venue data from localStorage, venueId:', savedVenueId);
            
            // Force update the original venue data for change detection
            setOriginalVenueData(venueData);
          }
        } catch (error) {
          console.error('❌ Error loading venue data:', error);
          // Clear invalid data
          localStorage.removeItem(`event_${backendEventId}_venueId`);
          localStorage.removeItem(`event_${backendEventId}_venueData`);
        }
      };
      
      loadVenueData();
    }
  }, [backendEventId]);

  // Load event data if editing
  const flattenSponsor = (s, idx = 0) => {
    const nested = s?.sponsor || {};
    return {
      name: s?.name || nested.name || "",
      websiteUrl: s?.websiteUrl || s?.website || s?.link || nested.websiteUrl || nested.website || nested.link || "",
      logoUrl: s?.logoUrl || s?.logo || nested.logoUrl || nested.logo || "",
      isPrimary: typeof s?.isPrimary === "boolean" ? s.isPrimary : idx === 0,
    };
  };

  useEffect(() => {
    if (!editId) return;
    const stateEvent = location.state?.event;
    const eventToEdit = stateEvent || events.find((e) => e.id === editId);
    if (!eventToEdit) return;
    eventCacheRef.current = eventToEdit;

    const pickVenueName = (venueObj) => {
      if (!venueObj) return "";
      const raw = venueObj.name || venueObj.venueName || "";
      if (raw && raw.toLowerCase() !== "location tbd") return raw;
      const fromFull = venueObj.fullAddress ? venueObj.fullAddress.split(",")[0]?.trim() : "";
      return fromFull || raw;
    };

    const normalizeAdditional = (data) => {
      const tcData = data?.TC || data?.tc;
      const tcContent =
        typeof tcData === "string" ? tcData : tcData?.content ? tcData.content : "";

      const advisoryData = data?.advisory || {};
      const normalizedAdvisory = { ...initialAdvisoryState };
      Object.keys(normalizedAdvisory).forEach((key) => {
        if (advisoryData[key]) normalizedAdvisory[key] = true;
      });
      const customList = Array.isArray(advisoryData.customAdvisories) ? advisoryData.customAdvisories : [];

      const questionsData = Array.isArray(data?.questions) ? data.questions : [];
      const note = data?.organizerNote || "";

      return {
        tc: tcContent || "",
        advisory: normalizedAdvisory,
        customAdvisories: customList,
        questions: questionsData,
        organizerNote: note,
      };
    };

    const setAdditionalFromEvent = (data) => {
      const tcData = data?.TC || data?.tc;
      if (tcData) {
        if (typeof tcData === "string") {
          setTermsAndConditions(tcData);
        } else if (tcData?.content) {
          setTermsAndConditions(tcData.content);
        }
      } else {
        setTermsAndConditions("");
      }

      const advisoryData = data?.advisory || {};
      const normalizedAdvisory = { ...initialAdvisoryState };
      Object.keys(normalizedAdvisory).forEach((key) => {
        if (advisoryData[key]) normalizedAdvisory[key] = true;
      });
      setAdvisory(normalizedAdvisory);
      const customList = Array.isArray(advisoryData.customAdvisories) ? advisoryData.customAdvisories : [];
      setCustomAdvisories(customList);

      const questionsData = Array.isArray(data?.questions) ? data.questions : [];
      setCustomQuestions(questionsData);
      setOrganizerNote(data?.organizerNote || "");

      // Capture original additional info for change detection once
      if (!originalAdditionalRef.current) {
        originalAdditionalRef.current = normalizeAdditional(data || {});
      }

      // Keep current snapshot in sync for later comparisons
      currentAdditionalRef.current = normalizeAdditional(data || {});
    };

    const hydrateGallery = (images) => {
      if (!Array.isArray(images)) {
        setExistingGalleryUrls([]);
        setGalleryImages([]);
        setGalleryImageIds({});
        return;
      }

      const galleryImagesData = images.filter((img) => img.type === "EVENT_GALLERY");
      const validGalleryImages = galleryImagesData.filter((img) => !deletedImageIds.has(img.id));

      if (validGalleryImages.length > 0) {
        const imageUrls = validGalleryImages.map((img) => img.url);
        const imageIdMap = {};
        validGalleryImages.forEach((img) => {
          imageIdMap[img.url] = img.id;
        });
        setExistingGalleryUrls(imageUrls);
        setGalleryImages(imageUrls);
        setGalleryImageIds(imageIdMap);
      } else {
        setExistingGalleryUrls([]);
        setGalleryImages([]);
        setGalleryImageIds({});
      }
    };

    const start = eventToEdit.startDate ? new Date(eventToEdit.startDate) : null;
    const end = eventToEdit.endDate ? new Date(eventToEdit.endDate) : null;
    const toDateStr = (d) => (d ? d.toISOString().slice(0, 10) : "");
    const toTimeStr = (d) => {
      if (!d) return "";
      const iso = d.toISOString();
      return iso.slice(11, 16);
    };

    setBackendEventId(eventToEdit.id || eventToEdit._id || backendEventId);
    setEventTitle(eventToEdit.title || "");
    setEventDescription(eventToEdit.description || "");
    setMainCategory(eventToEdit.category || "");
    setSelectedCategories([eventToEdit.subCategory || eventToEdit.subcategory || ""]);
    setCoverImage(eventToEdit.flyerImage || eventToEdit.image || eventToEdit.flyer);
    hydrateGallery(eventToEdit.images);
    setAdditionalFromEvent(eventToEdit);
    const startDateStr = toDateStr(start);
    const startTimeStr = toTimeStr(start);
    const endDateStr = toDateStr(end);
    const endTimeStr = toTimeStr(end);
    setStartDate(startDateStr);
    setStartTime(startTimeStr);
    setEndDate(endDateStr);
    setEndTime(endTimeStr);
    const normalizedStatus = (eventToEdit.publishStatus || eventToEdit.status || "").toUpperCase();
    setPublishState(normalizedStatus === "PUBLISHED" || normalizedStatus === "ACTIVE" ? "PUBLISHED" : "DRAFT");
    // Track originals for change detection in Step 2
    setOriginalDateTime({
      start: start ? start.toISOString() : null,
      end: end ? end.toISOString() : null,
    });
    setOriginalDateInputs({
      startDate: startDateStr,
      startTime: startTimeStr,
      endDate: endDateStr,
      endTime: endTimeStr,
    });
    // Sponsors (Step 5)
    if (Array.isArray(eventToEdit.sponsors) && eventToEdit.sponsors.length > 0) {
      const normalizedSponsors = eventToEdit.sponsors.map((s, idx) => flattenSponsor(s, idx));
      const normalizedForCompare = normalizeSponsors(normalizedSponsors);
      setSponsors(normalizedSponsors);
      setOriginalSponsors(normalizedForCompare);
      setIsSponsored(normalizedForCompare.length > 0);
      setOriginalIsSponsored(normalizedForCompare.length > 0);
      sponsorsLoadedRef.current = true;
    } else {
      setSponsors([emptySponsor]);
      setOriginalSponsors([]);
      setIsSponsored(Boolean(eventToEdit.isSponsored));
      setOriginalIsSponsored(Boolean(eventToEdit.isSponsored));
    }
    setTicketPrice(
      eventToEdit.price
        ? String(eventToEdit.price).replace(/[^0-9.]/g, "")
        : ticketPrice
    );

    // Load template if available (map old IDs to new names)
    if (eventToEdit.template) {
      const templateName = mapTemplateId(eventToEdit.template);
      setSelectedTemplate(templateName);
    }

    // Parse location from venues
    const firstVenue = Array.isArray(eventToEdit.venues) && eventToEdit.venues.length > 0
      ? eventToEdit.venues[0]
      : null;
    if (firstVenue) {
      setVenueId(firstVenue.id || firstVenue._id || venueId);
      setVenueName(pickVenueName(firstVenue));
      setCity(firstVenue.city || "");
      setState(firstVenue.state || "");
      setCountry(eventToEdit.country || "India");
      setPostalCode(eventToEdit.postalCode || "");
      setVenueContact(eventToEdit.venueContact || "");
      setVenueEmail(eventToEdit.venueEmail || "");
      setFullAddress(firstVenue.fullAddress || firstVenue.address || "");
    } else if (eventToEdit.location) {
      const locationParts = eventToEdit.location.split(", ");
      if (locationParts.length > 0) setVenueName(locationParts[0]);
      if (locationParts.length > 1) setCity(locationParts[1]);
      if (locationParts.length > 2) setState(locationParts[2]);
    }

    const tcData = eventToEdit.TC || eventToEdit.tc;
    if (tcData) {
      if (typeof tcData === "string") {
        setTermsAndConditions(tcData);
      } else if (tcData?.content) {
        setTermsAndConditions(tcData.content);
      }
    }

    const advisoryData = eventToEdit.advisory || {};
    const normalizedAdvisory = { ...initialAdvisoryState };
    Object.keys(normalizedAdvisory).forEach((key) => {
      if (advisoryData[key]) normalizedAdvisory[key] = true;
    });
    setAdvisory(normalizedAdvisory);
    const customList = Array.isArray(advisoryData.customAdvisories) ? advisoryData.customAdvisories : [];
    setCustomAdvisories(customList);

    const questionsData = Array.isArray(eventToEdit.questions) ? eventToEdit.questions : [];
    setCustomQuestions(questionsData);
    setOrganizerNote(eventToEdit.organizerNote || "");

    if (eventToEdit.type) {
      setSelectedEventTypeCategory(eventToEdit.type);
      setCurrentEventType(eventToEdit.type);
    }

    const normalizedArtists = Array.isArray(eventToEdit.artists)
      ? eventToEdit.artists.map((a) => ({
          name: a.name || "",
          photo: a.photo || a.image || "",
          instagram: a.instagram || a.instagramLink || "",
          spotify: a.spotify || a.spotifyLink || "",
          gender: a.gender || "PREFER_NOT_TO_SAY",
        }))
      : [];

    setArtists(
      normalizedArtists.length
        ? normalizedArtists
        : [{ name: "", photo: "", instagram: "", spotify: "", gender: "PREFER_NOT_TO_SAY" }]
    );
    if (normalizedArtists.length) {
      setCreatedArtistIndices(normalizedArtists.map((_, idx) => idx));
      artistsLoadedRef.current = true;
      setOriginalArtists(normalizedArtists);
    } else {
      setOriginalArtists([]);
    }

    // If images or description/venue were not present in the cached event, fetch full event details (by slug if available)
    if (((!eventToEdit.images || eventToEdit.images.length === 0) || !eventToEdit.description || !eventToEdit.venues?.length) && (eventToEdit.slug || eventToEdit.id || eventToEdit._id)) {
      (async () => {
        try {
          const fetchUrl = eventToEdit.slug
            ? `api/event/slug/${eventToEdit.slug}`
            : `api/event/${eventToEdit.id || eventToEdit._id}`;
          const response = await apiFetch(fetchUrl, { method: "GET" });
          const eventData = response.data?.event || response.data || response.event || response;
          eventCacheRef.current = eventData;

          if (eventData?.flyerImage) {
            setCoverImage(eventData.flyerImage);
          }
          if (eventData?.description) {
            setEventDescription(eventData.description);
          }
          if (!sponsorsLoadedRef.current && Array.isArray(eventData?.sponsors) && eventData.sponsors.length > 0) {
            const normalizedSponsors = eventData.sponsors.map((s, idx) => flattenSponsor(s, idx));
            const normalizedForCompare = normalizeSponsors(normalizedSponsors);
            setSponsors(normalizedSponsors);
            setOriginalSponsors(normalizedForCompare);
            setIsSponsored(normalizedForCompare.length > 0);
            setOriginalIsSponsored(normalizedForCompare.length > 0);
            sponsorsLoadedRef.current = true;
          }
          if (Array.isArray(eventData?.venues) && eventData.venues.length > 0) {
            const v = eventData.venues[0];
            setVenueId(v.id || v._id || venueId);
            setVenueName(pickVenueName(v));
            setCity(v.city || city);
            setState(v.state || state);
            setCountry(v.country || country);
            setPostalCode(v.postalCode || postalCode);
            setVenueContact(v.contact || venueContact);
            setVenueEmail(v.email || venueEmail);
            setFullAddress(v.fullAddress || fullAddress);
          }
          if (eventData?.id || eventData?._id) {
            setBackendEventId(eventData.id || eventData._id);
          }
          hydrateGallery(eventData?.images);
          setAdditionalFromEvent(eventData);
        } catch (err) {
          console.error("Failed to fetch full event details for gallery hydration:", err);
        }
      })();
    }
  }, [editId, events, location.state, backendEventId, ticketPrice]);

  // Fetch sponsors from backend in edit mode when entering Step 5 (or when ID changes)
  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        if (!isEditMode || !backendEventId || currentStep !== 5) return;
        if (sponsorsLoadedRef.current) return;
        const hasSponsorsLoaded = sponsors.some((s) => s.name || s.logoUrl || s.websiteUrl);
        if (hasSponsorsLoaded) {
          sponsorsLoadedRef.current = true;
          return;
        }

        // Try cache first
        const cached = eventCacheRef.current;
        const sponsorDataCached = Array.isArray(cached?.sponsors) ? cached.sponsors : [];
        if (sponsorDataCached.length) {
          const normalizedCached = sponsorDataCached.map((s, idx) => flattenSponsor(s, idx));
          setSponsors(normalizedCached);
          setOriginalSponsors(normalizedCached);
          setIsSponsored(true);
          setOriginalIsSponsored(true);
          sponsorsLoadedRef.current = true;
          return;
        }

        const response = await apiFetch(`api/event/${backendEventId}`, { method: "GET" });
        const eventData = response.data?.event || response.data || response.event || response;
        eventCacheRef.current = eventData;
        const sponsorData = Array.isArray(eventData?.sponsors) ? eventData.sponsors : [];
        const normalizedSponsors = sponsorData.map((s, idx) => flattenSponsor(s, idx));

        setSponsors(normalizedSponsors.length ? normalizedSponsors : [emptySponsor]);
        setOriginalSponsors(normalizedSponsors);
        setIsSponsored(normalizedSponsors.length > 0 || Boolean(eventData?.isSponsored));
        setOriginalIsSponsored(normalizedSponsors.length > 0 || Boolean(eventData?.isSponsored));
        sponsorsLoadedRef.current = true;
      } catch (err) {
        console.error("Failed to fetch sponsors for edit mode:", err);
      }
    };

    fetchSponsors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendEventId, isEditMode, currentStep]);

  // Fetch artists from backend in edit mode when entering Step 6
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        if (!isEditMode || !backendEventId || currentStep !== 6) return;
        if (artistsLoadedRef.current) return;
        const hasArtistsLoaded = artists.some((a) => a.name || a.photo || a.instagram || a.spotify);
        if (hasArtistsLoaded) return;

        // Try cache first
        const cached = eventCacheRef.current;
        const artistDataCached = Array.isArray(cached?.artists) ? cached.artists : [];
        if (artistDataCached.length) {
          const normalizedCached = artistDataCached.map((a) => ({
            name: a.name || "",
            photo: a.photo || a.image || "",
            instagram: a.instagram || a.instagramLink || "",
            spotify: a.spotify || a.spotifyLink || "",
            gender: a.gender || "PREFER_NOT_TO_SAY",
          }));
          setArtists(normalizedCached);
          setCreatedArtistIndices(normalizedCached.map((_, idx) => idx));
          setOriginalArtists(normalizedCached);
          artistsLoadedRef.current = true;
          return;
        }

        const response = await apiFetch(`api/event/${backendEventId}`, { method: "GET" });
        const eventData = response.data?.event || response.data || response.event || response;
        eventCacheRef.current = eventData;
        const artistData = Array.isArray(eventData?.artists) ? eventData.artists : [];
        const normalized = artistData.map((a) => ({
          name: a.name || "",
          photo: a.photo || a.image || "",
          instagram: a.instagram || a.instagramLink || "",
          spotify: a.spotify || a.spotifyLink || "",
          gender: a.gender || "PREFER_NOT_TO_SAY",
        }));

        setArtists(
          normalized.length
            ? normalized
            : [{ name: "", photo: "", instagram: "", spotify: "", gender: "PREFER_NOT_TO_SAY" }]
        );
        if (normalized.length) {
          setCreatedArtistIndices(normalized.map((_, idx) => idx));
          setOriginalArtists(normalized);
        }
        artistsLoadedRef.current = true;
      } catch (err) {
        console.error("Failed to fetch artists for edit mode:", err);
      }
    };

    fetchArtists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendEventId, isEditMode, currentStep]);

  // Set event type category from URL params
  useEffect(() => {
    if (eventTypeParam) {
      const eventTypeEnum = eventTypeMapping[eventTypeParam];
      if (eventTypeEnum) {
        setSelectedEventTypeCategory(eventTypeEnum); // Display backend enum value
        setCurrentEventType(eventTypeEnum); // Store backend enum value
      }
    }
  }, [eventTypeParam]);

  // Load existing images when entering Step 2
  useEffect(() => {
    const loadExistingImages = async () => {
      // Always fetch fresh data from backend when entering Step 2
      if (currentStep === 2 && backendEventId) {
        try {
          console.log("📥 ========================================");
          console.log("📥 Fetching FRESH images from backend");
          console.log("📥 Event ID:", backendEventId);
          console.log("📥 Current Step:", currentStep);
          
          // Clear existing state first to prevent showing stale data
          console.log("🧹 Clearing existing image state...");
          setGalleryImages([]);
          setGalleryImageIds({});
          setExistingGalleryUrls([]);
          
          // Fetch event details to get images (with timestamp to prevent caching)
          const response = await apiFetch(`api/event/${backendEventId}?t=${Date.now()}`, {
            method: "GET",
          });
          
          const eventData = response.data || response;
          console.log("📋 Full event data received:", eventData);
          
          // Load cover image (or clear if none exists)
          if (eventData.flyerImage) {
            setCoverImage(eventData.flyerImage);
            console.log("✅ Loaded cover image:", eventData.flyerImage);
          } else {
            setCoverImage(null);
            console.log("ℹ️ No cover image in backend - cleared");
          }
          
          // Load gallery images from 'images' array
          if (eventData.images && Array.isArray(eventData.images)) {
            console.log("📋 Total images in response:", eventData.images.length);
            
            const galleryImagesData = eventData.images.filter(img => img.type === 'EVENT_GALLERY');
            console.log("📋 Gallery images after type filter:", galleryImagesData.length);
            
            // Filter out images that were deleted in this session
            const validGalleryImages = galleryImagesData.filter(img => {
              const isDeleted = deletedImageIds.has(img.id);
              if (isDeleted) {
                console.log("🚫 Filtering out deleted image:", img.id, img.url);
              }
              return !isDeleted;
            });
            
            console.log("📋 Valid gallery images after deletion filter:", validGalleryImages.length);
            
            if (validGalleryImages.length > 0) {
              const imageUrls = validGalleryImages.map(img => img.url);
              const imageIdMap = {};
              validGalleryImages.forEach(img => {
                imageIdMap[img.url] = img.id; // Store ID for deletion
              });
              
              // Update UI with ONLY valid images from backend
              setExistingGalleryUrls(imageUrls);
              setGalleryImages(imageUrls);
              setGalleryImageIds(imageIdMap);
              
              console.log(`✅ Loaded ${imageUrls.length} valid gallery images`);
              console.log("📋 Image URLs:", imageUrls);
              console.log("📋 Image IDs:", imageIdMap);
            } else {
              // No valid gallery images in backend
              setExistingGalleryUrls([]);
              setGalleryImages([]);
              setGalleryImageIds({});
              console.log("ℹ️ No valid gallery images - cleared all");
            }
          } else {
            // No images array in response
            setExistingGalleryUrls([]);
            setGalleryImages([]);
            setGalleryImageIds({});
            console.log("ℹ️ No images array in backend response - cleared all");
          }
          
          console.log("📥 ========================================");
          
        } catch (error) {
          console.error("❌ Failed to load existing images:", error);
          // Clear state on error to prevent showing stale data
          setGalleryImages([]);
          setGalleryImageIds({});
          setExistingGalleryUrls([]);
        }
      }
    };
    
    loadExistingImages();
    // Note: deletedImageIds is not in deps to avoid re-fetching on every deletion
    // The filter logic inside will use the current deletedImageIds state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, backendEventId]);

  // Initialize event ID on component mount (only for new events)
  useEffect(() => {
    if (!isEditMode) {
      // Check if we're starting a fresh event creation
      const urlParams = new URLSearchParams(window.location.search);
      const isNewEvent = !urlParams.get('draft'); // No draft parameter means fresh start
      
      if (isNewEvent) {
        // Clear any old draft from previous session
        sessionStorage.removeItem('draftEventId');
        sessionStorage.removeItem('draftStarted');
        sessionStorage.removeItem('deletedImageIds'); // Clear deleted images list for new event
        
        // Reset all tracking states
        setCreatedTicketIds([]);
        setVenueCreated(false);
        setCreatedArtistIndices([]);
        setDeletedImageIds(new Set()); // Clear deleted images
        
        console.log("🗑️ Cleared old draft data - starting fresh");
      } else {
        // Restore deleted image IDs from sessionStorage for existing draft
        const storedDeletedIds = sessionStorage.getItem('deletedImageIds');
        if (storedDeletedIds) {
          try {
            const deletedIds = JSON.parse(storedDeletedIds);
            setDeletedImageIds(new Set(deletedIds));
            console.log("📥 Restored deleted image IDs:", deletedIds);
          } catch (error) {
            console.error("Failed to parse deleted image IDs:", error);
          }
        }
      }
      
      if (!eventId) {
        const newEventId = generateEventId();
        setEventId(newEventId);
      }
      
      // Only restore backendEventId if we have an active draft session
      const storedBackendId = sessionStorage.getItem('draftEventId');
      const draftStarted = sessionStorage.getItem('draftStarted');
      
      if (storedBackendId && draftStarted && !backendEventId && !isNewEvent) {
        setBackendEventId(storedBackendId);
        console.log("📥 Restored backend event ID from active draft:", storedBackendId);
      }
    }
  }, [isEditMode]);

  // Store backendEventId in sessionStorage whenever it changes
  useEffect(() => {
    if (backendEventId && !isEditMode) {
      sessionStorage.setItem('draftEventId', backendEventId);
      sessionStorage.setItem('draftStarted', 'true');
      console.log("💾 Saved backend event ID to session:", backendEventId);
    }
  }, [backendEventId, isEditMode]);

  // Build a readable full address string from a suggestion
  // Manual-only venue entry (no external suggestions or maps)

  const steps = [
    { number: 1, title: "Event Details" },
    { number: 2, title: "Date & Time" },
    { number: 3, title: "Tickets" },
    { number: 4, title: "Venue & Location" },
    { number: 5, title: "Sponsor" },
    { number: 6, title: "Add Artist" },
    { number: 7, title: "Additional Info" },
    { number: 8, title: "Review & Publish" },
  ];

  const progress = (currentStep / steps.length) * 100;
  const basicDetailsFilled = Boolean(eventTitle.trim() && mainCategory && selectedCategories.length > 0);

  const nextStep = async () => {
    // Validate required fields for each step
    if (currentStep === 1) {
      if (!eventTitle.trim()) {
        toast.error("Event title is required");
        return;
      }
      if (!mainCategory) {
        toast.error("Main category is required");
        return;
      }
      if (selectedCategories.length === 0) {
        toast.error("Subcategory is required");
        return;
      }

      if (!coverImage && !coverImageFile) {
        toast.error("Cover image is required");
        return;
      }

      // Call API for Step 1 - Create or Update Event with basic details
      try {
        setIsSubmitting(true);
        setLoadingMessage("Saving event details...");
        setShowLoading(true);
        
        let response;
        
        // Treat edit mode as existing draft even if session flags are missing
        const hasExistingDraft =
          backendEventId &&
          (sessionStorage.getItem('draftStarted') || isEditMode);
        
        if (hasExistingDraft) {
          // UPDATE existing event (user went back to step 1)
          console.log("🔄 Updating existing draft event:", backendEventId);
          const hasAnyChanges = textFieldsChanged || imagesChanged;
          console.log("📝 Text fields changed?", textFieldsChanged, "🖼️ Images changed?", imagesChanged);
          
          try {
            if (!hasAnyChanges) {
              console.log("ℹ️ No field or image changes detected in Step 1");
              toast.info("No changes to update");
              setCurrentStep(currentStep + 1);
              return;
            }

            // Upload media first (backend /update-event is JSON-only)
            if (imagesChanged) {
              if (coverImageFile) {
                try {
                  const coverResp = await uploadFlyerImage(backendEventId, coverImageFile);
                  const coverData = coverResp.data || coverResp;
                  const imageUrl = coverData.flyerImage || coverData.url;
                  if (imageUrl) setCoverImage(imageUrl);
                } catch (err) {
                  console.error("❌ Failed to upload flyer image during edit:", err);
                  toast.error(err?.message || "Failed to upload cover image");
                  return;
                }
              }

              if (galleryImageFiles.length > 0) {
                try {
                  const galleryResp = await uploadGalleryImages(backendEventId, galleryImageFiles);
                  const respData = galleryResp.data || galleryResp;
                  const galleryImagesData = Array.isArray(respData.images)
                    ? respData.images
                    : Array.isArray(respData.galleryImages)
                      ? respData.galleryImages
                      : [];

                  const newImageUrls = galleryImagesData
                    .filter((img) => (img.type ? img.type === "EVENT_GALLERY" : true))
                    .map((img) => img.url || img);

                  const newImageIdMap = {};
                  galleryImagesData.forEach((img) => {
                    const url = img.url || img;
                    const id = img.id || img._id;
                    if (url && id) newImageIdMap[url] = id;
                  });

                  const updatedGallery = [...existingGalleryUrls, ...newImageUrls];
                  setExistingGalleryUrls(updatedGallery);
                  setGalleryImages(updatedGallery);
                  setGalleryImageIds((prev) => ({ ...prev, ...newImageIdMap }));
                } catch (err) {
                  console.error("❌ Failed to upload gallery images during edit:", err);
                  toast.error(err?.message || "Failed to upload gallery images");
                  return;
                }
              }

              // Clear pending files after uploads
              setImagesChanged(false);
              setGalleryImageFiles([]);
              setCoverImageFile(null);
            }

            // If only images changed, advance without JSON update
            if (!textFieldsChanged) {
              console.log("ℹ️ Only image changes detected; skipping update-event payload");
              setCurrentStep(currentStep + 1);
              return;
            }

            const eventData = {
              eventTitle,
              description: eventDescription,
              mainCategory,
              subcategory: selectedCategories[0] || "",
              ...(currentEventType ? { eventType: currentEventType } : {}),
            };

            console.log("📤 Sending JSON update payload via updateEventStep1", eventData);

            response = await updateEventStep1(backendEventId, eventData);
            
            toast.success("Event details updated successfully!");
            
            // Reset change flags after successful update
            setTextFieldsChanged(false);
            setImagesChanged(false);
            setGalleryImageFiles([]);
            setCoverImageFile(null);
          } catch (updateError) {
            console.error("⚠️ Update failed:", updateError);
            toast.error(updateError?.message || "Failed to update event. Please try again.");
            return;
          }
        } else {
          // CREATE new event (first time) — send only allowed fields, then persist images to backend
          console.log("✨ Creating new event (first time) with temp uploads");
          
          const eventData = {
            eventTitle,
            description: eventDescription,
            mainCategory,
            subcategory: selectedCategories[0] || "",
            eventType: currentEventType || "",
          };

          response = await createEventStep1(eventData);
          
          toast.success("Event details saved successfully!");
          
          // Store the backend event ID for future updates
          let backendId = response.data?.id || response.data?._id || response.id || response._id;
          if (backendId) {
            setBackendEventId(backendId);
            console.log("💾 Backend Event ID stored:", backendId);
          }
          
          // After event exists, persist cover image using the already-uploaded temp URL (no re-upload)
          if (backendId && tempCoverUpload?.url) {
            try {
              setShowLoading(true);
              setLoadingMessage("Saving cover image...");
              const coverResp = await persistFlyerUrl(backendId, {
                imageUrl: tempCoverUpload.url,
                publicId: tempCoverUpload.publicId,
              });
              const coverData = coverResp.data || coverResp;
              const imageUrl = coverData.flyerImage || coverData.url || tempCoverUpload.url;
              if (imageUrl) {
                setCoverImage(imageUrl);
                toast.success("Cover image saved to event.");
              }
            } catch (err) {
              console.error("Failed to persist cover image after create:", err);
              toast.error(err?.message || "Cover image upload failed after create.");
            } finally {
              setShowLoading(false);
              setLoadingMessage("");
            }
          } else if (backendId && coverImageFile) {
            // Fallback: if no temp upload exists, upload directly
            try {
              setShowLoading(true);
              setLoadingMessage("Saving cover image...");
              const coverResp = await uploadFlyerImage(backendId, coverImageFile);
              const coverData = coverResp.data || coverResp;
              const imageUrl = coverData.flyerImage || coverData.url;
              if (imageUrl) {
                setCoverImage(imageUrl);
                toast.success("Cover image saved to event.");
              }
            } catch (err) {
              console.error("Failed to persist cover image after create:", err);
              toast.error(err?.message || "Cover image upload failed after create.");
            } finally {
              setShowLoading(false);
              setLoadingMessage("");
            }
          }
          
          // After event exists, persist gallery images using already-uploaded temp URLs (no re-upload)
          const tempGalleryUrls = tempGalleryUploads.map((g) => g.url).filter(Boolean);
          if (backendId && tempGalleryUrls.length > 0) {
            try {
              setShowLoading(true);
              setLoadingMessage("Saving gallery images...");
              const galleryResp = await persistGalleryUrls(backendId, tempGalleryUrls);
              const respData = galleryResp.data || galleryResp;
              
              const galleryImagesData =
                (respData.images && Array.isArray(respData.images) && respData.images) ||
                (respData.galleryImages && Array.isArray(respData.galleryImages) && respData.galleryImages) ||
                [];
              
              const newImageUrls = galleryImagesData.map(img => img.url || img);
              const newImageIdMap = {};
              galleryImagesData.forEach(img => { if (img.id && (img.url || img)) newImageIdMap[img.url || img] = img.id; });
              
              const updatedGalleryImages = [...galleryImages, ...newImageUrls];
              const updatedImageIdMap = { ...galleryImageIds, ...newImageIdMap };
              
              setExistingGalleryUrls(updatedGalleryImages);
              setGalleryImages(updatedGalleryImages);
              setGalleryImageIds(updatedImageIdMap);
              setGalleryImageFiles([]); // clear pending files
              
              toast.success(`${newImageUrls.length} gallery image(s) saved to event.`);
            } catch (err) {
              console.error("Failed to persist gallery images after create:", err);
              toast.error(err?.message || "Gallery upload failed after create.");
            } finally {
              setShowLoading(false);
              setLoadingMessage("");
            }
          } else if (backendId && galleryImageFiles.length > 0) {
            // Fallback: upload if no temp uploads are available
            try {
              setShowLoading(true);
              setLoadingMessage("Saving gallery images...");
              const galleryResp = await uploadGalleryImages(backendId, galleryImageFiles);
              const respData = galleryResp.data || galleryResp;
              
              if (respData.images && Array.isArray(respData.images)) {
                const galleryImagesData = respData.images.filter(img => img.type === 'EVENT_GALLERY');
                const newImageUrls = galleryImagesData.map(img => img.url);
                const newImageIdMap = {};
                galleryImagesData.forEach(img => { newImageIdMap[img.url] = img.id; });
                
                const updatedGalleryImages = [...galleryImages, ...newImageUrls];
                const updatedImageIdMap = { ...galleryImageIds, ...newImageIdMap };
                
                setExistingGalleryUrls(updatedGalleryImages);
                setGalleryImages(updatedGalleryImages);
                setGalleryImageIds(updatedImageIdMap);
                setGalleryImageFiles([]); // clear pending files
                
                toast.success(`${newImageUrls.length} gallery image(s) saved to event.`);
              } else if (respData.galleryImages && Array.isArray(respData.galleryImages)) {
                const newImageUrls = respData.galleryImages.map(img => img.url || img);
                const newImageIdMap = {};
                respData.galleryImages.forEach(img => { if (img.id && img.url) newImageIdMap[img.url] = img.id; });
                
                const updatedGalleryImages = [...galleryImages, ...newImageUrls];
                const updatedImageIdMap = { ...galleryImageIds, ...newImageIdMap };
                
                setExistingGalleryUrls(updatedGalleryImages);
                setGalleryImages(updatedGalleryImages);
                setGalleryImageIds(updatedImageIdMap);
                setGalleryImageFiles([]);
                
                toast.success(`${newImageUrls.length} gallery image(s) saved to event.`);
              }
            } catch (err) {
              console.error("Failed to persist gallery images after create:", err);
              toast.error(err?.message || "Gallery upload failed after create.");
            } finally {
              setShowLoading(false);
              setLoadingMessage("");
            }
          }
          
          // Reset temp uploads after creation
          setTempCoverUpload(null);
          setTempGalleryUploads([]);
          setImagesChanged(false); // Reset flag after creation
        }
        
        console.log("API Response:", response);
        
        // Move to next step after successful API call
        setCurrentStep(currentStep + 1);
      } catch (error) {
        console.error("Error saving event:", error);
        const errorMessage = error.message || "Failed to save event details. Please try again.";
        toast.error(errorMessage);
        
        // If authentication error, redirect to login
        if (errorMessage.includes("Authentication") || errorMessage.includes("Unauthorized")) {
          setTimeout(() => {
            navigate("/auth");
          }, 2000);
        }
        return;
      } finally {
        setIsSubmitting(false);
        setShowLoading(false);
      }
      return; // Exit early to prevent default next step behavior
    }

    if (currentStep === 2) {
      if (!startDate) {
        toast.error("Starting date is required");
        return;
      }
      if (!startTime) {
        toast.error("Starting time is required");
        return;
      }
      if (!endDate) {
        toast.error("Ending date is required");
        return;
      }
      if (!endTime) {
        toast.error("Ending time is required");
        return;
      }
      if (endDate < startDate) {
        toast.error("Ending date must be after starting date");
        return;
      }

      const hasInputChanges =
        startDate !== originalDateInputs.startDate ||
        startTime !== originalDateInputs.startTime ||
        endDate !== originalDateInputs.endDate ||
        endTime !== originalDateInputs.endTime;

      if (isEditMode && backendEventId && !hasInputChanges) {
        toast.info("No changes to update");
        setCurrentStep(currentStep + 1);
        return;
      }

      // Combine date and time into ISO format for comparison and update
      const startDateTime = new Date(`${startDate}T${startTime}`).toISOString();
      const endDateTime = new Date(`${endDate}T${endTime}`).toISOString();

      // Call API for Step 3 - Update Date & Time
      try {
        setIsSubmitting(true);
        setLoadingMessage("Saving date & time...");
        setShowLoading(true);
        
        // Check if we have backend event ID
        if (!backendEventId) {
          toast.error("Event ID not found. Please go back to Step 1.");
          setIsSubmitting(false);
          setShowLoading(false);
          return;
        }
        
        const updateData = {
          startDate: startDateTime,
          endDate: endDateTime,
        };

        const response = await updateEventStep2(backendEventId, updateData);
        
        toast.success("Date & time updated successfully!");
        console.log("Step 3 API Response:", response);
        setOriginalDateTime({ start: startDateTime, end: endDateTime });
        setOriginalDateInputs({ startDate, startTime, endDate, endTime });
        
        // Move to next step after successful API call
        setCurrentStep(currentStep + 1);
      } catch (error) {
        console.error("Error updating event:", error);
        const errorMessage = error.message || "Failed to update date & time. Please try again.";
        toast.error(errorMessage);
        
        // If authentication error, redirect to login
        if (errorMessage.includes("Authentication") || errorMessage.includes("Unauthorized")) {
          setTimeout(() => {
            navigate("/auth");
          }, 2000);
        }
        return;
      } finally {
        setIsSubmitting(false);
        setShowLoading(false);
      }
      return; // Exit early to prevent default next step behavior
    }

    if (currentStep === 3) {
      // Just validate that at least one ticket exists
      if (savedTickets.length === 0) {
        toast.error("Please add at least one ticket type");
        return;
      }
      
      // Check if we have backend event ID
      if (!backendEventId) {
        toast.error("Event ID not found. Please go back to Step 1.");
        return;
      }
      
      // Move to next step - tickets are already created when added
      setCurrentStep(currentStep + 1);
      return; // Exit early to prevent default next step behavior
    }

    if (currentStep === 4) {
      if (!venueName.trim()) {
        toast.error("Venue name is required");
        return;
      }
      if (!city.trim()) {
        toast.error("City is required");
        return;
      }
      if (!state.trim()) {
        toast.error("State is required");
        return;
      }
      if (!venueContact.trim()) {
        toast.error("Contact number is required");
        return;
      }
      if (!venueEmail.trim()) {
        toast.error("Email is required");
        return;
      }
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(venueEmail)) {
        toast.error("Please enter a valid email address");
        return;
      }

      // Prepare venue data
      const fallbackAddressParts = [venueName, city, state, postalCode, country || "India"].filter(Boolean);
      const venueData = {
        name: venueName,
        contact: venueContact,
        email: venueEmail,
        fullAddress: fullAddress || fallbackAddressParts.join(", "),
        city: city,
        state: state,
        country: country || "India",
        postalCode: postalCode,
        latitude: 0,
        longitude: 0,
        googlePlaceId: "", // Optional - not used in manual mode
        eventId: backendEventId, // Use backend event ID
        isPrimary: true,
      };

      // Check if venue data has changed
      const hasVenueChanged = !originalVenueData || 
        venueData.name !== originalVenueData.name ||
        venueData.contact !== originalVenueData.contact ||
        venueData.email !== originalVenueData.email ||
        venueData.fullAddress !== originalVenueData.fullAddress ||
        venueData.city !== originalVenueData.city ||
        venueData.state !== originalVenueData.state ||
        venueData.country !== originalVenueData.country ||
        venueData.postalCode !== originalVenueData.postalCode ||
        venueData.latitude !== originalVenueData.latitude ||
        venueData.longitude !== originalVenueData.longitude;

      if (!hasVenueChanged) {
        console.log("ℹ️ No changes detected in venue details");
        toast.info("No changes to update");
        setCurrentStep(currentStep + 1);
        return;
      }

      // Call API for Step 5 - Create or Update Venue
      try {
        setIsSubmitting(true);
        setLoadingMessage(venueCreated ? "Updating venue details..." : "Saving venue details...");
        setShowLoading(true);
        
        // Check if we have backend event ID
        if (!backendEventId) {
          toast.error("Event ID not found. Please go back to Step 1.");
          setIsSubmitting(false);
          setShowLoading(false);
          return;
        }
        
        let response;
        
        // If we have a venueId, always try to update first
        if (venueId) {
          console.log("🔄 Attempting to update existing venue with ID:", venueId);
          try {
            // First try to update the existing venue
            response = await updateVenue(venueId, venueData);
            console.log('✅ Successfully updated venue:', response);
            
            // Update local state and storage
            setVenueCreated(true);
            
            // Make sure we have the latest venue ID (in case it changed)
            const updatedVenueId = response?.id || response?._id || 
                                 response?.data?.id || response?.data?._id ||
                                 response?.data?.venue?.id || response?.data?.venue?._id || venueId;
            
            // Update the venue data with the ID for future updates
            const updatedVenueData = { ...venueData, id: updatedVenueId };
            
            // Save to state and localStorage
            setVenueId(updatedVenueId);
            localStorage.setItem(`event_${backendEventId}_venueId`, updatedVenueId);
            localStorage.setItem(`event_${backendEventId}_venueData`, JSON.stringify(updatedVenueData));
            
            console.log('💾 Saved updated venue data:', { id: updatedVenueId });
            toast.success("Venue updated successfully!");
            
            // Update the response with the ID for the rest of the function
            response.id = updatedVenueId;
          } catch (error) {
            console.error("❌ Error updating venue:", error);
            
            // If the update fails, we'll handle it based on the error type
            if (error.message.includes('404')) {
              console.log("Venue not found, will create a new one...");
              
              // If we have a venueId but the update failed with 404, clear the ID and try creating a new one
              setVenueId(null);
              setVenueCreated(false);
              localStorage.removeItem(`event_${backendEventId}_venueId`);
              
              // Fall through to create a new venue
            } else if (error.message.includes('401') || error.message.includes('403')) {
              // Authentication/authorization error - don't try to create a new one
              throw new Error('You do not have permission to update this venue. Please check your login status.');
            } else {
              // For other errors, show the error and stop
              throw error;
            }
          }
        }
        
        // If we don't have a venueId or the update failed with 404, create a new venue
        if (!venueId) {
          console.log("🏢 Creating new venue for event:", backendEventId);
          try {
            response = await createVenue(venueData);
            
            // Extract the venue ID from the response
            // The ID could be in response.id, response._id, response.data.id, or response.data._id
            const newVenueId = response?.id || response?._id || 
                             response?.data?.id || response?.data?._id ||
                             response?.data?.venue?.id || response?.data?.venue?._id;
            
            console.log('🔍 Extracted venue ID from response:', { newVenueId, response });
            
            if (!newVenueId) {
              console.error('❌ No venue ID found in response:', response);
              throw new Error('No venue ID returned from server in the expected format');
            }
            
            // Save the new venue ID and data
            setVenueId(newVenueId);
            setVenueCreated(true);
            localStorage.setItem(`event_${backendEventId}_venueId`, newVenueId);
            
            // Update the venue data with the ID for future updates
            const updatedVenueData = { ...venueData, id: newVenueId };
            localStorage.setItem(`event_${backendEventId}_venueData`, JSON.stringify(updatedVenueData));
            
            console.log('✅ Created new venue with ID:', newVenueId);
            toast.success("Venue created successfully!");
            
            // Update the response with the ID for the rest of the function
            response.id = newVenueId;
          } catch (createError) {
            console.error("❌ Error creating venue:", createError);
            throw new Error(createError.message || 'Failed to create venue');
          }
        }
        
        // Move to next step after successful API call
        setCurrentStep(currentStep + 1);
      } catch (error) {
        console.error("Error creating venue:", error);
        const errorMessage = error.message || "Failed to save venue details. Please try again.";
        toast.error(errorMessage);
        
        // If authentication error, redirect to login
        if (errorMessage.includes("Authentication") || errorMessage.includes("Unauthorized")) {
          setTimeout(() => {
            navigate("/auth");
          }, 2000);
        }
        return;
      } finally {
        setIsSubmitting(false);
        setShowLoading(false);
      }
      return; // Exit early to prevent default next step behavior
    }

    if (currentStep === 5) {
      const cleanedSponsors = normalizeSponsors(sponsors);
      const hasChanges = sponsorsChanged(cleanedSponsors);

      // In edit mode, if sponsors are loaded and nothing changed (including toggle), skip API
      if (isEditMode && sponsorsLoadedRef.current && isSponsored === originalIsSponsored && !hasChanges) {
        toast.info("No changes to update");
        setCurrentStep(currentStep + 1);
        return;
      }

      // If toggle is off, clear sponsors only if previously set, otherwise skip
      if (!isSponsored) {
        if (!hasChanges) {
          setCurrentStep(currentStep + 1);
          return;
        }
        try {
          setSponsorSaving(true);
          setLoadingMessage("Saving sponsor details...");
          setShowLoading(true);

          if (!backendEventId) {
            toast.error("Event ID not found. Please go back to Step 1.");
            return;
          }

          const payload = { sponsors: [] };
          const response = await updateEventStep6(backendEventId, payload);
          console.log("Step 5 (Sponsor - cleared) API Response:", response);
          setOriginalSponsors([]);
          setOriginalIsSponsored(false);
          setSponsors([emptySponsor]);
          toast.success("Sponsor details saved");
          setCurrentStep(currentStep + 1);
        } catch (error) {
          console.error("Error saving sponsors:", error);
          toast.error(error.message || "Failed to save sponsor details. Please try again.");
          return;
        } finally {
          setSponsorSaving(false);
          setShowLoading(false);
          setLoadingMessage("");
        }
        return;
      }

      // Toggle is on
      if (cleanedSponsors.length === 0) {
        toast.error("Add at least one sponsor with name to continue.");
        return;
      }

      const missingNames = cleanedSponsors.some((s) => !s.name);
      if (missingNames) {
        toast.error("Sponsor name is required for each sponsor entry.");
        return;
      }

      if (!hasChanges) {
        toast.info("No changes to update");
        setCurrentStep(currentStep + 1);
        return;
      }

      try {
        setSponsorSaving(true);
        setLoadingMessage("Saving sponsor details...");
        setShowLoading(true);

        if (!backendEventId) {
          toast.error("Event ID not found. Please go back to Step 1.");
          setSponsorSaving(false);
          setShowLoading(false);
          setLoadingMessage("");
          return;
        }

        const payload = {
          sponsors: cleanedSponsors,
        };

        const response = await updateEventStep6(backendEventId, payload);
        console.log("Step 5 (Sponsor) API Response:", response);
        setOriginalSponsors(cleanedSponsors);
        setOriginalIsSponsored(true);
        toast.success("Sponsor details saved");
        setCurrentStep(currentStep + 1);
      } catch (error) {
        console.error("Error saving sponsors:", error);
        toast.error(error.message || "Failed to save sponsor details. Please try again.");
        return;
      } finally {
        setSponsorSaving(false);
        setShowLoading(false);
        setLoadingMessage("");
      }
      return;
    }

    if (currentStep === 6) {
      // Validate that all artists with names have Instagram
      for (let i = 0; i < artists.length; i++) {
        const artist = artists[i];
        if (artist.name.trim() && !(artist.instagram || '').trim()) {
          toast.error(`Instagram is required for Artist ${i + 1}`);
          return;
        }
      }

      const normalizedCurrentArtists = normalizeArtists(artists);
      const hasArtistChanges = artistsChanged(normalizedCurrentArtists);

      // Call API for Step 6 - Create Artists (only new ones)
      try {
        setIsSubmitting(true);
        setLoadingMessage("Adding artists...");
        setShowLoading(true);
        
        // Check if we have backend event ID
        if (!backendEventId) {
          toast.error("Event ID not found. Please go back to Step 1.");
          setIsSubmitting(false);
          setShowLoading(false);
          return;
        }
        
        // Filter out empty artists
        const validArtists = artists
          .filter(artist => artist.name.trim() !== "")
          .map(artist => ({
            ...artist,
            image: artist.photo || artist.image || "",
            eventId: backendEventId,
          }));
        
        if (validArtists.length === 0) {
          // No artists to create, just move to next step
          setIsSubmitting(false);
          setShowLoading(false);
          setCurrentStep(currentStep + 1);
          return;
        }
        
        const artistResponses = [];
        
        for (let i = 0; i < validArtists.length; i++) {
          const artist = validArtists[i];
          
          // Only create artists that haven't been created before
          if (!createdArtistIndices.includes(i)) {
            console.log(`🎤 Creating artist ${i + 1}:`, artist);
            
            const artistPayload = {
              ...artist,
              image: artist.image || artist.photo || null,
              instagramLink: artist.instagram || artist.instagramLink || null,  // Map instagram to instagramLink
              spotifyLink: artist.spotify || artist.spotifyLink || null,     // Also fix spotify for consistency
              eventId: backendEventId,
            };
            
            // Remove the old field names to avoid confusion
            delete artistPayload.instagram;
            delete artistPayload.spotify;
            
            const response = await createArtist(artistPayload);
            
            artistResponses.push(response);
            
            // Mark this artist as created
            setCreatedArtistIndices(prev => [...prev, i]);
          } else {
            console.log(`⏭️ Skipping artist ${i + 1} (already created)`);
          }
        }
        
        // Persist artists to event record (including updated images/links)
        const persistPayload = validArtists.map((artist) => ({
          name: artist.name,
          gender: artist.gender,
          image: artist.image || artist.photo || null,
          instagramLink: artist.instagram || artist.instagramLink || null,
          spotifyLink: artist.spotify || artist.spotifyLink || null,
        }));

        try {
          await updateEventStep6(backendEventId, { artists: persistPayload });
        } catch (err) {
          console.error("Failed to persist artists on updateEventStep6:", err);
        }

        console.log("Step 6 API Response:", artistResponses);
        
        // Move to next step after successful API call
        setCurrentStep(currentStep + 1);
      } catch (error) {
        console.error("Error creating artists:", error);
        const errorMessage = error.message || "Failed to add artists. Please try again.";
        toast.error(errorMessage);
        
        // If authentication error, redirect to login
        if (errorMessage.includes("Authentication") || errorMessage.includes("Unauthorized")) {
          setTimeout(() => {
            navigate("/auth");
          }, 2000);
        }
      } finally {
        setIsSubmitting(false);
        setShowLoading(false);
      }
      return; // Exit early to prevent default next step behavior
    }

    if (currentStep === 7) {
      // Persist Additional Info before moving to Review
      const currentNormalized = normalizeAdditionalFromState();
      if (
        isEditMode &&
        originalAdditionalRef.current &&
        JSON.stringify(currentNormalized) === JSON.stringify(originalAdditionalRef.current)
      ) {
        toast.info("No changes to update");
        setCurrentStep(currentStep + 1);
        return;
      }
      try {
        setIsSubmitting(true);
        setLoadingMessage("Saving additional info...");
        setShowLoading(true);

        if (!backendEventId) {
          toast.error("Event ID not found. Please complete previous steps.");
          setIsSubmitting(false);
          setShowLoading(false);
          return;
        }

        const tcData = termsAndConditions
          ? {
              content: termsAndConditions,
              lastUpdated: new Date().toISOString(),
            }
          : null;

        const advisoryData = {};
        Object.keys(advisory).forEach((key) => {
          if (advisory[key] && key !== "other") {
            advisoryData[key] = true;
          }
        });
        if (customAdvisories.length > 0) {
          advisoryData.customAdvisories = customAdvisories;
        }
        const advisoryJson = Object.keys(advisoryData).length > 0 ? advisoryData : null;

        const questionsJson = customQuestions.length > 0 ? customQuestions : null;

        const updateData = {
          TC: tcData,
          advisory: advisoryJson,
          questions: questionsJson,
          organizerNote: organizerNote,
          publishStatus: publishState || "DRAFT",
        };

        await updateEventStep6(backendEventId, updateData);
        // Refresh original snapshot to avoid re-saving unchanged data on subsequent clicks
        originalAdditionalRef.current = normalizeAdditionalFromState();
        currentAdditionalRef.current = originalAdditionalRef.current;
        toast.success("Additional info saved");
        setCurrentStep(currentStep + 1);
      } catch (error) {
        console.error("Error saving additional info:", error);
        toast.error(error.message || "Failed to save additional info. Please try again.");
        return;
      } finally {
        setIsSubmitting(false);
        setShowLoading(false);
      }
      return;
    }

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCoverImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      // Immediate Cloudinary upload (no event needed) to speed up UX
      const temp = await uploadTempImage(file, "events/drafts/flyer");
      setTempCoverUpload(temp);
      setCoverImage(temp.url);
      setCoverImageFile(file); // keep original file to send in create call if needed
      setImagesChanged(true);
      setRemoveFlyerImage(false);
      toast.success("Cover image uploaded to cloud.");
    } catch (error) {
      console.error("Failed to upload cover image:", error);
      toast.error(error.message || "Failed to upload cover image.");
      setCoverImage(null);
      setTempCoverUpload(null);
    } finally {
      setUploadingCover(false);
    }
  };

  const handleRemoveCoverImage = async () => {
    // If editing existing event with backend ID and has existing cover image
    if (backendEventId && coverImage && typeof coverImage === 'string' && !coverImage.startsWith('data:')) {
      try {
        setLoadingMessage("Deleting cover image...");
        setShowLoading(true);
        
        console.log("🗑️ Deleting flyer image from backend immediately...");
        await deleteFlyerImage(backendEventId);
        
        console.log("✅ Flyer image deleted from backend successfully!");
        
        // Remove from UI immediately after successful backend deletion
        setCoverImage(null);
        setCoverImageFile(null);
        setRemoveFlyerImage(true);
        setImagesChanged(true);
        
        toast.success("Cover image deleted successfully!");
        console.log("✅ Cover image removed from UI and backend");
        
      } catch (error) {
        console.error("Failed to delete flyer image:", error);
        toast.error("Failed to delete image from server");
        return; // Don't remove from UI if backend deletion failed
      } finally {
        setShowLoading(false);
      }
    } else {
      // For local images (not yet uploaded), just remove from UI
      console.log("🗑️ Removing local cover image from UI");
      
      setCoverImage(null);
      setCoverImageFile(null);
      setRemoveFlyerImage(true);
      setImagesChanged(true);
      
      console.log("✅ Local cover image removed from UI");
    }
  };

  const handleGalleryImagesChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check file types
    const validFiles = [];
    const invalidFiles = [];

    for (const file of files) {
      if (!file.type.match('image.*')) {
        invalidFiles.push(file.name);
        continue;
      }
      validFiles.push(file);
    }

    if (invalidFiles.length > 0) {
      toast.error(`Invalid files (${invalidFiles.join(', ')}) - Only images are allowed`);
      if (validFiles.length === 0) return;
    }

    // Check total count (max 10 gallery images)
    const currentCount = galleryImages.length;
    if (currentCount + validFiles.length > 10) {
      toast.error(`Maximum 10 gallery images allowed. You already have ${currentCount} image(s).`);
      return;
    }

    try {
      setUploadingGallery(true);

      // Upload all gallery files to Cloudinary drafts folder
      const uploads = [];
      for (const file of validFiles) {
        const temp = await uploadTempImage(file, "events/drafts/gallery");
        uploads.push({ ...temp, file });
      }

      const newUrls = uploads.map(u => u.url);
      const updatedGalleryImages = [...galleryImages, ...newUrls];

      setTempGalleryUploads(prev => [...prev, ...uploads]);
      setGalleryImages(updatedGalleryImages);
      setGalleryImageFiles(prev => [...prev, ...validFiles]);
      setImagesChanged(true);

      toast.success(`${validFiles.length} gallery image(s) uploaded to cloud.`);
    } catch (error) {
      console.error("Failed to upload gallery images:", error);
      toast.error(error.message || "Failed to upload gallery images.");
    } finally {
      // Reset the file input to allow re-uploading the same file
      if (e.target) {
        e.target.value = '';
      }
      setUploadingGallery(false);
    }
  };

// ... (rest of the code remains the same)
  const removeGalleryImage = async (index) => {
    const imageToRemove = galleryImages[index];
    
    console.log("🔍 Attempting to remove gallery image at index:", index);
    console.log("   Image URL:", imageToRemove);
    console.log("   Backend event ID:", backendEventId);
    console.log("   All gallery image IDs:", galleryImageIds);
    
    // Check if this image has an ID in our map (means it's from backend)
    const imageId = galleryImageIds[imageToRemove];
    
    if (imageId && backendEventId) {
      try {
        setLoadingMessage("Deleting gallery image...");
        setShowLoading(true);
        
        console.log("🗑️ Deleting gallery image from backend...");
        console.log("   Image ID:", imageId);
        console.log("   DELETE URL:", `/api/event/${backendEventId}/images/${imageId}`);
        
        // Call DELETE API using new deleteGalleryImage function
        await deleteGalleryImage(backendEventId, imageId);
        
        console.log("✅ Gallery image deleted from backend successfully!");
        
        // Mark this image as deleted so it never shows again
        setDeletedImageIds(prev => {
          const newSet = new Set(prev);
          newSet.add(imageId);
          // Persist to sessionStorage
          sessionStorage.setItem('deletedImageIds', JSON.stringify([...newSet]));
          console.log("🔒 Added to deleted images list:", imageId);
          return newSet;
        });
        
      } catch (error) {
        console.error("❌ Failed to delete gallery image from backend:", error);
        
        // Check if error is 404 (image already deleted) or other error
        const errorMessage = error.message || "";
        if (errorMessage.includes("404") || errorMessage.includes("not found")) {
          console.warn("⚠️ Image already deleted from backend, marking as deleted");
          
          // Still mark as deleted to prevent showing again
          setDeletedImageIds(prev => {
            const newSet = new Set(prev);
            newSet.add(imageId);
            sessionStorage.setItem('deletedImageIds', JSON.stringify([...newSet]));
            return newSet;
          });
          
          toast.info("Image already deleted, removing from display");
        } else {
          toast.error("Failed to delete image from server");
          setShowLoading(false);
          return; // Don't remove from UI if it's a real error
        }
      }
      
      // Remove from UI after deletion attempt (successful or 404)
      setGalleryImages((prev) => prev.filter((_, i) => i !== index));
      
      // Remove from tracking
      setExistingGalleryUrls(prev => prev.filter(url => url !== imageToRemove));
      
      // Remove from ID map
      setGalleryImageIds(prev => {
        const newMap = { ...prev };
        delete newMap[imageToRemove];
        return newMap;
      });
      
      setImagesChanged(true);
      
      console.log("✅ Gallery image removed from UI and marked as permanently deleted");
      setShowLoading(false);
      
    } else {
      // For local images (not yet uploaded), just remove from UI
      console.log("🗑️ Removing local gallery image from UI");
      
      setGalleryImages((prev) => prev.filter((_, i) => i !== index));
      
      // Remove from files if it's a new upload (no ID)
      const newFileIndex = index - Object.keys(galleryImageIds).length;
      if (newFileIndex >= 0) {
        setGalleryImageFiles((prev) => prev.filter((_, i) => i !== newFileIndex));
      }
      
      setImagesChanged(true);
      console.log("✅ Local gallery image removed from UI");
    }
  };

  // Helper function to extract image ID from URL
  const extractImageId = (imageUrl) => {
    try {
      console.log("🔍 Extracting image ID from URL:", imageUrl);
      
      // Different URL patterns:
      // Cloudinary: https://res.cloudinary.com/.../v1234567/abc123.jpg
      // S3: https://bucket.s3.amazonaws.com/folder/abc123.jpg
      // Direct: https://server.com/uploads/abc123.jpg
      
      // Method 1: Try to get the last segment (most common)
      const urlParts = imageUrl.split('/');
      const lastSegment = urlParts[urlParts.length - 1];
      
      // Remove query parameters if any
      const cleanSegment = lastSegment.split('?')[0];
      
      // Remove file extension
      const imageId = cleanSegment.split('.')[0];
      
      console.log("   Last segment:", lastSegment);
      console.log("   Clean segment:", cleanSegment);
      console.log("   Extracted ID:", imageId);
      
      // Validate that we got something meaningful
      if (imageId && imageId.length > 3) {
        return imageId;
      }
      
      // Method 2: If ID is too short, try second-to-last segment (for some URL structures)
      if (urlParts.length > 2) {
        const secondLast = urlParts[urlParts.length - 2];
        console.log("   Trying second-to-last segment:", secondLast);
        
        // Check if it looks like an ID (alphanumeric, no special chars)
        if (/^[a-zA-Z0-9_-]+$/.test(secondLast) && secondLast.length > 5) {
          console.log("   Using second-to-last as ID:", secondLast);
          return secondLast;
        }
      }
      
      console.warn("⚠️ Could not extract valid image ID from URL");
      return null;
    } catch (error) {
      console.error("❌ Failed to extract image ID:", error);
      return null;
    }
  };

  const handleArtistPhotoChange = async (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!backendEventId) {
      toast.error("Please complete Step 1 first to create the event");
      return;
    }

    try {
      setShowLoading(true);
      setLoadingMessage("Uploading artist photo...");

      const res = await uploadArtistImage(backendEventId, file);
      const imageUrl = res?.data?.image || res?.data?.url || res?.url;

      if (!imageUrl) {
        throw new Error("Image uploaded but URL was not returned. Please try again.");
      }

      const newArtists = [...artists];
      newArtists[index].photo = imageUrl;
      newArtists[index].image = imageUrl;
      setArtists(newArtists);

      toast.success("Artist photo uploaded successfully!");
    } catch (err) {
      console.error("Failed to upload artist photo:", err);
      toast.error(err?.message || "Failed to upload artist photo. Please try again.");
    } finally {
      setShowLoading(false);
      setLoadingMessage("");
    }
  };

  const openTicketModal = (type) => {
    setSelectedTicketType(type);
    setTicketModalOpen(true);
  };

  const normalizeSponsors = (list) => {
    const mapped = list
      .map((s) => ({
        name: (s.name || "").trim(),
        logoUrl: (s.logoUrl || s.logo || "").trim(),
        websiteUrl: (s.websiteUrl || s.website || "").trim(),
        isPrimary: Boolean(s.isPrimary),
      }))
      .map((s) => ({
        name: s.name,
        ...(s.logoUrl ? { logoUrl: s.logoUrl } : {}),
        ...(s.websiteUrl ? { websiteUrl: s.websiteUrl } : {}),
        isPrimary: s.isPrimary,
      }))
      .filter((s) => s.name || s.logoUrl || s.websiteUrl);

    if (mapped.length === 1) {
      mapped[0].isPrimary = true;
    } else if (mapped.length > 1 && !mapped.some((s) => s.isPrimary)) {
      mapped[0].isPrimary = true;
    }

    return mapped;
  };

  const normalizeArtists = (list) =>
    (list || [])
      .map((a) => {
        const image = (a.photo || a.image || "").trim();
        return {
          name: (a.name || "").trim(),
          image,
          photo: image,
          instagramLink: (a.instagram || a.instagramLink || "").trim(),
          spotifyLink: (a.spotify || a.spotifyLink || "").trim(),
          gender: a.gender || "PREFER_NOT_TO_SAY",
        };
      })
      .filter((a) => a.name || a.instagramLink || a.spotifyLink || a.image);

  const sponsorsChanged = (normalizedList = null) => {
    const filtered = normalizedList ?? normalizeSponsors(sponsors);
    return JSON.stringify(filtered) !== JSON.stringify(originalSponsors);
  };

  const artistsChanged = (normalizedList = null) => {
    const filtered = normalizedList ?? normalizeArtists(artists);
    return JSON.stringify(filtered) !== JSON.stringify(originalArtists);
  };

  const setPrimarySponsor = (index) => {
    setSponsors((prev) =>
      prev.map((s, i) => ({
        ...s,
        isPrimary: i === index,
      }))
    );
  };

  const handleSponsorChange = (index, key, value) => {
    setSponsors((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  const addSponsorRow = () => {
    setSponsors((prev) => [...prev, { ...emptySponsor }]);
  };

  const removeSponsorRow = (index) => {
    setSponsors((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const handleSponsorLogoChange = async (index, file) => {
    if (!file) return;
    try {
      setSponsorUploadIndex(index);
      setShowLoading(true);
      setLoadingMessage("Uploading sponsor logo...");
      const upload = await uploadTempImage(file, "events/drafts/sponsors");
      setSponsors((prev) => {
        const next = [...prev];
        const logoUrl = upload.url || upload.secure_url || "";
        next[index] = { ...next[index], logoUrl, logo: logoUrl };
        return next;
      });
      toast.success("Logo uploaded");
    } catch (err) {
      console.error("Failed to upload sponsor logo:", err);
      toast.error(err?.message || "Failed to upload sponsor logo");
    } finally {
      setSponsorUploadIndex(null);
      setShowLoading(false);
      setLoadingMessage("");
    }
  };

  const handleSaveTicket = async (ticketData) => {
    try {
      setLoadingMessage("Creating ticket...");
      setShowLoading(true);
      
      // Add event ID to ticket data
      const ticketWithEvent = {
        ...ticketData,
        eventId: backendEventId
      };
      
      // Create ticket in backend
      const response = await createTicket(ticketWithEvent);
      
      // Add the ticket with its ID to savedTickets
      const newTicket = {
        ...ticketData,
        id: response.data?.id || response.id // Handle different response formats
      };
      
      const updatedTickets = [...savedTickets, newTicket];
      setSavedTickets(updatedTickets);
      
      // Update createdTicketIds
      setCreatedTicketIds(prev => [...prev, newTicket.id]);
      
      // Save to localStorage
      localStorage.setItem(`event_${backendEventId}_tickets`, JSON.stringify(updatedTickets));
      
      toast.success("Ticket created successfully!");
    } catch (error) {
      console.error("Error creating ticket:", error);
      toast.error(error.message || "Failed to create ticket. Please try again.");
    } finally {
      setShowLoading(false);
    }
  };

  const handleDeleteTicket = async (ticket, index) => {
    try {
      // If the ticket has an ID (already saved to backend), delete it from the backend
      if (ticket.id) {
        setLoadingMessage("Deleting ticket...");
        setShowLoading(true);
        
        await deleteTicket(ticket.id);
        
        // Remove the ticket ID from createdTicketIds if it exists
        const ticketIndex = createdTicketIds.indexOf(ticket.id);
        if (ticketIndex !== -1) {
          const updatedTicketIds = [...createdTicketIds];
          updatedTicketIds.splice(ticketIndex, 1);
          setCreatedTicketIds(updatedTicketIds);
        }
        
        // Remove from localStorage
        const updatedTickets = savedTickets.filter((_, i) => i !== index);
        localStorage.setItem(`event_${backendEventId}_tickets`, JSON.stringify(updatedTickets));
        
        // Update UI
        setSavedTickets(updatedTickets);
        
        toast.success("Ticket deleted successfully!");
      } else {
        // If ticket wasn't saved to backend yet, just remove from local state
        const updatedTickets = savedTickets.filter((_, i) => i !== index);
        setSavedTickets(updatedTickets);
        localStorage.setItem(`event_${backendEventId}_tickets`, JSON.stringify(updatedTickets));
      }
      
    } catch (error) {
      console.error("Error deleting ticket:", error);
      toast.error(error.message || "Failed to delete ticket. Please try again.");
    } finally {
      setShowLoading(false);
    }
  };

  const handleSubmit = async (targetState) => {
    const effectiveState = targetState || publishState;
    const isDraft = effectiveState !== "PUBLISHED";
    setPublishState(effectiveState);
    // Validation
    if (!eventTitle || !mainCategory || selectedCategories.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // Call API for Step 7 - Update Additional Information
    try {
      setIsSubmitting(true);
      setLoadingMessage(isDraft ? "Saving draft..." : "Publishing event...");
      setShowLoading(true);
      
      // Check if we have backend event ID
      if (!backendEventId) {
        toast.error("Event ID not found. Please complete all previous steps.");
        setIsSubmitting(false);
        setShowLoading(false);
        return;
      }
      
      // Prepare Terms & Conditions as JSON
      const tcData = termsAndConditions ? {
        content: termsAndConditions,
        lastUpdated: new Date().toISOString()
      } : null;
      
      // Prepare Advisory as JSON (only include selected items)
      const advisoryData = {};
      Object.keys(advisory).forEach(key => {
        if (advisory[key] && key !== 'other') {
          advisoryData[key] = true;
        }
      });
      // Add custom advisories if present
      if (customAdvisories.length > 0) {
        advisoryData.customAdvisories = customAdvisories;
      }
      const advisoryJson = Object.keys(advisoryData).length > 0 ? advisoryData : null;
      
      // Prepare Questions as JSON
      const questionsJson = customQuestions.length > 0 ? customQuestions : null;
      
      const updateData = {
        TC: tcData,
        advisory: advisoryJson,
        questions: questionsJson,
        organizerNote: organizerNote,
        publishStatus: isDraft ? "DRAFT" : "PUBLISHED",
      };

      const response = await updateEventStep6(backendEventId, updateData);
      
      console.log("Step 7 API Response:", response);
      
      // Success handling (no explicit status payloads)
      toast.success(isDraft ? "Event saved as draft!" : "Event updated successfully!");
      
      // Save complete event to localStorage as fallback (until backend my-events endpoint is ready)
      try {
        const STORAGE_KEY = "mapMyParty_events";
        const existingEvents = localStorage.getItem(STORAGE_KEY);
        const eventsArray = existingEvents ? JSON.parse(existingEvents) : [];
        
        // Create complete event object
        const completeEvent = {
          id: backendEventId,
          eventId: eventId,
          eventTitle: eventTitle,
          title: eventTitle, // Alias for compatibility
          eventType: currentEventType, // Use backend enum value (GUESTLIST, EXCLUSIVE, NON_EXCLUSIVE) or undefined
          mainCategory: mainCategory,
          category: mainCategory, // Alias for compatibility
          subcategory: selectedCategories[0] || "",
          description: eventDescription,
          publishStatus: isDraft ? "DRAFT" : "PUBLISHED",
          startDate: startDate,
          endDate: endDate,
          date: startDate, // Alias for compatibility
          flyerImage: coverImage,
          flyerImageUrl: coverImage,
          image: coverImage, // Alias for compatibility
          galleryImages: galleryImages,
          ticketsSold: 0,
          totalTickets: savedTickets.reduce((sum, t) => sum + (t.available || 0), 0),
          revenue: 0,
          attendees: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        // Check if event already exists (update) or add new
        const existingIndex = eventsArray.findIndex(e => e.id === backendEventId || e.eventId === eventId);
        if (existingIndex >= 0) {
          eventsArray[existingIndex] = completeEvent;
          console.log("📝 Updated existing event in localStorage");
        } else {
          eventsArray.unshift(completeEvent); // Add to beginning
          console.log("➕ Added new event to localStorage");
        }
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(eventsArray));
        console.log("💾 Event saved to localStorage for fallback");
      } catch (storageError) {
        console.warn("⚠️ Could not save to localStorage:", storageError);
        // Don't block the flow if localStorage fails
      }
      
      // Navigate to dashboard after successful submission
      navigate("/organizer/dashboard-v2");
    } catch (error) {
      console.error("Error updating event (Step 6):", error);
      const errorMessage = error.message || "Failed to save additional information. Please try again.";
      toast.error(errorMessage);
      
      // If authentication error, redirect to login
      if (errorMessage.includes("Authentication") || errorMessage.includes("Unauthorized")) {
        setTimeout(() => {
          navigate("/auth");
        }, 2000);
      }
    } finally {
      setIsSubmitting(false);
      setShowLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col relative text-white"
      style={{ background: pageTheme.background }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-20 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      </div>

      <LoadingOverlay show={showLoading} message={loadingMessage} />
      <Header isAuthenticated userRole="organizer" />

      <main className="flex-1 py-12 relative">
        <div className="container max-w-6xl relative space-y-6">
          {/* Back Button and Clear Draft */}
          <div className="flex items-center justify-between mb-6">
            <div className="absolute -left-4 -top-4 flex items-center gap-2">
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10 px-2"
                onClick={() => navigate(-1)}
              >
                <ChevronLeft className="w-5 h-5" />
                 <span className="text-sm text-gray-300">Back</span>
              </Button>
              {/* <span className="text-sm text-gray-300">Back</span> */}
            </div>
            
            {backendEventId && !isEditMode && currentStep === 1 && (
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                onClick={() => {
                  if (confirm("Are you sure you want to start a new event? This will discard the current draft.")) {
                    sessionStorage.removeItem('draftEventId');
                    sessionStorage.removeItem('draftStarted');
                    sessionStorage.removeItem('deletedImageIds');
                    setBackendEventId(null);
                    setCreatedTicketIds([]);
                    setVenueCreated(false);
                    setCreatedArtistIndices([]);
                    setDeletedImageIds(new Set());
                    toast.success("Draft cleared. Starting new event.");
                    window.location.reload();
                  }
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Clear Draft & Start New
              </Button>
            )}
          </div>

          {/* Progress Header */}
          <Card
            className={`mb-6 -mt-2 border ${cardBase}`}
            style={{ borderColor: pageTheme.border, boxShadow: pageTheme.glow }}
          >
            <CardContent className="p-6 space-y-5 rounded-xl">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-blue-200/80">
                    Event Builder
                  </p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-3xl font-bold text-white drop-shadow-sm">
                      {isEditMode ? "Update Event" : "Create New Event"}
                    </h1>
                    {selectedEventTypeCategory && (
                      <Badge className="bg-white/8 text-white border-white/15">
                        {selectedEventTypeCategory}
                      </Badge>
                    )}
                    
                    {backendEventId && !isEditMode && (
                      <Badge className="bg-[#e11d48]/15 text-white border-[#e11d48]/30">
                        📝 Draft
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 border border-white/10">
                  <div className="w-2 h-2 rounded-full bg-[#e11d48] animate-pulse" />
                  <span className="text-xs text-gray-200">
                    Step {currentStep} of {steps.length} • {steps[currentStep - 1].title}
                  </span>
                </div>
              </div>

              {/* Circle+bar tracker */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {steps.map((step, idx) => {
                    const isCurrent = step.number === currentStep;
                    const isDone = step.number < currentStep;
                    const barActive =
                      idx < currentStep - 1
                        ? "bg-gradient-to-r from-[#2563eb] to-[#e11d48]"
                        : idx === currentStep - 1
                        ? "bg-[#2563eb]/60"
                        : "bg-white/12";

                    return (
                      <div key={step.number} className="flex-1 min-w-[110px] flex items-center gap-2">
                        <div className="flex flex-col items-center gap-2 w-full">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                              isDone
                                ? "bg-[#16a34a] border-[#16a34a] text-white shadow-lg shadow-[#16a34a]/30"
                                : isCurrent
                                ? "border-[#2563eb] bg-[#2563eb]/15 text-white"
                                : "border-white/15 bg-white/5 text-gray-300"
                            }`}
                          >
                            {isDone ? <Check className="w-4 h-4" /> : step.number}
                          </div>
                          <p className="text-xs font-semibold text-white/85 text-center leading-tight">
                            {step.title}
                          </p>
                        </div>
                        {idx !== steps.length - 1 && (
                          <div className={`flex-1 h-1 rounded-full ${barActive}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step Content */}
          <Card
            className={`border ${cardBase}`}
            style={{ borderColor: pageTheme.border, boxShadow: pageTheme.glow }}
          >
            <CardHeader
              className="border-b border-white/10 bg-transparent"
              style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
            >
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <span className="inline-flex w-8 h-8 items-center justify-center rounded-full bg-white/10 text-sm font-semibold">
                  {currentStep}
                </span>
                {steps[currentStep - 1].title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-gray-100">
              {/* Step 1: Event Details + Images */}
              {currentStep === 1 && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="eventTitle">Event Title *</Label>
                      <Input
                        id="eventTitle"
                        placeholder="Enter event title"
                        value={eventTitle}
                        className={fieldClass}
                        onChange={(e) => {
                          setEventTitle(e.target.value);
                          if (backendEventId) setTextFieldsChanged(true);
                        }}
                      />
                    </div>

                    <div>
                      <Label>Main Category *</Label>
                      <Select value={mainCategory} onValueChange={(value) => {
                        setMainCategory(value);
                        setSelectedCategories([]);
                        if (backendEventId) setTextFieldsChanged(true);
                      }}>
                        <SelectTrigger className={`${fieldClass} h-12`}>
                          <SelectValue placeholder="Select main category" />
                        </SelectTrigger>
                        <SelectContent className={selectMenuClass}>
                          <SelectItem value="Music">Music</SelectItem>
                          <SelectItem value="Workshop">Workshop</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {mainCategory && (
                      <div>
                        <Label>Subcategory *</Label>
                        <Select value={selectedCategories[0] || ""} onValueChange={(value) => {
                          setSelectedCategories([value]);
                          if (backendEventId) setTextFieldsChanged(true);
                        }}>
                          <SelectTrigger className={`${fieldClass} h-12`}>
                            <SelectValue placeholder="Select subcategory" />
                          </SelectTrigger>
                          <SelectContent className={selectMenuClass}>
                            {categoryHierarchy[mainCategory]?.map((subcat) => (
                              <SelectItem key={subcat} value={subcat}>
                                {subcat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div>
                      <Label htmlFor="description">Event Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your event..."
                        rows={4}
                        value={eventDescription}
                        className={`${fieldClass} min-h-[130px]`}
                        onChange={(e) => {
                          setEventDescription(e.target.value);
                          if (backendEventId) setTextFieldsChanged(true);
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground mb-2">
                      Add a striking cover and gallery to make your event pop.
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cover-image">Cover Image *</Label>
                      <div className="space-y-3">
                        <Input 
                          id="cover-image" 
                          type="file" 
                          accept="image/*" 
                          onChange={handleCoverImageChange}
                          className={`${fieldClass} cursor-pointer`}
                          disabled={uploadingCover || !basicDetailsFilled}
                        />
                        <p className="text-xs text-muted-foreground">
                          Recommended size: 1920x1080px.
                        </p>
                        {!basicDetailsFilled && (
                          <p className="text-xs text-amber-400">
                            Fill title, category, and subcategory to enable image uploads.
                          </p>
                        )}
                        
                        {/* Loading indicator for cover upload */}
                        {uploadingCover && (
                          <div className="flex items-center gap-2 text-sm text-primary">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Uploading cover image to cloud...</span>
                          </div>
                        )}
                        
                        {coverImage && !uploadingCover && (
                          <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
                            <img 
                              src={coverImage} 
                              alt="Cover preview" 
                              className="w-full h-full object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2"
                              onClick={handleRemoveCoverImage}
                              title="Delete from cloud"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gallery">Gallery Images (optional)</Label>
                      <div className="space-y-3">
                        <Input 
                          id="gallery" 
                          type="file" 
                          accept="image/*" 
                          multiple 
                          onChange={handleGalleryImagesChange}
                          className={`${fieldClass} cursor-pointer`}
                          disabled={uploadingGallery || !basicDetailsFilled}
                        />
                        <p className="text-xs text-muted-foreground">
                          Add up to 10 images. Max file size: 10MB each. Images upload immediately after selection.
                        </p>
                        
                        {/* Loading indicator for gallery upload */}
                        {uploadingGallery && (
                          <div className="flex items-center gap-2 text-sm text-primary">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Uploading gallery images to cloud...</span>
                          </div>
                        )}
                        
                        {galleryImages.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {galleryImages.map((img, index) => (
                              <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
                                <img 
                                  src={img} 
                                  alt={`Gallery preview ${index + 1}`} 
                                  className="w-full h-full object-cover"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => removeGalleryImage(index)}
                                  title="Delete from cloud"
                                  disabled={uploadingGallery}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                        {galleryImages.length > 0 && !uploadingGallery && (
                          <p className="text-xs text-success">
                            ✅ {galleryImages.length} image{galleryImages.length !== 1 ? 's' : ''} uploaded to cloud
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Sponsor */}
              {currentStep === 5 && (
                <div className="space-y-5">
                  <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-white">Is this event sponsored?</p>
                        <p className="text-xs text-white/70">
                          Toggle “Yes” to add sponsor details required by the backend (name required; optional logo URL, website).
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs uppercase tracking-[0.08em] text-white/60">No</span>
                        <Switch checked={isSponsored} onCheckedChange={setIsSponsored} />
                        <span className="text-xs uppercase tracking-[0.08em] text-white/60">Yes</span>
                      </div>
                    </div>
                    {!isSponsored && (
                      <div className="text-xs text-white/60">
                        Sponsors are disabled. Click “Next” to continue or toggle “Yes” to add sponsor information.
                      </div>
                    )}
                  </div>

                  {isSponsored && (
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Add sponsor details to highlight partners on your event page.
                        </p>
                        <p className="text-xs text-white/60">
                          Required: Sponsor name. Optional: logo, website URL. When multiple sponsors exist, mark one as primary.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addSponsorRow}
                        className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Sponsor
                      </Button>
                    </div>
                  )}

                  {isSponsored && (
                    <div className="space-y-4">
                      {sponsors.map((sponsor, index) => (
                        <Card key={index} className={`border ${cardBase}`} style={{ borderColor: pageTheme.border }}>
                          <CardContent className="p-5 space-y-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-sm text-muted-foreground">Sponsor {index + 1}</p>
                                <h3 className="font-semibold text-white">Brand details</h3>
                              </div>
                              {sponsors.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeSponsorRow(index)}
                                  className="text-white hover:text-white"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              )}
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label>Sponsor Name *</Label>
                                <Input
                                  placeholder="BrandCo"
                                  value={sponsor.name}
                                  onChange={(e) => handleSponsorChange(index, "name", e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Website URL</Label>
                                <Input
                                  type="url"
                                  placeholder="https://brandco.example.com"
                                  value={sponsor.websiteUrl}
                                  onChange={(e) => handleSponsorChange(index, "websiteUrl", e.target.value)}
                                />
                              </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label>Logo</Label>
                                <div className="space-y-2">
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleSponsorLogoChange(index, e.target.files?.[0])}
                                    className="cursor-pointer"
                                  />
                                  <p className="text-xs text-muted-foreground">PNG / SVG with transparent background preferred</p>
                                  {sponsorUploadIndex === index && (
                                    <div className="flex items-center gap-2 text-sm text-primary">
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                      <span>Uploading logo...</span>
                                    </div>
                                  )}
                                  {sponsor.logoUrl && (
                                    <div className="relative w-28 h-28 rounded-lg overflow-hidden border border-border bg-white/5 flex items-center justify-center">
                                      <img
                                        src={sponsor.logoUrl}
                                        alt={`${sponsor.name || "Sponsor"} logo`}
                                        className="w-full h-full object-contain p-2"
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                {sponsors.length > 1 ? (
                                  <>
                                    <Switch
                                      checked={Boolean(sponsor.isPrimary)}
                                      onCheckedChange={() => setPrimarySponsor(index)}
                                    />
                                    <div>
                                      <p className="text-sm text-white">Mark as primary sponsor</p>
                                      <p className="text-xs text-white/60">Required when multiple sponsors exist.</p>
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-xs text-white/70 bg-white/10 px-3 py-2 rounded-lg border border-white/10">
                                    Single sponsor is primary by default.
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {isSponsored && sponsors.length === 0 && (
                    <div className="border border-dashed border-white/15 rounded-xl p-6 text-sm text-muted-foreground text-center">
                      No sponsors added yet. Click “Add Sponsor” to include partners.
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Date & Time */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label>Starting Date *</Label>
                      <Popover open={startCalendarOpen} onOpenChange={setStartCalendarOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`w-full justify-between ${fieldClass} h-12 hover:border-white/30 hover:bg-white/5`}
                          >
                            <span className="flex items-center gap-2 text-white">
                              <CalendarIcon className="w-4 h-4 text-white/70" />
                              {startDate ? formatDateValue(startDate) : "Pick a start date"}
                            </span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-auto p-0 border-white/15 bg-transparent">
                          <Calendar
                            mode="single"
                            selected={startDate ? new Date(`${startDate}T00:00:00`) : undefined}
                            onSelect={(date) => {
                              if (!date) return;
                              const iso = format(date, "yyyy-MM-dd");
                              setStartDate(iso);
                              if (endDate && iso > endDate) {
                                setEndDate(iso);
                              }
                              setStartCalendarOpen(false);
                            }}
                            disabled={{ before: today }}
                            defaultMonth={startDate ? new Date(`${startDate}T00:00:00`) : today}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label>Ending Time *</Label>
                      <Popover open={endTimeOpen} onOpenChange={setEndTimeOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`w-full justify-between ${fieldClass} h-12 hover:border-white/30 hover:bg-white/5`}
                          >
                            <span className="flex items-center gap-2 text-white">
                              <Clock className="w-4 h-4 text-white/70" />
                              {formatTimeDisplay(startTime)}
                            </span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          align="start"
                          sideOffset={8}
                          className="w-auto p-0 border-white/15 bg-transparent"
                        >
                          <TimePicker
                            value={startTime}
                            onChange={(val) => {
                              setStartTime(val);
                            }}
                            onClose={() => setStartTimeOpen(false)}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label>Ending Date *</Label>
                      <Popover open={endCalendarOpen} onOpenChange={setEndCalendarOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`w-full justify-between ${fieldClass} h-12 hover:border-white/30 hover:bg-white/5`}
                          >
                            <span className="flex items-center gap-2 text-white">
                              <CalendarIcon className="w-4 h-4 text-white/70" />
                              {endDate ? formatDateValue(endDate) : "Pick an end date"}
                            </span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-auto p-0 border-white/15 bg-transparent">
                          <Calendar
                            mode="single"
                            selected={endDate ? new Date(`${endDate}T00:00:00`) : undefined}
                            onSelect={(date) => {
                              if (!date) return;
                              const iso = format(date, "yyyy-MM-dd");
                              setEndDate(iso);
                              setEndCalendarOpen(false);
                            }}
                            disabled={{
                              before: startDate ? new Date(`${startDate}T00:00:00`) : today,
                            }}
                            defaultMonth={endDate ? new Date(`${endDate}T00:00:00`) : startDate ? new Date(`${startDate}T00:00:00`) : today}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label>Ending Time *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`w-full justify-between ${fieldClass} h-12 hover:border-white/30 hover:bg-white/5`}
                          >
                            <span className="flex items-center gap-2 text-white">
                              <Clock className="w-4 h-4 text-white/70" />
                              {formatTimeDisplay(endTime)}
                            </span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          align="start"
                          sideOffset={8}
                          className="w-auto p-0 border-white/15 bg-transparent"
                        >
                          <TimePicker
                            value={endTime}
                            onChange={(val) => {
                              setEndTime(val);
                            }}
                            onClose={() => setEndTimeOpen(false)}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Tickets */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-sm text-muted-foreground">
                    Select ticket types to add for your event
                  </div>

                  <div className="p-3 rounded-xl border border-dashed border-primary/30 bg-primary/5 text-xs md:text-sm text-muted-foreground">
                    Need a custom ticket? Pick <span className="font-semibold text-white/90">Add Standard Ticket</span>, name it (e.g., <span className="font-semibold text-white/90">Silver</span>) and set any price (₹150, ₹499, etc.). You can add multiple categories.
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* VIP Guest List Card */}
                    <Card 
                      className={`group transition-all cursor-pointer border ${cardBase} hover:border-[#2563eb] hover:shadow-xl`}
                      style={{ borderColor: pageTheme.border }}
                      onClick={() => openTicketModal("vip-guest")}
                    >
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-lg bg-gradient-to-br from-[#2563eb]/15 via-white/5 to-[#e11d48]/10">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="text-lg font-semibold">Add VIP Guest List</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Free entry for VIP guests with no pricing
                        </p>
                      </CardContent>
                    </Card>

                    {/* Standard Ticket Card */}
                    <Card 
                      className={`group transition-all cursor-pointer border ${cardBase} hover:border-[#2563eb] hover:shadow-xl`}
                      style={{ borderColor: pageTheme.border }}
                      onClick={() => openTicketModal("standard")}
                    >
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-lg bg-gradient-to-br from-[#2563eb]/15 via-white/5 to-[#e11d48]/10">
                            <Ticket className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="text-lg font-semibold">Add Standard Ticket</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Regular paid tickets with GST options
                        </p>
                      </CardContent>
                    </Card>

                    {/* Table Ticket Card */}
                    <Card 
                      className={`group transition-all cursor-pointer border ${cardBase} hover:border-[#2563eb] hover:shadow-xl`}
                      style={{ borderColor: pageTheme.border }}
                      onClick={() => openTicketModal("table")}
                    >
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-lg bg-gradient-to-br from-[#2563eb]/15 via-white/5 to-[#e11d48]/10">
                            <Table2 className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="text-lg font-semibold">Add Table Ticket</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Reserved table booking for groups
                        </p>
                      </CardContent>
                    </Card>

                    {/* Group Pass Card */}
                    <Card 
                      className={`group transition-all cursor-pointer border ${cardBase} hover:border-[#2563eb] hover:shadow-xl`}
                      style={{ borderColor: pageTheme.border }}
                      onClick={() => openTicketModal("group-pass")}
                    >
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-lg bg-gradient-to-br from-[#2563eb]/15 via-white/5 to-[#e11d48]/10">
                            <UsersRound className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="text-lg font-semibold">Add Group Pass</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Discounted pass for group bookings
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Display saved tickets */}
                  {savedTickets.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-semibold">Added Tickets ({savedTickets.length})</h3>
                      <div className="grid gap-3">
                        {savedTickets.map((ticket, index) => (
                          <Card key={index}>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-semibold">{ticket.ticketName}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {ticket.ticketCategory} • {ticket.ticketEntryType}
                                  </p>
                                  {ticket.ticketAddress && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {ticket.ticketAddress}
                                    </p>
                                  )}
                                  {ticket.price !== "0" && (
                                    <p className="text-sm font-semibold mt-1">₹{ticket.price}</p>
                                  )}
                                </div>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteTicket(ticket, index);
                                  }}
                                  disabled={showLoading}
                                >
                                  {showLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <X className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Venue & Location */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0b0f18] via-[#0f172a]/90 to-[#0b1224] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.12em] text-white/60">Venue</p>
                        <h3 className="text-lg font-semibold text-white">Location Details</h3>
                      </div>
                      <div className="flex gap-2 text-[11px]">
                        <span className="px-3 py-1 rounded-full bg-[#2563eb]/15 text-[#8ab4ff] border border-[#2563eb]/30">Manual entry</span>
                        <span className="px-3 py-1 rounded-full bg-[#e11d48]/15 text-[#ff9cb7] border border-[#e11d48]/30">Required fields *</span>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="venueName">Venue Name *</Label>
                        <Input
                          id="venueName"
                          placeholder="e.g., Red Fort Delhi"
                          value={venueName}
                          onChange={(e) => setVenueName(e.target.value)}
                          className={`${fieldClass} h-11`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          placeholder="Enter city"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className={`${fieldClass} h-11`}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          placeholder="Enter state"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          className={`${fieldClass} h-11`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country *</Label>
                        <Input
                          id="country"
                          placeholder="Enter country"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className={`${fieldClass} h-11`}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="postalCode">Postal / PIN Code *</Label>
                        <Input
                          id="postalCode"
                          placeholder="e.g., 110025"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          className={`${fieldClass} h-11`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="venueContact">Contact Number *</Label>
                        <Input
                          id="venueContact"
                          type="tel"
                          placeholder="Enter contact number"
                          value={venueContact}
                          onChange={(e) => setVenueContact(e.target.value)}
                          className={`${fieldClass} h-11`}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="venueEmail">Email *</Label>
                        <Input
                          id="venueEmail"
                          type="email"
                          placeholder="Enter email"
                          value={venueEmail}
                          onChange={(e) => setVenueEmail(e.target.value)}
                          className={`${fieldClass} h-11`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Full Address (optional)</Label>
                        <Textarea 
                          id="address" 
                          placeholder="Building / street / landmark"
                          value={fullAddress}
                          onChange={(e) => setFullAddress(e.target.value)}
                          rows={3}
                          className={`${fieldClass} min-h-[44px]`}
                        />
                        <p className="text-xs text-white/60">Provide extra directions if needed. This won’t block submission.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: Add Artist */}
              {currentStep === 6 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <Label>Artists</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setArtists([...artists, { name: "", photo: "", image: "", instagram: "", spotify: "", gender: "PREFER_NOT_TO_SAY" }])}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Artist
                    </Button>
                  </div>

                  {artists.map((artist, index) => (
                    <Card key={index} className="p-4 border border-border/60 shadow-sm">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Artist {index + 1}</p>
                          <h3 className="font-semibold leading-tight">Add details</h3>
                        </div>
                        {artists.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setArtists(artists.filter((_, i) => i !== index))}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor={`artist-name-${index}`}>Artist Name *</Label>
                          <Input
                            id={`artist-name-${index}`}
                            placeholder="e.g., John Doe"
                            value={artist.name}
                            onChange={(e) => {
                              const newArtists = [...artists];
                              newArtists[index].name = e.target.value;
                              setArtists(newArtists);
                            }}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`artist-gender-${index}`}>Gender</Label>
                          <Select 
                            value={artist.gender || "PREFER_NOT_TO_SAY"} 
                            onValueChange={(value) => {
                              const newArtists = [...artists];
                              newArtists[index].gender = value;
                              setArtists(newArtists);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="MALE">Male</SelectItem>
                              <SelectItem value="FEMALE">Female</SelectItem>
                              <SelectItem value="OTHER">Other</SelectItem>
                              <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor={`artist-photo-${index}`}>Artist Photo *</Label>
                          <div className="space-y-2">
                            <Input
                              id={`artist-photo-${index}`}
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleArtistPhotoChange(index, e)}
                              className="cursor-pointer"
                            />
                            {artist.photo && (
                              <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-border">
                                <img 
                                  src={artist.photo} 
                                  alt={`${artist.name} preview`} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground">JPG/PNG/WebP</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`artist-instagram-${index}`}>Instagram *</Label>
                          <Input
                            id={`artist-instagram-${index}`}
                            placeholder="@artist_handle"
                            value={artist.instagram}
                            onChange={(e) => {
                              const newArtists = [...artists];
                              newArtists[index].instagram = e.target.value;
                              setArtists(newArtists);
                            }}
                          />
                          <p className="text-xs text-muted-foreground">Use full handle or profile URL</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`artist-spotify-${index}`}>Spotify (Optional)</Label>
                        <Input
                          id={`artist-spotify-${index}`}
                          placeholder="https://open.spotify.com/artist/..."
                          value={artist.spotify}
                          onChange={(e) => {
                            const newArtists = [...artists];
                            newArtists[index].spotify = e.target.value;
                            setArtists(newArtists);
                          }}
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Step 7: Additional Information */}
              {currentStep === 7 && (() => {
                const advisoryOptions = [
                  { id: 'smokingAllowed', label: '🚬 Smoking allowed' },
                  { id: 'drinkingAllowed', label: '🍺 Drinking allowed' },
                  { id: 'petsAllowed', label: '🐾 Pets allowed' },
                  { id: 'ageRestricted', label: '🔞 Show is 18+' },
                  { id: 'camerasAllowed', label: '📸 Cameras and photos allowed' },
                  { id: 'outsideFoodAllowed', label: '🍔 Outside food & drinks allowed' },
                  { id: 'seatingProvided', label: '🪑 Seating provided' },
                  { id: 'wheelchairAccessible', label: '♿ Wheelchair accessible venue' },
                  { id: 'liveMusic', label: '🎵 Live music' },
                  { id: 'parkingAvailable', label: '🚗 Parking available' },
                  { id: 'reentryAllowed', label: '🔁 Re-entry allowed' },
                  { id: 'onsitePayments', label: '💳 On-site payments available' },
                  { id: 'securityCheck', label: '👮 Security check at entry' },
                  { id: 'cloakroom', label: '🧥 Cloakroom available' },
                ];
                const emojiPalette = [
                  "✨","✅","⚠️","🚫","🎟️","🎉","🎵","🍽️","🍺","🍷","🥤","🍾","🚭","📸","🧒","🔞",
                  "🧳","🎒","🕒","⏰","🚗","🅿️","♿","🎭","🎬","🎧","🎤","🎸","🪩","🎆","🎇","🏟️","🧥","🔒","🛡️"
                ];

                const selectedBuiltIns = advisoryOptions.filter((item) => advisory[item.id]);
                const hasSelections = selectedBuiltIns.length > 0 || customAdvisories.length > 0;

                return (
                  <div className="space-y-5">
                    <Card className="border border-white/10 bg-gradient-to-br from-[#0b0f18] via-[#0f172a]/90 to-[#0b1224] shadow-[0_20px_80px_rgba(0,0,0,0.55)]">
                      <CardHeader className="pb-2">
                        <p className="text-xs uppercase tracking-[0.2em] text-white/50">Step 7</p>
                        <CardTitle className="text-xl text-white">Additional Info</CardTitle>
                        <p className="text-sm text-white/70">Set policies, advisories, and helpful notes for attendees.</p>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <Label htmlFor="terms" className="text-white">Terms & Conditions</Label>
                              <p className="text-xs text-white/60">Describe entry rules, refunds, or other policies.</p>
                            </div>
                          </div>
                          <div className="rounded-2xl border border-white/15 bg-gradient-to-br from-[#0c1324] via-[#0f172a] to-[#0b1224] shadow-[0_20px_70px_rgba(0,0,0,0.5)] p-3">
                            <ReactQuill
                              theme="snow"
                              value={termsAndConditions}
                              onChange={setTermsAndConditions}
                              placeholder="Enter any terms and conditions..."
                              style={{
                                background: "rgba(255,255,255,0.03)",
                                borderRadius: "12px",
                                border: "1px solid rgba(255,255,255,0.14)",
                                color: "#e5e7eb",
                              }}
                              className="text-white"
                              modules={{
                                toolbar: [
                                  ['bold', 'italic', 'underline'],
                                  [{ list: 'ordered' }, { list: 'bullet' }],
                                  [{ color: [] }, { background: [] }],
                                  [{ size: ['small', false, 'large', 'huge'] }],
                                  ['clean'],
                                ],
                              }}
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <Label className="text-white">Advisories</Label>
                              <p className="text-xs text-white/60">Pick multiple advisories and add your own.</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                className="border-white/30 text-white bg-white/5 hover:bg-white/10"
                                onClick={() => setAdvisoryDialogOpen(true)}
                              >
                                {hasSelections ? `${selectedBuiltIns.length + customAdvisories.length} selected` : "Open advisory picker"}
                              </Button>
                            </div>
                          </div>

                          <Dialog open={advisoryDialogOpen} onOpenChange={setAdvisoryDialogOpen}>
                            <DialogContent className="max-w-4xl border-white/15 bg-[#0b1224]/95 text-white shadow-[0_30px_120px_rgba(0,0,0,0.65)] max-h-[90vh] overflow-hidden p-0">
                            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-5">
                              <DialogHeader>
                                <DialogTitle className="text-2xl">Choose advisories</DialogTitle>
                                <DialogDescription className="text-white/70">
                                  Turn on as many as you need, or add a custom advisory.
                                </DialogDescription>
                              </DialogHeader>

                              <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {advisoryOptions.map((item) => {
                                    const active = advisory[item.id];
                                    return (
                                      <button
                                        key={item.id}
                                        type="button"
                                        className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition ${
                                          active
                                            ? "border-[#2563eb]/70 bg-[#2563eb]/15 text-white shadow-[0_12px_40px_rgba(37,99,235,0.25)]"
                                            : "border-white/15 bg-white/5 text-white/80 hover:border-white/30 hover:bg-white/10"
                                        }`}
                                        onClick={() => setAdvisory({ ...advisory, [item.id]: !active })}
                                      >
                                        <Checkbox
                                          checked={active}
                                          onCheckedChange={(checked) => setAdvisory({ ...advisory, [item.id]: !!checked })}
                                        />
                                        <span className="text-sm font-medium">{item.label}</span>
                                      </button>
                                    );
                                  })}
                                </div>

                                <div className="border-t border-white/10 pt-4 space-y-3">
                                  <p className="text-sm font-semibold text-white">Custom advisory</p>
                                  <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="flex-1 flex gap-2">
                                      <Input
                                        placeholder="e.g., No re-entry after 10 PM"
                                        value={newCustomAdvisory}
                                        onChange={(e) => setNewCustomAdvisory(e.target.value)}
                                        className="bg-white/5 border-white/15 text-white placeholder:text-white/50"
                                      />
                                      <Button
                                        type="button"
                                        variant="outline"
                                        className="border-white/20 text-white bg-white/5 hover:bg-white/10"
                                        onClick={() => setShowEmojiPicker((prev) => !prev)}
                                      >
                                        <Smile className="w-4 h-4" />
                                      </Button>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="accent"
                                      className="bg-gradient-to-r from-[#2563eb] to-[#e11d48] text-white shadow-lg"
                                      onClick={() => {
                                        const trimmed = newCustomAdvisory.trim();
                                        if (!trimmed) return;
                                        setCustomAdvisories([...customAdvisories, trimmed]);
                                        setNewCustomAdvisory("");
                                        toast.success("Custom advisory added");
                                      }}
                                    >
                                      <Plus className="w-4 h-4" />
                                    </Button>
                                  </div>

                                  {showEmojiPicker && (
                                    <div className="rounded-xl border border-white/15 bg-[#0f172a] p-3 space-y-2 max-h-60 overflow-y-auto">
                                      <p className="text-xs uppercase tracking-[0.08em] text-white/60">Emoji</p>
                                      <div className="grid grid-cols-8 gap-2 text-lg">
                                        {emojiPalette.map((emoji, idx) => (
                                          <button
                                            key={`emoji-${idx}`}
                                            type="button"
                                            className="h-9 w-9 rounded-lg border border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10 transition"
                                            onClick={() => setNewCustomAdvisory((prev) => `${prev}${emoji}`)}
                                          >
                                            {emoji}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {customAdvisories.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                      {customAdvisories.map((item, idx) => (
                                        <button
                                          key={`custom-dialog-${idx}`}
                                          type="button"
                                          className="group flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm text-white hover:border-[#e11d48]/50 hover:bg-[#e11d48]/15"
                                          onClick={() => setCustomAdvisories(customAdvisories.filter((_, i) => i !== idx))}
                                        >
                                          ✨ {item}
                                          <X className="w-3 h-3 text-white/70 group-hover:text-white" />
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <DialogFooter className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <p className="text-sm text-white/70">
                                  {hasSelections
                                    ? `${selectedBuiltIns.length + customAdvisories.length} selected`
                                    : "No advisories selected yet"}
                                </p>
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    className="text-white/80 hover:text-white"
                                    onClick={() => setAdvisoryDialogOpen(false)}
                                  >
                                    Close
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="accent"
                                    className="bg-gradient-to-r from-[#2563eb] to-[#e11d48] text-white shadow-lg"
                                    onClick={() => setAdvisoryDialogOpen(false)}
                                  >
                                    Done
                                  </Button>
                                </div>
                              </DialogFooter>
                            </div>
                          </DialogContent>
                        </Dialog>
                        {hasSelections ? (
                            <div className="flex flex-wrap gap-2">
                              {selectedBuiltIns.map((item) => (
                                <button
                                  key={item.id}
                                  type="button"
                                  className="group flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-sm text-white hover:border-[#e11d48]/40 hover:bg-[#e11d48]/10"
                                  onClick={() => setAdvisory({ ...advisory, [item.id]: false })}
                                >
                                  {item.label}
                                  <X className="w-3 h-3 text-white/70 group-hover:text-white" />
                                </button>
                              ))}
                              {customAdvisories.map((item, idx) => (
                                <button
                                  key={`custom-${idx}`}
                                  type="button"
                                  className="group flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-sm text-white hover:border-[#e11d48]/40 hover:bg-[#e11d48]/10"
                                  onClick={() => setCustomAdvisories(customAdvisories.filter((_, i) => i !== idx))}
                                >
                                  ✨ {item}
                                  <X className="w-3 h-3 text-white/70 group-hover:text-white" />
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-white/60 border border-dashed border-white/20 rounded-lg px-3 py-2 bg-white/5">
                              No advisories selected yet. Use “Select advisories” to add them.
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <Label className="text-white">Custom Questions for Attendees</Label>
                              <p className="text-xs text-white/60">Collect details like dietary needs or preferences.</p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-white/30 text-white bg-white/5 hover:bg-white/10"
                              onClick={() => {
                                if (newQuestion.trim()) {
                                  setCustomQuestions([...customQuestions, { question: newQuestion, answer: newAnswer }]);
                                  setNewQuestion('');
                                  setNewAnswer('');
                                  toast.success('Question added');
                                } else {
                                  toast.error('Please enter a question');
                                }
                              }}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Question
                            </Button>
                          </div>

                          <div className="space-y-2">
                            <Input
                              placeholder="Question (e.g., Dietary requirements?)"
                              value={newQuestion}
                              onChange={(e) => setNewQuestion(e.target.value)}
                              className="bg-white/5 border-white/15 text-white placeholder:text-white/50"
                            />
                            <Textarea
                              placeholder="Answer (optional - organizer can provide default answer)"
                              value={newAnswer}
                              onChange={(e) => setNewAnswer(e.target.value)}
                              rows={2}
                              className="bg-white/5 border-white/15 text-white placeholder:text-white/50"
                            />
                          </div>

                          {customQuestions.length > 0 ? (
                            <div className="space-y-3">
                              {customQuestions.map((q, index) => (
                                <Card key={index} className="border border-white/10 bg-white/5">
                                  <CardContent className="pt-4">
                                    <div className="flex justify-between items-start gap-2">
                                      <div className="flex-1 space-y-1">
                                        <p className="font-medium text-sm text-white">Q: {q.question}</p>
                                        {q.answer && <p className="text-sm text-white/70">A: {q.answer}</p>}
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-white/70 hover:text-white"
                                        onClick={() => {
                                          setCustomQuestions(customQuestions.filter((_, i) => i !== index));
                                          toast.success('Question removed');
                                        }}
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-white/60">No questions added yet.</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="notes" className="text-white">Organizer Notes (Private)</Label>
                          <Textarea
                            id="notes"
                            placeholder="Add any internal notes..."
                            rows={3}
                            value={organizerNote}
                            onChange={(e) => setOrganizerNote(e.target.value)}
                            className="bg-white/5 border-white/15 text-white placeholder:text-white/50"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })()}

              {/* Step 8: Review & Publish */}
              {currentStep === 8 && (() => {
                const statusBadge = (filled) => (
                  <Badge className={filled ? 'bg-emerald-500/20 text-emerald-100 border-emerald-400/30 shadow-[0_0_20px_rgba(16,185,129,0.25)]' : 'bg-white/10 text-white/70 border-white/15'}>
                    {filled ? 'Filled' : 'Missing'}
                  </Badge>
                );

                const advisoryEntries =
                  customAdvisories.length > 0
                    ? customAdvisories
                    : Object.entries(advisory || {})
                        .filter(([, val]) => val)
                        .map(([key]) => key.replace(/([A-Z])/g, ' $1').trim());

                const questionsEntries = customQuestions.map((q, i) => ({
                  title: q.question,
                  answer: q.answer,
                  index: i + 1,
                }));

                const additionalInfoCards = [
                  {
                    title: 'Terms & Conditions',
                    filled: Boolean(termsAndConditions?.trim()),
                    content: termsAndConditions?.trim() || 'Not provided',
                    isHtml: true,
                  },
                  {
                    title: 'Advisories',
                    filled: Object.values(advisory || {}).some(Boolean) || customAdvisories.length > 0,
                    content: advisoryEntries,
                    type: 'advisory-list',
                    isHtml: false,
                  },
                  {
                    title: 'Custom Questions for Attendees',
                    filled: customQuestions.length > 0,
                    content: questionsEntries,
                    type: 'questions-list',
                    isHtml: false,
                  },
                  {
                    title: 'Organizer Notes (Private)',
                    filled: Boolean(organizerNote?.trim()),
                    content: organizerNote?.trim() || 'Not provided',
                    isHtml: false,
                  },
                ];

                const summaryItems = [
                  { label: 'Event Title', value: eventTitle },
                  { label: 'Category', value: mainCategory },
                  { label: 'Subcategory', value: selectedCategories[0] },
                  { label: 'Cover Image', value: coverImage ? 'Uploaded' : '' },
                  { label: 'Start', value: startDate ? `${formatDateValue(startDate)} ${formatTimeDisplay(startTime)}` : '' },
                  { label: 'End', value: endDate ? `${formatDateValue(endDate)} ${formatTimeDisplay(endTime)}` : '' },
                  { label: 'Venue', value: venueName },
                  { label: 'City', value: city },
                  { label: 'State', value: state },
                  { label: 'Tickets', value: savedTickets.length ? `${savedTickets.length} added` : '' },
                  { label: 'Sponsors', value: normalizeSponsors(sponsors).length ? `${normalizeSponsors(sponsors).length} added` : '' },
                  { label: 'Artists', value: artists.filter((a) => a.name.trim()).length ? `${artists.filter((a) => a.name.trim()).length} added` : '' },
                  { label: 'Location', value: fullAddress || [city, state].filter(Boolean).join(', ') || 'Location pending' },
                ];

                return (
                  <div className="space-y-6 bg-gradient-to-br from-[#0b0f18] via-[#0f172a]/90 to-[#0c1324] p-4 md:p-6 rounded-2xl border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
                    <div className="p-4 rounded-xl border border-white/10 bg-white/5 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(74,222,128,0.7)]" />
                        <h3 className="text-lg font-semibold">Review before publishing</h3>
                      </div>
                      <p className="text-sm text-white/70">Check what’s filled and what’s missing. You can go back to edit anything.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 border border-white/10 bg-white/5 rounded-xl p-4">
                      <div className="space-y-1">
                        <p className="text-xs uppercase tracking-[0.12em] text-white/60">Publish State</p>
                        <p className="text-sm text-white/80">Choose whether to keep this as Draft or Publish it now.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {["DRAFT", "PUBLISHED"].map((state) => {
                          const isActive = publishState === state;
                          return (
                            <Button
                              key={state}
                              type="button"
                              variant={isActive ? "accent" : "outline"}
                              className={`px-4 ${isActive ? "bg-gradient-to-r from-[#2563eb] to-[#e11d48] text-white" : "border-white/30 text-white hover:bg-white/10"}`}
                              onClick={() => setPublishState(state)}
                              disabled={isSubmitting}
                            >
                              {state === "DRAFT" ? "Save as Draft" : "Publish"}
                            </Button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      {summaryItems.map((item, idx) => (
                        <Card key={idx} className={`border ${cardBase}`} style={{ borderColor: pageTheme.border }}>
                          <CardContent className="p-4 flex items-center justify-between">
                            <div>
                              <p className="text-xs text-white/60">{item.label}</p>
                              <p className={`text-sm font-semibold ${item.value ? 'text-white' : 'text-white/50'}`}>
                                {item.value || 'Not provided'}
                              </p>
                            </div>
                            {statusBadge(Boolean(item.value))}
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Card className={`border ${cardBase}`} style={{ borderColor: pageTheme.border }}>
                        <CardHeader>
                          <CardTitle className="text-base">Tickets</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {savedTickets.length ? (
                            savedTickets.map((t, i) => (
                              <div key={i} className="flex justify-between text-sm">
                                <span>{t.ticketName}</span>
                                <span className="text-white/80">{t.price === '0' ? 'Free' : `₹${t.price}`}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-white/60">No tickets added</p>
                          )}
                        </CardContent>
                      </Card>

                      <Card className={`border ${cardBase}`} style={{ borderColor: pageTheme.border }}>
                        <CardHeader>
                          <CardTitle className="text-base">Sponsors</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {normalizeSponsors(sponsors).length ? (
                            normalizeSponsors(sponsors).map((s, i) => (
                              <div key={i} className="flex items-center justify-between text-sm">
                                <div className="space-y-0.5">
                                  <p className="font-semibold">{s.name || s.company}</p>
                                  <p className="text-xs text-white/60">{s.tier || 'Sponsor'}</p>
                                </div>
                                {s.logo && <img src={s.logo} alt="" className="w-10 h-10 object-contain rounded border border-white/10 bg-white/5" />}
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-white/60">No sponsors added</p>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Card className={`border ${cardBase}`} style={{ borderColor: pageTheme.border }}>
                        <CardHeader>
                          <CardTitle className="text-base">Venue</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-white/80">
                          <p>{venueName || 'Not provided'}</p>
                          <p className="text-white/60">{fullAddress || [city, state, postalCode].filter(Boolean).join(', ') || 'Location pending'}</p>
                        </CardContent>
                      </Card>

                      <Card className={`border ${cardBase}`} style={{ borderColor: pageTheme.border }}>
                        <CardHeader>
                          <CardTitle className="text-base">Artists</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          {artists.filter((a) => a.name.trim()).length ? (
                            artists
                              .filter((a) => a.name.trim())
                              .map((a, i) => (
                                <div key={i} className="flex justify-between items-center">
                                  <span className="font-semibold">{a.name}</span>
                                  {a.instagram && <span className="text-xs text-white/60">{a.instagram}</span>}
                                </div>
                              ))
                          ) : (
                            <p className="text-sm text-white/60">No artists added</p>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    <Card className={`border ${cardBase}`} style={{ borderColor: pageTheme.border }}>
                      <CardHeader>
                        <CardTitle className="text-base">Gallery</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {galleryImages.length ? (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {galleryImages.slice(0, 4).map((img, i) => (
                              <div key={i} className="aspect-square rounded-lg overflow-hidden border border-white/10">
                                <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-white/60">No gallery images uploaded</p>
                        )}
                      </CardContent>
                    </Card>

                    <Card className={`border ${cardBase}`} style={{ borderColor: pageTheme.border }}>
                      <CardHeader>
                        <CardTitle className="text-base">Additional Info</CardTitle>
                        <p className="text-xs text-white/60">What attendees see and internal notes</p>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {additionalInfoCards.map((info, i) => (
                          <div key={i} className="flex gap-3 border border-white/10 rounded-lg p-3 bg-white/5 hover:border-white/20 transition">
                            <div className="flex-1 space-y-1">
                              <p className="text-[11px] uppercase tracking-[0.12em] text-white/60">{info.title}</p>
                              {info.filled ? (
                                info.type === 'advisory-list' ? (
                                  <div className="flex flex-wrap gap-2">
                                    {info.content.map((chip, idx) => (
                                      <span
                                        key={idx}
                                        className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-50"
                                      >
                                        {chip}
                                      </span>
                                    ))}
                                  </div>
                                ) : info.type === 'questions-list' ? (
                                  <ol className="list-decimal list-inside space-y-1 text-sm text-white">
                                    {info.content.map((q) => (
                                      <li key={q.index} className="pl-1">
                                        <span className="font-semibold">{q.title}</span>
                                        {q.answer ? <span className="text-white/70"> — {q.answer}</span> : null}
                                      </li>
                                    ))}
                                  </ol>
                                ) : info.isHtml ? (
                                  <div
                                    className="text-sm text-white prose prose-invert prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: info.content }}
                                  />
                                ) : (
                                  <p className="text-sm whitespace-pre-line text-white">{info.content}</p>
                                )
                              ) : (
                                <p className="text-sm text-white/50 italic">Not provided</p>
                              )}
                            </div>
                            <div className="self-start">{statusBadge(info.filled)}</div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="border-white/30 text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentStep < 8 ? (
              <Button
                onClick={nextStep}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-[#2563eb] to-[#e11d48] text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                {isSubmitting ? "Saving..." : "Next"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                variant="accent" 
                onClick={() => handleSubmit(publishState)}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-[#2563eb] to-[#e11d48] text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                {isSubmitting
                  ? "Updating..."
                  : publishState === "PUBLISHED"
                    ? (isEditMode ? "Update & Publish" : "Publish Event")
                    : (isEditMode ? "Update as Draft" : "Save as Draft")}
              </Button>
            )}
          </div>
        </div>
      </main>

      {/* Ticket Type Modal */}
      {selectedTicketType && (
        <TicketTypeModal
          open={ticketModalOpen}
          onClose={() => {
            setTicketModalOpen(false);
            setSelectedTicketType(null);
          }}
          ticketType={selectedTicketType}
          onSave={handleSaveTicket}
        />
      )}
    </div>
  );
};

export default CreateEvent;
