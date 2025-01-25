import { useState, useEffect, useCallback } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { database } from "@/lib/firebaseConfig";

const useTampilkanIKM = (batasHalaman = 5) => {
  const [sedangMemuatIKM, setSedangMemuatIKM] = useState(false);
  const [daftarIKM, setDaftarIKM] = useState([]);
  const [totalIKM, setTotalIKM] = useState(0);
  const [halaman, setHalaman] = useState(1);

  const ambilDaftarIKM = useCallback(async () => {
    const referensiIKM = collection(database, "IKM");
    try {
      setSedangMemuatIKM(true);
      const snapshot = await getDocs(referensiIKM);
      const ikmDataList = [];

      const totalDocs = snapshot.docs.length;
      setTotalIKM(totalDocs);

      const startIndex = (halaman - 1) * batasHalaman;
      const endIndex = startIndex + batasHalaman;

      for (let i = startIndex; i < endIndex && i < totalDocs; i++) {
        const docSnapshot = snapshot.docs[i];
        const ikmRef = doc(database, "IKM", docSnapshot.id);
        const ikmDoc = await getDoc(ikmRef);

        if (ikmDoc.exists()) {
          const ikmData = {
            id: ikmDoc.id,
            ...ikmDoc.data(),
          };

          let referensiData = null;

          if (ikmData.referensiPerorangan) {
            const peroranganRef = doc(
              database,
              "perorangan",
              ikmData.referensiPerorangan.id
            );
            const peroranganDoc = await getDoc(peroranganRef);
            if (peroranganDoc.exists()) {
              referensiData = {
                data: peroranganDoc.data(),
              };
            }
          } else if (ikmData.referensiPerusahaan) {
            const perusahaanRef = doc(
              database,
              "perusahaan",
              ikmData.referensiPerusahaan.id
            );
            const perusahaanDoc = await getDoc(perusahaanRef);
            if (perusahaanDoc.exists()) {
              referensiData = {
                data: perusahaanDoc.data(),
              };
            }
          }

          ikmData.referensi = referensiData;
          ikmDataList.push(ikmData);

          // Log data IKM untuk memastikan referensi telah berhasil ditambahkan
          console.log("Data IKM setelah relasi:", ikmData);
        }
      }

      setDaftarIKM(ikmDataList);
    } catch (error) {
      toast.error(
        "Terjadi kesalahan saat mengambil data IKM: " + error.message
      );
    } finally {
      setSedangMemuatIKM(false);
    }
  }, [halaman, batasHalaman]);

  useEffect(() => {
    ambilDaftarIKM();
  }, [ambilDaftarIKM]);

  const ambilHalamanSebelumnya = () => {
    if (halaman > 1) {
      setHalaman(halaman - 1);
    }
  };

  const ambilHalamanSelanjutnya = () => {
    const totalHalaman = Math.ceil(totalIKM / batasHalaman);
    if (halaman < totalHalaman) {
      setHalaman(halaman + 1);
    }
  };

  return {
    halaman,
    totalIKM,
    daftarIKM,
    ambilHalamanSebelumnya,
    ambilHalamanSelanjutnya,
    sedangMemuatIKM,
  };
};

export default useTampilkanIKM;
