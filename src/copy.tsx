import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Box, Typography, Card, Grid } from "@mui/material";
import numberFormatter from "@/functions/numberFormatter";
const ACVBarChart = () => {
  const barRef = useRef(null);
  const donutRef = useRef(null);
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("/Customer Type.json")
      .then((response) => response.json())
      .then((rawData) => {
        const aggregatedData = rawData.reduce((acc, entry) => {
          const { closed_fiscal_quarter, acv, Cust_Type } = entry;
          if (!acc[closed_fiscal_quarter]) {
            acc[closed_fiscal_quarter] = {
              quarter: closed_fiscal_quarter,
              Existing: 0,
              New: 0,
            };
          }
          if (Cust_Type === "Existing Customer") {
            acc[closed_fiscal_quarter].Existing += acv;
          } else {
            acc[closed_fiscal_quarter].New += acv;
          }
          return acc;
        }, {});

        setData(Object.values(aggregatedData));
      });
  }, []);
  useEffect(() => {
    if (data.length === 0) return;

    const totalNew = d3.sum(data, (d:any) => d.New);
    const totalExisting = d3.sum(data, (d:any) => d.Existing);
    const total = totalNew + totalExisting;

    const donutSvg = d3.select(donutRef.current);
    donutSvg.selectAll("*").remove();
    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;

    const g = donutSvg
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const pie = d3.pie().value((d:any) => d.value);
    const dataReady= pie([
      { name: "Existing", value: totalExisting },
      { name: "New", value: totalNew },
    ]);

    const arc = d3.arc().innerRadius(80).outerRadius(radius);
    const colors = d3.scaleOrdinal(["#1f77b4", "#ff7f0e"]);

    g.selectAll(".arc")
      .data(dataReady)
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", (d) => colors(d.data.name));

    // Add the total value in the center
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .text(`Total: $${numberFormatter(total)}`)
      .style("font-size", "14px");

    // Add the numbers and percentages inside the pie sections
    g.selectAll(".label")
      .data(dataReady)
      .enter()
      .append("text")
      .attr("transform", (d) => {
        const centroid = arc.centroid(d);
        return `translate(${centroid[0]},${centroid[1]})`;
      })
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .text((d) => {
        const percentage = ((d.data.value / total) * 100).toFixed(1);
        return `$${numberFormatter(d.data.value)} (${percentage}%)`;
      })
      .style("font-size", "12px")
      .style("fill", "white");
  }, [data]);

  useEffect(() => {
    if (data.length === 0) return;
  
    const svg = d3.select(barRef.current);
    svg.selectAll("*").remove();
    const margin = { top: 40, right: 30, bottom: 40, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
  
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.quarter))
      .range([0, width])
      .padding(0.3);
  
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.Existing + d.New)])
      .nice()
      .range([height, 0]);
  
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));
  
    g.append("g").call(d3.axisLeft(y));
  
    const colors = { Existing: "#1f77b4", New: "#ff7f0e" };
  
    const bars = g
      .selectAll(".bar-group")
      .data(data)
      .enter()
      .append("g")
      .attr("transform", (d) => `translate(${x(d.quarter)},0)`);
  
    bars
      .append("rect")
      .attr("y", (d) => y(d.New)) // Move New to the top
      .attr("height", (d) => height - y(d.New))
      .attr("width", x.bandwidth())
      .attr("fill", colors.New);
  
    bars
      .append("rect")
      .attr("y", (d) => y(d.Existing + d.New)) // Existing now goes below New
      .attr("height", (d) => height - y(d.Existing))
      .attr("width", x.bandwidth())
      .attr("fill", colors.Existing);
  
    // Text labels for New and Existing bars
    bars
      .append("text")
      .attr("x", x.bandwidth() / 2)
      .attr("y", (d) => y(d.New) + (height - y(d.New)) / 2)
      .attr("dy", "-1.2em")
      .attr("text-anchor", "middle")
      .text((d) => `$${numberFormatter(d.New)}`)
      .style("fill", "white");
  
    bars
      .append("text")
      .attr("x", x.bandwidth() / 2)
      .attr("y", (d) => y(d.New) + (height - y(d.New)) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text((d) => `${((d.New / (d.New + d.Existing)) * 100).toFixed(1)}%`)
      .style("fill", "white");
  
    bars
      .append("text")
      .attr("x", x.bandwidth() / 2)
      .attr("y", (d) => y(d.Existing + d.New))
      .attr("text-anchor", "middle")
      .text((d) => `$${numberFormatter(d.New + d.Existing)}`)
      .style("fill", "black");
  
    bars
      .append("text")
      .attr("x", x.bandwidth() / 2)
      .attr("y", (d) => y(d.New + d.Existing / 2))
      .attr("dy", "-1.2em")
      .attr("text-anchor", "middle")
      .text((d) => `$${numberFormatter(d.Existing)}`)
      .style("fill", "black");
  
    bars
      .append("text")
      .attr("x", x.bandwidth() / 2)
      .attr("y", (d) => y(d.New + d.Existing / 2))
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text((d) => `${((d.Existing / (d.New + d.Existing)) * 100).toFixed(1)}%`)
      .style("fill", "black");
  }, [data]);
  

  return (
    <Grid
      container
      spacing={2}
      bgcolor="white"
      minHeight="100vh"
      gap="5rem"
      justifyContent="center"
      alignItems="center"
    >
      <Card sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="h6">Won ACV Mix by Customer Type</Typography>
        <svg ref={barRef} width={800} height={500}></svg>
        <Typography>Closed Fiscal Quater</Typography>
      </Card>
      <Card sx={{ p: 2, textAlign: "center", border: "0px" }}>
        <svg ref={donutRef} width={300} height={300}></svg>
      </Card>
    </Grid>
  );
};

export default ACVBarChart;
