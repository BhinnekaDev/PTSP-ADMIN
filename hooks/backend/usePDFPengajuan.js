import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatRupiah } from "@/constants/formatRupiah";
import { formatTanggal } from "@/constants/formatTanggal";

const usePDFPengajuan = (
  namaPengguna,
  emailPengguna,
  pengajuanDocData,
  dataKeranjang,
  pemesananData,
  idPemesanan,
) => {
  try {
    const doc = new jsPDF();

    // Logo dengan fallback base64 jika gambar tidak ditemukan
    try {
      const imgPath = "/Faktur-Header.png";
      // Coba tambahkan gambar, jika gagal akan lanjut ke catch
      doc.addImage(imgPath, "PNG", 0, 0, 210, 40);
    } catch (imgError) {
      // Fallback: buat header sederhana tanpa gambar
      doc.setFillColor(22, 160, 133);
      doc.rect(0, 0, 210, 40, "F");
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("PTSP BMKG Bengkulu", 105, 25, { align: "center" });
    }

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    const titleText = "Rincian Pengajuan Layanan";
    const titleWidth = doc.getTextWidth(titleText);
    const pageWidth = doc.internal.pageSize.width;
    const titleX = (pageWidth - titleWidth) / 2;
    doc.text(titleText, titleX, 50);

    const jenisAjukan = pengajuanDocData?.Jenis_Ajukan || "-";
    let statusText = "";
    let statusColor = [0, 0, 0];

    if (jenisAjukan === "Berbayar") {
      statusText =
        pemesananData?.Status_Pembayaran === "Lunas" ? "Lunas" : "Belum Bayar";
      statusColor =
        pemesananData?.Status_Pembayaran === "Lunas"
          ? [0, 128, 0]
          : [255, 0, 0];
    } else if (jenisAjukan === "Gratis") {
      statusText = "Gratis";
      statusColor = [0, 0, 255];
    }

    if (statusText) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...statusColor);
      const statusX = pageWidth - doc.getTextWidth(statusText) - 10;
      doc.text(statusText, statusX, 60);
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    const nomorPemesanan = idPemesanan || "-";
    const nomorAjukan = pemesananData?.ID_Ajukan || "-";
    const tanggalPemesanan = pemesananData?.Tanggal_Pemesanan || "-";

    doc.text(`Nomor Pesanan: ${nomorPemesanan}`, 10, 70);
    doc.text(`Tanggal Pemesanan: ${formatTanggal(tanggalPemesanan)}`, 10, 78);
    doc.text(`Nomor Ajukan: ${nomorAjukan}`, 10, 86);
    doc.text(`Tanggal Pengajuan: ${new Date().toLocaleString()}`, 10, 94);
    doc.text(`Jenis Pengajuan: ${jenisAjukan}`, 10, 102);
    doc.text(`Detail Penerima: ${namaPengguna || "-"}`, 10, 118);
    doc.text(`Email: ${emailPengguna || "-"}`, 10, 126);

    const tableData = (dataKeranjang || []).map((item) => [
      item.Nama || "-",
      item.Pemilik || "-",
      item.Kuantitas || "-",
      formatRupiah(item.Harga || "-"),
      formatRupiah(item.Total_Harga || "-"),
    ]);

    // Jika tidak ada data, tambahkan baris kosong
    if (tableData.length === 0) {
      tableData.push(["-", "-", "-", "-", "-"]);
    }

    autoTable(doc, {
      startY: 134,
      head: [
        ["Nama Produk", "Instansi", "Jumlah", "Harga Produk", "Total Harga"],
      ],
      body: tableData,
      styles: {
        fontSize: 11,
        halign: "center",
        valign: "middle",
      },
      headStyles: {
        fillColor: [22, 160, 133],
        halign: "center",
        valign: "middle",
        cellPadding: 4,
      },
      margin: { left: 10, right: 10 },
    });

    const finalY = doc.lastAutoTable.finalY + 10;

    const totalHarga = pemesananData?.Total_Harga_Pesanan || 0;

    const totalText = "Total Pesanan:";
    const hargaText = formatRupiah(totalHarga);
    const totalTextWidth = doc.getTextWidth(totalText);
    const hargaWidth = doc.getTextWidth(hargaText) + 6;
    const spacing = 5;
    const totalX = pageWidth - totalTextWidth - hargaWidth - spacing - 10;
    const hargaX = pageWidth - hargaWidth - 10;
    const hargaY = finalY - 6;

    doc.setFont("helvetica", "bold");
    doc.text(totalText, totalX, finalY);

    doc.setFillColor(245, 245, 245);
    doc.rect(hargaX, hargaY, hargaWidth, 8, "F");

    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(hargaText, hargaX + 3, finalY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
      "Catatan: Jika ada permasalahan atau kesalahan dalam dokumen ini, silakan hubungi stasiun\nsesuai pesanan anda.",
      10,
      finalY + 12,
    );

    return doc.output("datauristring");
  } catch (error) {
    console.error("❌ Error membuat PDF:", error);
    // Return PDF kosong dengan pesan error
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Terjadi kesalahan saat membuat PDF", 20, 50);
      doc.setFontSize(12);
      doc.text("Silakan hubungi admin untuk informasi lebih lanjut.", 20, 70);
      return doc.output("datauristring");
    } catch (fallbackError) {
      return "data:application/pdf;base64,";
    }
  }
};

export default usePDFPengajuan;
