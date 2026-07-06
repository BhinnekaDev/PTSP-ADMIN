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
import useTampilkanPengajuan from "@/hooks/backend/useTampilkanPengajuan";
// KONSTANTA KAMI
import { formatTanggal } from "@/constants/formatTanggal";

const ModalLihatPengajuan = ({ terbuka, tertutup, pengajuanYangTerpilih }) => {
  const { daftarPengajuan } = useTampilkanPengajuan();
  const gambarBawaan = require("@/assets/images/profil.jpg");
  const [errorGambar, setErrorGambar] = useState({});

  const pengajuanTerpilih = daftarPengajuan.find(
    (pengajuan) => pengajuan.id === pengajuanYangTerpilih,
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

  // Fungsi untuk mendapatkan warna status
  const getStatusColor = (status) => {
    switch (status) {
      case "Diterima":
        return "text-green-600";
      case "Ditolak":
        return "text-red-600";
      case "Sedang Ditinjau":
        return "text-yellow-600";
      default:
        return "text-blue-gray-600";
    }
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

        <DialogHeader className="text-black">Lihat Pengajuan</DialogHeader>

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
          className="flex flex-col justify-evenly items-center p-6 bg-white rounded-b-lg"
        >
          {pengajuanTerpilih ? (
            <>
              <div className="flex flex-row justify-evenly w-full mb-8">
                <div className="flex flex-col items-center mb-4 md:mb-0">
                  {pengajuanTerpilih.ajukan?.File_Ajukan?.length > 0 ? (
                    pengajuanTerpilih.ajukan.File_Ajukan.map((file, index) => (
                      <div key={index} className="mb-2">
                        <embed
                          alt={`Dokumen Pengajuan ${index + 1}`}
                          className="w-80 h-64 border-4 border-gray-300 rounded-lg transition-transform duration-300 hover:scale-105 shadow-lg"
                          src={file}
                        />
                        <h3
                          className="text-center mt-3 font-semibold text-blue-700 cursor-pointer hover:underline"
                          onClick={() => window.open(file, "_blank")}
                        >
                          {pengajuanTerpilih.ajukan?.Nama_Ajukan ||
                            "Nama ajukan tidak tersedia"}
                        </h3>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">
                      Dokumen ajukan tidak tersedia
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-center">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-blue-500 shadow-lg transition-transform duration-300 hover:scale-105 bg-gray-100">
                    <img
                      src={getSumberGambar(pengajuanTerpilih.pengguna)}
                      alt={
                        pengajuanTerpilih.pengguna?.Nama_Lengkap || "Pengguna"
                      }
                      width={96}
                      height={96}
                      className="object-cover w-full h-full"
                      onError={() =>
                        handleErrorGambar(
                          pengajuanTerpilih.pengguna?.id ||
                            pengajuanTerpilih.id,
                        )
                      }
                    />
                    {pengajuanTerpilih.tipePengguna === "perusahaan" && (
                      <div className="absolute bottom-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        Perusahaan
                      </div>
                    )}
                  </div>
                  <div className="text-center mt-3">
                    <h2 className="text-2xl font-bold text-blue-900">
                      {pengajuanTerpilih.pengguna?.Nama_Lengkap || "N/A"}
                      {pengajuanTerpilih.tipePengguna === "perusahaan" && (
                        <span className="text-sm text-blue-500 ml-2">
                          (Perusahaan)
                        </span>
                      )}
                    </h2>
                    <p className="text-blue-700">
                      {pengajuanTerpilih.pengguna?.Email ||
                        "Email tidak tersedia"}
                    </p>
                    <p className="text-blue-700">
                      {pengajuanTerpilih.pengguna?.Jenis_Kelamin ||
                        (pengajuanTerpilih.tipePengguna === "perusahaan"
                          ? "Perusahaan"
                          : "Tidak diketahui")}
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
                        Pembeli
                      </Typography>
                    </th>
                    <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal leading-none opacity-70"
                      >
                        {pengajuanTerpilih?.tipePengguna === "perusahaan"
                          ? "Alamat Perusahaan"
                          : "Status Pembeli"}
                      </Typography>
                    </th>
                    <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal leading-none opacity-70"
                      >
                        No Telepon
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
                            src={getSumberGambar(pengajuanTerpilih.pengguna)}
                            alt={
                              pengajuanTerpilih.pengguna?.Nama_Lengkap ||
                              "Pengguna"
                            }
                            width={40}
                            height={40}
                            className="object-cover w-full h-full"
                            onError={() =>
                              handleErrorGambar(
                                pengajuanTerpilih.pengguna?.id ||
                                  pengajuanTerpilih.id,
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
                            {pengajuanTerpilih.pengguna?.Nama_Lengkap ||
                              "Tidak ada nama"}
                          </Typography>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal opacity-70"
                          >
                            {pengajuanTerpilih.pengguna?.Email ||
                              "Tidak ada email"}
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
                        {pengajuanTerpilih.tipePengguna === "perusahaan"
                          ? pengajuanTerpilih.pengguna?.Alamat_Perusahaan ||
                            "Tidak ada alamat"
                          : pengajuanTerpilih.pengguna?.Pekerjaan ||
                            "Tidak ada pekerjaan"}
                      </Typography>
                    </td>

                    <td className="p-4">
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {pengajuanTerpilih.pengguna?.No_Hp ||
                          "Tidak ada nomor telepon"}
                      </Typography>
                    </td>
                  </tr>
                </tbody>
              </table>

              <table className="mt-4 w-full min-w-max table-fixed text-left">
                <thead>
                  <tr>
                    <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal leading-none opacity-70"
                      >
                        Nama Produk
                      </Typography>
                    </th>
                    <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal leading-none opacity-70"
                      >
                        Pemilik Produk
                      </Typography>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {pengajuanTerpilih.Data_Keranjang &&
                  pengajuanTerpilih.Data_Keranjang.length > 0 ? (
                    pengajuanTerpilih.Data_Keranjang.map((item, index) => (
                      <tr key={index}>
                        <td className="p-4">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {item.Nama || "Nama produk tidak tersedia"}
                          </Typography>
                        </td>
                        <td className="p-4">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {item.Pemilik || "Pemilik tidak tersedia"}
                          </Typography>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" className="p-4 text-center">
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          Tidak ada produk
                        </Typography>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <table className="mt-4 w-full min-w-max table-fixed text-left">
                <thead>
                  <tr>
                    <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal leading-none opacity-70"
                      >
                        Status
                      </Typography>
                    </th>
                    <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal leading-none opacity-70"
                      >
                        Jenis Pengajuan
                      </Typography>
                    </th>
                    <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal leading-none opacity-70"
                      >
                        Tanggal Pengajuan
                      </Typography>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td className="p-4">
                      <div
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          pengajuanTerpilih.ajukan?.Status_Ajukan === "Diterima"
                            ? "bg-green-100 text-green-700"
                            : pengajuanTerpilih.ajukan?.Status_Ajukan ===
                                "Ditolak"
                              ? "bg-red-100 text-red-700"
                              : pengajuanTerpilih.ajukan?.Status_Ajukan ===
                                  "Sedang Ditinjau"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {pengajuanTerpilih.ajukan?.Status_Ajukan ||
                          "Belum ada status"}
                      </div>
                    </td>

                    <td className="p-4">
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {pengajuanTerpilih.ajukan?.Jenis_Ajukan ||
                          "Belum ada jenis"}
                      </Typography>
                    </td>

                    <td className="p-4">
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {formatTanggal(
                          pengajuanTerpilih.ajukan?.Tanggal_Pembuatan_Ajukan,
                        ) || "Tidak ada tanggal"}
                      </Typography>
                    </td>
                  </tr>
                </tbody>
              </table>
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

export default ModalLihatPengajuan;
