import { useState } from "react";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "react-toastify";
import { database } from "@/lib/firebaseConfig";

const useTambahJasa = () => {
  const [namaJasa, setNamaJasa] = useState("");
  const [hargaJasa, setHargaJasa] = useState("");
  const [pemilikJasa, setPemilikJasa] = useState("");
  const [deskripsiJasa, setDeskripsiJasa] = useState("");
  const [statusJasa, setStatusJasa] = useState("Tersedia");
  const [sedangMemuatTambahJasa, setSedangMemuatTambahJasa] = useState(false);

  const bersihkan = (teks) => teks.trim().replace(/\s+/g, " ");

  const tentukanNomorRekening = () =>
    pemilikJasa === "Meteorologi"
      ? 1111
      : pemilikJasa === "Klimatologi"
      ? 2222
      : pemilikJasa === "Geofisika"
      ? 3333
      : 0;

  const validasiFormulir = () => {
    const nama = bersihkan(namaJasa);
    const harga = hargaJasa.trim();
    const deskripsi = bersihkan(deskripsiJasa);
    const pemilik = pemilikJasa.trim();

    let pesan = "";

    if (!nama) pesan += "Nama Jasa harus diisi. ";
    else if (nama.length > 255) pesan += "Nama Jasa maksimal 255 karakter. ";

    if (!harga) pesan += "Harga Jasa harus diisi. ";
    else if (!/^\d+(\.\d{1,2})?$/.test(harga))
      pesan += "Harga Jasa harus berupa angka. ";
    else if (harga.length > 9) pesan += "Harga Jasa maksimal 9 digit. ";

    if (!pemilik) pesan += "Pemilik Jasa harus dipilih. ";

    if (!deskripsi) pesan += "Deskripsi Jasa harus diisi. ";
    else if (deskripsi.length > 1000)
      pesan += "Deskripsi Jasa maksimal 1000 karakter. ";

    if (pesan) {
      toast.error(pesan.trim());
      return false;
    }

    return true;
  };

  const tambahJasa = async () => {
    if (!validasiFormulir()) return;

    setSedangMemuatTambahJasa(true);

    const dataJasa = {
      Nama: bersihkan(namaJasa),
      Harga: parseFloat(hargaJasa),
      Pemilik: pemilikJasa.trim(),
      Deskripsi: bersihkan(deskripsiJasa),
      Nomor_Rekening: tentukanNomorRekening(),
      Tanggal_Pembuatan: serverTimestamp(),
      Status: statusJasa,
    };

    try {
      await setDoc(doc(collection(database, "jasa")), dataJasa);
      toast.success("Jasa berhasil ditambahkan!");
      aturUlangFormulir();
    } catch (error) {
      toast.error("Gagal menambahkan jasa: " + (error?.message || error));
    } finally {
      setSedangMemuatTambahJasa(false);
    }
  };

  const aturUlangFormulir = () => {
    setNamaJasa("");
    setHargaJasa("");
    setPemilikJasa("");
    setDeskripsiJasa("");
    setStatusJasa("Tersedia");
  };

  return {
    namaJasa,
    hargaJasa,
    statusJasa,
    tambahJasa,
    pemilikJasa,
    setNamaJasa,
    setHargaJasa,
    deskripsiJasa,
    setStatusJasa,
    setPemilikJasa,
    setDeskripsiJasa,
    aturUlangFormulir,
    sedangMemuatTambahJasa,
  };
};

export default useTambahJasa;
