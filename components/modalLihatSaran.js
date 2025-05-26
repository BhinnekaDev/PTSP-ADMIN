import React from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  IconButton,
} from "@material-tailwind/react";
import Image from "next/image";
import { XMarkIcon } from "@heroicons/react/24/outline";
// PENGAIT KAMI
import useTampilkanSaran from "@/hooks/backend/useTampilkanSaran";

const ModalLihatSaran = ({ terbuka, tertutup, saranYangTerpilih }) => {
  const { daftarSaran } = useTampilkanSaran();
  const gambarBawaan = require("@/assets/images/profil.jpg");

  const saranTerpilih = daftarSaran.find(
    (saran) => saran.id === saranYangTerpilih
  );

  if (!saranTerpilih) {
    return (
      <Dialog open={terbuka} handler={tertutup} size="xl" className="mx-4">
        <DialogHeader className="text-black">Lihat Saran</DialogHeader>
        <DialogBody>
          <p className="text-gray-500 text-center">
            Data saran tidak ditemukan.
          </p>
        </DialogBody>
      </Dialog>
    );
  }

  const file = saranTerpilih.File_Saran;
  const ekstensi = file?.split("?")[0].split(".").pop().toLowerCase();
  const isPdf = ekstensi === "pdf";
  const isImage = ["jpg", "jpeg", "png", "webp"].includes(ekstensi);

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

        <DialogHeader className="text-black">Lihat Saran</DialogHeader>

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
                <Image
                  src={file}
                  alt="Gambar saran"
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
              <p className="text-gray-500">Dokumen saran tidak tersedia</p>
            )}
          </div>

          <div className="flex flex-col items-center">
            <Image
              alt="Gambar Profil"
              className="w-24 h-24 border-4 border-blue-500 rounded-full shadow-lg transition-transform duration-300 hover:scale-105"
              src={saranTerpilih.pengguna?.Foto || gambarBawaan}
              width={96}
              height={96}
            />
            <div className="text-center mt-3">
              <h2 className="text-2xl font-bold text-blue-900">
                {saranTerpilih.Nama}
              </h2>
              <p className="text-blue-700">{saranTerpilih.Email}</p>
            </div>
          </div>
        </DialogBody>
      </div>
    </Dialog>
  );
};

export default ModalLihatSaran;
