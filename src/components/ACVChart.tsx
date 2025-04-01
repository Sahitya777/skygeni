import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Box, Typography, Card, Grid } from "@mui/material";
import DonutChart from "./DonutChart";
import axios from "axios";
const ACVBarChart = ({ chartType }: { chartType: string }) => {
  const barRef = useRef(null);
  const donutRef = useRef(null);
  const [data, setData] = useState([]);
  const apiCall = [
    {
      chartType: "Customer",
      endPoint: "customer",
    },
    {
      chartType: "Team",
      endPoint: "team",
    },
    {
      chartType: "Account Industry",
      endPoint: "account_industry",
    },
  ];

  const getEndpoint = (chartType: string): string | null => {
    const match = apiCall.find((item) => item.chartType === chartType);
    return match ? match.endPoint : null;
  };


  useEffect(() => {
    axios.get(`/api/${getEndpoint(chartType)}`) // Corrected API route path
      .then((response) => {
        const rawData = response.data; // Axios automatically parses JSON
        const aggregatedData = rawData.reduce((acc: any, entry: any) => {
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
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [chartType]);

  useEffect(() => {
    if (data.length === 0) return;

    const svg = d3.select(barRef.current);
    svg.selectAll("*").remove();
    const margin = { top: 60, right: 30, bottom: 80, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Background with light gray color
    g.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#f9f9f9");

    const x = d3
      .scaleBand()
      .domain(data.map((d: any) => d.quarter))
      .range([0, width])
      .padding(0.3);

    // Increase the y-axis max value by adding a 10% buffer
    const maxValue = d3.max(data, (d: any) => d.Existing + d.New);
    const yMax = maxValue * 1.1; // Add 10% padding to prevent overflow

    const y = d3.scaleLinear().domain([0, yMax]).nice().range([height, 0]);

    // Add horizontal gridlines
    g.append("g")
      .attr("class", "grid")
      .selectAll("line")
      .data(y.ticks(8))
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", (d) => y(d))
      .attr("y2", (d) => y(d))
      .attr("stroke", "#e0e0e0")
      .attr("stroke-width", 1);

    // Format for currency labels
    const formatCurrency = (value: any) => {
      if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(2)}M`;
      } else if (value >= 1000) {
        return `$${(value / 1000).toFixed(0)}K`;
      }
      return `$${value}`;
    };

    // Y-axis with dollar formatting
    g.append("g")
      .call(d3.axisLeft(y).tickFormat(formatCurrency))
      .call((g) => g.select(".domain").attr("stroke", "#ccc"))
      .call((g) => g.selectAll(".tick line").attr("stroke", "#ccc"));

    // X-axis
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .call((g) => g.select(".domain").attr("stroke", "#ccc"))
      .call((g) => g.selectAll(".tick line").attr("stroke", "#ccc"));

    const colors = { Existing: "#1f77b4", New: "#ff7f0e" };

    const bars = g
      .selectAll(".bar-group")
      .data(data)
      .enter()
      .append("g")
      .attr("transform", (d: any) => `translate(${x(d.quarter)},0)`);

    // First, draw Existing bars (at the bottom)
    bars
      .append("rect")
      .attr("y", (d: any) => y(d.Existing))
      .attr("height", (d: any) => height - y(d.Existing))
      .attr("width", x.bandwidth())
      .attr("fill", colors.Existing);

    // Then, draw New bars (stacked on top of Existing)
    bars
      .append("rect")
      .attr("y", (d: any) => y(d.Existing + d.New))
      .attr("height", (d: any) => height - y(d.New))
      .attr("width", x.bandwidth())
      .attr("fill", colors.New);

    // Total label at the top
    bars
      .append("text")
      .attr("x", x.bandwidth() / 2)
      .attr("y", (d: any) => y(d.Existing + d.New))
      .attr("dy", "-.5em")
      .attr("text-anchor", "middle")
      .text((d: any) => formatCurrency(d.New + d.Existing))
      .style("fill", "black")
      .style("font-weight", "bold")
      .style("font-size", "12px");

    // Labels for New bars
    bars
      .append("text")
      .attr("x", x.bandwidth() / 2)
      .attr("y", (d: any) => (y(d.Existing) + y(d.Existing + d.New)) / 2)
      .attr("text-anchor", "middle")
      .text((d: any) => {
        const percentage = ((d.New / (d.New + d.Existing)) * 100).toFixed(0);
        return `${formatCurrency(d.New)}\n(${percentage}%)`;
      })
      .style("fill", "white")
      .style("font-weight", "bold")
      .style("font-size", "11px");

    // Labels for Existing bars
    bars
      .append("text")
      .attr("x", x.bandwidth() / 2)
      .attr("y", (d: any) => height - (height - y(d.Existing)) / 2)
      .attr("text-anchor", "middle")
      .text((d: any) => {
        const percentage = ((d.Existing / (d.New + d.Existing)) * 100).toFixed(
          0
        );
        return `${formatCurrency(d.Existing)}\n(${percentage}%)`;
      })
      .style("fill", "white")
      .style("font-weight", "bold")
      .style("font-size", "11px");

    // Add chart title

    // Add x-axis label
    svg
      .append("text")
      .attr("x", width / 2 + margin.left)
      .attr("y", height + margin.top + 40)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Closed Fiscal Quarter");

    // Add legend
    const legendData = [
      { name: "Existing Customer", color: colors.Existing },
      { name: "New Customer", color: colors.New },
    ];

    const legend = svg
      .append("g")
      .attr(
        "transform",
        `translate(${margin.left}, ${height + margin.top + 50})`
      );

    legendData.forEach((item, i) => {
      const legendRow = legend
        .append("g")
        .attr("transform", `translate(${i * 200}, 0)`);

      legendRow
        .append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", item.color);

      legendRow
        .append("text")
        .attr("x", 20)
        .attr("y", 12)
        .text(item.name)
        .style("font-size", "12px");
    });
  }, [data]);

  return (
    <Grid
      container
      spacing={0}
      bgcolor="white"
      minHeight="100vh"
      justifyContent="center"
      alignItems="center"
      sx={{ px: 2 }}
    >
      <div>
        <Card
          sx={{ p: 2, textAlign: "center", boxShadow: "none", border: "none" }}
        >
          <Typography variant="h2">Won ACV Mix by {chartType} Type</Typography>
          <svg ref={barRef} width={800} height={500}></svg>
        </Card>
      </div>

      <div>
        <DonutChart data={data} />
      </div>
    </Grid>
  );
};

export default ACVBarChart;
