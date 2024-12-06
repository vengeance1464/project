import { scaleOrdinal, ScalePower } from 'd3';

const COLORS = [
  '#00ff00',
  '#FF0000',
];


export interface Node extends d3.SimulationNodeDatum {
    id: string;
    group: string;
    value: number;
    imageUrl:string;

  }
export const drawCircles = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  nodes: Node[],
  sizeScale: ScalePower<number, number, never>,

) => {
  // Color Scale
  const allGroups = [...new Set(nodes.map((d) => d.group))];
  const colorScale = scaleOrdinal<string>().domain(allGroups).range(COLORS);

  context.clearRect(0, 0, width, height);


  // Draw the nodes
  nodes.forEach((node) => {
    if (!node.x || !node.y) {
      return;
    }
    const imageSize=node.value*0.5
    context.beginPath();
    context.moveTo(node.x + 12, node.y);
    context.arc(node.x, node.y, node.value, 0, 2 * Math.PI);
    context.fillStyle = node.group==="positive"?COLORS[0]:COLORS[1];
    context.fill();
    const image = new Image();
    image.src = node.imageUrl;
    image.onload = () => {
      const imageX = node.x! - imageSize / 2; // Center the image horizontally
      const imageY = node.y! - imageSize * 0.8; // Position the image above the text
      context.drawImage(image, imageX, imageY, imageSize, imageSize);

      // Draw the text inside the circle
      context.font = `14px Arial`;
      context.fillStyle = "#ffffff"; // White text color
      context.textAlign = "center";
      context.fillText(node.id, node.x!, node.y! + node.value * 0.5); // Position text below the imagent
      //context.fillText(node.i)
    };
  });
};

