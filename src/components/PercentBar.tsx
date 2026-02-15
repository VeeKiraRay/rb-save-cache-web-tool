const PercentBar = ({ value }) => {
  const pct = Math.min(Math.max(Number(value) || 0, 0), 100);
  const level = pct > 80 ? "high" : pct > 50 ? "mid" : "low";
  return (
    <span className="sv-percent-bar">
      <span className="sv-percent-bar__track">
        <span
          className={`sv-percent-bar__fill sv-percent-bar__fill--${level}`}
          style={{ width: `${pct}%` }}
        />
      </span>
      <span className="sv-percent-bar__label">{pct}%</span>
    </span>
  );
};

export default PercentBar;
