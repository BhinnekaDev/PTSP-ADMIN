import { useState, useEffect, useCallback } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { database } from "@/lib/firebaseConfig";

const useKirimPesanPengguna = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const [sedangMemuat, setSedangMemuat] = useState(true);
  const [error, setError] = useState(null);

  const getAdminId = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ID_Admin");
    }
    return null;
  };

  const fetchPesertaDetail = useCallback(async (id) => {
    try {
      const adminId = getAdminId();

      if (!id) return null;

      if (adminId && id === adminId) {
        const adminRef = doc(database, "admin", id);
        const adminSnap = await getDoc(adminRef);
        if (adminSnap.exists()) {
          return { id, ...adminSnap.data(), jenis: "admin" };
        }
        return null;
      }

      const peroranganRef = doc(database, "perorangan", id);
      const peroranganSnap = await getDoc(peroranganRef);
      if (peroranganSnap.exists()) {
        return { id, ...peroranganSnap.data(), jenis: "perorangan" };
      }

      const perusahaanRef = doc(database, "perusahaan", id);
      const perusahaanSnap = await getDoc(perusahaanRef);
      if (perusahaanSnap.exists()) {
        return { id, ...perusahaanSnap.data(), jenis: "perusahaan" };
      }

      return null;
    } catch (err) {
      console.error("Error fetching participant details:", err);
      setError(err);
      return null;
    }
  }, []);

  const fetchChatRooms = useCallback(async () => {
    setSedangMemuat(true);
    try {
      const adminId = getAdminId();
      if (!adminId) {
        setChatRooms([]);
        return;
      }

      const chatRoomsRef = collection(database, "chatRooms");
      const chatRoomsSnapshot = await getDocs(chatRoomsRef);

      const chatRoomsData = await Promise.all(
        chatRoomsSnapshot.docs.map(async (chatDoc) => {
          const chatRoomData = chatDoc.data();

          let peserta = Array.isArray(chatRoomData.peserta)
            ? [...chatRoomData.peserta]
            : [];

          if (!peserta.includes(adminId)) {
            peserta.push(adminId);
            await updateDoc(doc(database, "chatRooms", chatDoc.id), {
              peserta,
            });
          }

          const pesertaDetail = await Promise.all(
            peserta.map((pesertaId) => fetchPesertaDetail(pesertaId))
          );

          const pesanRef = collection(
            database,
            `chatRooms/${chatDoc.id}/pesan`
          );
          const pesanQuery = query(pesanRef, orderBy("waktu", "asc"));
          const pesanSnapshot = await getDocs(pesanQuery);

          const pesanData = pesanSnapshot.docs.map((pesanDoc) => ({
            id: pesanDoc.id,
            ...pesanDoc.data(),
            waktu: pesanDoc.data().waktu?.toDate(),
          }));

          return {
            id: chatDoc.id,
            ...chatRoomData,
            peserta,
            pesertaDetail: pesertaDetail.filter(Boolean),
            pesan: pesanData,
          };
        })
      );

      setChatRooms(
        chatRoomsData.filter((room) => {
          const isAdminInRoom = room.peserta.includes(adminId);
          const isOneOnOneChat = room.peserta.length === 2;
          return isAdminInRoom && isOneOnOneChat;
        })
      );
    } catch (err) {
      console.error("Gagal memuat chatRooms:", err);
      setError(err);
    } finally {
      setSedangMemuat(false);
    }
  }, [fetchPesertaDetail]);

  const kirimPesan = useCallback(
    async (roomId, pengirimId, isiPesan, tipePengirim, fileData = null) => {
      try {
        const pesanRef = collection(database, `chatRooms/${roomId}/pesan`);

        const pesanData = {
          idPengirim: pengirimId,
          isi: isiPesan,
          namaFile: fileData?.name || null,
          urlFile: fileData?.url || null,
          sudahDibaca: false,
          tipePengirim,
          waktu: serverTimestamp(),
        };

        await addDoc(pesanRef, pesanData);

        fetchChatRooms();
      } catch (err) {
        console.error("Gagal mengirim pesan:", err);
        setError(err);
        throw err;
      }
    },
    [fetchChatRooms]
  );

  const subscribeToChatRoom = useCallback((roomId, callback) => {
    const pesanRef = collection(database, `chatRooms/${roomId}/pesan`);
    const pesanQuery = query(pesanRef, orderBy("waktu", "asc"));

    const unsubscribe = onSnapshot(pesanQuery, (snapshot) => {
      const updatedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        waktu: doc.data().waktu?.toDate(),
      }));
      callback(updatedMessages);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    fetchChatRooms();
  }, [fetchChatRooms]);

  return {
    chatRooms,
    sedangMemuat,
    error,
    kirimPesan,
    subscribeToChatRoom,
    fetchChatRooms,
  };
};

export default useKirimPesanPengguna;
