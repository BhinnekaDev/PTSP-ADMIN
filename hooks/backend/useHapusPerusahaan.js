import { useState } from "react";
import { toast } from "react-toastify";
import { getStorage, ref, deleteObject } from "firebase/storage";
import { doc, getDoc } from "firebase/firestore";
// Konfigurasi Firebase
import { database } from "@/lib/firebaseConfig";

const useHapusPerusahaan = () => {
  const [sedangMemuatHapusPerusahaan, setSedangMemuatHapusPerusahaan] =
    useState(false);

  const hapusPerusahaan = async (id) => {
    if (!id || typeof id !== "string" || !id.trim()) {
      return toast.error("ID perusahaan tidak valid.");
    }

    setSedangMemuatHapusPerusahaan(true);

    try {
      const referensiPerusahaan = doc(database, "perusahaan", id);
      const snapshot = await getDoc(referensiPerusahaan);

      if (!snapshot.exists()) {
        return toast.error("Data perusahaan tidak ditemukan.");
      }

      const dataPerusahaan = snapshot.data();
      const fotoUrl = dataPerusahaan.Foto_Perusahaan;

      if (fotoUrl) {
        const storage = getStorage();
        const fotoRef = ref(storage, fotoUrl);

        try {
          await deleteObject(fotoRef);
          toast.success("Foto profil berhasil dihapus.");
        } catch (error) {
          console.error("Gagal menghapus foto dari storage:", error);
          toast.warn(
            "Foto tidak dapat dihapus, tetapi data perusahaan tetap akan dihapus."
          );
        }
      } else {
        toast.warn("Perusahaan tidak memiliki foto profil.");
      }

      const res = await fetch("/api/hapusAdmin", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (!res.ok) {
        return toast.error(`Gagal menghapus perusahaan: ${data.error}`);
      }

      toast.success(data.message);
    } catch (error) {
      toast.error("Terjadi kesalahan saat menghapus perusahaan.");
      console.error("Error:", error);
    } finally {
      setSedangMemuatHapusPerusahaan(false);
    }
  };

  return { sedangMemuatHapusPerusahaan, hapusPerusahaan };
};

export default useHapusPerusahaan;
