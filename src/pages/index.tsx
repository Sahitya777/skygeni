import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import ACVBarChart from "@/components/ACVChart";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { useState } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const [chartType, setChartType] = useState("Customer");
  const handleChange = (event: SelectChangeEvent) => {
    setChartType(event.target.value as string);
  };
  return (
    <div className="bg-white w-full">
      <div className="pt-[1rem] w-full flex justify-end pr-[2rem]">
        <FormControl className="w-[200px] pt-[2rem]">
          <InputLabel id="demo-simple-select-label">Chart Type</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={chartType}
            label="Chart Type"
            onChange={handleChange}
          >
            <MenuItem value={'Customer'}>Customer</MenuItem>
            <MenuItem value={'Team'}>Team</MenuItem>
            <MenuItem value={'Account Industry'}>Account Industry</MenuItem>
          </Select>
        </FormControl>
      </div>
      <ACVBarChart chartType={chartType} />
    </div>
  );
}
