import { Card } from '@mui/material'
import React, { useEffect, useRef } from 'react'
import * as d3 from "d3";
import numberFormatter from '@/functions/numberFormatter';

interface PieData {
  name: string;
  value: number;
}

const DonutChart = ({data, chartType}: any) => {
  const donutRef = useRef(null);
  
  useEffect(() => {
    if (data.length === 0) return;
    
    let rawData;
    // Process data based on chart type
    if (chartType === "Customer") {
      rawData = [
        { name: "Existing Customer", value: d3.sum(data, (d: any) => d.Existing || 0) },
        { name: "New Customer", value: d3.sum(data, (d: any) => d.New || 0) },
      ];
    } else {
      // Flatten and aggregate data dynamically
      rawData = d3.rollups(
        data.flatMap((d: any) => 
          Object.keys(d).filter((key) => key !== "quarter").map((key) => ({ name: key, value: d[key] }))
        ),
        (values) => d3.sum(values, (d: any) => d.value),
        (d: any) => d.name
      ).map(([name, value]) => ({ name, value }));
    }
    
    const total = d3.sum(rawData, (d) => d.value);
    const donutSvg = d3.select(donutRef.current);
    donutSvg.selectAll("*").remove(); // Clear previous SVG elements
    
    const width = 450;
    const height = 300;
    const radius = Math.min(width, height) / 2.5;
    
    const svg = donutSvg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-width / 2, -height / 2, width, height])
      .attr("style", "max-width: 100%; height: auto;");

    // Color scheme for different categories
    const colorScheme:any = {
      "Asia Pac": "#1E88E5",
      "Enterprise": "#FF8C00",
      "Europe": "#4CAF50",
      "Latin America": "#E53935",
      "North America": "#9C27B0",
      "Manufacturing": "#1E88E5",
      "Transportation": "#FF8C00",
      "Wholesalers": "#4CAF50",
      "Financial Svcs": "#E53935",
      "Tecnology Svcs": "#9C27B0",
      "Retail": "#795548",
      "Others": "#FFC0CB",
      "Education": "#808080",
      "Existing Customer": "#2185d0",
      "New Customer": "#ff8c00"
    };

    // Function to get color for a category
    const colors = (name: string) => {
      return colorScheme[name] || "#888888"; // Default gray color
    };

    // Create pie layout
    const pie = d3.pie()
      .sort(null)
      .value((d: any) => d.value);

    const pieData = pie(rawData as any);
    
    // Arc generators for slices and outer labels
    const arc = d3.arc()
      .innerRadius(radius * 0.6)
      .outerRadius(radius);
    
    const outerArc = d3.arc()
      .innerRadius(radius * 1.1)
      .outerRadius(radius * 1.1);
    
    // Append pie slices
    svg.selectAll("path")
      .data(pieData)
      .join("path")
      .attr("fill", (d:any) => colors(d.data.name))
      .attr("d", arc as any);
    
    // Add connector lines between slices and labels
    svg.selectAll("polyline")
      .data(pieData)
      .join("polyline")
      .attr("stroke", "black")
      .attr("fill", "none")
      .attr("stroke-width", 1)
      .attr("points", (d: any) => {
        const posA = arc.centroid(d);
        const posB = outerArc.centroid(d);
        const posC = outerArc.centroid(d);
        posC[0] = posC[0] > 0 ? posC[0] + 10 : posC[0] - 10;
        return [posA, posB, posC].map(p => p.join(",")).join(" ");
      });
    
    // Append labels for each segment
    svg.selectAll(".label")
      .data(pieData)
      .join("text")
      .attr("transform", (d: any) => {
        const pos = outerArc.centroid(d);
        pos[0] = pos[0] > 0 ? pos[0] + 15 : pos[0] - 15;
        return `translate(${pos})`;
      })
      .attr("text-anchor", (d: any) => {
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        return midangle < Math.PI ? "start" : "end";
      })
      .text((d: any) => {
        const percentage = ((d.data.value / total) * 100).toFixed(0);
        return `$${numberFormatter(d.data.value)} (${percentage}%)`;
      })
      .style("font-size", "12px");
    
    // Center text showing total value
    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0em")
      .text("Total")
      .style("font-size", "14px");
      
    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1.2em")
      .text(`$${numberFormatter(total)}`)
      .style("font-size", "16px")
      .style("font-weight", "bold");
      
  }, [data, chartType]);
  
  return (
    <Card sx={{ textAlign: "center", boxShadow: "none", border: "none" }}>
      <svg ref={donutRef} width={450} height={300}></svg>
    </Card>
  );
}

export default DonutChart;
