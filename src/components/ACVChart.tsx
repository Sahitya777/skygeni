import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Box, Typography, Card, Grid } from "@mui/material";
import DonutChart from "./DonutChart";
import axios from "axios";
import numberFormatter from "@/functions/numberFormatter";
import AnalyticsTable from "./AnalyticsData";
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
    axios
      .get(`/api/${getEndpoint(chartType)}`)
      .then((response) => {
        const rawData = response.data;
        setData(Object.values(rawData));
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


      const industryKeys = chartType === "Account Industry" || chartType === "Team"
      ? [...new Set(data.flatMap(d => Object.keys(d).filter(k => k !== "quarter")))]
      : ["Existing", "New"];

    const maxValue = d3.max(data, (d: any) =>
      industryKeys.reduce((sum, key) => sum + (d[key] || 0), 0)
    );

    const yMax = maxValue ? maxValue * 1.1 : 1;
    const y = d3.scaleLinear().domain([0, yMax]).nice().range([height, 0]);

    // Add horizontal gridlines
    const formatCurrency = (value: any) => {
      if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(2)}M`;
      } else if (value >= 1000) {
        return `$${(value / 1000).toFixed(0)}K`;
      }
      return `$${value}`;
    };
    if (chartType === "Account Industry" || chartType==='Team') {
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

      //Y-axis
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

      const colors = d3.schemeCategory10;

      const bars = g
        .selectAll(".bar-group")
        .data(data)
        .enter()
        .append("g")
        .attr("transform", (d: any) => `translate(${x(d.quarter)},0)`);

      let yOffset = {};
      bars.each((d: any, i: number, nodes: any) => {
        let yStart = height;
        let totalACV = 0;
        industryKeys.forEach((key, index) => {
          const barHeight = height - y(d[key] || 0);
          d3.select(nodes[i])
            .append("rect")
            .attr("y", yStart - barHeight)
            .attr("height", barHeight)
            .attr("width", x.bandwidth())
            .attr("fill", colors[index]);
          yStart -= barHeight;
          totalACV += d[key] || 0;
        });
        
        d3.select(nodes[i])
          .append("text")
          .attr("x", x.bandwidth() / 2)
          .attr("y", y(totalACV) - 5)
          .attr("text-anchor", "middle")
          .text("$"+numberFormatter(totalACV))
          .style("font-size", "12px")
          .style("fill", "black");
      });
      const legend = g.append("g")
      .attr("transform", `translate(0, ${height + 50})`);
    
    const maxLegendWidth = width; // Set maximum width for legend
    const itemWidth = 130; // Width for each legend item
    const itemHeight = 20; // Height spacing between rows
    
    industryKeys.forEach((key, index) => {
      const col = index % Math.floor(maxLegendWidth / itemWidth); // Calculate column position
      const row = Math.floor(index / Math.floor(maxLegendWidth / itemWidth)); // Calculate row position
    
      const legendGroup = legend.append("g")
        .attr("transform", `translate(${col * itemWidth}, ${row * itemHeight})`);
    
      legendGroup.append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", colors[index]);
    
      legendGroup.append("text")
        .attr("x", 20)
        .attr("y", 10)
        .text(key)
        .style("font-size", "14px")
        .attr("alignment-baseline", "middle");
    });
    
    } else {
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
          const percentage = (
            (d.Existing / (d.New + d.Existing)) *
            100
          ).toFixed(0);
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
    }
  }, [data]);

  return (
    <div className="flex flex-col justify-center items-center">
      <Grid
        container
        spacing={0}
        bgcolor="white"
        minHeight="100vh"
        justifyContent="center"
        flexWrap="nowrap"
      >
        <div>
          <Card
            sx={{ textAlign: "center", boxShadow: "none", border: "none" }}
          >
            <Typography variant="h4" ml="20rem">Won ACV mix by {chartType} Type</Typography>
            <svg ref={barRef} width={800} height={600}></svg>
          </Card>
        </div>

        <div className="mt-[8rem]">
          <DonutChart data={data} chartType={chartType} />
        </div>
      </Grid>
      {data &&<AnalyticsTable data={data} chartType={chartType}/>}
    </div>
  );
};

export default ACVBarChart;
