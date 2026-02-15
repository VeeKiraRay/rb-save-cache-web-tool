import Star from "./Star";

interface StarsDisplayProps {
  value: number;
  max?: number;
}

const StarsDisplay = ({ value, max = 5 }: StarsDisplayProps) => {
  const num = Number(value) || 0;
  const full = Math.floor(num);
  const highlight = full > max;
  return (
    <span className="sv-stars-display">
      {Array.from({ length: max }, (_, i) => (
        <Star key={i} filled={i < full} highlight={highlight} />
      ))}
    </span>
  );
};

export default StarsDisplay;
