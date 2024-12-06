import { useEffect, useState } from "react";
enum Status{

  NOT_STARTED=0,
  START=1,
  STOP=2
}
export const  useWebSocket = (
  endpoint: string,
  actionFn: any = null,
  onErrorFn: any = null,
  onBefore: any = null
) => {
  const [stopConnection, setStopConnection] = useState(Status.NOT_STARTED);
  const [wsInstance, setWsInstance] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (stopConnection===Status.STOP) {
      if (wsInstance) {
        console.log("Manually stopping WebSocket connection...");
        wsInstance.close();
      }
      return;
    }

    if(stopConnection===Status.START)
    {

    if (onBefore !== null) {
      onBefore();
    }

    const ws = new WebSocket(endpoint);
    setWsInstance(ws);

    ws.onopen = () => {
      console.log("WebSocket connection established.");
    };

    ws.onmessage = (event) => {
      if (actionFn) {
        console.log("WebSocket Message Received:", event);
        actionFn(JSON.parse(event.data));
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket Error:", error);
      if (onErrorFn) {
        onErrorFn(error);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed.");
    };
  

    // Cleanup WebSocket when the component unmounts
    return () => {
      console.log("Cleaning up WebSocket connection...");
      ws.close();
    };
  }
  }, [stopConnection, endpoint]); // Rerun if `stopConnection` or `endpoint` changes

  // Function to toggle stopping the connection
  const stopWebSocket = () => 
    {
      if(stopConnection===Status.START)
      setStopConnection(Status.STOP)
    
    }
  const startWebSocket = () => {

    if(stopConnection===Status.NOT_STARTED||stopConnection===Status.STOP)
    setStopConnection(Status.START)
  };

  return { stopWebSocket, startWebSocket };
};
