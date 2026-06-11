import React from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  IconButton,
  Button,
  Typography,
} from "@material-tailwind/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

const ModalLihatFAQ = ({ terbuka, tertutup, data }) => {
  // Fungsi untuk memastikan answer adalah string
  const pastikanString = (nilai) => {
    if (!nilai) return "";
    if (typeof nilai === "string") return nilai;
    if (Array.isArray(nilai)) return nilai.join("\n");
    if (typeof nilai === "object") {
      try {
        return JSON.stringify(nilai);
      } catch {
        return "";
      }
    }
    return String(nilai);
  };

  // Fungsi untuk merender answer (support string, array, bullet point, numbered)
  const renderAnswer = (answer) => {
    if (!answer) {
      return <p className="text-gray-500 italic">Tidak ada jawaban</p>;
    }

    // Konversi ke string jika masih berupa array (data lama)
    let answerString = pastikanString(answer);

    if (!answerString) {
      return <p className="text-gray-500 italic">Tidak ada jawaban</p>;
    }

    // Cek apakah answer mengandung bullet point (•) atau numbered (1., 2., dll)
    const lines = answerString.split("\n");
    const hasBulletOrNumbered = lines.some(
      (line) => line.trim().startsWith("•") || line.trim().match(/^\d+\./),
    );

    // Jika memiliki format bullet atau numbered, tampilkan sebagai list
    if (lines.length > 1 && hasBulletOrNumbered) {
      return (
        <div className="flex flex-col gap-2">
          {lines.map((line, index) => {
            if (!line.trim()) return null;
            return (
              <div key={index} className="flex items-start gap-2">
                <span className="text-gray-700 whitespace-pre-wrap">
                  {line}
                </span>
              </div>
            );
          })}
        </div>
      );
    }

    // Jika answer adalah string dengan multiple line
    if (answerString.includes("\n")) {
      return (
        <div className="flex flex-col gap-1">
          {answerString.split("\n").map((line, index) => (
            <p key={index} className="text-gray-700">
              {line}
            </p>
          ))}
        </div>
      );
    }

    // Plain text single line
    return (
      <p className="text-gray-700 whitespace-pre-wrap text-justify">
        {answerString}
      </p>
    );
  };

  return (
    <Dialog
      open={terbuka}
      handler={() => tertutup(false)}
      animate={{
        mount: { scale: 1, y: 0 },
        unmount: { scale: 0.9, y: -100 },
      }}
      size="lg"
      className="bg-white"
    >
      <div className="relative">
        <div className="absolute top-3 right-3 z-10">
          <IconButton
            variant="text"
            color="red"
            onClick={() => tertutup(false)}
            className="text-red-500 hover:bg-transparent"
          >
            <XMarkIcon className="h-6 w-6" />
          </IconButton>
        </div>

        <DialogHeader className="text-black border-b border-blue-gray-50">
          <Typography variant="h4" color="blue-gray">
            Detail FAQ
          </Typography>
        </DialogHeader>

        <DialogBody className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Category */}
          <div className="mb-6">
            <Typography
              variant="small"
              className="text-blue-600 font-semibold mb-1"
            >
              Kategori
            </Typography>
            <div className="bg-blue-50 inline-block px-3 py-1 rounded-full">
              <span className="text-blue-700 text-sm font-medium">
                {data?.category || "Umum"}
              </span>
            </div>
          </div>

          {/* Question */}
          <div className="mb-6">
            <Typography
              variant="small"
              className="text-blue-600 font-semibold mb-2"
            >
              Pertanyaan
            </Typography>
            <div className="bg-gray-50 p-4 rounded-lg">
              <Typography
                variant="paragraph"
                className="text-gray-800 font-medium"
              >
                {data?.question || "Tidak ada pertanyaan"}
              </Typography>
            </div>
          </div>

          {/* Answer */}
          <div className="mb-4">
            <Typography
              variant="small"
              className="text-blue-600 font-semibold mb-2"
            >
              Jawaban
            </Typography>
            <div className="bg-gray-50 p-4 rounded-lg">
              {renderAnswer(data?.answer)}
            </div>
          </div>
        </DialogBody>

        <DialogFooter className="border-t border-blue-gray-50 pt-4">
          <Button
            variant="gradient"
            color="blue"
            onClick={() => tertutup(false)}
            className="ml-auto"
          >
            Tutup
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
};

export default ModalLihatFAQ;
