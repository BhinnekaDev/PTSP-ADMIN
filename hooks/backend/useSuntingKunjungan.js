import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { database } from "@/lib/firebaseConfig";
import { kirimEmail } from "@/hooks/backend/useNotifikasiEmail";

export default function useSuntingKunjungan(idPengajuanKunjungan) {
  const [statusKunjungan, setStatusKunjungan] = useState("");
  const [keteranganPenolakan, setKeteranganPenolakan] = useState("");
  const [sedangMemuatSuntingKunjungan, setSedangMemuatSuntingKunjungan] =
    useState(false);
  const [dataPengguna, setDataPengguna] = useState(null);

  const ambilDataPengajuanKunjungan = async () => {
    if (!idPengajuanKunjungan) return;

    try {
      const pengajuanKunjunganRef = doc(
        database,
        "pengajuan_kunjungan",
        idPengajuanKunjungan
      );
      const docSnap = await getDoc(pengajuanKunjunganRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setStatusKunjungan(data?.Status_Kunjungan || "");

        if (data?.Data_Pengguna) {
          await cariDataPengguna(data.Data_Pengguna);
        }
      } else {
        toast.error("Data Kunjungan tidak ditemukan!");
      }
    } catch (error) {
      toast.error("Gagal mengambil data kunjungan: " + error.message);
    }
  };

  const cariDataPengguna = async (dataPengguna) => {
    try {
      const peroranganQuery = query(
        collection(database, "perorangan"),
        where("Email", "==", dataPengguna.Email)
      );
      const peroranganSnapshot = await getDocs(peroranganQuery);

      if (!peroranganSnapshot.empty) {
        peroranganSnapshot.forEach((doc) => {
          setDataPengguna(doc.data());
        });
        return;
      }

      const perusahaanQuery = query(
        collection(database, "perusahaan"),
        where("Email", "==", dataPengguna.Email)
      );
      const perusahaanSnapshot = await getDocs(perusahaanQuery);

      if (!perusahaanSnapshot.empty) {
        perusahaanSnapshot.forEach((doc) => {
          setDataPengguna(doc.data());
        });
      } else {
        setDataPengguna({
          Nama_Lengkap: dataPengguna.Nama_Lengkap,
          Email: dataPengguna.Email,
        });
      }
    } catch (error) {
      console.error("Gagal mencari data pengguna:", error);
      setDataPengguna({
        Nama_Lengkap: dataPengguna.Nama_Lengkap,
        Email: dataPengguna.Email,
      });
    }
  };

  const validasiFormulir = () => {
    if (!statusKunjungan) {
      toast.error("Masukkan Status Kunjungan");
      return false;
    }

    if (statusKunjungan === "Ditolak" && !keteranganPenolakan.trim()) {
      toast.error("Masukkan Keterangan Penolakan");
      return false;
    }

    return true;
  };

  const kirimNotifikasiEmail = async (status, keterangan = "") => {
    const email = dataPengguna?.Email;
    const namaPengguna = dataPengguna?.Nama_Lengkap || "Pengguna";

    if (!email) {
      console.warn("Tidak ada email pengguna yang terdaftar");
      return;
    }

    const subject = `Status Pengajuan Kunjungan Anda: ${status}`;
    let message = `<p>Halo,</p>`;

    if (status === "Diterima") {
      message += `<p>Pengajuan kunjungan Anda telah <strong>DITERIMA</strong>.</p>`;
      message += `<p>Silakan cek aplikasi untuk detail selengkapnya.</p>`;
      message += `<p>Terima kasih.</p>`;
    } else if (status === "Ditolak") {
      message += `<p>Mohon maaf, pengajuan kunjungan Anda telah <strong>DITOLAK</strong>.</p>`;
      message += `<p><strong>Alasan penolakan:</strong> ${keterangan}</p>`;
      message += `<p>Silakan perbaiki pengajuan Anda sesuai keterangan di atas, kemudian ajukan kembali.</p>`;
    } else if (status === "Sedang Diproses") {
      message += `<p>Pengajuan kunjungan Anda saat ini sedang dalam <strong>proses peninjauan</strong>.</p>`;
      message += `<p>Kami akan mengirimkan notifikasi kembali ketika status berubah.</p>`;
    }

    try {
      await kirimEmail(email, subject, message, namaPengguna);
    } catch (error) {
      console.error("Gagal mengirim email notifikasi:", error);
      toast.error("Gagal mengirim email notifikasi");
    }
  };

  const suntingPengajuanKunjungan = async () => {
    if (!idPengajuanKunjungan) {
      toast.error("ID Pengajuan tidak valid!");
      return;
    }

    setSedangMemuatSuntingKunjungan(true);

    if (!validasiFormulir()) {
      setSedangMemuatSuntingKunjungan(false);
      return;
    }

    try {
      const pengajuanRef = doc(
        database,
        "pengajuan_kunjungan",
        idPengajuanKunjungan
      );
      const pengajuanSnap = await getDoc(pengajuanRef);

      if (!pengajuanSnap.exists()) {
        toast.error("Data pengajuan tidak ditemukan!");
        setSedangMemuatSuntingKunjungan(false);
        return;
      }

      const dataPengajuan = pengajuanSnap.data();

      const riwayatRef = doc(
        database,
        "riwayat_kunjungan",
        idPengajuanKunjungan
      );
      await setDoc(riwayatRef, {
        ...dataPengajuan,
        Status_Kunjungan: statusKunjungan,
        ...(statusKunjungan === "Ditolak" && {
          Keterangan_Penolakan: keteranganPenolakan,
        }),
        Tanggal_Update: new Date().toISOString(),
      });

      await deleteDoc(pengajuanRef);

      await kirimNotifikasiEmail(statusKunjungan, keteranganPenolakan);

      toast.success("Pengajuan Kunjungan berhasil diproses!");
      return true;
    } catch (error) {
      toast.error("Gagal menyunting pengajuan kunjungan: " + error.message);
      return false;
    } finally {
      setSedangMemuatSuntingKunjungan(false);
    }
  };

  useEffect(() => {
    if (idPengajuanKunjungan) {
      ambilDataPengajuanKunjungan();
    }
  }, [idPengajuanKunjungan]);

  return {
    statusKunjungan,
    setStatusKunjungan,
    suntingPengajuanKunjungan,
    sedangMemuatSuntingKunjungan,
    keteranganPenolakan,
    setKeteranganPenolakan,
    dataPengguna,
  };
}
