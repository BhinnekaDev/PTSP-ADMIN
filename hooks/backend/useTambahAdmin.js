import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "react-toastify";
import { auth, database } from "@/lib/firebaseConfig";
import DOMPurify from "dompurify";

const useTambahAdmin = () => {
  const [namaDepan, setNamaDepan] = useState("");
  const [namaBelakang, setNamaBelakang] = useState("");
  const [namaPengguna, setNamaPengguna] = useState("");
  const [email, setEmail] = useState("");
  const [jenisKelamin, setJenisKelamin] = useState("");
  const [instasi, setInstasi] = useState("");
  const [sedangMemuatTambahAdmin, setSedangMemuatTambahAdmin] = useState(false);

  const bersihkanInput = (input) => DOMPurify.sanitize(input);

  const validasiFormulir = () => {
    let pesan = "";

    if (!namaDepan) pesan += "Nama Depan harus diisi. ";
    if (!namaBelakang) pesan += "Nama Belakang harus diisi. ";
    if (!namaPengguna) pesan += "Nama Pengguna harus diisi. ";
    if (!email) {
      pesan += "Email harus diisi. ";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      pesan += "Format email tidak sesuai. ";
    }
    if (!jenisKelamin) pesan += "Jenis Kelamin harus dipilih. ";
    if (!instasi) pesan += "Instansi harus diisi. ";

    if (pesan) {
      toast.error(pesan.trim());
      return false;
    }

    return true;
  };

  const tambahAdmin = async () => {
    if (!validasiFormulir()) return;
    setSedangMemuatTambahAdmin(true);

    try {
      const namaDepanBersih = bersihkanInput(namaDepan);
      const namaBelakangBersih = bersihkanInput(namaBelakang);
      const namaPenggunaBersih = bersihkanInput(namaPengguna);
      const emailBersih = bersihkanInput(email);
      const instasiBersih = bersihkanInput(instasi);
      const jenisKelaminBersih = bersihkanInput(jenisKelamin);

      // Tambahkan akun ke Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        emailBersih,
        "123456"
      );
      const user = userCredential.user;

      // Simpan data admin ke collection "admin" saja
      const dataAdmin = {
        Nama_Depan: namaDepanBersih,
        Nama_Belakang: namaBelakangBersih,
        Nama_Pengguna: namaPenggunaBersih,
        Email: emailBersih,
        Jenis_Kelamin: jenisKelaminBersih,
        Instansi: instasiBersih,
        Kata_Sandi: "123456",
        Peran: "Admin",
        Tanggal_Pembuatan_Akun: serverTimestamp(),
        createdBy: auth.currentUser?.uid || null,
      };

      await setDoc(doc(collection(database, "admin"), user.uid), dataAdmin);

      toast.success("Admin berhasil ditambahkan!");
      aturUlangFormulir();
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        toast.error("Email sudah digunakan.");
      } else {
        toast.error("Gagal menambahkan admin: " + error.message);
      }
    } finally {
      setSedangMemuatTambahAdmin(false);
    }
  };

  const aturUlangFormulir = () => {
    setNamaDepan("");
    setNamaBelakang("");
    setNamaPengguna("");
    setEmail("");
    setJenisKelamin("");
    setInstasi("");
  };

  return {
    email,
    instasi,
    namaDepan,
    namaBelakang,
    namaPengguna,
    jenisKelamin,
    setEmail,
    setInstasi,
    setNamaDepan,
    setNamaBelakang,
    setNamaPengguna,
    setJenisKelamin,
    tambahAdmin,
    aturUlangFormulir,
    sedangMemuatTambahAdmin,
  };
};

export default useTambahAdmin;
