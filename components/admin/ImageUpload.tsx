"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getSupabaseClient } from "@/lib/supabase-client";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  value: (string | File)[];
  onChange: (urls: (string | File)[]) => void;
  maxImages?: number;
  bucketName?: string;
  disabled?: boolean;
  immediateUpload?: boolean; // false = deferred upload on form submit
}

export function ImageUpload({
  value,
  onChange,
  maxImages = 5,
  bucketName = "product-images",
  disabled = false,
  immediateUpload = false, // Default to deferred upload
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Generate preview URLs for Files
  useEffect(() => {
    const urls: string[] = [];
    const cleanup: (() => void)[] = [];
    
    value.forEach((item) => {
      if (typeof item === 'string') {
        urls.push(item);
      } else if (item instanceof File) {
        const url = URL.createObjectURL(item);
        urls.push(url);
        cleanup.push(() => URL.revokeObjectURL(url));
      }
    });
    
    setPreviewUrls(urls);
    
    return () => {
      cleanup.forEach(fn => fn());
    };
  }, [value]);

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const supabase = getSupabaseClient();
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - value.length;
    if (remainingSlots <= 0) {
      toast({
        title: "Maximum images reached",
        description: `You can only upload ${maxImages} images`,
        variant: "destructive",
      });
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    
    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const invalidFiles = filesToUpload.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      toast({
        title: "Invalid file type",
        description: "Please upload only image files (JPEG, PNG, WebP, GIF)",
        variant: "destructive",
      });
      return;
    }

    // Validate file sizes (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = filesToUpload.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      toast({
        title: "File too large",
        description: "Images must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    if (immediateUpload) {
      // Upload immediately
      setIsUploading(true);
      const uploadedUrls: string[] = [];

      for (const file of filesToUpload) {
        const url = await uploadImage(file);
        if (url) {
          uploadedUrls.push(url);
        }
      }

      if (uploadedUrls.length > 0) {
        onChange([...value, ...uploadedUrls]);
        toast({
          title: "Upload successful",
          description: `${uploadedUrls.length} image(s) uploaded successfully`,
        });
      }

      setIsUploading(false);
    } else {
      // Deferred upload - just add Files to value
      onChange([...value, ...filesToUpload]);
      toast({
        title: "Images added",
        description: `${filesToUpload.length} image(s) added. They will be uploaded when you save.`,
      });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled || isUploading) return;
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  }, [disabled, isUploading, value.length, maxImages]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Helper function to upload all Files in value array
  const uploadAllFiles = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    const supabase = getSupabaseClient();
    
    for (const item of value) {
      if (typeof item === 'string') {
        // Already uploaded
        uploadedUrls.push(item);
      } else if (item instanceof File) {
        // Upload file
        const url = await uploadImage(item);
        if (url) {
          uploadedUrls.push(url);
        }
      }
    }
    
    return uploadedUrls;
  };

  // Expose upload function to parent component
  useEffect(() => {
    if (!immediateUpload) {
      (window as any).__uploadProductImages = uploadAllFiles;
    }
    return () => {
      delete (window as any).__uploadProductImages;
    };
  }, [value, immediateUpload]);

  const removeImage = async (index: number) => {
    const item = value[index];
    
    // If it's a URL (already uploaded), delete from storage
    if (typeof item === 'string') {
      const supabase = getSupabaseClient();
      const urlParts = item.split('/');
      const filePath = `products/${urlParts[urlParts.length - 1]}`;
      
      try {
        const { error } = await supabase.storage
          .from(bucketName)
          .remove([filePath]);
        
        if (error) {
          console.error('Delete error:', error);
        }
      } catch (error) {
        console.error('Failed to delete from storage:', error);
      }
    }
    // If it's a File, just remove from array (not uploaded yet)
    
    // Remove from array
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange(newValue);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          "hover:border-primary hover:bg-primary/5",
          disabled || isUploading ? "opacity-50 cursor-not-allowed" : "",
          "dark:border-gray-600 dark:hover:border-primary"
        )}
        onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
          disabled={disabled || isUploading}
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Uploading images...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm font-medium">
              Drag & drop images here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Max {maxImages} images, up to 5MB each
            </p>
            <p className="text-xs text-muted-foreground">
              {value.length}/{maxImages} images uploaded
            </p>
          </div>
        )}
      </div>

      {/* Image Preview Grid */}
      {previewUrls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border bg-gray-50 dark:bg-gray-900">
                <img
                  src={url}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-image.png';
                  }}
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
                disabled={disabled || isUploading}
              >
                <X className="w-3 h-3" />
              </Button>
              {index === 0 && (
                <span className="absolute bottom-1 left-1 bg-primary text-white text-xs px-2 py-1 rounded">
                  Primary
                </span>
              )}
              {value[index] instanceof File && (
                <span className="absolute top-1 right-1 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                  Not uploaded
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
