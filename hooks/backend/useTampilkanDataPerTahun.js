import { useEffect, useState } from "react";
import { database } from "@/lib/firebaseConfig";
import { collection, getDocs, Timestamp } from "firebase/firestore";
// KONSTANTA KAMI
import { bulan } from "@/constants/bulan";

const useTampilkanDataPerTahun = () => {
  const [dataBulanTahun, setDataBulanTahun] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const bulanTahunSet = new Set();
      const koleksi = [
        "admin",
        "informasi",
        "jasa",
        "perorangan",
        "perusahaan",
        "pemesanan",
        "saran",
        "pengaduan",
        "pengajuan_kunjungan",
        "riwayat_kunjungan",
      ];

      for (const koleksiNama of koleksi) {
        const querySnapshot = await getDocs(collection(database, koleksiNama));

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const tanggal =
            (koleksiNama === "admin" ||
              koleksiNama === "perorangan" ||
              koleksiNama === "perusahaan") &&
            data.Tanggal_Pembuatan_Akun instanceof Timestamp
              ? data.Tanggal_Pembuatan_Akun.toDate()
              : (koleksiNama === "informasi" ||
                  koleksiNama === "jasa" ||
                  koleksiNama === "saran" ||
                  koleksiNama === "pengaduan") &&
                data.Tanggal_Pembuatan instanceof Timestamp
              ? data.Tanggal_Pembuatan.toDate()
              : koleksiNama === "pemesanan" &&
                data.Tanggal_Pemesanan instanceof Timestamp
              ? data.Tanggal_Pemesanan.toDate()
              : (koleksiNama === "pengajuan_kunjungan" ||
                  koleksiNama === "riwayat_kunjungan") &&
                data.Tanggal_Kunjungan instanceof Timestamp
              ? data.Tanggal_Kunjungan.toDate()
              : null;

          if (tanggal) {
            const tahun = tanggal.getFullYear();
            const bulanIndex = tanggal.getMonth();
            const bulanNama = bulan[bulanIndex];
            bulanTahunSet.add(`${bulanNama} ${tahun}`);
          }
        });
      }

      setDataBulanTahun(Array.from(bulanTahunSet));
    };

    fetchData();
  }, []);

  return dataBulanTahun;
};

export default useTampilkanDataPerTahun;
