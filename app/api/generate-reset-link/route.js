export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@/lib/firebaseAdmin";

export async function POST(req) {
  try {
    const body = await req.json();
    const email = body?.email?.trim();

    // Validasi dasar email
    if (!email || !email.includes("@") || email.length < 6) {
      return NextResponse.json(
        { error: "Email harus valid dan diisi." },
        { status: 400 }
      );
    }

    // Generate reset password link
    const resetLink = await auth.generatePasswordResetLink(email, {
      url: process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com",
      handleCodeInApp: false,
    });

    return NextResponse.json(
      {
        resetLink,
        message: "Link reset password berhasil dibuat",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error saat generate reset link:", {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        error: "Gagal membuat reset link",
        detail: error.message,
        code: error.code,
      },
      { status: 500 }
    );
  }
}
