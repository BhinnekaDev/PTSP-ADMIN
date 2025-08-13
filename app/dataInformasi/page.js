"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer } from "react-toastify";
import { Drawer } from "@material-tailwind/react";
import "react-toastify/dist/ReactToastify.css";
// KOMPONEN KAMI
import Sidebar from "@/components/sidebar";
import Napbar from "@/components/navbar";
import Konten from "@/app/dataInformasi/components/konten";

const DataInformasi = () => {
  const pengarah = useRouter();
  const [tahunDipilih, setTahunDipilih] = useState("Pilih Tahun");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsDesktop(true);
      } else {
        setIsDesktop(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section className="lg:p-2 xl:p-4 flex h-screen overflow-hidden bg-[#eff0f3]">
      {isDesktop && <Sidebar pengarah={pengarah} />}
      {!isDesktop && (
        <Drawer
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          placement="left"
          className="lg:hidden"
        >
          <Sidebar pengarah={pengarah} />
        </Drawer>
      )}
      <ToastContainer />
      <div className="flex flex-col gap-4 lg:ml-4 w-full">
        <Napbar
          tahunDipilih={tahunDipilih}
          setTahunDipilih={setTahunDipilih}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <Konten tahunDipilih={tahunDipilih} />
      </div>
    </section>
  );
};

export default DataInformasi;
