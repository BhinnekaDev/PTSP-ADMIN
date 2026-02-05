import React from "react";
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
import useTampilkanRiwayatKunjungan from "@/hooks/backend/useTampilkanRiwayatKunjungan";

const ModalLihatRiwayatKunjungan = ({
  terbuka,
  tertutup,
  riwayatKunjunganYangTerpilih,
}) => {
  const { daftarRiwayatKunjungan } = useTampilkanRiwayatKunjungan();
  const gambarBawaan = require("@/assets/images/profil.jpg");

  const riwayatKunjunganTerpilih = daftarRiwayatKunjungan.find(
    (riwayatKunjungan) => riwayatKunjungan.id === riwayatKunjunganYangTerpilih
  );

  if (!riwayatKunjunganTerpilih) {
    return (
      <Dialog open={terbuka} handler={tertutup} size="xl" className="mx-4">
        <DialogHeader className="text-black">
          Lihat Riwayat Kunjungan
        </DialogHeader>
        <DialogBody>
          <p className="text-gray-500 text-center">
            Data Riwayat Kunjungan tidak ditemukan.
          </p>
        </DialogBody>
      </Dialog>
    );
  }

  const file = riwayatKunjunganTerpilih.Lampiran_Kunjungan;
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

        <DialogHeader className="text-black">
          Lihat Riwayat Kunjungan
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
                  <Image
                    src={file}
                    alt="Gambar Riwayat Kunjungan"
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
                  Dokumen Riwayat Kunjungan tidak tersedia
                </p>
              )}
            </div>

            <div className="flex flex-col items-center">
              <Image
                alt="Gambar Profil"
                className="w-24 h-24 border-4 border-blue-500 rounded-full shadow-lg transition-transform duration-300 hover:scale-105"
                src={riwayatKunjunganTerpilih.pengguna?.Foto || gambarBawaan}
                width={96}
                height={96}
              />
              <div className="text-center mt-3">
                <h2 className="text-2xl font-bold text-blue-900">
                  {riwayatKunjunganTerpilih.pengguna?.Nama_Lengkap}
                </h2>
                <p className="text-blue-700">
                  {riwayatKunjunganTerpilih.pengguna?.Email}
                </p>
              </div>
            </div>
          </div>

          <table className="mt-4 w-full min-w-max table-fixed text-left">
            <thead>
              <tr>
                <th
                  // key={konten}
                  className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4"
                >
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal leading-none opacity-70"
                  >
                    Pengunjung
                  </Typography>
                </th>
                <th
                  // key={konten}
                  className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4"
                >
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal leading-none opacity-70"
                  >
                    Instansi
                  </Typography>
                </th>
                <th
                  // key={konten}
                  className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4"
                >
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
              <>
                <tr>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Image
                        // src={transaksiTerpilih.pengguna?.Foto || gambarBawaan}
                        // alt={
                        //   transaksiTerpilih.pengguna?.Nama_Lengkap ||
                        //   "Tidak ada nama"
                        // }
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div className="flex flex-col">
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {/* {transaksiTerpilih.pengguna?.Nama_Lengkap ||
                            "Tidak ada nama"} */}
                          Saya
                        </Typography>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal opacity-70"
                        >
                          {/* {transaksiTerpilih.pengguna?.Email ||
                            "Tidak ada email"} */}{" "}
                          Saya@gmail.com
                        </Typography>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal opacity-70"
                    >
                      {/* {transaksiTerpilih.ajukan?.Nama_Ajukan ||
                        "Tidak ada nama ajukan"} */}{" "}
                      Meteorologi
                    </Typography>
                  </td>

                  <td className="p-4">
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal"
                    >
                      {/* {formatTanggal(
                        transaksiTerpilih.ajukan?.Tanggal_Pembuatan_Ajukan
                      ) || "Tidak ada tanggal ajukan"} */}{" "}
                      50
                    </Typography>
                  </td>
                </tr>
              </>
            </tbody>
          </table>

          <table className="mt-4 w-full min-w-max text-left table-fixed">
            <thead>
              <tr>
                <th
                  // key={konten}
                  className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4"
                >
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal leading-none opacity-70"
                  >
                    Jam Berkunjung
                  </Typography>
                </th>
                <th
                  // key={konten}
                  className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4"
                >
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal leading-none opacity-70"
                  >
                    Tanggal Kunjungan
                  </Typography>
                </th>
                <th
                  // key={konten}
                  className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4"
                >
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
              <>
                <tr>
                  <td className="p-4">
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal"
                    >
                      {/* {transaksiTerpilih.pengguna?.Nama_Lengkap ||
                            "Tidak ada nama"} */}
                      14.30
                    </Typography>
                  </td>

                  <td className="p-4">
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal opacity-70"
                    >
                      {/* {transaksiTerpilih.ajukan?.Nama_Ajukan ||
                        "Tidak ada nama ajukan"} */}{" "}
                      16/02/2026
                    </Typography>
                  </td>

                  <td className="p-4">
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal"
                    >
                      {/* {formatTanggal(
                        transaksiTerpilih.ajukan?.Tanggal_Pembuatan_Ajukan
                      ) || "Tidak ada tanggal ajukan"} */}{" "}
                      3648683463
                    </Typography>
                  </td>
                </tr>
              </>
            </tbody>
          </table>

          <table className="mt-4 w-full min-w-max text-left table-fixed">
            <thead>
              <tr>
                <th
                  // key={konten}
                  className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4"
                >
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal leading-none opacity-70"
                  >
                    Tujuan Berkunjung
                  </Typography>
                </th>
                <th
                  // key={konten}
                  className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4"
                >
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
              <>
                <tr>
                  <td className="p-4">
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal"
                    >
                      {/* {transaksiTerpilih.pengguna?.Nama_Lengkap ||
                            "Tidak ada nama"} */}
                      NGOPI
                    </Typography>
                  </td>

                  <td className="p-4">
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal opacity-70"
                    >
                      {/* {transaksiTerpilih.ajukan?.Nama_Ajukan ||
                        "Tidak ada nama ajukan"} */}{" "}
                      LESGOW
                    </Typography>
                  </td>
                </tr>
              </>
            </tbody>
          </table>
        </DialogBody>
      </div>
    </Dialog>
  );
};

export default ModalLihatRiwayatKunjungan;
