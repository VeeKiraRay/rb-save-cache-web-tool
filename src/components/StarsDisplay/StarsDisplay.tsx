import Star from "./Star";

const MAX = 5;

// Indices 0–5: normal stars. Index 6: all gold (highlight).
const DISPLAYS = Array.from({ length: MAX + 2 }, (_, value) => {
  const highlight = value > MAX;
  const full = Math.min(value, MAX);
  return (
    <span className="sv-stars-display">
      {Array.from({ length: MAX }, (_, i) => (
        <Star key={i} filled={i < full} highlight={highlight} />
      ))}
    </span>
  );
});

interface StarsDisplayProps {
  value: number;
}

const StarsDisplay = ({ value }: StarsDisplayProps) => {
  const idx = Math.min(Math.max(Math.floor(Number(value) || 0), 0), MAX + 1);
  return DISPLAYS[idx];
};

export default StarsDisplay;
