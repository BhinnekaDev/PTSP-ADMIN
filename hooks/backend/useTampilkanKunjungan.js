import { useState, useEffect, useCallback } from "react";
import { collection, getDocs } from "firebase/firestore";
import { toast } from "react-toastify";
import { database } from "@/lib/firebaseConfig";

const useTampilkanPengajuanKunjungan = (batasHalaman = 5) => {
  const [sedangMemuatKunjungan, setSedangMemuatKunjungan] = useState(false);
  const [daftarKunjungan, setDaftarKunjungan] = useState([]);
  const [totalKunjungan, setTotalKunjungan] = useState(0);
  const [halaman, setHalaman] = useState(1);

  const ambilDataKunjungan = useCallback(async () => {
    const refKunjungan = collection(database, "pengajuan_kunjungan");
    try {
      setSedangMemuatKunjungan(true);
      const snapshot = await getDocs(refKunjungan);
      const semuaDokumen = snapshot.docs;
      const totalDocs = semuaDokumen.length;
      setTotalKunjungan(totalDocs);

      const startIndex = (halaman - 1) * batasHalaman;
      const endIndex = startIndex + batasHalaman;

      const kunjungans = [];

      for (let i = startIndex; i < endIndex && i < totalDocs; i++) {
        const docSnapshot = semuaDokumen[i];
        const data = docSnapshot.data();
        const dataPenggunaMap = data.Data_Pengguna || {};

        const kunjunganData = {
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
          kunjunganData.pengguna = {
            id: penggunaCocok.id,
            ...penggunaCocok,
          };
        }

        kunjungans.push(kunjunganData);
      }

      setDaftarKunjungan(kunjungans);
    } catch (error) {
      toast.error("Gagal mengambil data kunjungan: " + error.message);
      console.error("Error mengambil data kunjungan:", error);
    } finally {
      setSedangMemuatKunjungan(false);
    }
  }, [halaman, batasHalaman]);

  useEffect(() => {
    ambilDataKunjungan();
  }, [ambilDataKunjungan]);

  const ambilHalamanSebelumnya = () => {
    if (halaman > 1) setHalaman(halaman - 1);
  };

  const ambilHalamanSelanjutnya = () => {
    const totalHalaman = Math.ceil(totalKunjungan / batasHalaman);
    if (halaman < totalHalaman) setHalaman(halaman + 1);
  };

  return {
    halaman,
    totalKunjungan,
    daftarKunjungan,
    ambilHalamanSebelumnya,
    ambilHalamanSelanjutnya,
    sedangMemuatKunjungan,
  };
};

export default useTampilkanPengajuanKunjungan;
