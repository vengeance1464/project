// // import { useEffect, useRef } from "react";
// // import * as d3 from "d3";

// // type Props = {
// //   data: { title: string; value: number; type: string }[];
// // };

// // const BubbleD3Chart: React.FC<Props> = ({ data }) => {
// //   console.log("Data", data);
// //   const ref = useRef();

// //   useEffect(() => {
// //     // set the dimensions and margins of the graph
// //     const width = 460;
// //     const height = 460;

// //     // append the svg object to the body of the page
// //     const svg = d3
// //       .select("#my_dataviz")
// //       .append("svg")
// //       .attr("width", width)
// //       .attr("height", height);

// //     // Color palette for each transaction
// //     const color = d3
// //       .scaleOrdinal()
// //       .domain(["high", "low", "middle"])
// //       .range(["#353745", "#d9d9d9", "#00C853"]);

// //     // Size scale for transactions
// //     const size = d3.scaleLinear().domain([0, 2000]).range([7, 100]); // circle will be between 7 and 55 px wide

// //     // Initialize the circle: all located at the center of the svg area
// //     var node = svg
// //       .append("g")
// //       .selectAll("circle")
// //       .data(data)
// //       .join("circle")
// //       .attr("class", "node")
// //       .attr("r", (d) => size(d.value))
// //       .attr("cx", width)
// //       .attr("cy", height)
// //       .style("fill", (d) => color(d.type))
// //       .style("fill-opacity", 0.8);

// //     // Features of the forces applied to the nodes:
// //     const simulation = d3
// //       .forceSimulation()
// //       .force(
// //         "center",
// //         d3
// //           .forceCenter()
// //           .x(width / 2)
// //           .y(height / 2)
// //       ) // Attraction to the center of the svg area
// //       .force("charge", d3.forceManyBody().strength(0.1)) // Nodes are attracted one each other of value is > 0
// //       .force(
// //         "collide",
// //         d3
// //           .forceCollide()
// //           .strength(0.2)
// //           .radius(function (d: any) {
// //             return size(d.value) + 3;
// //           })
// //           .iterations(1)
// //       ); // Force that avoids circle overlapping

// //     // Apply these forces to the nodes and update their positions.
// //     // Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
// //     simulation.nodes(data).on("tick", function (d) {
// //       node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
// //     });
// //     // });
// //   }, [ref]);

// //   return <div id="my_dataviz"></div>;
// // };

// // export default BubbleD3Chart;

// import React, { useRef, useEffect } from "react";
// import * as d3 from "d3";

// // Define the data types for the hierarchy
// interface DataNode {
//   name: string;
//   value: number;
// }

// interface HierarchyNode {
//   children: DataNode[];
// }

// interface CirclePackingCanvasProps {
//   data: HierarchyNode;
//   width?: number;
//   height?: number;
// }

// const CirclePackingCanvas: React.FC<CirclePackingCanvasProps> = ({
//   data,
//   width = 800,
//   height = 800,
// }) => {
//   const canvasRef = useRef<HTMLCanvasElement>(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const context = canvas.getContext("2d");
//     if (!context) return;

//     // Clear the canvas
//     context.clearRect(0, 0, width, height);

//     // Flatten the data
//     const flattenedData = data.children.map((d, i) => ({
//       ...d,
//       id: i, // Add an ID for keying purposes
//     }));

//     // Create a fake root node for layout calculation
//     const root = d3
//       .hierarchy({ children: flattenedData })
//       .sum((d: any) => d.value); // `d.value` is used to determine node size

//     // Apply packing layout
//     const pack: any = d3.pack().size([width, height]).padding(5);

//     pack(root);

//     // Draw each circle
//     root.children?.forEach((node) => {
//       const { x, y, value: r } = node;

//       // Draw the circle
//       context.beginPath();
//       context.arc(x!, y!, r!, 0, 2 * Math.PI);
//       context.fillStyle = d3.interpolateRainbow(Math.random());
//       context.fill();
//       context.lineWidth = 2;
//       context.strokeStyle = "#fff";
//       context.stroke();
//       context.closePath();

//       // Draw the text
//       context.fillStyle = "#fff";
//       context.font = `${Math.min(r / 3, 16)}px sans-serif`;
//       context.textAlign = "center";
//       context.textBaseline = "middle";
//       context.fillText(node.data.name, x, y);
//     });
//   }, [data, width, height]);

//   return (
//     <canvas
//       ref={canvasRef}
//       width={width}
//       height={height}
//       style={{
//         display: "block",
//         background: "#000",
//         margin: "0 auto",
//       }}
//     ></canvas>
//   );
// };

// export default CirclePackingCanvas;

import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { drawCircles } from "./drawCircles";
//import { Node } from "./data";
import { scaleSqrt, extent } from "d3";

const BUBBLE_MIN_SIZE = 4;
const BUBBLE_MAX_SIZE = 80;

export interface TreeLeaf {
  type: "leaf";
  name: string;
  group: string;
  value: number;
  imageUrl: string;
  percentChange: string;
}

type CirclePackingProps = {
  width: number;
  height: number;
  data: Tree;
};

export type TreeNode = {
  type: "node";
  // value: number;
  // name: string;
  children: Tree[];
};

export type Tree = TreeNode | TreeLeaf;
export const CirclePacking = ({ width, height, data }: CirclePackingProps) => {
  console.log("Data ", data);
  // The force simulation mutates nodes, so create a copy first
  // Node positions are initialized by d3
  // const nodes: Node[] = data.map((d) => ({ ...d }));

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const hierarchy = d3.hierarchy(data).sum((d) => d.value);

  const packGenerator = d3.pack<Tree>().size([width, height]).padding(25);
  const root = packGenerator(hierarchy);
  const svgRef = useRef();

  //const [min, max] = extent(nodes.map((d) => d.value)) as [number, number];
  // const sizeScale = scaleSqrt()
  //   .domain([min, max])
  //   .range([BUBBLE_MIN_SIZE, BUBBLE_MAX_SIZE]);

  // useEffect(() => {
  //   const hierarchy = d3
  //     .hierarchy(data)
  //     .sum((d) => d.value)
  //     .sort((a, b) => b.value! - a.value!);

  //   const packGenerator = d3.pack<Tree>().size([width, height]).padding(4);
  //   const root = packGenerator(hierarchy);
  //   // set dimension of the canvas element
  //   // const canvas = canvasRef.current;
  //   // const context = canvas?.getContext("2d");
  //   // if (!context) {
  //   //   return;
  //   // }

  //   // // run d3-force to find the position of nodes on the canvas
  //   // d3.forceSimulation(nodes as any)

  //   //   // list of forces we apply to get node positions
  //   //   .force(
  //   //     "collide",
  //   //     d3.forceCollide().radius((node: any) => node.value + 1)
  //   //   )
  //   //   //.force("charge", d3.forceManyBody().strength(80))
  //   //   .force("center", d3.forceCenter(width / 2, height / 2))
  //   //   .force("charge", d3.forceY(0).strength(0.05))

  //   //   // at each iteration of the simulation, draw the network diagra m with the new node positions
  //   //   .on("tick", () => {
  //   //     drawCircles(context, width, height, nodes, sizeScale);
  //   //   });
  // }, [width, height, nodes, sizeScale]);

  // useEffect(() => {
  //   const t = d3.transition().duration(750).ease(d3.easeLinear);

  //   d3.selectAll("circle")
  //     .attr("cx", (d) => d.x)
  //     .attr("cy", (d) => d.y)
  //     .transition(t);
  // }, [data]);

  return (
    <div>
      {/* <canvas
        ref={canvasRef}
        style={{
          width,
          height,
        }}
        width={width}
        height={height}
      /> */}

      <svg
        // ref={svgRef}
        id="bubbles"
        width={width}
        height={height}
        //  style={{ display: "inline-block" }}
      >
        {root
          .descendants()
          .slice(1)
          .map((node) => (
            <g className="groups">
              <circle
                key={node.data.name}
                cx={node.x}
                cy={node.y}
                r={node.r}
                stroke="#553C9A"
                strokeWidth={2}
                fill={node.data.group === "positive" ? "#00ff00" : "#FF0000"}
                fillOpacity={0.2}
              />
              <image
                href={node.data.imageUrl}
                // x="50%"
                // y="50%"
                x={node.x - 15} // Center horizontally
                y={node.y - 15} // Position in the upper half of the circle
                width={30}
                height={30}
                clipPath="circle(50%)" // Optional: Clip image to fit within a circle
              />

              {/* First Line of Text */}
              <text
                // y={node.data.value / 4} // Center text in the middle of the circle
                textAnchor="middle"
                fill="#fff"
                x={node.x}
                y={node.y + 30}
                fontSize="14px"
                fontWeight="bold"
              >
                {node.data.name}
              </text>

              {/* Second Line of Text */}
              <text
                x={node.x}
                y={node.y + 40} // Position below the first line
                textAnchor="middle"
                fill="#ddd"
                fontSize="12px"
              >
                {node.data.percentChange}%
              </text>
            </g>
          ))}
        {/* {root
          .descendants()
          .slice(1)
          .map((node) => {
            return (
              <>
                <text
                  key={node.data.name}
                  x={node.x}
                  y={node.y}
                  fontSize={13}
                  fontWeight={0.4}
                  textAnchor="middle"
                  alignmentBaseline="middle"
                >
                  {node.data.name}
                </text>
              </>
            );
          })}

        {root
          .descendants()
          .slice(1)
          .map((node) => {
            return (
              <>
                <text
                  key={node.data.percentChange}
                  x={node.x}
                  y={node.y}
                  fontSize={13}
                  fontWeight={0.4}
                  textAnchor="middle"
                  alignmentBaseline="middle"
                >
                  {node.data.percentChange}
                </text>
              </>
            );
          })} */}
      </svg>
    </div>
  );
};
