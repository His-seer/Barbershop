"use client";
import { useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loader2, Upload, X, Image as ImageIcon } from "lucide-react";
import clsx from "clsx";

interface ImageUploadProps {
    bucketName: string;
    currentImage?: string | null;
    onUploadComplete: (url: string) => void;
    className?: string;
    folderPath?: string; // e.g. "avatars" or "banners"
}

export function ImageUpload({
    bucketName,
    currentImage,
    onUploadComplete,
    className,
    folderPath = ""
}: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentImage || null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith("image/")) {
            setError("Please select an image file");
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            setError("Image size should be less than 5MB");
            return;
        }

        setError(null);
        setIsUploading(true);

        // Create preview immediately
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);

        try {
            // Create unique filename
            const fileExt = file.name.split('.').pop() || 'png';
            const fileName = `${folderPath ? `${folderPath}/` : ''}${crypto.randomUUID()}.${fileExt}`;

            const { data, error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from(bucketName)
                .getPublicUrl(fileName);

            onUploadComplete(publicUrl);
        } catch (err: unknown) {
            console.error("Upload error:", err);
            const message = err instanceof Error ? err.message : 'Failed to upload image';
            setError(message);
            setPreview(currentImage || null); // Revert preview
        } finally {
            setIsUploading(false);
        }
    };

    const clearImage = () => {
        setPreview(null);
        onUploadComplete(""); // Notify empty string (removed)
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className={clsx("w-full", className)}>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
            />

            {preview ? (
                <div className="relative rounded-xl overflow-hidden group border border-white/10 bg-white/5 h-48 max-h-48">
                    <img
                        src={preview}
                        alt="Preview"
                        className={clsx(
                            "w-full h-full object-cover transition-opacity",
                            isUploading ? "opacity-50" : "opacity-100"
                        )}
                    />

                    {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
                        </div>
                    )}

                    {!isUploading && (
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white transition-colors"
                                title="Change Image"
                            >
                                <Upload className="w-5 h-5" />
                            </button>
                            <button
                                onClick={clearImage}
                                className="p-2 bg-red-500/20 rounded-full hover:bg-red-500/40 text-red-500 transition-colors"
                                title="Remove Image"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-gold-500/50 hover:bg-white/5 transition-all group h-full min-h-[160px]"
                >
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-gold-500/10 transition-colors">
                        <ImageIcon className="w-6 h-6 text-white/40 group-hover:text-gold-500" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-white group-hover:text-gold-400">Click to upload</p>
                        <p className="text-xs text-white/40 mt-1">PNG, JPG up to 5MB</p>
                    </div>
                    {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
                </div>
            )}
        </div>
    );
}
