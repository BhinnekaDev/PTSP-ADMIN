import { Timestamp } from "firebase/firestore";

export const formatTanggal = (timestamp) => {
  if (!timestamp) return "";

  try {
    let date;

    if (timestamp instanceof Timestamp) {
      date = timestamp.toDate();
    } else if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === "string" || typeof timestamp === "number") {
      date = new Date(timestamp);
    } else {
      return "Format tanggal tidak valid";
    }

    const options = {
      day: "2-digit",
      month: "long",
      year: "numeric",
    };

    return date.toLocaleDateString("id-ID", options);
  } catch (error) {
    console.error("Error memformat tanggal:", error);
    return "Format tanggal tidak valid";
  }
};
