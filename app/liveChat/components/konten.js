"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  PaperAirplaneIcon,
  FaceSmileIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { BsCheck2All } from "react-icons/bs";
import { AiOutlineMessage } from "react-icons/ai";
import { LuPaperclip } from "react-icons/lu";
import { MdDelete } from "react-icons/md";
import { IoIosClose } from "react-icons/io";
import EmojiPicker from "emoji-picker-react";
import Image from "next/image";
import { motion } from "framer-motion";
import useTampilkanSemuaPesanPengguna from "@/hooks/backend/useTampilkanSemuaPesanPengguna";
import ModalKonfirmasiHapusChat from "@/components/modalKonfirmasiHapusChat";
import Memuat from "@/components/memuat";

const LiveChat = () => {
  const gambarBawaan = require("@/public/profil.jpg");
  const [penggunaTerpilih, setPenggunaTerpilih] = useState(null);
  const [tampilkanPickerEmoji, setTampilkanPickerEmoji] = useState(false);
  const [tampilkanModalHapus, setTampilkanModalHapus] = useState(false);
  const [pesanTerpilih, setPesanTerpilih] = useState(null);
  const [tampilkanIconHapus, setTampilkanIconHapus] = useState(false);
  const [posisiIcon, setPosisiIcon] = useState({ x: 0, y: 0 });
  const [fileTerpilih, setFileTerpilih] = useState(null);
  const [isiPesan, setIsiPesan] = useState("");
  const [pesanTersingkat, setPesanTersingkat] = useState([]);
  const [pencarian, setPencarian] = useState("");

  const refPickerEmoji = useRef(null);
  const refInputFile = useRef(null);
  const refMenu = useRef(null);

  let adminId = null;
  if (typeof window !== "undefined") {
    adminId = localStorage.getItem("ID_Admin");
  }

  // Gunakan hook yang diperbarui
  const {
    sedangMemuat,
    semuaPengguna,
    daftarPercakapan,
    pesan,
    dapatkanDaftarPercakapan,
    dapatkanPesan,
    kirimPesan,
  } = useTampilkanSemuaPesanPengguna();

  // Setup real-time listeners
  useEffect(() => {
    const unsubscribeChatList = dapatkanDaftarPercakapan(adminId);
    return () => unsubscribeChatList && unsubscribeChatList();
  }, [adminId]);

  useEffect(() => {
    if (penggunaTerpilih) {
      const idRuangChat = [adminId, penggunaTerpilih.id].sort().join("_");
      const unsubscribeMessages = dapatkanPesan(idRuangChat);
      return () => unsubscribeMessages && unsubscribeMessages();
    }
  }, [penggunaTerpilih]);

  // Gabungkan data untuk tampilan
  const dataTampilan = semuaPengguna.map((pengguna) => {
    const percakapan = daftarPercakapan.find((chat) =>
      chat.peserta.includes(pengguna.id)
    );

    return {
      ...pengguna,
      pesanTerakhir: percakapan?.pesanTerakhir || "Belum ada pesan",
      lastActive: percakapan?.terakhirDiperbarui || null,
      sudahPernahChat: !!percakapan,
    };
  });

  // Filter berdasarkan pencarian
  const dataTersaring = dataTampilan.filter(
    (pengguna) =>
      pengguna.Nama_Lengkap?.toLowerCase().includes(pencarian.toLowerCase()) ||
      (pengguna.tipe === "perusahaan" &&
        pengguna.Nama_Perusahaan?.toLowerCase().includes(
          pencarian.toLowerCase()
        ))
  );

  // Fungsi kirim pesan
  const handleKirimPesan = async () => {
    if (!isiPesan.trim() && !fileTerpilih) return;

    try {
      await kirimPesan({
        adminId,
        penerimaId: penggunaTerpilih.id,
        isiPesan: isiPesan,
        tipePenerima: penggunaTerpilih.tipe,
      });

      // Reset form
      setIsiPesan("");
      setFileTerpilih(null);
      if (refInputFile.current) refInputFile.current.value = "";
    } catch (error) {}
  };

  // Toggle pesan singkat/panjang
  const togglePesanSingkat = (index) => {
    setPesanTersingkat((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  // Handle klik kanan pesan
  const handleKlikKananPesan = (event, percakapan) => {
    event.preventDefault();
    setPesanTerpilih(percakapan);
    setTampilkanIconHapus(true);
    setPosisiIcon({
      x: event.clientX,
      y: event.clientY,
    });
  };

  // Handle klik di luar komponen
  useEffect(() => {
    const handleKlikDiluar = (event) => {
      if (
        refPickerEmoji.current &&
        !refPickerEmoji.current.contains(event.target)
      ) {
        setTampilkanPickerEmoji(false);
      }
      if (refMenu.current && !refMenu.current.contains(event.target)) {
        setTampilkanIconHapus(false);
      }
    };

    document.addEventListener("mousedown", handleKlikDiluar);
    return () => document.removeEventListener("mousedown", handleKlikDiluar);
  }, []);

  return (
    <div className="flex h-screen border rounded-lg shadow-lg overflow-hidden">
      {/* Sidebar Daftar Chat */}
      <div className="w-1/3 border-r p-4 bg-white">
        <h2 className="text-lg font-bold">Pesan</h2>
        <div className="relative mt-2">
          <input
            type="text"
            placeholder="Cari percakapan"
            className="w-full p-2 border rounded-lg pl-10"
            value={pencarian}
            onChange={(e) => setPencarian(e.target.value)}
          />
          <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        </div>

        {/* Daftar Pengguna */}
        <div className="mt-4 space-y-2">
          {sedangMemuat ? (
            <Memuat />
          ) : dataTersaring.length > 0 ? (
            dataTersaring.map((pengguna) => (
              <div
                key={pengguna.id}
                className={`flex items-center gap-3 p-2 hover:bg-gray-100 rounded cursor-pointer ${
                  penggunaTerpilih?.id === pengguna.id ? "bg-gray-200" : ""
                }`}
                onClick={() => setPenggunaTerpilih(pengguna)}
                onContextMenu={(e) => handleKlikKananPesan(e, pengguna)}
              >
                <Image
                  src={pengguna.fotoProfil || gambarBawaan}
                  alt="Profil"
                  width={40}
                  height={40}
                  className="rounded-full"
                />

                <div className="flex-1">
                  <p className="font-bold text-sm">
                    {pengguna.tipe === "perorangan"
                      ? pengguna.Nama_Lengkap
                      : pengguna.Nama_Perusahaan}
                  </p>
                  <p className="text-xs text-gray-500 truncate w-24">
                    {pengguna.pesanTerakhir}
                  </p>
                </div>
                {pengguna.lastActive && (
                  <p className="text-xs text-gray-400">
                    {pengguna.lastActive.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">
              Tidak ada pengguna ditemukan
            </p>
          )}
        </div>

        {/* Menu Konteks Hapus */}
        {tampilkanIconHapus && (
          <div
            ref={refMenu}
            style={{
              position: "fixed",
              top: posisiIcon.y,
              left: posisiIcon.x,
              background: "white",
              padding: "10px",
              borderRadius: "8px",
              boxShadow: "0px 0px 10px rgba(0,0,0,0.2)",
              zIndex: 1000,
            }}
          >
            <button
              className="flex items-center gap-2 text-gray-500 hover:text-red-500"
              onClick={() => setTampilkanModalHapus(true)}
            >
              <MdDelete />
              Hapus Percakapan
            </button>
          </div>
        )}
      </div>

      {/* Area Chat Utama */}
      <div className="w-2/3 flex flex-col bg-white">
        {penggunaTerpilih ? (
          <>
            {/* Header Chat */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Image
                  src={penggunaTerpilih.fotoProfil || gambarBawaan}
                  alt="Profil"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div className="flex flex-col">
                  <span className="font-bold">
                    {penggunaTerpilih.tipe === "perorangan"
                      ? penggunaTerpilih.Nama_Lengkap
                      : penggunaTerpilih.Nama_Perusahaan}
                  </span>
                  <span className="text-green-500 text-xs">online</span>
                </div>
              </div>
            </div>

            {/* Isi Percakapan */}
            <div className="relative flex-1 p-4 bg-gray-100 overflow-auto">
              <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                <AiOutlineMessage className="text-black opacity-10 w-64 h-64" />
              </div>

              {/* Daftar Pesan */}
              {pesan.length > 0 ? (
                pesan.map((msg, index) => (
                  <div
                    key={msg.id}
                    className={`flex mb-2 ${
                      msg.idPengirim === adminId
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`${
                        msg.idPengirim === adminId
                          ? "bg-[#72C02C]"
                          : "bg-[#3182B7]"
                      } text-white p-3 rounded-lg max-w-md shadow`}
                    >
                      {msg.isi && (
                        <p>
                          {pesanTersingkat.includes(index) ||
                          msg.isi.length <= 50
                            ? msg.isi
                            : `${msg.isi.substring(0, 250)}...`}
                        </p>
                      )}

                      {msg.urlFile && (
                        <div className="mt-2">
                          <a
                            href={msg.urlFile}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white underline"
                          >
                            {msg.namaFile || "File"}
                          </a>
                        </div>
                      )}

                      {msg.isi && msg.isi.length > 50 && (
                        <motion.button
                          className="text-white text-sm underline"
                          onClick={() => togglePesanSingkat(index)}
                        >
                          {pesanTersingkat.includes(index)
                            ? "Tampilkan Lebih Sedikit"
                            : "Lihat Selengkapnya"}
                        </motion.button>
                      )}

                      <div className="text-xs text-right mt-1 flex items-center justify-end space-x-1">
                        <div className="flex items-center space-x-1 px-2 py-1 rounded-lg shadow bg-blue-100">
                          <span className="text-blue-600">
                            {msg.waktu?.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {msg.idPengirim === adminId && (
                            <BsCheck2All
                              className={`w-4 h-4 ${
                                msg.sudahDibaca
                                  ? "text-blue-900"
                                  : "text-gray-400"
                              }`}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">
                  {penggunaTerpilih.sudahPernahChat
                    ? "Belum ada pesan dalam percakapan ini"
                    : "Mulailah percakapan baru dengan pengguna ini"}
                </p>
              )}
            </div>

            {/* Input Pesan */}
            <div className="flex p-2 rounded-lg border-2 border-[#808080]/30 gap-2 w-full bg-white">
              <div className="flex gap-2">
                <button
                  className="text-gray-500 hover:text-gray-700 cursor-pointer"
                  onClick={() => refInputFile.current.click()}
                >
                  <LuPaperclip className="w-5 h-5" />
                </button>
                <input
                  type="file"
                  ref={refInputFile}
                  className="hidden"
                  onChange={(e) => setFileTerpilih(e.target.files[0])}
                />
                <button
                  className="text-gray-500 hover:text-gray-700 cursor-pointer"
                  onClick={() => setTampilkanPickerEmoji(!tampilkanPickerEmoji)}
                >
                  <FaceSmileIcon className="w-6 h-6" />
                </button>
                {tampilkanPickerEmoji && (
                  <div
                    ref={refPickerEmoji}
                    className="absolute bottom-12 left-1/3 bg-white shadow-lg border rounded-lg z-50"
                  >
                    <EmojiPicker
                      onEmojiClick={(emoji) =>
                        setIsiPesan((prev) => prev + emoji.emoji)
                      }
                    />
                  </div>
                )}
              </div>

              {fileTerpilih && (
                <div className="flex items-center bg-[#808080]/40 px-3 py-1 rounded-md text-sm w-60">
                  <span className="text-black">
                    {fileTerpilih.name.length > 15
                      ? fileTerpilih.name.slice(0, 15) + "..."
                      : fileTerpilih.name}
                  </span>
                  <IoIosClose
                    className="ml-2 w-5 h-5 text-red-500 cursor-pointer"
                    onClick={() => setFileTerpilih(null)}
                  />
                </div>
              )}

              <input
                type="text"
                className="w-full text-black focus:outline-none p-2 rounded-md"
                placeholder="Ketik pesan"
                value={isiPesan}
                onChange={(e) => setIsiPesan(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleKirimPesan()}
              />

              <button
                className="bg-black text-white p-2 rounded-lg disabled:opacity-50"
                onClick={handleKirimPesan}
                disabled={sedangMemuat || (!isiPesan.trim() && !fileTerpilih)}
              >
                {sedangMemuat ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <PaperAirplaneIcon className="w-6 h-6" />
                )}
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <AiOutlineMessage className="w-16 h-16 mx-auto text-gray-400" />
              <p className="mt-2 text-gray-600">
                Pilih percakapan untuk memulai
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modal Konfirmasi Hapus */}
      {tampilkanModalHapus && (
        <ModalKonfirmasiHapusChat
          terbuka={tampilkanModalHapus}
          tertutup={() => setTampilkanModalHapus(false)}
          percakapanTerpilih={pesanTerpilih}
        />
      )}
    </div>
  );
};

export default LiveChat;
