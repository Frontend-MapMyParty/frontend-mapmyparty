import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check, Calendar, Clock, Globe, Upload, X, ChevronLeft, Plus, MapPin, Ticket, Users, Table2, UsersRound, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import LoadingOverlay from "@/components/LoadingOverlay";
import { toast } from "sonner";
import { useEvents } from "@/hooks/useEvents";
import eventMusic from "@/assets/event-music.jpg";
import TicketTypeModal from "@/components/TicketTypeModal";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { updateEventStep2, uploadFlyerImage, deleteFlyerImage, uploadGalleryImages, deleteGalleryImage, generateEventId, createTicket, deleteTicket, createVenue, updateVenue, createArtist, updateEventStep6, publishEvent } from "@/services/eventService";
import { apiFetch } from "@/config/api";
import { TEMPLATE_CONFIGS, DETAIL_TEMPLATE_CONFIGS, getTemplateConfig, mapTemplateId, mapTemplateNameToId } from "@/config/templates";

const CreateEvent = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addEvent, events, updateEvent } = useEvents();
  const [currentStep, setCurrentStep] = useState(1);
  const [eventType, setEventType] = useState("one-time");
  const [coverImage, setCoverImage] = useState(null);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [existingGalleryUrls, setExistingGalleryUrls] = useState([]); // Existing images from backend (URLs)
  const [galleryImages, setGalleryImages] = useState([]); // All images (existing URLs + new previews)
  const [galleryImageFiles, setGalleryImageFiles] = useState([]); // Only NEW files to upload
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
  const [ticketPrice, setTicketPrice] = useState("49");
  const [artists, setArtists] = useState([{ name: "", photo: "", instagram: "", spotify: "", gender: "PREFER_NOT_TO_SAY" }]);
  const [advisory, setAdvisory] = useState({
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
  });
  const [customAdvisories, setCustomAdvisories] = useState([]);
  const [termsAndConditions, setTermsAndConditions] = useState("");
  const [customQuestions, setCustomQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [organizerNote, setOrganizerNote] = useState("");
  const [selectedEventTypeCategory, setSelectedEventTypeCategory] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [fullAddress, setFullAddress] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const venueInputRef = useRef(null);
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

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
            
            if (venueData.latitude && venueData.longitude) {
              setSelectedLocation({
                lat: venueData.latitude,
                lng: venueData.longitude
              });
            }
            
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
  useEffect(() => {
    if (editId) {
      const eventToEdit = events.find(e => e.id === editId);
      if (eventToEdit) {
        setEventTitle(eventToEdit.title);
        setMainCategory(eventToEdit.category || '');
        setSelectedCategories([eventToEdit.subcategory || '']);
        setCoverImage(eventToEdit.image);
        
        // Load template if available (map old IDs to new names)
        if (eventToEdit.template) {
          const templateName = mapTemplateId(eventToEdit.template);
          setSelectedTemplate(templateName);
        }
        
        // Parse location
        const locationParts = eventToEdit.location.split(', ');
        if (locationParts.length > 0) setVenueName(locationParts[0]);
        if (locationParts.length > 1) setCity(locationParts[1]);
        if (locationParts.length > 2) setState(locationParts[2]);
        
        // Parse price
        if (eventToEdit.price && eventToEdit.price.includes('₹')) {
          const price = eventToEdit.price.replace(/[^0-9]/g, '');
          setTicketPrice(price);
        }

        setArtists(eventToEdit.artists || [{ name: "", photo: "", instagram: "", spotify: "", gender: "PREFER_NOT_TO_SAY" }]);
      }
    }
  }, [editId, events]);

  // Map URL params to backend enum values
  const eventTypeMapping = {
    "guest-list": "GUESTLIST",
    "exclusive": "EXCLUSIVE",
    "non-exclusive": "NON_EXCLUSIVE"
  };

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

  // Search for locations using Photon API (OpenStreetMap-based, CORS-friendly)
  const searchLocations = async (query) => {
    if (!query || query.length < 3) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setSearchingLocation(true);
    
    try {
      // Using Photon API instead of Nominatim (more CORS-friendly)
      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch locations: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.features || data.features.length === 0) {
        setLocationSuggestions([]);
        setShowSuggestions(false);
        return;
      }
      
      const suggestions = data.features.map(feature => {
        const props = feature.properties;
        const coords = feature.geometry.coordinates;
        
        // Build display name from properties
        const parts = [];
        if (props.name) parts.push(props.name);
        if (props.city) parts.push(props.city);
        else if (props.county) parts.push(props.county);
        if (props.state) parts.push(props.state);
        if (props.country) parts.push(props.country);
        
        const displayName = parts.join(', ') || 'Unknown Location';
        
        return {
          name: props.name || displayName,
          lat: coords[1], // Photon uses [lng, lat] format
          lng: coords[0],
          address: {
            city: props.city || props.county || '',
            state: props.state || '',
            country: props.country || '',
            postcode: props.postcode || '',
          },
          displayName: displayName,
        };
      });
      
      setLocationSuggestions(suggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error searching locations:', error);
      toast.error('Failed to search locations. Please try again.');
    } finally {
      setSearchingLocation(false);
    }
  };

  // Debounce location search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (venueName && !selectedLocation) {
        searchLocations(venueName);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [venueName, selectedLocation]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (venueInputRef.current && !venueInputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle location selection
  const handleLocationSelect = (location) => {
    console.log("📍 Location selected:", location);
    
    setVenueName(location.displayName.split(',')[0]); // First part is usually the venue/place name
    setFullAddress(location.displayName);
    setSelectedLocation(location);
    setShowSuggestions(false);
    
    // Extract city, state, country, and postal code from address
    if (location.address) {
      if (location.address.city) setCity(location.address.city);
      else if (location.address.town) setCity(location.address.town);
      else if (location.address.village) setCity(location.address.village);
      
      if (location.address.state) setState(location.address.state);
      if (location.address.country) setCountry(location.address.country);
      if (location.address.postcode) setPostalCode(location.address.postcode);
    }
    
    console.log("✅ Location state updated:", {
      venueName: location.displayName.split(',')[0],
      fullAddress: location.displayName,
      city: location.address?.city || location.address?.town,
      state: location.address?.state,
      country: location.address?.country,
      postalCode: location.address?.postcode,
      latitude: location.lat,
      longitude: location.lng
    });
    
    toast.success("Location selected successfully!");
  };

  // Load Leaflet CSS and JS for map
  useEffect(() => {
    // Check if Leaflet is already loaded
    if (window.L) {
      setLeafletLoaded(true);
      console.log("✅ Leaflet already loaded");
      return;
    }

    // Add Leaflet CSS
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);
      console.log("📦 Loading Leaflet CSS...");
    }

    // Add Leaflet JS
    if (!document.querySelector('script[src*="leaflet.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      script.crossOrigin = '';
      script.async = true;
      script.onload = () => {
        setLeafletLoaded(true);
        console.log("✅ Leaflet loaded successfully");
      };
      script.onerror = () => {
        console.error("❌ Failed to load Leaflet");
        toast.error("Failed to load map library");
      };
      document.head.appendChild(script);
      console.log("📦 Loading Leaflet JS...");
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  // Initialize Leaflet map when location is selected and Leaflet is loaded
  useEffect(() => {
    if (!selectedLocation || !mapContainerRef.current || !leafletLoaded || !window.L) {
      console.log("⏳ Waiting for map initialization...", {
        selectedLocation: !!selectedLocation,
        mapContainer: !!mapContainerRef.current,
        leafletLoaded,
        windowL: !!window.L
      });
      return;
    }

    console.log("🗺️ Initializing map for location:", selectedLocation);

    try {
      // Remove existing map instance if any
      if (mapInstanceRef.current) {
        console.log("🗑️ Removing old map instance");
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Clear the container
      mapContainerRef.current.innerHTML = '';

      // Create new map
      const map = window.L.map(mapContainerRef.current, {
        center: [selectedLocation.lat, selectedLocation.lng],
        zoom: 15,
        scrollWheelZoom: true,
      });

      // Add tile layer (map style)
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Add marker with popup
      const marker = window.L.marker([selectedLocation.lat, selectedLocation.lng])
        .addTo(map)
        .bindPopup(`<b>${selectedLocation.displayName.split(',')[0]}</b><br>${selectedLocation.displayName}`)
        .openPopup();

      // Store map instance for cleanup
      mapInstanceRef.current = map;

      console.log("✅ Map initialized successfully");

      // Force map to refresh after a short delay
      setTimeout(() => {
        if (map) {
          map.invalidateSize();
        }
      }, 100);

    } catch (error) {
      console.error('❌ Error initializing map:', error);
      toast.error("Failed to load map");
    }
  }, [selectedLocation, leafletLoaded]);

  const steps = [
    { number: 1, title: "Event Details" },
    { number: 2, title: "Images" },
    { number: 3, title: "Date & Time" },
    { number: 4, title: "Tickets" },
    { number: 5, title: "Venue & Location" },
    { number: 6, title: "Add Artist" },
    { number: 7, title: "Additional Info" },
    { number: 8, title: "Select Template" },
  ];

  const progress = (currentStep / 8) * 100;

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

      // Call API for Step 1 - Create or Update Event with basic details
      try {
        setIsSubmitting(true);
        setLoadingMessage("Saving event details...");
        setShowLoading(true);
        
        let response;
        
        // Check if event already exists (going back to step 1 in same session)
        const hasExistingDraft = backendEventId && sessionStorage.getItem('draftStarted');
        
        if (hasExistingDraft) {
          // UPDATE existing event (user went back to step 1)
          console.log("🔄 Updating existing draft event:", backendEventId);
          console.log("📝 Text fields changed?", textFieldsChanged);
          
          try {
            // Strategy: Only update text fields via PATCH /api/event/update-event/:id
            // Images are handled separately in Step 2 and uploaded/deleted immediately
            
            if (textFieldsChanged) {
              console.log("📝 Text fields changed - using PATCH /api/event/update-event/:id");
              
              const eventData = {
                title: eventTitle,
                description: eventDescription,
                category: mainCategory,
                subCategory: selectedCategories[0] || "",
              };
              
              // Add type if it exists
              if (currentEventType) {
                eventData.type = currentEventType;
              }
              
              console.log("📤 Sending update payload:", eventData);
              
              response = await apiFetch(`api/event/update-event/${backendEventId}`, {
                method: 'PATCH',
                body: JSON.stringify(eventData),
              });
              
              toast.success("Event details updated successfully!");
              
              // Reset flag after successful update
              setTextFieldsChanged(false);
            } else {
              // No text changes detected
              console.log("ℹ️ No text field changes detected in Step 1");
              toast.info("No changes to update");
              setCurrentStep(currentStep + 1);
              return;
            }
            
          } catch (updateError) {
            console.error("⚠️ Update failed:", updateError);
            toast.error("Failed to update event. Please try again.");
            return;
          }
        } else {
          // CREATE new event (first time)
          console.log("✨ Creating new event (first time)");
          
          const eventData = {
            title: eventTitle,
            description: eventDescription,
            category: mainCategory,
            subCategory: selectedCategories[0] || "",
            status1: "UPCOMING", // EventStatus enum: UPCOMING, ONGOING, COMPLETED, CANCELLED
            status2: "DRAFT", // PublishStatus enum: DRAFT, PUBLISHED, PENDING
            type: currentEventType || "PAID", // Use backend enum value (GUESTLIST, EXCLUSIVE, NON_EXCLUSIVE) or default to PAID
            template: mapTemplateNameToId(selectedTemplate), // Convert template name to ID for backend
            // These fields will be updated in later steps
            startDate: null,
            endDate: null,
            TC: null,
            advisory: null,
            organizerNote: null,
            questions: []
          };
          
          response = await apiFetch('api/event/create-event', {
            method: 'POST',
            body: JSON.stringify(eventData),
          });
          
          toast.success("Event details saved successfully!");
          
          // Store the backend event ID for future updates
          if (response.data?.id || response.data?._id || response.id || response._id) {
            const backendId = response.data?.id || response.data?._id || response.id || response._id;
            setBackendEventId(backendId);
            console.log("💾 Backend Event ID stored:", backendId);
          }
          
          // Images will be uploaded in Step 2, so no need to load them here
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
      // Step 2: Images (images uploaded immediately on selection)
      if (!coverImage) {
        toast.error("Cover image is required. Please upload a cover image.");
        return;
      }

      // Check if cover image is still uploading
      if (uploadingCover) {
        toast.error("Cover image is still uploading. Please wait...");
        return;
      }

      // Check if gallery images are still uploading
      if (uploadingGallery) {
        toast.error("Gallery images are still uploading. Please wait...");
        return;
      }

      // All images are already uploaded, just move to next step
      console.log("✅ Images already uploaded, proceeding to next step");
      setCurrentStep(currentStep + 1);
      return;
    }

    if (currentStep === 3) {
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
        
        // Combine date and time into ISO format
        const startDateTime = new Date(`${startDate}T${startTime}`).toISOString();
        const endDateTime = new Date(`${endDate}T${endTime}`).toISOString();
        
        const updateData = {
          startDate: startDateTime,
          endDate: endDateTime,
        };

        const response = await updateEventStep2(backendEventId, updateData);
        
        toast.success("Date & time updated successfully!");
        console.log("Step 3 API Response:", response);
        
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

    if (currentStep === 4) {
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

    if (currentStep === 5) {
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
      const venueData = {
        name: venueName,
        contact: venueContact,
        email: venueEmail,
        fullAddress: fullAddress || `${venueName}, ${city}, ${state}`,
        city: city,
        state: state,
        country: country,
        postalCode: postalCode,
        latitude: selectedLocation?.lat || 0,
        longitude: selectedLocation?.lng || 0,
        googlePlaceId: "", // Optional - could be added later
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

    if (currentStep === 6) {
      // Validate that all artists with names have Instagram
      for (let i = 0; i < artists.length; i++) {
        const artist = artists[i];
        if (artist.name.trim() && !(artist.instagram || '').trim()) {
          toast.error(`Instagram is required for Artist ${i + 1}`);
          return;
        }
      }

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
          .map((artist, index) => ({ ...artist, originalIndex: index }))
          .filter(artist => artist.name.trim() !== "");
        
        if (validArtists.length === 0) {
          // No artists to create, just move to next step
          setIsSubmitting(false);
          setShowLoading(false);
          setCurrentStep(currentStep + 1);
          return;
        }
        
        // Filter out artists that have already been created
        const newArtists = validArtists.filter(artist => 
          !createdArtistIndices.includes(artist.originalIndex)
        );
        
        if (newArtists.length === 0) {
          console.log("✅ No new artists to create, all artists already exist");
          toast.success("Artists already added!");
          setIsSubmitting(false);
          setShowLoading(false);
          setCurrentStep(currentStep + 1);
          return;
        }
        
        console.log(`🎤 Creating ${newArtists.length} new artist(s)`);
        
        // Create only new artists
        const artistPromises = newArtists.map(async (artist) => {
          const artistData = {
            name: artist.name,
            eventId: backendEventId, // Use backend event ID
            gender: artist.gender || "PREFER_NOT_TO_SAY",
            instagramLink: artist.instagram || "",
            spotifyLink: artist.spotify || "",
            image: artist.photo || "", // Base64 or URL
          };
          return createArtist(artistData);
        });
        
        const artistResponses = await Promise.all(artistPromises);
        
        // Store the indices of newly created artists
        const newlyCreatedIndices = newArtists.map(artist => artist.originalIndex);
        setCreatedArtistIndices([...createdArtistIndices, ...newlyCreatedIndices]);
        
        toast.success(`${artistResponses.length} artist(s) added successfully!`);
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
        return;
      } finally {
        setIsSubmitting(false);
        setShowLoading(false);
      }
      return; // Exit early to prevent default next step behavior
    }

    if (currentStep === 7) {
      // Step 7: Additional Info - move to Step 8 (Template Selection)
      setCurrentStep(currentStep + 1);
      return;
    }

    if (currentStep < 8) {
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

    // Check if we have backend event ID
    if (!backendEventId) {
      toast.error("Please complete Step 1 first to create the event");
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error(`File is too large. Maximum size is 10MB. Your file: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      return;
    }

    try {
      setUploadingCover(true);
      setLoadingMessage("Uploading cover image...");
      setShowLoading(true);
      
      console.log("📸 Uploading flyer image immediately...");
      
      // Upload to backend using new uploadFlyerImage API
      const response = await uploadFlyerImage(backendEventId, file);
      
      console.log("📦 Flyer upload response:", JSON.stringify(response, null, 2));
      
      // Update with backend URL
      const responseData = response.data || response;
      if (responseData.flyerImage || responseData.url) {
        const imageUrl = responseData.flyerImage || responseData.url;
        setCoverImage(imageUrl);
        setCoverImageFile(null); // Clear file object
        console.log("✅ Flyer image uploaded:", imageUrl);
        toast.success("Cover image uploaded successfully!");
      } else {
        console.error("❌ No flyerImage in response!");
        console.error("   Response structure:", Object.keys(responseData));
        toast.error("Image uploaded but couldn't load URL. Please refresh.");
      }
      
      setImagesChanged(true);
      setRemoveFlyerImage(false);
      
    } catch (error) {
      console.error("Failed to upload flyer image:", error);
      toast.error("Failed to upload cover image. Please try again.");
      setCoverImage(null); // Clear preview on error
    } finally {
      setUploadingCover(false);
      setShowLoading(false);
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

    // Check file types and sizes
    const validFiles = [];
    const invalidFiles = [];

    for (const file of files) {
      if (!file.type.match('image.*')) {
        invalidFiles.push(file.name);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        invalidFiles.push(`${file.name} (too large)`);
        continue;
      }
      validFiles.push(file);
    }

    if (invalidFiles.length > 0) {
      toast.error(`Invalid files (${invalidFiles.join(', ')}) - Only images under 5MB are allowed`);
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
      setShowLoading(true);
      
      console.log(`📸 Uploading ${validFiles.length} gallery image(s) immediately...`);
      console.log(`📋 Current state: ${galleryImages.length} existing in backend`);
      
      // Upload to backend using new uploadGalleryImages API
      const response = await uploadGalleryImages(backendEventId, validFiles);
      
      console.log("📦 Gallery upload response:", JSON.stringify(response, null, 2));
      
      const responseData = response.data || response;
      
      // Backend returns images in 'images' array with id and url
      if (responseData.images && Array.isArray(responseData.images)) {
        const galleryImagesData = responseData.images.filter(img => img.type === 'EVENT_GALLERY');
        const newImageUrls = galleryImagesData.map(img => img.url);
        const newImageIdMap = {};
        
        galleryImagesData.forEach(img => {
          newImageIdMap[img.url] = img.id; // Map URL to ID for deletion
        });
        
        // Combine existing images with new ones
        const updatedGalleryImages = [...galleryImages, ...newImageUrls];
        const updatedImageIdMap = { ...galleryImageIds, ...newImageIdMap };
        
        // Update state with the combined arrays
        setExistingGalleryUrls(updatedGalleryImages);
        setGalleryImages(updatedGalleryImages);
        setGalleryImageIds(updatedImageIdMap);
        setGalleryImageFiles([]);
        
        console.log(`✅ Added ${newImageUrls.length} new gallery images`);
        console.log(`📋 Total: ${updatedGalleryImages.length} gallery images`);
        console.log("📋 Updated Image ID map:", updatedImageIdMap);
        toast.success(`${validFiles.length} gallery image(s) uploaded successfully!`);
      }
      // Fallback: backend might return galleryImages array directly with URLs
      else if (responseData.galleryImages && Array.isArray(responseData.galleryImages)) {
        const newImageUrls = responseData.galleryImages.map(img => img.url || img);
        const newImageIdMap = {};
        
        responseData.galleryImages.forEach(img => {
          if (img.id && img.url) {
            newImageIdMap[img.url] = img.id;
          }
        });
        
        // Combine existing images with new ones
        const updatedGalleryImages = [...galleryImages, ...newImageUrls];
        const updatedImageIdMap = { ...galleryImageIds, ...newImageIdMap };
        
        // Update state with the combined arrays
        setExistingGalleryUrls(updatedGalleryImages);
        setGalleryImages(updatedGalleryImages);
        setGalleryImageIds(updatedImageIdMap);
        setGalleryImageFiles([]);
        
        console.log(`✅ Added ${newImageUrls.length} new gallery images (fallback)`);
        console.log(`📋 Total: ${updatedGalleryImages.length} gallery images in UI`);
        toast.success(`${validFiles.length} gallery image(s) uploaded successfully!`);
      } else {
        console.warn("Unexpected response format from server:", responseData);
        toast.error("Unexpected response from server. Please try again.");
      }
    } catch (error) {
      console.error("Failed to upload gallery images:", error);
      toast.error("Failed to upload gallery images. Please try again.");
      // Don't modify the existing gallery on error
    } finally {
      // Reset the file input to allow re-uploading the same file
      if (e.target) {
        e.target.value = '';
      }
      setUploadingGallery(false);
      setShowLoading(false);
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

  const handleArtistPhotoChange = (index, e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newArtists = [...artists];
        if (typeof reader.result === 'string') {
          newArtists[index].photo = reader.result;
          setArtists(newArtists);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const openTicketModal = (type) => {
    setSelectedTicketType(type);
    setTicketModalOpen(true);
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

  const handleSubmit = async (isDraft) => {
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
        template: mapTemplateNameToId(selectedTemplate), // Convert template name to ID for backend
      };

      const response = await updateEventStep6(backendEventId, updateData);
      
      console.log("Step 7 API Response:", response);
      
      // If publishing (not draft), update status to PUBLISHED
      if (!isDraft) {
        console.log("🚀 Publishing event...");
        await publishEvent(backendEventId);
        toast.success("Event published successfully!");
        
        // Clear draft from session storage after publishing
        sessionStorage.removeItem('draftEventId');
        sessionStorage.removeItem('draftStarted');
        sessionStorage.removeItem('deletedImageIds'); // Clear deleted images list
        
        // Reset all tracking states
        setCreatedTicketIds([]);
        setVenueCreated(false);
        setCreatedArtistIndices([]);
        setDeletedImageIds(new Set()); // Clear deleted images
        
        console.log("🗑️ Cleared draft event ID and tracking data from session");
      } else {
        toast.success("Event saved as draft!");
      }
      
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
          status: isDraft ? "DRAFT" : "PUBLISHED",
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
    <div className="min-h-screen flex flex-col bg-muted/30">
      <LoadingOverlay show={showLoading} message={loadingMessage} />
      <Header isAuthenticated userRole="organizer" />

      <main className="flex-1 py-8">
        <div className="container max-w-4xl">
          {/* Back Button and Clear Draft */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            {backendEventId && !isEditMode && currentStep === 1 && (
              <Button
                variant="outline"
                size="sm"
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
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h1 className="text-2xl font-bold">
                    {isEditMode ? "Update Event" : "Create New Event"}
                  </h1>
                  {selectedEventTypeCategory && (
                    <Badge variant="secondary" className="text-sm">
                      {selectedEventTypeCategory}
                    </Badge>
                  )}
                  {eventId && !isEditMode && (
                    <Badge variant="outline" className="text-xs font-mono">
                      ID: {eventId}
                    </Badge>
                  )}
                  {backendEventId && !isEditMode && (
                    <Badge variant="secondary" className="text-xs">
                      📝 Draft
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">
                  Step {currentStep} of 8: {steps[currentStep - 1].title}
                </p>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between mt-4">
                {steps.map((step) => (
                  <div
                    key={step.number}
                    className={`flex items-center gap-2 text-sm ${
                      step.number === currentStep
                        ? "text-primary font-semibold"
                        : step.number < currentStep
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                        step.number < currentStep
                          ? "bg-primary border-primary text-primary-foreground"
                          : step.number === currentStep
                          ? "border-primary"
                          : "border-muted-foreground"
                      }`}
                    >
                      {step.number < currentStep ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        step.number
                      )}
                    </div>
                    <span className="hidden md:inline">{step.title}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Step Content */}
          <Card>
            <CardHeader>
              <CardTitle>{steps[currentStep - 1].title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Event Details */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="eventTitle">Event Title *</Label>
                    <Input
                      id="eventTitle"
                      placeholder="Enter event title"
                      value={eventTitle}
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
                      <SelectTrigger>
                        <SelectValue placeholder="Select main category" />
                      </SelectTrigger>
                      <SelectContent>
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
                        <SelectTrigger>
                          <SelectValue placeholder="Select subcategory" />
                        </SelectTrigger>
                        <SelectContent>
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
                      onChange={(e) => {
                        setEventDescription(e.target.value);
                        if (backendEventId) setTextFieldsChanged(true);
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Images */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground mb-4">
                    Upload cover image and gallery images for your event. Images will be uploaded immediately.
                  </div>

                  {/* Cover Image Section */}
                  <div className="space-y-2">
                    <Label htmlFor="cover-image">Cover Image *</Label>
                    <div className="space-y-3">
                      <Input 
                        id="cover-image" 
                        type="file" 
                        accept="image/*" 
                        onChange={handleCoverImageChange}
                        className="cursor-pointer"
                        disabled={uploadingCover || !backendEventId}
                      />
                      <p className="text-xs text-muted-foreground">
                        Recommended size: 1920x1080px. Max file size: 10MB
                      </p>
                      
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

                  {/* Gallery Images Section */}
                  <div className="space-y-2">
                    <Label htmlFor="gallery">Gallery Images (optional)</Label>
                    <div className="space-y-3">
                      <Input 
                        id="gallery" 
                        type="file" 
                        accept="image/*" 
                        multiple 
                        onChange={handleGalleryImagesChange}
                        className="cursor-pointer"
                        disabled={uploadingGallery || !backendEventId}
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
              )}

              {/* Step 3: Date & Time */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Starting Date *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => {
                          setStartDate(e.target.value);
                          // Auto-adjust end date if it's before start date
                          if (endDate && e.target.value > endDate) {
                            setEndDate(e.target.value);
                          }
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="startTime">Starting Time *</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="endDate">Ending Date *</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={endDate}
                        min={startDate || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="endTime">Ending Time *</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Tickets */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="text-sm text-muted-foreground">
                    Select ticket types to add for your event
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* VIP Guest List Card */}
                    <Card 
                      className="group hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary"
                      onClick={() => openTicketModal("vip-guest")}
                    >
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
                            <Users className="w-6 h-6 text-primary" />
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
                      className="group hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary"
                      onClick={() => openTicketModal("standard")}
                    >
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
                            <Ticket className="w-6 h-6 text-primary" />
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
                      className="group hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary"
                      onClick={() => openTicketModal("table")}
                    >
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
                            <Table2 className="w-6 h-6 text-primary" />
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
                      className="group hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary"
                      onClick={() => openTicketModal("group-pass")}
                    >
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
                            <UsersRound className="w-6 h-6 text-primary" />
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

              {/* Step 5: Venue & Location */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <div className="relative">
                    <Label htmlFor="venueName">Venue Name *</Label>
                    <Input
                      ref={venueInputRef}
                      id="venueName"
                      placeholder="Search for a venue or location..."
                      value={venueName}
                      onChange={(e) => {
                        setVenueName(e.target.value);
                        setSelectedLocation(null); // Reset selected location when typing
                      }}
                      onFocus={() => {
                        if (locationSuggestions.length > 0) {
                          setShowSuggestions(true);
                        }
                      }}
                      autoComplete="off"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {searchingLocation ? "Searching..." : "Start typing to see location suggestions"}
                    </p>
                    
                    {/* Suggestions Dropdown */}
                    {showSuggestions && locationSuggestions.length > 0 && (
                      <Card className="absolute z-50 w-full mt-1 max-h-64 overflow-y-auto shadow-lg">
                        <CardContent className="p-0">
                          {locationSuggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              className="px-4 py-3 hover:bg-muted cursor-pointer border-b last:border-b-0 transition-colors"
                              onClick={() => handleLocationSelect(suggestion)}
                            >
                              <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {suggestion.displayName.split(',')[0]}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {suggestion.displayName}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        placeholder="Enter city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        placeholder="Enter state"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        placeholder="Enter country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        placeholder="Enter postal code"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="venueContact">Contact Number *</Label>
                      <Input
                        id="venueContact"
                        type="tel"
                        placeholder="Enter contact number"
                        value={venueContact}
                        onChange={(e) => setVenueContact(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="venueEmail">Email *</Label>
                      <Input
                        id="venueEmail"
                        type="email"
                        placeholder="Enter email"
                        value={venueEmail}
                        onChange={(e) => setVenueEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Full Address</Label>
                    <Textarea 
                      id="address" 
                      placeholder="Enter full address" 
                      value={fullAddress}
                      onChange={(e) => setFullAddress(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Map Location</Label>
                    {selectedLocation ? (
                      <div className="space-y-2">
                        {!leafletLoaded ? (
                          <div className="w-full h-64 rounded-lg border border-border overflow-hidden bg-muted flex items-center justify-center">
                            <div className="text-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                              <p className="text-sm text-muted-foreground">Loading map...</p>
                            </div>
                          </div>
                        ) : (
                          <div 
                            ref={mapContainerRef}
                            className="w-full h-64 rounded-lg border border-border overflow-hidden"
                            style={{ minHeight: '256px', backgroundColor: '#f0f0f0' }}
                          />
                        )}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{selectedLocation.displayName}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                        </div>
                      </div>
                    ) : (
                      <div className="border rounded-lg p-8 text-center text-muted-foreground">
                        <MapPin className="mx-auto mb-2" size={32} />
                        <p className="text-sm">Select a location from suggestions to see it on the map</p>
                        <p className="text-xs mt-1">Type at least 3 characters in the venue field</p>
                      </div>
                    )}
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
                      onClick={() => setArtists([...artists, { name: "", photo: "", instagram: "", spotify: "", gender: "PREFER_NOT_TO_SAY" }])}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Artist
                    </Button>
                  </div>

                  {artists.map((artist, index) => (
                    <Card key={index} className="p-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="font-semibold">Artist {index + 1}</h3>
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

                        <div>
                          <Label htmlFor={`artist-name-${index}`}>Artist Name *</Label>
                          <Input
                            id={`artist-name-${index}`}
                            placeholder="Enter artist name"
                            value={artist.name}
                            onChange={(e) => {
                              const newArtists = [...artists];
                              newArtists[index].name = e.target.value;
                              setArtists(newArtists);
                            }}
                          />
                        </div>

                        <div>
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

                        <div>
                          <Label htmlFor={`artist-photo-${index}`}>Artist Photo *</Label>
                          <div className="space-y-3">
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
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`artist-instagram-${index}`}>Instagram *</Label>
                          <Input
                            id={`artist-instagram-${index}`}
                            placeholder="Enter Instagram handle"
                            value={artist.instagram}
                            onChange={(e) => {
                              const newArtists = [...artists];
                              newArtists[index].instagram = e.target.value;
                              setArtists(newArtists);
                            }}
                          />
                        </div>

                        <div>
                          <Label htmlFor={`artist-spotify-${index}`}>Spotify (Optional)</Label>
                          <Input
                            id={`artist-spotify-${index}`}
                            placeholder="Enter Spotify URL"
                            value={artist.spotify}
                            onChange={(e) => {
                              const newArtists = [...artists];
                              newArtists[index].spotify = e.target.value;
                              setArtists(newArtists);
                            }}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Step 7: Additional Information */}
              {currentStep === 7 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="terms">Terms & Conditions</Label>
                    <div className="border border-input rounded-md">
                      <ReactQuill
                        theme="snow"
                        value={termsAndConditions}
                        onChange={setTermsAndConditions}
                        placeholder="Enter any terms and conditions..."
                        modules={{
                          toolbar: [
                            ['bold', 'italic', 'underline'],
                            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                            [{ 'color': [] }, { 'background': [] }],
                            [{ 'size': ['small', false, 'large', 'huge'] }],
                            ['clean']
                          ]
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Advisory</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="smokingAllowed"
                          checked={advisory.smokingAllowed}
                          onCheckedChange={(checked) => setAdvisory({ ...advisory, smokingAllowed: !!checked })}
                        />
                        <Label htmlFor="smokingAllowed" className="cursor-pointer font-normal text-sm">
                          🚬 Smoking allowed
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="drinkingAllowed"
                          checked={advisory.drinkingAllowed}
                          onCheckedChange={(checked) => setAdvisory({ ...advisory, drinkingAllowed: !!checked })}
                        />
                        <Label htmlFor="drinkingAllowed" className="cursor-pointer font-normal text-sm">
                          🍺 Drinking allowed
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="petsAllowed"
                          checked={advisory.petsAllowed}
                          onCheckedChange={(checked) => setAdvisory({ ...advisory, petsAllowed: !!checked })}
                        />
                        <Label htmlFor="petsAllowed" className="cursor-pointer font-normal text-sm">
                          🐾 Pets allowed
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="ageRestricted"
                          checked={advisory.ageRestricted}
                          onCheckedChange={(checked) => setAdvisory({ ...advisory, ageRestricted: !!checked })}
                        />
                        <Label htmlFor="ageRestricted" className="cursor-pointer font-normal text-sm">
                          🔞 Show is 18+
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="camerasAllowed"
                          checked={advisory.camerasAllowed}
                          onCheckedChange={(checked) => setAdvisory({ ...advisory, camerasAllowed: !!checked })}
                        />
                        <Label htmlFor="camerasAllowed" className="cursor-pointer font-normal text-sm">
                          📸 Cameras and photos allowed
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="outsideFoodAllowed"
                          checked={advisory.outsideFoodAllowed}
                          onCheckedChange={(checked) => setAdvisory({ ...advisory, outsideFoodAllowed: !!checked })}
                        />
                        <Label htmlFor="outsideFoodAllowed" className="cursor-pointer font-normal text-sm">
                          🍔 Outside food & drinks allowed
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="seatingProvided"
                          checked={advisory.seatingProvided}
                          onCheckedChange={(checked) => setAdvisory({ ...advisory, seatingProvided: !!checked })}
                        />
                        <Label htmlFor="seatingProvided" className="cursor-pointer font-normal text-sm">
                          🪑 Seating provided
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="wheelchairAccessible"
                          checked={advisory.wheelchairAccessible}
                          onCheckedChange={(checked) => setAdvisory({ ...advisory, wheelchairAccessible: !!checked })}
                        />
                        <Label htmlFor="wheelchairAccessible" className="cursor-pointer font-normal text-sm">
                          ♿ Wheelchair accessible venue
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="liveMusic"
                          checked={advisory.liveMusic}
                          onCheckedChange={(checked) => setAdvisory({ ...advisory, liveMusic: !!checked })}
                        />
                        <Label htmlFor="liveMusic" className="cursor-pointer font-normal text-sm">
                          🎵 Live music
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="parkingAvailable"
                          checked={advisory.parkingAvailable}
                          onCheckedChange={(checked) => setAdvisory({ ...advisory, parkingAvailable: !!checked })}
                        />
                        <Label htmlFor="parkingAvailable" className="cursor-pointer font-normal text-sm">
                          🚗 Parking available
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="reentryAllowed"
                          checked={advisory.reentryAllowed}
                          onCheckedChange={(checked) => setAdvisory({ ...advisory, reentryAllowed: !!checked })}
                        />
                        <Label htmlFor="reentryAllowed" className="cursor-pointer font-normal text-sm">
                          🔁 Re-entry allowed
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="onsitePayments"
                          checked={advisory.onsitePayments}
                          onCheckedChange={(checked) => setAdvisory({ ...advisory, onsitePayments: !!checked })}
                        />
                        <Label htmlFor="onsitePayments" className="cursor-pointer font-normal text-sm">
                          💳 On-site payments available
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="securityCheck"
                          checked={advisory.securityCheck}
                          onCheckedChange={(checked) => setAdvisory({ ...advisory, securityCheck: !!checked })}
                        />
                        <Label htmlFor="securityCheck" className="cursor-pointer font-normal text-sm">
                          👮 Security check at entry
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="cloakroom"
                          checked={advisory.cloakroom}
                          onCheckedChange={(checked) => setAdvisory({ ...advisory, cloakroom: !!checked })}
                        />
                        <Label htmlFor="cloakroom" className="cursor-pointer font-normal text-sm">
                          🧥 Cloakroom available
                        </Label>
                      </div>
                    </div>
                    
                    {/* Custom Advisories Section */}
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Custom Advisory</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setCustomAdvisories([...customAdvisories, ""])}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Custom Advisory
                        </Button>
                      </div>
                      
                      {customAdvisories.length > 0 && (
                        <div className="space-y-2">
                          {customAdvisories.map((advisory, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Input
                                placeholder="Enter custom advisory..."
                                value={advisory}
                                onChange={(e) => {
                                  const newAdvisories = [...customAdvisories];
                                  newAdvisories[index] = e.target.value;
                                  setCustomAdvisories(newAdvisories);
                                }}
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setCustomAdvisories(customAdvisories.filter((_, i) => i !== index));
                                }}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Custom Questions for Attendees</Label>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Input 
                          placeholder="Question (e.g., Dietary requirements?)" 
                          value={newQuestion}
                          onChange={(e) => setNewQuestion(e.target.value)}
                        />
                        <Textarea
                          placeholder="Answer (optional - organizer can provide default answer)"
                          value={newAnswer}
                          onChange={(e) => setNewAnswer(e.target.value)}
                          rows={2}
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            if (newQuestion.trim()) {
                              setCustomQuestions([...customQuestions, { question: newQuestion, answer: newAnswer }]);
                              setNewQuestion("");
                              setNewAnswer("");
                              toast.success("Question added");
                            } else {
                              toast.error("Please enter a question");
                            }
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Question
                        </Button>
                      </div>
                      
                      {customQuestions.length > 0 && (
                        <div className="space-y-3 mt-4">
                          {customQuestions.map((q, index) => (
                            <Card key={index}>
                              <CardContent className="pt-4">
                                <div className="flex justify-between items-start gap-2">
                                  <div className="flex-1 space-y-1">
                                    <p className="font-medium text-sm">Q: {q.question}</p>
                                    {q.answer && (
                                      <p className="text-sm text-muted-foreground">A: {q.answer}</p>
                                    )}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setCustomQuestions(customQuestions.filter((_, i) => i !== index));
                                      toast.success("Question removed");
                                    }}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Organizer Notes (Private)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any internal notes..."
                      rows={3}
                      value={organizerNote}
                      onChange={(e) => setOrganizerNote(e.target.value)}
                    />
                  </div>
                </>
              )}

              {/* Step 8: Template Selection */}
              {currentStep === 8 && (() => {
                const listingTemplates = Object.values(TEMPLATE_CONFIGS);
                const detailTemplates = Object.values(DETAIL_TEMPLATE_CONFIGS);
                const selectedListingConfig = getTemplateConfig(selectedTemplate, "listing");
                const selectedDetailConfig = getTemplateConfig(selectedTemplate, "detail");
                
                return (
                <div className="space-y-6">
                  <div className="text-sm text-muted-foreground mb-4">
                    Choose a template design for your event. This affects both the events listing page and the event detail page. Preview how your event will look with each template below. All templates show the same information but with completely different UI structures and designs.
                  </div>

                  {/* Template Selection Cards */}
                  <div className="grid md:grid-cols-3 gap-6">
                    {listingTemplates.map((template) => {
                      const isSelected = selectedTemplate === template.name;
                      const config = template.layoutConfig;
                      
                      return (
                        <div
                          key={template.id}
                          className={`relative border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                            isSelected
                              ? "border-primary shadow-lg scale-105"
                              : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => setSelectedTemplate(template.name)}
                        >
                          <div 
                            className="aspect-[16/9] relative"
                            style={{
                              background: `linear-gradient(135deg, ${config.theme.primaryColor}20, ${config.theme.secondaryColor}20)`,
                            }}
                          >
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-center p-4">
                                <div 
                                  className="w-16 h-16 mx-auto mb-2 rounded-lg flex items-center justify-center"
                                  style={{ backgroundColor: `${config.theme.primaryColor}30` }}
                                >
                                  <div 
                                    className="w-12 h-12 rounded"
                                    style={{ backgroundColor: `${config.theme.primaryColor}50` }}
                                  ></div>
                                </div>
                                <p className="text-xs font-semibold">{template.displayName}</p>
                              </div>
                            </div>
                            {isSelected && (
                              <div className="absolute top-2 right-2">
                                <div 
                                  className="w-6 h-6 rounded-full flex items-center justify-center"
                                  style={{ backgroundColor: config.theme.primaryColor }}
                                >
                                  <Check className="w-4 h-4 text-white" />
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="p-4 bg-background">
                            <h4 className="font-semibold mb-2">{template.displayName}</h4>
                            <p className="text-xs text-muted-foreground">
                              {template.description}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1">
                              <Badge variant="outline" className="text-xs">
                                Listing: {template.layoutConfig.sections.grid.columns === 3 ? "Grid" : template.layoutConfig.sections.grid.columns === "masonry" ? "Masonry" : "List"}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                Detail: {getTemplateConfig(template.name, "detail").displayName}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Live Previews Section */}
                  <div className="mt-8 space-y-6">
                    <h3 className="text-lg font-semibold">Preview: How Your Event Will Look</h3>
                    <p className="text-sm text-muted-foreground">
                      See how your event will appear with each template. Click on a template above to see its preview below.
                    </p>

                    {/* Template Previews */}
                    {selectedTemplate && (() => {
                      const listingConfig = selectedListingConfig.layoutConfig;
                      const detailConfig = selectedDetailConfig.layoutConfig;
                      
                      return (
                      <>
                        {/* Listing Page Preview */}
                        <Card className="border-2 border-primary">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Check className="w-5 h-5 text-primary" />
                              {selectedListingConfig.displayName} - Events Listing Page Preview
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">
                              This is how your event will appear on the events listing page
                            </p>
                          </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {/* Preview Header */}
                            <div 
                              className="text-primary-foreground p-4 rounded-lg"
                              style={{
                                background: `linear-gradient(135deg, ${listingConfig.theme.primaryColor}, ${listingConfig.theme.secondaryColor})`,
                              }}
                            >
                              <h4 className="text-xl font-bold mb-2">Browse Events</h4>
                              <p className="text-primary-foreground/90">Discover amazing events happening near you</p>
                            </div>
                            
                            {/* Preview Event Card */}
                            <div className="border rounded-lg overflow-hidden">
                              {coverImage ? (
                                <div className="relative h-32 overflow-hidden">
                                  <img src={coverImage} alt="Preview" className="w-full h-full object-cover" />
                                  <div className="absolute top-2 left-2">
                                    <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm text-xs">
                                      {mainCategory || "Category"}
                                    </Badge>
                                  </div>
                                </div>
                              ) : (
                                <div className="h-32 bg-muted flex items-center justify-center">
                                  <p className="text-xs text-muted-foreground">Cover Image</p>
                                </div>
                              )}
                              <div className="p-4">
                                <h5 className="font-bold text-base mb-2 line-clamp-1">
                                  {eventTitle || "Your Event Title"}
                                </h5>
                                <div className="space-y-1 text-xs text-muted-foreground mb-3">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>{startDate ? new Date(startDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "Date TBA"}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    <span className="line-clamp-1">{city && state ? `${city}, ${state}` : "Location TBA"}</span>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span 
                                    className="text-sm font-bold"
                                    style={{ color: listingConfig.theme.primaryColor }}
                                  >
                                    {savedTickets.length > 0 ? `From ₹${Math.min(...savedTickets.map(t => Number(t.price) || 0).filter(p => p > 0))}` : "Free"}
                                  </span>
                                  <Button 
                                    size="sm" 
                                    className="text-xs"
                                    style={{ 
                                      backgroundColor: listingConfig.theme.accentColor,
                                      color: "white"
                                    }}
                                  >
                                    View Details
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground italic">
                              {selectedListingConfig.layoutConfig.sections.grid.columns === 3 
                                ? "This is how your event will appear in a 3-column grid layout with other events."
                                : selectedListingConfig.layoutConfig.sections.grid.columns === "masonry"
                                ? "This is how your event will appear in a Pinterest-style masonry column layout."
                                : "This is how your event will appear in a horizontal list layout with sidebar filters."}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Event Detail Page Preview */}
                      <Card className="border-2 border-primary mt-4">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Check className="w-5 h-5 text-primary" />
                            {selectedDetailConfig.displayName} - Event Detail Page Preview
                          </CardTitle>
                          <p className="text-xs text-muted-foreground mt-1">
                            This is how your event detail page will look when users click to view full details
                          </p>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {/* Preview Hero Section */}
                            {detailConfig.sections.hero.style === "full-width-image" && (
                              <>
                                {coverImage ? (
                                  <div className="relative h-48 overflow-hidden rounded-lg">
                                    <img src={coverImage} alt="Preview" className="w-full h-full object-cover" />
                                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                                      <h4 className="text-xl font-bold text-white mb-1">
                                        {eventTitle || "Your Event Title"}
                                      </h4>
                                      <div className="flex items-center gap-3 text-sm text-white/90">
                                        <span>{startDate ? new Date(startDate).toLocaleDateString("en-US", { month: "long", day: "numeric" }) : "Date"}</span>
                                        <span>•</span>
                                        <span>{city && state ? `${city}, ${state}` : "Location"}</span>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div 
                                    className="h-48 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: `${detailConfig.theme.primaryColor}20` }}
                                  >
                                    <p className="text-xs text-muted-foreground">Cover Image</p>
                                  </div>
                                )}
                              </>
                            )}
                            
                            {detailConfig.sections.hero.style === "overlay-content" && (
                              <div 
                                className="relative h-32 rounded-lg overflow-hidden"
                                style={{
                                  background: `linear-gradient(135deg, ${detailConfig.theme.primaryColor}, ${detailConfig.theme.secondaryColor})`,
                                }}
                              >
                                <div className="absolute inset-0 bg-black/20" />
                                <div className="relative h-full flex items-center justify-center p-4">
                                  <div className="text-center text-white">
                                    <h4 className="text-lg font-bold mb-1">{eventTitle || "Your Event Title"}</h4>
                                    <p className="text-sm text-white/90">{city && state ? `${city}, ${state}` : "Location"}</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {detailConfig.sections.hero.style === "minimal-header" && (
                              <div className="border-b pb-3">
                                <Badge 
                                  className="mb-2"
                                  style={{ backgroundColor: `${detailConfig.theme.primaryColor}20`, color: detailConfig.theme.primaryColor }}
                                >
                                  {mainCategory || "Category"}
                                </Badge>
                                <h4 className="text-xl font-bold">{eventTitle || "Your Event Title"}</h4>
                              </div>
                            )}

                            {/* Preview Content Sections */}
                            <div className={`grid ${detailConfig.sections.details.layout === "split-column" ? "md:grid-cols-3" : ""} gap-4`}>
                              <div className={detailConfig.sections.details.layout === "split-column" ? "md:col-span-2" : ""}>
                                <div className="space-y-3">
                                  <div className="p-3 border rounded-lg">
                                    <h5 className="font-semibold text-sm mb-2">Event Description</h5>
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                      {eventDescription || "Your event description will appear here..."}
                                    </p>
                                  </div>
                                  {coverImage && (
                                    <div className="p-3 border rounded-lg">
                                      <h5 className="font-semibold text-sm mb-2">Gallery</h5>
                                      <div className="grid grid-cols-2 gap-2">
                                        <div className="aspect-square bg-muted rounded"></div>
                                        <div className="aspect-square bg-muted rounded"></div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {detailConfig.sections.details.layout === "split-column" && (
                                <div className="md:col-span-1">
                                  <div className="p-3 border rounded-lg sticky top-4">
                                    <h5 className="font-semibold text-sm mb-2">Event Details</h5>
                                    <div className="space-y-2 text-xs">
                                      <div className="flex items-center gap-2">
                                        <Calendar className="w-3 h-3 text-muted-foreground" />
                                        <span>{startDate ? new Date(startDate).toLocaleDateString("en-US", { month: "long", day: "numeric" }) : "Date"}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <MapPin className="w-3 h-3 text-muted-foreground" />
                                        <span>{city && state ? `${city}, ${state}` : "Location"}</span>
                                      </div>
                                      <div className="pt-2 border-t">
                                        <span 
                                          className="font-bold"
                                          style={{ color: detailConfig.theme.primaryColor }}
                                        >
                                          {savedTickets.length > 0 ? `From ₹${Math.min(...savedTickets.map(t => Number(t.price) || 0).filter(p => p > 0))}` : "Free"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <p className="text-xs text-muted-foreground italic">
                              {detailConfig.sections.details.layout === "stacked" 
                                ? "All content sections are stacked vertically in a single column."
                                : detailConfig.sections.details.layout === "split-column"
                                ? "Content is split into main area (left) and sticky sidebar (right)."
                                : "Content is displayed in a centered single column with generous spacing."}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                      </>
                      );
                    })()}
                  </div>

                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-2">
                      Selected Template: <span 
                        className="font-bold capitalize"
                        style={{ color: selectedListingConfig.layoutConfig.theme.primaryColor }}
                      >
                        {selectedListingConfig.displayName}
                      </span>
                    </p>
                    <div className="grid md:grid-cols-2 gap-3 mt-3 text-xs">
                      <div>
                        <p className="font-semibold mb-1">Events Listing Page:</p>
                        <p className="text-muted-foreground">{selectedListingConfig.description}</p>
                      </div>
                      <div>
                        <p className="font-semibold mb-1">Event Detail Page:</p>
                        <p className="text-muted-foreground">{selectedDetailConfig.description}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      This template will be applied to both the events listing page and your event's detail page. The template configuration includes theme colors, layout styles, and animations. You can change it later by editing the event.
                    </p>
                  </div>
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
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentStep < 8 ? (
              <Button onClick={nextStep} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Next"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => handleSubmit(true)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : (isEditMode ? "Save Changes" : "Save as Draft")}
                </Button>
                <Button 
                  variant="accent" 
                  onClick={() => handleSubmit(false)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Publishing..." : (isEditMode ? "Update Event" : "Publish Event")}
                </Button>
              </div>
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
