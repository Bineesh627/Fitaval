/**
 * Centralized Image and Asset URL Resolver
 * 
 * Backend Integration:
 * When connecting to a backend, set VITE_BACKEND_URL or VITE_IMAGE_BASE_URL
 * in your .env file (e.g. VITE_BACKEND_URL=https://api.fitaval.com).
 * Any relative path stored in the database (e.g. "/uploads/trainers/photo.jpg")
 * will automatically resolve to the backend server URL.
 * Absolute external URLs (e.g. S3, Cloudflare R2, Unsplash) pass through unchanged.
 */

const BACKEND_IMAGE_BASE_URL =
  import.meta.env.VITE_IMAGE_BASE_URL || import.meta.env.VITE_BACKEND_URL || '';

export const ASSETS = {
  trainers: {
    alex: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=600&q=80',
    sarah: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=600&q=80',
    vikram: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=600&q=80',
  },
  gym: {
    logo: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80',
    floor: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1200&q=80',
    weights: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1200&q=80',
    cardio: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=1200&q=80',
  },
  placeholder:
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23e2e8f0"/><text x="50" y="55" font-family="sans-serif" font-size="12" fill="%2394a3b8" text-anchor="middle">No Image</text></svg>',
};

/**
 * Resolves an image path or URL.
 * Supports:
 * - Absolute external URLs (e.g. S3, Cloud CDN, Unsplash) -> returned as-is
 * - Data URLs and blob URLs -> returned as-is
 * - Backend relative paths (e.g. "/uploads/trainers/alex.jpg") -> resolved with VITE_IMAGE_BASE_URL
 * - Missing/null inputs -> falls back to placeholder SVG
 *
 * @param {string} [pathOrUrl]
 * @returns {string} Fully resolved image URL
 */
export function getImageUrl(pathOrUrl) {
  if (!pathOrUrl) {
    return ASSETS.placeholder;
  }

  // Already a full URL or data URI
  if (
    pathOrUrl.startsWith('data:') ||
    pathOrUrl.startsWith('blob:') ||
    pathOrUrl.startsWith('http://') ||
    pathOrUrl.startsWith('https://')
  ) {
    return pathOrUrl;
  }

  // Relative path with backend configured
  if (BACKEND_IMAGE_BASE_URL) {
    const cleanBase = BACKEND_IMAGE_BASE_URL.replace(/\/+$/, '');
    const cleanPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
    return `${cleanBase}${cleanPath}`;
  }

  // Relative path fallback
  return pathOrUrl;
}

export default getImageUrl;
