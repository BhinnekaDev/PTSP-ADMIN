import React, { useState } from "react";
import { AiOutlineUpload } from "react-icons/ai";
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
import useTampilkanPembuatan from "@/hooks/backend/useTampilkanPembuatan";
import useTampilkanDataPerTahun from "@/hooks/backend/useTampilkanDataPerTahun";
// KOMPONEN KAMI
import ModalSuntingPembuatan from "@/components/modalSuntingPembuatan";
import MemuatRangkaTampilkanTabel from "@/components/memuatRangkaTabel";
// KONSTANTA KAMI
import { formatTanggal } from "@/constants/formatTanggal";
import { bulan } from "@/constants/bulan";

const judulTabel = ["Pembeli", "Produk", "Tanggal Pemesanan", ""];

function Konten({ tahunDipilih }) {
  const gambarBawaan = require("@/assets/images/profil.jpg");
  const [bukaModalSuntingPengajuan, setBukaModalSuntingPengajuan] =
    useState(false);
  const [pembuatanTerpilih, setPembuatanTerpilih] = useState(null);
  const [errorGambar, setErrorGambar] = useState({});
  const dataBulanTahun = useTampilkanDataPerTahun();

  const {
    sedangMemuatPemesanan,
    daftarPemesanan,
    totalPemesanan,
    halaman,
    ambilHalamanSebelumnya,
    ambilHalamanSelanjutnya,
  } = useTampilkanPembuatan();

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

  // Filter data yang sudah disaring
  const dataYangDitampilkan = saringPemesanan
    .filter((pemesanan) => pemesanan.Status_Pembayaran === "Lunas")
    .filter((pemesanan) => pemesanan.Status_Pesanan !== "Selesai")
    .filter((pemesanan) => pemesanan.Status_Pembuatan !== "Selesai Pembuatan");

  return (
    <Card className="h-full w-full">
      <CardHeader floated={false} shadow={false} className="rounded-none">
        <div className="mb-1 flex items-center justify-between">
          <Typography variant="h5" color="blue-gray">
            Daftar Pembuatan
          </Typography>
        </div>
      </CardHeader>

      <CardBody className="overflow-x-scroll lg:overflow-hidden px-0">
        {sedangMemuatPemesanan ? (
          <MemuatRangkaTampilkanTabel />
        ) : dataYangDitampilkan.length === 0 ? (
          <div className="flex justify-center p-6">
            <Typography variant="h6" className="text-red-500 font-bold">
              Data Pembuatan Tidak Ada!
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
                (
                  { id, pengguna, Data_Keranjang, Tanggal_Pemesanan },
                  index,
                ) => {
                  const apakahTerakhir =
                    index === dataYangDitampilkan.length - 1;
                  const kelas = apakahTerakhir
                    ? "p-4"
                    : "p-4 border-b border-blue-gray-50";

                  return (
                    <tr key={id}>
                      <td className={kelas}>
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                            <img
                              src={getSumberGambar(pengguna)}
                              alt={pengguna?.Nama_Lengkap || "Pengguna"}
                              width={40}
                              height={40}
                              className="object-cover w-full h-full"
                              onError={() =>
                                handleErrorGambar(pengguna?.id || id)
                              }
                            />
                          </div>
                          <div className="flex flex-col">
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal"
                            >
                              {pengguna?.Nama_Lengkap || "Nama Tidak Diketahui"}
                              {pengguna?.tipePengguna === "perusahaan" && (
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
                              {pengguna?.Email || "Email Tidak Diketahui"}
                            </Typography>
                          </div>
                        </div>
                      </td>
                      <td className={kelas}>
                        {Data_Keranjang && Data_Keranjang.length > 0 ? (
                          Data_Keranjang.map((keranjang, index) => (
                            <Typography
                              key={index}
                              variant="small"
                              color="blue-gray"
                              className="font-normal"
                            >
                              {keranjang.Nama || "Produk tidak tersedia"}
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
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {formatTanggal(Tanggal_Pemesanan) ||
                            "Tidak ada tanggal"}
                        </Typography>
                      </td>
                      <td className={kelas}>
                        <Tooltip content="Upload Pembuatan">
                          <IconButton
                            onClick={() => {
                              setPembuatanTerpilih(id);
                              setBukaModalSuntingPengajuan(true);
                            }}
                            variant="text"
                          >
                            <AiOutlineUpload className="h-4 w-4" />
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

      <ModalSuntingPembuatan
        terbuka={bukaModalSuntingPengajuan}
        tertutup={setBukaModalSuntingPengajuan}
        pembuatanYangDipilih={pembuatanTerpilih}
      />
    </Card>
  );
}

export default Konten;
