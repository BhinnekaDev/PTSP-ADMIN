import { NextResponse } from "next/server";
import { auth } from "@/lib/firebaseAdmin";

export async function POST(req) {
  try {
    const body = await req.json();
    const email = body?.email;

    if (!email) {
      return NextResponse.json(
        { error: "Email harus diisi." },
        { status: 400 }
      );
    }

    // Generate reset link
    const resetLink = await auth.generatePasswordResetLink(email);
    return NextResponse.json({ resetLink }, { status: 200 });
  } catch (error) {
    console.error("❌ Error saat generate reset link:", error);
    return NextResponse.json(
      { error: "Gagal membuat reset link", detail: error.message },
      { status: 500 }
    );
  }
}
