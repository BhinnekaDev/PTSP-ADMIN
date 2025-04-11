"use client";

import ModalInformasiPengajuanKunjungan from "@/components/modalInformasiPengajuanKunjungan";
import ModalUbahJadwalKunjungan from "@/components/modalUbahJadwalKunjungan";
import useTampilkanPengajuanKunjungan from "@/hooks/backend/useTampilkanPengajuanKunjungan";
import useUbahJadwalKunjungan from "@/hooks/backend/useUbahJadwalKunjungan";
import {
  Card,
  CardBody,
  CardFooter,
  Input,
  Option,
  Select,
  Typography,
} from "@material-tailwind/react";
import { useEffect, useState } from "react";
import {
  AiOutlineCalendar,
  AiOutlineClockCircle,
  AiOutlineEye,
} from "react-icons/ai";
import { toast } from "react-toastify";

const UbahJadwalKunjungan = () => {
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
  } = useTampilkanPengajuanKunjungan("Disetujui");

  const { ubahJadwal, loadingUbah } = useUbahJadwalKunjungan();
  const [dataTerpilih, setDataTerpilih] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalUbahOpen, setIsModalUbahOpen] = useState(false);
  const [isLoadingUbah, setIsLoadingUbah] = useState(false);

  const handleOpenModal = (item) => {
    setDataTerpilih(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setDataTerpilih(null);
    setIsModalOpen(false);
  };

  const handleOpenModalUbah = (item) => {
    setDataTerpilih(item);
    setIsModalUbahOpen(true);
  };

  const handleCloseModalUbah = () => {
    setDataTerpilih(null);
    setIsModalUbahOpen(false);
  };

  const handleUbahJadwal = async ({ id, tanggal, jam, email, alasan }) => {
    setIsLoadingUbah(true);
    const toastId = toast.loading("Mengubah jadwal...");

    try {
      await ubahJadwal(id, tanggal, jam, email, alasan);
      toast.dismiss(toastId);
      toast.success("Jadwal berhasil diubah!", { id: toastId });
      refetch();
      setIsModalUbahOpen(false); // Tutup modal
    } catch (error) {
      toast.error(`Gagal mengubah jadwal: ${error.message}`, { id: toastId });
    } finally {
      setIsLoadingUbah(false);
    }
  };

  useEffect(() => {
    refetch();
  }, [search, filterTanggal, filterType]);

  if (loading) {
    return <p className="text-gray-500">Memuat data pengajuan kunjungan...</p>;
  }

  const dataDitampilkan = dataPengajuan.filter(
    (item) => item.Status === "Disetujui"
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
                  <td className="p-a space-x-2 flex items-center justify-center">
                    {/* Tombol Lihat Detail */}
                    <AiOutlineEye
                      size={24}
                      className="text-blue-600 cursor-pointer hover:text-blue-800"
                      onClick={() => handleOpenModal(item)}
                    />

                    {/* Tombol Ubah Jadwal */}
                    <button
                      className="flex items-center space-x-1 p-2 bg-green-600 text-white rounded hover:bg-green-700"
                      onClick={() => handleOpenModalUbah(item)}
                    >
                      <AiOutlineCalendar size={20} />
                      <AiOutlineClockCircle size={20} />
                    </button>
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
          <button
            onClick={ambilPengajuanSebelumnya}
            disabled={halaman === 1}
            className={`px-3 py-1 border rounded ${
              halaman === 1 ? "bg-gray-200 cursor-not-allowed" : "bg-white"
            }`}
          >
            Sebelumnya
          </button>
          <button
            onClick={ambilPengajuanSelanjutnya}
            disabled={halaman === Math.ceil(totalPengajuanKunjungan / 5)}
            className={`px-3 py-1 border rounded ${
              halaman === Math.ceil(totalPengajuanKunjungan / 5)
                ? "bg-gray-200 cursor-not-allowed"
                : "bg-white"
            }`}
          >
            Selanjutnya
          </button>
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

      {/* MODAL UBAH JADWAL */}
      {isModalUbahOpen && (
        <ModalUbahJadwalKunjungan
          open={isModalUbahOpen}
          onClose={handleCloseModalUbah}
          data={dataTerpilih}
          onConfirm={handleUbahJadwal} // Menambahkan fungsi untuk konfirmasi ubah jadwal
        />
      )}
    </Card>
  );
};

export default UbahJadwalKunjungan;
