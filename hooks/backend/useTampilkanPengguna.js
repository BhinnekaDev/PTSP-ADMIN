import { useState, useEffect, useCallback } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { toast } from "react-toastify";
import { database } from "@/lib/firebaseConfig";

const useTampilkanPengguna = (batasHalaman = 5) => {
  const [sedangMemuatTampilkanPengguna, setSedangMemuatTampilkanPengguna] =
    useState(false);
  const [daftarPengguna, setDaftarPengguna] = useState([]);
  const [totalPengguna, setTotalPengguna] = useState(0);
  const [halaman, setHalaman] = useState(1);
  const auth = getAuth();

  // Fungsi untuk mendapatkan foto profil dari Google
  const ambilFotoProfilGoogle = useCallback(
    async (email, uid) => {
      try {
        // Cara 1: Jika pengguna login dengan Google, foto tersedia di auth.currentUser
        const penggunaSaatIni = auth.currentUser;

        // Jika pengguna yang dicari adalah pengguna yang sedang login
        if (
          penggunaSaatIni &&
          (penggunaSaatIni.email === email || penggunaSaatIni.uid === uid)
        ) {
          return penggunaSaatIni.photoURL || null;
        }

        // Cara 2: Jika Anda menyimpan photoURL di dokumen pengguna
        // Coba ambil dari field photoURL di Firestore
        const penggunaRef = doc(database, "perorangan", uid);
        const penggunaDoc = await getDoc(penggunaRef);

        if (penggunaDoc.exists() && penggunaDoc.data().photoURL) {
          return penggunaDoc.data().photoURL;
        }

        // Cara 3: Menggunakan Google People API (perlu implementasi server-side)
        // Atau menggunakan Gravatar berdasarkan email
        if (email) {
          const emailHash = await hashEmail(email);
          return `https://www.gravatar.com/avatar/${emailHash}?d=identicon`;
        }

        return null;
      } catch (error) {
        console.error("Gagal mengambil foto profil:", error);
        return null;
      }
    },
    [auth],
  );

  // Fungsi helper untuk hash email (Gravatar)
  const hashEmail = async (email) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(email.trim().toLowerCase());
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const ambilDaftarPengguna = useCallback(async () => {
    const referensiPengguna = collection(database, "perorangan");
    try {
      setSedangMemuatTampilkanPengguna(true);
      const snapshot = await getDocs(referensiPengguna);
      const penggunaList = [];

      const totalDocs = snapshot.docs.length;
      setTotalPengguna(totalDocs);

      const startIndex = (halaman - 1) * batasHalaman;
      const endIndex = startIndex + batasHalaman;

      for (let i = startIndex; i < endIndex && i < totalDocs; i++) {
        const docSnapshot = snapshot.docs[i];
        const penggunaRef = doc(database, "perorangan", docSnapshot.id);
        const penggunaDoc = await getDoc(penggunaRef);

        if (penggunaDoc.exists()) {
          const dataPengguna = penggunaDoc.data();

          // Ambil foto profil dari berbagai sumber
          let fotoProfil = null;

          // PRIORITAS 1: Ambil dari field Foto_URL (sesuai dengan struktur Firestore)
          if (dataPengguna.Foto_URL) {
            fotoProfil = dataPengguna.Foto_URL;
          }
          // PRIORITAS 2: Ambil dari field photoURL jika ada
          else if (dataPengguna.photoURL) {
            fotoProfil = dataPengguna.photoURL;
          }
          // PRIORITAS 3: Coba ambil dari Google Auth berdasarkan email
          else if (dataPengguna.email) {
            fotoProfil = await ambilFotoProfilGoogle(
              dataPengguna.email,
              penggunaDoc.id,
            );
          }

          penggunaList.push({
            id: penggunaDoc.id,
            ...dataPengguna,
            fotoProfil: fotoProfil, // Tambahkan field foto profil untuk kemudahan akses
            Foto_URL: dataPengguna.Foto_URL || null, // Pastikan field Foto_URL tetap tersedia
          });
        }
      }

      setDaftarPengguna(penggunaList);
    } catch (error) {
      toast.error(
        "Terjadi kesalahan saat mengambil daftar pengguna: " + error.message,
      );
    } finally {
      setSedangMemuatTampilkanPengguna(false);
    }
  }, [halaman, batasHalaman, ambilFotoProfilGoogle]);

  useEffect(() => {
    ambilDaftarPengguna();
  }, [ambilDaftarPengguna]);

  const ambilHalamanSebelumnya = () => {
    if (halaman > 1) {
      setHalaman(halaman - 1);
    }
  };

  const ambilHalamanSelanjutnya = () => {
    const totalHalaman = Math.ceil(totalPengguna / batasHalaman);
    if (halaman < totalHalaman) {
      setHalaman(halaman + 1);
    }
  };

  return {
    halaman,
    totalPengguna,
    daftarPengguna,
    ambilHalamanSebelumnya,
    ambilHalamanSelanjutnya,
    sedangMemuatTampilkanPengguna,
  };
};

export default useTampilkanPengguna;
