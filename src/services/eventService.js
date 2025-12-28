import { buildUrl, apiFetch } from "@/config/api";

// -------- Cloudinary Signature + Upload Helpers (internal) --------
async function getCloudinarySignature(folder) {
  // Ensure folder starts with mapmyparty
  const safeFolder = folder && folder.startsWith("mapmyparty") ? folder : "mapmyparty";
  const url = buildUrl(`cloudinary/sign?folder=${encodeURIComponent(safeFolder)}`);
  const res = await fetch(url, { method: "GET", credentials: "include" });
  if (res.status === 429) {
    throw new Error("Upload rate limit reached. Please try again in a few moments.");
  }
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.errorMessage || errJson.message || "Cloudinary not configured");
  }
  return res.json();
}

/**
 * Upload a temp image to Cloudinary before an event exists.
 * Returns { url, publicId, raw } without persisting to backend.
 */
export async function uploadTempImage(file, folderSuffix = "drafts") {
  if (!file || !(file instanceof File)) {
    throw new Error("Valid image file is required");
  }

  const folder = `mapmyparty/${folderSuffix}`;
  const sig = await getCloudinarySignature(folder);
  const uploadJson = await uploadToCloudinary(file, sig);

  const url = uploadJson.secure_url || uploadJson.url;
  const publicId = uploadJson.public_id || uploadJson.publicId;

  return { url, publicId, raw: uploadJson };
}

/**
 * Persist an already-uploaded flyer URL to backend (no Cloudinary upload).
 */
export async function persistFlyerUrl(eventId, flyer) {
  if (!eventId) throw new Error("Event ID is required");
  if (!flyer) throw new Error("Flyer data is required");

  const imageUrl = flyer.imageUrl || flyer.url;
  const publicId = flyer.publicId;

  if (!imageUrl) throw new Error("Flyer imageUrl is required");

  const url = buildUrl(`/api/event/update-flyer/${eventId}`);
  const payload = {
    imageUrl,
    publicId,
    flyerImage: imageUrl,
    url: imageUrl,
  };

  console.log("🔗 Persisting existing flyer URL to backend:", payload);

  const res = await apiFetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return res;
}

async function uploadToCloudinary(file, signaturePayload) {
  const {
    cloudName,
    apiKey,
    timestamp,
    folder,
    signature,
    uploadPreset,
    resourceType = "image",
  } = signaturePayload || {};

  if (!cloudName || !apiKey || !timestamp || !signature || !folder) {
    throw new Error("Missing Cloudinary configuration");
  }

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", apiKey);
  form.append("timestamp", timestamp);
  form.append("folder", folder);
  form.append("signature", signature);
  if (uploadPreset) form.append("upload_preset", uploadPreset);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
  const res = await fetch(uploadUrl, { method: "POST", body: form });
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.error?.message || errJson.message || "Upload failed");
  }
  return res.json();
}

/**
 * Upload Artist Image (Cloudinary direct)
 * Returns normalized shape: { data: { image: <url>, url: <url>, publicId: <id> } }
 */
export async function uploadArtistImage(eventId, file) {
  if (!eventId) throw new Error("Event ID is required");
  if (!file || !(file instanceof File)) throw new Error("Valid artist image file is required");

  const folder = `mapmyparty/events/${eventId}/artists`;

  const sig = await getCloudinarySignature(folder);
  const uploadJson = await uploadToCloudinary(file, sig);

  const secureUrl = uploadJson.secure_url || uploadJson.url;
  const publicId = uploadJson.public_id || uploadJson.publicId;

  return {
    data: {
      image: secureUrl,
      url: secureUrl,
      publicId,
    },
  };
}

/**
 * Persist already-uploaded gallery URLs to backend (no Cloudinary upload).
 */
export async function persistGalleryUrls(eventId, imageUrls) {
  if (!eventId) throw new Error("Event ID is required");
  if (!imageUrls || imageUrls.length === 0) throw new Error("At least one gallery image URL is required");

  const url = buildUrl(`/api/event/${eventId}/images`);
  const payload = { imageUrls };

  console.log("🔗 Persisting existing gallery URLs to backend:", payload);

  const res = await apiFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return res;
}

/**
 * Create event - Step 1: Basic Details
 * 
 * API Endpoint: POST /api/event/create-event
 * 
 * Request Body (FormData):
 * - eventId: string (generated unique ID)
 * - eventType: string (e.g., "Exclusive Event", "Guest List Event", "Non-Exclusive Event")
 * - eventTitle: string (event name)
 * - mainCategory: string (e.g., "Music", "Workshop")
 * - subcategory: string (e.g., "Bollywood", "Hip Hop")
 * - description: string (event description)
 * - flyerImage: File (cover image - will be uploaded to cloud)
 * - galleryImages: File[] (multiple gallery images - will be uploaded to cloud)
 * 
 * Expected Response:
 * {
 *   success: boolean,
 *   eventId: string,
 *   flyerImageUrl: string (cloud URL),
 *   galleryImageUrls: string[] (cloud URLs),
 *   message: string
 * }
 * 
 * @param {Object} eventData - Event data to send
 * @returns {Promise<Object>} Response with event ID and image URLs
 */
export async function createEventStep1(eventData) {
  const url = buildUrl("/api/event/create-event");

  // Backend only allows core fields: title, description, category, subCategory, type (optional)
  const jsonData = {
    title: eventData.eventTitle,
    description: eventData.description || "",
    category: eventData.mainCategory,
    subCategory: eventData.subcategory,
  };

  if (eventData.eventType) {
    jsonData.type = eventData.eventType;
  }

  console.log("📤 Sending as JSON:", jsonData);

  const response = await apiFetch(url, {
    method: "POST",
    body: JSON.stringify(jsonData),
  });

  return response;
}

/**
 * Update event - Step 1: Basic Details (when editing existing event)
 * 
 * API Endpoint: PATCH /api/event/update-event/:eventId
 * 
 * @param {string} eventId - Event ID to update
 * @param {Object} eventData - Event data to update
 * @returns {Promise<Object>} Updated event response
 */
export async function updateEventStep1(eventId, eventData) {
  const url = buildUrl(`/api/event/update-event/${eventId}`);
  console.log("🔄 Updating Event Step 1 - Basic Details");
  console.log("📋 Event ID:", eventId);
  console.log("🔗 Request URL:", url);
  
  // Validate eventId
  if (!eventId) {
    throw new Error("Event ID is required");
  }
  
  // Validate required fields
  if (!eventData.eventTitle || eventData.eventTitle.trim() === "") {
    throw new Error("Event title is required");
  }
  
  // Check if NEW images are included (use FormData) or just JSON
  const hasNewImages = eventData.flyerImage || (eventData.galleryImages && eventData.galleryImages.length > 0);
  
  console.log("📸 Has new images:", hasNewImages);
  
  if (hasNewImages) {
    // Send FormData with images
    const formData = new FormData();
    
    formData.append("title", eventData.eventTitle.trim());
    formData.append("description", eventData.description || "");
    formData.append("category", eventData.mainCategory);
    formData.append("subCategory", eventData.subcategory);
    
    if (eventData.flyerImage) {
      formData.append("flyerImage", eventData.flyerImage);
      console.log("📤 Sending flyer image");
    }
    
    if (eventData.galleryImages && eventData.galleryImages.length > 0) {
      eventData.galleryImages.forEach((image) => {
        formData.append("galleryImages", image);
      });
      console.log("📤 Sending", eventData.galleryImages.length, "gallery images");
    }
    
    const response = await apiFetch(url, {
      method: "PATCH",
      body: formData,
      // Don't set Content-Type - browser will set it with boundary for FormData
    });
    
    console.log("✅ Event Step 1 updated successfully (with images):", response);
    return response;
  } else {
    // Send JSON only (no images changed)
    const jsonData = {
      title: eventData.eventTitle.trim(),
      description: eventData.description || "",
      category: eventData.mainCategory,
      subCategory: eventData.subcategory,
    };

    console.log("📤 Sending JSON only:", JSON.stringify(jsonData, null, 2));

    const response = await apiFetch(url, {
      method: "PATCH",
      body: JSON.stringify(jsonData),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log("✅ Event Step 1 updated successfully:", response);
    return response;
  }
}

/**
 * Upload/Replace Flyer Image
 * 
 * API Endpoint: PATCH /api/event/update-flyer/:id
 * 
 * @param {string} eventId - Event ID
 * @param {File} flyerImage - Flyer image file
 * @returns {Promise<Object>} Response with uploaded image URL
 */
// Upload/Replace Flyer Image (Cloudinary direct)
// Preserves old response shape: { data: { flyerImage: <url>, url: <url>, publicId: <id> } }
export async function uploadFlyerImage(eventId, flyerImage) {
  console.log("📸 Uploading Flyer Image (Cloudinary direct)");
  console.log("📋 Event ID:", eventId);

  if (!eventId) {
    throw new Error("Event ID is required");
  }

  if (!flyerImage || !(flyerImage instanceof File)) {
    throw new Error("Valid flyer image file is required");
  }

  // Preserve folder naming: mapmyparty/events/<eventId>/flyer
  const folder = `mapmyparty/events/${eventId}/flyer`;

  // Helper to persist the uploaded URL to backend DB (keeps old behavior)
  const persistFlyerToBackend = async (imageUrl, publicId) => {
    // Spec: PATCH /api/event/update-flyer/:id expects imageUrl (and publicId)
    const url = buildUrl(`/api/event/update-flyer/${eventId}`);
    const payload = {
      imageUrl,        // primary key per spec
      publicId,
      // Legacy compat (old UI expects these fields to exist on the row)
      flyerImage: imageUrl,
      url: imageUrl,
    };

    console.log("🔗 Persisting flyer URL to backend:", payload);

    const res = await apiFetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return res;
  };

  try {
    const sig = await getCloudinarySignature(folder);
    const uploadJson = await uploadToCloudinary(flyerImage, sig);

    const secureUrl = uploadJson.secure_url || uploadJson.url;
    const publicId = uploadJson.public_id || uploadJson.publicId;

    // Persist to backend DB to match old behavior
    try {
      await persistFlyerToBackend(secureUrl, publicId);
      console.log("✅ Flyer URL persisted to backend");
    } catch (persistErr) {
      console.error("❌ Failed to persist flyer URL to backend:", persistErr);
      throw new Error(persistErr?.message || "Failed to save flyer image. Please try again.");
    }

    const normalized = {
      data: {
        flyerImage: secureUrl,
        url: secureUrl,
        publicId,
      },
    };

    console.log("✅ Flyer image uploaded successfully:", normalized);
    return normalized;
  } catch (error) {
    console.error("❌ Failed to upload flyer image:");
    console.error("   Error message:", error.message);
    throw error;
  }
}

/**
 * Delete Flyer Image
 * 
 * API Endpoint: DELETE /api/event/flyer/:id
 * 
 * @param {string} eventId - Event ID
 * @returns {Promise<Object>} Response confirming deletion
 */
export async function deleteFlyerImage(eventId) {
  const url = buildUrl(`/api/event/flyer/${eventId}`);
  
  console.log("🗑️ Deleting Flyer Image");
  console.log("📋 Event ID:", eventId);
  
  if (!eventId) {
    throw new Error("Event ID is required");
  }
  
  try {
    const response = await apiFetch(url, {
      method: "DELETE",
    });
    
    console.log("✅ Flyer image deleted successfully:", response);
    return response;
  } catch (error) {
    console.error("❌ Failed to delete flyer image:");
    console.error("   Error message:", error.message);
    throw error;
  }
}

/**
 * Upload Gallery Images
 * 
 * API Endpoint: POST /api/event/:id/images
 * 
 * @param {string} eventId - Event ID
 * @param {File[]} galleryImages - Array of gallery image files (1-10 images, JPEG/PNG/WebP/GIF, ≤10MB each)
 * @returns {Promise<Object>} Response with uploaded image URLs
 */
// Upload Gallery Images (Cloudinary direct)
// Preserves old response shape: { data: { images: [ { id, url, type: 'EVENT_GALLERY' } ] } }
export async function uploadGalleryImages(eventId, galleryImages) {
  console.log("📸 Uploading Gallery Images (Cloudinary direct)");
  console.log("📋 Event ID:", eventId);

  if (!eventId) {
    throw new Error("Event ID is required");
  }

  if (!galleryImages || galleryImages.length === 0) {
    throw new Error("At least one gallery image is required");
  }

  if (galleryImages.length > 10) {
    throw new Error("Maximum 10 gallery images allowed");
  }

  // Preserve folder naming: mapmyparty/events/<eventId>/gallery
  const folder = `mapmyparty/events/${eventId}/gallery`;

  try {
    const sig = await getCloudinarySignature(folder);

    const uploads = await Promise.all(
      galleryImages.map(async (image, index) => {
        if (!(image instanceof File)) {
          throw new Error(`Gallery file at index ${index} is not a File`);
        }
        const uploadJson = await uploadToCloudinary(image, sig);
        const secureUrl = uploadJson.secure_url || uploadJson.url;
        const publicId = uploadJson.public_id || uploadJson.publicId;
        return {
          id: publicId, // temporary; will be replaced by DB ID after persist
          url: secureUrl,
          type: "EVENT_GALLERY",
        };
      })
    );

    let backendImages = [];

    // Persist to backend DB
    try {
      const imageUrls = uploads.map((u) => u.url);
      const persistRes = await persistGalleryUrls(eventId, imageUrls);
      // Expect response: { data: { images: [ { id, url, ... } ] } }
      backendImages =
        persistRes?.data?.images ||
        persistRes?.images ||
        persistRes?.data ||
        [];
      console.log("✅ Gallery URLs persisted to backend");
    } catch (persistErr) {
      console.error("❌ Failed to persist gallery URLs to backend:", persistErr);
      throw new Error(persistErr?.message || "Failed to save gallery images. Please try again.");
    }

    // Prefer backend IDs (DB UUID) for delete route compatibility
    const imagesForUi =
      Array.isArray(backendImages) && backendImages.length > 0
        ? backendImages.map((img, idx) => ({
            id: img.id || uploads[idx]?.id, // DB ID preferred
            url: img.url || uploads[idx]?.url,
            type: img.type || "EVENT_GALLERY",
          }))
        : uploads;

    const normalized = {
      data: {
        images: imagesForUi,
      },
    };

    console.log("✅ Gallery images uploaded successfully:", normalized);
    return normalized;
  } catch (error) {
    console.error("❌ Failed to upload gallery images:");
    console.error("   Error message:", error.message);
    throw error;
  }
}

/**
 * Delete Gallery Image
 * 
 * API Endpoint: DELETE /api/event/:eventId/images/:imageId
 * 
 * @param {string} eventId - Event ID
 * @param {string} imageId - Image ID
 * @returns {Promise<Object>} Response confirming deletion
 */
export async function deleteGalleryImage(eventId, imageId) {
  const url = buildUrl(`/api/event/${eventId}/images/${imageId}`);
  
  console.log("🗑️ Deleting Gallery Image");
  console.log("📋 Event ID:", eventId);
  console.log("📋 Image ID:", imageId);
  
  if (!eventId || !imageId) {
    throw new Error("Event ID and Image ID are required");
  }
  
  try {
    const response = await apiFetch(url, {
      method: "DELETE",
    });
    
    console.log("✅ Gallery image deleted successfully:", response);
    return response;
  } catch (error) {
    console.error("❌ Failed to delete gallery image:");
    console.error("   Error message:", error.message);
    throw error;
  }
}

/**
 * Update event - Step 3: Date & Time
 * 
 * API Endpoint: PATCH /api/event/update-event/:eventId
 * 
 * @param {string} eventId - Event ID to update
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated event response
 */
export async function updateEventStep2(eventId, updateData) {
  // Event ID should be in the URL path
  const url = buildUrl(`/api/event/update-event/${eventId}`);

  console.log("🔄 Updating Event Step 2 - Date & Time");
  console.log("📋 Event ID:", eventId);
  console.log("🔗 Request URL:", url);
  console.log("📋 Update Data:", updateData);

  // Validate required fields
  if (!updateData.startDate || !updateData.endDate) {
    throw new Error("Start date and end date are required");
  }

  // Validate date format
  const startDateObj = new Date(updateData.startDate);
  const endDateObj = new Date(updateData.endDate);
  
  if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
    throw new Error("Invalid date format");
  }

  // Prepare update payload (no eventId in body since it's in URL)
  const payload = {
    startDate: updateData.startDate,
    endDate: updateData.endDate,
  };

  console.log("📤 Sending update payload:", JSON.stringify(payload, null, 2));
  console.log("📤 Request body string:", JSON.stringify(payload));
  console.log("📤 Request body length:", JSON.stringify(payload).length);

  const response = await apiFetch(url, {
    method: "PATCH",
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json', // Explicitly set Content-Type
    },
  });

  console.log("✅ Response received:", response);
  return response;
}

/**
 * Create ticket - Step 3: Tickets
 * 
 * API Endpoint: POST /api/ticket/create-ticket
 * 
 * Request Body:
 * - name: string (ticket name)
 * - type: string (GUESTLIST, STANDARD_TICKET, TABLE_TICKET, GROUP_TICKET)
 * - entryType: string (SINGLE_ENTRY, COUPLE_ENTRY)
 * - price: number (ticket price)
 * - totalQty: number (total quantity available)
 * - info: string (ticket description)
 * - eventId: string (UUID from backend)
 * - purchaseExpiry: string (ISO date string)
 * - comingSoon: boolean
 * - onGroundOnly: boolean
 * - maxPerUser: number
 * - gstRate: number (GST rate percentage)
 * 
 * @param {Object} ticketData - Ticket data to send
 * @returns {Promise<Object>} Response with created ticket
 */
export async function createTicket(ticketData) {
  const url = buildUrl("/api/ticket/create-ticket");

  console.log("🎫 Creating Ticket");
  console.log("📋 Ticket Data:", ticketData);

  // Validate required fields
  if (!ticketData.ticketName || ticketData.ticketName.trim() === "") {
    throw new Error("Ticket name is required");
  }

  if (!ticketData.eventId) {
    throw new Error("Event ID is required. Please create event details first.");
  }

  if (!ticketData.quantity || parseInt(ticketData.quantity) <= 0) {
    throw new Error("Valid ticket quantity is required");
  }

  // Map ticket type from frontend to backend format
  const typeMap = {
    "vip-guest": "GUESTLIST",
    "standard": "STANDARD_TICKET",
    "table": "TABLE_TICKET",
    "group-pass": "GROUP_TICKET"
  };

  // Map entry type from frontend to backend format
  const entryTypeMap = {
    "Single": "SINGLE_ENTRY",
    "Couple": "COUPLE_ENTRY"
  };

  // Prepare the request body according to API spec
  const payload = {
    name: ticketData.ticketName.trim(),
    type: typeMap[ticketData.type] || "STANDARD_TICKET",
    entryType: entryTypeMap[ticketData.ticketCategory] || "SINGLE_ENTRY",
    price: parseFloat(ticketData.price) || 0,
    totalQty: parseInt(ticketData.quantity) || 0,
    info: ticketData.description || "",
    eventId: ticketData.eventId, // Backend event ID (UUID)
    purchaseExpiry: ticketData.purchaseExpiry || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Default: 30 days from now
    comingSoon: ticketData.comingSoon || false,
    onGroundOnly: ticketData.onsiteOnly || false,
    maxPerUser: parseInt(ticketData.maxPerCustomer) || 10,
    gstRate: 18.0 // Default GST rate
  };

  console.log("📤 Sending ticket payload:", JSON.stringify(payload, null, 2));

  const response = await apiFetch(url, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  console.log("✅ Ticket created successfully:", response);
  return response;
}

/**
 * Create venue - Step 4: Venue & Location
 * 
 * API Endpoint: POST /api/venue/create
 * 
 * Request Body:
 * - name: string (venue name)
 * - contact: string (contact number)
 * - email: string (email address)
 * - fullAddress: string (complete address)
 * - city: string (city name)
 * - state: string (state name)
 * - country: string (country name)
 * - postalCode: string (postal/zip code)
 * - latitude: number (latitude coordinate)
 * - longitude: number (longitude coordinate)
 * - googlePlaceId: string (optional - Google Place ID)
 * - eventId: string (backend event ID)
 * - isPrimary: boolean (is this the primary venue)
 * 
 * @param {Object} venueData - Venue data to send
 * @returns {Promise<Object>} Response with created venue
 */
export async function createVenue(venueData) {
  const url = buildUrl("/api/venue/create");

  console.log("🏢 Creating Venue");
  console.log("📋 Venue Data:", venueData);

  // Validate required fields
  if (!venueData.name || venueData.name.trim() === "") {
    throw new Error("Venue name is required");
  }

  if (!venueData.eventId) {
    throw new Error("Event ID is required. Please create event details first.");
  }

  // Prepare the request body according to API spec
  const payload = {
    name: venueData.name.trim(),
    contact: venueData.contact || "",
    email: venueData.email || "",
    fullAddress: venueData.fullAddress || "",
    city: venueData.city || "",
    state: venueData.state || "",
    country: venueData.country || "India", // Default country
    postalCode: venueData.postalCode || "",
    latitude: venueData.latitude || 0,
    longitude: venueData.longitude || 0,
    googlePlaceId: venueData.googlePlaceId || "",
    eventId: venueData.eventId, // Backend event ID (UUID)
    isPrimary: venueData.isPrimary !== undefined ? venueData.isPrimary : true,
  };

  console.log("📤 Sending venue payload:", JSON.stringify(payload, null, 2));

  try {
    const response = await apiFetch(url, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log("✅ Venue created successfully - Full response:", response);
    
    // Log the response structure for debugging
    console.log("📊 Response structure:", {
      hasDataProperty: 'data' in response,
      hasVenueProperty: response.data && 'venue' in response.data,
      hasIdProperty: 'id' in response || '_id' in response || 
                   (response.data && ('id' in response.data || '_id' in response.data))
    });
    
    // Return the full response and let the component handle the ID extraction
    return response;
  } catch (error) {
    console.error("❌ Error in createVenue:", error);
    throw error;
  }
}

/**
 * Create artist - Step 5: Add Artist
 * 
 * API Endpoint: POST /api/artist
 * 
 * Request Body:
 * - name: string (artist name)
 * - eventId: string (backend event ID)
 * - gender: string (MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY)
 * - instagramLink: string (Instagram profile URL)
 * - spotifyLink: string (optional - Spotify profile URL)
 * - image: string (artist image URL)
 * 
 * @param {Object} artistData - Artist data to send
 * @returns {Promise<Object>} Response with created artist
 */
export async function createArtist(artistData) {
  const url = buildUrl("/api/artist");

  console.log("🎤 Creating Artist");
  console.log("📋 Artist Data:", artistData);

  // Validate required fields
  if (!artistData.name || artistData.name.trim() === "") {
    throw new Error("Artist name is required");
  }

  if (!artistData.eventId) {
    throw new Error("Event ID is required. Please create event details first.");
  }

  // Prepare the request body according to API spec
  const payload = {
    name: artistData.name.trim(),
    eventId: artistData.eventId, // Backend event ID (UUID)
    gender: artistData.gender || "PREFER_NOT_TO_SAY",
    instagramLink: artistData.instagramLink || "",
    spotifyLink: artistData.spotifyLink || "",
    image: artistData.image || "", // Image URL or base64
    imageUrl: artistData.image || "", // Extra key for backends expecting imageUrl
  };

  console.log("📤 Sending artist payload:", JSON.stringify(payload, null, 2));

  const response = await apiFetch(url, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  console.log("✅ Artist created successfully:", response);
  return response;
}

/**
 * Update event - Step 6: Additional Information
 * 
 * API Endpoint: PATCH /api/event/update-event/:eventId
 * 
 * Request Body:
 * - TC: JSON (Terms & Conditions)
 * - advisory: JSON (Advisory information)
 * - questions: JSON (Custom Q&A)
 * - organizerNote: string (Private organizer notes)
 * 
 * @param {string} eventId - Event ID to update
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated event response
 */
export async function updateEventStep6(eventId, updateData) {
  const url = buildUrl(`/api/event/update-event/${eventId}`);
  
  console.log("📝 Updating Event Step 6 - Additional Information");
  console.log("📋 Event ID:", eventId);
  console.log("🔗 Request URL:", url);
  console.log("📋 Update Data received:", updateData);
  
  // Validate eventId
  if (!eventId) {
    throw new Error("Event ID is required");
  }
  
  // Prepare update payload - only include fields with actual values
  const payload = {};
  
  // Only add TC if it has content
  if (updateData.TC && (Array.isArray(updateData.TC) ? updateData.TC.length > 0 : Object.keys(updateData.TC).length > 0)) {
    payload.TC = updateData.TC;
  }
  
  // Only add advisory if it has content
  if (updateData.advisory && (Array.isArray(updateData.advisory) ? updateData.advisory.length > 0 : Object.keys(updateData.advisory).length > 0)) {
    payload.advisory = updateData.advisory;
  }
  
  // Only add questions if it has content
  if (updateData.questions && Array.isArray(updateData.questions) && updateData.questions.length > 0) {
    payload.questions = updateData.questions;
  }
  
  // Only add organizerNote if it has content
  if (updateData.organizerNote && updateData.organizerNote.trim() !== "") {
    payload.organizerNote = updateData.organizerNote.trim();
  }
  
  // Check if there's anything to update
  if (Object.keys(payload).length === 0) {
    console.log("No valid data to update. Please provide at least one field.");
    return;
  }
  
  console.log("📤 Sending update payload:", JSON.stringify(payload, null, 2));
  console.log("📤 Payload keys:", Object.keys(payload));
  console.log("📤 Request body length:", JSON.stringify(payload).length);
  
  const response = await apiFetch(url, {
    method: "PATCH",
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  console.log("✅ Event Step 6 updated successfully:", response);
  return response;
}

/**
 * Publish event - Update status from DRAFT to PUBLISHED
 * 
 * API Endpoint: PATCH /api/event/update-event/:eventId
 * 
 * @param {string} eventId - Event ID to update
 * @returns {Promise<Object>} Updated event response
 */
export async function publishEvent(eventId) {
  const url = buildUrl(`/api/event/update-event/${eventId}`);
  
  console.log("🚀 Publishing Event");
  console.log("📋 Event ID:", eventId);
  
  // Backend no longer accepts status fields here; publish handled server-side or elsewhere.
  const response = await apiFetch(url, {
    method: "PATCH",
    body: JSON.stringify({}),
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  return response;
}

/**
 * Update an existing venue
 * 
 * API Endpoint: PUT /api/venue/update/:venueId
 * 
 * @param {string} venueId - ID of the venue to update
 * @param {Object} venueData - Venue data to update
 * @returns {Promise<Object>} Response with updated venue
 */
export async function updateVenue(venueId, venueData) {
  const url = buildUrl(`/api/venue/update/${venueId}`);
  
  try {
    console.log('🔄 Sending PUT request to update venue:', url);
    console.log('Venue data being sent:', venueData);
    
    const response = await apiFetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(venueData)
    });
    
    console.log('✅ Venue updated successfully:', response);
    return response;
  } catch (error) {
    console.error('❌ Error updating venue:', error);
    
    if (error.message.includes('401')) {
      throw new Error('Authentication required. Please login again.');
    } else if (error.message.includes('404')) {
      throw new Error('Venue not found.');
    } else if (error.message.includes('403')) {
      throw new Error('You do not have permission to update this venue.');
    }
    
    throw new Error(error.message || 'Failed to update venue. Please try again.');
  }
}

/**
 * Delete a ticket
 * 
 * API Endpoint: DELETE /api/ticket/delete-ticket/:ticketId
 * 
 * @param {string} ticketId - ID of the ticket to delete
 * @returns {Promise<Object>} Response confirming deletion
 */
export async function deleteTicket(ticketId) {
  const url = buildUrl(`/api/ticket/delete-ticket/${ticketId}`);
  
  try {
    const response = await apiFetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('✅ Ticket deleted successfully:', response);
    return response;
  } catch (error) {
    console.error('❌ Error deleting ticket:', error);
    
    // Handle specific error cases
    if (error.message.includes('401')) {
      throw new Error('Authentication required. Please login again.');
    } else if (error.message.includes('404')) {
      throw new Error('Ticket not found or already deleted.');
    } else if (error.message.includes('403')) {
      throw new Error('You do not have permission to delete this ticket.');
    }
    
    throw new Error(error.message || 'Failed to delete ticket. Please try again.');
  }
}

/**
 * Generate a unique event ID
 * @returns {string} Unique event ID
 */
export function generateEventId() {
  return Math.random().toString(36).substring(2, 10);
}
