import { NextResponse } from "next/server";
import { firestore, auth } from "@/lib/firebaseAdmin";

export async function DELETE(req) {
  try {
    const { id } = await req.json();

    if (typeof id !== "string" || !id.trim()) {
      return NextResponse.json({ error: "ID tidak valid." }, { status: 400 });
    }

    // Eksekusi operasi secara berurutan
    await Promise.all([
      auth.deleteUser(id),
      firestore.collection("admin").doc(id).delete(),
      firestore.collection("perorangan").doc(id).delete(),
      firestore.collection("perusahaan").doc(id).delete(),
    ]);

    return NextResponse.json(
      { message: "Admin berhasil dihapus." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting admin:", error);
    return NextResponse.json(
      {
        error: error.message || "Terjadi kesalahan server.",
        code: error.code,
      },
      { status: 500 }
    );
  }
}
