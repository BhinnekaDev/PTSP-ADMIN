import React from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  IconButton,
  Input,
  Textarea,
  Button,
  DialogFooter,
} from "@material-tailwind/react";
import Memuat from "@/components/memuat";
import { XMarkIcon } from "@heroicons/react/24/outline";
// PENGAIT KAMI

const ModalSuntingFAQ = ({ terbuka, tertutup, pengaduanYangTerpilih }) => {
  const testbutton = false;

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
            <XMarkIcon className="h-6 w-6 " />
          </IconButton>
        </div>

        <DialogHeader className="text-black">Sunting FAQ</DialogHeader>

        <DialogBody
          divider
          className="flex flex-col justify-evenly gap-4 items-start p-6 bg-white rounded-b-lg"
        >
          <div className="w-full">
            <label className="block text-sm font-semibold text-black mb-1">
              Judul FAQ
            </label>
            <Input placeholder="Masukkan judul FAQ" className="text-black" />
          </div>
          <div className="w-full">
            <label className="block text-sm font-semibold text-black mb-1">
              Isi FAQ
            </label>
            <Textarea
              placeholder="Masukkan isi FAQ"
              rows={1}
              className="text-black"
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="gradient"
            color="black"
            className={`${
              testbutton ? "opacity-50 cursor-not-allowed" : "opacity-100"
            }`}
          >
            {testbutton ? <Memuat /> : "Sunting FAQ"}
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
};

export default ModalSuntingFAQ;
