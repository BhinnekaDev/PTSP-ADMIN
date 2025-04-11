"use client";

import { app } from "@/lib/firebaseConfig";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";

const database = getFirestore(app);

const useTampilkanPengajuanKunjungan = (statusFilter = null) => {
  const [dataPengajuan, setDataPengajuan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterTanggal, setFilterTanggal] = useState("");
  const [filterType, setFilterType] = useState("");
  const [halaman, setHalaman] = useState(1);
  const batasHalaman = 5;

  const fetchData = async () => {
    setLoading(true);
    try {
      const idAdminSession = localStorage.getItem("ID_Admin");
      if (!idAdminSession) {
        console.warn("Pengguna belum login.");
        return;
      }

      const snapshot = await getDocs(
        collection(database, "pengajuan_kunjungan")
      );

      const hasil = snapshot.docs.map((doc) => {
        const data = doc.data();
        const user = data.dataUser || {};
        const isPerusahaan = user.type === "perusahaan";

        const dataUser = {
          type: user.type,
          Nama_Lengkap: user.Nama_Lengkap,
          Email: user.Email,
          Jenis_Kelamin: user.Jenis_Kelamin,
          No_Hp: user.No_Hp,
          No_Identitas: user.No_Identitas,
          Pekerjaan: user.Pekerjaan,
          Pendidikan_Terakhir: user.Pendidikan_Terakhir,
          Tanggal_Pembuatan_Akun: user.Tanggal_Pembuatan_Akun,
          ...(isPerusahaan && {
            Alamat_Perusahaan: user.Alamat_Perusahaan,
            Email_Perusahaan: user.Email_Perusahaan,
            NPWP_Perusahaan: user.NPWP_Perusahaan,
            Nama_Perusahaan: user.Nama_Perusahaan,
            No_Hp_Perusahaan: user.No_Hp_Perusahaan,
            Kabupaten_Kota_Perusahaan: user.Kabupaten_Kota_Perusahaan,
            Provinsi_Perusahaan: user.Provinsi_Perusahaan,
          }),
        };

        return {
          id: doc.id,
          FileURL: data.FileURL,
          Instansi: isPerusahaan ? "perusahaan" : data.Instansi,
          JamKunjungan: data.JamKunjungan,
          JumlahPengunjung: data.JumlahPengunjung,
          Keterangan: data.Keterangan || "",
          NamaInstansi: data.NamaInstansi || "",
          NoSurat: data.NoSurat,
          Stasiun: data.Stasiun,
          TanggalKunjungan: data.TanggalKunjungan,
          TujuanBerkunjung: data.TujuanBerkunjung,
          timestamp: data.timestamp,
          Status: data.Status,
          dataUser,
        };
      });

      setDataPengajuan(hasil);
    } catch (err) {
      console.error("Gagal mengambil data pengajuan kunjungan:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setHalaman(1);
  }, [search, filterTanggal, filterType]);

  const dataPengajuanTerfilter = useMemo(() => {
    return dataPengajuan.filter((item) => {
      const keyword = search.toLowerCase();

      const cocokSearch =
        item.Instansi?.toLowerCase().includes(keyword) ||
        item.NamaInstansi?.toLowerCase().includes(keyword) ||
        item.Stasiun?.toLowerCase().includes(keyword) ||
        item.TujuanBerkunjung?.toLowerCase().includes(keyword) ||
        item.Keterangan?.toLowerCase().includes(keyword) ||
        item.dataUser?.Nama_Lengkap?.toLowerCase().includes(keyword) ||
        item.dataUser?.Email?.toLowerCase().includes(keyword);

      const cocokTanggal =
        !filterTanggal || item.TanggalKunjungan === filterTanggal;

      const cocokType =
        !filterType ||
        item.dataUser?.type?.toLowerCase() === filterType.toLowerCase();

      const cocokStatus =
        statusFilter === null
          ? true
          : statusFilter === "!=Disetujui"
          ? item.Status !== "Disetujui"
          : item.Status === statusFilter;

      return cocokSearch && cocokTanggal && cocokType && cocokStatus;
    });
  }, [dataPengajuan, search, filterTanggal, filterType, statusFilter]);

  const totalPengajuanKunjungan = dataPengajuanTerfilter.length;
  const totalHalaman = Math.ceil(totalPengajuanKunjungan / batasHalaman) || 1;
  const startIndex = Math.max((halaman - 1) * batasHalaman, 0);
  const endIndex = startIndex + batasHalaman;

  const dataPengajuanPaginated = dataPengajuanTerfilter.slice(
    startIndex,
    endIndex
  );

  const ambilPengajuanSebelumnya = () => {
    if (halaman > 1) setHalaman(halaman - 1);
  };

  const ambilPengajuanSelanjutnya = () => {
    if (halaman < totalHalaman) setHalaman(halaman + 1);
  };

  return {
    dataPengajuan: dataPengajuanPaginated,
    totalPengajuanKunjungan,
    totalHalaman,
    halaman,
    setHalaman,
    ambilPengajuanSebelumnya,
    ambilPengajuanSelanjutnya,
    loading,
    search,
    setSearch,
    filterTanggal,
    setFilterTanggal,
    filterType,
    setFilterType,
    batasHalaman,
    refetch: fetchData,
  };
};

export default useTampilkanPengajuanKunjungan;
