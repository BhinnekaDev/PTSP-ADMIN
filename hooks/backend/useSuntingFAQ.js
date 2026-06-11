import { useState } from "react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { database } from "@/lib/firebaseConfig";
import { toast } from "react-toastify";

const useSuntingFAQ = () => {
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [error, setError] = useState(null);

  const suntingFAQ = async (id, dataFAQ, onSuccess) => {
    if (!id) {
      toast.error("ID FAQ tidak ditemukan!");
      return false;
    }

    setSedangMemuat(true);
    setError(null);

    try {
      const faqRef = doc(database, "faq", id);
      await updateDoc(faqRef, {
        ...dataFAQ,
        updated_at: serverTimestamp(),
      });

      toast.success("FAQ berhasil diperbarui!");
      if (onSuccess) onSuccess();
      return true;
    } catch (err) {
      console.error("Error mengupdate FAQ:", err);
      const errorMsg = "Gagal memperbarui FAQ";
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`);
      return false;
    } finally {
      setSedangMemuat(false);
    }
  };

  return {
    suntingFAQ,
    sedangMemuat,
    error,
  };
};

export default useSuntingFAQ;
