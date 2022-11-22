import { MouseEventHandler } from "react";

type Props = {
  className?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
};

const MinusIcon = ({ className, onClick }: Props) => (
  <div className={className} onClick={onClick}>
    <svg
      version="1.1"
      width="36"
      viewBox="0 0 36 36"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <title>minus-circle-line</title>
      <path
        d="M18,2A16,16,0,1,0,34,18,16,16,0,0,0,18,2Zm0,30A14,14,0,1,1,32,18,14,14,0,0,1,18,32Z"
        className="clr-i-outline clr-i-outline-path-1"
      ></path>
      <path
        d="M24,17H12a1,1,0,0,0,0,2H24a1,1,0,0,0,0-2Z"
        className="clr-i-outline clr-i-outline-path-2"
      ></path>
      <rect x="0" y="0" width="36" height="36" fillOpacity="0" />
    </svg>
  </div>
);

export default MinusIcon;