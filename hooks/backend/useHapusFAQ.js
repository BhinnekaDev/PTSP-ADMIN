// hooks/backend/useHapusFAQ.js
import { useState } from "react";
import { doc, deleteDoc } from "firebase/firestore";
import { database } from "@/lib/firebaseConfig";
import { toast } from "react-toastify";

const useHapusFAQ = () => {
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fungsi untuk menghapus FAQ
   * @param {string} id - ID dokumen FAQ yang akan dihapus
   * @param {object} options - Opsi tambahan (onSuccess, onError)
   */
  const hapusFAQ = async (id, options = {}) => {
    if (!id) {
      const errorMsg = "ID FAQ tidak ditemukan!";
      setError(errorMsg);
      toast.error(errorMsg);
      if (options.onError) options.onError(errorMsg);
      return false;
    }

    setSedangMemuat(true);
    setError(null);

    try {
      const faqRef = doc(database, "faq", id);
      await deleteDoc(faqRef);

      toast.success("✅ FAQ berhasil dihapus!");
      if (options.onSuccess) options.onSuccess();
      return true;
    } catch (err) {
      console.error("Error menghapus FAQ:", err);
      const errorMsg = err.message || "Gagal menghapus FAQ";
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`);
      if (options.onError) options.onError(errorMsg);
      return false;
    } finally {
      setSedangMemuat(false);
    }
  };

  /**
   * Fungsi untuk menghapus multiple FAQ (jika diperlukan)
   * @param {array} ids - Array ID dokumen FAQ yang akan dihapus
   * @param {object} options - Opsi tambahan
   */
  const hapusMultipleFAQ = async (ids, options = {}) => {
    if (!ids || ids.length === 0) {
      const errorMsg = "Tidak ada FAQ yang dipilih!";
      setError(errorMsg);
      toast.error(errorMsg);
      if (options.onError) options.onError(errorMsg);
      return false;
    }

    setSedangMemuat(true);
    setError(null);

    try {
      let sukses = 0;
      let gagal = 0;

      for (const id of ids) {
        try {
          const faqRef = doc(database, "faq", id);
          await deleteDoc(faqRef);
          sukses++;
        } catch (err) {
          console.error(`Error menghapus FAQ ${id}:`, err);
          gagal++;
        }
      }

      if (sukses > 0) {
        toast.success(`✅ ${sukses} FAQ berhasil dihapus!`);
      }
      if (gagal > 0) {
        toast.warning(`⚠️ ${gagal} FAQ gagal dihapus`);
      }

      if (options.onSuccess) options.onSuccess({ sukses, gagal });
      return true;
    } catch (err) {
      console.error("Error menghapus multiple FAQ:", err);
      const errorMsg = "Gagal menghapus FAQ";
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`);
      if (options.onError) options.onError(errorMsg);
      return false;
    } finally {
      setSedangMemuat(false);
    }
  };

  return {
    hapusFAQ,
    hapusMultipleFAQ,
    sedangMemuat,
    error,
  };
};

export default useHapusFAQ;
