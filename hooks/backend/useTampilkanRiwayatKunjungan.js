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

      for (let i = startIndex; i < endIndex && i < totalDocs; i++) {
        const docSnapshot = semuaDokumen[i];
        const data = docSnapshot.data();
        const dataPenggunaMap = data.Data_Pengguna || {};

        const riwayatKunjunganData = {
          id: docSnapshot.id,
          ...data,
          pengguna: {
            id: "",
            Nama_Lengkap: "Nama tidak tersedia",
            Email: "Email tidak tersedia",
            Foto: null,
          },
        };

        const peroranganSnapshot = await getDocs(
          collection(database, "perorangan")
        );
        const perusahaanSnapshot = await getDocs(
          collection(database, "perusahaan")
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

        const penggunaCocok = semuaPengguna.find(
          (pengguna) =>
            (pengguna.Email && pengguna.Email === dataPenggunaMap.Email) ||
            (pengguna.Nama_Lengkap &&
              pengguna.Nama_Lengkap === dataPenggunaMap.Nama_Lengkap)
        );

        if (penggunaCocok) {
          riwayatKunjunganData.pengguna = {
            id: penggunaCocok.id,
            ...penggunaCocok,
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
