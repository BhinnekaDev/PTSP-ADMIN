import { useState, useCallback } from "react";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { database } from "@/lib/firebaseConfig";
import { toast } from "react-toastify";

const useKirimPesanPengguna = () => {
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [error, setError] = useState(null);
  const [daftarPesan, setDaftarPesan] = useState([]);
  const [ruangChatAktif, setRuangChatAktif] = useState(null);

  // Fungsi untuk mendapatkan atau membuat ruang chat
  const dapatkanAtauBuatRuangChat = async (
    idPengirim,
    idPenerima,
    tipePenerima
  ) => {
    try {
      // Format ID ruang yang konsisten
      const idRuang = [idPengirim, idPenerima].sort().join("_");
      const referensiRuangChat = doc(database, "chatRooms", idRuang);

      const dokumenSnapshot = await getDoc(referensiRuangChat);

      if (!dokumenSnapshot.exists()) {
        // Buat ruang baru jika belum ada
        await setDoc(referensiRuangChat, {
          peserta: [idPengirim, idPenerima],
          tipePeserta: {
            [idPengirim]: "admin",
            [idPenerima]: tipePenerima,
          },
          pesanTerakhir: "",
          waktuPesanTerakhir: serverTimestamp(),
          dibuatPada: serverTimestamp(),
        });

        // Buat subkoleksi untuk pesan
        await addDoc(collection(referensiRuangChat, "pesan"), {
          pesanSistem: true,
          teks: "Ruang chat dibuat",
          dibuatPada: serverTimestamp(),
        });
      }

      return idRuang;
    } catch (err) {
      console.error("Gagal mendapatkan/membuat ruang chat:", err);
      throw err;
    }
  };

  // Fungsi untuk mengirim pesan
  const kirimPesan = async ({
    idPengirim,
    idPenerima,
    pesan,
    file,
    tipePenerima,
  }) => {
    setSedangMemuat(true);
    setError(null);

    try {
      // Dapatkan atau buat ruang chat
      const idRuang = await dapatkanAtauBuatRuangChat(
        idPengirim,
        idPenerima,
        tipePenerima
      );
      const referensiRuangChat = doc(database, "chatRooms", idRuang);
      const referensiPesan = collection(referensiRuangChat, "pesan");

      // Data pesan
      const dataPesan = {
        idPengirim,
        idPenerima,
        teks: pesan,
        file: file
          ? {
              nama: file.name,
              tipe: file.type,
              ukuran: file.size,
              url: "", // URL akan diisi setelah upload
            }
          : null,
        sudahDibaca: false,
        dibuatPada: serverTimestamp(),
      };

      // Tambahkan pesan ke subkoleksi
      await addDoc(referensiPesan, dataPesan);

      // Perbarui pesan terakhir di ruang
      await updateDoc(referensiRuangChat, {
        pesanTerakhir: pesan || (file ? `File: ${file.name}` : ""),
        waktuPesanTerakhir: serverTimestamp(),
      });

      return true;
    } catch (err) {
      console.error("Gagal mengirim pesan:", err);
      setError(err.message);
      toast.error("Gagal mengirim pesan: " + err.message);
      return false;
    } finally {
      setSedangMemuat(false);
    }
  };

  // Fungsi untuk subscribe ke pembaruan real-time
  const berlanggananRuangChat = useCallback((idRuang, callback) => {
    if (!idRuang) return;

    const referensiRuangChat = doc(database, "chatRooms", idRuang);
    const referensiPesan = collection(referensiRuangChat, "pesan");

    const q = query(referensiPesan, orderBy("dibuatPada", "asc"));

    const berhentiBerlangganan = onSnapshot(q, (querySnapshot) => {
      const pesan = [];
      querySnapshot.forEach((doc) => {
        pesan.push({
          id: doc.id,
          ...doc.data(),
          // Konversi Firestore timestamp ke JS Date
          dibuatPada: doc.data().dibuatPada?.toDate() || new Date(),
        });
      });

      callback(pesan);
    });

    return berhentiBerlangganan;
  }, []);

  // Fungsi untuk mendapatkan semua ruang chat untuk seorang pengguna
  const dapatkanRuangChatUntukPengguna = async (idPengguna) => {
    try {
      const referensiRuangChat = collection(database, "chatRooms");
      const q = query(
        referensiRuangChat,
        where("peserta", "array-contains", idPengguna)
      );

      const querySnapshot = await getDocs(q);
      const ruangan = [];

      querySnapshot.forEach((doc) => {
        ruangan.push({
          id: doc.id,
          ...doc.data(),
          waktuPesanTerakhir:
            doc.data().waktuPesanTerakhir?.toDate() || new Date(),
        });
      });

      // Urutkan berdasarkan pesan terakhir
      return ruangan.sort(
        (a, b) => b.waktuPesanTerakhir - a.waktuPesanTerakhir
      );
    } catch (err) {
      console.error("Gagal mendapatkan ruang chat:", err);
      throw err;
    }
  };

  // Fungsi untuk menandai pesan sebagai sudah dibaca
  const tandaiPesanSudahDibaca = async (idRuang, idPengguna) => {
    try {
      const referensiRuangChat = doc(database, "chatRooms", idRuang);
      const referensiPesan = collection(referensiRuangChat, "pesan");

      // Dapatkan pesan yang belum dibaca
      const q = query(
        referensiPesan,
        where("idPenerima", "==", idPengguna),
        where("sudahDibaca", "==", false)
      );

      const querySnapshot = await getDocs(q);

      // Perbarui semua pesan yang belum dibaca
      const pembaruanBatch = [];
      querySnapshot.forEach((doc) => {
        pembaruanBatch.push(updateDoc(doc.ref, { sudahDibaca: true }));
      });

      await Promise.all(pembaruanBatch);
    } catch (err) {
      console.error("Gagal menandai pesan sebagai sudah dibaca:", err);
    }
  };

  return {
    sedangMemuat,
    error,
    daftarPesan,
    kirimPesan,
    berlanggananRuangChat,
    dapatkanRuangChatUntukPengguna,
    tandaiPesanSudahDibaca,
    ruangChatAktif,
    setRuangChatAktif,
  };
};

export default useKirimPesanPengguna;
