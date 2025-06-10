import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { database } from "@/lib/firebaseConfig";
import { kirimEmail } from "@/hooks/backend/useNotifikasiEmail";

export default function useSuntingNomorVABaru(idPemesanan) {
  const [dataKeranjang, setDataKeranjang] = useState([]);
  const [nomorVAs, setNomorVAs] = useState([]);
  const [sedangMemuatSuntingVaBaru, setSedangMemuatSuntingVaBaru] =
    useState(false);
  const [idAjukan, setIdAjukan] = useState("");

  const [tanggalMasuk, setTanggalMasuk] = useState("");
  const [tanggalKadaluwarsa, setTanggalKadaluwarsa] = useState("");

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
          setTanggalMasuk(pengajuanData.Tanggal_Masuk || "");
          setTanggalKadaluwarsa(pengajuanData.Tanggal_Kadaluwarsa || "");
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

  const validasiFormulir = () => {
    return true;
  };

  const suntingVaBaru = async () => {
    setSedangMemuatSuntingVaBaru(true);

    try {
      const pemesananRef = doc(database, "pemesanan", idPemesanan);
      const pemesananSnap = await getDoc(pemesananRef);

      let idPengguna = "";

      if (pemesananSnap.exists()) {
        const data = pemesananSnap.data();

        idPengguna = data.ID_Pengguna || "";

        const keranjangBaru = (data.Data_Keranjang || []).map(
          (item, index) => ({
            ...item,
            Nomor_VA: nomorVAs[index] || "",
          })
        );

        await updateDoc(pemesananRef, {
          Data_Keranjang: keranjangBaru,
        });
      }

      if (idAjukan) {
        const ajukanRef = doc(database, "ajukan", idAjukan);
        await updateDoc(ajukanRef, {
          Tanggal_Masuk: tanggalMasuk,
          Tanggal_Kadaluwarsa: tanggalKadaluwarsa,
        });
      }

      if (idPengguna) {
        await kirimNotifikasiEmail(idPengguna);
      }

      toast.success("Data berhasil disunting!");
    } catch (error) {
      toast.error("Gagal menyunting data: " + error.message);
    } finally {
      setSedangMemuatSuntingVaBaru(false);
    }
  };

  const kirimNotifikasiEmail = async (idPengguna) => {
    try {
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

      if (!emailPengguna) {
        console.warn("Email pengguna tidak ditemukan");
        return;
      }

      const subjekEmail = "Permintaan VA Baru Berhasil Diproses";
      const isiEmail =
        `<p>Dengan hormat,</p>` +
        `<p>Permintaan nomor Virtual Account (VA) baru Anda untuk pengajuan ID <strong>${idPemesanan}</strong> telah berhasil diproses.</p>` +
        `<p>Berikut adalah detail Virtual Account terbaru:</p>` +
        `<ul>
          <li><strong>Nomor Virtual Account:</strong> ${nomorVAs
            .filter(Boolean)
            .join(", ")}</li>
          <li><strong>Tanggal Pembayaran Masuk:</strong> ${formatTanggal(
            tanggalMasuk
          )}</li>
          <li><strong>Batas Akhir Pembayaran:</strong> ${formatTanggal(
            tanggalKadaluwarsa
          )}</li>
        </ul>` +
        `<p>Segera lakukan pembayaran sebelum batas waktu berakhir.</p>` +
        `<p>Terima kasih atas perhatian dan kerja sama Anda.</p>`;

      await kirimEmail(emailPengguna, subjekEmail, isiEmail, namaPengguna);
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
    dataKeranjang,
    nomorVAs,
    setNomorVAs,
    tanggalMasuk,
    setTanggalMasuk,
    tanggalKadaluwarsa,
    setTanggalKadaluwarsa,
    sedangMemuatSuntingVaBaru,
    suntingVaBaru,
  };
}
