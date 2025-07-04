import React from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Typography,
  Input,
  IconButton,
  Button,
} from "@material-tailwind/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
// PENGAIT KAMI
import useKirimFile from "@/hooks/backend/useKirimFile";
// KOMPONEN KAMI
import Memuat from "@/components/memuat";

const ModalSuntingPembuatan = ({ terbuka, tertutup, pembuatanYangDipilih }) => {
  const {
    kirim,
    nomorSurat,
    setKirimFile,
    setNomorSurat,
    sedangMemuatKirimFile,
    dataKeranjang,
  } = useKirimFile(pembuatanYangDipilih);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setKirimFile(file); // Sekarang menyimpan file tunggal, bukan array
  };

  return (
    <Dialog
      open={terbuka}
      handler={tertutup}
      animate={{
        mount: { scale: 1, y: 0 },
        unmount: { scale: 0.9, y: -100 },
      }}
      size="xl"
      className="bg-white max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-4"
    >
      <div className="overflow-scroll h-screen">
        <div className="absolute top-3 right-3">
          <IconButton
            variant="text"
            color="red"
            onClick={() => tertutup(false)}
            className="text-red-500 hover:bg-transparent"
          >
            <XMarkIcon className="h-6 w-6" />
          </IconButton>
        </div>

        <DialogHeader className="text-black">Sunting Pembuatan</DialogHeader>

        <DialogBody divider>
          <form className="flex flex-col gap-4">
            <div className="w-full mt-2">
              <Typography className="mb-2" variant="h6">
                Nomor Surat
              </Typography>
              <Input
                value={nomorSurat}
                onChange={(e) => setNomorSurat(e.target.value)}
                label="Nomor Surat"
                type="text"
                size="lg"
              />
            </div>

            <div className="w-full mt-2">
              <Typography className="mb-2" variant="h6">
                Berkas untuk Semua Produk
                <div className="space-y-3">
                  {dataKeranjang.map((keranjang, indeks) => (
                    <div key={indeks} className="flex items-start">
                      <Typography
                        variant="small"
                        className="flex items-start gap-2"
                      >
                        <span className="font-bold min-w-[20px]">
                          {indeks + 1}.
                        </span>
                        <span>{keranjang.Nama}</span>
                      </Typography>
                    </div>
                  ))}
                </div>
              </Typography>
              <Input
                type="file"
                size="lg"
                onChange={handleFileChange}
                className="file-input"
              />
            </div>

            {/* Tetap menampilkan daftar produk untuk informasi */}
          </form>
        </DialogBody>

        <DialogFooter>
          <Button
            onClick={async () => {
              await kirim();
              tertutup(false);
            }}
            variant="gradient"
            color="black"
            disabled={sedangMemuatKirimFile}
            className={`${
              sedangMemuatKirimFile
                ? "opacity-50 cursor-not-allowed"
                : "opacity-100"
            }`}
          >
            {sedangMemuatKirimFile ? <Memuat /> : "Kirim Berkas"}
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
};

export default ModalSuntingPembuatan;
