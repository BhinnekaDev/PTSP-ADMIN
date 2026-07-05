import { useState, useEffect, useCallback } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { toast } from "react-toastify";
import { database } from "@/lib/firebaseConfig";

const useTampilkanPembuatan = (batasHalaman = 5) => {
  const [sedangMemuatPemesanan, setSedangMemuatPemesanan] = useState(false);
  const [daftarPemesanan, setDaftarPemesanan] = useState([]);
  const [totalPemesanan, setTotalPemesanan] = useState(0);
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

  const ambilDaftarPemesanan = useCallback(async () => {
    const referensiPemesanan = collection(database, "pemesanan");
    try {
      setSedangMemuatPemesanan(true);
      const snapshot = await getDocs(referensiPemesanan);
      const pemesanans = [];

      const totalDocs = snapshot.docs.length;
      setTotalPemesanan(totalDocs);

      const startIndex = (halaman - 1) * batasHalaman;
      const endIndex = startIndex + batasHalaman;

      for (let i = startIndex; i < endIndex && i < totalDocs; i++) {
        const docSnapshot = snapshot.docs[i];
        const pemesananData = {
          id: docSnapshot.id,
          ...docSnapshot.data(),
          tipePengguna: null,
          pengguna: {
            id: "",
            Foto: null,
            Foto_URL: null,
            photoURL: null,
            fotoProfil: null,
            Nama_Lengkap: "Nama tidak tersedia",
            Email: "Email tidak tersedia",
          },
        };

        if (pemesananData.ID_Pengguna) {
          try {
            // Coba cari di koleksi perorangan
            const penggunaRef = doc(
              database,
              "perorangan",
              pemesananData.ID_Pengguna,
            );
            const penggunaDoc = await getDoc(penggunaRef);

            if (penggunaDoc.exists()) {
              const dataPengguna = penggunaDoc.data();
              const fotoProfil = await getFotoProfil(
                dataPengguna,
                penggunaDoc.id,
                dataPengguna.email,
              );

              pemesananData.tipePengguna = "perorangan";
              pemesananData.pengguna = {
                id: penggunaDoc.id,
                ...dataPengguna,
                fotoProfil: fotoProfil,
                Foto_URL: dataPengguna.Foto_URL || null,
              };
            } else {
              // Coba cari di koleksi perusahaan
              const perusahaanRef = doc(
                database,
                "perusahaan",
                pemesananData.ID_Pengguna,
              );
              const perusahaanDoc = await getDoc(perusahaanRef);

              if (perusahaanDoc.exists()) {
                const dataPerusahaan = perusahaanDoc.data();

                let fotoProfil = null;
                if (dataPerusahaan.Foto_URL) {
                  fotoProfil = dataPerusahaan.Foto_URL;
                } else if (dataPerusahaan.Foto) {
                  fotoProfil = dataPerusahaan.Foto;
                } else if (dataPerusahaan.photoURL) {
                  fotoProfil = dataPerusahaan.photoURL;
                } else if (dataPerusahaan.email) {
                  fotoProfil = await ambilFotoProfilGoogle(
                    dataPerusahaan.email,
                    perusahaanDoc.id,
                  );
                }

                pemesananData.tipePengguna = "perusahaan";
                pemesananData.pengguna = {
                  id: perusahaanDoc.id,
                  ...dataPerusahaan,
                  fotoProfil: fotoProfil,
                  Foto_URL: dataPerusahaan.Foto_URL || null,
                };
              }
            }
          } catch (error) {
            console.error("Gagal mengambil data pengguna:", error);
          }
        }

        pemesanans.push(pemesananData);
      }

      setDaftarPemesanan(pemesanans);
    } catch (error) {
      toast.error(
        "Terjadi kesalahan saat mengambil data pemesanan: " + error.message,
      );
    } finally {
      setSedangMemuatPemesanan(false);
    }
  }, [halaman, batasHalaman, getFotoProfil, ambilFotoProfilGoogle]);

  useEffect(() => {
    ambilDaftarPemesanan();
  }, [ambilDaftarPemesanan]);

  const ambilHalamanSebelumnya = () => {
    if (halaman > 1) {
      setHalaman(halaman - 1);
    }
  };

  const ambilHalamanSelanjutnya = () => {
    const totalHalaman = Math.ceil(totalPemesanan / batasHalaman);
    if (halaman < totalHalaman) {
      setHalaman(halaman + 1);
    }
  };

  return {
    sedangMemuatPemesanan,
    daftarPemesanan,
    totalPemesanan,
    halaman,
    ambilHalamanSebelumnya,
    ambilHalamanSelanjutnya,
  };
};

export default useTampilkanPembuatan;
