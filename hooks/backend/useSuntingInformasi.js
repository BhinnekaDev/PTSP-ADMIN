import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { database } from "@/lib/firebaseConfig";

const useSuntingInformasi = (idInformasi) => {
  const [namaInformasi, setNamaInformasi] = useState("");
  const [hargaInformasi, setHargaInformasi] = useState("");
  const [pemilikInformasi, setPemilikInformasi] = useState("");
  const [deskripsiInformasi, setDeskripsiInformasi] = useState("");
  const [noRekening, setNoRekening] = useState("");
  const [sedangMemuatSuntingInformasi, setSedangMemuatSuntingInformasi] =
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

  const ambilDataInformasi = async () => {
    try {
      const informasiRef = doc(database, "informasi", idInformasi);
      const docSnap = await getDoc(informasiRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setNamaInformasi(data.Nama ?? "");
        setHargaInformasi(data.Harga?.toString() ?? "");
        setPemilikInformasi(data.Pemilik ?? "");
        setDeskripsiInformasi(data.Deskripsi ?? "");
        setNoRekening(data.Nomor_Rekening?.toString() ?? "");
      } else {
        toast.error("Data informasi tidak ditemukan!");
      }
    } catch (error) {
      toast.error(
        "Gagal mengambil data informasi: " + (error?.message || error)
      );
    }
  };

  const validasiFormulir = () => {
    const nama = bersihkan(namaInformasi);
    const harga = hargaInformasi.trim();
    const pemilik = pemilikInformasi.trim();
    const deskripsi = bersihkan(deskripsiInformasi);

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

  const suntingInformasi = async () => {
    if (!validasiFormulir()) return;

    setSedangMemuatSuntingInformasi(true);

    try {
      const informasiRef = doc(database, "informasi", idInformasi);
      await updateDoc(informasiRef, {
        Nama: bersihkan(namaInformasi),
        Harga: parseFloat(hargaInformasi),
        Pemilik: pemilikInformasi.trim(),
        Deskripsi: bersihkan(deskripsiInformasi),
        Nomor_Rekening: tentukanNomorRekening(),
      });
      toast.success("Informasi berhasil disunting!");
    } catch (error) {
      toast.error("Gagal menyunting informasi: " + (error?.message || error));
    } finally {
      setSedangMemuatSuntingInformasi(false);
    }
  };

  useEffect(() => {
    if (idInformasi) {
      ambilDataInformasi();
    }
  }, [idInformasi]);

  return {
    noRekening,
    namaInformasi,
    hargaInformasi,
    pemilikInformasi,
    deskripsiInformasi,
    sedangMemuatSuntingInformasi,
    setNamaInformasi,
    setHargaInformasi,
    setPemilikInformasi,
    setDeskripsiInformasi,
    suntingInformasi,
  };
};

export default useSuntingInformasi;
