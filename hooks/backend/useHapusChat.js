// hooks/backend/useHapusChat.js
import { useState } from "react";
import { doc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { toast } from "react-toastify";
import { database, storage } from "@/lib/firebaseConfig";

const useHapusChat = () => {
  const [sedangMemuatHapus, setSedangMemuatHapus] = useState(false);

  const hapusRoomChat = async (roomId) => {
    if (!roomId) {
      toast.error("ID chat tidak valid");
      return false;
    }

    setSedangMemuatHapus(true);

    try {
      const pesanRef = collection(database, `chatRooms/${roomId}/pesan`);
      const pesanSnapshot = await getDocs(pesanRef);

      for (const pesanDoc of pesanSnapshot.docs) {
        const pesanData = pesanDoc.data();
        if (pesanData.urlFile) {
          try {
            const urlParts = pesanData.urlFile.split("/o/");
            if (urlParts.length > 1) {
              const filePath = urlParts[1].split("?")[0];
              const decodedPath = decodeURIComponent(filePath);
              const fileRef = ref(storage, decodedPath);
              await deleteObject(fileRef);
              console.log("File berhasil dihapus:", decodedPath);
            }
          } catch (error) {
            console.error("Gagal menghapus file:", error);
          }
        }
      }

      for (const pesanDoc of pesanSnapshot.docs) {
        await deleteDoc(pesanDoc.ref);
      }

      const chatRoomRef = doc(database, "chatRooms", roomId);
      await deleteDoc(chatRoomRef);

      toast.success("Percakapan berhasil dihapus!");
      return true;
    } catch (error) {
      console.error("Gagal menghapus chat:", error);
      toast.error("Gagal menghapus percakapan: " + error.message);
      return false;
    } finally {
      setSedangMemuatHapus(false);
    }
  };

  return { hapusRoomChat, sedangMemuatHapus };
};

export default useHapusChat;
