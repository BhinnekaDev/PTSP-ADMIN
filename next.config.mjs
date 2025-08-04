/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["firebasestorage.googleapis.com"],
  },
  webpack: (config, { isServer }) => {
    // Handle Firebase Admin untuk server
    if (isServer) {
      config.externals.push({
        "firebase-admin": "commonjs firebase-admin",
        "firebase-admin/app": "commonjs firebase-admin/app",
        "firebase-admin/auth": "commonjs firebase-admin/auth",
        "firebase-admin/firestore": "commonjs firebase-admin/firestore",
      });
    }
    return config;
  },
  serverExternalPackages: ["firebase-admin"],
};

export default nextConfig;
