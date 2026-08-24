import React, { useState, useMemo } from "react";
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
import { toast } from "react-toastify";
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
  const [errorGambar, setErrorGambar] = useState({});
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
      toast.error("Tidak ada saran yang dipilih untuk dihapus.");
    }
  };

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

  // Filter data berdasarkan tahun
  const saringSaran = useMemo(() => {
    return daftarSaran.filter((item) => {
      const tanggal = item.Tanggal_Pembuatan;
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
  }, [daftarSaran, tahunDipilih, dataBulanTahun]);

  return (
    <Card className="h-full w-full">
      <CardHeader floated={false} shadow={false} className="rounded-none">
        <div className="mb-1 flex items-center justify-between">
          <Typography variant="h5" color="blue-gray">
            Daftar Saran
          </Typography>
          {!sedangMemuatSaran && (
            <Typography variant="small" color="gray" className="font-normal">
              Total: {saringSaran.length} data
            </Typography>
          )}
        </div>
      </CardHeader>

      <CardBody className="overflow-x-scroll lg:overflow-hidden px-0">
        {sedangMemuatSaran ? (
          <div className="flex justify-center p-6">
            <Typography variant="h6" className="text-blue-500 font-bold">
              Memuat data...
            </Typography>
          </div>
        ) : saringSaran.length === 0 ? (
          <div className="flex justify-center p-6">
            <Typography variant="h6" className="text-red-500 font-bold">
              Data Saran Tidak Ada!
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
              {saringSaran.map(
                (
                  { id, pengguna, Nama, Email, Saran, Tanggal_Pembuatan },
                  index,
                ) => {
                  const apakahTerakhir = index === saringSaran.length - 1;
                  const kelas = apakahTerakhir
                    ? "p-4"
                    : "p-4 border-b border-blue-gray-50";

                  // Ambil data dari pengguna (dari hook) atau fallback ke field langsung
                  const dataPengguna = pengguna || {};
                  // Prioritas: dari hook > field langsung > default
                  const namaPengguna =
                    dataPengguna.Nama_Lengkap || Nama || "Tidak ada nama";
                  const emailPengguna =
                    dataPengguna.Email || Email || "Tidak ada email";

                  return (
                    <tr key={id}>
                      {/* Foto dan Nama */}
                      <td className={kelas}>
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                            <img
                              src={getSumberGambar(dataPengguna)}
                              alt={namaPengguna}
                              width={40}
                              height={40}
                              className="object-cover w-full h-full"
                              onError={() =>
                                handleErrorGambar(dataPengguna.id || id)
                              }
                            />
                            {dataPengguna.tipePengguna === "perusahaan" && (
                              <div className="absolute bottom-0 right-0 bg-blue-500 text-white text-[8px] px-1 rounded-full">
                                P
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal"
                            >
                              {namaPengguna}
                              {dataPengguna.tipePengguna === "perusahaan" && (
                                <span className="text-xs text-blue-500 ml-1">
                                  (Perusahaan)
                                </span>
                              )}
                            </Typography>
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal opacity-70"
                            >
                              {emailPengguna}
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
                          {Saran || "Tidak ada saran"}
                        </Typography>
                      </td>

                      {/* Tanggal */}
                      <td className={kelas}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {formatTanggal(Tanggal_Pembuatan) ||
                            "Tidak ada tanggal"}
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
                },
              )}
            </tbody>
          </table>
        )}
      </CardBody>

      <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4">
        <Typography variant="small" color="blue-gray" className="font-normal">
          Halaman {halaman} dari {Math.ceil(totalSaran / 5) || 1}
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
              sedangMemuatSaran ||
              halaman === Math.ceil(totalSaran / 5) ||
              totalSaran === 0
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
