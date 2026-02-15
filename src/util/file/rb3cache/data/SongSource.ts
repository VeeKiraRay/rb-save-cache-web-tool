const parseSource = ({
  songID,
  source,
  shortName,
  artist,
}: {
  songID?: number;
  source?: string;
  shortName?: string;
  artist?: string;
}) => {
  if (!source) return "";
  switch (source.toLowerCase()) {
    case "rb1":
      return shortName.toLowerCase().includes("ugc") &&
        !shortName.includes("##")
        ? "RBN1"
        : "RB1";
    case "acdc":
      return "AC/DC";
    case "rb2":
      return shortName.toLowerCase().includes("ugc") &&
        !shortName.includes("##")
        ? "RBN1"
        : "RB2";
    case "rb3":
      return "RB3";
    case "rb4":
      return "RB4";
    case "rb1_dlc":
      return shortName.toLowerCase().includes("_live") && artist == "AC/DC"
        ? "AC/DC"
        : "DLC";
    case "rb2_dlc":
    case "rb3_dlc":
    case "rb4_dlc":
      return "DLC";
    case "greenday":
    case "gdrb":
      return "GD:RB";
    case "blitz":
      return "Blitz";
    case "lego":
      return "Lego";
    case "ugc":
    case "rbn1":
      return "RBN1";
    case "custom":
      return "Custom";
    case "beatles":
    case "tbrb":
      return "TB:RB";
    case "rbn2":
      return "RBN2";
    case "ugc_plus":
      if (songID > 9999999) {
        return shortName.toLowerCase().includes("tbrb_") ? "TB:RB" : "Custom";
      } else {
        return "RBN2";
      }
    default:
      return "DLC";
  }
};

const SongSource = {
  parseSource,
};

export default SongSource;
