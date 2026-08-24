// Lokasi: /src/app/dashboard/settings/page.jsx
import { MdSettings } from "react-icons/md";

export default function SettingsPage() {
  return (
    <div className="w-full h-[80vh] flex flex-col items-center justify-center font-poppins animate-fade-in">
      <div className="w-20 h-20 bg-gray-200 text-grey rounded-full flex items-center justify-center mb-6">
        <MdSettings className="text-4xl" />
      </div>
      <h1 className="text-2xl font-bold text-black-80 mb-2">Pengaturan</h1>
      <p className="text-grey text-center max-w-md">
        Halaman konfigurasi akun dan sistem sedang dalam tahap pengembangan.
      </p>
    </div>
  );
}
