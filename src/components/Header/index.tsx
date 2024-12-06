import React, { useState } from "react";
import PillButton from "../PillButton";
import BubblesLogo from "../../assets/logo";
import useIsMobile from "../../hooks/useIsMobile";

type Props = {
  onPillClick: any;
  pills: any;
  activeIndex: number;
};
const Header: React.FC<Props> = ({ pills, onPillClick, activeIndex }) => {
  //const pills = ["Hour", "Today", "Week", "Month", "Year"];
  // const [activeIndex, setActiveIndex] = useState(1);
  const isMobile = useIsMobile();
  return (
    <div
      className={`fixed ${
        isMobile
          ? "flex justify-center items-center"
          : "flex justify-between items-center"
      }  top-0 w-screen h-[50px]`}
    >
      <div className={`${isMobile ? "mt-2" : "mt-5"} flex items-center`}>
        <BubblesLogo />
        {!isMobile && (
          <h1 className="text-white text-[24px]">CRYPTO BUBBLES</h1>
        )}
      </div>

      <div className="flex gap-1">
        {pills.map((pill: any, index: number) => {
          return (
            <PillButton
              onClick={(e) => {
                onPillClick(index);
              }}
              text={pill.title}
              isActive={activeIndex === index}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Header;
