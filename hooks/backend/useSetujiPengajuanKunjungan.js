"use client";

import { useState } from "react";

const useSetujiPengajuanKunjungan = () => {
  const [loading, setLoading] = useState(false);
  const [berhasil, setBerhasil] = useState(false);
  const [error, setError] = useState(null);

  const setujuiKunjungan = async (id, email) => {
    setLoading(true);
    setError(null);
    setBerhasil(false);

    try {
      const response = await fetch("/api/setujui-kunjungan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Terjadi kesalahan pada server.");
      }

      setBerhasil(true);
    } catch (err) {
      console.error("Gagal menyetujui:", err);
      setError(err.message || "Terjadi kesalahan saat menyetujui.");
    } finally {
      setLoading(false);
    }
  };

  return {
    setujuiKunjungan,
    loading,
    berhasil,
    error,
  };
};

export default useSetujiPengajuanKunjungan;
