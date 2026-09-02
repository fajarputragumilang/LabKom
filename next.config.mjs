/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/dashboard", // Hapus atau ganti ini ke '/login'
        permanent: true,
      },
    ];
  },
};
export default nextConfig;
