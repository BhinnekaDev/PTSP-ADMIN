import { useState, useEffect, useCallback } from "react";
import { collection, getDocs } from "firebase/firestore";
import { toast } from "react-toastify";
import { database } from "@/lib/firebaseConfig";

const useTampilkanPengajuanRiwayatKunjungan = (batasHalaman = 5) => {
  const [sedangMemuatRiwayatKunjungan, setSedangMemuatRiwayatKunjungan] =
    useState(false);
  const [daftarRiwayatKunjungan, setDaftarRiwayatKunjungan] = useState([]);
  const [totalRiwayatKunjungan, setTotalRiwayatKunjungan] = useState(0);
  const [halaman, setHalaman] = useState(1);

  const ambilDataRiwayatKunjungan = useCallback(async () => {
    const refRiwayatKunjungan = collection(database, "riwayat_kunjungan");
    try {
      setSedangMemuatRiwayatKunjungan(true);
      const snapshot = await getDocs(refRiwayatKunjungan);
      const semuaDokumen = snapshot.docs;
      const totalDocs = semuaDokumen.length;
      setTotalRiwayatKunjungan(totalDocs);

      const startIndex = (halaman - 1) * batasHalaman;
      const endIndex = startIndex + batasHalaman;

      const riwayatKunjungans = [];

      // Ambil semua data pengguna sekali saja untuk efisiensi (seperti di useTampilkanPengajuanKunjungan)
      const peroranganSnapshot = await getDocs(
        collection(database, "perorangan"),
      );
      const perusahaanSnapshot = await getDocs(
        collection(database, "perusahaan"),
      );

      const semuaPengguna = [
        ...peroranganSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })),
        ...perusahaanSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })),
      ];

      for (let i = startIndex; i < endIndex && i < totalDocs; i++) {
        const docSnapshot = semuaDokumen[i];
        const data = docSnapshot.data();
        const dataPenggunaMap = data.Data_Pengguna || {};

        const riwayatKunjunganData = {
          id: docSnapshot.id,
          ...data,
          tipePengguna: null,
          pengguna: {
            id: "",
            Nama_Lengkap: "Nama tidak tersedia",
            Email: "Email tidak tersedia",
            Foto: null,
            Foto_URL: null,
            photoURL: null,
            fotoProfil: null,
          },
        };

        // Cari pengguna yang cocok berdasarkan Email atau Nama_Lengkap
        const penggunaCocok = semuaPengguna.find(
          (pengguna) =>
            (pengguna.Email && pengguna.Email === dataPenggunaMap.Email) ||
            (pengguna.Nama_Lengkap &&
              pengguna.Nama_Lengkap === dataPenggunaMap.Nama_Lengkap),
        );

        if (penggunaCocok) {
          // Tentukan tipe pengguna (seperti di useTampilkanPengajuanKunjungan)
          const isPerorangan = peroranganSnapshot.docs.some(
            (doc) => doc.id === penggunaCocok.id,
          );
          const isPerusahaan = perusahaanSnapshot.docs.some(
            (doc) => doc.id === penggunaCocok.id,
          );

          let fotoProfil = null;

          // PRIORITAS 1: Field Foto_URL (untuk perusahaan yang punya logo)
          if (penggunaCocok.Foto_URL) {
            fotoProfil = penggunaCocok.Foto_URL;
          }
          // PRIORITAS 2: Field Foto (untuk perorangan)
          else if (penggunaCocok.Foto) {
            fotoProfil = penggunaCocok.Foto;
          }
          // PRIORITAS 3: Field photoURL (dari Google Auth)
          else if (penggunaCocok.photoURL) {
            fotoProfil = penggunaCocok.photoURL;
          }

          if (isPerorangan) {
            riwayatKunjunganData.tipePengguna = "perorangan";
          } else if (isPerusahaan) {
            riwayatKunjunganData.tipePengguna = "perusahaan";
          }

          riwayatKunjunganData.pengguna = {
            id: penggunaCocok.id,
            ...penggunaCocok,
            fotoProfil: fotoProfil,
            Foto_URL: penggunaCocok.Foto_URL || null,
          };
        }

        riwayatKunjungans.push(riwayatKunjunganData);
      }

      setDaftarRiwayatKunjungan(riwayatKunjungans);
    } catch (error) {
      toast.error("Gagal mengambil data riwayat kunjungan: " + error.message);
      console.error("Error mengambil data kunjungan:", error);
    } finally {
      setSedangMemuatRiwayatKunjungan(false);
    }
  }, [halaman, batasHalaman]);

  useEffect(() => {
    ambilDataRiwayatKunjungan();
  }, [ambilDataRiwayatKunjungan]);

  const ambilHalamanSebelumnya = () => {
    if (halaman > 1) setHalaman(halaman - 1);
  };

  const ambilHalamanSelanjutnya = () => {
    const totalHalaman = Math.ceil(totalRiwayatKunjungan / batasHalaman);
    if (halaman < totalHalaman) setHalaman(halaman + 1);
  };

  return {
    halaman,
    totalRiwayatKunjungan,
    daftarRiwayatKunjungan,
    ambilHalamanSebelumnya,
    ambilHalamanSelanjutnya,
    sedangMemuatRiwayatKunjungan,
  };
};

export default useTampilkanPengajuanRiwayatKunjungan;
