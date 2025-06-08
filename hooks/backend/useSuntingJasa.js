import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { database } from "@/lib/firebaseConfig";

export default function useSuntingJasa(idJasa) {
  const [namaJasa, setNamaJasa] = useState("");
  const [hargaJasa, setHargaJasa] = useState("");
  const [pemilikJasa, setPemilikJasa] = useState("");
  const [deskripsiJasa, setDeskripsiJasa] = useState("");
  const [noRekening, setNoRekening] = useState("");
  const [sedangMemuatSuntingJasa, setSedangMemuatSuntingJasa] = useState(false);

  const ambilDataJasa = async () => {
    try {
      const jasaRef = doc(database, "jasa", idJasa);
      const docSnap = await getDoc(jasaRef);
      if (!docSnap.exists()) return toast.error("Data jasa tidak ditemukan!");

      const data = docSnap.data();
      setNamaJasa(data.Nama || "");
      setHargaJasa(data.Harga?.toString() || "");
      setPemilikJasa(data.Pemilik || "");
      setDeskripsiJasa(data.Deskripsi || "");
      setNoRekening(data.Nomor_Rekening || "");
    } catch (e) {
      toast.error("Gagal mengambil data jasa: " + (e?.message || e));
    }
  };

  const validasiFormulir = () => {
    const errors = [];

    if (!namaJasa) errors.push("Nama jasa harus diisi.");
    else if (namaJasa.length > 255)
      errors.push("Nama jasa maksimal 255 karakter.");

    if (!hargaJasa) errors.push("Harga jasa harus diisi.");
    else if (!/^\d+$/.test(hargaJasa))
      errors.push("Harga jasa hanya boleh angka.");
    else if (hargaJasa.length > 9) errors.push("Harga jasa maksimal 9 digit.");

    if (!pemilikJasa) errors.push("Pemilik jasa harus dipilih.");
    if (!deskripsiJasa) errors.push("Deskripsi jasa harus diisi.");
    else if (deskripsiJasa.length > 1000)
      errors.push("Deskripsi jasa maksimal 1000 karakter.");

    if (errors.length) toast.error(errors.join(" "));
    return errors.length === 0;
  };

  const suntingJasa = async () => {
    if (!validasiFormulir()) return;

    setSedangMemuatSuntingJasa(true);
    try {
      const jasaRef = doc(database, "jasa", idJasa);
      await updateDoc(jasaRef, {
        Nama: namaJasa.trim(),
        Harga: parseFloat(hargaJasa),
        Pemilik: pemilikJasa.trim(),
        Deskripsi: deskripsiJasa.trim(),
      });
      toast.success("Jasa berhasil disunting!");
    } catch (e) {
      toast.error("Gagal menyunting jasa: " + (e?.message || e));
    } finally {
      setSedangMemuatSuntingJasa(false);
    }
  };

  useEffect(() => {
    if (idJasa) ambilDataJasa();
  }, [idJasa]);

  return {
    namaJasa,
    hargaJasa,
    noRekening,
    pemilikJasa,
    setNamaJasa,
    suntingJasa,
    setHargaJasa,
    deskripsiJasa,
    setPemilikJasa,
    setDeskripsiJasa,
    sedangMemuatSuntingJasa,
  };
}
