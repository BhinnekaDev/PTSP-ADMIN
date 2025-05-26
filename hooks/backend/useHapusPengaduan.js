import { useState } from "react";
import { doc, deleteDoc, getDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { database } from "@/lib/firebaseConfig";

const useHapusPengaduan = () => {
  const [sedangMemuatHapus, setSedangMemuatHapus] = useState(false);

  const hapusPengaduan = async (idPengaduan) => {
    try {
      setSedangMemuatHapus(true);

      const referensiPengaduan = doc(database, "pengaduan", idPengaduan);
      const docSnap = await getDoc(referensiPengaduan);

      if (docSnap.exists()) {
        await deleteDoc(referensiPengaduan);
        toast.success("Pengaduan berhasil dihapus!");
      } else {
        toast.error("Data pengaduan tidak ditemukan!");
      }
    } catch (error) {
      toast.error(
        "Terjadi kesalahan saat menghapus pengaduan: " + error.message
      );
    } finally {
      setSedangMemuatHapus(false);
    }
  };

  return {
    sedangMemuatHapus,
    hapusPengaduan,
  };
};

export default useHapusPengaduan;
