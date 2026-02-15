interface StarProps {
  filled: boolean;
  highlight: boolean;
}

const Star = ({ filled, highlight }: StarProps) => {
  const fillColor = getFillColor({ filled, highlight });
  const strokeColor = filled ? fillColor : "--star-empty-fill";
  return (
    <svg
      className={`star ${highlight ? "glow" : ""}`}
      width="16"
      height="16"
      viewBox="0 0 24 24"
    >
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={`var(${fillColor}`}
        stroke={`var(${strokeColor})`}
        strokeWidth="1"
      />
    </svg>
  );
};

const getFillColor = ({ filled, highlight }: StarProps) => {
  if (highlight) {
    return "--star-gold-fill";
  } else if (filled) {
    return "--star-default-fill";
  } else {
    return "--star-empty-fill";
  }
};

export default Star;
