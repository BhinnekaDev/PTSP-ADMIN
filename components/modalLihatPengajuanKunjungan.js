import React, { useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  IconButton,
  Typography,
} from "@material-tailwind/react";
import Image from "next/image";
import { XMarkIcon } from "@heroicons/react/24/outline";
// PENGAIT KAMI
import useTampilkanKunjungan from "@/hooks/backend/useTampilkanKunjungan";
// KONSTANTA KAMI
import { formatTanggal } from "@/constants/formatTanggal";

const ModalLihatKunjungan = ({ terbuka, tertutup, kunjunganYangTerpilih }) => {
  const { daftarKunjungan } = useTampilkanKunjungan();
  const gambarBawaan = require("@/assets/images/profil.jpg");
  const [errorGambar, setErrorGambar] = useState({});

  const kunjunganTerpilih = daftarKunjungan.find(
    (kunjungan) => kunjungan.id === kunjunganYangTerpilih,
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

  if (!kunjunganTerpilih) {
    return (
      <Dialog open={terbuka} handler={tertutup} size="xl" className="mx-4">
        <DialogHeader className="text-black">
          Lihat Pengajuan Kunjungan
        </DialogHeader>
        <DialogBody>
          <p className="text-gray-500 text-center">
            Data Pengajuan Kunjungan tidak ditemukan.
          </p>
        </DialogBody>
      </Dialog>
    );
  }

  const file = kunjunganTerpilih.Lampiran_Kunjungan;
  const ekstensi = file?.split("?")[0].split(".").pop().toLowerCase();
  const isPdf = ekstensi === "pdf";
  const isImage = ["jpg", "jpeg", "png", "webp"].includes(ekstensi);

  // Ambil data pengguna dari hook atau fallback
  const dataPengguna = kunjunganTerpilih.pengguna || {};

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

        <DialogHeader className="text-black">
          Lihat Pengajuan Kunjungan
        </DialogHeader>

        <DialogBody
          divider
          className="flex flex-col justify-evenly items-center p-6 bg-white rounded-b-lg"
        >
          <div className="flex flex-row justify-evenly w-full mb-8">
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
                    alt="Gambar Pengajuan Kunjungan"
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
                <p className="text-gray-500">
                  Dokumen Pengajuan Kunjungan tidak tersedia
                </p>
              )}
            </div>

            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-blue-500 shadow-lg transition-transform duration-300 hover:scale-105 bg-gray-100">
                <img
                  src={getSumberGambar(dataPengguna)}
                  alt={dataPengguna.Nama_Lengkap || "Pengguna"}
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                  onError={() =>
                    handleErrorGambar(dataPengguna.id || kunjunganTerpilih.id)
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
                  {dataPengguna.Nama_Lengkap || "N/A"}
                  {dataPengguna.tipePengguna === "perusahaan" && (
                    <span className="text-sm text-blue-500 ml-2">
                      (Perusahaan)
                    </span>
                  )}
                </h2>
                <p className="text-blue-700">
                  {dataPengguna.Email || "Email tidak tersedia"}
                </p>
              </div>
            </div>
          </div>

          <table className="mt-4 w-full min-w-max table-fixed text-left">
            <thead>
              <tr>
                <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal leading-none opacity-70"
                  >
                    Pengunjung
                  </Typography>
                </th>
                <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal leading-none opacity-70"
                  >
                    Instansi
                  </Typography>
                </th>
                <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal leading-none opacity-70"
                  >
                    Jumlah Pengunjung
                  </Typography>
                </th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                      <img
                        src={getSumberGambar(dataPengguna)}
                        alt={dataPengguna.Nama_Lengkap || "Pengguna"}
                        width={40}
                        height={40}
                        className="object-cover w-full h-full"
                        onError={() =>
                          handleErrorGambar(
                            dataPengguna.id || kunjunganTerpilih.id,
                          )
                        }
                      />
                    </div>
                    <div className="flex flex-col">
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {dataPengguna.Nama_Lengkap || "Nama tidak tersedia"}
                      </Typography>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal opacity-70"
                      >
                        {dataPengguna.Email || "Email tidak tersedia"}
                      </Typography>
                    </div>
                  </div>
                </td>

                <td className="p-4">
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal"
                  >
                    {kunjunganTerpilih.Stasiun || "Tidak ada instansi"}
                  </Typography>
                </td>

                <td className="p-4">
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal"
                  >
                    {kunjunganTerpilih.Jumlah_Pengunjung || "0"}
                  </Typography>
                </td>
              </tr>
            </tbody>
          </table>

          <table className="mt-4 w-full min-w-max text-left table-fixed">
            <thead>
              <tr>
                <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal leading-none opacity-70"
                  >
                    Jam Berkunjung
                  </Typography>
                </th>
                <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal leading-none opacity-70"
                  >
                    Tanggal Kunjungan
                  </Typography>
                </th>
                <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal leading-none opacity-70"
                  >
                    Nomor Surat Permohonan
                  </Typography>
                </th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td className="p-4">
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal"
                  >
                    {kunjunganTerpilih.Jam_Kunjungan || "Tidak ada jam"}
                  </Typography>
                </td>

                <td className="p-4">
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal"
                  >
                    {formatTanggal(kunjunganTerpilih.Tanggal_Kunjungan) ||
                      "Tidak ada tanggal"}
                  </Typography>
                </td>

                <td className="p-4">
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal"
                  >
                    {kunjunganTerpilih.Nomor_Surat_Permohonan ||
                      "Tidak ada nomor surat"}
                  </Typography>
                </td>
              </tr>
            </tbody>
          </table>

          <table className="mt-4 w-full min-w-max text-left table-fixed">
            <thead>
              <tr>
                <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal leading-none opacity-70"
                  >
                    Tujuan Berkunjung
                  </Typography>
                </th>
                <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal leading-none opacity-70"
                  >
                    Keterangan Tambahan
                  </Typography>
                </th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td className="p-4">
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal"
                  >
                    {kunjunganTerpilih.Tujuan_Berkunjung || "Tidak ada tujuan"}
                  </Typography>
                </td>

                <td className="p-4">
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal"
                  >
                    {kunjunganTerpilih.Keterangan_Tambahan ||
                      "Tidak ada keterangan"}
                  </Typography>
                </td>
              </tr>
            </tbody>
          </table>
        </DialogBody>
      </div>
    </Dialog>
  );
};

export default ModalLihatKunjungan;
