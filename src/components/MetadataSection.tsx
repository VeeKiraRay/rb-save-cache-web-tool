import type ResultMetadata from "@/types/file/ResultMetadata";

interface MetadataSectionProps {
  resultMetadata: ResultMetadata;
}

const MetadataSection = ({ resultMetadata }: MetadataSectionProps) => {
  if (!resultMetadata) {
    return null;
  }
  return (
    <section className="rbscv-meta-bar">
      {resultMetadata.files.map((f) => (
        <>
          <div key={`${f.name}-${f.rowCount}`} className="rbscv-meta-item">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--rbscv-text-dim)"
              strokeWidth="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span className="rbscv-meta-item__label">{f.name}</span>
            <span className="rbscv-meta-item__label">·</span>
            <span className="rbscv-meta-item__label">
              {(f.size / 1024).toFixed(1)} KB
            </span>
            <span className="rbscv-meta-item__label">·</span>
            <span className="rbscv-meta-item__label">{f.rowCount} rows</span>
          </div>
          <div>
            {f.error && (
              <>
                <span className="rbscv-meta-item__label-error">{f.error}</span>
              </>
            )}
          </div>
        </>
      ))}
    </section>
  );
};

export default MetadataSection;
