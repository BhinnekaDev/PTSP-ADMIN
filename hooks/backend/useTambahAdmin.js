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
  const [peranAdmin, setPeranAdmin] = useState("");
  const [sedangMemuatTambahAdmin, setSedangMemuatTambahAdmin] = useState(false);

  const bersihkanInput = (input) => DOMPurify.sanitize(input);

  const validasiFormulir = () => {
    let pesan = "";

    !namaDepan
      ? ((sesuai = false), (pesanKesalahan += "Nama Depan harus diisi. "))
      : null;
    !namaBelakang
      ? ((sesuai = false), (pesanKesalahan += "Nama Belakang harus diisi. "))
      : null;
    !namaPengguna
      ? ((sesuai = false), (pesanKesalahan += "Nama Pengguna harus diisi. "))
      : null;
    !email
      ? ((sesuai = false), (pesanKesalahan += "Email harus diisi. "))
      : !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
      ? ((sesuai = false), (pesanKesalahan += "Format email tidak sesuai. "))
      : null;
    !jenisKelamin
      ? ((sesuai = false), (pesanKesalahan += "Jenis Kelamin harus dipilih. "))
      : null;
    !instasi
      ? ((sesuai = false), (pesanKesalahan += "Instansi harus diisi. "))
      : null;
    !peranAdmin
      ? ((sesuai = false), (pesanKesalahan += "Peran Admin harus dipilih. "))
      : null;

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
      const peranAdminBersih = bersihkanInput(peranAdmin);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        emailBersih,
        "123456"
      );
      const user = userCredential.user;

      const dataAdmin = {
        Nama_Depan: namaDepanBersih,
        Nama_Belakang: namaBelakangBersih,
        Nama_Pengguna: namaPenggunaBersih,
        Email: emailBersih,
        Jenis_Kelamin: jenisKelaminBersih,
        Instansi: instasiBersih,
        Kata_Sandi: "123456",
        Peran: "Admin",
        Peran_Admin: peranAdminBersih,
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
    peranAdmin,
    namaDepan,
    namaBelakang,
    namaPengguna,
    jenisKelamin,
    setEmail,
    setInstasi,
    setPeranAdmin,
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
