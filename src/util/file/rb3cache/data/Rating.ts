const convertRating = (ratingValue: number) => {
  switch (ratingValue) {
    case 1:
      return "Family friendly";
    case 2:
      return "Supervision recommended";
    case 3:
      return "Mature";
    default:
      return "Not rated";
  }
};

const Rating = {
  convertRating,
};

export default Rating;
