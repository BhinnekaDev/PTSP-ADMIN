"use client";
import Image from "next/image";
import { Button, Card, Typography, Input } from "@material-tailwind/react";
import {
  AtSymbolIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowLeftCircleIcon,
} from "@heroicons/react/24/solid";
import { motion, useAnimation } from "framer-motion";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState, useEffect } from "react";
// KOMPONEN KAMI
import Memuat from "@/components/memuat";
// PENGAIT KAMI
import useMasukDenganEmailKataSandi from "@/hooks/backend/useMasukDenganEmailKataSandi";
import useLupaKataSandiAdmin from "@/hooks/backend/useLupaKataSandiAdmin";

export default function Masuk() {
  const logoMasuk = require("@/assets/images/logoMasuk.png");
  const partikel1 = require("@/assets/images/bumi.png");
  const partikel2 = require("@/assets/images/bintang.png");
  const partikel3 = require("@/assets/images/awan1.png");
  const partikel4 = require("@/assets/images/awan2.png");
  const [lihatKataSandi, setLihatKataSandi] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { masukDenganEmail, sedangMemuat } = useMasukDenganEmailKataSandi();
  const [tampilkanCardLupaKataSandi, setTampilkanCardLupaKataSandi] =
    useState(false);
  const { kirimEmailReset, sedangMemuat: memuatReset } =
    useLupaKataSandiAdmin();
  const [passwordBaru, setPasswordBaru] = useState("");
  const [konfirmasiPassword, setKonfirmasiPassword] = useState("");

  const handleReset = () => {
    if (passwordBaru !== konfirmasiPassword) {
      alert("Kata sandi tidak cocok!");
      return;
    }
    resetKataSandi(passwordBaru);
  };

  const handleLogin = () => {
    masukDenganEmail(email, password);
  };

  const kirimTautanReset = async () => {
    await kirimEmailReset(email);
  };

  const munculBulan = {
    hidden: { y: -10, opacity: 0 },
    visible: {
      y: -80,
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };
  const munculBintang = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.9, delay: 1.3 } },
  };
  const munculAwan1 = {
    hidden: { x: -44, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.7, delay: 0.9 } },
  };
  const munculAwan2 = {
    hidden: { x: 44, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.7, delay: 0.7 } },
  };

  const ulangiBawahAtas = {
    y: [-80, -70, -80],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut",
    },
  };
  const kontrol = useAnimation();

  useEffect(() => {
    let isMounted = true;
    const animate = async () => {
      if (isMounted) {
        await kontrol.start("visible");
        requestAnimationFrame(() => {
          if (isMounted) kontrol.start(ulangiBawahAtas);
        });
      }
    };
    animate();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="bg-[#eff0f3] h-screen items-center md:h-screen w-full md:p-24 xl:p-28 flex flex-col lg:flex-row justify-center overflow-hidden">
      <ToastContainer />
      <Card className="absolute md:hidden lg:block lg:relative top-0 left-0 w-full h-full lg:max-h-[550px] bg-transparent lg:bg-[#0F67B1] rounded-br-none rounded-tr-none shadow-none lg:shadow-lg z-0">
        <div className="h-screen relative overflow-hidden">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={munculBintang}
            className="absolute top-[720px] right-8 lg:top-36 xl:top-48 xl:right-[370px]"
          >
            <Image
              src={partikel2}
              alt="Masuk"
              className="w-8 h-8 object-cover rounded-full"
            />
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={munculBintang}
            className="absolute top-[740px] right-40 lg:top-40 xl:top-[230px] lg:right-60 xl:right-44"
          >
            <Image
              src={partikel2}
              alt="Masuk"
              className="w-8 h-8 object-cover rounded-full"
            />
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={munculBintang}
            className="absolute top-[700px] left-2 lg:top-[320px] xl:top-[345px] lg:left-[90px] xl:left-[200px]"
          >
            <Image
              src={partikel2}
              alt="Masuk"
              className="w-8 h-8 object-cover rounded-full"
            />
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={munculBintang}
            className="absolute hidden sm:flex lg:top-[390px] xl:top-[450px] lg:left-[310px] xl:left-64"
          >
            <Image
              src={partikel2}
              alt="Masuk"
              className="w-8 h-8 object-cover rounded-full"
            />
          </motion.div>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={munculBintang}
            className="absolute hidden sm:flex lg:top-[370px] xl:top-[380px] lg:right-[191px] xl:right-[200px]"
          >
            <Image
              src={partikel2}
              alt="Masuk"
              className="w-8 h-8 object-cover rounded-full"
            />
          </motion.div>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={munculAwan1}
            className="w-80 h-80 sm:w-48 sm:h-24 absolute top-[710px] left-36 lg:top-28 xl:top-36 lg:left-52 xl:left-72"
          >
            <Image
              src={partikel3}
              alt="Masuk"
              className=" object-cover rounded-full"
            />
          </motion.div>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={munculAwan2}
            className="w-full h-full sm:w-[400px] sm:h-24 absolute top-[760px] right-32 lg:top-[360px] xl:top-[370px] lg:right-8 xl:right-44"
          >
            <Image src={partikel4} alt="Masuk" className="object-cover" />
          </motion.div>
          <div className="sm:flex sm:justify-center sm:items-center sm:mt-52 xl:mt-56 -z-50 relative">
            <motion.div
              initial="hidden"
              animate={kontrol}
              variants={munculBulan}
              className="absolute top-[700px] sm:static sm:flex sm:justify-center sm:items-center w-72"
            >
              <Image
                src={partikel1}
                alt="Masuk"
                className="w-52 h-52 sm:w-full sm:h-full"
              />
            </motion.div>
          </div>
        </div>
      </Card>
      <Card
        className={`w-[350px] sm:w-full sm:h-[550px] p-0 border border-gray-200 sm:border-none lg:p-0 bg-white rounded-lg lg:rounded-bl-none lg:rounded-tl-none shadow-lg ${
          tampilkanCardLupaKataSandi ? "hidden" : ""
        }`}
      >
        <div className="bg-[#0F67B1] px-8 pt-8 pb-10 rounded-bl-[300px] rounded-br-[300px] rounded-t-lg sm:bg-transparent sm:p-0 sm:rounded-none">
          <div className="flex justify-center items-center sm:mt-20">
            <Image
              src={logoMasuk}
              alt="Masuk"
              className="w-20 h-20 sm:w-28 sm:h-28 object-cover bg-gray-200 rounded-full p-2"
            />
          </div>
          <div className="mt-2">
            <Typography className="text-center text-white sm:text-black font-mono text-2xl mb-2 sm:mb-0 sm:text-[40px]">
              Masuk
            </Typography>
            <Typography className="text-center font-body text-sm text-white sm:text-black">
              Masukan email dan kata sandi untuk melanjutkan akses.
            </Typography>
          </div>
        </div>
        <div className="px-4 py-2 mt-2 space-y-4 flex flex-col items-center sm:p-2">
          <div className="w-full md:w-[470px] lg:w-[350px] xl:w-[470px] self-center relative">
            <Input
              className="hover:border-2 hover:border-[#0F67B1] focus:border-2 focus:border-[#0F67B1]"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <AtSymbolIcon className="h-6 w-6 absolute top-2 right-4 text-[#0F67B1]" />
          </div>
          <div className="w-full md:w-[470px] lg:w-[350px] xl:w-[470px] self-center relative">
            <Input
              className="hover:border-2 hover:border-[#0F67B1] focus:border-2 focus:border-[#0F67B1]"
              label="Kata Sandi"
              type={lihatKataSandi ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {lihatKataSandi ? (
              <EyeSlashIcon
                className="h-6 w-6 absolute top-2 right-4 text-[#0F67B1] cursor-pointer"
                onClick={() => setLihatKataSandi(false)}
              />
            ) : (
              <EyeIcon
                className="h-6 w-6 absolute top-2 right-4 text-[#0F67B1] cursor-pointer"
                onClick={() => setLihatKataSandi(true)}
              />
            )}
          </div>
        </div>
        <div className="px-4 pb-4 flex flex-col items-center sm:p-0">
          <div className="w-full md:w-[470px] lg:w-[350px] xl:w-[470px] self-center text-end sm:mr-3 sm:mt-2 font-body">
            <Typography
              onClick={() => setTampilkanCardLupaKataSandi(true)}
              className="text-[#0F67B1] hover:cursor-pointer hover:underline transition-all duration-200"
            >
              Lupa Sandi?
            </Typography>
          </div>
          <Button
            className="w-full rounded-full p-1 mt-2 md:w-[470px] lg:w-[300px] xl:w-[470px] self-center text-center text-md font-body bg-[#0F67B1] md:rounded-full lg:rounded-lg md:p-2 xl:p-3 sm:mt-4 hover:scale-95 hover:bg-[#0F67B1] transition-all duration-200"
            onClick={handleLogin}
            disabled={sedangMemuat}
          >
            {sedangMemuat ? <Memuat /> : "Masuk"}{" "}
          </Button>
        </div>
      </Card>
      <Card
        className={`w-[350px] sm:w-full sm:h-[550px] flex justify-center items-center h-auto bg-white shadow-lg px-4 md:px-12 lg:px-0 lg:rounded-bl-none lg:rounded-tl-none  ${
          tampilkanCardLupaKataSandi ? "" : "hidden"
        }`}
      >
        <div className="flex justify-center items-center mt-8 lg:mt-20">
          <Image
            src={logoMasuk}
            alt="Masuk"
            className="w-20 h-20 sm:w-28 sm:h-28 object-cover bg-gray-200 rounded-full p-2"
          />
        </div>
        <div className="mt-2 lg:space-y-3">
          <Typography className="text-center font-mono text-xl lg:text-[30px] xl:text-[40px]">
            Lupa Kata Sandi
          </Typography>
          <Typography className="text-center font-body text-sm lg:text-md">
            Masukkan email Anda untuk menerima tautan reset kata sandi.
          </Typography>
        </div>
        <div className="w-full lg:w-[350px] xl:w-[470px] self-center mt-8 mb-4 relative">
          <Input
            className="hover:border-2 hover:border-[#0F67B1] focus:border-2 focus:border-[#0F67B1]"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <AtSymbolIcon className="h-6 w-6 absolute top-2 right-4 text-[#0F67B1]" />
        </div>

        <Button
          onClick={kirimTautanReset}
          disabled={memuatReset}
          className="w-full  lg:w-[350px] xl:w-[470px] self-center text-center mt-4 font-body bg-[#0F67B1] rounded-full lg:rounded-lg p-2 lg:p-3 hover:scale-95 transition-all"
        >
          {memuatReset ? <Memuat /> : "Kirim Tautan Reset"}
        </Button>

        <div className="flex justify-center items-center mt-4 lg:mt-14">
          <ArrowLeftCircleIcon
            className="w-10 h-10 lg:h-12 lg:w-12 text-[#0F67B1] cursor-pointer hover:text-blue-300 hover:scale-110 transition duration-200"
            onClick={() => setTampilkanCardLupaKataSandi(false)}
          />
        </div>
      </Card>
      <Card className="w-full bg-white rounded-lg shadow-lg hidden">
        <div className="flex justify-center items-center mt-20">
          <Image
            src={logoMasuk}
            alt="Reset Kata Sandi"
            className="w-28 h-28 object-cover bg-gray-200 rounded-full p-2"
          />
        </div>
        <div className="mt-2">
          <Typography className="text-center font-mono text-[40px]">
            Atur Ulang Kata Sandi
          </Typography>
          <Typography className="text-center font-body text-md">
            Masukkan kata sandi baru Anda.
          </Typography>
        </div>
        <div className="w-[470px] self-center mt-8 relative">
          <Input
            className="hover:border-2 hover:border-[#0F67B1] focus:border-2 focus:border-[#0F67B1]"
            label="Kata Sandi Baru"
            type={lihatKataSandi ? "text" : "password"}
            value={passwordBaru}
            onChange={(e) => setPasswordBaru(e.target.value)}
          />
          {lihatKataSandi ? (
            <EyeSlashIcon
              className="h-6 w-6 absolute top-2 right-4 text-[#0F67B1] cursor-pointer"
              onClick={() => setLihatKataSandi(false)}
            />
          ) : (
            <EyeIcon
              className="h-6 w-6 absolute top-2 right-4 text-[#0F67B1] cursor-pointer"
              onClick={() => setLihatKataSandi(true)}
            />
          )}
        </div>
        <div className="w-[470px] self-center mt-8 relative">
          <Input
            className="hover:border-2 hover:border-[#0F67B1] focus:border-2 focus:border-[#0F67B1]"
            label="Konfirmasi Kata Sandi"
            type={lihatKataSandi ? "text" : "password"}
            value={konfirmasiPassword}
            onChange={(e) => setKonfirmasiPassword(e.target.value)}
          />
          {lihatKataSandi ? (
            <EyeSlashIcon
              className="h-6 w-6 absolute top-2 right-4 text-[#0F67B1] cursor-pointer"
              onClick={() => setLihatKataSandi(false)}
            />
          ) : (
            <EyeIcon
              className="h-6 w-6 absolute top-2 right-4 text-[#0F67B1] cursor-pointer"
              onClick={() => setLihatKataSandi(true)}
            />
          )}
        </div>
        <Button
          onClick={handleReset}
          disabled={sedangMemuat}
          className="w-[470px] self-center text-center mt-4 font-body bg-[#0F67B1] rounded-lg p-3 hover:scale-95 transition-all"
        >
          {sedangMemuat ? <Memuat /> : "Atur Ulang Kata Sandi"}
        </Button>
        <div className="flex justify-center items-center mt-14">
          <ArrowLeftCircleIcon
            className="h-12 w-12 text-[#0F67B1] cursor-pointer hover:text-blue-300 hover:scale-110 transition duration-200"
            onClick={() => window.history.back()}
          />
        </div>
      </Card>
    </div>
  );
}
