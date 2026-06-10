import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  IconButton,
  Input,
  Button,
  DialogFooter,
} from "@material-tailwind/react";
import Memuat from "@/components/memuat";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { storage, database } from "@/lib/firebaseConfig";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
} from "firebase/storage";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ModalTambahAPK = ({ terbuka, tertutup, pengaduanYangTerpilih }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [linkManual, setLinkManual] = useState("");
  const [fileApk, setFileApk] = useState(null);
  const [errorFile, setErrorFile] = useState("");
  const [existingData, setExistingData] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Ambil data existing dari Firestore saat modal terbuka
  useEffect(() => {
    if (terbuka) {
      fetchExistingData();
    }
  }, [terbuka]);

  const fetchExistingData = async () => {
    try {
      const docRef = doc(database, "ptsp_production", "fUcFABuv7Vm7xYTSh3oH");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setExistingData(data);
        if (data.link_manual) {
          setLinkManual(data.link_manual);
        }
      } else {
        setExistingData(null);
        setLinkManual("");
      }
    } catch (error) {
      console.error("Error fetching existing data:", error);
      toast.error("Gagal mengambil data: " + error.message);
    }
  };

  // Fungsi untuk menghapus SEMUA file APK di folder Ptsp_Production
  const deleteAllApkFilesInFolder = async () => {
    try {
      const folderRef = ref(storage, "Ptsp_Production");

      // List semua file dalam folder
      const result = await listAll(folderRef);

      if (result.items.length === 0) {
        console.log(
          "📁 Folder Ptsp_Production kosong, tidak ada file yang dihapus",
        );
        return 0;
      }

      console.log(
        `📁 Menemukan ${result.items.length} file di folder Ptsp_Production`,
      );

      // Hapus semua file yang ditemukan
      const deletePromises = result.items.map(async (itemRef) => {
        try {
          await deleteObject(itemRef);
          console.log(`✅ File berhasil dihapus: ${itemRef.fullPath}`);
          return true;
        } catch (error) {
          console.error(
            `❌ Gagal hapus file ${itemRef.fullPath}:`,
            error.message,
          );
          return false;
        }
      });

      const results = await Promise.all(deletePromises);
      const deletedCount = results.filter((success) => success === true).length;

      console.log(
        `✅ Berhasil menghapus ${deletedCount} dari ${result.items.length} file`,
      );
      return deletedCount;
    } catch (error) {
      console.error("❌ Error saat menghapus file dalam folder:", error);
      // Jika folder tidak ada, tidak perlu error
      if (error.code === "storage/object-not-found") {
        console.log("📁 Folder Ptsp_Production tidak ditemukan");
        return 0;
      }
      throw error;
    }
  };

  // Validasi file APK
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const fileExtension = file.name.split(".").pop().toLowerCase();

      if (fileExtension === "apk") {
        if (file.size > 200 * 1024 * 1024) {
          toast.error("❌ Ukuran file terlalu besar! Maksimal 200MB.");
          e.target.value = "";
          return;
        }
        setFileApk(file);
        setErrorFile("");
      } else {
        setFileApk(null);
        toast.error("❌ Hanya file dengan ekstensi .apk yang diperbolehkan!");
        e.target.value = "";
      }
    } else {
      setFileApk(null);
      setErrorFile("");
    }
  };

  const uploadFileToStorage = async (file) => {
    try {
      // HAPUS SEMUA FILE LAMA DI FOLDER SEBELUM UPLOAD
      toast.info("🗑️ Membersihkan storage dari file APK lama...");
      const deletedCount = await deleteAllApkFilesInFolder();

      if (deletedCount > 0) {
        toast.success(`✅ Berhasil membersihkan ${deletedCount} file APK lama`);
      } else {
        toast.info("📁 Tidak ada file APK lama yang perlu dihapus");
      }

      // Upload file baru dengan nama yang konsisten
      const fileName = `Ptsp_Production.apk`; // Nama file tetap
      const filePath = `Ptsp_Production/${fileName}`;
      const storageRef = ref(storage, filePath);

      const metadata = {
        contentType: "application/vnd.android.package-archive",
        customMetadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
          version: new Date().getTime().toString(),
        },
      };

      // Update progress untuk upload
      const uploadTask = uploadBytes(storageRef, file, metadata);

      // Simulasi progress upload
      setUploadProgress(30);
      await uploadTask;
      setUploadProgress(70);

      const downloadURL = await getDownloadURL(storageRef);
      setUploadProgress(100);

      console.log("✅ File uploaded successfully to:", filePath);
      console.log("✅ Download URL:", downloadURL);

      return {
        downloadUrl: downloadURL,
        storagePath: filePath,
      };
    } catch (error) {
      console.error("❌ Error uploading file:", error);
      throw new Error(`Gagal upload file ke storage: ${error.message}`);
    }
  };

  const saveToFirestore = async (
    manualLinkValue,
    storageDownloadUrl,
    storagePath,
  ) => {
    const docRef = doc(database, "ptsp_production", "fUcFABuv7Vm7xYTSh3oH");
    const docSnap = await getDoc(docRef);

    const dataToSave = {
      link_storage: storageDownloadUrl || null,
      file_apk: storagePath || null,
      link_manual: manualLinkValue || null,
      file_name: fileApk ? fileApk.name : null,
      file_size: fileApk ? fileApk.size : null,
      updated_at: new Date().toISOString(),
      updated_by: "admin",
      last_cleanup: new Date().toISOString(), // Catat waktu pembersihan terakhir
    };

    if (docSnap.exists()) {
      await updateDoc(docRef, dataToSave);
      console.log("✅ Firestore document updated");
    } else {
      await setDoc(docRef, {
        ...dataToSave,
        id: "fUcFABuv7Vm7xYTSh3oH",
        created_at: new Date().toISOString(),
      });
      console.log("✅ Firestore document created");
    }
  };

  const handleSubmit = async () => {
    if (!linkManual && !fileApk) {
      toast.warning("❌ Harap isi Link Manual atau upload file APK!");
      return;
    }

    if (fileApk) {
      const fileExtension = fileApk.name.split(".").pop().toLowerCase();
      if (fileExtension !== "apk") {
        toast.error("❌ File harus berekstensi .apk!");
        return;
      }
    }

    setIsLoading(true);
    setErrorFile("");
    setUploadProgress(0);

    try {
      let storageDownloadUrl = null;
      let storagePath = null;

      if (fileApk) {
        // Upload file baru (akan otomatis membersihkan folder terlebih dahulu)
        const result = await uploadFileToStorage(fileApk);
        storageDownloadUrl = result.downloadUrl;
        storagePath = result.storagePath;
      }

      await saveToFirestore(linkManual, storageDownloadUrl, storagePath);

      setLinkManual("");
      setFileApk(null);
      setErrorFile("");
      setUploadProgress(0);
      tertutup(false);

      if (fileApk && linkManual) {
        toast.success("APK berhasil diupdate! (Storage + Link Manual)");
      } else if (fileApk) {
        toast.success(
          "APK berhasil diupload ke Storage! Folder storage telah dibersihkan.",
        );
      } else if (linkManual) {
        toast.success("Link Manual berhasil disimpan!");
      } else {
        toast.success("Data APK berhasil disimpan!");
      }

      if (window.location.pathname.includes("/admin")) {
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      console.error("Error submit:", error);
      toast.error(`Error: ${error.message}`);
      setErrorFile(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <Dialog
        open={terbuka}
        handler={tertutup}
        animate={{
          mount: { scale: 1, y: 0 },
          unmount: { scale: 0.9, y: -100 },
        }}
        size="xl"
        className="bg-white max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-4"
      >
        <div className="overflow-scroll h-screen">
          <div className="absolute top-3 right-3">
            <IconButton
              variant="text"
              color="red"
              onClick={() => {
                tertutup(false);
                setLinkManual("");
                setFileApk(null);
                setErrorFile("");
                setUploadProgress(0);
              }}
              className="text-red-500 hover:bg-transparent"
            >
              <XMarkIcon className="h-6 w-6" />
            </IconButton>
          </div>

          <DialogHeader className="text-black">
            {existingData?.link_storage || existingData?.link_manual
              ? "Update APK"
              : "Upload APK"}
          </DialogHeader>

          <DialogBody
            divider
            className="flex flex-col justify-evenly items-start p-6 bg-white rounded-b-lg"
          >
            {/* Link Manual - Alternatif */}
            <div className="w-full mb-4">
              <label className="block text-sm font-semibold text-black mb-1">
                Link Manual APK
              </label>
              <Input
                placeholder="Masukkan Link APK manual (opsional)"
                className="text-black"
                value={linkManual}
                onChange={(e) => setLinkManual(e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">
                * Digunakan jika link dari Storage tidak tersedia
              </p>
            </div>

            {/* Separator */}
            <div className="w-full flex items-center gap-2 my-2">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="text-xs text-gray-400">ATAU</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            {/* Upload File - Prioritas Utama */}
            <div className="w-full items-start flex flex-col">
              <label className="block text-sm font-semibold text-black mb-1">
                Upload File APK
              </label>
              <Input
                type="file"
                accept=".apk, application/vnd.android.package-archive"
                className="text-black"
                onChange={handleFileChange}
              />
              {fileApk && !errorFile && (
                <div className="mt-2 p-2 bg-green-50 rounded border border-green-200 w-full">
                  <p className="text-green-700 text-sm font-medium">
                    ✓ {fileApk.name}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {(fileApk.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
              {isLoading && uploadProgress > 0 && (
                <div className="mt-2 w-full">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-blue-500 text-xs mt-1">
                    {uploadProgress < 30 &&
                      "Membersihkan storage dari file lama..."}
                    {uploadProgress >= 30 &&
                      uploadProgress < 70 &&
                      "Mengupload APK baru ke Firebase Storage..."}
                    {uploadProgress >= 70 &&
                      uploadProgress < 100 &&
                      "Memproses download URL..."}
                    {uploadProgress === 100 &&
                      "Upload selesai, menyimpan ke database..."}
                  </p>
                </div>
              )}
              {errorFile && (
                <p className="text-red-500 text-sm mt-1">{errorFile}</p>
              )}
            </div>

            <div className="w-full text-xs text-gray-400 mt-3 p-2 bg-gray-50 rounded">
              <p className="font-bold mb-1">Informasi:</p>
              <p className="font-medium">
                Format file: <strong>.apk</strong>
              </p>

              <p className="mt-1 font-medium text-orange-600">
                Link Manual hanya sebagai cadangan jika Storage error
              </p>
            </div>
          </DialogBody>

          <DialogFooter className="gap-2">
            <Button
              variant="text"
              color="red"
              onClick={() => tertutup(false)}
              className="mr-2"
            >
              Batal
            </Button>
            <Button
              variant="gradient"
              color="black"
              onClick={handleSubmit}
              disabled={isLoading}
              className={`${
                isLoading ? "opacity-50 cursor-not-allowed" : "opacity-100"
              }`}
            >
              {isLoading ? (
                <Memuat />
              ) : existingData?.link_storage || existingData?.link_manual ? (
                "Update APK"
              ) : (
                "Upload APK"
              )}
            </Button>
          </DialogFooter>
        </div>
      </Dialog>
    </>
  );
};

export default ModalTambahAPK;
