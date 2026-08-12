import { redirect } from "next/navigation";

export default function Home() {
  // Langsung arahkan (redirect) ke halaman login saat web pertama kali dibuka
  redirect("/login");
}
