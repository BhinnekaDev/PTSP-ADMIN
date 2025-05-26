import React, { useState } from "react";
import { EyeIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
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
import useTampilkanKunjungan from "@/hooks/backend/useTampilkanKunjungan";
import useTampilkanDataPerTahun from "@/hooks/backend/useTampilkanDataPerTahun";
// KOMPONEN KAMI
import ModalSuntingKunjungan from "@/components/modalSuntingKunjungan";
import ModalLihatPengajuanKunjungan from "@/components/modalLihatPengajuanKunjungan";
// KONSTANTA KAMI
import { formatTanggal } from "@/constants/formatTanggal";
import { bulan } from "@/constants/bulan";

const judulTabel = [
  "Pengguna",
  "Instansi",
  "Nomor Telepon",
  "Status",
  "Tanggal Kunjungan",
  "",
];

function Konten({ tahunDipilih }) {
  const gambarBawaan = require("@/assets/images/profil.jpg");
  const [bukaModalSuntingKunjungan, setBukaModalSuntingKunjungan] =
    useState(false);
  const [
    bukaModalLihatPengajuanKunjungan,
    setBukaModalLihatPengajuanKunjungan,
  ] = useState(false);
  const [kunjunganTerpilih, setKunjunganTerpilih] = useState(null);
  const [bukaModalKonfirmasiHapus, setBukaModalKonfirmasiHapus] =
    useState(false);
  const dataBulanTahun = useTampilkanDataPerTahun();
  const {
    halaman,
    totalKunjungan,
    daftarKunjungan,
    ambilHalamanSebelumnya,
    ambilHalamanSelanjutnya,
    sedangMemuatKunjungan,
  } = useTampilkanKunjungan();

  const saringKunjungan = daftarKunjungan.filter((item) => {
    const tanggal =
      item.Tanggal_Pembuatan_Akun ||
      item.Tanggal_Pembuatan ||
      item.Tanggal_Pemesanan ||
      item.Tanggal_Kunjungan;
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
            Daftar Kunjungan
          </Typography>
        </div>
      </CardHeader>

      <CardBody className="overflow-hidden px-0">
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
            {saringKunjungan.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-4 text-center text-blue-gray-500">
                  Tidak Ada Data
                </td>
              </tr>
            ) : (
              saringKunjungan.map(
                (
                  {
                    id,
                    Data_Pengguna,
                    Nama_Instansi,
                    Status_Kunjungan,
                    Tanggal_Kunjungan,
                  },
                  index
                ) => {
                  const apakahTerakhir = index === daftarKunjungan.length - 1;
                  const kelas = apakahTerakhir
                    ? "p-4"
                    : "p-4 border-b border-blue-gray-50";

                  return (
                    <tr key={id}>
                      <td className={kelas}>
                        <div className="flex items-center gap-3">
                          <Image
                            src={Data_Pengguna.Foto || gambarBawaan}
                            alt={Data_Pengguna.Nama_Lengkap}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                          <div className="flex flex-col">
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-medium"
                            >
                              {Data_Pengguna.Nama_Lengkap}
                            </Typography>
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="text-xs opacity-70"
                            >
                              {Data_Pengguna.Email}
                            </Typography>
                          </div>
                        </div>
                      </td>

                      <td className={kelas}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {Nama_Instansi}
                        </Typography>
                      </td>
                      <td className={kelas}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {Data_Pengguna.No_Hp}
                        </Typography>
                      </td>
                      <td className={kelas}>
                        <div className="w-max">
                          <Chip
                            variant="ghost"
                            size="sm"
                            value={Status_Kunjungan || "Belum ada status"}
                            color={
                              Status_Kunjungan === "Diterima"
                                ? "green"
                                : Status_Kunjungan === "Ditolak"
                                ? "red"
                                : Status_Kunjungan === "Sedang Ditinjau"
                                ? "yellow"
                                : "default"
                            }
                          />
                        </div>
                      </td>
                      <td className={kelas}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {formatTanggal(Tanggal_Kunjungan)}
                        </Typography>
                      </td>

                      {/* Aksi */}
                      <td className={kelas}>
                        <Tooltip content="Lihat Selengkapnya">
                          <IconButton
                            onClick={() => {
                              setKunjunganTerpilih(id);
                              setBukaModalLihatPengajuanKunjungan(true);
                            }}
                            variant="text"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip content="Sunting">
                          <IconButton
                            onClick={() => {
                              setKunjunganTerpilih(id);
                              setBukaModalSuntingKunjungan(true);
                            }}
                            variant="text"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </IconButton>
                        </Tooltip>
                      </td>
                    </tr>
                  );
                }
              )
            )}
          </tbody>
        </table>
      </CardBody>

      <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4">
        <Typography variant="small" color="blue-gray" className="font-normal">
          Halaman {halaman} dari {Math.ceil(totalKunjungan / 5)}
        </Typography>
        <div className="flex items-center gap-2">
          <Button
            onClick={ambilHalamanSebelumnya}
            variant="outlined"
            size="sm"
            disabled={sedangMemuatKunjungan || halaman === 1}
          >
            Sebelumnya
          </Button>
          <Button
            onClick={ambilHalamanSelanjutnya}
            variant="outlined"
            size="sm"
            disabled={
              sedangMemuatKunjungan || halaman === Math.ceil(totalKunjungan / 5)
            }
          >
            Selanjutnya
          </Button>
        </div>
      </CardFooter>

      <ModalSuntingKunjungan
        terbuka={bukaModalSuntingKunjungan}
        tertutup={setBukaModalSuntingKunjungan}
        kunjunganYangTerpilih={kunjunganTerpilih}
      />

      <ModalLihatPengajuanKunjungan
        terbuka={bukaModalLihatPengajuanKunjungan}
        tertutup={setBukaModalLihatPengajuanKunjungan}
        kunjunganYangTerpilih={kunjunganTerpilih}
      />
    </Card>
  );
}

export default Konten;
