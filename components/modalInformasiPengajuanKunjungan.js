import Memuat from "@/components/memuat";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  IconButton,
} from "@material-tailwind/react";

const ModalInformasiPengajuanKunjungan = ({ isOpen, onClose, data }) => {
  if (!data) return <Memuat />;

  const formatDateTime = (date) =>
    date?.toDate ? date.toDate().toLocaleString() : "-";

  const isPerusahaan = data.dataUser?.type === "perusahaan";

  return (
    <Dialog
      open={isOpen}
      size="xl"
      handler={onClose}
      className="overflow-auto max-h-[90vh]"
    >
      <DialogHeader className="flex justify-between items-start">
        <h2 className="text-lg font-semibold text-gray-900">
          Detail Pengajuan Kunjungan
        </h2>
        <IconButton variant="text" color="gray" onClick={onClose}>
          <XMarkIcon className="h-5 w-5" />
        </IconButton>
      </DialogHeader>

      <DialogBody className="space-y-6 text-sm">
        {/* Bagian: Info Pengajuan */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">
            Informasi Pengajuan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem label="Instansi" value={data.Instansi} />
            <InfoItem label="Nama Instansi" value={data.NamaInstansi || "-"} />
            <InfoItem label="No Surat" value={data.NoSurat} />
            <InfoItem label="Jam Kunjungan" value={data.JamKunjungan} />
            <InfoItem label="Tanggal Kunjungan" value={data.TanggalKunjungan} />
            <InfoItem label="Stasiun" value={data.Stasiun} />
            <InfoItem label="Jumlah Pengunjung" value={data.JumlahPengunjung} />
            <InfoItem label="Tujuan Berkunjung" value={data.TujuanBerkunjung} />
            <InfoItem label="Keterangan" value={data.Keterangan || "-"} />
            <InfoItem label="Type" value={data.dataUser?.type || "-"} />
            <InfoItem
              label="Waktu Pengajuan"
              value={formatDateTime(data.timestamp)}
            />
          </div>
        </div>

        {/* Bagian: Data User */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Data User</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem
              label="Nama Lengkap"
              value={data.dataUser?.Nama_Lengkap}
            />
            <InfoItem label="Email" value={data.dataUser?.Email} />

            {isPerusahaan && (
              <>
                <InfoItem
                  label="Email Perusahaan"
                  value={data.dataUser?.Email_Perusahaan}
                />
                <InfoItem
                  label="Nama Perusahaan"
                  value={data.dataUser?.Nama_Perusahaan}
                />
                <InfoItem
                  label="No HP Perusahaan"
                  value={data.dataUser?.No_Hp_Perusahaan}
                />
                <InfoItem
                  label="NPWP Perusahaan"
                  value={data.dataUser?.NPWP_Perusahaan}
                />
                <InfoItem
                  label="Alamat Perusahaan"
                  value={data.dataUser?.Alamat_Perusahaan}
                />
                <InfoItem
                  label="Kabupaten/Kota"
                  value={data.dataUser?.Kabupaten_Kota_Perusahaan}
                />
                <InfoItem
                  label="Provinsi"
                  value={data.dataUser?.Provinsi_Perusahaan}
                />
              </>
            )}

            <InfoItem label="No HP" value={data.dataUser?.No_Hp} />
            {!isPerusahaan && (
              <InfoItem
                label="No Identitas"
                value={data.dataUser?.No_Identitas}
              />
            )}
            <InfoItem
              label="Jenis Kelamin"
              value={data.dataUser?.Jenis_Kelamin}
            />
            <InfoItem label="Pekerjaan" value={data.dataUser?.Pekerjaan} />
            <InfoItem
              label="Pendidikan Terakhir"
              value={data.dataUser?.Pendidikan_Terakhir}
            />
            {/* Tanggal Pembuatan Akun */}
            <InfoItem
              label="Tanggal Pembuatan Akun"
              value={
                data.dataUser?.Tanggal_Pembuatan_Akun
                  ? data.dataUser.Tanggal_Pembuatan_Akun.toDate().toLocaleDateString()
                  : "-"
              }
            />
          </div>
        </div>

        {/* Bagian: File */}
        {data.FileURL && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-1">File Dokumen</h3>
            <a
              href={data.FileURL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline break-all hover:text-blue-800 transition-colors duration-200"
            >
              Lihat Dokumen
            </a>
          </div>
        )}
      </DialogBody>

      {/* Tombol Tutup */}
      <DialogFooter>
        <Button variant="gradient" color="gray" onClick={onClose}>
          Tutup
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

// Komponen untuk menampilkan item informasi
const InfoItem = ({ label, value }) => (
  <p className={`flex items-center`}>
    {/* Label dengan gaya tebal */}
    <strong className={`mr-2`}>{label}:</strong>
    {/* Nilai dengan warna teks */}
    <span className={`text-gray-800`}>{value}</span>
  </p>
);

export default ModalInformasiPengajuanKunjungan;
