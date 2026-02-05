"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  List,
  ListItem,
  ListItemPrefix,
  ListItemSuffix,
  Chip,
  Accordion,
  AccordionHeader,
  AccordionBody,
} from "@material-tailwind/react";
import {
  PresentationChartBarIcon,
  UserCircleIcon,
  CircleStackIcon,
  InformationCircleIcon,
  UserGroupIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ChartBarSquareIcon,
  UserIcon,
  HomeIcon,
  BuildingOffice2Icon,
  Cog6ToothIcon,
  PowerIcon,
  ClockIcon,
  DocumentPlusIcon,
} from "@heroicons/react/24/solid";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { IoChatboxEllipses } from "react-icons/io5";
import { RiCustomerService2Fill } from "react-icons/ri";
import { HiOutlineLightBulb } from "react-icons/hi";
import { AiTwotoneAlert, AiOutlineQuestionCircle } from "react-icons/ai";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
// PENGAIT KAMI
import useTampilkanAdminSesuaiID from "@/hooks/backend/useTampilkanAdminSesuaiID";
import useKeluarAkun from "@/hooks/backend/useKeluarAkun";
import useTampilkanBanyakData from "@/hooks/backend/useTampilkanBanyakData";
// KOMPONEN KAMI
import Memuat from "@/components/memuat";
import { AiOutlineHistory } from "react-icons/ai";
import { FaAddressCard } from "react-icons/fa";
import { HiMiniUserGroup } from "react-icons/hi2";
import { BsClockHistory } from "react-icons/bs";

function Sidebar({ pengarah }) {
  const gambarBawaan = require("@/assets/images/profil.jpg");
  const logoMasuk = require("@/assets/images/logoMasuk.png");
  const [bukaDropdown, setBukaDropdown] = useState(0);
  const [lokasiSaatIni, setLokasiSaatIni] = useState("");
  const { adminData, memuatTampilkanAdminSesuaiID } =
    useTampilkanAdminSesuaiID();
  const { jumlahData, sedangMemuatBanyakData } = useTampilkanBanyakData();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLokasiSaatIni(window.location.pathname);
    }
  }, []);

  const { keluar } = useKeluarAkun();

  const totalData = Object.values(jumlahData).reduce(
    (total, jumlah) => total + jumlah,
    0,
  );

  return (
    <Card className="h-screen sm:h-full  lg:w-60 lg:p-1 xl:w-72 xl:py-4 xl:px-2 shadow-xl shadow-blue-gray-900/5">
      <div className="lg:mb-2 p-2 flex items-center gap-2">
        <Image
          src={logoMasuk}
          alt="logo"
          className="w-12 h-12 xl:w-16 xl:h-16 object-cover bg-gray-200 rounded-full p-1"
        />
        <Typography
          className="text-2xl xl:text-3xl font-bold"
          color="blue-gray"
        >
          PTSP BMKG
        </Typography>
      </div>
      <hr className="border border-gray-300 w-full lg:w-60 xl:w-72 self-center" />

      <List className="overflow-y-auto h-[70%] scrollbar-thin scrollbar-thumb-gray-400 lg:max-h-[calc(100vh-100px)] lg:py-2 xl:py-3">
        <ListItem
          onClick={() => pengarah.push("/beranda")}
          className={`p-2 xl:p-3 ${
            lokasiSaatIni === "/beranda" ? "bg-[#0F67B1] text-white" : ""
          }`}
        >
          <ListItemPrefix>
            <HomeIcon className="h-4 w-4 xl:h-5 xl:w-5" />
          </ListItemPrefix>
          Beranda
        </ListItem>

        <ListItem className="flex justify-between items-center cursor-default hover:bg-transparent hover:text-inherit pointer-events-none p-2 xl:p-3">
          Data
          {sedangMemuatBanyakData ? (
            <div className="rounded-full w-8 h-8 bg-[#DFE5E7] flex items-center justify-center">
              <Memuat />
            </div>
          ) : (
            <ListItemSuffix>
              <Chip
                value={totalData.toString()}
                size="sm"
                variant="ghost"
                color="blue-gray"
                className="rounded-full"
              />
            </ListItemSuffix>
          )}
        </ListItem>

        <Accordion
          open={
            bukaDropdown === 1 ||
            lokasiSaatIni === "/dataAdmin" ||
            lokasiSaatIni === "/dataPengguna" ||
            lokasiSaatIni === "/dataPerusahaan"
          }
          icon={
            <ChevronDownIcon
              strokeWidth={2.5}
              className={`mx-auto h-4 w-4 transition-transform ${
                bukaDropdown === 1 ||
                lokasiSaatIni === "/dataAdmin" ||
                lokasiSaatIni === "/dataPengguna" ||
                lokasiSaatIni === "/dataPerusahaan"
                  ? "rotate-180"
                  : ""
              }`}
            />
          }
        >
          <ListItem className="p-0" selected={bukaDropdown === 1}>
            <AccordionHeader
              onClick={() => setBukaDropdown(bukaDropdown === 1 ? 0 : 1)}
              className="p-2 xl:p-3 border-none"
            >
              <ListItemPrefix>
                <UserGroupIcon className="h-5 w-5" />
              </ListItemPrefix>
              <Typography color="blue-gray" className="mr-auto font-normal">
                Partisipan
              </Typography>
            </AccordionHeader>
          </ListItem>

          <AccordionBody className="py-1">
            <List className="p-0">
              <ListItem
                onClick={() => pengarah.push("/dataAdmin")}
                className={`px-2 xl:p-3 ${
                  lokasiSaatIni === "/dataAdmin"
                    ? "bg-[#0F67B1] text-white"
                    : ""
                }`}
              >
                <ListItemPrefix>
                  <UserCircleIcon className="h-5 w-5" />
                </ListItemPrefix>
                Admin
              </ListItem>
              <ListItem
                onClick={() => pengarah.push("/dataPengguna")}
                className={`px-2 xl:p-3 ${
                  lokasiSaatIni === "/dataPengguna"
                    ? "bg-[#0F67B1] text-white"
                    : ""
                }`}
              >
                <ListItemPrefix>
                  <UserIcon className="h-5 w-5" />
                </ListItemPrefix>
                Pengguna
              </ListItem>

              <ListItem
                onClick={() => pengarah.push("/dataPerusahaan")}
                className={`px-2 xl:p-3 ${
                  lokasiSaatIni === "/dataPerusahaan"
                    ? "bg-[#0F67B1] text-white"
                    : ""
                }`}
              >
                <ListItemPrefix>
                  <BuildingOffice2Icon className="h-5 w-5" />
                </ListItemPrefix>
                Perusahaan
              </ListItem>

              <hr className="border border-gray-400 w-64 self-center" />
            </List>
          </AccordionBody>
        </Accordion>

        <Accordion
          open={
            bukaDropdown === 2 ||
            lokasiSaatIni === "/dataInformasi" ||
            lokasiSaatIni === "/dataJasa"
          }
          icon={
            <ChevronDownIcon
              strokeWidth={2.5}
              className={`mx-auto h-4 w-4 transition-transform ${
                bukaDropdown === 2 ||
                lokasiSaatIni === "/dataInformasi" ||
                lokasiSaatIni === "/dataJasa"
                  ? "rotate-180"
                  : ""
              }`}
            />
          }
        >
          <ListItem className="p-0">
            <AccordionHeader
              onClick={() => setBukaDropdown(bukaDropdown === 2 ? 0 : 2)}
              className="border-b-0 p-2 xl:p-3"
            >
              <ListItemPrefix>
                <PresentationChartBarIcon className="h-5 w-5" />
              </ListItemPrefix>
              <Typography color="blue-gray" className="mr-auto font-normal">
                Produk
              </Typography>
            </AccordionHeader>
          </ListItem>

          <AccordionBody className="py-1">
            <List className="p-0">
              <ListItem
                onClick={() => pengarah.push("/dataInformasi")}
                className={`px-2 xl:p-3 ${
                  lokasiSaatIni === "/dataInformasi"
                    ? "bg-[#0F67B1] text-white"
                    : ""
                }`}
              >
                <ListItemPrefix>
                  <InformationCircleIcon className="h-5 w-5" />
                </ListItemPrefix>
                Informasi
              </ListItem>

              <ListItem
                onClick={() => pengarah.push("/dataJasa")}
                className={`px-2 xl:p-3 ${
                  lokasiSaatIni === "/dataJasa" ? "bg-[#0F67B1] text-white" : ""
                }`}
              >
                <ListItemPrefix>
                  <CircleStackIcon className="h-5 w-5" />
                </ListItemPrefix>
                Jasa
              </ListItem>

              <hr className="border border-gray-400 w-64 self-center" />
            </List>
          </AccordionBody>
        </Accordion>

        <Accordion
          open={
            bukaDropdown === 3 ||
            lokasiSaatIni === "/dataPengajuan" ||
            lokasiSaatIni === "/dataPembayaran" ||
            lokasiSaatIni === "/dataPembuatan" ||
            lokasiSaatIni === "/dataTransaksi" ||
            lokasiSaatIni === "/dataIKM"
          }
          icon={
            <ChevronDownIcon
              strokeWidth={2.5}
              className={`mx-auto h-4 w-4 transition-transform ${
                bukaDropdown === 3 ||
                lokasiSaatIni === "/dataPengajuan" ||
                lokasiSaatIni === "/dataPembuatan" ||
                lokasiSaatIni === "/dataPembuatan" ||
                lokasiSaatIni === "/dataTransaksi" ||
                lokasiSaatIni === "/dataIKM"
                  ? "rotate-180"
                  : ""
              }`}
            />
          }
        >
          <ListItem className="p-0" selected={bukaDropdown === 3}>
            <AccordionHeader
              onClick={() => setBukaDropdown(bukaDropdown === 3 ? 0 : 3)}
              className="p-2 xl:p-3 border-none"
            >
              <ListItemPrefix>
                <ClockIcon className="h-5 w-5" />
              </ListItemPrefix>
              <Typography color="blue-gray" className="mr-auto font-normal">
                Aktivitas
              </Typography>
            </AccordionHeader>
          </ListItem>

          <AccordionBody className="py-1">
            <List className="p-0">
              <ListItem
                onClick={() => pengarah.push("/dataIKM")}
                className={`px-2 xl:p-3 ${
                  lokasiSaatIni === "/dataIKM" ? "bg-[#0F67B1] text-white" : ""
                }`}
              >
                <ListItemPrefix>
                  <ChartBarSquareIcon className="h-5 w-5" />
                </ListItemPrefix>
                IKM
              </ListItem>

              <ListItem
                onClick={() => pengarah.push("/dataPengajuan")}
                className={`px-2 xl:p-3 ${
                  lokasiSaatIni === "/dataPengajuan"
                    ? "bg-[#0F67B1] text-white"
                    : ""
                }`}
              >
                <ListItemPrefix>
                  <DocumentTextIcon className="h-5 w-5" />
                </ListItemPrefix>
                Pengajuan
              </ListItem>

              <ListItem
                onClick={() => pengarah.push("/dataPembayaran")}
                className={`px-2 xl:p-3 ${
                  lokasiSaatIni === "/dataPembayaran"
                    ? "bg-[#0F67B1] text-white"
                    : ""
                }`}
              >
                <ListItemPrefix>
                  <CreditCardIcon className="h-5 w-5" />
                </ListItemPrefix>
                Pembayaran
              </ListItem>

              <ListItem
                onClick={() => pengarah.push("/dataPembuatan")}
                className={`px-2 xl:p-3 ${
                  lokasiSaatIni === "/dataPembuatan"
                    ? "bg-[#0F67B1] text-white"
                    : ""
                }`}
              >
                <ListItemPrefix>
                  <DocumentPlusIcon className="h-5 w-5" />
                </ListItemPrefix>
                Pembuatan
              </ListItem>

              <ListItem
                onClick={() => pengarah.push("/dataTransaksi")}
                className={`px-2 xl:p-3 ${
                  lokasiSaatIni === "/dataTransaksi"
                    ? "bg-[#0F67B1] text-white"
                    : ""
                }`}
              >
                <ListItemPrefix>
                  <AiOutlineHistory className="h-5 w-5" />
                </ListItemPrefix>
                Riwayat Transaksi
              </ListItem>

              <hr className="border border-gray-400 w-64 self-center" />
            </List>
          </AccordionBody>
        </Accordion>

        <Accordion
          open={
            bukaDropdown === 4 ||
            lokasiSaatIni === "/dataSaran" ||
            lokasiSaatIni === "/dataPengaduan" ||
            lokasiSaatIni === "/dataFAQ"
          }
          icon={
            <ChevronDownIcon
              strokeWidth={2.5}
              className={`mx-auto h-4 w-4 transition-transform ${
                bukaDropdown === 4 ||
                lokasiSaatIni === "/dataSaran" ||
                lokasiSaatIni === "/dataPengaduan" ||
                lokasiSaatIni === "/dataFAQ"
                  ? "rotate-180"
                  : ""
              }`}
            />
          }
        >
          <ListItem className="p-0" selected={bukaDropdown === 4}>
            <AccordionHeader
              onClick={() => setBukaDropdown(bukaDropdown === 4 ? 0 : 4)}
              className="p-2 xl:p-3 border-none"
            >
              <ListItemPrefix>
                <RiCustomerService2Fill className="w-5 h-5" />
              </ListItemPrefix>
              <Typography color="blue-gray" className="mr-auto font-normal">
                Layanan
              </Typography>
            </AccordionHeader>
          </ListItem>

          <AccordionBody className="py-1">
            <List className="p-0">
              <ListItem
                onClick={() => pengarah.push("/dataSaran")}
                className={`px-2 xl:p-3 ${
                  lokasiSaatIni === "/dataSaran"
                    ? "bg-[#0F67B1] text-white"
                    : ""
                }`}
              >
                <ListItemPrefix>
                  <HiOutlineLightBulb className="h-5 w-5" />
                </ListItemPrefix>
                Saran
              </ListItem>

              <ListItem
                onClick={() => pengarah.push("/dataPengaduan")}
                className={`px-2 xl:p-3 ${
                  lokasiSaatIni === "/dataPengaduan"
                    ? "bg-[#0F67B1] text-white"
                    : ""
                }`}
              >
                <ListItemPrefix>
                  <AiTwotoneAlert className="h-5 w-5" />
                </ListItemPrefix>
                Pengaduan
              </ListItem>

              <ListItem
                onClick={() => pengarah.push("/dataFAQ")}
                className={`px-2 xl:p-3 ${
                  lokasiSaatIni === "/dataFAQ" ? "bg-[#0F67B1] text-white" : ""
                }`}
              >
                <ListItemPrefix>
                  <AiOutlineQuestionCircle className="h-5 w-5" />
                </ListItemPrefix>
                FAQ
              </ListItem>

              <hr className="border border-gray-400 w-64 self-center" />
            </List>
          </AccordionBody>
        </Accordion>

        <Accordion
          open={
            bukaDropdown === 6 ||
            lokasiSaatIni === "/dataKunjungan" ||
            lokasiSaatIni === "/riwayatKunjungan"
          }
          icon={
            <ChevronDownIcon
              strokeWidth={2.5}
              className={`mx-auto h-4 w-4 transition-transform ${
                bukaDropdown === 6 ||
                lokasiSaatIni === "/dataKunjungan" ||
                lokasiSaatIni === "/riwayatKunjungan"
                  ? "rotate-180"
                  : ""
              }`}
            />
          }
        >
          <ListItem className="p-0" selected={bukaDropdown === 6}>
            <AccordionHeader
              onClick={() => setBukaDropdown(bukaDropdown === 6 ? 0 : 6)}
              className="p-2 xl:p-3 border-none"
            >
              <ListItemPrefix>
                <FaAddressCard className="w-5 h-5" />
              </ListItemPrefix>
              <Typography color="blue-gray" className="mr-auto font-normal">
                Kunjungan
              </Typography>
            </AccordionHeader>
          </ListItem>

          <AccordionBody className="py-1">
            <List className="p-0">
              <ListItem
                onClick={() => pengarah.push("/dataKunjungan")}
                className={`px-2 xl:p-3 ${
                  lokasiSaatIni === "/dataKunjungan"
                    ? "bg-[#0F67B1] text-white"
                    : ""
                }`}
              >
                <ListItemPrefix>
                  <HiMiniUserGroup className="h-5 w-5" />
                </ListItemPrefix>
                Pengajuan Kunjungan
              </ListItem>

              <ListItem
                onClick={() => pengarah.push("/riwayatKunjungan")}
                className={`lg:px-2 xl:p-3 ${
                  lokasiSaatIni === "/riwayatKunjungan"
                    ? "bg-[#0F67B1] text-white"
                    : ""
                }`}
              >
                <ListItemPrefix>
                  <BsClockHistory className="h-5 w-5" />
                </ListItemPrefix>
                Riwayat Kunjungan
              </ListItem>

              <hr className="border border-gray-400 w-64 self-center" />
            </List>
          </AccordionBody>
        </Accordion>

        <Accordion
          open={
            bukaDropdown === 5 ||
            lokasiSaatIni === "/profilSaya" ||
            lokasiSaatIni === "/Keluar"
          }
          icon={
            <ChevronDownIcon
              strokeWidth={2.5}
              className={`mx-auto h-4 w-4 transition-transform ${
                bukaDropdown === 5 ||
                lokasiSaatIni === "/profilSaya" ||
                lokasiSaatIni === "/Keluar"
                  ? "rotate-180"
                  : ""
              }`}
            />
          }
        >
          <ListItem className="p-0" selected={bukaDropdown === 5}>
            <AccordionHeader
              onClick={() => setBukaDropdown(bukaDropdown === 5 ? 0 : 5)}
              className="p-2 xl:p-3 border-none"
            >
              <ListItemPrefix>
                <Cog6ToothIcon className="h-5 w-5" />
              </ListItemPrefix>
              <Typography color="blue-gray" className="mr-auto font-normal">
                Pengaturan
              </Typography>
            </AccordionHeader>
          </ListItem>

          <AccordionBody className="py-1">
            <List className="p-0">
              <ListItem
                onClick={() => pengarah.push("/profilSaya")}
                className={`px-2 xl:p-3 ${
                  lokasiSaatIni === "/profilSaya"
                    ? "bg-[#0F67B1] text-white"
                    : ""
                }`}
              >
                <ListItemPrefix>
                  <UserIcon className="h-5 w-5" />
                </ListItemPrefix>
                Profil Saya
              </ListItem>

              <ListItem
                onClick={keluar}
                className={`px-2 xl:p-3 ${
                  lokasiSaatIni === "/Keluar" ? "bg-[#0F67B1] text-white" : ""
                }`}
              >
                <ListItemPrefix>
                  <PowerIcon className="h-5 w-5" />
                </ListItemPrefix>
                Keluar
              </ListItem>

              <hr className="border border-gray-400 w-64 self-center" />
            </List>
          </AccordionBody>
          <ListItem
            onClick={() => pengarah.push("/liveChat")}
            className={`p-2 xl:p-3 ${
              lokasiSaatIni === "/liveChat" ? "bg-[#0F67B1] text-white" : ""
            }`}
          >
            <ListItemPrefix>
              <IoChatboxEllipses className="h-5 w-5" />
            </ListItemPrefix>
            <div className="flex items-center justify-between w-full">
              <span>Pesan</span>
              <Chip
                value="56"
                size="sm"
                variant="ghost"
                color="blue-gray"
                className="rounded-full text-black bg-[#DFE5E7] px-2 py-0.5 text-xs font-bold"
              />
            </div>
          </ListItem>
        </Accordion>
      </List>

      <div className="relative lg:mt-4 mx-auto">
        {memuatTampilkanAdminSesuaiID ? (
          <Memuat />
        ) : (
          <>
            {adminData ? (
              <>
                <div className="bg-gray-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Image
                    src={adminData.Foto || gambarBawaan}
                    alt={adminData.Nama_Pengguna}
                    width={60}
                    height={60}
                    className="rounded-full"
                  />
                  <div className="absolute translate-x-[190%] translate-y-[170%]">
                    <div className="bg-green-500 w-3 h-3 rounded-full" />
                  </div>
                </div>
                <div className="text-center font-bold">
                  {adminData.Nama_Pengguna}
                </div>
                <div className="text-center">{adminData.Peran}</div>
              </>
            ) : (
              <div className="text-center">Admin tidak ditemukan</div>
            )}
          </>
        )}
      </div>
    </Card>
  );
}

export default Sidebar;
