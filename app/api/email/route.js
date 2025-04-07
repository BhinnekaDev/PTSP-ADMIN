import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";

export async function POST(req) {
  try {
    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
    const SENDER_EMAIL = process.env.SENDER_EMAIL;
    const EXPRESS_API_URL = process.env.NEXT_PUBLIC_EXPRESS_API_URL;

    if (!SENDGRID_API_KEY || !SENDER_EMAIL || !EXPRESS_API_URL) {
      return NextResponse.json(
        { error: "Konfigurasi environment tidak lengkap." },
        { status: 500 }
      );
    }

    sgMail.setApiKey(SENDGRID_API_KEY);

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Format request tidak valid. Harus berupa JSON." },
        { status: 400 }
      );
    }

    const { email } = body;
    if (!email) {
      return NextResponse.json(
        { error: "Email harus diisi." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Format email tidak valid." },
        { status: 400 }
      );
    }

    const resetLinkResponse = await fetch(
      `${EXPRESS_API_URL}/api/generate-reset-link`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }
    );

    const resetLinkData = await resetLinkResponse.json();
    if (!resetLinkResponse.ok) {
      return NextResponse.json(
        { error: resetLinkData?.error ?? "Gagal membuat reset link." },
        { status: 500 }
      );
    }

    const resetLink = resetLinkData.resetLink;

    const msg = {
      to: email,
      from: SENDER_EMAIL,
      replyTo: SENDER_EMAIL,
      subject: "Reset Kata Sandi",
      text: `Klik link ini untuk mereset kata sandi Anda: ${resetLink}`,
      html: `
        <div style="max-width: 500px; margin: auto; font-family: Arial, sans-serif; border: 1px solid #ddd; border-radius: 10px; padding: 20px;">
           <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh8ctjeqUz5icyJX9hnh5TsTtmk7dWj2Wyf-fGvnr7hNp51eCKcEBqRU28eYI7urmTIP7DKqmojNCEivvYU8i5PKW8mQAzwjmDFlqlwHxLok2fO-pWoedKjICiRz4KdvfIU4L34oMWJqc4/s1600/1639224352448521-0.png"
           alt="Banner BMKG"
           style="width: 100%; height: auto; display: block;" />
          <p style="font-size: 18px; font-weight: bold; color: #333; text-align: center;">
            Halo, Pengguna Admin  PTSP BMKG Bengkulu
          </p>
          <p style="font-size: 16px; color: #555; text-align: center;">
            Kami menerima permintaan untuk mengatur ulang kata sandi akun <strong>${email}</strong>.<br>
            Jika Anda ingin melanjutkan, silakan klik tombol di bawah ini:
          </p>
          <div style="text-align: center; margin: 20px 0;">
             <a href="${resetLink}" 
           style="display: inline-block; background-color: rgb(0, 183, 255); color: white; 
                  padding: 12px 20px; font-size: 16px; font-weight: bold; text-decoration: none;
                  border-radius: 5px;">
          Ubah Kata Sandi
        </a>
          </div>
          <p style="font-size: 16px; color: #555; text-align: center;">
            Jika Anda tidak meminta reset kata sandi ini, abaikan saja email ini. Akun Anda tetap aman.
          </p>
        </div>
      `,
    };

    await sgMail.send(msg);

    return NextResponse.json(
      { message: "Email reset password berhasil dikirim!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error mengirim email:", error.response?.body || error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengirim email." },
      { status: 500 }
    );
  }
}
