import { useState, useEffect, useCallback } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { toast } from "react-toastify";
import { database } from "@/lib/firebaseConfig";

const useTampilkanPengaduan = (batasHalaman = 5) => {
  const [sedangMemuatPengaduan, setSedangMemuatPengaduan] = useState(false);
  const [daftarPengaduan, setDaftarPengaduan] = useState([]);
  const [totalPengaduan, setTotalPengaduan] = useState(0);
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

      return fotoProfil;
    },
    [ambilFotoProfilGoogle],
  );

  const ambilDaftarPengaduan = useCallback(async () => {
    const referensiPengaduan = collection(database, "pengaduan");

    try {
      setSedangMemuatPengaduan(true);
      const snapshot = await getDocs(referensiPengaduan);
      const semuaPengaduan = [];

      const totalDocs = snapshot.docs.length;
      setTotalPengaduan(totalDocs);

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
        const pengaduanRef = doc(database, "pengaduan", docSnapshot.id);
        const pengaduanDoc = await getDoc(pengaduanRef);

        if (pengaduanDoc.exists()) {
          const data = pengaduanDoc.data();

          const pengaduanData = {
            id: pengaduanDoc.id,
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
            Pengaduan: data.Pengaduan || "Tidak ada pengaduan",
            File_Pengaduan: data.File_Pengaduan || null,
            Tanggal_Pembuatan: data.Tanggal_Pembuatan || null,
            ...data,
          };

          // Cari pengguna berdasarkan ID_Pengguna atau Email/Nama
          let penggunaCocok = null;

          if (pengaduanData.ID_Pengguna) {
            penggunaCocok = semuaPengguna.find(
              (pengguna) => pengguna.id === pengaduanData.ID_Pengguna,
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
              pengaduanData.tipePengguna = "perorangan";
              fotoProfil = await getFotoProfil(
                penggunaCocok,
                penggunaCocok.id,
                penggunaCocok.email || data.Email,
              );
            } else if (isPerusahaan) {
              pengaduanData.tipePengguna = "perusahaan";
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

            pengaduanData.pengguna = {
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
              pengaduanData.pengguna.fotoProfil = fotoProfil;
              pengaduanData.pengguna.Nama_Lengkap =
                data.Nama || "Nama tidak tersedia";
              pengaduanData.pengguna.Email =
                data.Email || "Email tidak tersedia";
            }
          }

          semuaPengaduan.push(pengaduanData);
        }
      }

      setDaftarPengaduan(semuaPengaduan);
    } catch (error) {
      toast.error(
        "Terjadi kesalahan saat mengambil data pengaduan: " + error.message,
      );
      console.error("Error mengambil pengaduan:", error);
    } finally {
      setSedangMemuatPengaduan(false);
    }
  }, [halaman, batasHalaman, getFotoProfil, ambilFotoProfilGoogle]);

  useEffect(() => {
    ambilDaftarPengaduan();
  }, [ambilDaftarPengaduan]);

  const ambilHalamanSebelumnya = () => {
    if (halaman > 1) {
      setHalaman(halaman - 1);
    }
  };

  const ambilHalamanSelanjutnya = () => {
    const totalHalaman = Math.ceil(totalPengaduan / batasHalaman);
    if (halaman < totalHalaman) {
      setHalaman(halaman + 1);
    }
  };

  return {
    halaman,
    totalPengaduan,
    daftarPengaduan,
    ambilHalamanSebelumnya,
    ambilHalamanSelanjutnya,
    sedangMemuatPengaduan,
  };
};

export default useTampilkanPengaduan;
