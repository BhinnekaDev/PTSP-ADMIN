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
import useKirimPesanPengguna from "@/hooks/backend/useKirimPesanPengguna";
import ModalKonfirmasiHapusChat from "@/components/modalKonfirmasiHapusChat";

const LiveChat = () => {
  const gambarBawaan = require("@/assets/images/profil.jpg");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [adminId, setAdminId] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const id = localStorage.getItem("ID_Admin");
      setCurrentUserId(id);
      setAdminId(id);
    }
  }, []);

  const {
    chatRooms,
    sedangMemuat,
    kirimPesan,
    subscribeToChatRoom,
    fetchChatRooms,
  } = useKirimPesanPengguna(adminId);

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [tampilkanModalHapus, setTampilkanModalHapus] = useState(false);
  const [pesanTerpilih, setPesanTerpilih] = useState(null);
  const [showDeleteIcon, setShowDeleteIcon] = useState(false);
  const [iconPosition, setIconPosition] = useState({ x: 0, y: 0 });
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");
  const [selengkapnya2, setSelengkapnya2] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [realTimeMessages, setRealTimeMessages] = useState([]);

  const emojiPickerRef = useRef(null);
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Subscribe to real-time updates when room is selected
  useEffect(() => {
    if (!selectedRoom) return;

    const unsubscribe = subscribeToChatRoom(selectedRoom.id, (messages) => {
      setRealTimeMessages(messages);

      // Update the selected room with new messages
      setSelectedRoom((prev) => ({
        ...prev,
        pesan: messages,
      }));
    });

    return () => unsubscribe();
  }, [selectedRoom, subscribeToChatRoom]);

  const filteredChatRooms = chatRooms.filter((room) => {
    const participantName =
      room.pesertaDetail.find((p) => p.id !== currentUserId)?.Nama_Lengkap ||
      "";
    return participantName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [realTimeMessages]);

  const toggleSelengkapnya2 = (index) => {
    setSelengkapnya2((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File terlalu besar. Maksimal 5MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async () => {
    if ((!message.trim() && !selectedFile) || !selectedRoom || !currentUserId)
      return;

    try {
      await kirimPesan(
        selectedRoom.id,
        currentUserId,
        message,
        "admin",
        selectedFile
          ? {
              name: selectedFile.name,
              url: URL.createObjectURL(selectedFile),
            }
          : null
      );

      setMessage("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Gagal mengirim pesan:", error);
      alert("Gagal mengirim pesan");
    }
  };

  const handleBukaEmoji = (emoji) => {
    setMessage((prev) => prev + emoji.emoji);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowDeleteIcon(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const klikKananPesan = (event, roomId) => {
    event.preventDefault();
    setPesanTerpilih(roomId);
    setShowDeleteIcon(true);
    setIconPosition({
      x: event.clientX,
      y: event.clientY,
    });
  };

  const hapusPesan = () => {
    setTampilkanModalHapus(true);
    setShowDeleteIcon(false);
  };

  const getParticipantInfo = (room) => {
    return room.pesertaDetail.find((p) => p.id !== currentUserId) || {};
  };

  if (sedangMemuat) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const displayMessages = selectedRoom?.id
    ? realTimeMessages.length > 0
      ? realTimeMessages
      : selectedRoom.pesan
    : [];

  return (
    <div className="flex h-screen border rounded-lg shadow-lg overflow-hidden bg-white">
      {/* Sidebar */}
      <div className="w-1/3 border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold">Pesan</h2>
          <div className="relative mt-2">
            <input
              type="text"
              placeholder="Cari percakapan"
              className="w-full p-2 border rounded-lg pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredChatRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <AiOutlineMessage className="w-12 h-12 mb-2" />
              <p>Tidak ada percakapan</p>
            </div>
          ) : (
            filteredChatRooms.map((room) => {
              const participant = getParticipantInfo(room);
              const lastMessage =
                room.pesan?.length > 0
                  ? room.pesan[room.pesan.length - 1]
                  : null;

              return (
                <div
                  key={room.id}
                  className={`flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer ${
                    selectedRoom?.id === room.id ? "bg-gray-200" : ""
                  }`}
                  onClick={() => setSelectedRoom(room)}
                  onContextMenu={(e) => klikKananPesan(e, room.id)}
                >
                  <Image
                    src={participant.Foto || gambarBawaan}
                    alt="Profil"
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = gambarBawaan;
                    }}
                  />

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">
                      {participant.Nama_Lengkap || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {lastMessage?.isi || lastMessage?.teks || "No messages"}
                    </p>
                  </div>

                  {lastMessage && (
                    <div className="flex flex-col items-end">
                      <p className="text-xs text-gray-400 whitespace-nowrap">
                        {lastMessage.waktu?.toDate
                          ? new Date(
                              lastMessage.waktu.toDate()
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : lastMessage.waktu?.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            }) || ""}
                      </p>
                      {lastMessage.idPengirim === currentUserId && (
                        <BsCheck2All
                          className={`w-3 h-3 mt-1 ${
                            lastMessage.sudahDibaca
                              ? "text-blue-500"
                              : "text-gray-400"
                          }`}
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="w-2/3 flex flex-col">
        {selectedRoom ? (
          <>
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Image
                  src={getParticipantInfo(selectedRoom)?.Foto || gambarBawaan}
                  alt="Profil"
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = gambarBawaan;
                  }}
                />
                <div>
                  <span className="font-bold">
                    {getParticipantInfo(selectedRoom)?.Nama_Lengkap ||
                      "Unknown"}
                  </span>
                  <span className="block text-green-500 text-xs">online</span>
                </div>
              </div>
              <button className="text-gray-500 hover:text-gray-700">
                <MdDelete className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-4 bg-gray-50 overflow-y-auto">
              {displayMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <AiOutlineMessage className="w-24 h-24 text-gray-200 mb-4" />
                  <p className="text-gray-500">Belum ada pesan</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-center my-4">
                    <span className="bg-gray-200 text-gray-800 px-4 py-1 rounded-full text-xs font-semibold">
                      {displayMessages[0]?.waktu?.toDate
                        ? new Date(
                            displayMessages[0].waktu.toDate()
                          ).toLocaleDateString("id-ID", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          })
                        : new Date(
                            displayMessages[0]?.waktu
                          ).toLocaleDateString("id-ID", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          }) || ""}
                    </span>
                  </div>

                  {displayMessages.map((msg, index) => {
                    if (!msg || (!msg.isi && !msg.teks)) return null;

                    const teks = msg.isi || msg.teks || "";
                    const waktuPesan = msg.waktu?.toDate
                      ? msg.waktu.toDate().toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : msg.waktu?.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        }) || "00:00";

                    return (
                      <div
                        key={`${
                          msg.id ||
                          `${msg.pengirim}_${msg.waktu?.seconds || index}`
                        }_${index}`}
                        className={`flex mb-4 ${
                          msg.idPengirim === currentUserId ||
                          msg.pengirim === currentUserId
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`${
                            msg.idPengirim === currentUserId ||
                            msg.pengirim === currentUserId
                              ? "bg-[#72C02C]"
                              : "bg-[#3182B7]"
                          } text-white p-3 rounded-lg max-w-md shadow`}
                        >
                          {msg.urlFile ? (
                            <div className="mb-2">
                              <a
                                href={msg.urlFile}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white underline"
                              >
                                {msg.namaFile || "File"}
                              </a>
                            </div>
                          ) : null}

                          <p className="whitespace-pre-wrap">
                            {selengkapnya2.includes(index) || teks.length <= 50
                              ? teks
                              : `${teks.substring(0, 250)}...`}
                          </p>

                          {teks.length > 50 && (
                            <motion.button
                              initial={{ opacity: 0.5, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0.5, y: 5 }}
                              transition={{ duration: 0.2 }}
                              className="text-white text-sm underline mt-1"
                              onClick={() => toggleSelengkapnya2(index)}
                            >
                              {selengkapnya2.includes(index)
                                ? "Tampilkan Lebih Sedikit"
                                : "Lihat Selengkapnya"}
                            </motion.button>
                          )}

                          <div className="flex items-center justify-end mt-1 space-x-1">
                            <span className="text-xs opacity-80">
                              {waktuPesan}
                            </span>
                            {(msg.idPengirim === currentUserId ||
                              msg.pengirim === currentUserId) && (
                              <BsCheck2All
                                className={`w-3 h-3 ${
                                  msg.sudahDibaca || msg.status === "terbaca"
                                    ? "text-blue-200"
                                    : "text-gray-300"
                                }`}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
            <AiOutlineMessage className="w-24 h-24 text-gray-200 mb-4" />
            <p className="text-gray-500">Pilih percakapan untuk memulai</p>
          </div>
        )}

        {/* Message Input */}
        {selectedRoom && (
          <div className="p-3 border-t bg-white">
            {selectedFile && (
              <div className="flex items-center justify-between bg-blue-50 p-2 rounded-lg mb-2">
                <div className="flex items-center">
                  <LuPaperclip className="text-blue-500 mr-2" />
                  <span className="text-sm truncate max-w-xs">
                    {selectedFile.name}
                  </span>
                </div>
                <button onClick={handleRemoveFile}>
                  <IoIosClose className="text-red-500 w-5 h-5" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                className="text-gray-500 hover:text-blue-500 p-2 rounded-full"
                onClick={() => fileInputRef.current.click()}
              >
                <LuPaperclip className="w-5 h-5" />
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*, .pdf, .doc, .docx"
                />
              </button>

              <button
                className="text-gray-500 hover:text-yellow-500 p-2 rounded-full"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <FaceSmileIcon className="w-5 h-5" />
              </button>

              {showEmojiPicker && (
                <div
                  ref={emojiPickerRef}
                  className="absolute bottom-16 right-16 z-50"
                >
                  <EmojiPicker
                    onEmojiClick={handleBukaEmoji}
                    width={300}
                    height={350}
                  />
                </div>
              )}

              <input
                type="text"
                className="flex-1 border rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Ketik pesan..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />

              <button
                className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 disabled:bg-gray-300"
                onClick={handleSendMessage}
                disabled={!message.trim() && !selectedFile}
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {tampilkanModalHapus && (
        <ModalKonfirmasiHapusChat
          terbuka={tampilkanModalHapus}
          tertutup={() => setTampilkanModalHapus(false)}
          chatTerpilih={pesanTerpilih}
          onSuccess={() => {
            setSelectedRoom(null);
            setPesanTerpilih(null);
            fetchChatRooms();
          }}
        />
      )}

      {/* Context Menu */}
      {showDeleteIcon && (
        <div
          ref={menuRef}
          className="fixed bg-white shadow-lg rounded-md py-1 z-50"
          style={{
            top: `${iconPosition.y}px`,
            left: `${iconPosition.x}px`,
          }}
        >
          <button
            className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-100 text-red-500"
            onClick={hapusPesan}
          >
            <MdDelete className="w-4 h-4" />
            <span>Hapus Percakapan</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default LiveChat;
