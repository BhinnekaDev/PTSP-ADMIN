import React, { useState } from "react";
import { AiFillEye, AiOutlineUpload } from "react-icons/ai";
import {
  Card,
  CardHeader,
  Typography,
  Button,
  CardBody,
  CardFooter,
  IconButton,
  Tooltip,
  Chip,
} from "@material-tailwind/react";
import Image from "next/image";
// PENGAIT KAMI
import useTampilkanPembayaran from "@/hooks/backend/useTampilkanPembayaran";
import useTampilkanDataPerTahun from "@/hooks/backend/useTampilkanDataPerTahun";
// KOMPONEN KAMI
import ModalSuntingPembayaran from "@/components/modalSuntingPembayaran";
import ModalLihatPembayaran from "@/components/modalLihatPembayaran";
import MemuatRangkaTampilkanTabel from "@/components/memuatRangkaTabel";
// KONSTANTA KAMI
import { formatTanggal } from "@/constants/formatTanggal";
import { bulan } from "@/constants/bulan";
import ModalSuntingVaKadaluwarsa from "@/components/modalSuntingVaKadaluwarsa";

const judulTabel = [
  "Pembeli",
  "Produk",
  "Status",
  "Tanggal Pemesanan",
  "Tanggal Kaluwarsa VA",
  "",
];

function Konten({ tahunDipilih }) {
  const gambarBawaan = require("@/assets/images/profil.jpg");
  const [bukaModalSuntingPembayaran, setBukaModalSuntingPembayaran] =
    useState(false);
  const [bukaModalLihatPembayaran, setBukaModalLihatPembayaran] =
    useState(false);
  const [bukaModalSuntingVaKadaluwarsa, setBukaModalSuntingVaKadaluwarsa] =
    useState(false);
  const [pembuatanTerpilih, setPembuatanTerpilih] = useState(null);
  const [keteranganTerpilih, setKeteranganTerpilih] = useState("");
  const dataBulanTahun = useTampilkanDataPerTahun();
  const {
    sedangMemuatPemesanan,
    daftarPemesanan,
    totalPemesanan,
    halaman,
    ambilHalamanSebelumnya,
    ambilHalamanSelanjutnya,
  } = useTampilkanPembayaran();

  const saringPemesanan = daftarPemesanan.filter((item) => {
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
          <Typography variant="h5" color="blue-gray">
            Daftar Pembayaran
          </Typography>
        </div>
      </CardHeader>

      <CardBody className="overflow-x-scroll lg:overflow-hidden px-0">
        {sedangMemuatPemesanan ? (
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
              {saringPemesanan.filter((pemesanan) =>
                [
                  "Sedang Ditinjau",
                  "Ditolak",
                  "Menunggu Pembayaran",
                  "Menunggu Admin",
                ].includes(pemesanan.Status_Pembayaran)
              ).length > 0 ? (
                saringPemesanan
                  .filter((pemesanan) =>
                    [
                      "Sedang Ditinjau",
                      "Ditolak",
                      "Menunggu Pembayaran",
                      "Menunggu Admin",
                    ].includes(pemesanan.Status_Pembayaran)
                  )
                  .map(
                    (
                      {
                        id,
                        pengguna,
                        Data_Keranjang,
                        Tanggal_Pemesanan,
                        Keterangan,
                        Status_Pembayaran,
                        ajukan,
                      },
                      index
                    ) => {
                      const apakahTerakhir =
                        index === saringPemesanan.length - 1;
                      const kelas = apakahTerakhir
                        ? "p-4"
                        : "p-4 border-b border-blue-gray-50";

                      return (
                        <tr key={id}>
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
                          <td className={kelas}>
                            {Data_Keranjang.map((Data_Keranjang, indeks) => (
                              <Typography
                                key={indeks}
                                variant="small"
                                color="blue-gray"
                                className="font-normal"
                              >
                                {Data_Keranjang.Nama.length > 10
                                  ? Data_Keranjang.Nama.slice(0, 10) + "..."
                                  : Data_Keranjang.Nama}
                              </Typography>
                            ))}
                          </td>

                          <td>
                            <Chip
                              variant="ghost"
                              className="text-center"
                              size="md"
                              value={
                                Status_Pembayaran === "Menunggu Admin"
                                  ? "Request VA Baru"
                                  : ["Sedang Ditinjau", "Ditolak"].includes(
                                      Status_Pembayaran
                                    )
                                  ? Status_Pembayaran
                                  : new Date(ajukan.Tanggal_Kadaluwarsa) <
                                    new Date()
                                  ? "Kedaluwarsa"
                                  : Status_Pembayaran || "Belum ada status"
                              }
                              color={
                                Status_Pembayaran === "Menunggu Admin"
                                  ? "blue"
                                  : Status_Pembayaran === "Ditolak"
                                  ? "deep-orange"
                                  : Status_Pembayaran === "Sedang Ditinjau"
                                  ? "yellow"
                                  : new Date(ajukan.Tanggal_Kadaluwarsa) <
                                    new Date()
                                  ? "blue-gray"
                                  : Status_Pembayaran === "Menunggu Pembayaran"
                                  ? "red"
                                  : "default"
                              }
                            />
                          </td>

                          <td className={kelas}>
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal"
                            >
                              {formatTanggal(Tanggal_Pemesanan)}
                            </Typography>
                          </td>
                          <td className={kelas}>
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal"
                            >
                              {formatTanggal(ajukan.Tanggal_Kadaluwarsa)}
                            </Typography>
                          </td>

                          <td className={kelas}>
                            {Status_Pembayaran === "Ditolak" ? (
                              <Chip
                                variant="ghost"
                                size="sm"
                                value="X"
                                className="text-center"
                              />
                            ) : (
                              <>
                                <Tooltip content="Lihat Selengkapnya">
                                  <IconButton
                                    onClick={() => {
                                      setPembuatanTerpilih(id);
                                      setKeteranganTerpilih(Keterangan || "");
                                      setBukaModalLihatPembayaran(true);
                                    }}
                                    variant="text"
                                  >
                                    <AiFillEye className="h-4 w-4" />
                                  </IconButton>
                                </Tooltip>
                                {![
                                  "Menunggu Pembayaran",
                                  "Menunggu Admin",
                                ].includes(Status_Pembayaran) && (
                                  <Tooltip content="Sunting">
                                    <IconButton
                                      onClick={() => {
                                        setPembuatanTerpilih(id);
                                        setKeteranganTerpilih(Keterangan || "");
                                        setBukaModalSuntingPembayaran(true);
                                      }}
                                      variant="text"
                                    >
                                      <AiOutlineUpload className="h-4 w-4" />
                                    </IconButton>
                                  </Tooltip>
                                )}

                                {Status_Pembayaran === "Menunggu Admin" && (
                                  <Tooltip content="Upload VA Baru">
                                    <IconButton
                                      onClick={() => {
                                        setPembuatanTerpilih(id);
                                        setBukaModalSuntingVaKadaluwarsa(true);
                                      }}
                                      variant="text"
                                    >
                                      <AiOutlineUpload className="h-4 w-4" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    }
                  )
              ) : (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-gray-500">
                    Tidak Ada Data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </CardBody>

      <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4">
        <Typography variant="small" color="blue-gray" className="font-normal">
          Halaman {halaman} dari {Math.ceil(totalPemesanan / 5)}
        </Typography>
        <div className="flex items-center gap-2">
          <Button
            onClick={ambilHalamanSebelumnya}
            variant="outlined"
            size="sm"
            disabled={sedangMemuatPemesanan || halaman === 1}
          >
            Sebelumnya
          </Button>
          <Button
            onClick={ambilHalamanSelanjutnya}
            variant="outlined"
            size="sm"
            disabled={
              sedangMemuatPemesanan || halaman === Math.ceil(totalPemesanan / 5)
            }
          >
            Selanjutnya
          </Button>
        </div>
      </CardFooter>

      <ModalSuntingPembayaran
        terbuka={bukaModalSuntingPembayaran}
        tertutup={setBukaModalSuntingPembayaran}
        pembayaranYangTerpilih={pembuatanTerpilih}
        keterangan={keteranganTerpilih}
      />

      <ModalSuntingVaKadaluwarsa
        terbuka={bukaModalSuntingVaKadaluwarsa}
        tertutup={setBukaModalSuntingVaKadaluwarsa}
        VaYangTerplih={pembuatanTerpilih}
      />

      <ModalLihatPembayaran
        terbuka={bukaModalLihatPembayaran}
        tertutup={setBukaModalLihatPembayaran}
        pembayaranYangTerpilih={pembuatanTerpilih}
        keterangan={keteranganTerpilih}
      />
    </Card>
  );
}

export default Konten;
