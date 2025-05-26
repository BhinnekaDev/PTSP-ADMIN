import React from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  IconButton,
  Typography,
  Button,
  Select,
  Option,
  Input,
} from "@material-tailwind/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Memuat from "@/components/memuat";
import useSuntingKunjungan from "@/hooks/backend/useSuntingKunjungan";

const ModalSuntingKunjungan = ({
  terbuka,
  tertutup,
  kunjunganYangTerpilih,
}) => {
  const {
    statusKunjungan,
    suntingPengajuanKunjungan,
    setStatusKunjungan,
    sedangMemuatSuntingKunjungan,
    keteranganPenolakan,
    setKeteranganPenolakan,
  } = useSuntingKunjungan(kunjunganYangTerpilih);

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

        <DialogHeader className="text-black">Sunting Kunjungan</DialogHeader>

        <DialogBody divider>
          <form className="flex flex-col gap-4">
            <Typography className="-mb-2" variant="h6">
              Status
            </Typography>
            <Select
              label="Pilih Status Kunjungan"
              size="lg"
              value={statusKunjungan}
              onChange={(value) => setStatusKunjungan(value)}
            >
              <Option value="Sedang Ditinjau">Sedang Ditinjau</Option>
              <Option value="Diterima">Diterima</Option>
              <Option value="Ditolak">Ditolak</Option>
            </Select>

            {statusKunjungan === "Ditolak" && (
              <>
                <Typography className="-mb-2" variant="h6">
                  Keterangan Penolakan
                </Typography>
                <Input
                  type="text"
                  label="Masukkan alasan penolakan"
                  value={keteranganPenolakan}
                  onChange={(e) => setKeteranganPenolakan(e.target.value)}
                  maxLength={200}
                />
              </>
            )}
          </form>
        </DialogBody>

        <DialogFooter>
          <Button
            onClick={async () => {
              await suntingPengajuanKunjungan();
              tertutup(false);
            }}
            variant="gradient"
            color="black"
            disabled={sedangMemuatSuntingKunjungan}
            className={`${
              sedangMemuatSuntingKunjungan
                ? "opacity-50 cursor-not-allowed"
                : "opacity-100"
            }`}
          >
            {sedangMemuatSuntingKunjungan ? <Memuat /> : "Sunting Kunjungan"}
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
};

export default ModalSuntingKunjungan;
