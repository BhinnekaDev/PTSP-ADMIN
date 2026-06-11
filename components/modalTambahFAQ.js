import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  IconButton,
  Input,
  Textarea,
  Button,
  DialogFooter,
  Select,
  Option,
} from "@material-tailwind/react";
import Memuat from "@/components/memuat";
import { XMarkIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import { database } from "@/lib/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const ModalTambahFAQ = ({
  terbuka,
  tertutup,
  dataFAQ,
  mode = "tambah",
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [tipeFAQ, setTipeFAQ] = useState("biasa");

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const [questionPoint, setQuestionPoint] = useState("");
  const [answerPoints, setAnswerPoints] = useState([""]);

  const [category, setCategory] = useState("");

  const resetForm = () => {
    setTipeFAQ("biasa");
    setQuestion("");
    setAnswer("");
    setQuestionPoint("");
    setAnswerPoints([""]);
    setCategory("");
  };

  useEffect(() => {
    if (mode === "sunting" && dataFAQ) {
      if (dataFAQ.category) {
        setCategory(dataFAQ.category);
      }

      if (dataFAQ.answer && Array.isArray(dataFAQ.answer)) {
        setTipeFAQ("point");
        setQuestionPoint(dataFAQ.question || "");
        setAnswerPoints([...dataFAQ.answer]);
        setQuestion("");
        setAnswer("");
      } else if (dataFAQ.answer && typeof dataFAQ.answer === "string") {
        setTipeFAQ("biasa");
        setQuestion(dataFAQ.question || "");
        setAnswer(dataFAQ.answer || "");
        setQuestionPoint("");
        setAnswerPoints([""]);
      } else {
        setTipeFAQ("biasa");
        setQuestion(dataFAQ?.question || "");
        setAnswer(dataFAQ?.answer || "");
        setQuestionPoint("");
        setAnswerPoints([""]);
      }
    } else if (mode === "tambah") {
      resetForm();
    }
  }, [dataFAQ, mode, terbuka]);

  const tambahPoint = () => {
    setAnswerPoints([...answerPoints, ""]);
  };

  const hapusPoint = (index) => {
    const pointsBaru = answerPoints.filter((_, i) => i !== index);
    setAnswerPoints(pointsBaru);
  };

  const updatePoint = (index, value) => {
    const pointsBaru = [...answerPoints];
    pointsBaru[index] = value;
    setAnswerPoints(pointsBaru);
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      let dataFAQToSave = {};

      if (!category.trim()) {
        toast.error("Category harus diisi!");
        setIsLoading(false);
        return;
      }

      if (tipeFAQ === "biasa") {
        if (!question.trim() || !answer.trim()) {
          toast.error("Pertanyaan dan Jawaban harus diisi!");
          setIsLoading(false);
          return;
        }
        dataFAQToSave = {
          category: category.trim(),
          question: question.trim(),
          answer: answer.trim(),
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        };
      } else {
        if (!questionPoint.trim() || answerPoints.some((p) => !p.trim())) {
          toast.error("Pertanyaan dan semua point harus diisi!");
          setIsLoading(false);
          return;
        }

        // SIMPAN sebagai ARRAY (tanpa displayType)
        const cleanAnswers = answerPoints.filter((p) => p.trim() !== "");
        dataFAQToSave = {
          category: category.trim(),
          question: questionPoint.trim(),
          answer: cleanAnswers, // SIMPAN SEBAGAI ARRAY
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        };
      }

      if (mode === "tambah") {
        await addDoc(collection(database, "faq"), dataFAQToSave);
        toast.success("FAQ berhasil ditambahkan!");
      } else if (mode === "sunting" && dataFAQ?.id) {
        const { updateDoc, doc } = await import("firebase/firestore");
        const faqRef = doc(database, "faq", dataFAQ.id);
        await updateDoc(faqRef, {
          ...dataFAQToSave,
          updated_at: serverTimestamp(),
        });
        toast.success("FAQ berhasil diperbarui!");
      }

      resetForm();
      if (onSuccess) onSuccess();
      tertutup(false);
    } catch (error) {
      console.error("Error menyimpan FAQ:", error);
      toast.error(
        `Gagal ${mode === "tambah" ? "menambahkan" : "memperbarui"} FAQ`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    tertutup(false);
  };

  return (
    <Dialog
      open={terbuka}
      handler={handleClose}
      animate={{
        mount: { scale: 1, y: 0 },
        unmount: { scale: 0.9, y: -100 },
      }}
      size="xl"
      className="bg-white"
    >
      <div className="overflow-y-auto max-h-[90vh]">
        <div className="absolute top-3 right-3 z-10">
          <IconButton
            variant="text"
            color="red"
            onClick={handleClose}
            className="text-red-500 hover:bg-transparent"
          >
            <XMarkIcon className="h-6 w-6" />
          </IconButton>
        </div>

        <DialogHeader className="text-black">
          {mode === "tambah" ? "Tambah FAQ" : "Sunting FAQ"}
        </DialogHeader>

        <DialogBody className="flex flex-col gap-4 p-6 bg-white">
          <div className="w-full">
            <label className="block text-sm font-semibold text-black mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Contoh: Umum, Teknis, Layanan, dll."
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="text-black"
              crossOrigin=""
            />
          </div>

          <div className="w-full">
            <label className="block text-sm font-semibold text-black mb-1">
              Tipe FAQ
            </label>
            <Select
              value={tipeFAQ}
              onChange={(val) => setTipeFAQ(val)}
              className="text-black"
            >
              <Option value="biasa">Biasa (Q&A)</Option>
              <Option value="point">Point (List Answer)</Option>
            </Select>
          </div>

          {tipeFAQ === "biasa" && (
            <>
              <div className="w-full">
                <label className="block text-sm font-semibold text-black mb-1">
                  Pertanyaan (Question) <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder="Masukkan pertanyaan..."
                  rows={2}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="text-black"
                />
              </div>
              <div className="w-full">
                <label className="block text-sm font-semibold text-black mb-1">
                  Jawaban (Answer) <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder="Masukkan jawaban..."
                  rows={3}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="text-black"
                />
              </div>
            </>
          )}

          {tipeFAQ === "point" && (
            <>
              <div className="w-full">
                <label className="block text-sm font-semibold text-black mb-1">
                  Pertanyaan (Question) <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder="Masukkan pertanyaan..."
                  rows={2}
                  value={questionPoint}
                  onChange={(e) => setQuestionPoint(e.target.value)}
                  className="text-black"
                />
              </div>

              <div className="w-full">
                <label className="block text-sm font-semibold text-black mb-1">
                  Daftar Point <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {answerPoints.map((point, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-black font-medium min-w-[30px]">
                        {index + 1}.
                      </span>
                      <Input
                        placeholder={`Point ${index + 1}`}
                        value={point}
                        onChange={(e) => updatePoint(index, e.target.value)}
                        className="text-black flex-1"
                        crossOrigin=""
                      />
                      {answerPoints.length > 1 && (
                        <IconButton
                          variant="text"
                          color="red"
                          onClick={() => hapusPoint(index)}
                          className="h-8 w-8"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </IconButton>
                      )}
                    </div>
                  ))}
                </div>

                <Button
                  variant="outlined"
                  color="blue"
                  onClick={tambahPoint}
                  className="mt-3 flex items-center gap-1"
                  size="sm"
                >
                  <PlusIcon className="h-4 w-4" />
                  Tambah Point
                </Button>
              </div>

              {/* Preview */}
              {answerPoints.some((p) => p.trim()) && (
                <div className="w-full p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-semibold text-gray-600 mb-2">
                    Preview (Numbered):
                  </p>
                  <div className="space-y-1">
                    {answerPoints.map((point, idx) => {
                      if (!point.trim()) return null;
                      return (
                        <p key={idx} className="text-sm text-gray-700">
                          {idx + 1}. {point}
                        </p>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </DialogBody>

        <DialogFooter className="gap-2">
          <Button variant="outlined" color="red" onClick={handleClose}>
            Batal
          </Button>
          <Button
            variant="gradient"
            color="black"
            onClick={handleSubmit}
            disabled={isLoading}
            className={isLoading ? "opacity-50 cursor-not-allowed" : ""}
          >
            {isLoading ? (
              <Memuat />
            ) : mode === "tambah" ? (
              "Simpan FAQ"
            ) : (
              "Simpan Perubahan"
            )}
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
};

export default ModalTambahFAQ;
