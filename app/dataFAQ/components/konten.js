import React, { useState } from "react";
import {
  EyeIcon,
  TrashIcon,
  PencilIcon,
  PlusIcon,
} from "@heroicons/react/24/solid";
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
import useTampilkanDataPerTahun from "@/hooks/backend/useTampilkanDataPerTahun";
import MemuatRangkaTampilkanTabel from "@/components/memuatRangkaTabel";
import ModalLihatFAQ from "@/components/modalLihatFAQ";
import ModalSuntingFAQ from "@/components/modalSuntingFAQ";
import ModalKonfirmasiHapusFAQ from "@/components/modalKonfirmasiHapusFAQ";
import ModalTambahFAQ from "@/components/modalTambahFAQ";
import { bulan } from "@/constants/bulan";
import useTampilkanFAQ from "@/hooks/backend/useTampilkanFAQ";
import { toast } from "react-toastify";
import { database } from "@/lib/firebaseConfig";
import { deleteDoc, doc } from "firebase/firestore";

const judulTabel = ["Kategori", "Judul FAQ", "Ringkasan Isi", ""];
const DATA_PER_HALAMAN = 5;

function Konten({ tahunDipilih }) {
  const [bukaModalLihatFAQ, setBukaModalLihatFAQ] = useState(false);
  const [bukaModalTambahFAQ, setBukaModalTambahFAQ] = useState(false);
  const [bukaModalSuntingFAQ, setBukaModalSuntingFAQ] = useState(false);
  const [bukaModalKonfirmasiHapus, setBukaModalKonfirmasiHapus] =
    useState(false);
  const [faqTerpilih, setFaqTerpilih] = useState(null);
  const [halamanSaatIni, setHalamanSaatIni] = useState(1);
  const [sedangMemuatHapus, setSedangMemuatHapus] = useState(false);

  const dataBulanTahun = useTampilkanDataPerTahun();
  const { daftarFAQ, sedangMemuat: sedangMemuatFAQ } = useTampilkanFAQ();

  const hapusFAQ = async (id) => {
    setSedangMemuatHapus(true);
    try {
      await deleteDoc(doc(database, "faq", id));
      toast.success("FAQ berhasil dihapus!");
      setBukaModalKonfirmasiHapus(false);
      setFaqTerpilih(null);
    } catch (error) {
      console.error("Error menghapus FAQ:", error);
      toast.error("Gagal menghapus FAQ");
    } finally {
      setSedangMemuatHapus(false);
    }
  };

  const konfirmasiHapusFAQ = async () => {
    if (faqTerpilih && faqTerpilih.id) {
      await hapusFAQ(faqTerpilih.id);
    } else {
      toast.error("Tidak ada FAQ yang dipilih untuk dihapus.");
    }
  };

  const saringFAQ = daftarFAQ.filter((item) => {
    if (tahunDipilih === "Pilih Tahun" || !tahunDipilih) {
      return true;
    }

    if (!item.created_at) return false;

    const dateObj =
      item.created_at instanceof Date
        ? item.created_at
        : new Date(item.created_at);

    const tahun = dateObj.getFullYear();
    const bulanIndex = dateObj.getMonth();

    if (!dataBulanTahun || dataBulanTahun.length === 0) {
      return false;
    }

    const bulanNama = bulan[bulanIndex];
    const bulanTahunDipilih = `${bulanNama} ${tahun}`;
    return bulanTahunDipilih === tahunDipilih;
  });

  const totalData = saringFAQ.length;
  const totalHalaman = Math.ceil(totalData / DATA_PER_HALAMAN);
  const indexAwal = (halamanSaatIni - 1) * DATA_PER_HALAMAN;
  const indexAkhir = indexAwal + DATA_PER_HALAMAN;
  const dataDitampilkan = saringFAQ.slice(indexAwal, indexAkhir);

  const keHalamanSebelumnya = () => {
    if (halamanSaatIni > 1) {
      setHalamanSaatIni(halamanSaatIni - 1);
    }
  };

  const keHalamanSelanjutnya = () => {
    if (halamanSaatIni < totalHalaman) {
      setHalamanSaatIni(halamanSaatIni + 1);
    }
  };

  React.useEffect(() => {
    setHalamanSaatIni(1);
  }, [tahunDipilih]);

  const pastikanString = (nilai) => {
    if (!nilai) return "";
    if (typeof nilai === "string") return nilai;
    if (typeof nilai === "number") return nilai.toString();
    if (nilai instanceof Date) return nilai.toLocaleDateString();
    if (typeof nilai === "object") {
      try {
        return JSON.stringify(nilai);
      } catch {
        return "";
      }
    }
    return String(nilai);
  };

  const stripHtmlTags = (teks) => {
    const teksString = pastikanString(teks);
    if (!teksString) return "";
    return teksString.replace(/<[^>]*>/g, "");
  };

  const potongTeks = (teks, batas = 80) => {
    const teksString = pastikanString(teks);
    if (!teksString) return "";
    if (teksString.length <= batas) return teksString;
    return teksString.slice(0, batas) + "...";
  };

  const buatRingkasan = (teks, batasKarakter = 100) => {
    if (!teks) return "";

    let teksBersih = pastikanString(teks);
    teksBersih = stripHtmlTags(teksBersih);
    teksBersih = teksBersih.replace(/\s+/g, " ").trim();

    if (teksBersih.length <= batasKarakter) {
      return teksBersih;
    }

    let ringkasan = teksBersih.slice(0, batasKarakter);
    const lastSpace = ringkasan.lastIndexOf(" ");
    if (lastSpace > batasKarakter * 0.7) {
      ringkasan = ringkasan.slice(0, lastSpace);
    }

    return ringkasan + "...";
  };

  return (
    <Card className="h-full w-full">
      <CardHeader floated={false} shadow={false} className="rounded-none">
        <div className="mb-1 flex items-center justify-between">
          <div>
            <Typography variant="h5" color="blue-gray">
              Daftar FAQ
            </Typography>
            <Typography variant="small" color="gray" className="mt-1">
              Menampilkan {dataDitampilkan.length} dari {totalData} FAQ
            </Typography>
          </div>
          <div className="flex shrink-0 flex-col items-center sm:flex-row">
            <Button
              onClick={() => setBukaModalTambahFAQ(true)}
              className="flex items-center gap-2"
              size="sm"
            >
              <PlusIcon strokeWidth={2} className="h-4 w-4" />
              Tambah FAQ
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardBody className="overflow-x-scroll lg:overflow-hidden px-0">
        {sedangMemuatFAQ ? (
          <MemuatRangkaTampilkanTabel />
        ) : (
          <table className="w-full min-w-max table-auto text-left">
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
              {dataDitampilkan.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="p-4 text-center text-blue-gray-500"
                  >
                    Tidak Ada Data FAQ
                  </td>
                </tr>
              ) : (
                dataDitampilkan.map((faq, index) => {
                  const apakahTerakhir = index === dataDitampilkan.length - 1;
                  const kelas = apakahTerakhir
                    ? "p-4"
                    : "p-4 border-b border-blue-gray-50";

                  return (
                    <tr key={faq.id}>
                      <td className={kelas}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium">
                            {potongTeks(faq.category || "Umum", 20)}
                          </span>
                        </Typography>
                      </td>

                      <td className={kelas}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {potongTeks(faq.question, 30)}
                        </Typography>
                      </td>

                      <td className={kelas}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {buatRingkasan(
                            faq.answer && Array.isArray(faq.answer)
                              ? faq.answer?.join(". ")
                              : faq.answer,
                            50,
                          )}
                        </Typography>
                      </td>

                      <td className={kelas}>
                        <Tooltip content="Lihat Selengkapnya">
                          <IconButton
                            onClick={() => {
                              setFaqTerpilih(faq);
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
                              setFaqTerpilih(faq);
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
                              setFaqTerpilih(faq);
                              setBukaModalKonfirmasiHapus(true);
                            }}
                            variant="text"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </IconButton>
                        </Tooltip>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </CardBody>

      <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-3">
        <Typography variant="small" color="blue-gray" className="font-normal">
          Halaman {halamanSaatIni} dari {totalHalaman || 1}
        </Typography>
        <div className="flex items-center gap-2">
          <Button
            onClick={keHalamanSebelumnya}
            variant="outlined"
            size="sm"
            disabled={halamanSaatIni === 1 || sedangMemuatFAQ}
          >
            Sebelumnya
          </Button>
          <Button
            onClick={keHalamanSelanjutnya}
            variant="outlined"
            size="sm"
            disabled={
              halamanSaatIni === totalHalaman ||
              totalHalaman === 0 ||
              sedangMemuatFAQ
            }
          >
            Selanjutnya
          </Button>
        </div>
      </CardFooter>

      <ModalTambahFAQ
        terbuka={bukaModalTambahFAQ}
        tertutup={() => setBukaModalTambahFAQ(false)}
        mode="tambah"
      />

      <ModalLihatFAQ
        terbuka={bukaModalLihatFAQ}
        tertutup={() => setBukaModalLihatFAQ(false)}
        data={faqTerpilih}
      />

      <ModalKonfirmasiHapusFAQ
        terbuka={bukaModalKonfirmasiHapus}
        tertutup={() => setBukaModalKonfirmasiHapus(false)}
        data={faqTerpilih}
        sedangMemuat={sedangMemuatHapus}
        onConfirm={konfirmasiHapusFAQ}
      />

      <ModalSuntingFAQ
        terbuka={bukaModalSuntingFAQ}
        tertutup={() => setBukaModalSuntingFAQ(false)}
        data={faqTerpilih}
      />
    </Card>
  );
}

export default Konten;
