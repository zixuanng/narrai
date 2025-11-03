/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow data URLs for base64 images from Google Imagen
    dangerouslyAllowSVG: true,
    unoptimized: true, // Required for data URLs
  },
}

module.exports = nextConfig