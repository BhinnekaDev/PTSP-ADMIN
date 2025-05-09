export async function kirimEmail(
  email,
  subject,
  message,
  namaPengguna,
  pdfBase64 = null
) {
  try {
    const res = await fetch("/api/kirim-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        subject,
        message,
        namaPengguna,
        pdfBase64,
      }),
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Gagal mengirim email:", error);
    throw error;
  }
}
