"use client";
import React, { useState, useEffect } from "react";
import { Drawer } from "@material-tailwind/react";
import { useRouter } from "next/navigation";
import { ToastContainer } from "react-toastify";
// KOMPONEN KAMI
import Sidebar from "@/components/sidebar";
import Konten from "@/app/profilSaya/components/konten";

const ProfileSaya = () => {
  const pengarah = useRouter();
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
      <div className="flex lg:ml-4 w-full">
        <Konten sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </div>
    </section>
  );
};

export default ProfileSaya;
