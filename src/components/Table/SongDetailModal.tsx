import type React from "react";
import type SongRowCombined from "@/types/file/SongRowCombined";
import LighterDisplay from "../LighterDisplay/LighterDisplay";

interface SongDetailModalProps {
  row: SongRowCombined;
  onClose: () => void;
}

const SongDetailModal = ({ row, onClose }: SongDetailModalProps) => {
  const ytQuery = encodeURIComponent(
    `${row.artist ?? ""} ${row.songName ?? ""}`.trim(),
  );

  return (
    <div className="rbscv-modal-backdrop" onClick={onClose}>
      <div
        className="rbscv-modal"
        style={{ maxWidth: "700px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rbscv-modal__header">
          <div>
            <div className="rbscv-modal__title">{row.songName}</div>
            <div>{row.artist}</div>
            <div>{row.songID}</div>
          </div>
          <button className="rbscv-modal__close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="rbscv-modal__body">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <colgroup>
              <col style={{ width: "1%", whiteSpace: "nowrap" }} />
              <col style={{ width: "49%" }} />
              <col style={{ width: "1%", whiteSpace: "nowrap" }} />
              <col style={{ width: "49%" }} />
            </colgroup>
            <tbody className="rbscv-sdm__table-body">
              <tr>
                <td className="rbscv-sdm__label">Album:</td>
                <td className="rbscv-sdm__value">{row.albumName}</td>
                <td className="rbscv-sdm__label">Year:</td>
                <td className="rbscv-sdm__value">{row.yearReleased}</td>
              </tr>
              <tr>
                <td className="rbscv-sdm__label">Genre:</td>
                <td className="rbscv-sdm__value">{row.genre}</td>
                <td className="rbscv-sdm__label">Rating:</td>
                <td className="rbscv-sdm__value">{row.rating}</td>
              </tr>
              <tr>
                <td className="rbscv-sdm__label">Source:</td>
                <td className="rbscv-sdm__value">{row.source}</td>
                <td className="rbscv-sdm__label">Length:</td>
                <td className="rbscv-sdm__value">{row.songLength}</td>
              </tr>
              <tr>
                <td className="rbscv-sdm__label">Play #:</td>
                <td className="rbscv-sdm__value">{row.playCount}</td>
                <td className="rbscv-sdm__label">Review:</td>
                <td className="rbscv-sdm__value">
                  <LighterDisplay value={row.lighterRating} />
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{ marginTop: "16px", display: "flex", gap: "8px" }}>
            <a
              href={`https://www.youtube.com/results?search_query=${ytQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rbscv-btn"
            >
              Search on YouTube ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SongDetailModal;
