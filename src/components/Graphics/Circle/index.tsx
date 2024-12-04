import { Graphics, useTick } from "@pixi/react";
import React from "react";

type Position = {
  position: { radius: number; x: number; y: number };
  updatePosition: any;
};

const Circle: React.FC<Position> = ({ position, updatePosition }) => {
  console.log("Position", position);

  useTick(() => {
    updatePosition(); // Update circle position on every frame
  });
  const draw = (g: any) => {
    // g.clear();
    g.beginFill(0xffff0b, 0.5);
    g.drawCircle(position.x, position.y, position.radius);
    g.endFill();
  };

  return <Graphics draw={draw} />;
};

export default Circle;
