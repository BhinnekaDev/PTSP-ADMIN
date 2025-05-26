import { useState, useEffect, useCallback } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { database } from "@/lib/firebaseConfig";

const useTampilkanSaran = (batasHalaman = 5) => {
  const [sedangMemuatSaran, setSedangMemuatSaran] = useState(false);
  const [daftarSaran, setDaftarSaran] = useState([]);
  const [totalSaran, setTotalSaran] = useState(0);
  const [halaman, setHalaman] = useState(1);

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

      for (let i = startIndex; i < endIndex && i < totalDocs; i++) {
        const docSnapshot = snapshot.docs[i];
        const saranRef = doc(database, "saran", docSnapshot.id);
        const saranDoc = await getDoc(saranRef);

        if (saranDoc.exists()) {
          const saranData = {
            id: saranDoc.id,
            ID_Pengguna: saranDoc.data().ID_Pengguna || null,
            pengguna: {
              id: "",
              Foto: null,
              Nama_Lengkap: "Nama tidak tersedia",
              Email: "Email tidak tersedia",
            },
            ...saranDoc.data(),
          };

          if (saranData.ID_Pengguna) {
            try {
              const penggunaPeroranganRef = doc(
                database,
                "perorangan",
                saranData.ID_Pengguna
              );
              const penggunaPeroranganDoc = await getDoc(penggunaPeroranganRef);

              if (penggunaPeroranganDoc.exists()) {
                saranData.pengguna = {
                  id: penggunaPeroranganDoc.id,
                  ...penggunaPeroranganDoc.data(),
                };
              } else {
                const penggunaPerusahaanRef = doc(
                  database,
                  "perusahaan",
                  saranData.ID_Pengguna
                );
                const penggunaPerusahaanDoc = await getDoc(
                  penggunaPerusahaanRef
                );

                if (penggunaPerusahaanDoc.exists()) {
                  saranData.pengguna = {
                    id: penggunaPerusahaanDoc.id,
                    ...penggunaPerusahaanDoc.data(),
                  };
                }
              }
            } catch (error) {
              console.error("Gagal mengambil data pengguna:", error);
            }
          }

          semuaSaran.push(saranData);
        }
      }

      setDaftarSaran(semuaSaran);
    } catch (error) {
      toast.error(
        "Terjadi kesalahan saat mengambil data saran: " + error.message
      );
      console.error("Error mengambil saran:", error);
    } finally {
      setSedangMemuatSaran(false);
    }
  }, [halaman, batasHalaman]);

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
