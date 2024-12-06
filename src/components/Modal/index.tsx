import React, { useEffect, useState } from "react";
import AreaChart from "../AreaChart";

type ModalProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  currentToken: any;
};

const Modal: React.FC<ModalProps> = ({ isOpen, setIsOpen, currentToken }) => {
  const currency = "usd";
  const [historicalData, setHistoricalData] = useState<any>([]);
  const [percentChange, setPercentChange] = useState<any>();
  console.log("Current", currentToken);

  // useEffect(() => {
  //   if (!isOpen) {
  //     setHistoricalData([]);
  //   }
  // }, [isOpen]);

  useEffect(() => {
    async function getTimeSeriesData(symbol: string) {
      // console.log("Time series", symbol, process.env.REACT_APP_API_KEY);

      const apiKey = import.meta.env.VITE_API_KEY;

      const data = await fetch(
        `https://api.coingecko.com/api/v3/coins/${symbol}/market_chart?vs_currency=usd&days=365`
      ).then((res) => res.json());
      console.log("Data Historical", data, symbol);

      if (data && data.hasOwnProperty("prices")) {
        setHistoricalData(
          data.prices.map((element: any) => {
            return {
              date: new Date(element[0]),
              close: Number(element[1]),
            };
          })
        );
      }
    }
    if (currentToken) {
      console.log("cURRENT TOKEN", currentToken);
      getTimeSeriesData(currentToken.id);
    }
  }, [JSON.stringify(currentToken)]);

  console.log("Percent Change", percentChange);
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 w-full flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setIsOpen(false)} // Close modal when clicking outside
        >
          {/* Modal content */}
          <div
            className="relative bg-white rounded-lg shadow-lg  p-6 flex flex-col gap-1"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            <div className="flex items-center gap-1">
              <img src={currentToken.imageUrl} width={40} height={40} />
              <div className="flex flex-col  gap-1">
                <h2>
                  <strong>{currentToken.name}</strong>
                </h2>
                <div className="color-green">${currentToken.price}</div>
              </div>
            </div>
            <AreaChart prices={historicalData} />
            {/* <h2 className="text-xl font-semibold mb-4">Modal Title</h2>
            <p className="text-gray-600 mb-6">
              This is a modal content. You can add your custom content here.
            </p>
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 mr-2"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => setIsOpen(false)}
              >
                Confirm
              </button> */}
            {/* </div> */}
          </div>
        </div>
      )}
    </>
  );
};

export default Modal;
