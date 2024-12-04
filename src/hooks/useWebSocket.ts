import { useEffect, useCallback } from 'react';
import { WebSocketService } from '../services/webSocketService';
import { useCryptoStore } from './useCryptoStore';
import { ProcessedTickerData } from '../types/WebSocketTypes';

export const useWebSocket = (endpoint:string,actionFn:any=null,onErrorFn:any=null,onBefore:any=null) => {
useEffect(()=>{


  if(onBefore!==null)
  {
    onBefore()
  }
  
  const ws = new WebSocket(endpoint);

 

  ws.onmessage = (event) => {

    if(actionFn)
    {
      console.log("here",event)
      actionFn(JSON.parse(event.data))
    }
    // const data = JSON.parse(event.data);

    // console.log("data",data)
    // Sort tokens by market cap (24h volume as a proxy) and get the top 100
    // const topTokens = data
    //   .sort((a, b) => parseFloat(b.q) - parseFloat(a.q)) // Sort by 24h quote volume
    //   .slice(0, 100); // Get top 100 tokens

  
    // Display top tokens
    // data.forEach((token:any) => {
    //   const { s: symbol, c: price } = token; // `s` is symbol, `c` is current price

    //   const tokenDiv = document.createElement("div");
    //   tokenDiv.className = "token";
    //   tokenDiv.innerHTML = `<strong>${symbol}:</strong> $${parseFloat(price).toFixed(2)}`;
    //   pricesDiv.appendChild(tokenDiv);
    // });
  };

  ws.onerror = (error) => {
    console.error("WebSocket Error:", error);
    if(onErrorFn)
    {
      onErrorFn(error)
    }
  };

  ws.onclose = () => {
    console.log("WebSocket connection closed.");
  };

  return () => {
    console.log("Cleaning up WebSocket connection...");
    ws.close();
  };


},[])
};