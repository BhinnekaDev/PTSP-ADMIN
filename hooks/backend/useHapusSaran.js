import { useState } from "react";
import { doc, deleteDoc, getDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { toast } from "react-toastify";
import { database, storage } from "@/lib/firebaseConfig";

const useHapusSaran = () => {
  const [sedangMemuatHapus, setSedangMemuatHapus] = useState(false);

  const hapusSaran = async (idSaran) => {
    try {
      setSedangMemuatHapus(true);

      const referensiSaran = doc(database, "saran", idSaran);
      const docSnap = await getDoc(referensiSaran);

      if (docSnap.exists()) {
        const dataSaran = docSnap.data();
        const fileSaran = dataSaran.File_Saran;

        await deleteDoc(referensiSaran);

        if (fileSaran) {
          try {
            // Ambil path relatif dari URL Firebase Storage
            const match = fileSaran.match(/\/o\/(.*?)\?/);
            const filePath = match ? decodeURIComponent(match[1]) : null;

            if (filePath) {
              const referensiFile = ref(storage, filePath);
              await deleteObject(referensiFile);
              console.log("File berhasil dihapus dari Storage");
            } else {
              console.warn(
                "Gagal mengambil path dari URL. File tidak dihapus."
              );
            }
          } catch (error) {
            console.error("Gagal menghapus file saran:", error);
          }
        }

        toast.success("Saran berhasil dihapus!");
      } else {
        toast.error("Data saran tidak ditemukan!");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat menghapus saran: " + error.message);
    } finally {
      setSedangMemuatHapus(false);
    }
  };

  return {
    sedangMemuatHapus,
    hapusSaran,
  };
};

export default useHapusSaran;
