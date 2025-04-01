import { Card } from '@mui/material'
import React, { useEffect, useRef } from 'react'
import * as d3 from "d3";
import numberFormatter from '@/functions/numberFormatter';

const DonutChart = ({data}:any) => {
    const donutRef = useRef(null);
    useEffect(() => {
        if (data.length === 0) return;
    
        const totalNew = d3.sum(data, (d: any) => d.New);
        const totalExisting = d3.sum(data, (d: any) => d.Existing);
        const total = totalNew + totalExisting;
    
        const donutSvg = d3.select(donutRef.current);
        donutSvg.selectAll("*").remove();
        const width = 300;
        const height = 300;
        const radius = Math.min(width, height) / 2;
    
        const g = donutSvg
          .append("g")
          .attr("transform", `translate(${width / 2},${height / 2})`);
    
        const pie = d3.pie().value((d: any) => d.value);
    
        const dataReady = pie([
          { name: "Existing", value: totalExisting },
          { name: "New", value: totalNew },
        ]);
    
        const arc:any = d3.arc().innerRadius(80).outerRadius(radius);
        const colors = d3.scaleOrdinal(["#1f77b4", "#ff7f0e"]);
    
        g.selectAll(".arc")
          .data(dataReady)
          .enter()
          .append("path")
          .attr("d", arc)
          .attr("fill", (d:any) => colors(d.data.name));
    
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
          .text((d:any) => {
            const percentage = ((d.data.value / total) * 100).toFixed(1);
            return `$${numberFormatter(d.data.value)} (${percentage}%)`;
          })
          .style("font-size", "12px")
          .style("fill", "white");
      }, [data]);
  return (
    <Card
    sx={{ p: 2, textAlign: "center", boxShadow: "none", border: "none" }}
  >
    <svg ref={donutRef} width={300} height={300}></svg>
  </Card>
  )
}

export default DonutChart