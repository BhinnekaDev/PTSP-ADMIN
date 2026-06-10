// components/modalKonfirmasiHapusChat.js
import React from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  IconButton,
} from "@material-tailwind/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Memuat from "@/components/memuat";

const ModalKonfirmasiHapusChat = ({
  terbuka,
  tertutup,
  chatTerpilih,
  konfirmasiHapusChat,
  sedangMemuatHapus,
}) => {
  return (
    <Dialog
      open={terbuka}
      onClose={tertutup}
      animate={{
        mount: { scale: 1, y: 0 },
        unmount: { scale: 0.9, y: -100 },
      }}
      size="sm"
      className="bg-white max-w-sm sm:max-w-sm md:max-w-md lg:max-w-lg"
    >
      <div className="absolute top-3 right-3">
        <IconButton variant="text" color="red" onClick={tertutup}>
          <XMarkIcon className="h-6 w-6" />
        </IconButton>
      </div>

      <DialogHeader className="text-black">Konfirmasi Hapus Chat</DialogHeader>
      <DialogBody className="text-black">
        <p>Apakah Anda yakin ingin menghapus seluruh percakapan ini?</p>
        <p className="text-sm text-red-500 mt-2 font-medium">
          Peringatan: Semua pesan dan file yang terlampir akan dihapus secara
          permanen!
        </p>
      </DialogBody>

      <DialogFooter className="space-x-4">
        <Button
          variant="text"
          color="gray"
          onClick={tertutup}
          disabled={sedangMemuatHapus}
        >
          Batal
        </Button>
        <Button
          onClick={konfirmasiHapusChat}
          variant="gradient"
          color="red"
          disabled={sedangMemuatHapus}
        >
          {sedangMemuatHapus ? <Memuat /> : "Hapus Percakapan"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default ModalKonfirmasiHapusChat;
