import { Card } from "@material-tailwind/react";
// KOMPONEN KAMI
import GrafikPartisipan from "@/components/grafikPartisipan";
import GrafikKunjungan from "@/components/grafikKunjungan";

function Konten() {
  return (
    <Card className="h-full w-full p-4">
      <GrafikPartisipan />
      <div className="my-4"></div>
      <GrafikKunjungan />
    </Card>
  );
}

export default Konten;
