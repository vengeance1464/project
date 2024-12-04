import React, { useEffect, useRef, useState } from "react";
import { BubbleChart } from "./components/BubbleChart";
import { getCryptoData } from "./services/cryptoApi";
import { useCryptoStore } from "./hooks/useCryptoStore";
import { useWebSocket } from "./hooks/useWebSocket";
import { Coins } from "lucide-react";
import { Stage } from "@pixi/react";
import { CryptoData } from "./types/CryptoTypes";
import { useWindow } from "./hooks/useWindow";
import { CirclePacking } from "./components/BubbleD3Chart";
import Header from "./components/Header";

function App() {
  //const { setCryptoData } = useCryptoStore();

  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const coinMetaData = useRef<any>({});

  // symbol: string;
  // price: number;
  // percentChange: number;
  // marketCap: number;
  // volume: number;
  // image:string;

  const { dimensions } = useWindow();
  const lastUpdatedTime = useRef<number | null>(null);
  useWebSocket(
    "wss://stream.binance.com:9443/ws/!ticker@arr",
    (data: any) => {
      // Filter USDT pairs and merge with metadata
      console.log("dATA", data);
      const usdtPrices = data
        .filter(
          (ticker: any) =>
            ticker.s.endsWith("USDT") &&
            coinMetaData.current.hasOwnProperty(ticker.s)
        ) // Only USDT pairs
        .map((ticker: any) => ({
          price: parseFloat(ticker.c).toFixed(2),
          // Current price
          percentChange: parseFloat(ticker.P).toFixed(2),

          ...coinMetaData.current[ticker.s], // Merge metadata
        }));
      // Ensure the coin exists in metadata

      console.log("usdt", usdtPrices);

      const currentTime = Date.now();

      if (
        lastUpdatedTime.current === null ||
        currentTime - lastUpdatedTime.current >= 10 * 1000
      ) {
        // requestAnimationFrame()
        setCryptoData(usdtPrices);
        lastUpdatedTime.current = currentTime;
      }
      //   setCryptoData(usdtPrices);
    },
    async () => {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false"
      );
      const data = await response.json();

      const coinMap = data.reduce((map: any, coin: any) => {
        map[coin.symbol.toUpperCase() + "USDT"] = {
          symbol: coin.symbol.toUpperCase(),
          //name: coin.name,
          image: coin.image,
          marketCap: coin.market_cap,
          volume: coin.total_volume,
        };
        return map;
      }, {});
      console.log("coin map", coinMap);
      coinMetaData.current = coinMap;
    }
  );

  // Update dimensions on resize
  // useEffect(() => {
  //   const handleResize = () => {
  //     setDimensions({
  //       width: window.innerWidth,
  //       height: window.innerHeight,
  //     });
  //   };

  //   window.addEventListener("resize", handleResize);
  //   return () => window.removeEventListener("resize", handleResize);
  // }, []);
  // useWebSocket();

  // useEffect(() => {
  //   const fetchInitialData = async () => {
  //     const data = await getCryptoData();
  //     setCryptoData(data);
  //   };

  //   fetchInitialData();
  // }, [setCryptoData]);

  function computeRadius(
    value: number,
    minValue = 0,
    maxValue = 100,
    rMin = 10,
    rMax = 100
  ): number {
    return rMin + (value - minValue) * 6;
  }

  function calculateRadius(
    priceChange: any,
    minRadius = 20,
    maxRadius = 120,
    maxChange = 100
  ) {
    // Ensure priceChange is an absolute value
    const absChange = Math.abs(priceChange);

    // Normalize the change
    const normalizedChange = Math.min(absChange, maxChange) / maxChange;

    // Map to radius range
    const radius = minRadius + normalizedChange * (maxRadius - minRadius) * 6;

    return radius;
  }

  return (
    <div className="w-screen h-screen bg-[#000]">
      <Header />
      {/* <Stage
        // className="w-full h-full"
        width={dimensions.width}
        height={dimensions.height}
        options={{ background: 0x1099bb }}
      > */}
      {/* <header className="p-4 bg-gray-800">
        <div className="container mx-auto flex items-center gap-2">
          <Coins className="w-8 h-8" />
          <h1 className="text-2xl font-bold">Crypto Bubble Chart</h1>
        </div>
      </header> */}

      {/* <BubbleChart cryptoData={cryptoData} /> */}
      <CirclePacking
        width={dimensions.width}
        height={dimensions.height}
        data={{
          type: "node",
          children: cryptoData.map((element) => {
            return {
              name: element.symbol,
              value: computeRadius(
                parseFloat(Math.abs(element.percentChange).toString())
              ),
              group:
                parseFloat(element.percentChange) >= 0
                  ? "positive"
                  : "negative",
              imageUrl: element.image,
              percentChange: element.percentChange,
              type: "leaf",
            };
          }),
        }}
      />
      {/* </Stage> */}
    </div>
  );
}

export default App;
