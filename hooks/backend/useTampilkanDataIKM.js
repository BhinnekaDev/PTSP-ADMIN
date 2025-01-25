import { useState, useEffect, useCallback } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { database } from "@/lib/firebaseConfig";

const useTampilkanIkm = (batasHalaman = 5) => {
  const [sedangMemuatIkm, setSedangMemuatIkm] = useState(false);
  const [daftarIkm, setDaftarIkm] = useState([]);
  const [totalIkm, setTotalIkm] = useState(0);
  const [halaman, setHalaman] = useState(1);

  const ambilDaftarIkm = useCallback(async () => {
    const referensiPemesanan = collection(database, "pemesanan");
    try {
      setSedangMemuatIkm(true);
      const snapshot = await getDocs(referensiPemesanan);
      const pemesanans = [];

      const totalDocs = snapshot.docs.length;
      setTotalIkm(totalDocs);

      const startIndex = (halaman - 1) * batasHalaman;
      const endIndex = startIndex + batasHalaman;

      for (let i = startIndex; i < endIndex && i < totalDocs; i++) {
        const docSnapshot = snapshot.docs[i];
        const pemesananRef = doc(database, "pemesanan", docSnapshot.id);
        const pemesananDoc = await getDoc(pemesananRef);

        if (pemesananDoc.exists()) {
          const pemesananData = {
            id: pemesananDoc.id,
            ...pemesananDoc.data(),
          };

          const penggunaRef = doc(
            database,
            "perorangan",
            pemesananData.ID_Pengguna
          );
          const penggunaDoc = await getDoc(penggunaRef);

          if (penggunaDoc.exists()) {
            pemesananData.pengguna = {
              id: penggunaDoc.id,
              ...penggunaDoc.data(),
            };
          } else {
            const perusahaanRef = doc(
              database,
              "perusahaan",
              pemesananData.ID_Pengguna
            );
            const perusahaanDoc = await getDoc(perusahaanRef);

            if (perusahaanDoc.exists()) {
              pemesananData.pengguna = {
                id: perusahaanDoc.id,
                ...perusahaanDoc.data(),
              };
            }
          }

          const ajukanRef = doc(database, "ajukan", pemesananData.ID_Ajukan);
          const ajukanDoc = await getDoc(ajukanRef);

          if (ajukanDoc.exists()) {
            pemesananData.ajukan = {
              id: ajukanDoc.id,
              ...ajukanDoc.data(),
            };
          }

          const ikmRef = doc(database, "ikm", pemesananDoc.id);
          const ikmDoc = await getDoc(ikmRef);

          if (ikmDoc.exists()) {
            const ikmData = {
              id: ikmDoc.id,
              ...ikmDoc.data(),
            };

            if (
              typeof ikmData.Opsi_Yang_Dipilih === "object" &&
              !Array.isArray(ikmData.Opsi_Yang_Dipilih)
            ) {
              const opsiDipilih = Object.values(
                ikmData.Opsi_Yang_Dipilih
              ).flat();
              ikmData.Opsi_Yang_Dipilih = opsiDipilih;
            } else if (!Array.isArray(ikmData.Opsi_Yang_Dipilih)) {
              ikmData.Opsi_Yang_Dipilih = [];
            }

            if (Array.isArray(ikmData.ikmResponses)) {
              ikmData.ikmResponses = ikmData.ikmResponses.map((response) => ({
                ...response,
              }));
            } else {
              ikmData.ikmResponses = [];
            }

            pemesananData.ikm = ikmData;
          } else {
            console.log(
              "IKM document not found for pemesanan ID:",
              pemesananDoc.id
            );
          }

          pemesanans.push(pemesananData);
        }
      }

      setDaftarIkm(pemesanans);
    } catch (error) {
      toast.error(
        "Terjadi kesalahan saat mengambil data IKM: " + error.message
      );
    } finally {
      setSedangMemuatIkm(false);
    }
  }, [halaman, batasHalaman]);

  useEffect(() => {
    ambilDaftarIkm();
  }, [ambilDaftarIkm]);

  const ambilHalamanSebelumnya = () => {
    if (halaman > 1) {
      setHalaman(halaman - 1);
    }
  };

  const ambilHalamanSelanjutnya = () => {
    const totalHalaman = Math.ceil(totalIkm / batasHalaman);
    if (halaman < totalHalaman) {
      setHalaman(halaman + 1);
    }
  };

  return {
    halaman,
    totalIkm,
    daftarIkm,
    ambilHalamanSebelumnya,
    ambilHalamanSelanjutnya,
    sedangMemuatIkm,
  };
};

export default useTampilkanIkm;
