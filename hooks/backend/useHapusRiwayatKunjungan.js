import { useState } from "react";
import { doc, deleteDoc, getDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { toast } from "react-toastify";
import { database, storage } from "@/lib/firebaseConfig";

const useHapusRiwayatKunjungan = () => {
  const [sedangMemuatHapus, setSedangMemuatHapus] = useState(false);

  const hapusRiwayatKunjungan = async (idRiwayatKunjungan) => {
    try {
      setSedangMemuatHapus(true);

      const referensiRiwayatKunjungan = doc(
        database,
        "riwayat_kunjungan",
        idRiwayatKunjungan
      );
      const docSnap = await getDoc(referensiRiwayatKunjungan);

      if (docSnap.exists()) {
        const dataRiwayat = docSnap.data();
        const fileLampiran = dataRiwayat.Lampiran_Kunjungan;

        await deleteDoc(referensiRiwayatKunjungan);

        if (fileLampiran) {
          try {
            const match = fileLampiran.match(/\/o\/(.*?)\?/);
            const filePath = match ? decodeURIComponent(match[1]) : null;

            if (filePath) {
              const referensiFile = ref(storage, filePath);
              await deleteObject(referensiFile);
              console.log("Lampiran berhasil dihapus dari Storage");
            } else {
              console.warn(
                "Gagal mengambil path dari URL. Lampiran tidak dihapus."
              );
            }
          } catch (error) {
            console.error("Gagal menghapus lampiran kunjungan:", error);
          }
        }

        toast.success("Riwayat kunjungan berhasil dihapus!");
      } else {
        toast.error("Data riwayat kunjungan tidak ditemukan!");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat menghapus: " + error.message);
    } finally {
      setSedangMemuatHapus(false);
    }
  };

  return {
    sedangMemuatHapus,
    hapusRiwayatKunjungan,
  };
};

export default useHapusRiwayatKunjungan;
