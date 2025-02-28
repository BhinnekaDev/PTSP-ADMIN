import { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { startOfWeek, startOfMonth, startOfYear } from "date-fns";

const useTampilkanGrafikKunjungan = (periode) => {
  const [dataKunjungan, setDataKunjungan] = useState({
    perusahaan: [],
    perseorangan: [],
  });
  const database = getFirestore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const penggunaRef = collection(database, "users");
        const penggunaSnapshot = await getDocs(penggunaRef);

        const perusahaanRef = collection(database, "perusahaan");
        const perseoranganRef = collection(database, "perseorangan");

        const perusahaanSnapshot = await getDocs(perusahaanRef);
        const perseoranganSnapshot = await getDocs(perseoranganRef);

        const perusahaanEmails = new Set(
          perusahaanSnapshot.docs.map((doc) => doc.data().email)
        );
        const perseoranganEmails = new Set(
          perseoranganSnapshot.docs.map((doc) => doc.data().email)
        );

        let filteredPerusahaan = [];
        let filteredPerseorangan = [];

        const filterByDate = (date) => {
          const userDate = new Date(date);
          if (periode === "mingguan")
            return userDate >= startOfWeek(new Date());
          if (periode === "bulanan")
            return userDate >= startOfMonth(new Date());
          if (periode === "tahunan") return userDate >= startOfYear(new Date());
          return true;
        };

        penggunaSnapshot.forEach((doc) => {
          const user = doc.data();
          if (user.createdAt && filterByDate(user.createdAt)) {
            if (perusahaanEmails.has(user.email)) {
              filteredPerusahaan.push(user);
            } else if (perseoranganEmails.has(user.email)) {
              filteredPerseorangan.push(user);
            }
          }
        });

        setDataKunjungan({
          perusahaan: filteredPerusahaan,
          perseorangan: filteredPerseorangan,
        });
      } catch (error) {
        console.error("Error users:", error);
      }
    };

    fetchData();
  }, [periode]);

  return dataKunjungan;
};

export default useTampilkanGrafikKunjungan;
