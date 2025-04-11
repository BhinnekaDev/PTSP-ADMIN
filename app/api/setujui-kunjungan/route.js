import { app } from "@/lib/firebaseConfig";
import { doc, getFirestore, updateDoc } from "firebase/firestore";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const database = getFirestore(app);

export async function POST(req) {
  try {
    const { id, email } = await req.json();

    if (!id || !email) {
      return NextResponse.json(
        { message: "ID dan Email diperlukan." },
        { status: 400 }
      );
    }
    const docRef = doc(database, "pengajuan_kunjungan", id);
    await updateDoc(docRef, { Status: "Disetujui" });

    // Konfigurasi email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Admin Kunjungan" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Pengajuan Kunjungan Disetujui",
      text: "Pengajuan kunjungan anda telah disetujui. Silakan cek kembali akun anda untuk informasi lebih lanjut.",
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      message: "Berhasil menyetujui dan mengirim email.",
    });
  } catch (err) {
    console.error("Error di API setujui-kunjungan:", err);
    return NextResponse.json(
      { message: "Gagal menyetujui atau mengirim email.", error: err.message },
      { status: 500 }
    );
  }
}
