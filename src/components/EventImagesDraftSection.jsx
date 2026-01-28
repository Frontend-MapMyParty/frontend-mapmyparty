import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { deleteDraftImage, uploadTempImage } from "@/services/eventService";

export default function EventImagesDraftSection({
  backendEventId,
  ensureBackendEventId,
  basicDetailsFilled,
  fieldClass,
  flyerDraft,
  setFlyerDraft,
  flyerOrigin,
  setFlyerOrigin,
  setRemoveFlyerImage,
  galleryDraft,
  setGalleryDraft,
  galleryOriginByPublicId,
  setGalleryOriginByPublicId,
}) {
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const handleCoverImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingCover(true);
      const id = backendEventId || (await ensureBackendEventId());
      if (!id) return;

      const prevPublicId = flyerDraft?.publicId;
      const prevOrigin = flyerOrigin;

      if (prevPublicId && prevOrigin === "draft") {
        try {
          await deleteDraftImage(prevPublicId, "EVENT_FLYER");
        } catch (err) {
          console.error("Draft flyer delete failed:", err);
        }
      }

      const uploaded = await uploadTempImage(file, "EVENT_FLYER", id);
      if (!uploaded?.url || !uploaded?.publicId) {
        throw new Error("Upload failed: missing url/publicId");
      }

      setFlyerDraft({ url: uploaded.url, publicId: uploaded.publicId });
      setFlyerOrigin("draft");
      setRemoveFlyerImage(false);
    } catch (err) {
      console.error("Cover upload failed:", err);
      toast.error(err?.message || "Failed to upload cover image");
    } finally {
      if (e.target) e.target.value = "";
      setUploadingCover(false);
    }
  };

  const handleRemoveCoverImage = async () => {
    const publicId = flyerDraft?.publicId;
    const origin = flyerOrigin;

    if (!publicId) {
      setFlyerDraft(null);
      setFlyerOrigin(null);
      setRemoveFlyerImage(true);
      return;
    }

    if (origin === "draft") {
      try {
        await deleteDraftImage(publicId, "EVENT_FLYER");
      } catch (err) {
        console.error("Draft flyer delete failed:", err);
      }
      setRemoveFlyerImage(false);
    } else {
      setRemoveFlyerImage(true);
    }

    setFlyerDraft(null);
    setFlyerOrigin(null);
  };

  const handleGalleryImagesChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = [];
    const invalidFiles = [];

    for (const file of files) {
      if (!file.type.match("image.*")) {
        invalidFiles.push(file.name);
        continue;
      }
      validFiles.push(file);
    }

    if (invalidFiles.length > 0) {
      toast.error(`Invalid files (${invalidFiles.join(", ")}) - Only images are allowed`);
      if (validFiles.length === 0) return;
    }

    const currentCount = galleryDraft.length;
    if (currentCount + validFiles.length > 10) {
      toast.error(`Maximum 10 gallery images allowed. You already have ${currentCount} image(s).`);
      return;
    }

    try {
      setUploadingGallery(true);
      const id = backendEventId || (await ensureBackendEventId());
      if (!id) return;

      const uploads = await Promise.all(
        validFiles.map(async (file) => {
          const uploaded = await uploadTempImage(file, "EVENT_GALLERY", id);
          if (!uploaded?.url || !uploaded?.publicId) return null;
          return { url: uploaded.url, publicId: uploaded.publicId };
        })
      );

      const nextItems = uploads.filter(Boolean);
      if (nextItems.length === 0) {
        toast.error("No gallery images were uploaded.");
        return;
      }

      const existingIds = new Set(galleryDraft.map((img) => img.publicId));
      const deduped = nextItems.filter((img) => !existingIds.has(img.publicId));

      if (deduped.length === 0) {
        toast.info("These images are already added.");
        return;
      }

      setGalleryDraft((prev) => [...prev, ...deduped]);
      setGalleryOriginByPublicId((prev) => {
        const next = { ...(prev || {}) };
        deduped.forEach((img) => {
          next[img.publicId] = "draft";
        });
        return next;
      });
    } catch (err) {
      console.error("Gallery upload failed:", err);
      toast.error(err?.message || "Failed to upload gallery images");
    } finally {
      if (e.target) e.target.value = "";
      setUploadingGallery(false);
    }
  };

  const removeGalleryImage = async (index) => {
    const img = galleryDraft[index];
    if (!img) return;

    const origin = galleryOriginByPublicId?.[img.publicId];
    if (origin === "draft") {
      try {
        await deleteDraftImage(img.publicId, "EVENT_GALLERY");
      } catch (err) {
        console.error("Draft gallery delete failed:", err);
      }
    }

    setGalleryDraft((prev) => prev.filter((_, i) => i !== index));
    setGalleryOriginByPublicId((prev) => {
      const next = { ...(prev || {}) };
      delete next[img.publicId];
      return next;
    });
  };

  const coverUrl = flyerDraft?.url || null;

  return (
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
          <p className="text-xs text-muted-foreground">Recommended size: 1920x1080px.</p>
          {!basicDetailsFilled && (
            <p className="text-xs text-amber-400">
              Fill title, category, and subcategory to enable image uploads.
            </p>
          )}

          {uploadingCover && (
            <div className="flex items-center gap-2 text-sm text-primary">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Uploading cover image to cloud...</span>
            </div>
          )}

          {coverUrl && !uploadingCover && (
            <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
              <img src={coverUrl} alt="Cover preview" className="w-full h-full object-cover" />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={handleRemoveCoverImage}
                title="Remove"
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
            Add up to 10 images. Images upload immediately after selection.
          </p>

          {uploadingGallery && (
            <div className="flex items-center gap-2 text-sm text-primary">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Uploading gallery images to cloud...</span>
            </div>
          )}

          {galleryDraft.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {galleryDraft.map((img, index) => (
                <div key={img.publicId || index} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
                  <img src={img.url} alt={`Gallery preview ${index + 1}`} className="w-full h-full object-cover" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeGalleryImage(index)}
                    title="Remove"
                    disabled={uploadingGallery}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {galleryDraft.length > 0 && !uploadingGallery && (
            <p className="text-xs text-success">
              ✅ {galleryDraft.length} image{galleryDraft.length !== 1 ? "s" : ""} uploaded to cloud
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
