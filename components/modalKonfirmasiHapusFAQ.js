// components/ModalKonfirmasiHapusFAQ.js
import React from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Typography,
} from "@material-tailwind/react";
import Memuat from "@/components/memuat";

const ModalKonfirmasiHapusFAQ = ({
  terbuka,
  tertutup,
  data,
  onConfirm,
  sedangMemuat = false,
  title = "Konfirmasi Hapus",
  message = "Apakah Anda yakin ingin menghapus FAQ ini?",
}) => {
  console.log("Modal Hapus - Data yang diterima:", data);

  const getPertanyaan = () => {
    if (!data) return "-";
    return data.question || data.pertanyaan || data.judul || data.title || "-";
  };

  const getKategori = () => {
    if (!data) return "Umum";
    return data.category || data.kategori || "Umum";
  };

  const getId = () => {
    if (!data) return "-";
    return data.id || "-";
  };

  return (
    <Dialog
      open={terbuka}
      handler={tertutup}
      animate={{
        mount: { scale: 1, y: 0 },
        unmount: { scale: 0.9, y: -100 },
      }}
      size="sm"
      className="bg-white"
    >
      <div className="p-4">
        <DialogHeader className="flex items-center gap-3 p-0 pb-4">
          <Typography variant="h5" color="red" className="font-bold">
            {title}
          </Typography>
        </DialogHeader>

        <DialogBody className="p-0 py-4">
          <Typography
            variant="paragraph"
            color="blue-gray"
            className="text-gray-700"
          >
            {message}
          </Typography>

          {data && (
            <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-100">
              <Typography
                variant="small"
                className="font-semibold text-red-700 mb-2"
              >
                Detail FAQ:
              </Typography>

              <Typography
                variant="small"
                className="text-gray-700 break-words mb-1"
              >
                <span className="font-medium">Kategori:</span> {getKategori()}
              </Typography>

              <Typography variant="small" className="text-gray-700 break-words">
                <span className="font-medium">Pertanyaan:</span>{" "}
                {getPertanyaan().length > 80
                  ? getPertanyaan().slice(0, 80) + "..."
                  : getPertanyaan()}
              </Typography>
            </div>
          )}

          {!data && (
            <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
              <Typography variant="small" className="text-yellow-700">
                Tidak ada data FAQ yang dipilih
              </Typography>
            </div>
          )}

          <Typography
            variant="small"
            className="text-gray-500 mt-3 flex items-center gap-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
            Tindakan ini tidak dapat dibatalkan!
          </Typography>
        </DialogBody>

        <DialogFooter className="flex gap-2 p-0 pt-4">
          <Button
            variant="outlined"
            color="blue-gray"
            onClick={tertutup}
            disabled={sedangMemuat}
            className="capitalize"
          >
            Batal
          </Button>
          <Button
            variant="gradient"
            color="red"
            onClick={onConfirm}
            disabled={sedangMemuat || !data}
            className="capitalize flex items-center gap-1"
          >
            {sedangMemuat ? <Memuat /> : "Hapus"}
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
};

export default ModalKonfirmasiHapusFAQ;
