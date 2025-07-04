import React, { useState } from "react";
import { EyeIcon } from "@heroicons/react/24/solid";
import {
  Card,
  CardHeader,
  Typography,
  Button,
  CardBody,
  Chip,
  CardFooter,
  IconButton,
  Tooltip,
} from "@material-tailwind/react";
import Image from "next/image";
// PENGAIT KAMI
import useTampilkanTransaksi from "@/hooks/backend/useTampilkanTransaksi";
import useTampilkanDataPerTahun from "@/hooks/backend/useTampilkanDataPerTahun";
// KONSTANTA KAMI
import { formatTanggal } from "@/constants/formatTanggal";
import { formatRupiah } from "@/constants/formatRupiah";
import { bulan } from "@/constants/bulan";
// KOMPONEN KAMI
import ModalLihatRiwayatTransaksi from "@/components/modalLihatRiwayatTransaksi";
import MemuatRangkaTampilkanTabel from "@/components/memuatRangkaTabel";

const judulTabel = [
  "Nomor Surat",
  "Pembeli",
  "Produk",
  "Kuantitas & Total",
  "Status",
  "Jenis",
  "Tanggal Pengisian Transaksi",
  "",
];

function Konten({ tahunDipilih }) {
  const gambarBawaan = require("@/assets/images/profil.jpg");
  const dataBulanTahun = useTampilkanDataPerTahun();
  const [bukaModalLihatRiwayatTransaksi, setBukaModalLihatRiwayatTransaksi] =
    useState(false);
  const [riwayatTransaksiYangDipilih, setRiwayatTransaksiYangDipilih] =
    useState(null);
  const {
    halaman,
    totalTransaksi,
    daftarTransaksi,
    ambilHalamanSebelumnya,
    ambilHalamanSelanjutnya,
    sedangMemuatTransaksi,
  } = useTampilkanTransaksi();

  const saringTransaksi = daftarTransaksi.filter((item) => {
    const tanggal =
      item.Tanggal_Pembuatan_Akun ||
      item.Tanggal_Pembuatan ||
      item.Tanggal_Pemesanan;
    if (!tanggal) return false;
    const dateObj =
      tanggal instanceof Date ? tanggal : new Date(tanggal.seconds * 1000);
    const tahun = dateObj.getFullYear();
    const bulanIndex = dateObj.getMonth();
    if (tahunDipilih === "Pilih Tahun") {
      return true;
    }
    if (!dataBulanTahun || dataBulanTahun.length === 0) {
      return false;
    }
    if (bulanIndex < 0 || bulanIndex >= 12) {
      return false;
    }
    const bulanNama = bulan[bulanIndex];
    const bulanTahunDipilih = `${bulanNama} ${tahun}`;
    return bulanTahunDipilih === tahunDipilih;
  });

  return (
    <Card className="h-full w-full">
      <CardHeader floated={false} shadow={false} className="rounded-none">
        <div className="mb-1 flex items-center justify-between">
          <div>
            <Typography variant="h5" color="blue-gray">
              Daftar Transaksi
            </Typography>
          </div>
        </div>
      </CardHeader>

      <CardBody className="overflow-hidden px-0">
        {sedangMemuatTransaksi ? (
          <MemuatRangkaTampilkanTabel />
        ) : (
          <table className="mt-4 w-full min-w-max table-auto text-left">
            <thead>
              <tr>
                {judulTabel.map((konten) => (
                  <th
                    key={konten}
                    className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4"
                  >
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal leading-none opacity-70"
                    >
                      {konten}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {saringTransaksi.filter(
                (pemesanan) =>
                  pemesanan.Status_Pembayaran === "Lunas" &&
                  pemesanan.Status_Pembuatan === "Selesai Pembuatan"
              ).length === 0 && (
                <tr>
                  <td
                    colSpan="8"
                    className="p-4 text-center text-blue-gray-500"
                  >
                    Tidak Ada Data
                  </td>
                </tr>
              )}
              {saringTransaksi
                .filter(
                  (pemesanan) =>
                    pemesanan.Status_Pembayaran === "Lunas" &&
                    pemesanan.Status_Pembuatan === "Selesai Pembuatan"
                )
                .map(
                  (
                    {
                      id,
                      pengguna,
                      Tanggal_Pemesanan,
                      Total_Harga_Pesanan,
                      Data_Keranjang,
                      ajukan,
                      Status_Pesanan,
                      Status_Pengisian_IKM,
                    },
                    index
                  ) => {
                    const apakahTerakhir = index === daftarTransaksi.length - 1;
                    const kelas = apakahTerakhir
                      ? "p-4"
                      : "p-4 border-b border-blue-gray-50";

                    return (
                      <tr key={id}>
                        {/* Kolom Nomor Surat */}
                        <td className={kelas}>
                          {Data_Keranjang && Data_Keranjang.length > 0 ? (
                            [
                              ...new Set(
                                Data_Keranjang.map((item) => item.Nomor_Surat)
                              ),
                            ].map((nomorSurat, idx) => (
                              <div key={idx} className="flex flex-col mb-2">
                                <Typography
                                  variant="small"
                                  color="blue-gray"
                                  className="font-normal"
                                >
                                  {nomorSurat}
                                </Typography>
                              </div>
                            ))
                          ) : (
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal"
                            >
                              Tidak ada produk
                            </Typography>
                          )}
                        </td>

                        {/* Kolom Pengguna */}
                        <td className={kelas}>
                          <div className="flex items-center gap-3">
                            <Image
                              src={pengguna.Foto || gambarBawaan}
                              alt={pengguna.Nama_Lengkap}
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
                                {pengguna.Nama_Lengkap}
                              </Typography>
                              <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-normal opacity-70"
                              >
                                {pengguna.Email}
                              </Typography>
                            </div>
                          </div>
                        </td>

                        {/* Kolom Produk */}
                        <td className={kelas}>
                          {Data_Keranjang && Data_Keranjang.length > 0 ? (
                            Data_Keranjang.map((dataKeranjang, idx) => (
                              <div key={idx} className="flex flex-col mb-2">
                                <Typography
                                  variant="small"
                                  color="blue-gray"
                                  className="font-normal"
                                >
                                  {dataKeranjang.Jenis_Produk}
                                </Typography>
                              </div>
                            ))
                          ) : (
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal"
                            >
                              Tidak ada produk
                            </Typography>
                          )}
                        </td>

                        {/* Kolom Harga dan Kuantitas */}
                        <td className={kelas}>
                          {Data_Keranjang && Data_Keranjang.length > 0 ? (
                            Data_Keranjang.map((dataKeranjang, idx) => (
                              <div key={idx} className="flex flex-col mb-2">
                                <Typography
                                  variant="small"
                                  color="blue-gray"
                                  className="font-normal opacity-70"
                                >
                                  {dataKeranjang.Kuantitas} Barang
                                </Typography>

                                <Typography
                                  variant="small"
                                  color="blue-gray"
                                  className={`font-normal ${
                                    Total_Harga_Pesanan === "Gratis"
                                      ? "line-through"
                                      : ""
                                  }`}
                                >
                                  {formatRupiah(dataKeranjang.Harga)}
                                </Typography>
                              </div>
                            ))
                          ) : (
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal"
                            >
                              Tidak ada produk
                            </Typography>
                          )}
                        </td>

                        {/* Status Ajuan */}
                        <td className={kelas}>
                          <div className="w-max">
                            <Chip
                              variant="ghost"
                              size="sm"
                              value={
                                Status_Pesanan === "Belum Selesai"
                                  ? "Menunggu IKM"
                                  : Status_Pesanan || "Belum ada status"
                              }
                              color={
                                Status_Pesanan === "Selesai"
                                  ? "green"
                                  : Status_Pesanan === "Belum Selesai"
                                  ? "red"
                                  : "default"
                              }
                            />
                          </div>
                        </td>

                        {/* Jenis Ajuan */}
                        <td className={kelas}>
                          <div className="w-max">
                            <Chip
                              variant="ghost"
                              size="sm"
                              value={ajukan.Jenis_Ajukan || "Belum ada Jenis"}
                              color={
                                ajukan.Jenis_Ajukan === "Gratis"
                                  ? "blue"
                                  : ajukan.Jenis_Ajukan === "Berbayar"
                                  ? "red"
                                  : "default"
                              }
                            />
                          </div>
                        </td>

                        {/* Tanggal Pemesanan */}
                        <td className={`${kelas} text-center`}>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {Status_Pengisian_IKM === "Telah Diisi"
                              ? formatTanggal(Tanggal_Pemesanan)
                              : "-"}
                          </Typography>
                        </td>

                        {/* Tombol Lihat */}
                        <td className={kelas}>
                          {Status_Pengisian_IKM === "Telah Diisi" && (
                            <Tooltip content="Lihat Selengkapnya">
                              <IconButton
                                onClick={() => {
                                  setRiwayatTransaksiYangDipilih(id);
                                  setBukaModalLihatRiwayatTransaksi(true);
                                }}
                                variant="text"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </td>
                      </tr>
                    );
                  }
                )}
            </tbody>
          </table>
        )}
      </CardBody>

      <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4">
        <Typography variant="small" color="blue-gray" className="font-normal">
          Halaman {halaman} dari {Math.ceil(totalTransaksi / 5)}
        </Typography>
        <div className="flex items-center gap-2">
          <Button
            onClick={ambilHalamanSebelumnya}
            variant="outlined"
            size="sm"
            disabled={sedangMemuatTransaksi || halaman === 1}
          >
            Sebelumnya
          </Button>
          <Button
            onClick={ambilHalamanSelanjutnya}
            variant="outlined"
            size="sm"
            disabled={
              sedangMemuatTransaksi || halaman === Math.ceil(totalTransaksi / 5)
            }
          >
            Selanjutnya
          </Button>
        </div>
      </CardFooter>

      <ModalLihatRiwayatTransaksi
        terbuka={bukaModalLihatRiwayatTransaksi}
        tertutup={setBukaModalLihatRiwayatTransaksi}
        riyawatTransaksiYangDipilih={riwayatTransaksiYangDipilih}
      />
    </Card>
  );
}

export default Konten;
