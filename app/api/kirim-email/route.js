import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const { email, subject, message } = await req.json();

    // Konfigurasi transporter Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Kirim email
    const info = await transporter.sendMail({
      from: `"PTSP BMKG Bengkulu" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      text: message,
    });

    console.log("Email berhasil dikirim:", info.response);

    return NextResponse.json({
      success: true,
      message: "Email berhasil dikirim!",
    });
  } catch (error) {
    console.error("Gagal mengirim email:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengirim email!" },
      { status: 500 }
    );
  }
}
