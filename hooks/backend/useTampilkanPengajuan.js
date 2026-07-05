import { useState, useEffect, useCallback } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { toast } from "react-toastify";
import { database } from "@/lib/firebaseConfig";

const useTampilkanPengajuan = (batasHalaman = 5) => {
  const [sedangMemuatPengajuan, setSedangMemuatPengajuan] = useState(false);
  const [daftarPengajuan, setDaftarPengajuan] = useState([]);
  const [totalPengajuan, setTotalPengajuan] = useState(0);
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
      // Biarkan null, nanti komponen akan menampilkan gambar bawaan

      return fotoProfil;
    },
    [ambilFotoProfilGoogle],
  );

  const ambilDaftarPengajuan = useCallback(async () => {
    const referensiPemesanan = collection(database, "pemesanan");
    try {
      setSedangMemuatPengajuan(true);
      const snapshot = await getDocs(referensiPemesanan);
      const pemesanans = [];

      const totalDocs = snapshot.docs.length;
      setTotalPengajuan(totalDocs);

      const startIndex = (halaman - 1) * batasHalaman;
      const endIndex = startIndex + batasHalaman;

      for (let i = startIndex; i < endIndex && i < totalDocs; i++) {
        const docSnapshot = snapshot.docs[i];
        const pemesananRef = doc(database, "pemesanan", docSnapshot.id);
        const pemesananDoc = await getDoc(pemesananRef);

        if (pemesananDoc.exists()) {
          const pemesananData = {
            id: pemesananDoc.id,
            ID_Pengguna: pemesananDoc.data().ID_Pengguna || null,
            ID_Ajukan: pemesananDoc.data().ID_Ajukan || null,
            tipePengguna: null, // Untuk track tipe pengguna
            pengguna: {
              id: "",
              Foto: null,
              Foto_URL: null,
              photoURL: null,
              fotoProfil: null,
              Nama_Lengkap: "Nama tidak tersedia",
              Email: "Email tidak tersedia",
              Alamat: "Tidak ada alamat",
              No_Telepon: "Tidak ada nomor telepon",
              ...(pemesananDoc.data().pengguna || {}),
            },
            ajukan: {
              id: "",
              Status_Ajukan: "Belum ada status",
              Jenis_Ajukan: "Belum ada jenis",
              Tanggal_Pembuatan_Ajukan: null,
              ...(pemesananDoc.data().ajukan || {}),
            },
            Data_Keranjang: pemesananDoc.data().Data_Keranjang || [],
            ...pemesananDoc.data(),
          };

          if (pemesananData.ID_Pengguna) {
            try {
              // Coba cari di koleksi perorangan terlebih dahulu
              const penggunaRef = doc(
                database,
                "perorangan",
                pemesananData.ID_Pengguna,
              );
              const penggunaDoc = await getDoc(penggunaRef);

              if (penggunaDoc.exists()) {
                const dataPengguna = penggunaDoc.data();

                // Ambil foto profil
                const fotoProfil = await getFotoProfil(
                  dataPengguna,
                  penggunaDoc.id,
                  dataPengguna.email,
                );

                pemesananData.tipePengguna = "perorangan";
                pemesananData.pengguna = {
                  ...pemesananData.pengguna,
                  id: penggunaDoc.id,
                  ...dataPengguna,
                  fotoProfil: fotoProfil,
                  Foto_URL: dataPengguna.Foto_URL || null,
                };
              } else {
                // Jika tidak ditemukan di perorangan, cari di perusahaan
                const perusahaanRef = doc(
                  database,
                  "perusahaan",
                  pemesananData.ID_Pengguna,
                );
                const perusahaanDoc = await getDoc(perusahaanRef);

                if (perusahaanDoc.exists()) {
                  const dataPerusahaan = perusahaanDoc.data();

                  // Ambil foto profil untuk perusahaan
                  // Perusahaan biasanya menggunakan Foto_URL untuk logo
                  let fotoProfil = null;

                  // PRIORITAS 1: Field Foto_URL (logo perusahaan)
                  if (dataPerusahaan.Foto_URL) {
                    fotoProfil = dataPerusahaan.Foto_URL;
                  }
                  // PRIORITAS 2: Field Foto
                  else if (dataPerusahaan.Foto) {
                    fotoProfil = dataPerusahaan.Foto;
                  }
                  // PRIORITAS 3: Field photoURL
                  else if (dataPerusahaan.photoURL) {
                    fotoProfil = dataPerusahaan.photoURL;
                  }
                  // PRIORITAS 4: Gravatar (jika ada email)
                  else if (dataPerusahaan.email) {
                    fotoProfil = await ambilFotoProfilGoogle(
                      dataPerusahaan.email,
                      perusahaanDoc.id,
                    );
                  }
                  // Jika tidak ada foto, biarkan null (akan menggunakan gambar bawaan)

                  pemesananData.tipePengguna = "perusahaan";
                  pemesananData.pengguna = {
                    ...pemesananData.pengguna,
                    id: perusahaanDoc.id,
                    ...dataPerusahaan,
                    fotoProfil: fotoProfil,
                    Foto_URL: dataPerusahaan.Foto_URL || null,
                  };
                } else {
                  // Data pengguna tidak ditemukan di kedua koleksi
                  console.warn(
                    `Pengguna dengan ID ${pemesananData.ID_Pengguna} tidak ditemukan`,
                  );
                  pemesananData.pengguna = {
                    ...pemesananData.pengguna,
                    Nama_Lengkap: "Pengguna tidak ditemukan",
                    Email: "Email tidak tersedia",
                  };
                }
              }
            } catch (error) {
              console.error("Gagal mengambil data pengguna:", error);
              pemesananData.pengguna = {
                ...pemesananData.pengguna,
                Nama_Lengkap: "Error mengambil data",
              };
            }
          }

          if (pemesananData.ID_Ajukan) {
            try {
              const ajukanRef = doc(
                database,
                "ajukan",
                pemesananData.ID_Ajukan,
              );
              const ajukanDoc = await getDoc(ajukanRef);

              if (ajukanDoc.exists()) {
                pemesananData.ajukan = {
                  ...pemesananData.ajukan,
                  id: ajukanDoc.id,
                  ...ajukanDoc.data(),
                };
              }
            } catch (error) {
              console.error("Gagal mengambil data ajukan:", error);
            }
          }

          pemesanans.push(pemesananData);
        }
      }

      setDaftarPengajuan(pemesanans);
    } catch (error) {
      toast.error(
        "Terjadi kesalahan saat mengambil data pemesanan: " + error.message,
      );
      console.error("Error mengambil pengajuan:", error);
    } finally {
      setSedangMemuatPengajuan(false);
    }
  }, [halaman, batasHalaman, getFotoProfil, ambilFotoProfilGoogle]);

  useEffect(() => {
    ambilDaftarPengajuan();
  }, [ambilDaftarPengajuan]);

  const ambilHalamanSebelumnya = () => {
    if (halaman > 1) {
      setHalaman(halaman - 1);
    }
  };

  const ambilHalamanSelanjutnya = () => {
    const totalHalaman = Math.ceil(totalPengajuan / batasHalaman);
    if (halaman < totalHalaman) {
      setHalaman(halaman + 1);
    }
  };

  return {
    halaman,
    totalPengajuan,
    daftarPengajuan,
    ambilHalamanSebelumnya,
    ambilHalamanSelanjutnya,
    sedangMemuatPengajuan,
  };
};

export default useTampilkanPengajuan;
