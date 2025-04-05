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

//KOMPONEN KAMI
import ModalKonfirmasiHapusChat from "@/components/modalKonfirmasiHapusChat";

const LiveChat = () => {
  const [selectedUser, setSelectedUser] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [tampilkanModalHapus, setTampilkanModalHapus] = useState(false);
  const [pesanTerpilih, setPesanTerpilih] = useState(null);
  const [showDeleteIcon, setShowDeleteIcon] = useState(false);
  const [iconPosition, setIconPosition] = useState({ x: 0, y: 0 });
  const emojiPickerRef = useRef(null);
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");
  const [selengkapnya2, setSelengkapnya2] = useState([]);

  const toggleSelengkapnya2 = (index) => {
    console.log("Diklik index:", index); // Debug klik
    setSelengkapnya2((prev) => {
      console.log("Sebelum update:", prev);
      const updated = prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index];
      console.log("Setelah update:", updated);
      return updated;
    });
  };

  const messages = [
    {
      sender: "Eyca Putri Edwiyanti",
      text: "Lorem ipsum dolor sit amet.",
      time: "19:11",
      type: "received",
    },
    {
      sender: "Me",
      text: "Lorem ipsum dolor sit amet, consectetur Lorem ipsum dolor sit amet, Lorem ipsum dolor sit amet, consectetur Lorem ipsum dolor sit ametLorem ipsum dolor sit amet, consectetur Lorem ipsum dolor sit amet, Lorem ipsum dolor sit amet, consectetur Lorem ipsum dolor sit amet, consectetur Lorem ipsum dolor sit amet, consecteturLorem ipsum dolor sit amet, consecteturLorem ipsum dolor sit amet, consectetur.",
      time: "19:11",
      type: "sent",
    },
    {
      sender: "Eyca Putri Edwiyanti",
      text: "Hey, ada info terbaru?",
      time: "14:20",
      type: "received",
    },
    {
      sender: "Me",
      text: "Cuaca hari ini cerah dan berawan.",
      time: "19:11",
      type: "sent",
    },
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSendMessage = () => {
    if (message.trim() || selectedFile) {
      console.log("Mengirim pesan:", message);
      if (selectedFile) {
        console.log("Mengirim file:", selectedFile);
      }
      setMessage("");
      setSelectedFile(null);
      fileInputRef.current.value = "";
    }
  };

  const handleBukaEmoji = (emoji) => {
    setMessage((prev) => prev + emoji.emoji);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target) &&
        event.target.getAttribute("data-ignore-click") !== "true"
      ) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const klikKananPesan = (event, user) => {
    event.preventDefault();
    setPesanTerpilih(user);
    setShowDeleteIcon(true);
    setIconPosition({
      x: window.innerWidth / 2 - 250,
      y: window.innerHeight / 2 - 300,
    });
  };

  const hapusPesan = () => {
    setTampilkanModalHapus(true);
    setShowDeleteIcon(false);
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        console.log("Klik di luar menu, menutup...");
        setShowDeleteIcon(false);
      }
    };

    if (showDeleteIcon) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDeleteIcon]);

  return (
    <div className="flex h-screen border rounded-lg shadow-lg overflow-hidden">
      {/* Sidebar */}
      <div className="w-1/3 border-r p-4 bg-white">
        <h2 className="text-lg font-bold">Pesan</h2>
        <div className="relative mt-2">
          <input
            type="text"
            placeholder="Cari"
            className="w-full p-2 border rounded-lg pl-10"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        </div>
        <div className="mt-4">
          {/* Manual list user chat */}
          <div
            className={`flex items-center gap-3 p-2 hover:bg-gray-100 rounded cursor-pointer ${
              selectedUser === "Eyca Putri Edwiyanti" ? "bg-gray-200" : ""
            }`}
            onClick={() => setSelectedUser("Eyca Putri Edwiyanti")}
            onContextMenu={(event) =>
              klikKananPesan(event, "Eyca Putri Edwiyanti")
            }
          >
            {showDeleteIcon && (
              <div
                ref={menuRef}
                style={{
                  position: "absolute",
                  top: iconPosition.y,
                  left: iconPosition.x,
                  background: "white",
                  padding: "10px",
                  borderRadius: "8px",
                  boxShadow: "0px 0px 10px rgba(0,0,0,0.2)",
                  zIndex: 1000,
                }}
              >
                <button
                  className="flex items-center gap-2 text-gray-500 hover:text-red-500"
                  onClick={hapusPesan}
                >
                  <MdDelete />
                  Delete Pesan
                </button>
              </div>
            )}
            <Image
              src="/profil.jpg"
              alt="Profil"
              width={40}
              height={40}
              className="rounded-full"
            />

            <div className="flex-1">
              <p className="font-bold text-sm">Eyca Putri Edwiyanti</p>
              <p className="text-xs text-gray-500 truncate w-32">
                Lorem ipsum dolor sit amet...
              </p>
            </div>
            <p className="text-xs text-gray-400">Jan 23</p>
          </div>

          <div
            className={`flex items-center gap-3 p-2 hover:bg-gray-100 rounded cursor-pointer ${
              selectedUser === "Hengki" ? "bg-gray-200" : ""
            }`}
            onClick={() => setSelectedUser("Hengki")}
            onContextMenu={(event) => klikKananPesan(event, "Hengki")}
          >
            <Image
              src="/profil.jpg"
              alt="Profil"
              width={40}
              height={40}
              className="rounded-full"
            />

            <div className="flex-1">
              <p className="font-bold text-sm">Hengki</p>
              <p className="text-xs text-gray-500 truncate w-32">
                Hey, ada info terbaru?
              </p>
            </div>
            <p className="text-xs text-gray-400">Jan 23</p>
          </div>
          <div
            className={`flex items-center gap-3 p-2 hover:bg-gray-100 rounded cursor-pointer ${
              selectedUser === "Ahsan Ghofari" ? "bg-gray-200" : ""
            }`}
            onClick={() => setSelectedUser("Ahsan Ghofari")}
            onContextMenu={(event) => klikKananPesan(event, "Ahsan Ghofari")}
          >
            <Image
              src="/profil.jpg"
              alt="Profil"
              width={40}
              height={40}
              className="rounded-full"
            />

            <div className="flex-1">
              <p className="font-bold text-sm">Ahsan Ghofari</p>
              <p className="text-xs text-gray-500 truncate w-32">
                Hey, ada info terbaru?
              </p>
            </div>
            <p className="text-xs text-gray-400">Jan 23</p>
          </div>
          <div
            className={`flex items-center gap-3 p-2 hover:bg-gray-100 rounded cursor-pointer ${
              selectedUser === "Sandoro" ? "bg-gray-200" : ""
            }`}
            onClick={() => setSelectedUser("Sandoro")}
            onContextMenu={(event) => klikKananPesan(event, "Sandoro")}
          >
            <Image
              src="/profil.jpg"
              alt="Profil"
              width={40}
              height={40}
              className="rounded-full"
            />

            <div className="flex-1">
              <p className="font-bold text-sm">Sandoro</p>
              <p className="text-xs text-gray-500 truncate w-32">
                Hey, ada info terbaru?
              </p>
            </div>
            <p className="text-xs text-gray-400">Jan 23</p>
          </div>
          <div
            className={`flex items-center gap-3 p-2 hover:bg-gray-100 rounded cursor-pointer ${
              selectedUser === "Fitri Nur" ? "bg-gray-200" : ""
            }`}
            onClick={() => setSelectedUser("Fitri Nur")}
            onContextMenu={(event) => klikKananPesan(event, "Fitri Nur")}
          >
            <Image
              src="/profil.jpg"
              alt="Profil"
              width={40}
              height={40}
              className="rounded-full"
            />

            <div className="flex-1">
              <p className="font-bold text-sm">Fitri Nur</p>
              <p className="text-xs text-gray-500 truncate w-32">
                Hey, ada info terbaru?
              </p>
            </div>
            <p className="text-xs text-gray-400">Jan 23</p>
          </div>
        </div>
      </div>
      <div className="w-2/3 flex flex-col bg-white">
        <div className="p-4 border-b flex items-center">
          <div className="flex items-center gap-3">
            <Image
              src="/profil.jpg"
              alt="Profil"
              width={40}
              height={40}
              className="rounded-full"
            />

            {/* Nama & Status Online dalam 1 Kolom */}
            <div className="flex flex-col">
              <span className="font-bold">{selectedUser}</span>
              <span className="text-green-500 text-xs">online</span>
            </div>
          </div>
        </div>

        <div className="relative flex-1 p-4 bg-gray-100 overflow-auto">
          <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
            <AiOutlineMessage className="text-black opacity-10 w-64 h-64" />
          </div>
          <div className="flex justify-center my-4">
            <span className="bg-gray-300 text-gray-800 px-4 py-1 rounded-full text-xs font-semibold shadow">
              Kemarin
            </span>
          </div>

          {messages.map((msg, index) => (
            <div
              key={msg.id || index}
              className={`flex mb-2 ${
                msg.type === "sent" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`${
                  msg.type === "sent" ? "bg-[#72C02C]" : "bg-[#3182B7]"
                } text-white p-3 rounded-lg max-w-md shadow`}
              >
                <p>
                  {selengkapnya2.includes(index) || msg.text.length <= 50
                    ? msg.text
                    : `${msg.text.substring(0, 250)}...`}
                </p>

                {msg.text.length > 50 && (
                  <motion.button
                    initial={{ opacity: 0.5, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0.5, y: 5 }}
                    transition={{ duration: 0.2 }}
                    className="text-white text-sm underline"
                    onClick={() => toggleSelengkapnya2(index)}
                  >
                    {selengkapnya2.includes(index)
                      ? "Tampilkan Lebih Sedikit"
                      : "Lihat Selengkapnya"}
                  </motion.button>
                )}

                <div className="text-xs text-right mt-1 flex items-center justify-end space-x-1">
                  <div
                    className={`flex items-center space-x-1 px-2 py-1 rounded-lg shadow ${
                      msg.status === "terbaca" ? "bg-blue-100" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={
                        msg.status === "terbaca"
                          ? "text-blue-600"
                          : "text-gray-700"
                      }
                    >
                      {msg.time}
                    </span>
                    {msg.type === "sent" && (
                      <BsCheck2All
                        className={`w-4 h-4 ${
                          msg.status === "terbaca"
                            ? "text-blue-900"
                            : "text-gray-400"
                        }`}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex p-2 rounded-lg border-2 border-[#808080]/30 gap-2 w-full bg-white">
          <div className="flex gap-2">
            <button
              className="text-gray-500 hover:text-gray-700 cursor-pointer"
              onClick={() => fileInputRef.current.click()}
            >
              <LuPaperclip className="w-5 h-5" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              className="text-gray-500 hover:text-gray-700 cursor-pointer"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
            >
              <FaceSmileIcon className="w-6 h-6" />
            </button>
            {showEmojiPicker && (
              <div
                ref={emojiPickerRef}
                className="absolute bottom-12 left-1/3 bg-white shadow-lg border rounded-lg z-50"
                data-ignore-click="true"
              >
                <EmojiPicker onEmojiClick={handleBukaEmoji} />
              </div>
            )}
          </div>
          {selectedFile && (
            <div className="flex items-center bg-[#808080]/40 px-3 py-1 rounded-md text-sm w-60">
              <span className="text-black">
                {selectedFile.name.length > 15
                  ? selectedFile.name.slice(0, 15) + "..."
                  : selectedFile.name}
              </span>
              <IoIosClose
                className="ml-2 w-5 h-5 text-red-500 cursor-pointer"
                onClick={handleRemoveFile}
              />
            </div>
          )}
          <input
            type="text"
            className="w-full text-black focus:outline-none p-2 rounded-md"
            placeholder="Ketik pesan"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            className="bg-black text-white p-2 rounded-lg"
            onClick={handleSendMessage}
          >
            <PaperAirplaneIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
      {tampilkanModalHapus && (
        <ModalKonfirmasiHapusChat
          terbuka={tampilkanModalHapus}
          tertutup={() => setTampilkanModalHapus(false)}
          chatTerpilih={pesanTerpilih}
        />
      )}
    </div>
  );
};

export default LiveChat;
