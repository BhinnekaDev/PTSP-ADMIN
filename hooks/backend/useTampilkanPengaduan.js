import { useState, useEffect, useCallback } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { database } from "@/lib/firebaseConfig";

const useTampilkanPengaduan = (batasHalaman = 5) => {
  const [sedangMemuatPengaduan, setSedangMemuatPengaduan] = useState(false);
  const [daftarPengaduan, setDaftarPengaduan] = useState([]);
  const [totalPengaduan, setTotalPengaduan] = useState(0);
  const [halaman, setHalaman] = useState(1);

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

      for (let i = startIndex; i < endIndex && i < totalDocs; i++) {
        const docSnapshot = snapshot.docs[i];
        const pengaduanRef = doc(database, "pengaduan", docSnapshot.id);
        const pengaduanDoc = await getDoc(pengaduanRef);

        if (pengaduanDoc.exists()) {
          const pengaduanData = {
            id: pengaduanDoc.id,
            ID_Pengguna: pengaduanDoc.data().ID_Pengguna || null,
            pengguna: {
              id: "",
              Foto: null,
              Nama_Lengkap: "Nama tidak tersedia",
              Email: "Email tidak tersedia",
            },
            ...pengaduanDoc.data(),
          };

          if (pengaduanData.ID_Pengguna) {
            try {
              const penggunaPeroranganRef = doc(
                database,
                "perorangan",
                pengaduanData.ID_Pengguna
              );
              const penggunaPeroranganDoc = await getDoc(penggunaPeroranganRef);

              if (penggunaPeroranganDoc.exists()) {
                pengaduanData.pengguna = {
                  id: penggunaPeroranganDoc.id,
                  ...penggunaPeroranganDoc.data(),
                };
              } else {
                const penggunaPerusahaanRef = doc(
                  database,
                  "perusahaan",
                  pengaduanData.ID_Pengguna
                );
                const penggunaPerusahaanDoc = await getDoc(
                  penggunaPerusahaanRef
                );

                if (penggunaPerusahaanDoc.exists()) {
                  pengaduanData.pengguna = {
                    id: penggunaPerusahaanDoc.id,
                    ...penggunaPerusahaanDoc.data(),
                  };
                }
              }
            } catch (error) {
              console.error("Gagal mengambil data pengguna:", error);
            }
          }

          semuaPengaduan.push(pengaduanData);
        }
      }

      setDaftarPengaduan(semuaPengaduan);
    } catch (error) {
      toast.error(
        "Terjadi kesalahan saat mengambil data pengaduan: " + error.message
      );
      console.error("Error mengambil pengaduan:", error);
    } finally {
      setSedangMemuatPengaduan(false);
    }
  }, [halaman, batasHalaman]);

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
