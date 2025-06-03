import React from "react";
import {
  Dialog,
  Typography,
  DialogHeader,
  DialogBody,
  DialogFooter,
  IconButton,
  Button,
} from "@material-tailwind/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
// PENGAIT KAMI
import useTampilkanDataIKM from "@/hooks/backend/useTampilkanDataIKM";

const ModalLihatIKM = ({ terbuka, tertutup, ikmYangTerpilihId }) => {
  const { daftarIkm } = useTampilkanDataIKM();

  const ikmYangTerpilih = daftarIkm.find((ikm) => ikm.id === ikmYangTerpilihId);

  return (
    <Dialog
      open={terbuka}
      handler={tertutup}
      animate={{
        mount: { scale: 1, y: 0 },
        unmount: { scale: 0.9, y: -100 },
      }}
      size="xl"
      className="bg-white max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-4 rounded-lg shadow-2xl"
    >
      <div className="absolute top-3 right-3">
        <IconButton
          variant="text"
          color="red"
          onClick={() => tertutup(false)}
          className="text-red-500 hover:bg-red-100 transition duration-200 rounded-full"
        >
          <XMarkIcon className="h-6 w-6" />
        </IconButton>
      </div>

      <DialogHeader className="text-black font-bold text-xl border-b border-gray-200">
        IKM
      </DialogHeader>
      <DialogBody divider className="p-6 space-y-4 overflow-auto max-h-[80vh]">
        {ikmYangTerpilih ? (
          <div className="space-y-4">
            {ikmYangTerpilih?.Data_Keranjang?.map((dataKeranjang, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md p-4 mb-4 border border-gray-200"
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                  <Typography className="text-gray-700">
                    <span className="font-semibold">Jenis Produk:</span>{" "}
                    {dataKeranjang?.Nama}
                  </Typography>
                  <Typography className="text-gray-700">
                    <span className="font-semibold">Pemilik:</span>{" "}
                    {dataKeranjang?.Pemilik}
                  </Typography>
                </div>
              </div>
            ))}

            <div className="mt-4 p-4 bg-white shadow-md rounded-xl">
              <Typography className="text-gray-700 font-semibold mb-2">
                Opsi yang Dipilih:
              </Typography>
              <ul className="space-y-2 text-gray-700">
                {ikmYangTerpilih?.ikm.Opsi_Yang_Dipilih?.map((opsi, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="mt-1 w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>{opsi}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <Typography className="text-gray-600 font-semibold">
                Respon IKM:
              </Typography>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 mt-4 text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="border px-4 py-2">No</th>
                      <th className="border px-4 py-2">Pertanyaan</th>
                      <th className="border px-4 py-2">Kualitas Layanan</th>
                      <th className="border px-4 py-2">Harapan Konsumen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ikmYangTerpilih?.ikm.ikmResponses?.map(
                      (response, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border px-4 py-2">{index + 1}</td>
                          <td className="border px-4 py-2">
                            {response.Nama_Pertanyaan}
                          </td>
                          <td className="border px-4 py-2">
                            {response.KualitasLayanan === "Sangat Setuju"
                              ? "Sangat Setuju"
                              : response.KualitasLayanan === "Setuju"
                              ? "Setuju"
                              : response.KualitasLayanan === "Kurang Setuju"
                              ? "Kurang Setuju"
                              : response.KualitasLayanan === "Tidak Setuju"
                              ? "Tidak Setuju"
                              : "-"}
                          </td>
                          <td className="border px-4 py-2">
                            {response.HarapanKonsumen === "Sangat Penting"
                              ? "Sangat Penting"
                              : response.HarapanKonsumen === "Penting"
                              ? "Penting"
                              : response.HarapanKonsumen === "Kurang Penting"
                              ? "Kurang Penting"
                              : response.HarapanKonsumen === "Tidak Penting"
                              ? "Tidak Penting"
                              : "-"}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center">Data IKM tidak ditemukan.</p>
        )}
      </DialogBody>
      <DialogFooter>
        <Button
          variant="outlined"
          color="gray"
          onClick={() => tertutup(false)}
          className="hover:bg-gray-200 transition duration-200"
        >
          Tutup
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default ModalLihatIKM;
