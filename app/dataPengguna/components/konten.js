import { TrashIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
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
import useTampilkanPengguna from "@/hooks/backend/useTampilkanPengguna";
import useTampilkanDataPerTahun from "@/hooks/backend/useTampilkanDataPerTahun";
import useHapusPerorangan from "@/hooks/backend/useHapusPerorangan";
// KOMPONEN KAMI
import MemuatRangkaTampilkanTabel from "@/components/memuatRangkaTabel";
import ModalKonfirmasiHapusPerorangan from "@/components/modalKonfirmasiHapusPerorangan";
// KONSTANTA KAMI
import { formatTanggal } from "@/constants/formatTanggal";
import { bulan } from "@/constants/bulan";

const judulTabel = [
  "Pengguna",
  "NPWP & Nomor Identitas",
  "Status",
  "Tanggal Pembuatan Akun",
  "",
];

function Konten({ tahunDipilih }) {
  const gambarBawaan = require("@/assets/images/profil.jpg");
  const dataBulanTahun = useTampilkanDataPerTahun();
  const [sedangMemuatHapusPengguna, setSedangMemuatHapusPengguna] =
    useState(false);
  const [bukaModalHapusPerorangan, setBukaModalHapusPerorangan] =
    useState(false);
  const [peroranganYangTerpilih, setPeroranganYangTerpilih] = useState(null);

  const { hapusPerorangan } = useHapusPerorangan();

  const konfirmasiHapus = (idPerorangan) => {
    setPeroranganYangTerpilih(idPerorangan);
    setBukaModalHapusPerorangan(true);
  };

  const hapus = async () => {
    if (peroranganYangTerpilih) {
      setSedangMemuatHapusPengguna(true);
      await hapusPerorangan(peroranganYangTerpilih);
      setBukaModalHapusPerorangan(false);
      setPeroranganYangTerpilih(null);
      setSedangMemuatHapusPengguna(false);
    }
  };

  const {
    halaman,
    totalPengguna,
    daftarPengguna,
    ambilHalamanSebelumnya,
    ambilHalamanSelanjutnya,
    sedangMemuatTampilkanPengguna,
  } = useTampilkanPengguna();

  const saringPengguna = daftarPengguna.filter((item) => {
    const tanggal = item.Tanggal_Pembuatan_Akun || item.Tanggal_Pembuatan;
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
    <>
      <Card className="h-full w-full">
        <CardHeader floated={false} shadow={false} className="rounded-none">
          <div className="mb-1 flex items-center justify-between">
            <div>
              <Typography variant="h5" color="blue-gray">
                Daftar Pengguna
              </Typography>
            </div>
          </div>
        </CardHeader>

        <CardBody className="overflow-hidden px-0">
          {sedangMemuatTampilkanPengguna ? (
            <MemuatRangkaTampilkanTabel />
          ) : saringPengguna.length === 0 ? (
            <div className="flex justify-center p-6">
              <Typography variant="h6" className="text-red-500 font-bold">
                Data Perorangan Tidak Ada!
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
                {saringPengguna.map(
                  (
                    {
                      id,
                      Foto,
                      Nama_Lengkap,
                      Email,
                      No_Identitas,
                      NPWP,
                      aktif,
                      Tanggal_Pembuatan_Akun,
                    },
                    index
                  ) => {
                    const apakahTerakhir = index === daftarPengguna.length - 1;
                    const kelas = apakahTerakhir
                      ? "p-4"
                      : "p-4 border-b border-blue-gray-50";

                    return (
                      <tr key={id}>
                        <td className={kelas}>
                          <div className="flex items-center gap-3">
                            <Image
                              src={Foto || gambarBawaan}
                              alt={Nama_Lengkap}
                              size="sm"
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
                                {Nama_Lengkap}
                              </Typography>
                              <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-normal opacity-70"
                              >
                                {Email}
                              </Typography>
                            </div>
                          </div>
                        </td>
                        <td className={kelas}>
                          <div className="flex flex-col">
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal"
                            >
                              {No_Identitas}
                            </Typography>
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal opacity-70"
                            >
                              {NPWP}
                            </Typography>
                          </div>
                        </td>
                        <td className={kelas}>
                          <div className="w-max">
                            <Chip
                              variant="ghost"
                              size="sm"
                              value={aktif ? "Aktif" : "Tidak Aktif"}
                              color={aktif ? "green" : "blue-gray"}
                            />
                          </div>
                        </td>
                        <td className={kelas}>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {formatTanggal(Tanggal_Pembuatan_Akun)}
                          </Typography>
                        </td>
                        <td className={kelas}>
                          <Tooltip content="Hapus Pengguna">
                            <IconButton
                              variant="text"
                              onClick={() => konfirmasiHapus(id)}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </IconButton>
                          </Tooltip>
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
            Halaman {halaman} dari {Math.ceil(totalPengguna / 5)}
          </Typography>
          <div className="flex items-center gap-2">
            <Button
              onClick={ambilHalamanSebelumnya}
              variant="outlined"
              size="sm"
              disabled={sedangMemuatTampilkanPengguna || halaman === 1}
            >
              Sebelumnya
            </Button>
            <Button
              onClick={ambilHalamanSelanjutnya}
              variant="outlined"
              size="sm"
              disabled={
                sedangMemuatTampilkanPengguna ||
                halaman === Math.ceil(totalPengguna / 5)
              }
            >
              Selanjutnya
            </Button>
          </div>
        </CardFooter>
      </Card>

      <ModalKonfirmasiHapusPerorangan
        terbuka={bukaModalHapusPerorangan}
        tertutup={setBukaModalHapusPerorangan}
        penggunaYangTerpilih={peroranganYangTerpilih}
        konfirmasiHapusPerorangan={hapus}
        memuat={sedangMemuatHapusPengguna}
      />
    </>
  );
}

export default Konten;
