import { useState, useEffect, useCallback } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { toast } from "react-toastify";
import { database } from "@/lib/firebaseConfig";

const useTampilkanSaran = (batasHalaman = 5) => {
  const [sedangMemuatSaran, setSedangMemuatSaran] = useState(false);
  const [daftarSaran, setDaftarSaran] = useState([]);
  const [totalSaran, setTotalSaran] = useState(0);
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

      // PRIORITAS 1: Field Foto_URL (untuk perusahaan yang punya logo)
      if (dataPengguna.Foto_URL) {
        fotoProfil = dataPengguna.Foto_URL;
      }
      // PRIORITAS 2: Field Foto (untuk perorangan)
      else if (dataPengguna.Foto) {
        fotoProfil = dataPengguna.Foto;
      }
      // PRIORITAS 3: Field photoURL (dari Google Auth)
      else if (dataPengguna.photoURL) {
        fotoProfil = dataPengguna.photoURL;
      }
      // PRIORITAS 4: Coba ambil dari Google Auth berdasarkan email
      else if (email) {
        fotoProfil = await ambilFotoProfilGoogle(email, userId);
      }
      // PRIORITAS 5: Untuk perusahaan, gunakan logo default atau null

      return fotoProfil;
    },
    [ambilFotoProfilGoogle],
  );

  const ambilDaftarSaran = useCallback(async () => {
    const referensiSaran = collection(database, "saran");
    try {
      setSedangMemuatSaran(true);
      const snapshot = await getDocs(referensiSaran);
      const semuaSaran = [];

      const totalDocs = snapshot.docs.length;
      setTotalSaran(totalDocs);

      const startIndex = (halaman - 1) * batasHalaman;
      const endIndex = startIndex + batasHalaman;

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
        const docSnapshot = snapshot.docs[i];
        const saranRef = doc(database, "saran", docSnapshot.id);
        const saranDoc = await getDoc(saranRef);

        if (saranDoc.exists()) {
          const data = saranDoc.data();

          const saranData = {
            id: saranDoc.id,
            ID_Pengguna: data.ID_Pengguna || null,
            tipePengguna: null,
            pengguna: {
              id: "",
              Foto: null,
              Foto_URL: null,
              photoURL: null,
              fotoProfil: null,
              Nama_Lengkap: data.Nama || "Nama tidak tersedia",
              Email: data.Email || "Email tidak tersedia",
            },
            Nama: data.Nama || "Nama tidak tersedia",
            Email: data.Email || "Email tidak tersedia",
            Saran: data.Saran || "Tidak ada saran",
            File_Saran: data.File_Saran || null,
            Tanggal_Pembuatan: data.Tanggal_Pembuatan || null,
            ...data,
          };

          // Cari pengguna berdasarkan ID_Pengguna atau Email/Nama
          let penggunaCocok = null;

          if (saranData.ID_Pengguna) {
            penggunaCocok = semuaPengguna.find(
              (pengguna) => pengguna.id === saranData.ID_Pengguna,
            );
          }

          // Jika tidak ditemukan berdasarkan ID, cari berdasarkan Email
          if (!penggunaCocok && data.Email) {
            penggunaCocok = semuaPengguna.find(
              (pengguna) => pengguna.Email === data.Email,
            );
          }

          // Jika masih tidak ditemukan, cari berdasarkan Nama
          if (!penggunaCocok && data.Nama) {
            penggunaCocok = semuaPengguna.find(
              (pengguna) => pengguna.Nama_Lengkap === data.Nama,
            );
          }

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
              saranData.tipePengguna = "perorangan";
              fotoProfil = await getFotoProfil(
                penggunaCocok,
                penggunaCocok.id,
                penggunaCocok.email || data.Email,
              );
            } else if (isPerusahaan) {
              saranData.tipePengguna = "perusahaan";
              // Perusahaan prioritaskan Foto_URL
              if (penggunaCocok.Foto_URL) {
                fotoProfil = penggunaCocok.Foto_URL;
              } else if (penggunaCocok.Foto) {
                fotoProfil = penggunaCocok.Foto;
              } else if (penggunaCocok.photoURL) {
                fotoProfil = penggunaCocok.photoURL;
              } else if (penggunaCocok.email || data.Email) {
                fotoProfil = await ambilFotoProfilGoogle(
                  penggunaCocok.email || data.Email,
                  penggunaCocok.id,
                );
              }
            }

            // Update data pengguna dengan foto profil
            saranData.pengguna = {
              id: penggunaCocok.id,
              ...penggunaCocok,
              fotoProfil: fotoProfil,
              Foto_URL: penggunaCocok.Foto_URL || null,
              Nama_Lengkap:
                penggunaCocok.Nama_Lengkap ||
                data.Nama ||
                "Nama tidak tersedia",
              Email:
                penggunaCocok.Email || data.Email || "Email tidak tersedia",
            };
          } else {
            // Jika tidak ditemukan, coba ambil foto dari Gravatar berdasarkan Email
            if (data.Email) {
              const fotoProfil = await ambilFotoProfilGoogle(data.Email, null);
              saranData.pengguna.fotoProfil = fotoProfil;
              saranData.pengguna.Nama_Lengkap =
                data.Nama || "Nama tidak tersedia";
              saranData.pengguna.Email = data.Email || "Email tidak tersedia";
            }
          }

          semuaSaran.push(saranData);
        }
      }

      setDaftarSaran(semuaSaran);
    } catch (error) {
      toast.error(
        "Terjadi kesalahan saat mengambil data saran: " + error.message,
      );
      console.error("Error mengambil saran:", error);
    } finally {
      setSedangMemuatSaran(false);
    }
  }, [halaman, batasHalaman, getFotoProfil, ambilFotoProfilGoogle]);

  useEffect(() => {
    ambilDaftarSaran();
  }, [ambilDaftarSaran]);

  const ambilHalamanSebelumnya = () => {
    if (halaman > 1) {
      setHalaman(halaman - 1);
    }
  };

  const ambilHalamanSelanjutnya = () => {
    const totalHalaman = Math.ceil(totalSaran / batasHalaman);
    if (halaman < totalHalaman) {
      setHalaman(halaman + 1);
    }
  };

  return {
    halaman,
    totalSaran,
    daftarSaran,
    ambilHalamanSebelumnya,
    ambilHalamanSelanjutnya,
    sedangMemuatSaran,
  };
};

export default useTampilkanSaran;
