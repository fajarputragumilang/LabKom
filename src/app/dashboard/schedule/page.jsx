// Lokasi: /src/app/dashboard/schedule/page.jsx
import { MdSchedule } from "react-icons/md";

export default function SchedulePage() {
  return (
    <div className="w-full h-[80vh] flex flex-col items-center justify-center font-poppins animate-fade-in">
      <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
        <MdSchedule className="text-4xl" />
      </div>
      <h1 className="text-2xl font-bold text-black-80 mb-2">Jadwal Lab</h1>
      <p className="text-grey text-center max-w-md">
        Halaman manajemen jadwal lab komputer sedang dalam tahap pengembangan.
      </p>
    </div>
  );
}
