import { NextResponse } from "next/server";
import { auth } from "@/lib/firebaseAdmin";

export async function POST(req) {
  try {
    const { email } = await req.json();

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
