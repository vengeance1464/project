import React, { useCallback, useEffect, useRef, useState } from "react";
import { useCryptoStore } from "../hooks/useCryptoStore";
import { BubbleRenderer } from "./visualization/BubbleRenderer";
import { Container, Graphics } from "@pixi/react";
import { CryptoData } from "../types/CryptoTypes";
import Circle from "./Graphics/Circle";
import { Text } from "@pixi/react";
import { Sprite } from "@pixi/react";
import { useWindow } from "../hooks/useWindow";
import { useWebSocket } from "../hooks/useWebSocket";

type Props = {
  cryptoData: CryptoData[];
};

export const BubbleChart: React.FC<Props> = ({ cryptoData }) => {
  // const containerRef = useRef<HTMLDivElement>(null);
  // const rendererRef = useRef<BubbleRenderer | null>(null);
  // const { cryptoData, setSelectedCrypto } = useCryptoStore();
  const [circlesPositions, setCirclesPositions] = useState<any>([]);
  const { dimensions } = useWindow();

  const getPositionWithoutCollision = (
    circlesPositions: any,
    radius: Number
  ) => {
    let itemFound = false;
    let randomXPositon = Math.floor(dimensions.width * Math.random());
    let randomYPosition = Math.floor(dimensions.height * Math.random());

    while (!itemFound) {
      const anyElementColliding = circlesPositions.filter((element: any) => {
        const distance = Math.sqrt(
          Math.pow(element.x - randomXPositon, 2) +
            Math.pow(element.y - randomYPosition, 2)
        );

        if (distance <= radius + element.radius) {
          itemFound = true;
        }
      });

      if (anyElementColliding.length === 0) itemFound = true;

      randomXPositon = Math.floor(dimensions.width * Math.random());
      randomYPosition = Math.floor(dimensions.height * Math.random());
    }

    return { x: randomXPositon, y: randomYPosition, radius: radius };
  };

  useEffect(() => {
    let circlesPositionsCopy: any = [];
    for (let item of cryptoData) {
      const priceChange = item.percentChange;
      const radius = 10 + Math.abs(priceChange) * 2;

      const position = getPositionWithoutCollision(circlesPositions, radius);

      circlesPositionsCopy.push(position);
    }

    setCirclesPositions(circlesPositionsCopy);
  }, [cryptoData]);
  // const draw = (g: any) => {
  //   // g.clear();
  //   console.log("positions", circlesPositions);
  //   for (let i = 0; i < circlesPositions.length; i++) {
  //     g.beginFill(0xffff0b, 0.5);
  //     g.drawCircle(
  //       circlesPositions[i].x,
  //       circlesPositions[i].y,
  //       circlesPositions[i].radius
  //     );
  //     g.endFill();
  //   }
  // };

  // useEffect(() => {
  //   if (!containerRef.current) return;

  //   const width = 1200;
  //   const height = 800;

  //   rendererRef.current = new BubbleRenderer(width, height);
  //   containerRef.current.appendChild(rendererRef.current.getView());

  //   return () => {
  //     if (rendererRef.current) {
  //       rendererRef.current.destroy();
  //       rendererRef.current = null;
  //     }
  //   };
  // }, []);

  // useEffect(() => {
  //   if (rendererRef.current && cryptoData.length > 0) {
  //     rendererRef.current.updateBubbles(cryptoData, setSelectedCrypto);
  //   }
  // }, [cryptoData, setSelectedCrypto]);

  return (
    // <Container x={200} y={200}>
    // <Graphics draw={draw} />
    <>
      {circlesPositions.length > 0 &&
        circlesPositions.map((circle: any, index: number) => {
          return (
            <>
              <Circle position={circle} />
              <Text
                text={cryptoData[index].symbol}
                anchor={0.5} // Center the text
                x={circle.x}
                y={circle.y - 10} // Slightly above the image
                style={{
                  fontSize: 16,
                  fill: "white",
                  align: "center",
                }}
              />
              {/* Add Image */}
              <Sprite
                image={cryptoData[index].image}
                anchor={0.5} // Center the image
                x={circle.x}
                y={circle.y + 10} // Slightly below the text
                width={circle.radius * 0.8} // Scale the image to fit
                height={circle.radius * 0.8}
              />
            </>
          );
        })}
    </>
    // </Container>
  );
};
