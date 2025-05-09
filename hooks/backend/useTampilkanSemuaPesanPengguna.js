import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { toast } from "react-toastify";
import { database } from "@/lib/firebaseConfig";

const useTampilkanSemuaPesanPengguna = () => {
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [semuaPengguna, setSemuaPengguna] = useState([]);

  const ambilSemuaPengguna = async () => {
    setSedangMemuat(true);
    try {
      const koleksiPerorangan = collection(database, "perorangan");
      const koleksiPerusahaan = collection(database, "perusahaan");

      const [snapshotPerorangan, snapshotPerusahaan] = await Promise.all([
        getDocs(koleksiPerorangan),
        getDocs(koleksiPerusahaan),
      ]);

      const penggunaPerorangan = snapshotPerorangan.docs.map((doc) => ({
        id: doc.id,
        tipe: "perorangan",
        ...doc.data(),
      }));

      const penggunaPerusahaan = snapshotPerusahaan.docs.map((doc) => ({
        id: doc.id,
        tipe: "perusahaan",
        ...doc.data(),
      }));

      const gabunganPengguna = [...penggunaPerorangan, ...penggunaPerusahaan];
      setSemuaPengguna(gabunganPengguna);
    } catch (error) {
      toast.error("Gagal mengambil data pengguna: " + error.message);
    } finally {
      setSedangMemuat(false);
    }
  };

  useEffect(() => {
    ambilSemuaPengguna();
  }, []);

  return {
    sedangMemuat,
    semuaPengguna,
  };
};

export default useTampilkanSemuaPesanPengguna;
