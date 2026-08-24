// Lokasi: /src/app/dashboard/reports/page.jsx
import { MdInsertChartOutlined } from "react-icons/md";

export default function ReportsPage() {
  return (
    <div className="w-full h-[80vh] flex flex-col items-center justify-center font-poppins animate-fade-in">
      <div className="w-20 h-20 bg-warning/20 text-yellow-600 rounded-full flex items-center justify-center mb-6">
        <MdInsertChartOutlined className="text-4xl" />
      </div>
      <h1 className="text-2xl font-bold text-black-80 mb-2">Laporan</h1>
      <p className="text-grey text-center max-w-md">
        Halaman rekapitulasi data dan laporan pemesanan sedang dalam tahap
        pengembangan.
      </p>
    </div>
  );
}
