import React from "react";
type Props = {
  text: string;
  isActive: boolean;
  onClick: (e: any) => void;
};

const PillButton: React.FC<Props> = ({ text, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-white ${
        isActive ? "bg-green-500" : "bg-black"
      } border-2 border-green-500 rounded-full`}
    >
      {text}
    </button>
  );
};

export default PillButton;
