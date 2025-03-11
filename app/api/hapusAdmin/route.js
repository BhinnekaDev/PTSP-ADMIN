import { NextResponse } from "next/server";
import { firestore, auth } from "@/lib/firebaseAdmin";

export async function DELETE(req) {
  try {
    const { id } = await req.json();

    if (typeof id !== "string" || !id.trim()) {
      return NextResponse.json({ error: "ID tidak valid." }, { status: 400 });
    }

    await auth.deleteUser(id);
    await firestore.collection("admin").doc(id).delete();
    await firestore.collection("pengguna").doc(id).delete();

    return NextResponse.json(
      { message: "Admin berhasil dihapus." },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
