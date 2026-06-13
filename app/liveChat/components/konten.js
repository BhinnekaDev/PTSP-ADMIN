"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  PaperAirplaneIcon,
  FaceSmileIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";
import {
  BsCheck2All,
  BsCheck2,
  BsFileEarmark,
  BsFileImage,
  BsFilePdf,
  BsFileWord,
  BsFileExcel,
} from "react-icons/bs";
import { AiOutlineMessage } from "react-icons/ai";
import { LuPaperclip } from "react-icons/lu";
import { MdDelete } from "react-icons/md";
import { IoIosClose } from "react-icons/io";
import { FaChevronLeft } from "react-icons/fa";
import Image from "next/image";
import { motion } from "framer-motion";
import useKirimPesanPengguna from "@/hooks/backend/useKirimPesanPengguna";
import useHapusChat from "@/hooks/backend/useHapusChat";
import ModalKonfirmasiHapusChat from "@/components/modalKonfirmasiHapusChat";

import gambarBawaan from "@/assets/images/profil.jpg";

const EmojiPickerWrapper = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
});

const LiveChat = ({ setSidebarOpen }) => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [showDeleteIcon, setShowDeleteIcon] = useState(false);

  const {
    chatRooms,
    sedangMemuat,
    kirimPesan,
    subscribeToChatRoom,
    fetchChatRooms,
    tandaiPesanSebagaiDibaca,
  } = useKirimPesanPengguna();

  const { hapusRoomChat, sedangMemuatHapus } = useHapusChat();

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [tampilkanModalHapus, setTampilkanModalHapus] = useState(false);
  const [pesanTerpilih, setPesanTerpilih] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");
  const [selengkapnya2, setSelengkapnya2] = useState([]);
  const [realTimeMessages, setRealTimeMessages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);

  const emojiPickerRef = useRef(null);
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);
  const messagesEndRef = useRef(null);

  // PERBAIKAN: Tambahkan ref untuk mencegah multiple calls mark as read
  const isMarkingAsReadRef = useRef(false);
  const lastMarkedRoomRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
    const id = localStorage.getItem("ID_Admin");
    setCurrentUserId(id);
  }, []);

  useEffect(() => {
    if (!selectedRoom || !isClient) return;

    const unsubscribe = subscribeToChatRoom(selectedRoom.id, (messages) => {
      setRealTimeMessages(messages);
      setSelectedRoom((prev) => ({
        ...prev,
        pesan: messages,
      }));
    });

    return () => unsubscribe();
  }, [selectedRoom, subscribeToChatRoom, isClient]);

  // PERBAIKAN: MARK AS READ saat room dipilih - dengan debounce
  useEffect(() => {
    if (!selectedRoom || !currentUserId || !isClient) return;

    if (isMarkingAsReadRef.current) return;
    if (lastMarkedRoomRef.current === selectedRoom.id) return;

    const markAsRead = async () => {
      try {
        isMarkingAsReadRef.current = true;
        console.log("🔵 Mark as read for room:", selectedRoom.id);
        await tandaiPesanSebagaiDibaca(selectedRoom.id, currentUserId);

        lastMarkedRoomRef.current = selectedRoom.id;

        setTimeout(() => {
          if (lastMarkedRoomRef.current === selectedRoom.id) {
            lastMarkedRoomRef.current = null;
          }
          isMarkingAsReadRef.current = false;
        }, 2000);
      } catch (error) {
        console.error("Error marking as read:", error);
        isMarkingAsReadRef.current = false;
      }
    };

    markAsRead();
  }, [selectedRoom, currentUserId, isClient]);

  // PERBAIKAN: MARK AS READ untuk pesan baru - dengan debounce
  useEffect(() => {
    if (!selectedRoom || !currentUserId || !isClient) return;
    if (realTimeMessages.length === 0) return;

    if (isMarkingAsReadRef.current) return;

    const roomId = selectedRoom.id;

    if (lastMarkedRoomRef.current === roomId) return;

    const hasUnreadFromOther = realTimeMessages.some(
      (msg) => msg.idPengirim !== currentUserId && msg.sudahDibaca === false,
    );

    if (hasUnreadFromOther) {
      const markNewMessages = async () => {
        try {
          isMarkingAsReadRef.current = true;
          console.log("🔵 New unread message detected, marking as read...");
          await tandaiPesanSebagaiDibaca(roomId, currentUserId);

          lastMarkedRoomRef.current = roomId;

          setTimeout(() => {
            if (lastMarkedRoomRef.current === roomId) {
              lastMarkedRoomRef.current = null;
            }
            isMarkingAsReadRef.current = false;
          }, 2000);
        } catch (error) {
          console.error("Error marking new messages as read:", error);
          isMarkingAsReadRef.current = false;
        }
      };
      markNewMessages();
    }
  }, [realTimeMessages, selectedRoom, currentUserId, isClient]);

  useEffect(() => {
    if (!chatRooms.length || !currentUserId) return;

    let total = 0;
    for (const room of chatRooms) {
      const unreadCount =
        room.pesan?.filter(
          (msg) => msg.idPengirim !== currentUserId && !msg.sudahDibaca,
        ).length || 0;
      total += unreadCount;
    }
    setTotalUnreadCount(total);
  }, [chatRooms, currentUserId]);

  const filteredChatRooms = chatRooms.filter((room) => {
    if (!room.pesertaDetail || !Array.isArray(room.pesertaDetail)) {
      return false;
    }

    const participantName =
      room.pesertaDetail.find((p) => p.id !== currentUserId)?.Nama_Lengkap ||
      "";
    return participantName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const toggleSelengkapnya2 = (index) => {
    setSelengkapnya2((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
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
      setUploadProgress(0);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
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
        selectedFile,
      );

      setMessage("");
      setSelectedFile(null);
      setUploadProgress(0);
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

  const bukaModalHapus = () => {
    if (!selectedRoom) return;
    setPesanTerpilih(selectedRoom.id);
    setTampilkanModalHapus(true);
    setShowDeleteIcon(false);
  };

  const handleHapusPercakapan = async () => {
    if (!pesanTerpilih) return;

    const berhasil = await hapusRoomChat(pesanTerpilih);

    if (berhasil) {
      setTampilkanModalHapus(false);
      if (selectedRoom?.id === pesanTerpilih) {
        setSelectedRoom(null);
      }
      setPesanTerpilih(null);
      await fetchChatRooms();
    }
  };

  const getParticipantInfo = (room) => {
    if (!room || !room.pesertaDetail || !Array.isArray(room.pesertaDetail)) {
      return {
        Nama_Lengkap: "Unknown",
        Foto: gambarBawaan,
        id: null,
      };
    }

    const participant = room.pesertaDetail.find((p) => p.id !== currentUserId);
    return (
      participant || {
        Nama_Lengkap: "Unknown",
        Foto: gambarBawaan,
        id: null,
      }
    );
  };

  const getFileIconComponent = (fileName) => {
    if (!fileName) return <BsFileEarmark className="text-2xl" />;

    const extension = fileName.split(".").pop().toLowerCase();
    switch (extension) {
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <BsFileImage className="text-2xl text-blue-500" />;
      case "pdf":
        return <BsFilePdf className="text-2xl text-red-500" />;
      case "doc":
      case "docx":
        return <BsFileWord className="text-2xl text-blue-600" />;
      case "xls":
      case "xlsx":
        return <BsFileExcel className="text-2xl text-green-600" />;
      default:
        return <BsFileEarmark className="text-2xl" />;
    }
  };

  const renderFileMessage = (msg) => {
    const fileExtension = msg.namaFile?.split(".").pop().toLowerCase();
    const isImage = ["jpg", "jpeg", "png", "gif"].includes(fileExtension);

    return (
      <div className="mt-2">
        {isImage ? (
          <div className="relative max-w-xs cursor-pointer">
            <Image
              src={msg.urlFile}
              alt={msg.namaFile}
              width={300}
              height={200}
              className="rounded-lg object-cover border border-gray-200"
              onClick={() => window.open(msg.urlFile, "_blank")}
            />
          </div>
        ) : (
          <a
            href={msg.urlFile}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 border border-gray-200"
            download
          >
            {getFileIconComponent(msg.namaFile)}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{msg.namaFile}</p>
              <p className="text-xs text-gray-500">
                {fileExtension.toUpperCase()} File
              </p>
            </div>
          </a>
        )}
      </div>
    );
  };

  const displayMessages = selectedRoom?.id
    ? realTimeMessages.length > 0
      ? realTimeMessages
      : selectedRoom.pesan
    : [];

  const getUnreadCount = (room) => {
    if (!currentUserId) return 0;
    return (
      room.pesan?.filter(
        (msg) => msg.idPengirim !== currentUserId && !msg.sudahDibaca,
      ).length || 0
    );
  };

  return (
    <div className="flex w-full h-full border rounded-lg shadow-lg overflow-hidden bg-white">
      {/* Sidebar Desktop */}
      <div className="hidden md:flex md:w-1/3 border-r flex-col h-full">
        <div className="p-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-black">Pesan</h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {sedangMemuat ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredChatRooms.length === 0 ? (
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
              const unreadCount = getUnreadCount(room);

              return (
                <div
                  key={room.id}
                  className={`flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer relative ${
                    selectedRoom?.id === room.id ? "bg-gray-200" : ""
                  }`}
                  onClick={() => setSelectedRoom(room)}
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
                    <p className="font-bold text-sm text-black truncate">
                      {participant.Nama_Lengkap || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {lastMessage?.isi
                        ? lastMessage.isi.length > 30
                          ? `${lastMessage.isi.substring(0, 30)}...`
                          : lastMessage.isi
                        : lastMessage?.namaFile
                          ? `[File] ${lastMessage.namaFile}`
                          : "No messages"}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {lastMessage && (
                      <p className="text-xs text-gray-400 whitespace-nowrap">
                        {lastMessage.waktu?.toDate
                          ? new Date(
                              lastMessage.waktu.toDate(),
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : lastMessage.waktu?.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            }) || ""}
                      </p>
                    )}

                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}

                    {lastMessage?.idPengirim === currentUserId &&
                      (lastMessage.sudahDibaca ? (
                        <BsCheck2All className="w-4 h-4 text-blue-500" />
                      ) : (
                        <BsCheck2 className="w-4 h-4 text-gray-400" />
                      ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Mobile Sidebar */}
      {!selectedRoom && (
        <div className="flex md:hidden w-full border-r flex-col h-full">
          <div className="p-4 border-b flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <button
                className="p-2 flex items-center justify-center"
                onClick={() => setSidebarOpen(true)}
              >
                <Bars3Icon className="h-6 w-6 text-black" />
              </button>
              <h2 className="text-lg font-bold text-black">Pesan</h2>
              {totalUnreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {totalUnreadCount}
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            {sedangMemuat ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredChatRooms.length === 0 ? (
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
                const unreadCount = getUnreadCount(room);

                return (
                  <div
                    key={room.id}
                    className={`flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer relative ${
                      selectedRoom?.id === room.id ? "bg-gray-200" : ""
                    }`}
                    onClick={() => setSelectedRoom(room)}
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
                      <p className="font-bold text-sm text-black truncate">
                        {participant.Nama_Lengkap || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {lastMessage?.isi
                          ? lastMessage.isi.length > 30
                            ? `${lastMessage.isi.substring(0, 30)}...`
                            : lastMessage.isi
                          : lastMessage?.namaFile
                            ? `[File] ${lastMessage.namaFile}`
                            : "No messages"}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {lastMessage && (
                        <p className="text-xs text-gray-400 whitespace-nowrap">
                          {lastMessage.waktu?.toDate
                            ? new Date(
                                lastMessage.waktu.toDate(),
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : lastMessage.waktu?.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              }) || ""}
                        </p>
                      )}
                      {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Main Chat Area - TANPA AUTO SCROLL */}
      <div
        className={`
          flex flex-col h-full
          ${selectedRoom ? "w-full md:w-2/3" : "hidden md:flex md:w-2/3"}
        `}
        suppressHydrationWarning
      >
        {selectedRoom ? (
          <>
            <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <FaChevronLeft
                  className="w-5 h-5 text-gray-500 cursor-pointer md:hidden"
                  onClick={() => setSelectedRoom(null)}
                />
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
                  <span className="font-bold text-black">
                    {getParticipantInfo(selectedRoom)?.Nama_Lengkap ||
                      "Unknown"}
                  </span>
                </div>
              </div>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={bukaModalHapus}
              >
                <MdDelete className="w-5 h-5" />
              </button>
            </div>

            {/* Area pesan - BISA DISCROLL BEBAS */}
            <div
              className="flex-1 overflow-y-auto p-4 bg-gray-50"
              style={{ minHeight: 0 }}
            >
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
                            displayMessages[0].waktu.toDate(),
                          ).toLocaleDateString("id-ID", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          })
                        : new Date(
                            displayMessages[0]?.waktu,
                          ).toLocaleDateString("id-ID", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          }) || ""}
                    </span>
                  </div>

                  {displayMessages.map((msg, index) => {
                    if (!msg || (!msg.isi && !msg.teks && !msg.urlFile))
                      return null;

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

                    const isMyMessage =
                      msg.idPengirim === currentUserId ||
                      msg.pengirim === currentUserId;

                    return (
                      <div
                        key={`${
                          msg.id ||
                          `${msg.pengirim}_${msg.waktu?.seconds || index}`
                        }_${index}`}
                        className={`flex mb-4 ${
                          isMyMessage ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`${
                            isMyMessage
                              ? "bg-[#0f67b1] text-white"
                              : "bg-white text-black"
                          } p-3 rounded-lg max-w-md shadow`}
                        >
                          {msg.urlFile && renderFileMessage(msg)}

                          {teks && (
                            <>
                              <p className="whitespace-pre-wrap">
                                {selengkapnya2.includes(index) ||
                                teks.length <= 50
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
                            </>
                          )}

                          <div className="flex items-center justify-end mt-1 space-x-1">
                            <span className="text-xs opacity-80">
                              {waktuPesan}
                            </span>
                            {isMyMessage &&
                              (msg.sudahDibaca || msg.status === "terbaca" ? (
                                <BsCheck2All className="w-4 h-4 text-white" />
                              ) : (
                                <BsCheck2 className="w-4 h-4 text-white" />
                              ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="p-3 border-t bg-white flex-shrink-0">
              {selectedFile && (
                <div className="flex items-center justify-between bg-blue-50 p-2 rounded-lg mb-2">
                  <div className="flex items-center gap-2">
                    {getFileIconComponent(selectedFile.name)}
                    <span className="text-sm truncate max-w-xs">
                      {selectedFile.name}
                    </span>
                  </div>
                  <button onClick={handleRemoveFile}>
                    <IoIosClose className="text-red-500 w-5 h-5" />
                  </button>
                </div>
              )}

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
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
                    accept="image/*, .pdf, .doc, .docx, .xls, .xlsx"
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
                    <EmojiPickerWrapper
                      onEmojiClick={handleBukaEmoji}
                      width={300}
                      height={350}
                    />
                  </div>
                )}

                <input
                  type="text"
                  className="flex-1 border rounded-full py-2 px-4 text-black focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="Ketik pesan..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />

                <button
                  className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 disabled:bg-gray-300 flex items-center justify-center"
                  onClick={handleSendMessage}
                  disabled={(!message.trim() && !selectedFile) || sedangMemuat}
                >
                  {sedangMemuat ? (
                    <span className="text-xs animate-pulse">Mengirim...</span>
                  ) : (
                    <PaperAirplaneIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center bg-gray-50">
            <AiOutlineMessage className="w-24 h-24 text-gray-200 mb-4" />
            <p className="text-gray-500">Pilih percakapan untuk memulai</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {tampilkanModalHapus && (
        <ModalKonfirmasiHapusChat
          terbuka={tampilkanModalHapus}
          tertutup={() => setTampilkanModalHapus(false)}
          chatTerpilih={pesanTerpilih}
          konfirmasiHapusChat={handleHapusPercakapan}
          sedangMemuatHapus={sedangMemuatHapus}
        />
      )}
    </div>
  );
};

export default LiveChat;
