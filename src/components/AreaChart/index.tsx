import * as d3 from "d3";
import React, { useEffect, useRef } from "react";
import { useWindow } from "../../hooks/useWindow";

type Props = {
  prices: { date: string; close: number }[];
};
const AreaChart: React.FC<Props> = ({ prices }) => {
  console.log("prices", prices, "area");
  const parentContainerRef = useRef<HTMLDivElement | null>(null);
  const { dimensions } = useWindow();

  useEffect(() => {
    if (prices.length > 0) {
      if (
        parentContainerRef.current &&
        parentContainerRef.current?.childNodes.length > 0
      )
        parentContainerRef.current?.removeChild(
          parentContainerRef.current.childNodes[0]
        );
      const width = 928;
      const height = 500;
      const marginTop = 20;
      const marginRight = 30;
      const marginBottom = 30;
      const marginLeft = 40;

      // Declare the x (horizontal position) scale.
      const x = d3.scaleUtc(
        d3.extent(prices, (d) => d.date),
        [marginLeft, width - marginRight]
      );

      // Declare the y (vertical position) scale.
      const y = d3.scaleLinear(
        [0, d3.max(prices, (d) => d.close)],
        [height - marginBottom, marginTop]
      );

      // Declare the area generator.
      const area = d3
        .area()
        .x((d) => x(d.date))
        .y0(y(0))
        .y1((d) => y(d.close));

      // Create the SVG container.
      const svg = d3
        .create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto;");

      // Append a path for the area (under the axes).
      svg.append("path").attr("fill", "steelblue").attr("d", area(prices));

      // Add the x-axis.
      svg
        .append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(
          d3
            .axisBottom(x)
            .ticks(width / 80)
            .tickSizeOuter(0)
        );

      // Add the y-axis, remove the domain line, add grid lines and a label.
      svg
        .append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y).ticks(height / 40))
        .call((g) => g.select(".domain").remove())
        .call((g) =>
          g
            .selectAll(".tick line")
            .clone()
            .attr("x2", width - marginLeft - marginRight)
            .attr("stroke-opacity", 0.1)
        )
        .call((g) =>
          g
            .append("text")
            .attr("x", -marginLeft)
            .attr("y", 10)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text("↑ Daily close ($)")
        );

      if (parentContainerRef.current)
        parentContainerRef.current.append(svg.node() as Node);
    }
  }, [prices]);

  return <div ref={parentContainerRef} id="pricesAreaChart"></div>;
};

export default AreaChart;
