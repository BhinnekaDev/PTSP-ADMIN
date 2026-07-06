import { useState, useEffect, useCallback } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { toast } from "react-toastify";
import { database } from "@/lib/firebaseConfig";

const useTampilkanPengajuanKunjungan = (batasHalaman = 5) => {
  const [sedangMemuatKunjungan, setSedangMemuatKunjungan] = useState(false);
  const [daftarKunjungan, setDaftarKunjungan] = useState([]);
  const [totalKunjungan, setTotalKunjungan] = useState(0);
  const [halaman, setHalaman] = useState(1);
  const auth = getAuth();

  // Fungsi untuk mendapatkan foto profil dari Google
  const ambilFotoProfilGoogle = useCallback(
    async (email, uid) => {
      try {
        const penggunaSaatIni = auth.currentUser;

        if (
          penggunaSaatIni &&
          (penggunaSaatIni.email === email || penggunaSaatIni.uid === uid)
        ) {
          return penggunaSaatIni.photoURL || null;
        }

        const penggunaRef = doc(database, "perorangan", uid);
        const penggunaDoc = await getDoc(penggunaRef);

        if (penggunaDoc.exists() && penggunaDoc.data().photoURL) {
          return penggunaDoc.data().photoURL;
        }

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

  // Fungsi untuk mendapatkan foto profil dari data pengguna
  const getFotoProfil = useCallback(
    async (dataPengguna, userId, email) => {
      let fotoProfil = null;

      // PRIORITAS 1: Field Foto_URL
      if (dataPengguna.Foto_URL) {
        fotoProfil = dataPengguna.Foto_URL;
      }
      // PRIORITAS 2: Field Foto
      else if (dataPengguna.Foto) {
        fotoProfil = dataPengguna.Foto;
      }
      // PRIORITAS 3: Field photoURL
      else if (dataPengguna.photoURL) {
        fotoProfil = dataPengguna.photoURL;
      }
      // PRIORITAS 4: Google Auth / Gravatar
      else if (email) {
        fotoProfil = await ambilFotoProfilGoogle(email, userId);
      }

      return fotoProfil;
    },
    [ambilFotoProfilGoogle],
  );

  const ambilDataKunjungan = useCallback(async () => {
    const refKunjungan = collection(database, "pengajuan_kunjungan");
    try {
      setSedangMemuatKunjungan(true);
      const snapshot = await getDocs(refKunjungan);
      const semuaDokumen = snapshot.docs;
      const totalDocs = semuaDokumen.length;
      setTotalKunjungan(totalDocs);

      const startIndex = (halaman - 1) * batasHalaman;
      const endIndex = startIndex + batasHalaman;

      const kunjungans = [];

      // Ambil semua data pengguna sekali saja untuk efisiensi
      const peroranganSnapshot = await getDocs(
        collection(database, "perorangan"),
      );
      const perusahaanSnapshot = await getDocs(
        collection(database, "perusahaan"),
      );

      const semuaPengguna = [
        ...peroranganSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })),
        ...perusahaanSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })),
      ];

      for (let i = startIndex; i < endIndex && i < totalDocs; i++) {
        const docSnapshot = semuaDokumen[i];
        const data = docSnapshot.data();
        const dataPenggunaMap = data.Data_Pengguna || {};

        const kunjunganData = {
          id: docSnapshot.id,
          ...data,
          tipePengguna: null,
          pengguna: {
            id: "",
            Nama_Lengkap: "Nama tidak tersedia",
            Email: "Email tidak tersedia",
            Foto: null,
            Foto_URL: null,
            photoURL: null,
            fotoProfil: null,
          },
        };

        // Cari pengguna yang cocok berdasarkan Email atau Nama_Lengkap
        const penggunaCocok = semuaPengguna.find(
          (pengguna) =>
            (pengguna.Email && pengguna.Email === dataPenggunaMap.Email) ||
            (pengguna.Nama_Lengkap &&
              pengguna.Nama_Lengkap === dataPenggunaMap.Nama_Lengkap),
        );

        if (penggunaCocok) {
          // Tentukan tipe pengguna
          const isPerorangan = peroranganSnapshot.docs.some(
            (doc) => doc.id === penggunaCocok.id,
          );
          const isPerusahaan = perusahaanSnapshot.docs.some(
            (doc) => doc.id === penggunaCocok.id,
          );

          let fotoProfil = null;

          if (isPerorangan) {
            kunjunganData.tipePengguna = "perorangan";
            fotoProfil = await getFotoProfil(
              penggunaCocok,
              penggunaCocok.id,
              penggunaCocok.email,
            );
          } else if (isPerusahaan) {
            kunjunganData.tipePengguna = "perusahaan";
            // Perusahaan prioritaskan Foto_URL
            if (penggunaCocok.Foto_URL) {
              fotoProfil = penggunaCocok.Foto_URL;
            } else if (penggunaCocok.Foto) {
              fotoProfil = penggunaCocok.Foto;
            } else if (penggunaCocok.photoURL) {
              fotoProfil = penggunaCocok.photoURL;
            } else if (penggunaCocok.email) {
              fotoProfil = await ambilFotoProfilGoogle(
                penggunaCocok.email,
                penggunaCocok.id,
              );
            }
          }

          kunjunganData.pengguna = {
            id: penggunaCocok.id,
            ...penggunaCocok,
            fotoProfil: fotoProfil,
            Foto_URL: penggunaCocok.Foto_URL || null,
          };
        }

        kunjungans.push(kunjunganData);
      }

      setDaftarKunjungan(kunjungans);
    } catch (error) {
      toast.error("Gagal mengambil data kunjungan: " + error.message);
      console.error("Error mengambil data kunjungan:", error);
    } finally {
      setSedangMemuatKunjungan(false);
    }
  }, [halaman, batasHalaman, getFotoProfil, ambilFotoProfilGoogle]);

  useEffect(() => {
    ambilDataKunjungan();
  }, [ambilDataKunjungan]);

  const ambilHalamanSebelumnya = () => {
    if (halaman > 1) setHalaman(halaman - 1);
  };

  const ambilHalamanSelanjutnya = () => {
    const totalHalaman = Math.ceil(totalKunjungan / batasHalaman);
    if (halaman < totalHalaman) setHalaman(halaman + 1);
  };

  return {
    halaman,
    totalKunjungan,
    daftarKunjungan,
    ambilHalamanSebelumnya,
    ambilHalamanSelanjutnya,
    sedangMemuatKunjungan,
  };
};

export default useTampilkanPengajuanKunjungan;
