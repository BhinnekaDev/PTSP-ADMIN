import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Input,
  Option,
  Select,
  Textarea,
} from "@material-tailwind/react";
import { useEffect, useState } from "react";

const ModalUbahJadwalKunjungan = ({ open, onClose, onConfirm, data }) => {
  const [TanggalKunjungan, setTanggalKunjungan] = useState("");
  const [JamKunjungan, setJamKunjungan] = useState("");
  const [AlasanPerubahan, setAlasanPerubahan] = useState("");

  useEffect(() => {
    if (data) {
      setTanggalKunjungan(data.TanggalKunjungan || "");
      setJamKunjungan(data.JamKunjungan || "");
    }
  }, [data]);

  const handleSimpan = () => {
    if (!TanggalKunjungan || !JamKunjungan || !AlasanPerubahan.trim()) {
      alert("Semua field wajib diisi.");
      return;
    }

    onConfirm({
      id: data.id,
      tanggal: TanggalKunjungan,
      jam: JamKunjungan,
      alasan: AlasanPerubahan,
      email: data.dataUser?.Email,
    });

    onClose();
    setAlasanPerubahan(""); // reset alasan agar tidak tersisa di modal
  };

  if (!data) return null;

  return (
    <Dialog open={open} handler={onClose} size="sm">
      <DialogHeader>Ubah Jadwal Kunjungan</DialogHeader>
      <DialogBody>
        <div className="flex flex-col gap-4">
          {/* Input Tanggal Kunjungan */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Tanggal Kunjungan <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={TanggalKunjungan}
              onChange={(e) => setTanggalKunjungan(e.target.value)}
            />
          </div>

          {/* Input Jam Kunjungan */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Jam Kunjungan <span className="text-red-500">*</span>
            </label>
            <Select
              label="Jam Kunjungan"
              value={JamKunjungan}
              onChange={(val) => setJamKunjungan(val)}
            >
              <Option value="09:00 - 10:00 WIB">09:00 - 10:00 WIB</Option>
              <Option value="10:00 - 11:00 WIB">10:00 - 11:00 WIB</Option>
              <Option value="11:00 - 12:00 WIB">11:00 - 12:00 WIB</Option>
              <Option value="13:00 - 14:00 WIB">13:00 - 14:00 WIB</Option>
              <Option value="14:00 - 15:00 WIB">14:00 - 15:00 WIB</Option>
            </Select>
          </div>

          {/* Input Alasan Perubahan */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Alasan Perubahan Jadwal <span className="text-red-500">*</span>
            </label>
            <Textarea
              label="Alasan Perubahan"
              value={AlasanPerubahan}
              onChange={(e) => setAlasanPerubahan(e.target.value)}
              rows={3}
            />
          </div>
        </div>
      </DialogBody>

      <DialogFooter>
        <Button variant="text" onClick={onClose}>
          Batal
        </Button>
        <Button onClick={handleSimpan}>Simpan</Button>
      </DialogFooter>
    </Dialog>
  );
};

export default ModalUbahJadwalKunjungan;
