import { useState } from "react";
import { toast } from "react-toastify";

const useLupaKataSandiAdmin = () => {
  const [sedangMemuat, setSedangMemuat] = useState(false);

  const kirimEmailReset = async (email) => {
    if (!email) {
      toast.error("Email harus diisi!");
      return;
    }

    setSedangMemuat(true);

    try {
      const resetLinkResponse = await fetch("/api/generate-reset-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!resetLinkResponse.ok) {
        const errorData = await resetLinkResponse.json();
        throw new Error(errorData.error || "Gagal membuat reset link.");
      }

      const { resetLink } = await resetLinkResponse.json();

      const emailResponse = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, resetLink }),
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json();
        throw new Error(
          errorData.error || "Terjadi kesalahan saat mengirim email."
        );
      }

      toast.success("Email reset kata sandi telah dikirim!");
    } catch (error) {
      console.error("❌ Error:", error.message);
      toast.error(`Gagal: ${error.message}`);
    } finally {
      setSedangMemuat(false);
    }
  };

  return { kirimEmailReset, sedangMemuat };
};

export default useLupaKataSandiAdmin;
