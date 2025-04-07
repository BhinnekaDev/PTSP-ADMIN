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
      subject: "🔐 Reset Kata Sandi - PTSP BMKG Bengkulu",
      text: `Halo, Pengguna Admin PTSP BMKG Bengkulu\n\nKami menerima permintaan untuk mengatur ulang kata sandi akun ${email}.\nSilakan klik tautan berikut untuk melanjutkan: ${resetLink}\n\nJika Anda tidak meminta reset kata sandi ini, abaikan saja email ini.`,
      html: `
        <div style="max-width: 550px; margin: auto; font-family: Arial, sans-serif; border: 1px solid #e0e0e0; border-radius: 10px; padding: 25px; background-color: #f9f9f9;">
          <div style="text-align: center; padding-bottom: 15px;">
            <img src="https://4.bp.blogspot.com/-xHZR0kpIHTA/W_dNFTFgjxI/AAAAAAAAQQk/cJOEleTJmSAV4rifX6Lwq3ta5jcnTylugCLcBGAs/s1600/BMKG.png"
              alt="BMKG Logo"
              style="width: 180px; height: auto; display: block; margin: 0 auto;" />
          </div>
          <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0px 2px 5px rgba(0,0,0,0.1);">
            <h2 style="font-size: 22px; color: #333; text-align: center;">Reset Kata Sandi Anda</h2>
            <p style="font-size: 16px; color: #555; text-align: center;">
              <strong> Halo, Pengguna Admin PTSP BMKG Bengkulu</strong>
            </p>
            <p style="font-size: 16px; color: #555; text-align: center;">
              Kami menerima permintaan untuk mengatur ulang kata sandi akun Anda (<strong>${email}</strong>).
              Jika Anda ingin melanjutkan, silakan klik tombol di bawah ini:
            </p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${resetLink}"
                style="display: inline-block; background-color: #007bff; color: white; padding: 12px 25px;
                       font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 5px;">
                Ubah Kata Sandi
              </a>
            </div>
            <p style="font-size: 14px; color: #777; text-align: center;">
              Jika Anda tidak meminta reset kata sandi ini, abaikan saja email ini. Akun Anda tetap aman.
            </p>
          </div>
          <div style="text-align: center; font-size: 13px; color: #999; margin-top: 20px;">
            © ${new Date().getFullYear()} PTSP BMKG Bengkulu. Semua Hak Dilindungi.
          </div>
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
