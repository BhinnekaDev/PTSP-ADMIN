import { database, storage } from "@/lib/firebaseConfig";
import axios from "axios";
import { deleteDoc, doc, getDoc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { useState } from "react";

const useTolakPengajuanKunjungan = () => {
  const [loading, setLoading] = useState(false);
  const [berhasil, setBerhasil] = useState(false);
  const [error, setError] = useState(null);

  const tolakKunjungan = async (id, email, alasan) => {
    setLoading(true);
    setError(null);
    setBerhasil(false);

    try {
      await axios.post("/api/kirim-email", {
        email,
        subject: "Pengajuan Kunjungan Ditolak",
        message: `Maaf, pengajuan kunjungan Anda telah ditolak.\n\nAlasan: ${alasan}`,
      });

      const docRef = doc(database, "pengajuan_kunjungan", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const fileUrl = data.FileURL;

        if (fileUrl) {
          const filePath = decodeURIComponent(
            fileUrl.split("/o/")[1].split("?")[0].replace(/%2F/g, "/")
          );

          const fileRef = ref(storage, filePath);
          await deleteObject(fileRef);
        }

        await deleteDoc(docRef);
      }

      setBerhasil(true);
    } catch (err) {
      console.error("Gagal menolak pengajuan:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { tolakKunjungan, loading, berhasil, error };
};

export default useTolakPengajuanKunjungan;
