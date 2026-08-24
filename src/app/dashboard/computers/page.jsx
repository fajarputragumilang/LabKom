// Lokasi: /src/app/dashboard/computers/page.jsx
import { MdComputer } from "react-icons/md";

export default function ComputersPage() {
  return (
    <div className="w-full h-[80vh] flex flex-col items-center justify-center font-poppins animate-fade-in">
      <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mb-6">
        <MdComputer className="text-4xl" />
      </div>
      <h1 className="text-2xl font-bold text-black-80 mb-2">Daftar Komputer</h1>
      <p className="text-grey text-center max-w-md">
        Halaman inventaris dan status perangkat komputer sedang dalam tahap
        pengembangan.
      </p>
    </div>
  );
}
