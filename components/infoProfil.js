import React from "react";
import { Typography } from "@material-tailwind/react";

function InfoProfil({ adminData }) {
  return (
    <div className="bg-gray-100 w-full h-full p-6 space-y-4 flex-col sm:grid sm:grid-cols-2 rounded-xl">
      <div className="flex sm:flex-col justify-between sm:justify-start">
        <Typography className="mb-1 font-[family-name:var(--font-geist-sans)] font-bold text-md sm:text-lg">
          Nama Depan:
        </Typography>
        <Typography className="mb-1 font-[family-name:var(--font-geist-sans)] font-bold text-md sm:text-lg">
          {adminData?.Nama_Depan || "Tidak Tersedia"}
        </Typography>
      </div>
      <div className="flex sm:flex-col justify-between sm:justify-start">
        <Typography className="mb-1 font-[family-name:var(--font-geist-sans)] font-bold text-md sm:text-lg">
          Nama Belakang:
        </Typography>
        <Typography className="mb-1 font-[family-name:var(--font-geist-sans)] font-bold text-md sm:text-lg">
          {adminData?.Nama_Belakang || "Tidak Tersedia"}
        </Typography>
      </div>
      <div className="flex sm:flex-col justify-between sm:justify-start">
        <Typography className="mb-1 font-[family-name:var(--font-geist-sans)] font-bold text-md sm:text-lg">
          Nama Pengguna:
        </Typography>
        <Typography className="mb-1 font-[family-name:var(--font-geist-sans)] font-bold text-md sm:text-lg">
          {adminData?.Nama_Pengguna || "Tidak Tersedia"}
        </Typography>
      </div>
      <div className="flex sm:flex-col justify-between sm:justify-start">
        <Typography className="mb-1 font-[family-name:var(--font-geist-sans)] font-bold text-md sm:text-lg">
          Jenis Kelamin:
        </Typography>
        <Typography className="mb-1 font-[family-name:var(--font-geist-sans)] font-bold text-md sm:text-lg">
          {adminData?.Jenis_Kelamin || "Tidak Tersedia"}
        </Typography>
      </div>
      <div className="flex sm:flex-col justify-between sm:justify-start">
        <Typography className="mb-1 font-[family-name:var(--font-geist-sans)] font-bold text-md sm:text-lg">
          Email:
        </Typography>
        <Typography className="mb-1 font-[family-name:var(--font-geist-sans)] font-bold text-md sm:text-lg">
          {adminData?.Email || "Tidak Tersedia"}
        </Typography>
      </div>
      <div className="flex sm:flex-col justify-between sm:justify-start">
        <Typography className="mb-1 font-[family-name:var(--font-geist-sans)] font-bold text-md sm:text-lg">
          Peran:
        </Typography>
        <Typography className="mb-1 font-[family-name:var(--font-geist-sans)] font-bold text-md sm:text-lg">
          {adminData?.Peran || "Tidak Tersedia"}
        </Typography>
      </div>
    </div>
  );
}

export default InfoProfil;
