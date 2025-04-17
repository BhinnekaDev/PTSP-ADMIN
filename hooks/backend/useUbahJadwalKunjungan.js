import { database } from "@/lib/firebaseConfig";
import axios from "axios";
import { doc, updateDoc } from "firebase/firestore";
import { useState } from "react";

const useUbahJadwalKunjungan = () => {
  const [loadingUbah, setLoadingUbah] = useState(false);
  const [error, setError] = useState(null);
  const [berhasil, setBerhasil] = useState(false);

  const ubahJadwal = async (id, tanggal, jam, email, alasan) => {
    setLoadingUbah(true);
    setError(null);
    setBerhasil(false);

    try {
      if (!tanggal || !jam || !alasan.trim()) {
        throw new Error("Tanggal, jam, dan alasan wajib diisi.");
      }

      await updateDoc(doc(database, "pengajuan_kunjungan", id), {
        TanggalKunjungan: tanggal,
        JamKunjungan: jam,
      });

      await axios.post("/api/kirim-email", {
        email: email,
        subject: "Perubahan Jadwal Kunjungan",
        message: `Jadwal kunjungan Anda telah diperbarui:\n\nTanggal: ${tanggal}\nJam: ${jam}\n\nAlasan perubahan: ${alasan}`,
      });

      setBerhasil(true);
    } catch (err) {
      console.error("Gagal mengubah jadwal:", err);
      setError(err.message);
    } finally {
      setLoadingUbah(false);
    }
  };

  return { ubahJadwal, loadingUbah, berhasil, error };
};

export default useUbahJadwalKunjungan;
