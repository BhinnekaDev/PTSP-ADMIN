import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { database, storage } from "@/lib/firebaseConfig";
import { kirimEmail } from "@/hooks/backend/useNotifikasiEmail";
import usePDFPengajuan from "@/hooks/backend/usePDFPengajuan";

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

  // ✅ FUNGSI FORMAT TANGGAL
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
            setStatusPengajuan(pengajuanData.Status_Ajukan || "");
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

  const validasiFormulir = () => {
    if (!statusPengajuan) {
      toast.error("Masukkan status pengajuan");
      return false;
    }

    if (statusPengajuan === "Ditolak" && !keterangan.trim()) {
      toast.error("Masukkan keterangan untuk penolakan");
      return false;
    }

    if (statusPengajuan === "Diterima" && jenisAjukan === "Berbayar") {
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

  // ============================================================
  // ✅ FUNGSI KIRIM EMAIL PENGINGAT
  // ============================================================
  const kirimEmailPengingat = async (
    idPengguna,
    idPemesanan,
    tanggalKadaluwarsa,
    hariSebelum,
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
        console.warn("⚠️ Email pengguna tidak ditemukan untuk ID:", idPengguna);
        return;
      }

      const subjekEmail = `Pengingat Pembayaran - ${hariSebelum} Hari Menjelang Batas Akhir`;
      const isiEmail =
        `<p>Dengan hormat,</p>` +
        `<p>Ini adalah pengingat bahwa pembayaran untuk pengajuan ID <strong>${idPemesanan}</strong> akan kadaluwarsa dalam <strong>${hariSebelum}</strong>.</p>` +
        `<p>Batas akhir pembayaran: <strong>${formatTanggal(
          tanggalKadaluwarsa,
        )}</strong></p>` +
        `<p>Mohon segera lakukan pembayaran sebelum batas waktu yang telah ditentukan.</p>` +
        `<p>Terima kasih atas perhatian Anda.</p>`;

      console.log(
        `📧 Mengirim email pengingat ke: ${emailPengguna} (${hariSebelum})`,
      );
      await kirimEmail(emailPengguna, subjekEmail, isiEmail, namaPengguna);
      console.log("✅ Email pengingat berhasil dikirim!");
    } catch (error) {
      console.error("❌ Gagal mengirim email pengingat:", error);
    }
  };

  // ============================================================
  // ✅ FUNGSI KIRIM NOTIFIKASI KADALUWARSA
  // ============================================================
  const kirimNotifikasiKadaluwarsa = async (
    idPengguna,
    idPemesanan,
    tanggalKadaluwarsa,
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
        console.warn("⚠️ Email pengguna tidak ditemukan untuk ID:", idPengguna);
        return;
      }

      const subjekEmail = `Pemberitahuan: Batas Waktu Pembayaran Telah Lewat`;
      const isiEmail =
        `<p>Dengan hormat,</p>` +
        `<p>Kami ingin memberitahukan bahwa batas waktu pembayaran untuk pengajuan ID <strong>${idPemesanan}</strong> telah lewat pada <strong>${formatTanggal(
          tanggalKadaluwarsa,
        )}</strong>.</p>` +
        `<p>Jika Anda telah melakukan pembayaran setelah batas waktu, mohon segera menghubungi tim kami untuk konfirmasi.</p>` +
        `<p>Jika belum melakukan pembayaran, pengajuan Anda mungkin akan dibatalkan secara otomatis.</p>` +
        `<p>Terima kasih atas perhatiannya.</p>`;

      console.log(`📧 Mengirim notifikasi kadaluwarsa ke: ${emailPengguna}`);
      await kirimEmail(emailPengguna, subjekEmail, isiEmail, namaPengguna);
      console.log("✅ Notifikasi kadaluwarsa berhasil dikirim!");
    } catch (error) {
      console.error("❌ Gagal mengirim notifikasi kadaluwarsa:", error);
    }
  };

  // ============================================================
  // ✅ FUNGSI JADWALKAN PENGINGAT - DENGAN PENGECEKAN TANGGAL
  // ============================================================
  const jadwalkanPengingatPembayaran = async (
    idPengguna,
    idPemesanan,
    tanggalKadaluwarsa,
  ) => {
    try {
      const tanggalKadaluwarsaObj = new Date(tanggalKadaluwarsa);
      const sekarang = new Date();

      const selisihHari = Math.ceil(
        (tanggalKadaluwarsaObj - sekarang) / (1000 * 60 * 60 * 24),
      );

      console.log(`📅 Selisih hari: ${selisihHari} hari`);

      if (selisihHari === 3) {
        await kirimEmailPengingat(
          idPengguna,
          idPemesanan,
          tanggalKadaluwarsa,
          "3 hari",
        );
      } else if (selisihHari === 1) {
        await kirimEmailPengingat(
          idPengguna,
          idPemesanan,
          tanggalKadaluwarsa,
          "1 hari",
        );
      } else if (selisihHari <= 0) {
        await kirimNotifikasiKadaluwarsa(
          idPengguna,
          idPemesanan,
          tanggalKadaluwarsa,
        );
      } else {
        console.log(
          `⏳ Masih ${selisihHari} hari lagi, belum waktunya kirim email.`,
        );
      }

      console.log("✅ Proses penjadwalan selesai!");
    } catch (error) {
      console.error("❌ Gagal menjadwalkan pengingat:", error);
    }
  };

  // ============================================================
  // ✅ FUNGSI KIRIM NOTIFIKASI EMAIL - DIPERBAIKI
  // ============================================================
  const kirimNotifikasiEmail = async (
    idPengguna,
    pengajuanData,
    pemesananData,
  ) => {
    try {
      console.log("📧 ===== KIRIM NOTIFIKASI EMAIL =====");
      console.log("📧 ID Pengguna:", idPengguna);
      console.log("📧 Status Pengajuan:", statusPengajuan);
      console.log("📧 Jenis Ajukan:", jenisAjukan);

      let emailPengguna = "";
      let namaPengguna = "";

      // Cari email pengguna
      const peroranganRef = doc(database, "perorangan", idPengguna);
      const peroranganSnap = await getDoc(peroranganRef);

      if (peroranganSnap.exists()) {
        const peroranganData = peroranganSnap.data();
        emailPengguna = peroranganData.Email;
        namaPengguna = peroranganData.Nama_Lengkap;
        console.log("✅ Email ditemukan di perorangan:", emailPengguna);
      } else {
        const perusahaanRef = doc(database, "perusahaan", idPengguna);
        const perusahaanSnap = await getDoc(perusahaanRef);

        if (perusahaanSnap.exists()) {
          const perusahaanData = perusahaanSnap.data();
          emailPengguna = perusahaanData.Email;
          namaPengguna = perusahaanData.Nama_Lengkap;
          console.log("✅ Email ditemukan di perusahaan:", emailPengguna);
        }
      }

      if (!emailPengguna) {
        console.warn("❌ Email pengguna tidak ditemukan untuk ID:", idPengguna);
        toast.error("Email pengguna tidak ditemukan!");
        return;
      }

      // ============================================================
      // 🔥 BUAT PDF - TAPI JANGAN BLOKIR PENGIRIMAN EMAIL
      // ============================================================
      let pdf = null;
      if (statusPengajuan === "Diterima") {
        console.log("📄 Mencoba membuat PDF...");
        try {
          pdf = await usePDFPengajuan(
            namaPengguna,
            emailPengguna,
            pengajuanData,
            dataKeranjang,
            pemesananData,
            idPemesanan,
          );
          console.log("✅ PDF berhasil dibuat");
        } catch (pdfError) {
          console.error("❌ Gagal membuat PDF:", pdfError.message);
          // 🔥 TETAP LANJUTKAN - PDF tidak wajib
          pdf = null;
        }
      }

      // ============================================================
      // 🔥 BUILD EMAIL
      // ============================================================
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
                            ${item.Pemilik || "Tidak ada informasi pemilik"} - 
                            ${item.Nama || "Tanpa nama"}
                          </li>`,
                      )
                      .join("")}
                  </ul>
                </li>
                <li><strong>Tanggal Pembayaran Masuk:</strong> ${formatTanggal(
                  tanggalMasuk,
                )}</li>
                <li><strong>Batas Akhir Pembayaran:</strong> ${formatTanggal(
                  tanggalKadaluwarsa,
                )}</li>
              </ul>` +
              `<p>Mohon untuk melakukan pembayaran sebelum batas waktu yang telah ditentukan.</p>` +
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
          console.warn("⚠️ Status tidak dikenal, skip email");
          return;
      }

      // ============================================================
      // 🔥 KIRIM EMAIL - PASTIKAN TERKIRIM
      // ============================================================
      console.log("📧 Mengirim email ke:", emailPengguna);
      console.log("📧 Subject:", subjekEmail);
      console.log("📧 PDF attached:", !!pdf);

      // 🔥 Panggil kirimEmail dengan atau tanpa PDF
      await kirimEmail(
        emailPengguna,
        subjekEmail,
        isiEmail,
        namaPengguna,
        pdf, // Bisa null
      );

      console.log("✅ Email notifikasi berhasil dikirim!");
    } catch (error) {
      console.error("❌ Gagal mengirim notifikasi email:", error);
      console.error("❌ Error message:", error.message);
      // 🔥 JANGAN LEMPAR ERROR - biarkan proses lanjut
      toast.warning(
        "Email notifikasi gagal dikirim, tetapi data sudah tersimpan.",
      );
    }
  };

  // ============================================================
  // ✅ FUNGSI UTAMA: SUNTING PENGAJUAN
  // ============================================================
  const suntingPengajuan = async () => {
    setSedangMemuatSuntingPengajuan(true);

    if (!validasiFormulir()) {
      setSedangMemuatSuntingPengajuan(false);
      return;
    }

    try {
      console.log("📝 ===== MENYUNTING PENGAJUAN =====");
      console.log("📝 ID Pemesanan:", idPemesanan);
      console.log("📝 Status:", statusPengajuan);
      console.log("📝 Jenis:", jenisAjukan);

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
        Status_Ajukan: statusPengajuan,
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

      // ============================================================
      // 🔥 JADWALKAN PENGINGAT (HANYA JIKA BERBAYAR & DITERIMA)
      // ============================================================
      if (jenisAjukan === "Berbayar" && statusPengajuan === "Diterima") {
        if (
          !tanggalKadaluwarsa ||
          isNaN(new Date(tanggalKadaluwarsa).getTime())
        ) {
          throw new Error("Tanggal kadaluwarsa tidak valid");
        }

        console.log("📅 Menjadwalkan pengingat untuk:", tanggalKadaluwarsa);
        await jadwalkanPengingatPembayaran(
          pemesananData.ID_Pengguna,
          idPemesanan,
          tanggalKadaluwarsa,
        );
      }

      // ============================================================
      // 🔥 KIRIM EMAIL NOTIFIKASI - PASTIKAN TERKIRIM
      // ============================================================
      console.log("📧 Mengirim notifikasi email status...");

      // 🔥 Ambil data pengajuan terbaru
      const pengajuanTerbaru = await getDoc(pengajuanRef);
      const pengajuanData = pengajuanTerbaru.exists()
        ? pengajuanTerbaru.data()
        : {};

      // 🔥 Kirim email dengan try-catch terpisah
      try {
        await kirimNotifikasiEmail(
          pemesananData.ID_Pengguna,
          pengajuanData,
          pemesananData,
        );
      } catch (emailError) {
        console.error(
          "❌ Email gagal, tapi data sudah tersimpan:",
          emailError.message,
        );
        toast.warning("Data tersimpan, tetapi email gagal dikirim.");
      }

      toast.success("Pengajuan berhasil disunting!");
      return true;
    } catch (error) {
      console.error("❌ Gagal menyunting pengajuan:", error);
      toast.error("Gagal menyunting pengajuan: " + error.message);
      return false;
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
