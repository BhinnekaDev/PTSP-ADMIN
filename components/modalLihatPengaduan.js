import React, { useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  IconButton,
} from "@material-tailwind/react";
import Image from "next/image";
import { XMarkIcon } from "@heroicons/react/24/outline";
// PENGAIT KAMI
import useTampilkanPengaduan from "@/hooks/backend/useTampilkanPengaduan";

const ModalLihatPengaduan = ({ terbuka, tertutup, pengaduanYangTerpilih }) => {
  const { daftarPengaduan } = useTampilkanPengaduan();
  const gambarBawaan = require("@/assets/images/profil.jpg");
  const [errorGambar, setErrorGambar] = useState({});

  const pengaduanTerpilih = daftarPengaduan.find(
    (pengaduan) => pengaduan.id === pengaduanYangTerpilih,
  );

  // Fungsi untuk menangani error gambar
  const handleErrorGambar = (id) => {
    setErrorGambar((prev) => ({ ...prev, [id]: true }));
  };

  // Fungsi untuk mendapatkan sumber gambar yang benar
  const getSumberGambar = (pengguna) => {
    if (!pengguna) return gambarBawaan;

    // PRIORITAS 1: fotoProfil dari hasil penggabungan di hook
    if (pengguna.fotoProfil && !errorGambar[pengguna.id]) {
      return pengguna.fotoProfil;
    }
    // PRIORITAS 2: Foto_URL dari Firestore
    if (pengguna.Foto_URL && !errorGambar[pengguna.id]) {
      return pengguna.Foto_URL;
    }
    // PRIORITAS 3: Field Foto
    if (pengguna.Foto && !errorGambar[pengguna.id]) {
      return pengguna.Foto;
    }
    // PRIORITAS 4: Field photoURL
    if (pengguna.photoURL && !errorGambar[pengguna.id]) {
      return pengguna.photoURL;
    }
    // Default: gambar bawaan
    return gambarBawaan;
  };

  if (!pengaduanTerpilih) {
    return (
      <Dialog open={terbuka} handler={tertutup} size="xl" className="mx-4">
        <DialogHeader className="text-black">Lihat Pengaduan</DialogHeader>
        <DialogBody>
          <p className="text-gray-500 text-center">
            Data Pengaduan tidak ditemukan.
          </p>
        </DialogBody>
      </Dialog>
    );
  }

  const file = pengaduanTerpilih.File_Pengaduan;
  const ekstensi = file?.split("?")[0].split(".").pop().toLowerCase();
  const isPdf = ekstensi === "pdf";
  const isImage = ["jpg", "jpeg", "png", "webp"].includes(ekstensi);

  // Ambil data pengguna
  const dataPengguna = pengaduanTerpilih.pengguna || {};
  const namaPengguna =
    dataPengguna.Nama_Lengkap ||
    pengaduanTerpilih.Nama ||
    "Nama tidak tersedia";
  const emailPengguna =
    dataPengguna.Email || pengaduanTerpilih.Email || "Email tidak tersedia";

  return (
    <Dialog
      open={terbuka}
      handler={tertutup}
      animate={{
        mount: { scale: 1, y: 0 },
        unmount: { scale: 0.9, y: -100 },
      }}
      size="xl"
      className="bg-white max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-4"
    >
      <div className="overflow-scroll h-screen">
        <div className="absolute top-3 right-3">
          <IconButton
            variant="text"
            color="red"
            onClick={() => tertutup(false)}
            className="text-red-500 hover:bg-transparent"
          >
            <XMarkIcon className="h-6 w-6 " />
          </IconButton>
        </div>

        <DialogHeader className="text-black">Lihat Pengaduan</DialogHeader>

        <DialogBody
          divider
          className="flex flex-col md:flex-row justify-evenly items-center p-6 bg-white rounded-b-lg"
        >
          <div className="flex flex-col items-center mb-4 md:mb-0">
            {file ? (
              isPdf ? (
                <embed
                  src={file}
                  type="application/pdf"
                  className="w-80 h-64 border-4 border-gray-300 rounded-lg transition-transform duration-300 hover:scale-105 shadow-lg"
                />
              ) : isImage ? (
                <img
                  src={file}
                  alt="Gambar Pengaduan"
                  width={320}
                  height={240}
                  className="border-4 border-gray-300 rounded-lg transition-transform duration-300 hover:scale-105 shadow-lg"
                />
              ) : (
                <p className="text-red-500">
                  Format file tidak didukung: {file}
                </p>
              )
            ) : (
              <p className="text-gray-500">Dokumen Pengaduan tidak tersedia</p>
            )}
          </div>

          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-blue-500 shadow-lg transition-transform duration-300 hover:scale-105 bg-gray-100">
              <img
                src={getSumberGambar(dataPengguna)}
                alt={namaPengguna}
                width={96}
                height={96}
                className="object-cover w-full h-full"
                onError={() =>
                  handleErrorGambar(dataPengguna.id || pengaduanTerpilih.id)
                }
              />
              {dataPengguna.tipePengguna === "perusahaan" && (
                <div className="absolute bottom-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  Perusahaan
                </div>
              )}
            </div>
            <div className="text-center mt-3">
              <h2 className="text-2xl font-bold text-blue-900">
                {namaPengguna}
                {dataPengguna.tipePengguna === "perusahaan" && (
                  <span className="text-sm text-blue-500 ml-2">
                    (Perusahaan)
                  </span>
                )}
              </h2>
              <p className="text-blue-700">{emailPengguna}</p>
            </div>
          </div>
        </DialogBody>
      </div>
    </Dialog>
  );
};

export default ModalLihatPengaduan;
