import { useEffect, useRef, useState } from "react";

interface SlidingPillOption {
  label: string;
  value: string;
}

interface SlidingPillSelector {
  options: SlidingPillOption[];
  value: string;
  onChange: (newMode: string) => void;
}

const SlidingPillSelector = ({
  options = [],
  value,
  onChange,
}: SlidingPillSelector) => {
  const wrapRef = useRef(null);
  const btnRefs = useRef([]);
  const [thumb, setThumb] = useState({ left: 0, width: 0 });
  const [ready, setReady] = useState(false);

  const activeIndex = options.findIndex((o) => o.value === value);

  // Recalculate thumb position when selection or size changes
  useEffect(() => {
    const btn = btnRefs.current[activeIndex];
    const wrap = wrapRef.current;
    if (!btn || !wrap) return;
    const wr = wrap.getBoundingClientRect();
    const br = btn.getBoundingClientRect();
    setThumb({ left: br.left - wr.left, width: br.width });
    setReady(true);
  }, [activeIndex]);

  // Keep thumb in sync when the wrapper is resized
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      const btn = btnRefs.current[activeIndex];
      const wrap = wrapRef.current;
      if (!btn || !wrap) return;
      const wr = wrap.getBoundingClientRect();
      const br = btn.getBoundingClientRect();
      setThumb({ left: br.left - wr.left, width: br.width });
    });
    if (wrapRef.current) observer.observe(wrapRef.current);
    return () => observer.disconnect();
  }, [activeIndex]);

  return (
    <div ref={wrapRef} className={cx("rbscv-seg", `rbscv-seg--md`)}>
      {/* Sliding thumb — position via inline style, visibility via className */}
      <div
        className={cx("rbscv-seg__thumb", ready && "rbscv-seg__thumb--ready")}
        style={{ left: thumb.left, width: thumb.width }}
      />

      {options.map((opt, i) => {
        const isActive = opt.value === value;

        return (
          <button
            key={opt.value}
            ref={(el) => {
              btnRefs.current[i] = el;
            }}
            onClick={() => onChange?.(opt.value)}
            className={cx(
              "rbscv-seg__btn",
              isActive && "rbscv-seg__btn--active",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};
export default SlidingPillSelector;

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}
