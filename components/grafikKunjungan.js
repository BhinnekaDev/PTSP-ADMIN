import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Typography,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Button,
} from "@material-tailwind/react";
import Chart from "react-apexcharts";
import { UserGroupIcon, FunnelIcon } from "@heroicons/react/24/solid";
import useTampilkanGrafikKunjungan from "@/hooks/useTampilkanGrafikKunjungan";

const GrafikKunjungan = () => {
  const [periode, setPeriode] = useState("minggu");
  const { dataKunjungan, sedangMemuatGrafik } = useTampilkanGrafikKunjungan();

  const dataPeriode = dataKunjungan[periode] || [0, 0];

  const konfigurasi = {
    type: "line",
    height: 240,
    series: [
      {
        name: "Perorangan",
        data: [dataPeriode[0]],
      },
      {
        name: "Perusahaan",
        data: [dataPeriode[1]],
      },
    ],
    options: {
      chart: {
        toolbar: {
          show: false,
        },
      },
      title: {
        show: "",
      },
      dataLabels: {
        enabled: false,
      },
      colors: ["#020617", "#0F67B1"],
      stroke: {
        lineCap: "round",
        curve: "smooth",
      },
      markers: {
        size: 0,
      },
      xaxis: {
        axisTicks: {
          show: false,
        },
        axisBorder: {
          show: false,
        },
        labels: {
          style: {
            colors: "#616161",
            fontSize: "12px",
            fontFamily: "inherit",
            fontWeight: 400,
          },
        },
        categories: ["Pengguna"],
      },
      yaxis: {
        labels: {
          style: {
            colors: "#616161",
            fontSize: "12px",
            fontFamily: "inherit",
            fontWeight: 400,
          },
        },
      },
      grid: {
        show: true,
        borderColor: "#dddddd",
        strokeDashArray: 5,
        xaxis: {
          lines: {
            show: true,
          },
        },
        padding: {
          top: 5,
          right: 20,
        },
      },
      fill: {
        opacity: 0.8,
      },
      tooltip: {
        theme: "light",
      },
      legend: {
        show: true,
        position: "top",
        horizontalAlign: "right",
      },
    },
  };

  return (
    <Card>
      <CardHeader
        floated={false}
        shadow={false}
        color="transparent"
        className="flex flex-col gap-4 rounded-none md:flex-row md:items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="w-max rounded-lg bg-[#0F67B1] p-5 text-white">
            <UserGroupIcon className="h-6 w-6" />
          </div>
          <Typography variant="h6" color="blue-gray">
            Pengunjung
          </Typography>
        </div>
        <Menu
          animate={{
            mount: { y: 0 },
            unmount: { y: 25 },
          }}
          placement="left-start"
        >
          <MenuHandler>
            <Button className="p-2 rounded-lg bg-[#0F67B1]">
              <FunnelIcon className="h-5 w-5" />
            </Button>
          </MenuHandler>
          <MenuList>
            <MenuItem onClick={() => setPeriode("minggu")}>Mingguan</MenuItem>
            <MenuItem onClick={() => setPeriode("bulan")}>Bulanan</MenuItem>
            <MenuItem onClick={() => setPeriode("tahun")}>Tahunan</MenuItem>
          </MenuList>
        </Menu>
      </CardHeader>
      <CardBody className="px-2 pb-0">
        {sedangMemuatGrafik ? (
          <Typography color="blue-gray">Memuat data...</Typography>
        ) : (
          <Chart {...konfigurasi} />
        )}
      </CardBody>
    </Card>
  );
};

export default GrafikKunjungan;
