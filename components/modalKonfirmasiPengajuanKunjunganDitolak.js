import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Textarea,
  Typography,
} from "@material-tailwind/react";
import { useState } from "react";

const ModalKonfirmasiPengajuanKunjunganDitolak = ({
  open,
  onClose,
  onConfirm,
  data,
}) => {
  const [alasan, setAlasan] = useState("");

  const handleKonfirmasi = () => {
    if (!alasan.trim()) return alert("Alasan wajib diisi!");
    onConfirm(alasan);
    setAlasan("");
  };

  if (!data) return null;
  const { dataUser, TanggalKunjungan, JamKunjungan, Stasiun } = data;

  return (
    <Dialog open={open} handler={onClose} size="md">
      <DialogHeader>Konfirmasi Penolakan</DialogHeader>
      <DialogBody>
        <Typography className="mb-2">
          Apakah Anda yakin ingin <strong>menolak</strong> pengajuan kunjungan
          ini?
        </Typography>
        <div className="text-sm space-y-1 mb-4">
          <p>
            <strong>Nama Pengaju:</strong> {dataUser?.Nama_Lengkap}
          </p>
          <p>
            <strong>Email:</strong> {dataUser?.Email}
          </p>
          <p>
            <strong>Tanggal Kunjungan:</strong> {TanggalKunjungan}
          </p>
          <p>
            <strong>Jam Kunjungan:</strong> {JamKunjungan}
          </p>
          <p>
            <strong>Stasiun:</strong> {Stasiun}
          </p>
        </div>
        <Textarea
          label="Alasan Penolakan"
          value={alasan}
          onChange={(e) => setAlasan(e.target.value)}
          rows={4} // Menambahkan jumlah baris untuk textarea
        />
      </DialogBody>
      <DialogFooter>
        <Button variant="text" color="gray" onClick={onClose}>
          Batal
        </Button>
        <Button variant="gradient" color="red" onClick={handleKonfirmasi}>
          Tolak
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default ModalKonfirmasiPengajuanKunjunganDitolak;
