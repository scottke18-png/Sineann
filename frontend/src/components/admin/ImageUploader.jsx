import { useState, useCallback, useRef, useEffect } from "react";
import Cropper from "react-easy-crop";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Slider } from "@/components/ui/slider";
import { UploadCloud, X, Crop as CropIcon, Loader2 } from "lucide-react";

// Build a cropped JPEG blob at fixed output dimensions from the crop pixels.
function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", reject);
    img.setAttribute("crossOrigin", "anonymous");
    img.src = url;
  });
}

async function getCroppedBlob(imageSrc, cropPixels, outW, outH) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#0A0A0A";
  ctx.fillRect(0, 0, outW, outH);
  ctx.drawImage(
    image,
    cropPixels.x, cropPixels.y, cropPixels.width, cropPixels.height,
    0, 0, outW, outH
  );
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/jpeg", 0.92));
}

export default function ImageUploader({ value, onChange, aspect = 3 / 4, label, testId = "image" }) {
  const MIN_ZOOM = 0.4;
  const MAX_ZOOM = 3;
  const [dragging, setDragging] = useState(false);
  const [cropSrc, setCropSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pixels, setPixels] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const objectUrlRef = useRef(null);

  useEffect(() => () => { if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current); }, []);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCropSrc(url);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const onCropComplete = useCallback((_, areaPixels) => setPixels(areaPixels), []);

  const applyCrop = async () => {
    if (!pixels) return;
    setUploading(true);
    try {
      const outH = aspect < 1 ? 1200 : Math.round(1280 / aspect);
      const outW = aspect < 1 ? Math.round(1200 * aspect) : 1280;
      const blob = await getCroppedBlob(cropSrc, pixels, outW, outH);
      const file = new File([blob], `${testId}-${Date.now()}.jpg`, { type: "image/jpeg" });
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/media/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      onChange(data.url);
      toast.success("Image uploaded.");
      closeCrop();
    } catch (err) {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const closeCrop = () => {
    setCropSrc(null);
    if (objectUrlRef.current) { URL.revokeObjectURL(objectUrlRef.current); objectUrlRef.current = null; }
  };

  return (
    <div data-testid={`uploader-${testId}`}>
      {label && <label className="overline block mb-1.5">{label}</label>}

      {value ? (
        <div className="relative inline-block group">
          <div className="border border-white/15 overflow-hidden bg-black" style={{ width: 120, aspectRatio: aspect }}>
            <img src={value} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-3 mt-2">
            <button type="button" onClick={() => fileRef.current?.click()} className="text-[0.7rem] tracking-[0.12em] uppercase text-[#A8A39D] hover:text-[#F5F5F0]" data-testid={`replace-${testId}`}>Replace</button>
            <button type="button" onClick={() => onChange("")} className="text-[0.7rem] tracking-[0.12em] uppercase text-[#A8A39D] hover:text-red-400" data-testid={`remove-${testId}`}>Remove</button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          data-testid={`dropzone-${testId}`}
          className={`flex flex-col items-center justify-center gap-2 border border-dashed px-4 py-7 cursor-pointer transition-colors ${dragging ? "border-wine bg-wine/5" : "border-white/20 hover:border-white/40"}`}
        >
          <UploadCloud size={22} className="text-[#A8A39D]" />
          <p className="text-secondary text-xs text-center">Drag & drop an image, or click to browse</p>
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" className="hidden" data-testid={`file-input-${testId}`}
        onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ""; }} />

      {/* Optional manual URL fallback */}
      <input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="…or paste an image URL"
        data-testid={`url-input-${testId}`}
        className="w-full bg-[#0A0A0A] border border-white/15 px-3 py-2 mt-2 text-xs text-[#A8A39D] placeholder:text-[#5a544f] focus:outline-none focus:border-wine transition-colors"
      />

      {/* Crop overlay */}
      {cropSrc && (
        <div className="fixed inset-0 z-[120] bg-black/90 flex items-center justify-center p-4" data-testid={`crop-overlay-${testId}`}>
          <div className="bg-[#141414] border border-white/10 w-full max-w-3xl">
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
              <p className="flex items-center gap-2 text-[#F5F5F0] text-sm"><CropIcon size={16} /> Position & resize</p>
              <button type="button" onClick={closeCrop} className="text-[#A8A39D] hover:text-[#F5F5F0]"><X size={18} /></button>
            </div>
            <div className="relative w-full bg-black" style={{ height: "60vh", minHeight: 380 }}>
              <Cropper
                image={cropSrc}
                crop={crop}
                zoom={zoom}
                minZoom={MIN_ZOOM}
                maxZoom={MAX_ZOOM}
                aspect={aspect}
                restrictPosition={false}
                zoomSpeed={0.25}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                showGrid={true}
                objectFit="contain"
              />
            </div>
            <div className="px-5 py-4 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="overline">Scale</p>
                  <span className="text-secondary text-xs">{Math.round(zoom * 100)}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-secondary text-xs">−</span>
                  <Slider min={MIN_ZOOM} max={MAX_ZOOM} step={0.01} value={[zoom]} onValueChange={(v) => setZoom(v[0])} data-testid={`zoom-slider-${testId}`} />
                  <span className="text-secondary text-xs">+</span>
                </div>
                <p className="text-[#5a544f] text-[0.65rem] mt-1.5">Drag the slider (or scroll on the image) to make it bigger or smaller. Drag the image to reposition.</p>
              </div>
              <p className="text-secondary text-xs">All images are saved at a uniform {aspect < 1 ? "portrait (3:4)" : "landscape (16:9)"} size so the published page stays consistent.</p>
              <div className="flex gap-3">
                <button type="button" onClick={applyCrop} disabled={uploading} className="bg-wine hover:bg-wine-hover text-[#F5F5F0] px-5 py-2.5 text-[0.75rem] tracking-[0.14em] uppercase transition-colors disabled:opacity-60 flex items-center gap-2" data-testid={`apply-crop-${testId}`}>
                  {uploading ? <><Loader2 size={15} className="animate-spin" /> Uploading…</> : "Apply & Upload"}
                </button>
                <button type="button" onClick={closeCrop} className="border border-white/20 hover:border-white/50 text-[#A8A39D] hover:text-[#F5F5F0] px-5 py-2.5 text-[0.75rem] tracking-[0.14em] uppercase">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
