import React, { useState } from "react";
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
  } = useSuntingNomorVABaru(VaYangTerplih);

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

            {dataKeranjang.map((item, index) => (
              <div key={index} className="">
                <Typography variant="h6">
                  Nomor VA Baru - {item?.Jenis_Produk || "Tidak Tersedia"} (
                  {item?.Pemilik || "Tidak Tersedia"})
                </Typography>
                <Typography className=" font-normal text-sm" variant="h6">
                  {item?.Nama || "Tidak Tersedia"}
                </Typography>
              </div>
            ))}

            {nomorVAs.map((va, i) => (
              <Input
                key={i}
                size="lg"
                type="number"
                value={va}
                label="Nomor VA Baru"
                onChange={(e) => {
                  const updated = [...nomorVAs];
                  updated[i] = e.target.value;
                  setNomorVAs(updated);
                }}
                className="mb-2"
              />
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
            disabled={sedangMemuatSuntingVaBaru}
            className={`${sedangMemuatSuntingVaBaru}
                ? "opacity-50 cursor-not-allowed"
                : "opacity-100"
            }`}
          >
            {sedangMemuatSuntingVaBaru ? <Memuat /> : "Kirim VA Baru"}
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
};

export default ModalSuntingVaKadaluwarsa;
