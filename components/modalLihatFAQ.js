import React from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  IconButton,
} from "@material-tailwind/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

const ModalLihatFAQ = ({ terbuka, tertutup, pengaduanYangTerpilih }) => {
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

        <DialogHeader className="text-black">Lihat FAQ</DialogHeader>

        <DialogBody
          divider
          className="flex flex-row justify-evenly items-start p-6 bg-white rounded-b-lg"
        >
          <div className="flex flex-col items-start mb-4 md:mb-0 w-[1000px] gap-2">
            <p className="text-md font-bold text-black">Judul FAQ</p>
            <p className="text-md font-bold text-black">Isi FAQ</p>
          </div>
          <div className="flex flex-col items-start mb-4 md:mb-0 pr-1 gap-2">
            <p className="text-md font-bold text-black">:</p>
            <p className="text-md font-bold text-black">:</p>
          </div>
          <div className="flex flex-col items-start mb-4 md:mb-0 gap-2">
            <p className="text-md">
              Anda dapat menghubungi PTSP BMKG Bengkulu melalui email, telepon,
              atau datang langsung ke kantor kami?
            </p>
            <p className="text-md text-justify">
              Datang langsung ke Pelayanan Terpadu Satu Pintu (PTSP) BMKG di
              Jalan Angkasa I no. 2 Kemayoran Jakarta Pusat. Gedung E, Kirim
              email ke : ptsp[at]bmkg.go.id , atau kirim fax ke 021-65867063
              dengan membawa :Surat Permohonan yang ditanda tangani (jika dari
              perusahaan, dibubuhkan stempel perusahaan)Surat tugas (jika dari
              perusahaan menugaskan org lain untuk mengurus permohonan ke
              BMKG)Fotokopi KTP pemohon. Petugas PTSP membuatkan formulir
              permohonan yang akan ditandatangani oleh pemohon. Melakukan
              pembayaran (khusus untuk permohonan analisa cuaca, pembayaran
              dilakukan di awal masuk berkas permohonan), dengan cara:Pembayaran
              tunai ke bendahara penerima yang bertugas di PTSP.Transfer ke rek.
              Bendahara Penerima BMKG (jika sudah melakukan transfer harus
              mengirimkan bukti transfernya ke PTSP) Jika berkas permohonan
              sudah lengkap, permohonan akan diproses dalam waktu kurang lebih
              14 hari kerja, khusus analisa cuaca, pengerjaannya kurang lebih 14
              hari kerja per lokasi per harinya. Jika hasil sudah ada, petugas
              PTSP akan segera menghubungi pemohon melalui telepon atau email,
              untuk mengambil hasil di kantor Pelayanan Terpadu Satu Pintu
              (PTSP). Pembayaran khusus untuk kalibrasi alat Meteorologi,
              Klimatologi, dan Geofisika : Membayar sesuai total tagihan
              kalibrasi alat yang akan diambil pemohon berdasarkan nomor order
              alat yang diperoleh dari lab.kalibrasi.BMKG Bayar langsung/tunai
              di PTSP Berkas lengkap sebagai dasar untuk pengambilan alat dan
              sertifikat di lab. kalibrasi.
            </p>
          </div>
        </DialogBody>
      </div>
    </Dialog>
  );
};

export default ModalLihatFAQ;
