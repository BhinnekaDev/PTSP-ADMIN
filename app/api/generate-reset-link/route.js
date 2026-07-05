import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    // Validasi environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error(
        "❌ EMAIL_USER atau EMAIL_PASS tidak ditemukan di environment",
      );
      return NextResponse.json(
        {
          success: false,
          message:
            "Konfigurasi email tidak lengkap! Silakan hubungi administrator.",
        },
        { status: 500 },
      );
    }

    const { email, subject, message, namaPengguna, pdfBase64 } =
      await req.json();

    // Validasi input
    if (!email || !subject || !message || !namaPengguna) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Semua field (email, subject, message, namaPengguna) wajib diisi!",
        },
        { status: 400 },
      );
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Format email tidak valid!" },
        { status: 400 },
      );
    }

    // Buat transporter dengan timeout yang lebih baik
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // Tambahkan timeout untuk menghindari hang di production
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000,
    });

    // Verifikasi koneksi sebelum mengirim
    try {
      await transporter.verify();
      console.log("✅ Nodemailer terverifikasi untuk:", process.env.EMAIL_USER);
    } catch (verifyError) {
      console.error("❌ Verifikasi Nodemailer gagal:", verifyError);
      return NextResponse.json(
        {
          success: false,
          message:
            "Gagal terhubung ke server email. Periksa konfigurasi email.",
        },
        { status: 500 },
      );
    }

    // Proses attachments
    const attachments = [];
    if (pdfBase64) {
      try {
        // Validasi format base64
        if (!pdfBase64.includes("base64,")) {
          console.warn(
            "⚠️ Format base64 tidak valid, mencoba memproses langsung",
          );
        }

        const base64Data = pdfBase64.split("base64,")[1] || pdfBase64;
        attachments.push({
          filename: "Pengajuan.pdf",
          content: Buffer.from(base64Data, "base64"),
          contentType: "application/pdf",
        });
        console.log("📎 PDF attachment berhasil diproses");
      } catch (attachmentError) {
        console.error("❌ Gagal memproses attachment:", attachmentError);
        // Lanjutkan tanpa attachment jika gagal
      }
    }

    // Sanitasi input untuk menghindari XSS
    const sanitizedNama = namaPengguna.replace(/[<>]/g, "");
    const sanitizedMessage = message.replace(/[<>]/g, "");

    // Kirim email
    const info = await transporter.sendMail({
      from: `"PTSP BMKG Bengkulu" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${subject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
          <div style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 10px; padding: 30px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); margin-bottom: 10px;">
            <div style="text-align: left; margin-bottom: 40px;">
              <img src="https://drive.google.com/uc?export=view&id=1ZDTGxMXQOw_VcW9dJwYLQh05j4MsYDqY" alt="Logo BMKG" style="max-width: 180px; height: auto;">
            </div>
            <div style="margin-top: 20px;">
              <p>Yth. <strong>${sanitizedNama}</strong></p>
              <p>${sanitizedMessage}<br>Silakan menghubungi kami jika ada pertanyaan lebih lanjut.</p>
              <div style="margin-top: 24px;">
                <p>Hormat kami,<br>
                <strong>BMKG PTSP Bengkulu</strong></p>
              </div>
            </div>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ccc;">
            <div style="font-size: 11px; color: #555; text-align: center;">
              <p style="margin-bottom: 16px;">
                <strong>Stasiun Meteorologi</strong> - Jl. Depati Payung Negara, Pekan Sabtu, Kec. Selebar, Kota Bengkulu, Bengkulu 38213<br>
                0736-51064
              </p>
              <p style="margin-bottom: 16px;">
                <strong>Stasiun Klimatologi</strong> - Jl. R. Suprapto, Selebar, Bengkulu 38172<br>
                0736-51157 / 0736-346196 / 0736-33002<br>
                <a href="mailto:staklim.pusatkajiiklim@bmkg.go.id">staklim.pusatkajiiklim@bmkg.go.id</a>
              </p>
              <p style="margin-bottom: 0;">
                <strong>Stasiun Geofisika</strong> - Jl. Pembangunan No. 156 Pasar Ujung, Kepahiang, Bengkulu<br>
                0732-211000<br>
                <a href="mailto:stageof.kepahiang@bmkg.go.id">stageof.kepahiang@bmkg.go.id</a>
              </p>
            </div>
            <p style="font-size: 12px; color: #aaa; text-align: center; margin-top: 30px;">
              Copyrights © ${new Date().getFullYear()} - PTSP BMKG Provinsi Bengkulu. All Rights Reserved.
            </p>
          </div>
        </body>
      </html>`,
      attachments: attachments,
    });

    console.log("✅ Email berhasil dikirim ke:", email);
    console.log("📧 Message ID:", info.messageId);

    return NextResponse.json({
      success: true,
      message: "Email berhasil dikirim!",
      messageId: info.messageId,
    });
  } catch (error) {
    // Log error detail untuk debugging
    console.error("❌ Gagal mengirim email:");
    console.error("Error code:", error.code);
    console.error("Error response:", error.response);
    console.error("Error message:", error.message);

    // Cek apakah error terkait autentikasi
    if (error.code === "EAUTH" || error.response?.includes("Invalid login")) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Autentikasi email gagal. Periksa EMAIL_USER dan EMAIL_PASS di environment variables.",
        },
        { status: 401 },
      );
    }

    // Cek apakah error terkait rate limit
    if (error.response?.includes("Rate limit")) {
      return NextResponse.json(
        {
          success: false,
          message: "Terlalu banyak email terkirim. Silakan coba lagi nanti.",
        },
        { status: 429 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengirim email! Silakan coba lagi nanti.",
      },
      { status: 500 },
    );
  }
}
