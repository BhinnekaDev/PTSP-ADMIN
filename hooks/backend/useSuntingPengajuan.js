import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { database, storage } from "@/lib/firebaseConfig";
import { kirimEmail } from "@/hooks/backend/useNotifikasiEmail";
import usePDFPengajuan from "@/hooks/backend/usePDFPengajuan";

export default function useSuntingPengajuan(idPemesanan) {
  // State untuk pengelolaan form
  const [statusPengajuan, setStatusPengajuan] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [dataKeranjang, setDataKeranjang] = useState([]);
  const [nomorVAs, setNomorVAs] = useState([]);
  const [sedangMemuatSuntingPengajuan, setSedangMemuatSuntingPengajuan] =
    useState(false);
  const [idAjukan, setIdAjukan] = useState("");

  const [tanggalMasuk, setTanggalMasuk] = useState("");
  const [tanggalKadaluwarsa, setTanggalKadaluwarsa] = useState("");
  const [file, setFile] = useState(null);
  const [jenisAjukan, setJenisAjukan] = useState("");
  const [fileURL, setFileURL] = useState("");
  const [sedangMengunggah, setSedangMengunggah] = useState(false);

  const ambilDataPengajuan = async () => {
    try {
      const pemesananRef = doc(database, "pemesanan", idPemesanan);
      const docSnap = await getDoc(pemesananRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const idAjukanDariPemesanan = data.ID_Ajukan;
        setIdAjukan(idAjukanDariPemesanan);

        const keranjangData = data.Data_Keranjang || [];
        setDataKeranjang(keranjangData);
        setNomorVAs(keranjangData.map((item) => item.Nomor_VA || ""));

        const pengajuanRef = doc(database, "ajukan", idAjukanDariPemesanan);
        const pengajuanSnap = await getDoc(pengajuanRef);

        if (pengajuanSnap.exists()) {
          const pengajuanData = pengajuanSnap.data();
          setStatusPengajuan(pengajuanData.Status_Ajuan || "");
          setJenisAjukan(pengajuanData.Jenis_Ajukan || "");
          setTanggalMasuk(pengajuanData.Tanggal_Masuk || "");
          setTanggalKadaluwarsa(pengajuanData.Tanggal_Kadaluwarsa || "");
          setFileURL(pengajuanData.File_URL || "");
          setKeterangan(pengajuanData.Keterangan || "");
        } else {
          toast.error("Data pengajuan tidak ditemukan!");
        }
      } else {
        toast.error("Data pemesanan tidak ditemukan!");
      }
    } catch (error) {
      toast.error("Gagal mengambil data: " + error.message);
    }
  };

  const uploadFile = async () => {
    if (!file) return null;

    setSedangMengunggah(true);
    try {
      const storageRef = ref(storage, `Pengajuan/${idPemesanan}/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      toast.error("Gagal mengunggah file: " + error.message);
      return null;
    } finally {
      setSedangMengunggah(false);
    }
  };

  const validasiFormulir = () => {
    if (!statusPengajuan) {
      toast.error("Masukkan status pengajuan");
      return false;
    }

    if (statusPengajuan === "Ditolak" && !keterangan.trim()) {
      toast.error("Masukkan keterangan untuk penolakan");
      return false;
    }

    if (jenisAjukan === "Berbayar") {
      if (!tanggalMasuk) {
        toast.error("Masukkan tanggal masuk pembayaran");
        return false;
      }
      if (!tanggalKadaluwarsa) {
        toast.error("Masukkan tanggal kadaluwarsa pembayaran");
        return false;
      }
      if (new Date(tanggalKadaluwarsa) <= new Date(tanggalMasuk)) {
        toast.error("Tanggal kadaluwarsa harus setelah tanggal masuk");
        return false;
      }
    }

    return true;
  };

  const suntingPengajuan = async () => {
    setSedangMemuatSuntingPengajuan(true);

    if (!validasiFormulir()) {
      setSedangMemuatSuntingPengajuan(false);
      return;
    }

    try {
      // Upload file jika ada
      let fileUrl = fileURL;
      if (file) {
        fileUrl = await uploadFile();
        if (!fileUrl && jenisAjukan === "Berbayar") {
          throw new Error("Gagal mengunggah file");
        }
      }

      const pemesananRef = doc(database, "pemesanan", idPemesanan);
      const pemesananSnap = await getDoc(pemesananRef);
      const pemesananData = pemesananSnap.exists()
        ? pemesananSnap.data()
        : null;

      if (!pemesananData) {
        throw new Error("Data pemesanan tidak ditemukan!");
      }

      const updatedKeranjang = dataKeranjang.map((item, index) => ({
        ...item,
        Nomor_VA:
          jenisAjukan === "Berbayar" && statusPengajuan === "Diterima"
            ? nomorVAs[index]
            : null,
      }));

      await updateDoc(pemesananRef, {
        Data_Keranjang: updatedKeranjang,
        Status_Pembayaran:
          jenisAjukan === "Gratis" && statusPengajuan === "Diterima"
            ? "Lunas"
            : pemesananData.Status_Pembayaran,
        Total_Harga_Pesanan:
          jenisAjukan === "Gratis" && statusPengajuan === "Diterima"
            ? 0
            : pemesananData.Total_Harga_Pesanan,
      });

      // Update data pengajuan
      const pengajuanRef = doc(database, "ajukan", idAjukan);
      const pengajuanUpdateData = {
        Status_Ajuan: statusPengajuan,
        ...(statusPengajuan === "Ditolak" && {
          Keterangan: keterangan,
          Status_Pembayaran: "Menunggu Pembayaran",
        }),
        ...(jenisAjukan === "Berbayar" && {
          Tanggal_Masuk: tanggalMasuk,
          Tanggal_Kadaluwarsa: tanggalKadaluwarsa,
          ...(fileUrl && { File_URL: fileUrl }),
        }),
      };

      await updateDoc(pengajuanRef, pengajuanUpdateData);

      await kirimNotifikasiEmail(
        pemesananData.ID_Pengguna,
        (await getDoc(pengajuanRef)).data(),
        pemesananData
      );

      toast.success("Pengajuan berhasil disunting!");
      return true;
    } catch (error) {
      toast.error("Gagal menyunting pengajuan: " + error.message);
      return false;
    } finally {
      setSedangMemuatSuntingPengajuan(false);
    }
  };

  const kirimNotifikasiEmail = async (
    idPengguna,
    pengajuanData,
    pemesananData
  ) => {
    try {
      let emailPengguna = "";
      let namaPengguna = "";

      // Ambil data pengguna
      const peroranganRef = doc(database, "perorangan", idPengguna);
      const peroranganSnap = await getDoc(peroranganRef);

      if (peroranganSnap.exists()) {
        const peroranganData = peroranganSnap.data();
        emailPengguna = peroranganData.Email;
        namaPengguna = peroranganData.Nama_Lengkap;
      } else {
        const perusahaanRef = doc(database, "perusahaan", idPengguna);
        const perusahaanSnap = await getDoc(perusahaanRef);

        if (perusahaanSnap.exists()) {
          const perusahaanData = perusahaanSnap.data();
          emailPengguna = perusahaanData.Email;
          namaPengguna = perusahaanData.Nama_Lengkap;
        }
      }

      if (!emailPengguna) {
        console.warn("Email pengguna tidak ditemukan");
        return;
      }

      // Generate PDF untuk pengajuan yang diterima
      let pdf = null;
      if (statusPengajuan === "Diterima") {
        pdf = await usePDFPengajuan(
          namaPengguna,
          emailPengguna,
          pengajuanData,
          dataKeranjang,
          pemesananData,
          idPemesanan
        );
      }

      let subjekEmail = "";
      let isiEmail = "";

      switch (statusPengajuan) {
        case "Diterima":
          subjekEmail = "Pengajuan Anda Diterima";

          if (jenisAjukan === "Berbayar") {
            isiEmail =
              `Pengajuan Anda dengan ID ${idPemesanan} telah diterima. ` +
              `Berikut detail pembayaran:\n\n` +
              `- Nomor Virtual Account: ${nomorVAs
                .filter(Boolean)
                .join(", ")}\n` +
              `- Tanggal Masuk Pembayaran: ${formatTanggal(tanggalMasuk)}\n` +
              `- Batas Waktu Pembayaran: ${formatTanggal(
                tanggalKadaluwarsa
              )}\n\n` +
              `Silakan lakukan pembayaran sebelum batas waktu yang ditentukan.\n\n` +
              `Terima kasih.`;
          } else {
            isiEmail =
              `Yth. ${namaPengguna},\n\n` +
              `Pengajuan gratis Anda dengan ID ${idPemesanan} telah diterima.\n\n` +
              `Kami akan segera memproses permohonan Anda.\n\n` +
              `Terima kasih.`;
          }
          break;

        case "Ditolak":
          subjekEmail = "Pengajuan Anda Ditolak";
          isiEmail =
            `Kami memberitahukan bahwa pengajuan Anda dengan ID ${idPemesanan} tidak dapat kami proses.\n\n` +
            `Alasan Penolakan: ${keterangan}\n\n` +
            `Silakan perbaiki dan ajukan kembali.\n\n` +
            `Terima kasih.`;
          break;

        case "Sedang Ditinjau":
          subjekEmail = "Pengajuan Anda Sedang Diproses";
          isiEmail =
            `Yth. ${namaPengguna},\n\n` +
            `Pengajuan Anda dengan ID ${idPemesanan} sedang dalam proses peninjauan.\n\n` +
            `Kami akan memberikan kabar terbaru segera setelah ada perkembangan.\n\n` +
            `Terima kasih.`;
          break;

        default:
          return;
      }

      await kirimEmail(
        emailPengguna,
        subjekEmail,
        isiEmail,
        namaPengguna,
        statusPengajuan === "Diterima" ? pdf : null
      );
    } catch (error) {
      console.error("Gagal mengirim notifikasi email:", error);
      toast.error("Gagal mengirim email notifikasi");
    }
  };

  const formatTanggal = (dateString) => {
    if (!dateString) return "-";
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  useEffect(() => {
    if (idPemesanan) {
      ambilDataPengajuan();
    }
  }, [idPemesanan]);

  return {
    statusPengajuan,
    setStatusPengajuan,
    keterangan,
    setKeterangan,
    dataKeranjang,
    nomorVAs,
    setNomorVAs,
    tanggalMasuk,
    setTanggalMasuk,
    tanggalKadaluwarsa,
    setTanggalKadaluwarsa,
    file,
    setFile,
    jenisAjukan,
    fileURL,

    // Status loading
    sedangMemuatSuntingPengajuan,
    sedangMengunggah,

    // Functions
    suntingPengajuan,
  };
}
