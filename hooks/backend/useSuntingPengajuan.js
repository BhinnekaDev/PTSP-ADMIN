import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { database, storage } from "@/lib/firebaseConfig";
import { kirimEmail } from "@/hooks/backend/useNotifikasiEmail";
import usePDFPengajuan from "@/hooks/backend/usePDFPengajuan";
import { scheduleJob } from "node-schedule";

export default function useSuntingPengajuan(idPemesanan) {
  // State Management
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

  // Fungsi untuk mengambil data pengajuan
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

        if (idAjukanDariPemesanan) {
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
          }
        }
      } else {
        toast.error("Data pemesanan tidak ditemukan!");
      }
    } catch (error) {
      toast.error("Gagal mengambil data: " + error.message);
    }
  };

  // Fungsi untuk mengunggah file
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

  // Fungsi validasi formulir
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

  // Fungsi untuk menjadwalkan pengingat pembayaran
  const jadwalkanPengingatPembayaran = async (
    idPengguna,
    idPemesanan,
    tanggalKadaluwarsa
  ) => {
    try {
      const tanggalKadaluwarsaObj = new Date(tanggalKadaluwarsa);

      const pengingat3Hari = new Date(tanggalKadaluwarsaObj);
      pengingat3Hari.setDate(pengingat3Hari.getDate() - 3);

      const pengingat1Hari = new Date(tanggalKadaluwarsaObj);
      pengingat1Hari.setDate(pengingat1Hari.getDate() - 1);

      const pengingat5Menit = new Date(tanggalKadaluwarsaObj);
      pengingat5Menit.setMinutes(pengingat5Menit.getMinutes() - 5);

      // Pengingat H-3
      if (pengingat3Hari > new Date()) {
        scheduleJob(pengingat3Hari, async () => {
          await kirimEmailPengingat(
            idPengguna,
            idPemesanan,
            tanggalKadaluwarsa,
            "3 hari"
          );
        });
      }

      // Pengingat H-1
      if (pengingat1Hari > new Date()) {
        scheduleJob(pengingat1Hari, async () => {
          await kirimEmailPengingat(
            idPengguna,
            idPemesanan,
            tanggalKadaluwarsa,
            "1 hari"
          );
        });
      }

      // Pengingat 5 menit
      if (pengingat5Menit > new Date()) {
        scheduleJob(pengingat5Menit, async () => {
          await kirimEmailPengingat(
            idPengguna,
            idPemesanan,
            tanggalKadaluwarsa,
            "5 menit"
          );
        });
      }
    } catch (error) {
      console.error("Gagal menjadwalkan pengingat:", error);
    }
  };

  const kirimEmailPengingat = async (
    idPengguna,
    idPemesanan,
    tanggalKadaluwarsa,
    hariSebelum
  ) => {
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

      const subjekEmail = `Pengingat Pembayaran - ${hariSebelum} Hari Menjelang Batas Akhir`;
      const isiEmail =
        `<p>Dengan hormat,</p>` +
        `<p>Ini adalah pengingat bahwa pembayaran untuk pengajuan ID <strong>${idPemesanan}</strong> akan kadaluwarsa dalam <strong>${hariSebelum}</strong>.</p>` +
        `<p>Batas akhir pembayaran: <strong>${formatTanggal(
          tanggalKadaluwarsa
        )}</strong></p>` +
        `<p>Mohon segera lakukan pembayaran sebelum batas waktu yang telah ditentukan.</p>` +
        `<p>Terima kasih atas perhatian Anda.</p>`;

      await kirimEmail(emailPengguna, subjekEmail, isiEmail, namaPengguna);
    } catch (error) {
      console.error("Gagal mengirim email pengingat:", error);
    }
  };

  const suntingPengajuan = async () => {
    setSedangMemuatSuntingPengajuan(true);

    if (!validasiFormulir()) {
      setSedangMemuatSuntingPengajuan(false);
      return;
    }

    try {
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

      if (jenisAjukan === "Berbayar" && statusPengajuan === "Diterima") {
        await jadwalkanPengingatPembayaran(
          pemesananData.ID_Pengguna,
          idPemesanan,
          tanggalKadaluwarsa
        );
      }

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
          subjekEmail = "Pemberitahuan: Pengajuan Telah Diterima";

          if (jenisAjukan === "Berbayar") {
            isiEmail =
              `<p>Dengan hormat,</p>` +
              `<p>Pengajuan Anda dengan ID <strong>${idPemesanan}</strong> telah kami terima.</p>` +
              `<p>Berikut adalah rincian pembayaran yang perlu diperhatikan:</p>` +
              `<ul>
                <li><strong>Nomor Virtual Account dan Detail:</strong>
                  <ul>
                    ${dataKeranjang
                      .filter((_, index) => nomorVAs[index])
                      .map(
                        (item, index) =>
                          `<li>
                            <strong>${nomorVAs[index]}</strong> - 
                            Pemilik: ${
                              item.Pemilik || "Tidak ada informasi pemilik"
                            } - 
                            Produk: ${item.Nama || "Tanpa nama"}
                          </li>`
                      )
                      .join("")}
                  </ul>
                </li>
                <li><strong>Tanggal Pembayaran Masuk:</strong> ${formatTanggal(
                  tanggalMasuk
                )}</li>
                <li><strong>Batas Akhir Pembayaran:</strong> ${formatTanggal(
                  tanggalKadaluwarsa
                )}</li>
              </ul>` +
              `<p>Mohon untuk melakukan pembayaran sebelum batas waktu yang telah ditentukan.</p>` +
              `<p>Anda akan menerima email pengingat 3 hari dan 1 hari sebelum batas akhir pembayaran.</p>` +
              `<p>Atas perhatian dan kerja sama Anda, kami ucapkan terima kasih.</p>`;
          } else {
            isiEmail =
              `<p>Dengan hormat,</p>` +
              `<p>Pengajuan <strong>gratis</strong> Anda dengan ID <strong>${idPemesanan}</strong> telah kami terima.</p>` +
              `<p>Pengajuan tersebut akan segera kami proses sesuai ketentuan yang berlaku.</p>` +
              `<p>Kami menghargai partisipasi Anda dan mengucapkan terima kasih.</p>`;
          }
          break;

        case "Ditolak":
          subjekEmail = "Pemberitahuan: Pengajuan Ditolak";
          isiEmail =
            `<p>Dengan hormat,</p>` +
            `<p>Kami sampaikan bahwa pengajuan Anda dengan ID <strong>${idPemesanan}</strong> tidak dapat kami proses.</p>` +
            `<p><strong>Alasan penolakan:</strong> ${keterangan}</p>` +
            `<p>Silakan lakukan perbaikan sesuai keterangan di atas, kemudian ajukan kembali.</p>` +
            `<p>Kami menghargai perhatian dan pengertian Anda.</p>`;
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

  // Fungsi untuk memformat tanggal
  const formatTanggal = (dateString) => {
    if (!dateString) return "-";
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
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
    sedangMemuatSuntingPengajuan,
    sedangMengunggah,
    suntingPengajuan,
  };
}
