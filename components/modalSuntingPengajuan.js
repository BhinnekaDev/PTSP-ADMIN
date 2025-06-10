import React, { useState } from "react";
import {
  Dialog,
  Typography,
  DialogHeader,
  DialogBody,
  DialogFooter,
  IconButton,
  Button,
  Select,
  Input,
  Option,
} from "@material-tailwind/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { FaRegTrashAlt } from "react-icons/fa";
import useSuntingPengajuan from "@/hooks/backend/useSuntingPengajuan";
import Memuat from "@/components/memuat";

const ModalSuntingPengajuan = ({
  terbuka,
  tertutup,
  pengajuanYangTerpilih,
}) => {
  const {
    dataKeranjang,
    nomorVAs,
    setNomorVAs,
    keterangan,
    setKeterangan,
    suntingPengajuan,
    statusPengajuan,
    setStatusPengajuan,
    sedangMemuatSuntingPengajuan,
    tanggalMasuk,
    setTanggalMasuk,
    tanggalKadaluwarsa,
    setTanggalKadaluwarsa,
    file,
    setFile,
    jenisAjukan,
    fileURL,
  } = useSuntingPengajuan(pengajuanYangTerpilih);

  const tanganiPerubahanNomorVA = (indeks, nilai) => {
    const updatedNomorVAs = [...nomorVAs];
    updatedNomorVAs[indeks] = nilai;
    setNomorVAs(updatedNomorVAs);
  };

  const handleDelete = () => {
    setFile(null);
    document.getElementById("upload-file").value = "";
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

        <DialogHeader className="text-black">Sunting Pengajuan</DialogHeader>

        <DialogBody divider>
          <form className="flex flex-col gap-4">
            <Typography className="-mb-2" variant="h6">
              Status
            </Typography>
            <Select
              label="Pilih Status Pengajuan"
              size="lg"
              value={statusPengajuan}
              onChange={(value) => setStatusPengajuan(value)}
            >
              <Option value="Sedang Ditinjau">Sedang Ditinjau</Option>
              <Option value="Diterima">Diterima</Option>
              <Option value="Ditolak">Ditolak</Option>
            </Select>

            {statusPengajuan === "Ditolak" && (
              <div className="flex flex-col gap-4">
                <Typography className="-mb-2" variant="h6">
                  Keterangan
                </Typography>
                <Input
                  type="text"
                  label="Alasan Penolakan"
                  size="lg"
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                />
              </div>
            )}

            {statusPengajuan !== "Ditolak" &&
              dataKeranjang
                .filter((item) => item.hasOwnProperty("Nomor_VA"))
                .map((dataKeranjang, indeks) => (
                  <div key={indeks} className="mb-4">
                    <Typography variant="h6">
                      Virtual Akun - {dataKeranjang.Jenis_Produk} (
                      {dataKeranjang.Pemilik || "Tidak Tersedia"})
                    </Typography>
                    <Typography
                      className="mb-2 font-normal text-sm"
                      variant="h6"
                    >
                      {dataKeranjang.Nama || "Tidak Tersedia"}
                    </Typography>
                    <Input
                      type="number"
                      label="Masukan Virtual Akun"
                      size="lg"
                      value={nomorVAs[indeks] || ""}
                      onChange={(e) =>
                        tanganiPerubahanNomorVA(indeks, e.target.value)
                      }
                    />
                  </div>
                ))}

            {jenisAjukan === "Berbayar" && statusPengajuan !== "Ditolak" && (
              <>
                <Typography className="-mb-2" variant="h6">
                  Tanggal Masuk Virtual Akun
                </Typography>
                <Input
                  type="datetime-local"
                  size="lg"
                  value={tanggalMasuk}
                  onChange={(e) => setTanggalMasuk(e.target.value)}
                />

                <Typography className="-mb-2" variant="h6">
                  Tanggal Kadaluwarsa Virtual Akun
                </Typography>
                <Input
                  type="datetime-local"
                  size="lg"
                  value={tanggalKadaluwarsa}
                  onChange={(e) => setTanggalKadaluwarsa(e.target.value)}
                />

                <Typography className="-mb-2" variant="h6">
                  Unggah File
                </Typography>
                <div className="w-full border border-gray-400 rounded-md py-2 px-2 flex items-center justify-between relative">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="upload-file"
                      className="rounded-sm border border-blue-gray-200 px-3 py-1 bg-blue-gray-50 text-sm font-medium text-blue-gray-700 hover:bg-blue-gray-100 hover:text-blue-gray-900"
                    >
                      Pilih File
                    </label>
                    <Typography className="text-sm text-blue-gray-700">
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
                    id="upload-file"
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="absolute top-0 left-0 h-full w-full opacity-0 cursor-pointer"
                  />
                </div>
              </>
            )}
          </form>
        </DialogBody>

        <DialogFooter>
          <Button
            onClick={async () => {
              await suntingPengajuan();
              tertutup(false);
            }}
            variant="gradient"
            color="black"
            disabled={sedangMemuatSuntingPengajuan}
            className={`${
              sedangMemuatSuntingPengajuan
                ? "opacity-50 cursor-not-allowed"
                : "opacity-100"
            }`}
          >
            {sedangMemuatSuntingPengajuan ? <Memuat /> : "Sunting Pengajuan"}
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
};

export default ModalSuntingPengajuan;
