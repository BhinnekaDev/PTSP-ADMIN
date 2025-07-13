import { NextResponse } from "next/server";
import { auth } from "@/lib/firebaseAdmin";

export async function POST(req) {
  try {
    if (req.method && req.method !== "POST") {
      return NextResponse.json(
        { error: "Method not allowed" },
        { status: 405 }
      );
    }

    let email;
    try {
      const body = await req.json();
      email = body?.email;
    } catch (err) {
      return NextResponse.json(
        { error: "Body tidak valid atau kosong" },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: "Email harus diisi." },
        { status: 400 }
      );
    }

    const resetLink = await auth.generatePasswordResetLink(email);

    return NextResponse.json({ resetLink }, { status: 200 });
  } catch (error) {
    console.error("❌ Error saat generate reset link:", error);
    return NextResponse.json(
      {
        error: "Gagal membuat reset link.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
