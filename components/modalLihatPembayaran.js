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
import useTampilkanPembayaran from "@/hooks/backend/useTampilkanPembayaran";

const ModalLihatPembayaran = ({
  terbuka,
  tertutup,
  pembayaranYangTerpilih,
}) => {
  const { daftarPemesanan } = useTampilkanPembayaran();
  const gambarBawaan = require("@/assets/images/profil.jpg");
  const [errorGambar, setErrorGambar] = useState({});

  const pembayaranTerpilih = daftarPemesanan.find(
    (pembayaran) => pembayaran.id === pembayaranYangTerpilih,
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

        <DialogHeader className="text-black">Lihat Pembayaran</DialogHeader>

        <div className="absolute top-3 right-3">
          <IconButton
            variant="text"
            color="white"
            onClick={() => tertutup(false)}
            className="text-white hover:bg-transparent"
          >
            <XMarkIcon className="h-6 w-6" />
          </IconButton>
        </div>

        <DialogHeader className="text-white text-lg font-semibold border-b-2 border-gray-300 pb-2">
          Pengajuan
        </DialogHeader>

        <DialogBody
          divider
          className="flex flex-col md:flex-row justify-evenly items-center p-6 bg-white rounded-b-lg"
        >
          {pembayaranTerpilih ? (
            <>
              <div className="flex flex-col items-center mb-4 md:mb-0 w-full">
                {pembayaranTerpilih.transaksi?.Bukti_Pembayaran?.length > 0 ? (
                  pembayaranTerpilih.transaksi.Bukti_Pembayaran.map(
                    (file, index) => (
                      <embed
                        key={index}
                        alt={`Dokumen Pengajuan ${index + 1}`}
                        className="w-full h-[500px] border-4 border-gray-300 rounded-lg transition-transform duration-300 hover:scale-105 shadow-lg mb-4"
                        src={file}
                        type="application/pdf"
                      />
                    ),
                  )
                ) : (
                  <p className="flex items-center gap-2 bg-red-100 border-l-4 border-red-500 text-red-800 text-sm font-medium px-4 py-3 rounded-lg shadow-md">
                    ❗ Menunggu Pembayaran
                  </p>
                )}
              </div>

              {pembayaranTerpilih.transaksi?.Bukti_Pembayaran?.length > 0 && (
                <div className="flex flex-col items-center">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-blue-500 shadow-lg transition-transform duration-300 hover:scale-105 bg-gray-100">
                    <img
                      src={getSumberGambar(pembayaranTerpilih.pengguna)}
                      alt={
                        pembayaranTerpilih.pengguna?.Nama_Lengkap || "Pengguna"
                      }
                      width={96}
                      height={96}
                      className="object-cover w-full h-full"
                      onError={() =>
                        handleErrorGambar(
                          pembayaranTerpilih.pengguna?.id ||
                            pembayaranTerpilih.id,
                        )
                      }
                    />
                    {pembayaranTerpilih.tipePengguna === "perusahaan" && (
                      <div className="absolute bottom-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        Perusahaan
                      </div>
                    )}
                  </div>
                  <div className="text-center mt-3">
                    <h2 className="text-2xl font-bold text-blue-900">
                      {pembayaranTerpilih.pengguna?.Nama_Lengkap || "N/A"}
                      {pembayaranTerpilih.tipePengguna === "perusahaan" && (
                        <span className="text-sm text-blue-500 ml-2">
                          (Perusahaan)
                        </span>
                      )}
                    </h2>
                    <p className="text-blue-700">
                      {pembayaranTerpilih.pengguna?.Email ||
                        "Email tidak tersedia"}
                    </p>
                    <p className="text-blue-700">
                      {pembayaranTerpilih.pengguna?.Jenis_Kelamin ||
                        (pembayaranTerpilih.tipePengguna === "perusahaan"
                          ? "Perusahaan"
                          : "Tidak diketahui")}
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-500 text-center">
              Data pengajuan tidak ditemukan.
            </p>
          )}
        </DialogBody>
      </div>
    </Dialog>
  );
};

export default ModalLihatPembayaran;
