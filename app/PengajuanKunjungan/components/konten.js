"use client";

import ModalInformasiPengajuanKunjungan from "@/components/modalInformasiPengajuanKunjungan";
import ModalKonfirmasiPengajuanKunjunganDisetujui from "@/components/modalKonfirmasiPengajuanKunjunganDisetujui";
import ModalKonfirmasiPengajuanKunjunganDitolak from "@/components/modalKonfirmasiPengajuanKunjunganDitolak";
import useSetujiPengajuanKunjungan from "@/hooks/backend/useSetujiPengajuanKunjungan";
import useTampilkanPengajuanKunjungan from "@/hooks/backend/useTampilkanPengajuanKunjungan";
import useTolakPengajuanKunjungan from "@/hooks/backend/useTolakPengajuanKunjungan";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Input,
  Option,
  Select,
  Typography,
} from "@material-tailwind/react";
import { useEffect, useState } from "react";
import { AiOutlineCheck, AiOutlineClose, AiOutlineEye } from "react-icons/ai";
import { toast } from "react-toastify";

const PengajuanKunjungan = () => {
  const {
    dataPengajuan,
    loading,
    halaman,
    totalPengajuanKunjungan,
    ambilPengajuanSelanjutnya,
    ambilPengajuanSebelumnya,
    setSearch,
    search,
    filterTanggal,
    setFilterTanggal,
    filterType,
    setFilterType,
    refetch,
    totalHalaman,
  } = useTampilkanPengajuanKunjungan("!=Disetujui");

  const {
    setujuiKunjungan,
    loading: loadingSetujui,
    berhasil,
    error: errorSetujui,
  } = useSetujiPengajuanKunjungan();

  const {
    tolakKunjungan,
    loading: loadingTolak,
    berhasil: berhasilTolak,
    error: errorTolak,
  } = useTolakPengajuanKunjungan();

  const [dataTerpilih, setDataTerpilih] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [konfirmasiData, setKonfirmasiData] = useState(null);
  const [dataDitolak, setDataDitolak] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const handleOpenModal = (item) => {
    setDataTerpilih(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setDataTerpilih(null);
    setIsModalOpen(false);
  };

  const handleKonfirmasiSetujui = (item) => {
    setKonfirmasiData(item);
  };

  const handleSetujui = async () => {
    if (!konfirmasiData?.id || !konfirmasiData?.dataUser?.Email) {
      toast.error("ID atau Email tidak tersedia!");
      return;
    }

    setIsActionLoading(true);
    toast.info("Memproses persetujuan...");

    try {
      await setujuiKunjungan(konfirmasiData.id, konfirmasiData.dataUser.Email);
      toast.success("Pengajuan berhasil disetujui!");
      setKonfirmasiData(null);
      refetch();
    } catch (error) {
      toast.error(`Gagal menyetujui: ${error.message}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleTolak = (alasan) => {
    setIsActionLoading(true);
    toast.info("Memproses penolakan...");

    if (dataDitolak?.id && dataDitolak?.dataUser?.Email) {
      tolakKunjungan(dataDitolak.id, dataDitolak.dataUser.Email, alasan);
      setTimeout(() => {
        toast.success("Pengajuan berhasil ditolak!");
        setIsActionLoading(false);
      }, 2000);
    } else {
      toast.error("ID atau Email tidak tersedia!");
    }
    setDataDitolak(null);
  };

  useEffect(() => {
    if (berhasil) {
      toast.success("Pengajuan berhasil disetujui!");
      refetch();
    }
  }, [berhasil]);

  useEffect(() => {
    if (errorSetujui) {
      toast.error(`Gagal menyetujui: ${errorSetujui}`);
    }
  }, [errorSetujui]);

  useEffect(() => {
    if (berhasilTolak) {
      toast.success("Pengajuan berhasil ditolak!");
      refetch();
    }
  }, [berhasilTolak]);

  useEffect(() => {
    if (errorTolak) {
      toast.error(`Gagal menolak: ${errorTolak}`);
    }
  }, [errorTolak]);

  if (loading) {
    return <p className="text-gray-500">Memuat data pengajuan kunjungan...</p>;
  }

  const dataDitampilkan = dataPengajuan.filter(
    (item) => item.Status !== "Disetujui"
  );

  return (
    <Card className="p-4">
      <Typography variant="h5" className="mb-4 text-gray-800">
        Daftar Pengajuan Kunjungan
      </Typography>

      {/* FILTER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Input
          label="Cari..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Input
          label="Filter Tanggal Kunjungan"
          type="date"
          value={filterTanggal}
          onChange={(e) => setFilterTanggal(e.target.value)}
        />
        <Select
          label="Filter Tipe Pengunjung"
          value={filterType}
          onChange={(val) => setFilterType(val)}
        >
          <Option value="">Semua</Option>
          <Option value="perorangan">Perorangan</Option>
          <Option value="perusahaan">Perusahaan</Option>
        </Select>
      </div>

      {/* TABLE */}
      <CardBody className="overflow-x-auto p-0">
        {dataDitampilkan.length === 0 ? (
          <Typography className="p-4 text-gray-500">
            Tidak ada data pengajuan ditemukan.
          </Typography>
        ) : (
          <table className="w-full table-auto text-left text-sm">
            <thead>
              <tr className="bg-blue-gray-50">
                <th className="p-4">Asal Instansi</th>
                <th className="p-4">Tanggal</th>
                <th className="p-4">Jam</th>
                <th className="p-4">Stasiun</th>
                <th className="p-4">Jumlah Pengunjung</th>
                <th className="p-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {dataDitampilkan.map((item, index) => (
                <tr
                  key={item.id}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="p-4 max-w-xs truncate">
                    {item.Type === "perusahaan" ? "Perusahaan" : item.Instansi}
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    {item.TanggalKunjungan}
                  </td>
                  <td className="p-4 whitespace-nowrap">{item.JamKunjungan}</td>
                  <td className="p-4 max-w-xs truncate">{item.Stasiun}</td>
                  <td className="p-4">{item.JumlahPengunjung}</td>
                  <td className="p-4 flex gap-2 items-center">
                    {/* Tombol Lihat Detail */}
                    <AiOutlineEye
                      size={24}
                      className="text-blue-600 cursor-pointer hover:text-blue-800"
                      onClick={() => handleOpenModal(item)}
                    />

                    {/* Tombol Setujui */}
                    <AiOutlineCheck
                      size={24}
                      className={`${
                        isActionLoading
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-green-600 hover:text-green-800 cursor-pointer"
                      }`}
                      onClick={() => {
                        if (!isActionLoading) handleKonfirmasiSetujui(item);
                      }}
                    />

                    {/* Tombol Tolak */}
                    <AiOutlineClose
                      size={24}
                      className={`${
                        isActionLoading
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-red-600 hover:text-red-800 cursor-pointer"
                      }`}
                      onClick={() => {
                        if (!isActionLoading) setDataDitolak(item);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardBody>

      {/* PAGINATION */}
      <CardFooter className="flex flex-col md:flex-row items-center justify-between border-t border-blue-gray-50 p-4 gap-2">
        <Typography variant="small" color="blue-gray" className="font-normal">
          Halaman {halaman} dari {Math.ceil(totalPengajuanKunjungan / 5)}
        </Typography>
        <div className="flex items-center gap-2">
          <Button
            onClick={ambilPengajuanSebelumnya}
            variant="outlined"
            size="sm"
            disabled={halaman === 1}
          >
            Sebelumnya
          </Button>

          <Button
            onClick={ambilPengajuanSelanjutnya}
            variant="outlined"
            size="sm"
            disabled={halaman === totalHalaman}
          >
            Selanjutnya
          </Button>
        </div>
      </CardFooter>

      {/* MODAL DETAIL */}
      {dataTerpilih && (
        <ModalInformasiPengajuanKunjungan
          isOpen={isModalOpen}
          data={dataTerpilih}
          onClose={handleCloseModal}
        />
      )}

      {/* MODAL KONFIRMASI */}
      {konfirmasiData && !isActionLoading && (
        <ModalKonfirmasiPengajuanKunjunganDisetujui
          open={!!konfirmasiData}
          onClose={() => setKonfirmasiData(null)}
          onConfirm={handleSetujui}
          data={konfirmasiData}
        />
      )}

      {/* MODAL TOLAK */}
      {dataDitolak && (
        <ModalKonfirmasiPengajuanKunjunganDitolak
          open={!!dataDitolak}
          onClose={() => setDataDitolak(null)}
          onConfirm={handleTolak}
          data={dataDitolak}
        />
      )}
    </Card>
  );
};

export default PengajuanKunjungan;
