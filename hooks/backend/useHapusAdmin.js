import { useState } from "react";
import { toast } from "react-toastify";
import { getStorage, ref, deleteObject } from "firebase/storage";
import { doc, getDoc } from "firebase/firestore";
import { database } from "@/lib/firebaseConfig";

const useHapusAdmin = () => {
  const [sedangMemuatHapusAdmin, setSedangMemuatHapusAdmin] = useState(false);

  const hapusAdmin = async (id) => {
    if (typeof id !== "string" || !id.trim()) {
      return toast.error("ID tidak valid.");
    }

    setSedangMemuatHapusAdmin(true);

    try {
      const referensiAdmin = doc(database, "admin", id);
      const snapshot = await getDoc(referensiAdmin);

      if (!snapshot.exists()) {
        return toast.error("Data admin tidak ditemukan.");
      }

      const dataAdmin = snapshot.data();
      const fotoUrl = dataAdmin.Foto_Profil;

      if (fotoUrl) {
        const storage = getStorage();
        const fotoRef = ref(storage, fotoUrl);

        try {
          await deleteObject(fotoRef);
          toast.success("Foto profil berhasil dihapus.");
        } catch (error) {
          console.error("Gagal menghapus foto dari storage:", error);
          toast.warn(
            "Foto tidak dapat dihapus, tetapi data admin tetap akan dihapus."
          );
        }
      } else {
        toast.warn("Admin tidak memiliki foto profil.");
      }

      const res = await fetch("/api/hapusAdmin", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        return toast.error(
          `Gagal menghapus admin: ${
            errorData.error || "Kesalahan tidak diketahui."
          }`
        );
      }

      const data = await res.json();
      toast.success(data.message || "Admin berhasil dihapus!");
    } catch (error) {
      toast.error("Terjadi kesalahan. Periksa koneksi internet Anda.");
      console.error("Error:", error);
    } finally {
      setSedangMemuatHapusAdmin(false);
    }
  };

  return { sedangMemuatHapusAdmin, hapusAdmin };
};

export default useHapusAdmin;
