import React, { useState } from "react";
import { EyeIcon, TrashIcon } from "@heroicons/react/24/solid";
import {
  Card,
  CardHeader,
  Typography,
  Button,
  CardBody,
  CardFooter,
  IconButton,
  Tooltip,
} from "@material-tailwind/react";
import Image from "next/image";
// PENGAIT KAMI
import useTampilkanSaran from "@/hooks/backend/useTampilkanSaran";
import useHapusSaran from "@/hooks/backend/useHapusSaran";
import ModalKonfirmasiHapusSaran from "@/components/modalKonfirmasiHapusSaran";
import useTampilkanDataPerTahun from "@/hooks/backend/useTampilkanDataPerTahun";
// KOMPONEN KAMI
import ModalLihatSaran from "@/components/modalLihatSaran";
// KONSTANTA KAMI
import { formatTanggal } from "@/constants/formatTanggal";
import { bulan } from "@/constants/bulan";

const judulTabel = ["Pengguna", "Saran", "Tanggal", ""];

function Konten({ tahunDipilih }) {
  const gambarBawaan = require("@/assets/images/profil.jpg");
  const [bukaModalLihatSaran, setBukaModalLihatSaran] = useState(false);
  const [saranTerpilih, setSaranTerpilih] = useState(null);
  const { hapusSaran, sedangMemuatHapus } = useHapusSaran();
  const [bukaModalKonfirmasiHapus, setBukaModalKonfirmasiHapus] =
    useState(false);
  const dataBulanTahun = useTampilkanDataPerTahun();
  const {
    halaman,
    totalSaran,
    daftarSaran,
    ambilHalamanSebelumnya,
    ambilHalamanSelanjutnya,
    sedangMemuatSaran,
  } = useTampilkanSaran();

  const konfirmasiHapusSaran = () => {
    console.log("Menjalankan konfirmasi hapus untuk ID:", saranTerpilih);
    if (saranTerpilih) {
      hapusSaran(saranTerpilih);
      setBukaModalKonfirmasiHapus(false);
    } else {
      toast.error("Tidak ada pengajuan yang dipilih untuk dihapus.");
    }
  };

  const saringSaran = daftarSaran.filter((item) => {
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
            Daftar Saran
          </Typography>
        </div>
      </CardHeader>

      <CardBody className="overflow-x-scroll lg:overflow-hidden px-0">
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
            {saringSaran.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-4 text-center text-blue-gray-500">
                  Tidak Ada Data
                </td>
              </tr>
            ) : (
              daftarSaran.map(
                (
                  { id, pengguna, Email, Nama, Saran, Tanggal_Pembuatan },
                  index
                ) => {
                  const apakahTerakhir = index === daftarSaran.length - 1;
                  const kelas = apakahTerakhir
                    ? "p-4"
                    : "p-4 border-b border-blue-gray-50";

                  return (
                    <tr key={id}>
                      {/* Foto dan Nama */}
                      <td className={kelas}>
                        <div className="flex items-center gap-3">
                          <Image
                            src={pengguna?.Foto || gambarBawaan}
                            alt={Nama}
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
                              {Nama}
                            </Typography>
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="text-xs opacity-70"
                            >
                              {Email}
                            </Typography>
                          </div>
                        </div>
                      </td>

                      {/* Isi Saran */}
                      <td className={kelas}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {Saran}
                        </Typography>
                      </td>

                      <td className={kelas}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {formatTanggal(Tanggal_Pembuatan)}
                        </Typography>
                      </td>

                      {/* Aksi */}
                      <td className={kelas}>
                        <Tooltip content="Lihat Selengkapnya">
                          <IconButton
                            onClick={() => {
                              setSaranTerpilih(id);
                              setBukaModalLihatSaran(true);
                            }}
                            variant="text"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip content="Hapus">
                          <IconButton
                            onClick={() => {
                              setSaranTerpilih(id);
                              setBukaModalKonfirmasiHapus(true);
                            }}
                            variant="text"
                            disabled={sedangMemuatHapus}
                          >
                            <TrashIcon className="h-4 w-4" />
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
          Halaman {halaman} dari {Math.ceil(totalSaran / 5)}
        </Typography>
        <div className="flex items-center gap-2">
          <Button
            onClick={ambilHalamanSebelumnya}
            variant="outlined"
            size="sm"
            disabled={sedangMemuatSaran || halaman === 1}
          >
            Sebelumnya
          </Button>
          <Button
            onClick={ambilHalamanSelanjutnya}
            variant="outlined"
            size="sm"
            disabled={
              sedangMemuatSaran || halaman === Math.ceil(totalSaran / 5)
            }
          >
            Selanjutnya
          </Button>
        </div>
      </CardFooter>

      <ModalKonfirmasiHapusSaran
        terbuka={bukaModalKonfirmasiHapus}
        tertutup={() => setBukaModalKonfirmasiHapus(false)}
        saranYangTerpilih={saranTerpilih}
        konfirmasiHapusSaran={konfirmasiHapusSaran}
        sedangMemuatHapus={sedangMemuatHapus}
      />

      <ModalLihatSaran
        terbuka={bukaModalLihatSaran}
        tertutup={setBukaModalLihatSaran}
        saranYangTerpilih={saranTerpilih}
      />
    </Card>
  );
}

export default Konten;
