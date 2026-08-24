import React, { useState, useMemo } from "react";
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
import useTampilkanRiwayatKunjungan from "@/hooks/backend/useTampilkanRiwayatKunjungan";
import useHapusRiwayatKunjungan from "@/hooks/backend/useHapusRiwayatKunjungan";
import ModalKonfirmasiHapusRiwayatKunjungan from "@/components/modalKonfirmasiHapusRiwayatKunjungan";
import useTampilkanDataPerTahun from "@/hooks/backend/useTampilkanDataPerTahun";
// KOMPONEN KAMI
import ModalLihatRiwayatKunjungan from "@/components/modalLihatRiwayatKunjungan";
// KONSTANTA KAMI
import { formatTanggal } from "@/constants/formatTanggal";
import { bulan } from "@/constants/bulan";

const judulTabel = [
  "Pengguna",
  "Instansi",
  "Status",
  "Keterangan Penolakan",
  "Tanggal Kunjungan",
  "",
];

function Konten({ tahunDipilih }) {
  const gambarBawaan = require("@/assets/images/profil.jpg");
  const [bukaModalLihatRiwayatKunjungan, setBukaModalLihatRiwayatKunjungan] =
    useState(false);
  const [riwayatKunjunganTerpilih, setRiwayatKunjunganTerpilih] =
    useState(null);
  const { hapusRiwayatKunjungan, sedangMemuatHapus } =
    useHapusRiwayatKunjungan();
  const [bukaModalKonfirmasiHapus, setBukaModalKonfirmasiHapus] =
    useState(false);
  const [errorGambar, setErrorGambar] = useState({});
  const dataBulanTahun = useTampilkanDataPerTahun();

  const {
    halaman,
    totalRiwayatKunjungan,
    daftarRiwayatKunjungan,
    ambilHalamanSebelumnya,
    ambilHalamanSelanjutnya,
    sedangMemuatRiwayatKunjungan,
  } = useTampilkanRiwayatKunjungan();

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

  const konfirmasiHapusRiwayatKunjungan = () => {
    if (riwayatKunjunganTerpilih) {
      hapusRiwayatKunjungan(riwayatKunjunganTerpilih);
      setBukaModalKonfirmasiHapus(false);
    } else {
      toast.error("Tidak ada riwayat kunjungan yang dipilih untuk dihapus.");
    }
  };

  // Filter data berdasarkan tahun
  const saringRiwayatKunjungan = useMemo(() => {
    return daftarRiwayatKunjungan.filter((item) => {
      const tanggal = item.Tanggal_Kunjungan;
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
  }, [daftarRiwayatKunjungan, tahunDipilih, dataBulanTahun]);

  return (
    <Card className="h-full w-full">
      <CardHeader floated={false} shadow={false} className="rounded-none">
        <div className="mb-1 flex items-center justify-between">
          <Typography variant="h5" color="blue-gray">
            Daftar Riwayat Kunjungan
          </Typography>
          {!sedangMemuatRiwayatKunjungan && (
            <Typography variant="small" color="gray" className="font-normal">
              Total: {saringRiwayatKunjungan.length} data
            </Typography>
          )}
        </div>
      </CardHeader>

      <CardBody className="overflow-x-scroll lg:overflow-hidden px-0">
        {sedangMemuatRiwayatKunjungan ? (
          <div className="flex justify-center p-6">
            <Typography variant="h6" className="text-blue-500 font-bold">
              Memuat data...
            </Typography>
          </div>
        ) : saringRiwayatKunjungan.length === 0 ? (
          <div className="flex justify-center p-6">
            <Typography variant="h6" className="text-red-500 font-bold">
              Data Riwayat Kunjungan Tidak Ada!
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
              {saringRiwayatKunjungan.map(
                (
                  {
                    id,
                    pengguna,
                    Stasiun,
                    Status_Kunjungan,
                    Keterangan_Penolakan,
                    Tanggal_Kunjungan,
                  },
                  index,
                ) => {
                  const apakahTerakhir =
                    index === saringRiwayatKunjungan.length - 1;
                  const kelas = apakahTerakhir
                    ? "p-4"
                    : "p-4 border-b border-blue-gray-50";

                  // Ambil data pengguna dari hook atau fallback
                  const dataPengguna = pengguna || {};
                  const namaPengguna =
                    dataPengguna.Nama_Lengkap || "Nama tidak tersedia";
                  const emailPengguna =
                    dataPengguna.Email || "Email tidak tersedia";

                  return (
                    <tr key={id}>
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
                              className="font-medium"
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
                              className="text-xs opacity-70"
                            >
                              {emailPengguna}
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
                          {Stasiun || "-"}
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
                                    : "blue-gray"
                            }
                          />
                        </div>
                      </td>

                      <td className={kelas}>
                        {Status_Kunjungan === "Ditolak" ? (
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {Keterangan_Penolakan || "-"}
                          </Typography>
                        ) : (
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="italic text-blue-gray-300"
                          >
                            ----
                          </Typography>
                        )}
                      </td>

                      <td className={kelas}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {formatTanggal(Tanggal_Kunjungan) ||
                            "Tidak ada tanggal"}
                        </Typography>
                      </td>

                      {/* Aksi */}
                      <td className={kelas}>
                        <Tooltip content="Lihat Selengkapnya">
                          <IconButton
                            onClick={() => {
                              setRiwayatKunjunganTerpilih(id);
                              setBukaModalLihatRiwayatKunjungan(true);
                            }}
                            variant="text"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip content="Hapus">
                          <IconButton
                            onClick={() => {
                              setRiwayatKunjunganTerpilih(id);
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
          Halaman {halaman} dari {Math.ceil(totalRiwayatKunjungan / 5) || 1}
        </Typography>
        <div className="flex items-center gap-2">
          <Button
            onClick={ambilHalamanSebelumnya}
            variant="outlined"
            size="sm"
            disabled={sedangMemuatRiwayatKunjungan || halaman === 1}
          >
            Sebelumnya
          </Button>
          <Button
            onClick={ambilHalamanSelanjutnya}
            variant="outlined"
            size="sm"
            disabled={
              sedangMemuatRiwayatKunjungan ||
              halaman === Math.ceil(totalRiwayatKunjungan / 5) ||
              totalRiwayatKunjungan === 0
            }
          >
            Selanjutnya
          </Button>
        </div>
      </CardFooter>

      <ModalKonfirmasiHapusRiwayatKunjungan
        terbuka={bukaModalKonfirmasiHapus}
        tertutup={() => setBukaModalKonfirmasiHapus(false)}
        riwayatKunjunganYangTerpilih={riwayatKunjunganTerpilih}
        konfirmasiHapusRiwayatKunjungan={konfirmasiHapusRiwayatKunjungan}
        sedangMemuatHapusRiwayatKunjungan={sedangMemuatHapus}
      />

      <ModalLihatRiwayatKunjungan
        terbuka={bukaModalLihatRiwayatKunjungan}
        tertutup={setBukaModalLihatRiwayatKunjungan}
        riwayatKunjunganYangTerpilih={riwayatKunjunganTerpilih}
      />
    </Card>
  );
}

export default Konten;
