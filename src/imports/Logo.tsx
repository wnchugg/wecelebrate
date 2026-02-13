import svgPaths from "./svg-jdirszq3qi";

function Logomark() {
  return (
    <div className="absolute h-[30px] left-0 top-0 w-[27px]" data-name="logomark">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27 30">
        <g clipPath="url(#clip0_4_320)" id="logomark">
          <g id="Union">
            <path d={svgPaths.p1d83b410} fill="var(--fill-0, #C4008B)" />
            <path d={svgPaths.pc72980} fill="var(--fill-0, #C4008B)" />
          </g>
        </g>
        <defs>
          <clipPath id="clip0_4_320">
            <rect fill="white" height="30" width="27" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Logotype() {
  return (
    <div className="absolute h-[20.25px] right-[-0.5px] top-[4.88px] w-[70.5px]" data-name="logotype">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 70.5 20.25">
        <g id="logotype">
          <g id="Union">
            <path clipRule="evenodd" d={svgPaths.p1c537600} fill="var(--fill-0, #00146A)" fillRule="evenodd" />
            <path d={svgPaths.p33b6f000} fill="var(--fill-0, #00146A)" />
            <path d={svgPaths.p3dd08080} fill="var(--fill-0, #00146A)" />
            <path clipRule="evenodd" d={svgPaths.p11694f00} fill="var(--fill-0, #00146A)" fillRule="evenodd" />
          </g>
        </g>
      </svg>
    </div>
  );
}

export default function Logo() {
  return (
    <div className="relative size-full" data-name="logo">
      <Logomark />
      <Logotype />
    </div>
  );
}