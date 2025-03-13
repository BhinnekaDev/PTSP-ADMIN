"use client";
import React, { useState } from "react";
import {
  PaperAirplaneIcon,
  FaceSmileIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { BsCheck2All } from "react-icons/bs";
import { AiOutlineMessage } from "react-icons/ai";

import Image from "next/image";

const LiveChat = () => {
  const [selectedUser, setSelectedUser] = useState("Eyca Putri Edwiyanti");
  const [input, setInput] = useState("");

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
          >
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
          <div className="absolute inset-0 flex justify-center items-center">
            <AiOutlineMessage className="text-black opacity-10 w-64 h-64" />
          </div>

          <div className="flex justify-center my-4">
            <span className="bg-gray-300 text-gray-700 text-sm font-semibold px-4 py-1 rounded-lg">
              Kemarin
            </span>
          </div>
          {selectedUser === "Eyca Putri Edwiyanti" ? (
            <>
              <div className="flex mb-2 justify-start">
                <div className="bg-[#3182B7] text-white p-3 rounded-lg max-w-md shadow">
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua.
                  </p>
                  <p className="text-xs text-right mt-1 opacity-75">19:11</p>
                </div>
              </div>
              <div className="flex mb-2 justify-end">
                <div className="bg-[#72C02C] text-white p-3 rounded-lg max-w-md shadow">
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing.</p>
                  <div className="flex justify-end items-center space-x-1 mt-1 opacity-75">
                    <div className="bg-white rounded-full flex px-2">
                      <p className="text-xs text-black">19:11</p>
                      <div className="flex items-center">
                        <BsCheck2All className="w-4 h-4 text-blue-900 " />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex mb-2 justify-end">
                <div className="bg-[#72C02C] text-white p-3 rounded-lg max-w-md shadow">
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing.</p>
                  <div className="flex justify-end items-center space-x-1 mt-1 opacity-75">
                    <div className="bg-white rounded-full flex px-2">
                      <p className="text-xs text-black">19:11</p>
                      <div className="flex items-center">
                        <BsCheck2All className="w-4 h-4 text-blue-900 " />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex mb-2 justify-end">
                <div className="bg-[#72C02C] text-white p-3 rounded-lg max-w-md shadow">
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing.</p>
                  <div className="flex justify-end items-center space-x-1 mt-1 opacity-75">
                    <div className="bg-white rounded-full flex px-2">
                      <p className="text-xs text-black">19:11</p>
                      <div className="flex items-center">
                        <BsCheck2All className="w-4 h-4 text-blue-900 " />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex mb-2 justify-start">
                <div className="bg-[#3182B7] text-white p-3 rounded-lg max-w-md shadow">
                  <p>Lorem ipsum dolor sit met, consectetur adipiscing elit.</p>
                  <p className="text-xs text-right mt-1 opacity-75">19:11</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex mb-2 justify-start">
                <div className="bg-[#3182B7] text-white p-3 rounded-lg max-w-md shadow">
                  <p>Hey, ada info terbaru?</p>
                  <p className="text-xs text-right mt-1 opacity-75">14:20</p>
                </div>
              </div>

              <div className="flex mb-2 justify-end">
                <div className="bg-[#72C02C] text-black p-3 rounded-lg max-w-md shadow">
                  <p>Cuaca hari ini cerah dan berawan.</p>
                  <div className="flex justify-end items-center space-x-1 mt-1 opacity-75">
                    <div className="bg-white rounded-full flex px-2">
                      <p className="text-xs text-black">19:11</p>
                      <div className="flex items-center">
                        <BsCheck2All className="w-4 h-4 text-light-blue-900 " />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-center my-4">
            <span className="bg-gray-300 text-gray-700 text-sm font-semibold px-4 py-1 rounded-lg">
              Hari Ini
            </span>
          </div>

          {selectedUser === "Eyca Putri Edwiyanti" ? (
            <>
              <div className="flex mb-2 justify-start">
                <div className="bg-[#3182B7] text-white p-3 rounded-lg max-w-md shadow">
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua.
                  </p>
                  <p className="text-xs text-right mt-1 opacity-75">19:11</p>
                </div>
              </div>

              <div className="flex mb-2 justify-end">
                <div className="bg-[#72C02C] text-white p-3 rounded-lg max-w-md shadow">
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing.</p>
                  <div className="flex justify-end items-center space-x-1 mt-1 opacity-75">
                    <div className="bg-white rounded-full flex px-2">
                      <p className="text-xs text-black">19:11</p>
                      <div className="flex items-center">
                        <BsCheck2All className="w-4 h-4 text-blue-900 " />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex mb-2 justify-start">
                <div className="bg-[#3182B7] text-white p-3 rounded-lg max-w-md shadow">
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  </p>
                  <p className="text-xs text-right mt-1 opacity-75">19:11</p>
                </div>
              </div>

              <div className="flex mb-2 justify-end">
                <div className="bg-[#72C02C] text-white p-3 rounded-lg max-w-md shadow">
                  <p>
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco
                    laboris nisi ut aliquip ex ea commodo consequat.
                  </p>
                  <div className="flex justify-end items-center space-x-1 mt-1 opacity-75">
                    <div className="bg-white rounded-full flex px-2">
                      <p className="text-xs text-black">19:11</p>
                      <div className="flex items-center">
                        <BsCheck2All className="w-4 h-4 text-gray-600 " />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-4 border-t flex items-center gap-2">
          <button className="w-6 h-6 text-gray-500 hover:text-gray-700 cursor-pointer">
            <FaceSmileIcon className="w-6 h-6" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ketik pesan"
            className="flex-1 border p-2 rounded-lg"
          />
          <button className="bg-black text-white p-2 rounded-lg">
            <PaperAirplaneIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveChat;
