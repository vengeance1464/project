const BubblesLogo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="60"
    height="60"
    viewBox="0 0 200 200"
  >
    <circle cx="100" cy="100" r="90" fill="url(#greenGradient)" />

    <circle cx="130" cy="70" r="25" fill="rgba(255, 255, 255, 0.5)" />

    <ellipse cx="100" cy="170" rx="60" ry="20" fill="rgba(0, 0, 0, 0.2)" />

    <text
      x="100"
      y="115"
      text-anchor="middle"
      font-family="Arial, Helvetica, sans-serif"
      font-size="80"
      font-weight="bold"
      fill="#FFFFFF"
    >
      B
    </text>

    <defs>
      <radialGradient id="greenGradient" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#32CD32" />
        <stop offset="100%" stop-color="#228B22" />
      </radialGradient>
    </defs>
  </svg>
);

export default BubblesLogo;
