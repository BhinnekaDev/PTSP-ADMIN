import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const { email, subject, message, namaPengguna } = await req.json();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"PTSP BMKG Bengkulu" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: `
    <!DOCTYPE html>
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
            <p>Yth. <strong>${namaPengguna}</strong></p>
            <p>${message}<br>Silakan menghubungi kami jika ada pertanyaan lebih lanjut.</p>
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
            Copyrights © 2025 - PTSP BMKG Provinsi Bengkulu. All Rights Reserved.
          </p>
        </div>
      </body>
    </html>
    `,
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
