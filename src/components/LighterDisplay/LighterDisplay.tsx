import lighterOn from "@/assets/lighter_on_sc.svg";
import lighterOff from "@/assets/lighter_off_sc.svg";

const MAX = 5;
const cls = "rbscv-svg__icon-large";

const DISPLAYS = Array.from({ length: MAX + 1 }, (_, full) => (
  <span className="sv-stars-display">
    {Array.from({ length: MAX }, (_, i) => (
      <img key={i} src={i < full ? lighterOn : lighterOff} className={cls} />
    ))}
  </span>
));

interface LighterDisplayProps {
  value: number;
}

const LighterDisplay = ({ value }: LighterDisplayProps) => {
  const full = Math.min(Math.max(Math.floor(Number(value) || 0), 0), MAX);
  return DISPLAYS[full];
};

export default LighterDisplay;
