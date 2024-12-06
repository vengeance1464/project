import { useCallback, useEffect, useRef, useState } from "react";
import { useWebSocket } from "./hooks/useWebSocket";
import { CryptoData } from "./types/CryptoTypes";
import { useWindow } from "./hooks/useWindow";
import { CirclePacking } from "./components/BubbleD3Chart";
import Header from "./components/Header";

function App() {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const coinMarketDataTimer = useRef<any>(null);
  const coinMetaData = useRef<any>({});
  const pills = useRef([
    { title: "Hour", ticker: "1h" },
    { title: "Today", ticker: "" },
    { title: "Week", ticker: "1w" },
    { title: "Year", ticker: "1Y" },
  ]);
  const [activeIndex, setActiveIndex] = useState(1);

  const onPillClick = (index: number) => {
    setActiveIndex(index);
  };

  const { dimensions } = useWindow();
  const lastUpdatedTime = useRef<number | null>(null);
  const { startWebSocket: startTodaySocket, stopWebSocket: stopTodaySocket } =
    useWebSocket(
      "wss://stream.binance.com:9443/ws/!ticker@arr",
      (data: any) => {
        // Filter USDT pairs and merge with metadata
        const usdtPrices = data
          .filter(
            (ticker: any) =>
              ticker.s.endsWith("USDT") &&
              coinMetaData.current.hasOwnProperty(ticker.s)
          ) // Only USDT pairs
          .map((ticker: any) => ({
            price: parseFloat(ticker.c).toFixed(6),
            // Current price
            percentChange: parseFloat(ticker.P).toFixed(2),

            ...coinMetaData.current[ticker.s], // Merge metadata
          }));
        // Ensure the coin exists in metadata

        const currentTime = Date.now();

        if (
          lastUpdatedTime.current === null ||
          currentTime - lastUpdatedTime.current >= 2 * 1000
        ) {
          setCryptoData(usdtPrices);
          lastUpdatedTime.current = currentTime;
        }
      },
      null,
      async () => {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false"
        );
        const data = await response.json();

        const coinMap = data.reduce((map: any, coin: any) => {
          console.log("Coin", coin);
          map[coin.symbol.toUpperCase() + "USDT"] = {
            symbol: coin.symbol.toUpperCase(),
            name: coin.id,
            image: coin.image,
            marketCap: coin.market_cap,
            volume: coin.total_volume,
          };
          return map;
        }, {});
        coinMetaData.current = coinMap;
      }
    );

  const streams = `${Object.keys(coinMetaData.current)
    .map((element) =>
      `${element}@ticker_${pills.current[activeIndex].ticker}`.toLowerCase()
    )
    .join("/")}`;

  const getLargeIntervalData = useCallback(
    async (tokenIds: string[], interval: string, currency = "usd") => {
      try {
        const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&ids=${tokenIds.join(
          ","
        )}&price_change_percentage=${interval}`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Failed to fetch data from CoinGecko.");
        }

        const data = await response.json();
        console.log("large interval", data);

        const dataDuplicate: any = [];
        console.log("duplicate", cryptoData);
        // Format the result for better readability
        data.forEach((element: any) => {
          console.log("Element", element);
          const pair = `${element.symbol}usdt`.toUpperCase();
          console.log("pair", pair);
          const value = {
            ...coinMetaData.current[pair],
            percentChange: parseFloat(
              element[`price_change_percentage_${interval}_in_currency`]
            ).toFixed(2),
          };
          dataDuplicate.push(value);
        });

        setCryptoData(dataDuplicate);

        // return results;
      } catch (error) {
        console.error("Error fetching percentage changes:", error);
        //return [];
      }
    },
    []
  );

  const { startWebSocket: startHourlySocket, stopWebSocket: stopHourlySocket } =
    useWebSocket(`wss://stream.binance.com:9443/ws/${streams}`, (data: any) => {
      // Filter USDT pairs and merge with metadata

      const itemIndex = cryptoData.findIndex(
        (element: CryptoData) => `${element.symbol}USDT` === data.s
      );

      if (itemIndex !== -1) {
        const currentTime = Date.now();
        const dataDuplicate = [...cryptoData];
        dataDuplicate[itemIndex].percentChange = parseFloat(data.P);
        dataDuplicate[itemIndex].price = Number(parseFloat(data.c).toFixed(6));
        setCryptoData(dataDuplicate);
        lastUpdatedTime.current = currentTime;
        //}
      }
    });

  useEffect(() => {
    switch (activeIndex) {
      case 1: {
        if (coinMarketDataTimer.current !== null) {
          clearInterval(coinMarketDataTimer.current);
          coinMarketDataTimer.current = null;
        }
        lastUpdatedTime.current = null;
        startTodaySocket();
        stopHourlySocket();
        break;
      }

      case 0: {
        if (coinMarketDataTimer.current !== null) {
          clearInterval(coinMarketDataTimer.current);
          coinMarketDataTimer.current = null;
        }
        lastUpdatedTime.current = null;
        stopTodaySocket();
        startHourlySocket();
        break;
      }

      case 2: {
        console.log("Metadata", coinMetaData.current);
        lastUpdatedTime.current = null;
        if (coinMarketDataTimer.current !== null) {
          clearInterval(coinMarketDataTimer.current);
          coinMarketDataTimer.current = null;
        }
        stopTodaySocket();
        stopHourlySocket();
        coinMarketDataTimer.current = setInterval(() => {
          getLargeIntervalData(
            Object.values(coinMetaData.current).map((element) => element.name),
            "7d"
          );
        }, 5 * 1000);

        break;
      }

      case 3: {
        console.log("Metadata", coinMetaData.current);
        lastUpdatedTime.current = null;
        if (coinMarketDataTimer.current !== null) {
          clearInterval(coinMarketDataTimer.current);
          coinMarketDataTimer.current = null;
        }
        stopTodaySocket();
        stopHourlySocket();
        coinMarketDataTimer.current = setInterval(() => {
          getLargeIntervalData(
            Object.values(coinMetaData.current).map((element) => element.name),
            "1y"
          );
        });
        break;
      }
    }
  }, [activeIndex]);

  function computeRadius(
    value: number,
    minValue = 0,
    maxValue = 100,
    rMin = 20,
    rMax = 100
  ): number {
    return rMin + (value - minValue) * 6;
  }

  return (
    <>
      <Header
        activeIndex={activeIndex}
        pills={pills.current}
        onPillClick={onPillClick}
      />

      <CirclePacking
        width={dimensions.width}
        height={dimensions.height}
        data={{
          type: "node",
          children: cryptoData.map((element) => {
            return {
              name: element.symbol,
              id: element.name,
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
              price: element.price,
            };
          }),
        }}
      />
    </>
  );
}

export default App;
