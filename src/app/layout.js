// Lokasi: /src/app/layout.js
import { Poppins } from "next/font/google";
import "./globals.css"; // INI WAJIB ADA! Jika hilang, Tailwind tidak akan jalan.

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata = {
  title: "Sistem Pemesanan Labkom",
  description: "Sistem pemesanan dan manajemen Laboratorium Komputer",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body
        className={`${poppins.variable} font-poppins bg-gray-50 text-black-80 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
