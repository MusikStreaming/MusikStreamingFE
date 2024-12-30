/**  
 * Processes a Cloudinary URL to generate a transformed image URL with specified dimensions  
 * @param {string} url - The original Cloudinary URL  
 * @param {number} width - Desired width of the image  
 * @param {number} height - Desired height of the image  
 * @param {string} type - The type/category of the image (e.g., 'artists', 'songs')  
 * @param {string} [format='auto'] - The desired image format (default: 'auto')  
 * @returns {string} The transformed Cloudinary URL  
 */

export function processCloudinaryUrl(url: string, width: number, height: number, type: string) {
  const sanitizedUrl = encodeURI(url.trim());
  const splitUrl = sanitizedUrl.split("/");
  const lastSegment = splitUrl[splitUrl.length - 1];
  const publicId = lastSegment.split(".")[0].replace(/[^a-zA-Z0-9_-]/g, '');
  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/d_misc:default-playlist.jpg/w_${width},h_${height},c_fill/${type}/${publicId}.jpg`;
}