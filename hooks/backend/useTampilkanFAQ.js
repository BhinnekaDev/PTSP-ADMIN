import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { toast } from "react-toastify";
import { database } from "@/lib/firebaseConfig";

const useTampilkanFAQ = () => {
  const [daftarFAQ, setDaftarFAQ] = useState([]);
  const [sedangMemuat, setSedangMemuat] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setSedangMemuat(true);

    const faqRef = collection(database, "faq");
    const q = query(faqRef, orderBy("created_at", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const faqList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          created_at:
            doc.data().created_at?.toDate?.() || doc.data().created_at,
        }));

        setDaftarFAQ(faqList);
        setSedangMemuat(false);
        setError(null);
      },
      (err) => {
        console.error("Gagal mengambil FAQ:", err);
        setError(err);
        setSedangMemuat(false);
        toast.error("❌ Gagal memuat data FAQ", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      },
    );

    return () => unsubscribe();
  }, []);

  return {
    daftarFAQ,
    sedangMemuat,
    error,
  };
};

export default useTampilkanFAQ;
