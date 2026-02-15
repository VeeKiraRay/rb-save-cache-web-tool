const DIFFICULTY_LABELS = ["Easy", "Medium", "Hard", "Expert"];

interface DifficultyBadgeProps {
  value: number;
}

const DifficultyBadge = ({ value }: DifficultyBadgeProps) => {
  const idx = Math.min(Math.max(Number(value) || 0, 0), 4);
  return (
    <span className={`sv-difficulty sv-difficulty--${idx}`}>
      {DIFFICULTY_LABELS[idx]}
    </span>
  );
};

export default DifficultyBadge;
