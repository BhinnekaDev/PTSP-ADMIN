"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Drawer } from "@material-tailwind/react";
import { useRouter } from "next/navigation";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// KOMPONEN KAMI
const Sidebar = dynamic(() => import("@/components/sidebar"), { ssr: false });
const Napbar = dynamic(() => import("@/components/navbar"), { ssr: false });
const Konten = dynamic(() => import("@/app/beranda/components/konten"), {
  ssr: false,
});

const Beranda = () => {
  const pengarah = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tahunDipilih, setTahunDipilih] = useState("Pilih Tahun");
  const [isDesktop, setIsDesktop] = useState(false);

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
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

  if (!isClient) {
    return null;
  }

  return (
    <section className="lg:p-2 xl:p-4 flex h-screen overflow-hidden bg-[#eff0f3]">
      <ToastContainer />
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

export default Beranda;
