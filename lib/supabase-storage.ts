import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function deleteImageFromStorage(imageUrl: string) {
  try {
    // Extract file path from URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    
    // Find the index of 'product-images' in the path
    const bucketIndex = pathParts.indexOf('product-images');
    if (bucketIndex === -1) return false;
    
    // Get the file path after the bucket name
    const filePath = pathParts.slice(bucketIndex + 1).join('/');
    
    if (!filePath) return false;
    
    // Delete from Supabase storage
    const { error } = await supabase.storage
      .from('product-images')
      .remove([filePath]);
    
    if (error) {
      console.error('Failed to delete image from storage:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
}

export async function deleteMultipleImagesFromStorage(imageUrls: string[]) {
  const deletePromises = imageUrls.map(url => deleteImageFromStorage(url));
  const results = await Promise.allSettled(deletePromises);
  
  const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
  console.log(`Deleted ${successCount}/${imageUrls.length} images from storage`);
  
  return successCount;
}
