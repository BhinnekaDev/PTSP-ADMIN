import { useState } from "react";
import { toast } from "react-toastify";
import { getStorage, ref, deleteObject } from "firebase/storage";
import { doc, getDoc } from "firebase/firestore";
// Konfigurasi Firebase
import { database } from "@/lib/firebaseConfig";

const useHapusPerorangan = () => {
  const [sedangMemuatHapusPerorangan, setSedangMemuatHapusPerorangan] =
    useState(false);

  const hapusPerorangan = async (id) => {
    if (!id || typeof id !== "string" || !id.trim()) {
      return toast.error("ID perorangan tidak valid.");
    }

    setSedangMemuatHapusPerorangan(true);

    try {
      const referensiPerorangan = doc(database, "perorangan", id);
      const snapshot = await getDoc(referensiPerorangan);

      if (!snapshot.exists()) {
        return toast.error("Data perorangan tidak ditemukan.");
      }

      const dataPerorangan = snapshot.data();
      const fotoUrl = dataPerorangan.Foto_Perorangan;

      if (fotoUrl) {
        const storage = getStorage();
        const fotoRef = ref(storage, fotoUrl);

        try {
          await deleteObject(fotoRef);
          toast.success("Foto profil berhasil dihapus.");
        } catch (error) {
          console.error("Gagal menghapus foto dari storage:", error);
          toast.warn(
            "Foto tidak dapat dihapus, tetapi data perorangan tetap akan dihapus."
          );
        }
      } else {
        toast.warn("Perorangan tidak memiliki foto profil.");
      }

      const res = await fetch("/api/hapusAdmin", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (!res.ok) {
        return toast.error(`Gagal menghapus perorangan: ${data.error}`);
      }

      toast.success(data.message);
    } catch (error) {
      toast.error("Terjadi kesalahan saat menghapus perorangan.");
      console.error("Error:", error);
    } finally {
      setSedangMemuatHapusPerorangan(false);
    }
  };

  return { sedangMemuatHapusPerorangan, hapusPerorangan };
};

export default useHapusPerorangan;
