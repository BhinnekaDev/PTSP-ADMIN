import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Typography,
} from "@material-tailwind/react";

const ModalKonfirmasiPengajuanKunjunganDisetujui = ({
  open,
  onClose,
  onConfirm,
  data,
}) => {
  if (!data) return null;

  const { dataUser, TanggalKunjungan, JamKunjungan, Stasiun } = data;

  return (
    <Dialog open={open} handler={onClose}>
      <DialogHeader>Konfirmasi Persetujuan</DialogHeader>
      <DialogBody>
        <Typography className="mb-2">
          Apakah Anda yakin ingin menyetujui pengajuan kunjungan ini?
        </Typography>

        <div className="text-sm space-y-1">
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
      </DialogBody>
      <DialogFooter>
        <Button variant="text" color="red" onClick={onClose}>
          Batal
        </Button>
        <Button variant="gradient" color="green" onClick={onConfirm}>
          Setujui
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default ModalKonfirmasiPengajuanKunjunganDisetujui;
