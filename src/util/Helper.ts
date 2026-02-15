const capitalizeFirstLetter = (val: string) => {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
};

const insertStringAtIndex = (
  originalValue: string,
  index: number,
  stringToAdd = " ",
) => {
  return (
    originalValue.slice(0, index) + stringToAdd + originalValue.slice(index)
  );
};

const convertMilliSecondsToSeconds = (milliseconds?: number) => {
  return milliseconds ? milliseconds / 1000 : milliseconds;
};

const convertMilliSecondsToReadableTime = (milliseconds?: number) => {
  const seconds = convertMilliSecondsToSeconds(milliseconds);
  if (!seconds) {
    return "00:00";
  }
  const minutes = Math.floor(seconds / 60);
  return `${("00" + minutes).slice(-2)}:${("00" + (Math.floor(seconds) - 60 * minutes)).slice(-2)}`;
};

const Helper = {
  capitalizeFirstLetter,
  insertStringAtIndex,
  convertMilliSecondsToReadableTime,
};

export default Helper;
