import type { Groups } from "@/types/ColumnDefinition";
import type ColumnDefinition from "@/types/ColumnDefinition";
import Helper from "@/util/Helper";

const INITIAL_SIZE = {
  LONG: 300,
  MEDIUM: 160,
  SHORT: 120,
  SHORTEST: 80,
};

const general: ColumnDefinition[] = [
  {
    key: "rowNumber",
    label: "#",
    group: "General",
    size: INITIAL_SIZE.SHORTEST,
    render: "rowCount",
  },
  {
    key: "songID",
    label: "Song ID",
    group: "General",
    size: INITIAL_SIZE.MEDIUM,
  },
  {
    key: "artist",
    label: "Artist",
    group: "General",
    size: INITIAL_SIZE.LONG,
    isFiltrable: true,
    filterType: "alphaGroup",
  },
  {
    key: "songName",
    label: "Song name",
    group: "General",
    size: INITIAL_SIZE.LONG,
    isFiltrable: true,
    filterType: "alphaGroup",
  },
  {
    key: "lighterRating",
    label: "Review",
    group: "General",
    size: INITIAL_SIZE.SHORT,
    render: "stars",
    isFiltrable: true,
  },
  {
    key: "playCount",
    label: "Play Count",
    group: "General",
    size: INITIAL_SIZE.SHORT,
    isFiltrable: true,
    filterType: "presence",
  },
  {
    key: "gameVersion",
    label: "Game version",
    group: "General",
    size: INITIAL_SIZE.SHORT,
    isFiltrable: true,
  },
  {
    key: "source",
    label: "Source",
    group: "General",
    size: INITIAL_SIZE.SHORT,
    isFiltrable: true,
  },
  {
    key: "albumName",
    label: "Album name",
    group: "General",
    size: INITIAL_SIZE.LONG,
    isFiltrable: true,
    filterType: "alphaGroup",
  },
  {
    key: "trackNumber",
    label: "Track number",
    group: "General",
    size: INITIAL_SIZE.SHORT,
    isFiltrable: true,
    filterType: "presence",
  },
  {
    key: "yearRecorded",
    label: "Year recorded",
    group: "General",
    size: INITIAL_SIZE.SHORT,
    isFiltrable: true,
  },
  {
    key: "yearReleased",
    label: "Year released",
    group: "General",
    size: INITIAL_SIZE.SHORT,
    isFiltrable: true,
  },
  {
    key: "genre",
    label: "Genre",
    group: "General",
    size: INITIAL_SIZE.MEDIUM,
    isFiltrable: true,
  },
  {
    key: "subgenre",
    label: "Subgenre",
    group: "General",
    size: INITIAL_SIZE.MEDIUM,
    isFiltrable: true,
  },
  {
    key: "languages",
    label: "Languages",
    group: "General",
    size: INITIAL_SIZE.MEDIUM,
    isFiltrable: true,
  },
];

const songInformation: ColumnDefinition[] = [
  {
    key: "vocalParts",
    label: "Vocal parts",
    group: "Song information",
    size: INITIAL_SIZE.SHORT,
    isFiltrable: true,
  },
  {
    key: "guitarDiff",
    label: "Guitar difficulty",
    group: "Song information",
    size: INITIAL_SIZE.MEDIUM,
    isFiltrable: true,
  },
  {
    key: "drumsDiff",
    label: "Drums difficulty",
    group: "Song information",
    size: INITIAL_SIZE.MEDIUM,
    isFiltrable: true,
  },
  {
    key: "bassDiff",
    label: "Bass difficulty",
    group: "Song information",
    size: INITIAL_SIZE.MEDIUM,
    isFiltrable: true,
  },
  {
    key: "vocalsDiff",
    label: "Vocals difficulty",
    group: "Song information",
    size: INITIAL_SIZE.MEDIUM,
    isFiltrable: true,
  },
  {
    key: "bandDiff",
    label: "Band difficulty",
    group: "Song information",
    size: INITIAL_SIZE.MEDIUM,
    isFiltrable: true,
  },
  {
    key: "keysDiff",
    label: "Keys difficulty",
    group: "Song information",
    size: INITIAL_SIZE.MEDIUM,
    isFiltrable: true,
  },
  {
    key: "proKeysDiff",
    label: "Pro keys difficulty",
    group: "Song information",
    size: INITIAL_SIZE.MEDIUM,
    isFiltrable: true,
  },
  {
    key: "proGuitarDiff",
    label: "Pro guitar difficulty",
    group: "Song information",
    size: INITIAL_SIZE.MEDIUM,
    isFiltrable: true,
  },
  {
    key: "proBassDiff",
    label: "Pro bass difficulty",
    group: "Song information",
    size: INITIAL_SIZE.MEDIUM,
    isFiltrable: true,
  },
  {
    key: "rating",
    label: "Rating",
    group: "Song information",
    size: INITIAL_SIZE.LONG,
    isFiltrable: true,
  },
  {
    key: "songLength",
    label: "Song length",
    group: "Song information",
    size: INITIAL_SIZE.SHORT,
    isFiltrable: false,
  },
  {
    key: "isMaster",
    label: "Is master",
    group: "Song information",
    size: INITIAL_SIZE.SHORT,
    isFiltrable: true,
  },
  {
    key: "vocalGender",
    label: "Vocal gender",
    group: "Song information",
    size: INITIAL_SIZE.SHORT,
    isFiltrable: true,
  },
];

const technical: ColumnDefinition[] = [
  {
    key: "previewStart",
    label: "Preview start",
    group: "Technical",
    size: INITIAL_SIZE.SHORT,
    isFiltrable: false,
  },
  {
    key: "previewEnd",
    label: "Preview end",
    group: "Technical",
    size: INITIAL_SIZE.SHORT,
    isFiltrable: false,
  },
  {
    key: "author",
    label: "Author",
    group: "Technical",
    size: INITIAL_SIZE.MEDIUM,
    isFiltrable: false,
  },
  {
    key: "shortName",
    label: "Short name",
    group: "Technical",
    size: INITIAL_SIZE.LONG,
    isFiltrable: false,
  },
  {
    key: "filePath",
    label: "File path",
    group: "Technical",
    size: INITIAL_SIZE.LONG,
    isFiltrable: false,
  },
  {
    key: "encoding",
    label: "Encoding",
    group: "Technical",
    size: INITIAL_SIZE.SHORT,
    isFiltrable: false,
  },
  {
    key: "scrollSpeed",
    label: "Scroll speed",
    group: "Technical",
    size: INITIAL_SIZE.SHORT,
    isFiltrable: true,
  },
  {
    key: "vocalPercussionBank",
    label: "Vocal percussion bank",
    group: "Technical",
    size: INITIAL_SIZE.LONG,
    isFiltrable: true,
  },
  {
    key: "drumBank",
    label: "Drum bank",
    group: "Technical",
    size: INITIAL_SIZE.LONG,
    isFiltrable: true,
  },
  {
    key: "bandFailCue",
    label: "Band fail cue",
    group: "Technical",
    size: INITIAL_SIZE.LONG,
    isFiltrable: true,
  },
  {
    key: "tonicNote",
    label: "Tonic note",
    group: "Technical",
    size: INITIAL_SIZE.SHORT,
    isFiltrable: true,
  },
  {
    key: "songTonality",
    label: "Song tonality",
    group: "Technical",
    size: INITIAL_SIZE.SHORT,
    isFiltrable: true,
  },
  {
    key: "guidePitchVolume",
    label: "Guide pitch volume",
    group: "Technical",
    size: INITIAL_SIZE.SHORT,
    isFiltrable: true,
  },
  {
    key: "magmaVersion",
    label: "Magma version",
    group: "Technical",
    size: INITIAL_SIZE.MEDIUM,
    isFiltrable: true,
  },

  {
    key: "doubleBass",
    label: "2x Bass",
    group: "Technical",
    size: INITIAL_SIZE.SHORT,
    isFiltrable: true,
  },
  {
    key: "catEMH",
    label: "CAT e/m/h",
    group: "Technical",
    size: INITIAL_SIZE.SHORT,
    isFiltrable: true,
  },
  {
    key: "convert",
    label: "Convert",
    group: "Technical",
    size: INITIAL_SIZE.SHORT,
    isFiltrable: true,
  },
  {
    key: "diyStems",
    label: "DIY stems",
    group: "Technical",
    size: INITIAL_SIZE.SHORT,
    isFiltrable: true,
  },
  {
    key: "karaoke",
    label: "Karaoke",
    group: "Technical",
    size: INITIAL_SIZE.SHORT,
    isFiltrable: true,
  },
  {
    key: "multitrack",
    label: "Multitrack",
    group: "Technical",
    size: INITIAL_SIZE.SHORT,
    isFiltrable: true,
  },
  {
    key: "partialMultitrack",
    label: "Partial multitrack",
    group: "Technical",
    size: INITIAL_SIZE.SHORT,
    isFiltrable: true,
  },
  {
    key: "expertOnly",
    label: "Expert only",
    group: "Technical",
    size: INITIAL_SIZE.SHORT,
    isFiltrable: true,
  },
  {
    key: "rhythmBass",
    label: "Rhythm bass",
    group: "Technical",
    size: INITIAL_SIZE.SHORT,
    isFiltrable: true,
  },
  {
    key: "rhythmKeys",
    label: "Rhythm keys",
    group: "Technical",
    size: INITIAL_SIZE.SHORT,
    isFiltrable: true,
  },
  {
    key: "unpitchedVocals",
    label: "Unpitched vocals",
    group: "Technical",
    size: INITIAL_SIZE.SHORT,
    isFiltrable: true,
  },
];

type Instruments =
  | "drums"
  | "bass"
  | "guitar"
  | "vocals"
  | "harmonies"
  | "keys"
  | "proDrums"
  | "proGuitar"
  | "proBass"
  | "proKeys"
  | "band";

const getInstrumentSaveGroup = (
  instrumentName: Instruments,
): ColumnDefinition[] => {
  const upperCasedInstrumentName = Helper.capitalizeFirstLetter(
    instrumentName.startsWith("pro")
      ? Helper.insertStringAtIndex(instrumentName, 3)
      : instrumentName,
  ) as Groups;

  return [
    {
      key: `${instrumentName}TopScore`,
      label: `${upperCasedInstrumentName} top score`,
      group: upperCasedInstrumentName,
      size: 150,
      isFiltrable: true,
      filterType: "presence",
    },
    {
      key: `${instrumentName}TopScoreDifficulty`,
      label: `${upperCasedInstrumentName} Top Difficulty`,
      group: upperCasedInstrumentName,
      size: 160,
      render: "difficulty",
      isFiltrable: true,
    },
    {
      key: `${instrumentName}StarsEasy`,
      label: `${upperCasedInstrumentName} ★ Easy`,
      group: upperCasedInstrumentName,
      size: 130,
      render: "stars",
      isFiltrable: true,
    },
    {
      key: `${instrumentName}PercentEasy`,
      label: `${upperCasedInstrumentName} % Easy`,
      group: upperCasedInstrumentName,
      size: 130,
      render: "percent",
    },
    {
      key: `${instrumentName}StarsMedium`,
      label: `${upperCasedInstrumentName} ★ Med`,
      group: upperCasedInstrumentName,
      size: 130,
      render: "stars",
      isFiltrable: true,
    },
    {
      key: `${instrumentName}PercentMedium`,
      label: `${upperCasedInstrumentName} % Med`,
      group: upperCasedInstrumentName,
      size: 130,
      render: "percent",
    },
    {
      key: `${instrumentName}StarsHard`,
      label: `${upperCasedInstrumentName} ★ Hard`,
      group: upperCasedInstrumentName,
      size: 130,
      render: "stars",
      isFiltrable: true,
    },
    {
      key: `${instrumentName}PercentHard`,
      label: `${upperCasedInstrumentName} % Hard`,
      group: upperCasedInstrumentName,
      size: 130,
      render: "percent",
    },
    {
      key: `${instrumentName}StarsExpert`,
      label: `${upperCasedInstrumentName} ★ Expert`,
      group: upperCasedInstrumentName,
      size: 140,
      render: "stars",
      isFiltrable: true,
    },
    {
      key: `${instrumentName}PercentExpert`,
      label: `${upperCasedInstrumentName} % Expert`,
      group: upperCasedInstrumentName,
      size: 140,
      render: "percent",
    },
  ];
};

const COLUMN_DEFINITIONS: ColumnDefinition[] = [
  ...general,
  ...songInformation,
  ...getInstrumentSaveGroup("drums"),
  ...getInstrumentSaveGroup("bass"),
  ...getInstrumentSaveGroup("guitar"),
  ...getInstrumentSaveGroup("vocals"),
  ...getInstrumentSaveGroup("keys"),
  ...getInstrumentSaveGroup("band"),
  ...getInstrumentSaveGroup("harmonies"),
  ...getInstrumentSaveGroup("proDrums"),
  ...getInstrumentSaveGroup("proBass"),
  ...getInstrumentSaveGroup("proGuitar"),
  ...getInstrumentSaveGroup("proKeys"),
  ...technical,
];

// Columns visible when page first loads (before user customizes)
const DEFAULT_VISIBLE_COLUMNS = [
  "songID",
  "artist",
  "songName",
  "lighterRating",
  "playCount",
  "bandTopScore",
];

const ColumnDefinitions = {
  COLUMN_DEFINITIONS,
  DEFAULT_VISIBLE_COLUMNS,
};

export default ColumnDefinitions;
