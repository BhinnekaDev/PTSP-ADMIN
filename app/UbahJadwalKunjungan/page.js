"use client";
import { useRouter } from "next/navigation";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// KOMPONEN KAMI
import UbahJadwalKunjungan from "@/app/UbahJadwalKunjungan/components/konten";
import Sidebar from "@/components/sidebar";

const Page = () => {
  const pengarah = useRouter();

  return (
    <section className="p-4 flex h-screen bg-[#eff0f3]">
      <ToastContainer />
      <Sidebar pengarah={pengarah} />
      <div className="flex flex-col flex-1 gap-4 mx-3">
        <UbahJadwalKunjungan />
      </div>
    </section>
  );
};

export default Page;
