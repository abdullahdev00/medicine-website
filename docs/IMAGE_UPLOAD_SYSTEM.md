# 📸 Product Image Upload System Documentation

## Overview
Complete image upload system for admin products page with Supabase Storage integration.

## ✅ Features Implemented

### 1. **Image Upload Component**
- **Drag & Drop** support
- **Browse** button for file selection
- **Multiple images** upload (up to 5)
- **Image preview** with thumbnails
- **Delete functionality** for each image
- **Primary image** indicator
- **File validation** (type & size)
- **Upload progress** indicator

### 2. **Storage Integration**
- **Supabase Storage** bucket: `product-images`
- **Public access** enabled
- **Max file size**: 5MB
- **Allowed formats**: JPEG, PNG, WebP, GIF
- **Auto-delete** from storage when removed

### 3. **Database Updates**
- Changed from single `imageUrl` to `images` array
- Supports multiple product images
- Maintains backward compatibility

## 📁 File Structure

```
components/
├── admin/
│   └── ImageUpload.tsx       # Main upload component

lib/
├── supabase-storage.ts        # Storage utilities

app/
├── api/
│   └── admin/
│       ├── products/
│       │   ├── route.ts       # Create product (handles images)
│       │   └── [id]/
│       │       └── route.ts   # Update/Delete (with image cleanup)
│       └── setup-storage/
│           └── route.ts       # Storage bucket setup

docs/
├── IMAGE_UPLOAD_SYSTEM.md     # This documentation
```

## 🚀 Usage

### Admin Products Page

#### Add Product Dialog
```typescript
<ImageUpload
  value={field.value || []}
  onChange={field.onChange}
  maxImages={5}
  disabled={createProductMutation.isPending}
/>
```

#### Edit Product Dialog
```typescript
<ImageUpload
  value={field.value || []}
  onChange={field.onChange}
  maxImages={5}
  disabled={updateProductMutation.isPending}
/>
```

## 🔧 Setup Instructions

### 1. Environment Variables
Ensure these are set in your `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Create Storage Bucket
Run the setup API endpoint once:
```bash
curl -X POST http://localhost:3000/api/admin/setup-storage
```

Or use the script:
```bash
npx tsx scripts/setup-storage-bucket.ts
```

### 3. Bucket Permissions
The bucket is configured with:
- **Public access**: Yes
- **CORS**: Enabled for all origins
- **Max file size**: 5MB per file
- **Allowed MIME types**: image/jpeg, image/png, image/webp, image/gif

## 📊 Data Flow

### Upload Flow
1. User selects/drops images
2. Component validates files (type, size)
3. Upload to Supabase Storage
4. Get public URL
5. Add URL to images array
6. Save to database

### Delete Flow
1. User clicks delete on image
2. Remove from Supabase Storage
3. Remove from local state
4. Update database on save

### Product Delete Flow
1. Get product images before deletion
2. Delete product from database
3. Delete all images from storage
4. Return success

## 🔐 Security

### File Validation
- **Type check**: Only image files allowed
- **Size limit**: 5MB per file
- **Extension check**: .jpg, .jpeg, .png, .webp, .gif

### Storage Security
- **Public bucket**: Images are publicly accessible
- **URL structure**: Predictable but unique filenames
- **Cleanup**: Orphaned images deleted with products

## 🎨 UI Features

### Upload Area
- Drag & drop zone with hover effects
- Click to browse fallback
- Upload progress indicator
- File count display (e.g., "2/5 images uploaded")

### Image Grid
- Responsive grid layout (2-5 columns)
- Hover to show delete button
- Primary image badge
- Fallback for broken images

## 🐛 Error Handling

### Upload Errors
- Invalid file type → Toast notification
- File too large → Toast notification
- Upload failed → Toast with error message
- Network error → Retry mechanism

### Delete Errors
- Storage delete fails → Log error, continue
- Orphaned files → Manual cleanup option

## 📈 Performance

### Optimizations
- **Batch uploads**: Process multiple files efficiently
- **Image compression**: Browser-side before upload (optional)
- **Lazy loading**: Load images as needed
- **CDN delivery**: Supabase Storage uses CDN

### Limits
- **Max 5 images** per product
- **5MB per image** file size
- **Total storage**: Based on Supabase plan

## 🔄 Migration

### From Single Image to Multiple
The system handles backward compatibility:
```typescript
// Old format
{ imageUrl: "single-url.jpg" }

// Automatically converted to
{ images: ["single-url.jpg"] }
```

## 🧪 Testing

### Manual Testing
1. **Upload single image** → Should work
2. **Upload multiple images** → Should work up to 5
3. **Drag & drop** → Should work
4. **Delete image** → Should remove from storage
5. **Edit product** → Should load existing images
6. **Delete product** → Should cleanup all images

### Edge Cases
- Upload 6th image → Show error
- Upload non-image → Show error
- Upload >5MB file → Show error
- Network failure → Show error, allow retry
- Delete last image → Validation error

## 📝 Notes

### Future Enhancements
1. **Image optimization**: Auto-resize large images
2. **Image ordering**: Drag to reorder
3. **Bulk operations**: Select multiple to delete
4. **Image editing**: Crop, rotate, filters
5. **Alt text**: SEO optimization
6. **Lazy loading**: Progressive image loading

### Known Issues
- None currently reported

### Maintenance
- Regularly clean orphaned images
- Monitor storage usage
- Update size limits as needed

## 📞 Support

For issues or questions:
1. Check error logs in browser console
2. Verify Supabase credentials
3. Ensure storage bucket exists
4. Check network connectivity

---

**Last Updated**: October 2024
**Version**: 1.0.0
**Author**: Medicine Website Team
