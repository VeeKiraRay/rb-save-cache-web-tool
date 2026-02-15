import { VALUE_UNKNOWN } from "@/constants/Constants";

const parseTonality = (tonicNote?: number) => {
  if (tonicNote === undefined || tonicNote < 0) {
    return undefined;
  }
  switch (tonicNote) {
    case 0:
      return "Major";
    case 1:
      return "Minor";
    default:
      return VALUE_UNKNOWN;
  }
};

const Tonality = {
  parseTonality,
};

export default Tonality;
