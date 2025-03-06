export async function kirimEmail(email, subject, message) {
  try {
    const response = await fetch("/api/kirim-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, subject, message }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Gagal mengirim email");
    }

    return result;
  } catch (error) {
    console.error("Error mengirim email:", error);
    throw error;
  }
}
