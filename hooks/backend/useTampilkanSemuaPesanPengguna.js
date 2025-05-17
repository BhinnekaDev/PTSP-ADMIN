import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { toast } from "react-toastify";
import { database, storage } from "@/lib/firebaseConfig";
import { v4 as uuidv4 } from "uuid";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const useTampilkanSemuaPesanPengguna = () => {
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [semuaPengguna, setSemuaPengguna] = useState([]);
  const [daftarPercakapan, setDaftarPercakapan] = useState([]);
  const [pesan, setPesan] = useState([]);

  const convertTimestamp = (timestamp) => {
    if (!timestamp) return null;
    try {
      if (timestamp instanceof Date) return timestamp;
      if (timestamp.toDate) return timestamp.toDate();

      return new Date(timestamp);
    } catch (error) {
      console.error("Gagal mengkonversi timestamp:", error);
      return null;
    }
  };

  // Ambil semua data pengguna
  const ambilSemuaPengguna = async () => {
    setSedangMemuat(true);
    try {
      const koleksiPerorangan = collection(database, "perorangan");
      const koleksiPerusahaan = collection(database, "perusahaan");

      const [snapshotPerorangan, snapshotPerusahaan] = await Promise.all([
        getDocs(koleksiPerorangan),
        getDocs(koleksiPerusahaan),
      ]);

      const penggunaPerorangan = snapshotPerorangan.docs.map((doc) => ({
        id: doc.id,
        tipe: "perorangan",
        ...doc.data(),
      }));

      const penggunaPerusahaan = snapshotPerusahaan.docs.map((doc) => ({
        id: doc.id,
        tipe: "perusahaan",
        ...doc.data(),
      }));

      const gabunganPengguna = [...penggunaPerorangan, ...penggunaPerusahaan];
      setSemuaPengguna(gabunganPengguna);
    } catch (error) {
      toast.error("Gagal mengambil data pengguna: " + error.message);
    } finally {
      setSedangMemuat(false);
    }
  };

  // Dapatkan daftar percakapan
  const dapatkanDaftarPercakapan = (userID) => {
    if (!userID) return;

    const q = query(
      collection(database, "chatRooms"),
      where("peserta", "array-contains", userID),
      orderBy("terakhirDiperbarui", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const percakapan = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        terakhirDiperbarui: convertTimestamp(doc.data().terakhirDiperbarui),
      }));
      setDaftarPercakapan(percakapan);
    });

    return unsubscribe;
  };

  // Dapatkan pesan dalam ruang chat
  const dapatkanPesan = (idRuangChat) => {
    if (!idRuangChat) return;

    const q = query(
      collection(database, "chatRooms", idRuangChat, "pesan"),
      orderBy("waktu", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dataPesan = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          waktu: convertTimestamp(data.waktu),
        };
      });
      setPesan(dataPesan);
    });

    return unsubscribe;
  };

  // Kirim pesan baru
  const kirimPesan = async ({
    adminId,
    penerimaId,
    isiPesan,
    tipePenerima,
    file,
  }) => {
    try {
      setSedangMemuat(true);

      if (!adminId || !penerimaId || !tipePenerima) {
        throw new Error(
          "ID Admin, ID Penerima, dan Tipe Penerima wajib diisi."
        );
      }

      const idRuangChat = [adminId, penerimaId].sort().join("_");
      const refRuangChat = doc(database, "chatRooms", idRuangChat);

      const idPesan = uuidv4();

      let urlFile = null;
      let namaFile = null;

      // ✅ Jika ada file, upload ke Storage
      if (file) {
        const fileRef = ref(
          storage,
          `chat_files/${idRuangChat}/${idPesan}_${file.name}`
        );
        await uploadBytes(fileRef, file);
        urlFile = await getDownloadURL(fileRef);
        namaFile = file.name;
      }

      // ✅ Data pesan - semua field terisi
      const dataPesan = {
        id: idPesan,
        idPengirim: adminId,
        tipePengirim: "admin",
        idPenerima: penerimaId,
        tipePenerima: tipePenerima,
        isi: isiPesan ?? (file ? "File dikirim" : ""),
        waktu: serverTimestamp(),
        sudahDibaca: false,
        urlFile: urlFile,
        namaFile: namaFile,
      };

      // ✅ Data ruang chat utama
      const dataRuangChat = {
        peserta: [adminId, penerimaId],
        tipePeserta: ["admin", tipePenerima],
        pesanTerakhir: isiPesan ?? (file ? "File dikirim" : ""),
        terakhirDiperbarui: serverTimestamp(),
      };

      // ✅ Simpan ruang chat (dengan merge)
      await setDoc(refRuangChat, dataRuangChat, { merge: true });

      // ✅ Simpan pesan
      const refPesan = doc(
        database,
        "chatRooms",
        idRuangChat,
        "pesan",
        idPesan
      );
      await setDoc(refPesan, dataPesan);

      toast.success("✅ Pesan berhasil dikirim.");
    } catch (error) {
      console.error("❌ ERROR kirimPesan:", error);
      toast.error("❌ Gagal mengirim pesan: " + error.message);
    } finally {
      setSedangMemuat(false);
    }
  };

  useEffect(() => {
    ambilSemuaPengguna();
  }, []);

  return {
    sedangMemuat,
    semuaPengguna,
    daftarPercakapan,
    pesan,
    dapatkanDaftarPercakapan,
    dapatkanPesan,
    kirimPesan,
  };
};

export default useTampilkanSemuaPesanPengguna;
