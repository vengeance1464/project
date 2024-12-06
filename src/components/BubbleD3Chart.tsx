import * as d3 from "d3";
import { useEffect, useState } from "react";
import Modal from "./Modal";
import useIsMobile from "../hooks/useIsMobile";

export interface TreeLeaf {
  type: "leaf";
  name: string;
  group: string;
  value: number;
  imageUrl: string;
  percentChange: string;
  price: number;
}

type CirclePackingProps = {
  width: number;
  height: number;
  data: Tree;
};

export type TreeNode = {
  type: "node";
  children: Tree[];
};

export type Tree = TreeNode | TreeLeaf;
export const CirclePacking = ({ width, height, data }: CirclePackingProps) => {
  const [currentPair, setCurrentPair] = useState<any>();

  const hierarchy = d3.hierarchy(data).sum((d) => d.value);

  const packGenerator = d3.pack<Tree>().size([width, height]).padding(20);
  const root = packGenerator(hierarchy);
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (currentPair && currentPair.hasOwnProperty("id")) {
      const index = data.children.findIndex(
        (element: any) => element.id === currentPair.id
      );
      console.log("index", index);

      if (index !== -1) setCurrentPair(data.children[index]);
    }
  }, [JSON.stringify(data)]);

  return (
    <div>
      <svg id="bubbles" width={width} height={height}>
        {root
          .descendants()
          .slice(1)
          .map((node, index) => (
            <g
              onClick={() => {
                setIsOpen(true);
                setCurrentPair(node.data);
              }}
              className="groups"
            >
              <circle
                key={node.data.name}
                cx={node.x}
                cy={node.y}
                r={node.r}
                stroke="#553C9A"
                strokeWidth={2}
                fill={node.data.group === "positive" ? "#4CAF50" : "#ef4444"}
              />
              <image
                href={node.data.imageUrl}
                x={!isMobile ? node.x - 15 : node.x - 7.5} // Center horizontally
                y={!isMobile ? node.y - 25 : node.y - 12.5} // Position in the upper half of the circle
                width={!isMobile ? 30 : 15}
                height={!isMobile ? 30 : 15}
                clipPath="circle(50%)" // Optional: Clip image to fit within a circle
              />

              <text
                textAnchor="middle"
                fill="#fff"
                x={node.x}
                y={!isMobile ? node.y + 15 : node.y + 7.5}
                fontSize={isMobile ? "8px" : "14px"}
                fontWeight="bold"
              >
                {node.data.name}
              </text>

              {/* Second Line of Text */}
              <text
                x={node.x}
                y={!isMobile ? node.y + 25 : node.y + 17.5} // Position below the first line
                textAnchor="middle"
                fill="#ddd"
                fontSize={!isMobile ? "12px" : "8px"}
              >
                {node.data.percentChange}%
              </text>
            </g>
          ))}
      </svg>
      <Modal currentToken={currentPair} isOpen={isOpen} setIsOpen={setIsOpen} />
    </div>
  );
};
