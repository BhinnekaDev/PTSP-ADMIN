import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { toast } from "react-toastify";
import { auth } from "@/lib/firebaseConfig";
import { useRouter } from "next/navigation";

const useMasukDenganEmailKataSandi = () => {
  const pengarah = useRouter();
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [adminID, setAdminID] = useState(null);

  useEffect(() => {
    const cekStatusLogin = onAuthStateChanged(auth, (user) => {
      if (user) {
        const idAdminSession = localStorage.getItem("ID_Admin");
        if (!idAdminSession) {
          localStorage.setItem("ID_Admin", user.uid);
          localStorage.setItem(user.uid, "Aktif");
        }
        setAdminID(user.uid);
      } else {
        localStorage.removeItem("ID_Admin");
        setAdminID(null);
      }
    });

    return () => cekStatusLogin();
  }, []);

  useEffect(() => {
    if (adminID && window.location.pathname !== "/beranda") {
      pengarah.push("/beranda");
    }
  }, [adminID, pengarah]);

  const masukDenganEmail = async (email, password) => {
    if (!email || !password) {
      toast.error("Email dan kata sandi tidak boleh kosong.");
      return;
    }

    setSedangMemuat(true);

    try {
      const kredentialsAdmin = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      if (kredentialsAdmin.user) {
        localStorage.setItem("ID_Admin", kredentialsAdmin.user.uid);
        localStorage.setItem(kredentialsAdmin.user.uid, "Aktif");
        setAdminID(kredentialsAdmin.user.uid);

        toast.success("Berhasil masuk!");
        pengarah.push("/beranda");
      }
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        toast.error("Email salah. Silakan periksa email Anda.");
      } else if (error.code === "auth/wrong-password") {
        toast.error("Kata sandi salah. Silakan periksa kata sandi Anda.");
      } else if (error.code === "auth/invalid-email") {
        toast.error("Format email tidak valid.");
      } else {
        toast.error("Email atau kata sandi Anda tidak sesuai.");
      }
    } finally {
      setSedangMemuat(false);
    }
  };

  return {
    masukDenganEmail,
    sedangMemuat,
    adminID,
  };
};

export default useMasukDenganEmailKataSandi;
