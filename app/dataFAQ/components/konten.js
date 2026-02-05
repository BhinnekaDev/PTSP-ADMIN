import React, { useState } from "react";
import { EyeIcon, TrashIcon, PencilIcon } from "@heroicons/react/24/solid";
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
import useTampilkanPengaduan from "@/hooks/backend/useTampilkanPengaduan";
import useHapusPengaduan from "@/hooks/backend/useHapusPengaduan";
import ModalKonfirmasiHapusPengaduan from "@/components/modalKonfirmasiHapusPengaduan";
import useTampilkanDataPerTahun from "@/hooks/backend/useTampilkanDataPerTahun";
// KOMPONEN KAMI
import MemuatRangkaTampilkanTabel from "@/components/memuatRangkaTabel";
import ModalLihatFAQ from "@/components/modalLihatFAQ";
import ModalSuntingFAQ from "@/components/modalSuntingFAQ";
// KONSTANTA KAMI
import { bulan } from "@/constants/bulan";

const judulTabel = ["Judul FAQ", "Ringkasan Isi", ""];

function Konten({ tahunDipilih }) {
  const [pengaduanTerpilih, setPengaduanTerpilih] = useState(null);
  const [bukaModalLihatFAQ, setBukaModalLihatFAQ] = useState(false);
  const [bukaModalSuntingFAQ, setBukaModalSuntingFAQ] = useState(false);
  const { hapusPengaduan, sedangMemuatHapus } = useHapusPengaduan();
  const [bukaModalKonfirmasiHapus, setBukaModalKonfirmasiHapus] =
    useState(false);
  const dataBulanTahun = useTampilkanDataPerTahun();
  const {
    halaman,
    totalPengaduan,
    daftarPengaduan,
    ambilHalamanSebelumnya,
    ambilHalamanSelanjutnya,
    sedangMemuatPengaduan,
  } = useTampilkanPengaduan();

  const konfirmasiHapusPengaduan = () => {
    if (pengaduanTerpilih) {
      hapusPengaduan(pengaduanTerpilih);
      setBukaModalKonfirmasiHapus(false);
    } else {
      toast.error("Tidak ada pengajuan yang dipilih untuk dihapus.");
    }
  };

  const saringPengaduan = daftarPengaduan.filter((item) => {
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

  const teks =
    "Datang langsung ke Pelayanan Terpadu Satu Pintu (PTSP) BMKG di Jalan Angkasa I no. 2 Kemayoran Jakarta Pusat. Gedung E, Kirim email ke : ptsp[at]bmkg.go.id ...";

  const potongParagraf = (teks, batas = 200) => {
    const hasil = [];
    for (let i = 0; i < teks.length; i += batas) {
      hasil.push(teks.slice(i, i + batas));
    }
    return hasil;
  };

  return (
    <Card className="h-full w-full">
      <CardHeader floated={false} shadow={false} className="rounded-none">
        <div className="mb-1 flex items-center justify-between">
          <Typography variant="h5" color="blue-gray">
            Daftar FAQ
          </Typography>
        </div>
      </CardHeader>

      <CardBody className="overflow-x-scroll lg:overflow-hidden px-0">
        {sedangMemuatPengaduan ? (
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
              {saringPengaduan.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="p-4 text-center text-blue-gray-500"
                  >
                    Tidak Ada Data
                  </td>
                </tr>
              ) : (
                daftarPengaduan.map(
                  (
                    { id, pengguna, Email, Nama, Pengaduan, Tanggal_Pembuatan },
                    index,
                  ) => {
                    const apakahTerakhir = index === daftarPengaduan.length - 1;
                    const kelas = apakahTerakhir
                      ? "p-4"
                      : "p-4 border-b border-blue-gray-50";

                    return (
                      <tr key={id}>
                        {/* Judul FAQ */}
                        <td className={kelas}>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {teks.length > 40
                              ? teks.slice(0, 40) + "..."
                              : teks}
                          </Typography>
                        </td>

                        <td className={kelas}>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {teks.length > 80
                              ? teks.slice(0, 80) + "..."
                              : teks}
                          </Typography>
                        </td>

                        {/* Aksi */}
                        <td className={kelas}>
                          <Tooltip content="Lihat Selengkapnya">
                            <IconButton
                              onClick={() => {
                                setBukaModalLihatFAQ(true);
                              }}
                              variant="text"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip content="Sunting">
                            <IconButton
                              onClick={() => {
                                setBukaModalSuntingFAQ(true);
                              }}
                              variant="text"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip content="Hapus">
                            <IconButton
                              onClick={() => {
                                setPengaduanTerpilih(id);
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
                )
              )}
            </tbody>
          </table>
        )}
      </CardBody>

      <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4">
        <Typography variant="small" color="blue-gray" className="font-normal">
          Halaman {halaman} dari {Math.ceil(totalPengaduan / 5)}
        </Typography>
        <div className="flex items-center gap-2">
          <Button
            onClick={ambilHalamanSebelumnya}
            variant="outlined"
            size="sm"
            disabled={sedangMemuatPengaduan || halaman === 1}
          >
            Sebelumnya
          </Button>
          <Button
            onClick={ambilHalamanSelanjutnya}
            variant="outlined"
            size="sm"
            disabled={
              sedangMemuatPengaduan || halaman === Math.ceil(totalPengaduan / 5)
            }
          >
            Selanjutnya
          </Button>
        </div>
      </CardFooter>

      <ModalKonfirmasiHapusPengaduan
        terbuka={bukaModalKonfirmasiHapus}
        tertutup={() => setBukaModalKonfirmasiHapus(false)}
        pengaduanYangTerpilih={pengaduanTerpilih}
        konfirmasiHapusPengaduan={konfirmasiHapusPengaduan}
        sedangMemuatHapusPengaduan={sedangMemuatHapus}
      />

      <ModalLihatFAQ
        terbuka={bukaModalLihatFAQ}
        tertutup={setBukaModalLihatFAQ}
      />

      <ModalSuntingFAQ
        terbuka={bukaModalSuntingFAQ}
        tertutup={setBukaModalSuntingFAQ}
      />
    </Card>
  );
}

export default Konten;
