import { useState, useEffect } from "react";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "react-toastify";
// PERPUSTAKAAN KAMI
import { database, storage } from "@/lib/firebaseConfig";
import { kirimEmail } from "@/hooks/backend/useNotifikasiEmail";

const useKirimFile = (idPemesanan) => {
  const [kirimFile, setKirimFile] = useState([]);
  const [nomorSurat, setNomorSurat] = useState("");
  const [dataKeranjang, setDataKeranjang] = useState([]);
  const [sedangMemuatKirimFile, setSedangMemuatKirimFile] = useState(false);

  const ambilDataPengguna = async (idPengguna) => {
    try {
      const peroranganRef = doc(database, "perorangan", idPengguna);
      const peroranganSnap = await getDoc(peroranganRef);

      if (peroranganSnap.exists()) {
        const data = peroranganSnap.data();
        return {
          email: data.Email || "",
          nama: data.Nama_Lengkap || "",
        };
      }

      const perusahaanRef = doc(database, "perusahaan", idPengguna);
      const perusahaanSnap = await getDoc(perusahaanRef);

      if (perusahaanSnap.exists()) {
        const data = perusahaanSnap.data();
        return {
          email: data.Email || "",
          nama: data.Nama_Lengkap || "",
        };
      }
    } catch (error) {
      console.error("Gagal mengambil data pengguna:", error);
    }

    return { email: "", nama: "" };
  };

  const ambilDataKeranjang = async () => {
    try {
      const pemesananRef = doc(database, "pemesanan", idPemesanan);
      const pemesananSnap = await getDoc(pemesananRef);

      if (pemesananSnap.exists()) {
        const dataPemesanan = pemesananSnap.data();
        setDataKeranjang(dataPemesanan.Data_Keranjang || []);
      } else {
        toast.error("Dokumen pemesanan tidak ditemukan.");
      }
    } catch (error) {
      console.error("Gagal mengambil data keranjang:", error);
      toast.error("Gagal mengambil data keranjang.");
    }
  };

  const kirim = async () => {
    if (kirimFile.length === 0) {
      toast.error("File belum dipilih.");
      return;
    }

    setSedangMemuatKirimFile(true);

    try {
      const pemesananRef = doc(database, "pemesanan", idPemesanan);
      const pemesananSnap = await getDoc(pemesananRef);

      if (!pemesananSnap.exists()) {
        throw new Error("Dokumen pemesanan tidak ditemukan.");
      }

      const dataPemesanan = pemesananSnap.data();
      const idPengguna = dataPemesanan.ID_Pengguna;

      if (!idPengguna)
        throw new Error("ID Pengguna tidak ditemukan di pemesanan.");

      const { email, nama: namaPengguna } = await ambilDataPengguna(idPengguna);

      const updatedDataKeranjang = [...dataKeranjang];

      if (kirimFile.length !== dataKeranjang.length) {
        toast.error("Jumlah file tidak sesuai dengan jumlah data keranjang.");
        return;
      }

      for (let i = 0; i < kirimFile.length; i++) {
        const file = kirimFile[i];
        const keranjang = updatedDataKeranjang[i];

        const fileRef = ref(storage, `Penerimaan/${idPengguna}/${file.name}`);
        await uploadBytes(fileRef, file);

        const downloadURL = await getDownloadURL(fileRef);

        const penerimaanRef = doc(collection(database, "penerimaan"));
        await setDoc(penerimaanRef, {
          File: downloadURL,
          Tanggal_Pembuatan: serverTimestamp(),
        });

        const idPenerimaan = penerimaanRef.id;

        keranjang.File = downloadURL;
        keranjang.ID_Penerimaan = idPenerimaan;
        keranjang.Nomor_Surat = nomorSurat;
      }

      await updateDoc(pemesananRef, {
        Data_Keranjang: updatedDataKeranjang,
        Status_Pembuatan: "Selesai Pembuatan",
      });

      toast.success("File berhasil dikirim dan data diperbarui.");

      if (email) {
        await kirimEmail(
          email,
          "File Anda Telah Selesai",
          `Halo,\n\nFile Anda terkait pemesanan dengan ID ${idPemesanan} telah selesai dan dapat diakses melalui platform kami.\nTerima kasih.`,
          namaPengguna || "Pengguna",
          "Selesai"
        );
      }
    } catch (error) {
      console.error("Gagal mengirim file:", error);
      toast.error("Gagal mengirim file. Silakan coba lagi.");
    } finally {
      setSedangMemuatKirimFile(false);
    }
  };

  useEffect(() => {
    if (idPemesanan) {
      ambilDataKeranjang();
    }
  }, [idPemesanan]);

  return {
    kirim,
    kirimFile,
    nomorSurat,
    setKirimFile,
    setNomorSurat,
    sedangMemuatKirimFile,
    dataKeranjang,
  };
};

export default useKirimFile;
