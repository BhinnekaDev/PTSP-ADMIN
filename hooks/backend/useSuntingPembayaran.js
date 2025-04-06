import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { doc, updateDoc, getDoc } from "firebase/firestore";
// PERPUSTAKAAN KAMI
import { database } from "@/lib/firebaseConfig";
import { kirimEmail } from "@/hooks/backend/useNotifikasiEmail";

export default function useSuntingPembayaran(idPemesanan) {
  const [statusPembayaran, setStatusPembayaran] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [sedangMemuatSuntingPembayaran, setSedangMemuatSuntingPembayaran] =
    useState(false);

  const ambilDataPembayaran = async () => {
    try {
      const pemesananRef = doc(database, "pemesanan", idPemesanan);
      const docSnap = await getDoc(pemesananRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setStatusPembayaran(data.Status_Pembayaran || "");
        setKeterangan(data.Keterangan || "");
      } else {
        toast.error("Data pemesanan tidak ditemukan.");
      }
    } catch (error) {
      console.error("Gagal mengambil data pembayaran:", error);
      toast.error("Terjadi kesalahan saat mengambil data pembayaran.");
    }
  };

  const ambilDataPengguna = async (idPengguna) => {
    try {
      const peroranganRef = doc(database, "perorangan", idPengguna);
      const peroranganSnap = await getDoc(peroranganRef);

      if (peroranganSnap.exists()) {
        const data = peroranganSnap.data();
        return {
          email: data.Email || "",
          nama: data.Nama_Lengkap || "",
        };
      }

      const perusahaanRef = doc(database, "perusahaan", idPengguna);
      const perusahaanSnap = await getDoc(perusahaanRef);

      if (perusahaanSnap.exists()) {
        const data = perusahaanSnap.data();
        return {
          email: data.Email || "",
          nama: data.Nama_Lengkap || "",
        };
      }
    } catch (error) {
      console.error("Gagal mengambil data pengguna:", error);
    }

    return { email: "", nama: "" };
  };

  const validasiFormulir = () => {
    if (!statusPembayaran) {
      toast.error("Masukkan status pembayaran.");
      return false;
    }

    if (statusPembayaran === "Ditolak" && !keterangan.trim()) {
      toast.error("Masukkan keterangan untuk penolakan.");
      return false;
    }

    return true;
  };

  const suntingPembayaran = async () => {
    setSedangMemuatSuntingPembayaran(true);

    if (!validasiFormulir()) {
      setSedangMemuatSuntingPembayaran(false);
      return;
    }

    try {
      const pemesananRef = doc(database, "pemesanan", idPemesanan);
      const pemesananSnap = await getDoc(pemesananRef);

      if (!pemesananSnap.exists()) {
        throw new Error("Dokumen pemesanan tidak ditemukan.");
      }

      const dataPemesanan = pemesananSnap.data();
      const idPengguna = dataPemesanan.ID_Pengguna;

      const updateData = {
        Status_Pembayaran: statusPembayaran,
        Keterangan: statusPembayaran === "Ditolak" ? keterangan.trim() : "",
      };

      await updateDoc(pemesananRef, updateData);
      toast.success("Status pembayaran berhasil diperbarui.");

      const { email, nama } = await ambilDataPengguna(idPengguna);

      if (email) {
        let subjek = "Status Pembayaran Diperbarui";
        let isiPesan = "";

        if (statusPembayaran === "Lunas") {
          isiPesan = `Halo ${
            nama || "Pengguna"
          },\n\nPembayaran Anda telah lunas.\n\nTerima kasih telah menggunakan layanan kami.`;
        } else {
          isiPesan = `Halo ${
            nama || "Pengguna"
          },\n\nStatus pembayaran Anda untuk pemesanan dengan ID ${idPemesanan} ditolak.`;

          if (statusPembayaran === "Ditolak" && keterangan) {
            isiPesan += `\n\nKeterangan: ${keterangan.trim()}`;
          }

          isiPesan += `\n\nSilakan periksa detailnya di platform kami.\n\nTerima kasih.`;
        }

        await kirimEmail(email, subjek, isiPesan);
      }
    } catch (error) {
      console.error("Gagal memperbarui status pembayaran:", error);
      toast.error("Terjadi kesalahan saat memperbarui status pembayaran.");
    } finally {
      setSedangMemuatSuntingPembayaran(false);
    }
  };

  useEffect(() => {
    if (idPemesanan) {
      ambilDataPembayaran();
    }
  }, [idPemesanan]);

  return {
    statusPembayaran,
    setStatusPembayaran,
    keterangan,
    setKeterangan,
    suntingPembayaran,
    sedangMemuatSuntingPembayaran,
  };
}
