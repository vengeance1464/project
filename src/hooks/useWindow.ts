import { useEffect, useState } from "react";


export const useWindow=()=>{
    const [dimensions, setDimensions] = useState<{width:number,height:number}>({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    
      // Update dimensions on resize
      useEffect(() => {
        const handleResize = () => {
          setDimensions({
            width: window.innerWidth,
            height: window.innerHeight,
          });
        };
    
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
      }, []);

      return {dimensions}

}