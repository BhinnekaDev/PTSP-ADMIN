import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import { database } from "@/lib/firebaseConfig";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";
import { startOfWeek, startOfMonth, startOfYear, isAfter } from "date-fns";

const useTampilkanGrafikKunjungan = () => {
  const defaultData = {
    perorangan: 0,
    perusahaan: 0,
    realtime: 0,
  };
  const [dataKunjungan, setDataKunjungan] = useState(defaultData);
  const [sedangMemuatGrafik, setSedangMemuatGrafik] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribers = [];

    setSedangMemuatGrafik(true);

    isSupported()
      .then((supported) => {
        if (supported) {
          console.log("Firebase Analytics diaktifkan.");
          getAnalytics();
        } else {
          console.warn("Firebase Analytics tidak didukung di lingkungan ini.");
        }
      })
      .catch((error) => console.error("Error memeriksa Analytics:", error));

    try {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          console.log("Pengguna terautentikasi:", user.email);

          const userRef = doc(database, "users", user.uid);
          await setDoc(
            userRef,
            {
              email: user.email,
              SignedIn: serverTimestamp(),
            },
            { merge: true }
          );
          console.log("Data aktivitas pengguna diperbarui.");

          const activeQuery = query(
            collection(database, "users"),
            where("SignedIn", ">=", new Date(Date.now() - 10 * 60000))
          );

          const unsubscribeActive = onSnapshot(activeQuery, (snapshot) => {
            console.log("Jumlah pengguna aktif (Realtime):", snapshot.size);
            setDataKunjungan((prev) => ({ ...prev, realtime: snapshot.size }));
          });

          unsubscribers.push(unsubscribeActive);

          const usersSnapshot = await getDocs(collection(database, "users"));
          const now = new Date();
          const startWeek = startOfWeek(now);
          const startMonth = startOfMonth(now);
          const startYear = startOfYear(now);

          let loginMingguIni = 0;
          let loginBulanIni = 0;
          let loginTahunIni = 0;

          usersSnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.SignedIn && data.SignedIn.toDate) {
              const loginDate = data.SignedIn.toDate();
              if (isAfter(loginDate, startWeek)) loginMingguIni++;
              if (isAfter(loginDate, startMonth)) loginBulanIni++;
              if (isAfter(loginDate, startYear)) loginTahunIni++;
            }
          });

          console.log(
            "Jumlah pengguna login dalam minggu ini:",
            loginMingguIni
          );
          console.log("Jumlah pengguna login dalam bulan ini:", loginBulanIni);
          console.log("Jumlah pengguna login dalam tahun ini:", loginTahunIni);

          const queryPerorangan = query(
            collection(database, "perorangan"),
            where("email", "==", user.email)
          );

          console.log(`Mengecek data di koleksi perorangan berdasarkan email`);

          const unsubscribePerorangan = onSnapshot(
            queryPerorangan,
            async (snapshot) => {
              console.log(`Data ditemukan di perorangan:`, snapshot.size);

              // Cek apakah dokumen ada
              const peroranganDocs = await getDocs(queryPerorangan);
              peroranganDocs.forEach((doc) => {
                console.log("Data perorangan:", doc.data());
              });

              setDataKunjungan((prev) => ({
                ...prev,
                perorangan: snapshot.size,
              }));
            }
          );

          unsubscribers.push(unsubscribePerorangan);

          const queryPerusahaan = query(
            collection(database, "perusahaan"),
            where("emailPerusahaan", "==", user.email)
          );

          console.log(
            `Mengecek data di koleksi perusahaan berdasarkan emailPerusahaan`
          );

          const unsubscribePerusahaan = onSnapshot(
            queryPerusahaan,
            async (snapshot) => {
              console.log(`Data ditemukan di perusahaan:`, snapshot.size);

              // Cek apakah dokumen ada
              const perusahaanDocs = await getDocs(queryPerusahaan);
              perusahaanDocs.forEach((doc) => {
                console.log("Data perusahaan:", doc.data());
              });

              setDataKunjungan((prev) => ({
                ...prev,
                perusahaan: snapshot.size,
              }));
            }
          );

          unsubscribers.push(unsubscribePerusahaan);
        } else {
          console.warn("Tidak ada pengguna yang sedang login.");
        }
      });
    } catch (error) {
      console.error("Error fetching visit data:", error);
    } finally {
      setSedangMemuatGrafik(false);
    }

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  return { dataKunjungan, sedangMemuatGrafik };
};

export default useTampilkanGrafikKunjungan;
