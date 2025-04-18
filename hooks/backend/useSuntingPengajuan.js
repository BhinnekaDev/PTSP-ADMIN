import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { doc, updateDoc, getDoc } from "firebase/firestore";
// PERPUSTAKAAN KAMI
import { database } from "@/lib/firebaseConfig";
import { kirimEmail } from "@/hooks/backend/useNotifikasiEmail";

export default function useSuntingPengajuan(idPemesanan) {
  const [statusPengajuan, setStatusPengajuan] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [dataKeranjang, setDataKeranjang] = useState([]);
  const [nomorVAs, setNomorVAs] = useState([]);
  const [sedangMemuatSuntingPengajuan, setSedangMemuatSuntingPengajuan] =
    useState(false);
  const [idAjukan, setIdAjukan] = useState("");

  const ambilDataPengajuan = async () => {
    try {
      const pemesananRef = doc(database, "pemesanan", idPemesanan);
      const docSnap = await getDoc(pemesananRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("Data Pemesanan:", data);
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

  const validasiFormulir = () =>
    !statusPengajuan
      ? (toast.error("Masukkan status pengajuan"), false)
      : statusPengajuan === "Ditolak" && !keterangan
      ? (toast.error("Masukkan keterangan untuk penolakan"), false)
      : !dataKeranjang || dataKeranjang.length === 0
      ? (toast.error("Data keranjang tidak boleh kosong"), false)
      : true;

  const suntingPengajuan = async () => {
    setSedangMemuatSuntingPengajuan(true);

    if (!validasiFormulir()) {
      setSedangMemuatSuntingPengajuan(false);
      return;
    }

    try {
      const pemesananRef = doc(database, "pemesanan", idPemesanan);
      const pemesananSnap = await getDoc(pemesananRef);
      const pemesananData = pemesananSnap.exists()
        ? pemesananSnap.data()
        : null;

      if (!pemesananData) {
        throw new Error("Data pemesanan tidak ditemukan!");
      }

      const idPengguna = pemesananData.ID_Pengguna;

      let emailPengguna = "";
      let namaPengguna = "";

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

      const pengajuanRef = doc(database, "ajukan", idAjukan);
      const pengajuanUpdateData = { Status_Ajuan: statusPengajuan };

      if (statusPengajuan === "Ditolak") {
        pengajuanUpdateData.Keterangan = keterangan;
        pengajuanUpdateData.Status_Pembayaran = "Menunggu Pembayaran";
      }

      await updateDoc(pengajuanRef, pengajuanUpdateData);

      const pengajuanData = await getDoc(pengajuanRef);
      const pengajuanDocData = pengajuanData.data();

      await updateDoc(pemesananRef, {
        Status_Pembayaran:
          pengajuanDocData.Jenis_Ajukan === "Gratis" &&
          statusPengajuan === "Diterima"
            ? "Lunas"
            : pemesananData.Status_Pembayaran,
        Total_Harga_Pesanan:
          pengajuanDocData.Jenis_Ajukan === "Gratis" &&
          statusPengajuan === "Diterima"
            ? 0
            : pemesananData.Total_Harga_Pesanan,
        Data_Keranjang: dataKeranjang,
      });

      const updatedKeranjang = dataKeranjang.map((item, index) => {
        const itemBaru = { ...item };

        const isBerbayarDanDiterima =
          pengajuanDocData.Jenis_Ajukan !== "Gratis" &&
          statusPengajuan === "Diterima";

        if (isBerbayarDanDiterima && nomorVAs[index]) {
          itemBaru.Nomor_VA = nomorVAs[index];
        } else {
          delete itemBaru.Nomor_VA;
        }

        return itemBaru;
      });

      await updateDoc(pemesananRef, { Data_Keranjang: updatedKeranjang });

      if (emailPengguna) {
        if (statusPengajuan === "Diterima") {
          const isBerbayar = pengajuanDocData.Jenis_Ajukan !== "Gratis";

          const isiEmail = isBerbayar
            ? `Permohonan Anda telah kami terima dan akan segera kami proses.\n\nNomor VA Anda: ${nomorVAs.join(
                ", "
              )}\n\nJika ada informasi tambahan yang diperlukan, kami akan menghubungi Anda kembali.\n\nTerima kasih.`
            : `Permohonan Anda telah kami terima dan akan segera kami proses.\n\nKarena permohonan bersifat gratis, Anda tidak perlu melakukan pembayaran.\n\nTerima kasih.`;

          await kirimEmail(
            emailPengguna,
            "Terimakasih telah menghubungi BMKG PTSP Bengkulu.",
            isiEmail,
            namaPengguna
          );
        } else if (statusPengajuan === "Ditolak") {
          await kirimEmail(
            emailPengguna,
            "Pengajuan Anda Ditolak",
            `Kami mohon maaf, pengajuan Anda telah ditolak dengan alasan berikut:\n\n"${keterangan}"\n\nJika ada pertanyaan lebih lanjut, Anda dapat menghubungi kami melalui fitur Live Chat di website PTSP BMKG Bengkulu.\n\nTerima kasih.`,
            namaPengguna
          );
        }
      }

      toast.success(
        "Pengajuan berhasil disunting dan email notifikasi dikirim!"
      );
    } catch (error) {
      toast.error("Gagal menyunting pengajuan: " + error.message);
    } finally {
      setSedangMemuatSuntingPengajuan(false);
    }
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
    suntingPengajuan,
    sedangMemuatSuntingPengajuan,
    dataKeranjang,
    nomorVAs,
    setNomorVAs,
  };
}
