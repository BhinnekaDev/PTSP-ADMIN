import React from "react";
import {
  Dialog,
  Typography,
  DialogHeader,
  DialogBody,
  DialogFooter,
  IconButton,
  Button,
  Input,
} from "@material-tailwind/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { FaRegTrashAlt } from "react-icons/fa";
import Memuat from "@/components/memuat";
import useSuntingNomorVABaru from "@/hooks/backend/useSuntingNomorVABaru";

const ModalSuntingVaKadaluwarsa = ({ terbuka, tertutup, VaYangTerplih }) => {
  const {
    dataKeranjang,
    nomorVAs,
    setNomorVAs,
    tanggalMasuk,
    setTanggalMasuk,
    tanggalKadaluwarsa,
    setTanggalKadaluwarsa,
    sedangMemuatSuntingVaBaru,
    suntingVaBaru,
    file,
    setFile,
    fileURL,
    sedangMengunggah,
  } = useSuntingNomorVABaru(VaYangTerplih);

  const handleDelete = () => {
    setFile(null);
    document.getElementById("upload-file-va").value = "";
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
      <div className="p-4 max-h-[80vh] overflow-y-auto">
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

        <DialogHeader className="text-black">Sunting Nomor VA</DialogHeader>

        <DialogBody divider>
          <form className="flex flex-col gap-4">
            <Typography className="-mb-2" variant="h6">
              Tanggal Masuk Virtual Akun
            </Typography>
            <Input
              type="datetime-local"
              size="lg"
              label="Tanggal Masuk"
              value={tanggalMasuk}
              onChange={(e) => setTanggalMasuk(e.target.value)}
            />

            <Typography className="-mb-2" variant="h6">
              Tanggal Kadaluwarsa Virtual Akun
            </Typography>
            <Input
              type="datetime-local"
              size="lg"
              label="Tanggal Kadaluwarsa"
              value={tanggalKadaluwarsa}
              onChange={(e) => setTanggalKadaluwarsa(e.target.value)}
            />

            {/* File Upload Section */}
            <div className="w-full">
              <Typography className="-mb-2" variant="h6">
                Unggah File
              </Typography>
              <div className="w-full border border-gray-400 rounded-md py-2 px-2 flex items-center justify-between relative min-h-[42px]">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="upload-file-va"
                    className="rounded-sm border border-blue-gray-200 px-3 py-1 bg-blue-gray-50 text-sm font-medium text-blue-gray-700 hover:bg-blue-gray-100 hover:text-blue-gray-900 cursor-pointer"
                  >
                    Pilih File
                  </label>
                  <Typography className="text-sm text-blue-gray-700 truncate max-w-[180px]">
                    {file
                      ? file.name
                      : fileURL
                      ? "File sudah diunggah"
                      : "Tidak ada file yang dipilih"}
                  </Typography>
                </div>

                {(file || fileURL) && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaRegTrashAlt className="h-4 w-4" />
                  </button>
                )}

                <input
                  id="upload-file-va"
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="absolute top-0 left-0 h-full w-full opacity-0 cursor-pointer"
                />
              </div>
              {sedangMengunggah && (
                <Typography variant="small" className="text-blue-500 mt-1">
                  Mengunggah file...
                </Typography>
              )}
            </div>

            {/* VA Numbers List */}
            {dataKeranjang.map((item, index) => (
              <div key={index} className="mb-4">
                <Typography variant="h6">
                  Nomor VA Baru - {item?.Jenis_Produk || "Tidak Tersedia"} (
                  {item?.Pemilik || "Tidak Tersedia"})
                </Typography>
                <Typography className="font-normal text-sm" variant="h6">
                  {item?.Nama || "Tidak Tersedia"}
                </Typography>
                <Input
                  size="lg"
                  type="number"
                  value={nomorVAs[index] || ""}
                  label="Nomor VA Baru"
                  onChange={(e) => {
                    const updated = [...nomorVAs];
                    updated[index] = e.target.value;
                    setNomorVAs(updated);
                  }}
                  className="mt-2"
                />
              </div>
            ))}
          </form>
        </DialogBody>

        <DialogFooter>
          <Button
            onClick={async () => {
              await suntingVaBaru();
              tertutup(false);
            }}
            variant="gradient"
            color="black"
            disabled={sedangMemuatSuntingVaBaru || sedangMengunggah}
            className={`${
              sedangMemuatSuntingVaBaru || sedangMengunggah
                ? "opacity-50 cursor-not-allowed"
                : "opacity-100"
            }`}
          >
            {sedangMemuatSuntingVaBaru ? <Memuat /> : "Simpan Perubahan"}
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
};

export default ModalSuntingVaKadaluwarsa;
