import { useState } from "react";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "react-toastify";
import { database } from "@/lib/firebaseConfig";

const useTambahInformasi = () => {
  const [namaInformasi, setNamaInformasi] = useState("");
  const [hargaInformasi, setHargaInformasi] = useState("");
  const [pemilikInformasi, setPemilikInformasi] = useState("");
  const [deskripsiInformasi, setDeskripsiInformasi] = useState("");
  const [statusInformasi, setStatusInformasi] = useState("Tersedia");
  const [sedangMemuatTambahInformasi, setSedangMemuatTambahInformasi] =
    useState(false);

  const bersihkan = (teks) => teks.trim().replace(/\s+/g, " ");

  const tentukanNomorRekening = () =>
    pemilikInformasi === "Meteorologi"
      ? 1111
      : pemilikInformasi === "Klimatologi"
      ? 2222
      : pemilikInformasi === "Geofisika"
      ? 3333
      : 0;

  const validasiFormulir = () => {
    const nama = bersihkan(namaInformasi);
    const harga = hargaInformasi.trim();
    const deskripsi = bersihkan(deskripsiInformasi);
    const pemilik = pemilikInformasi.trim();

    let pesan = "";

    if (!nama) pesan += "Nama Informasi harus diisi. ";
    else if (nama.length > 255)
      pesan += "Nama Informasi maksimal 255 karakter. ";

    if (!harga) pesan += "Harga Informasi harus diisi. ";
    else if (!/^\d+(\.\d{1,2})?$/.test(harga))
      pesan += "Harga Informasi harus berupa angka. ";
    else if (harga.length > 9) pesan += "Harga Informasi maksimal 9 digit. ";

    if (!pemilik) pesan += "Pemilik Informasi harus dipilih. ";

    if (!deskripsi) pesan += "Deskripsi Informasi harus diisi. ";
    else if (deskripsi.length > 1000)
      pesan += "Deskripsi Informasi maksimal 1000 karakter. ";

    if (pesan) {
      toast.error(pesan.trim());
      return false;
    }

    return true;
  };

  const tambahInformasi = async () => {
    if (!validasiFormulir()) return;

    setSedangMemuatTambahInformasi(true);

    const dataInformasi = {
      Nama: bersihkan(namaInformasi),
      Harga: parseFloat(hargaInformasi),
      Pemilik: pemilikInformasi.trim(),
      Deskripsi: bersihkan(deskripsiInformasi),
      Nomor_Rekening: tentukanNomorRekening(),
      Tanggal_Pembuatan: serverTimestamp(),
      Status: statusInformasi,
    };

    try {
      await setDoc(doc(collection(database, "informasi")), dataInformasi);
      toast.success("Informasi berhasil ditambahkan!");
      aturUlangFormulir();
    } catch (error) {
      toast.error("Gagal menambahkan Informasi: " + (error?.message || error));
    } finally {
      setSedangMemuatTambahInformasi(false);
    }
  };

  const aturUlangFormulir = () => {
    setNamaInformasi("");
    setHargaInformasi("");
    setPemilikInformasi("");
    setDeskripsiInformasi("");
    setStatusInformasi("Tersedia");
  };

  return {
    namaInformasi,
    hargaInformasi,
    statusInformasi,
    tambahInformasi,
    pemilikInformasi,
    setNamaInformasi,
    setHargaInformasi,
    deskripsiInformasi,
    setStatusInformasi,
    setPemilikInformasi,
    setDeskripsiInformasi,
    aturUlangFormulir,
    sedangMemuatTambahInformasi,
  };
};

export default useTambahInformasi;
