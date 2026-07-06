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
import { toast } from "react-toastify";
// PENGAIT KAMI
import useTampilkanPengajuan from "@/hooks/backend/useTampilkanPengajuan";
import useHapusPengajuan from "@/hooks/backend/useHapusPengajuan";
import ModalKonfirmasiHapusPengajuan from "@/components/modalKonfirmasiHapusPengajuan";
import useTampilkanDataPerTahun from "@/hooks/backend/useTampilkanDataPerTahun";
// KOMPONEN KAMI
import ModalSuntingPengajuan from "@/components/modalSuntingPengajuan";
import ModalLihatPengajuan from "@/components/modalLihatPengajuan";
import MemuatRangkaTampilkanTabel from "@/components/memuatRangkaTabel";
// KONSTANTA KAMI
import { formatTanggal } from "@/constants/formatTanggal";
import { bulan } from "@/constants/bulan";

const judulTabel = [
  "Pembeli",
  "Produk",
  "Status",
  "Jenis",
  "Tanggal Pengajuan",
  "",
];

function Konten({ tahunDipilih }) {
  const gambarBawaan = require("@/assets/images/profil.jpg");
  const [bukaModalSuntingPengajuan, setBukaModalSuntingPengajuan] =
    useState(false);
  const [bukaModalLihatPengajuan, setBukaModalLihatPengajuan] = useState(false);
  const [pengajuanTerpilih, setPengajuanTerpilih] = useState(null);
  const { hapusPengajuan, sedangMemuatHapus } = useHapusPengajuan();
  const [bukaModalKonfirmasiHapus, setBukaModalKonfirmasiHapus] =
    useState(false);
  const dataBulanTahun = useTampilkanDataPerTahun();
  const [errorGambar, setErrorGambar] = useState({});

  const {
    halaman,
    totalPengajuan,
    daftarPengajuan,
    ambilHalamanSebelumnya,
    ambilHalamanSelanjutnya,
    sedangMemuatPengajuan,
  } = useTampilkanPengajuan();

  const konfirmasiHapusPengajuan = () => {
    if (pengajuanTerpilih) {
      hapusPengajuan(pengajuanTerpilih);
      setBukaModalKonfirmasiHapus(false);
    } else {
      toast.error("Tidak ada pengajuan yang dipilih untuk dihapus.");
    }
  };

  // Fungsi untuk menangani error gambar
  const handleErrorGambar = (id) => {
    setErrorGambar((prev) => ({ ...prev, [id]: true }));
  };

  // Fungsi untuk mendapatkan sumber gambar yang benar
  const getSumberGambar = (pengguna) => {
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

  const saringPengajuan = daftarPengajuan.filter((item) => {
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

  // Filter data yang sudah disaring untuk menampilkan hanya yang statusnya bukan "Diterima"
  const dataYangDitampilkan = saringPengajuan.filter(
    ({ ajukan }) => ajukan.Status_Ajukan !== "Diterima",
  );

  return (
    <Card className="h-full w-full">
      <CardHeader floated={false} shadow={false} className="rounded-none">
        <div className="mb-1 flex items-center justify-between">
          <Typography variant="h5" color="blue-gray">
            Daftar Pengajuan
          </Typography>
        </div>
      </CardHeader>

      <CardBody className="overflow-x-scroll lg:overflow-hidden px-0">
        {sedangMemuatPengajuan ? (
          <MemuatRangkaTampilkanTabel />
        ) : dataYangDitampilkan.length === 0 ? (
          <div className="flex justify-center p-6">
            <Typography variant="h6" className="text-red-500 font-bold">
              Data Pengajuan Tidak Ada!
            </Typography>
          </div>
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
              {dataYangDitampilkan.map(
                ({ id, pengguna, Data_Keranjang, ajukan }, index) => {
                  const apakahTerakhir =
                    index === dataYangDitampilkan.length - 1;
                  const kelas = apakahTerakhir
                    ? "p-4"
                    : "p-4 border-b border-blue-gray-50";

                  // Cek apakah tombol sunting harus disembunyikan
                  const isBerbayarDitolak =
                    ajukan.Jenis_Ajukan === "Berbayar" &&
                    ajukan.Status_Ajukan === "Ditolak";

                  return (
                    <tr key={id}>
                      <td className={kelas}>
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                            <img
                              src={getSumberGambar(pengguna)}
                              alt={pengguna.Nama_Lengkap || "Pengguna"}
                              width={40}
                              height={40}
                              className="object-cover w-full h-full"
                              onError={() =>
                                handleErrorGambar(pengguna.id || id)
                              }
                            />
                          </div>
                          <div className="flex flex-col">
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal"
                            >
                              {pengguna.Nama_Lengkap || "Tidak ada nama"}
                            </Typography>
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal opacity-70"
                            >
                              {pengguna.Email || "Tidak ada email"}
                            </Typography>
                          </div>
                        </div>
                      </td>
                      <td className={kelas}>
                        {Data_Keranjang && Data_Keranjang.length > 0 ? (
                          Data_Keranjang.map((item, indeks) => (
                            <Typography
                              key={indeks}
                              variant="small"
                              color="blue-gray"
                              className="font-normal"
                            >
                              {Data_Keranjang.length > 1 && "• "}
                              {item.Nama && item.Nama.length > 30
                                ? item.Nama.slice(0, 30) + "..."
                                : item.Nama || "Produk tidak tersedia"}
                            </Typography>
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

                      <td className={kelas}>
                        <div className="w-max">
                          <Chip
                            variant="ghost"
                            size="sm"
                            value={ajukan.Status_Ajukan || "Belum ada status"}
                            color={
                              ajukan.Status_Ajukan === "Diterima"
                                ? "green"
                                : ajukan.Status_Ajukan === "Ditolak"
                                  ? "red"
                                  : ajukan.Status_Ajukan === "Sedang Ditinjau"
                                    ? "yellow"
                                    : "blue-gray"
                            }
                          />
                        </div>
                      </td>
                      <td className={kelas}>
                        <div className="w-max">
                          <Chip
                            variant="ghost"
                            size="sm"
                            value={ajukan.Jenis_Ajukan || "Belum ada jenis"}
                            color={
                              ajukan.Jenis_Ajukan === "Gratis"
                                ? "green"
                                : ajukan.Jenis_Ajukan === "Berbayar"
                                  ? "red"
                                  : "blue-gray"
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
                          {formatTanggal(ajukan.Tanggal_Pembuatan_Ajukan)}
                        </Typography>
                      </td>
                      <td className={kelas}>
                        <Tooltip content="Lihat Selengkapnya">
                          <IconButton
                            onClick={() => {
                              setPengajuanTerpilih(id);
                              setBukaModalLihatPengajuan(true);
                            }}
                            variant="text"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </IconButton>
                        </Tooltip>

                        {/* Tombol Sunting - disembunyikan jika Berbayar dan Ditolak */}
                        {!isBerbayarDitolak && (
                          <Tooltip content="Sunting">
                            <IconButton
                              onClick={() => {
                                setPengajuanTerpilih(id);
                                setBukaModalSuntingPengajuan(true);
                              }}
                              variant="text"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </IconButton>
                          </Tooltip>
                        )}

                        <Tooltip content="Hapus">
                          <IconButton
                            onClick={() => {
                              setPengajuanTerpilih(id);
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
                },
              )}
            </tbody>
          </table>
        )}
      </CardBody>

      <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4">
        <Typography variant="small" color="blue-gray" className="font-normal">
          Halaman {halaman} dari {Math.ceil(totalPengajuan / 5)}
        </Typography>
        <div className="flex items-center gap-2">
          <Button
            onClick={ambilHalamanSebelumnya}
            variant="outlined"
            size="sm"
            disabled={sedangMemuatPengajuan || halaman === 1}
          >
            Sebelumnya
          </Button>
          <Button
            onClick={ambilHalamanSelanjutnya}
            variant="outlined"
            size="sm"
            disabled={
              sedangMemuatPengajuan || halaman === Math.ceil(totalPengajuan / 5)
            }
          >
            Selanjutnya
          </Button>
        </div>
      </CardFooter>

      <ModalSuntingPengajuan
        terbuka={bukaModalSuntingPengajuan}
        tertutup={setBukaModalSuntingPengajuan}
        pengajuanYangTerpilih={pengajuanTerpilih}
      />

      <ModalKonfirmasiHapusPengajuan
        terbuka={bukaModalKonfirmasiHapus}
        tertutup={() => setBukaModalKonfirmasiHapus(false)}
        pengajuanYangTerpilih={pengajuanTerpilih}
        konfirmasi={konfirmasiHapusPengajuan}
        sedangMemuatHapusPengajuan={sedangMemuatHapus}
      />

      <ModalLihatPengajuan
        terbuka={bukaModalLihatPengajuan}
        tertutup={setBukaModalLihatPengajuan}
        pengajuanYangTerpilih={pengajuanTerpilih}
      />
    </Card>
  );
}

export default Konten;
