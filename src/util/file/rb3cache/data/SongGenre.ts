const parseSubGenre = (subgenre?: string) => {
  if (!subgenre) {
    return undefined;
  }
  switch (subgenre) {
    case "alternative": {
      return "Alternative";
    }
    case "college": {
      return "College";
    }
    case "other": {
      return "Other";
    }
    case "acoustic": {
      return "Acoustic";
    }
    case "chicago": {
      return "Chicago";
    }
    case "classic": {
      return "Classic";
    }
    case "contemporary": {
      return "Contemporary";
    }
    case "country": {
      return "Country";
    }
    case "delta": {
      return "Delta";
    }
    case "electric": {
      return "Electric";
    }
    case "classicrock": {
      return "Classic Rock";
    }
    case "bluegrass": {
      return "Bluegrass";
    }
    case "honkytonk": {
      return "Honky Tonk";
    }
    case "outlaw": {
      return "Outlaw";
    }
    case "traditionalfolk": {
      return "Traditional Folk";
    }
    case "emo": {
      return "Emo";
    }
    case "fusion": {
      return "Fusion";
    }
    case "glam": {
      return "Glam";
    }
    case "goth": {
      return "Goth";
    }
    case "acidjazz": {
      return "Acid Jazz";
    }
    case "experimental": {
      return "Experimental";
    }
    case "ragtime": {
      return "Ragtime";
    }
    case "smooth": {
      return "Smooth";
    }
    case "metal": {
      return "Metal";
    }
    case "black": {
      return "Black";
    }
    case "core": {
      return "Core";
    }
    case "death": {
      return "Death";
    }
    case "hair": {
      return "Hair";
    }
    case "industrial": {
      return "Industrial";
    }
    case "power": {
      return "Power";
    }
    case "prog": {
      return "Prog";
    }
    case "speed": {
      return "Speed";
    }
    case "thrash": {
      return "Thrash";
    }
    case "novelty": {
      return "Novelty";
    }
    case "numetal": {
      return "Nu-Metal";
    }
    case "disco": {
      return "Disco";
    }
    case "motown": {
      return "Motown";
    }
    case "pop": {
      return "Pop";
    }
    case "rhythmandblues": {
      return "Rhythm and Blues";
    }
    case "softrock": {
      return "Soft Rock";
    }
    case "soul": {
      return "Soul";
    }
    case "teen": {
      return "Teen";
    }
    case "progrock": {
      return "Prog Rock";
    }
    case "garage": {
      return "Garage";
    }
    case "hardcore": {
      return "Hardcore";
    }
    case "dancepunk": {
      return "Dance Punk";
    }
    case "arena": {
      return "Arena";
    }
    case "blues": {
      return "Blues";
    }
    case "funk": {
      return "Funk";
    }
    case "hardrock": {
      return "Hard Rock";
    }
    case "psychadelic": {
      return "Psychedelic";
    }
    case "rock": {
      return "Rock";
    }
    case "rockandroll": {
      return "Rock and Roll";
    }
    case "rockabilly": {
      return "Rockabilly";
    }
    case "ska": {
      return "Ska";
    }
    case "surf": {
      return "Surf";
    }
    case "folkrock": {
      return "Folk Rock";
    }
    case "reggae": {
      return "Reggae";
    }
    case "southernrock": {
      return "Southern Rock";
    }
    case "alternativerap": {
      return "Alternative Rap";
    }
    case "dub": {
      return "Dub";
    }
    case "downtempo": {
      return "Downtempo";
    }
    case "electronica": {
      return "Electronica";
    }
    case "gangsta": {
      return "Gangsta";
    }
    case "hardcoredance": {
      return "Hardcore Dance";
    }
    case "hardcorerap": {
      return "Hardcore Rap";
    }
    case "hiphop": {
      return "Hip Hop";
    }
    case "drumandbass": {
      return "Drum and Bass";
    }
    case "oldschoolhiphop": {
      return "Old School Hip Hop";
    }
    case "rap": {
      return "Rap";
    }
    case "triphop": {
      return "Trip Hop";
    }
    case "undergroundrap": {
      return "Underground Rap";
    }
    case "acapella": {
      return "A capella";
    }
    case "classical": {
      return "Classical";
    }
    case "contemporaryfolk": {
      return "Contemporary Folk";
    }
    case "oldies": {
      return "Oldies";
    }
    case "house": {
      return "House";
    }
    case "techno": {
      return "Techno";
    }
    case "breakbeat": {
      return "Breakbeat";
    }
    case "ambient": {
      return "Ambient";
    }
    case "trance": {
      return "Trance";
    }
    case "chiptune": {
      return "Chiptune";
    }
    case "dance": {
      return "Dance";
    }
    case "new_wave": {
      return "New Wave";
    }
    case "electroclash": {
      return "Electroclash";
    }
    case "darkwave": {
      return "Dark Wave";
    }
    case "synth": {
      return "Synthpop";
    }
    case "indierock": {
      return "Indie Rock";
    }
    case "mathrock": {
      return "Math Rock";
    }
    case "lofi": {
      return "Lo-fi";
    }
    case "shoegazing": {
      return "Shoegazing";
    }
    case "postrock": {
      return "Post Rock";
    }
    case "noise": {
      return "Noise";
    }
    case "grunge": {
      return "Grunge";
    }
    case "jrock": {
      return "J-Rock";
    }
    case "latin": {
      return "Latin";
    }
    case "inspirational": {
      return "Inspirational";
    }
    case "world": {
      return "World";
    }
    default: {
      return subgenre;
    }
  }
};

const parseGenre = (genre?: string) => {
  if (!genre) {
    return undefined;
  }
  switch (genre) {
    case "alternative": {
      return "Alternative";
    }
    case "blues": {
      return "Blues";
    }
    case "classical": {
      return "Classical";
    }
    case "classicrock": {
      return "Classic Rock";
    }
    case "country": {
      return "Country";
    }
    case "emo": {
      return "Emo";
    }
    case "fusion": {
      return "Fusion";
    }
    case "glam": {
      return "Glam";
    }
    case "grunge": {
      return "Grunge";
    }
    case "hiphoprap": {
      return "Hip-Hop/Rap";
    }
    case "indierock": {
      return "Indie Rock";
    }
    case "jazz": {
      return "Jazz";
    }
    case "jrock": {
      return "J-Rock";
    }
    case "latin": {
      return "Latin";
    }
    case "metal": {
      return "Metal";
    }
    case "new_wave": {
      return "New Wave";
    }
    case "novelty": {
      return "Novelty";
    }
    case "numetal": {
      return "Nu-Metal";
    }
    case "other": {
      return "Other";
    }
    case "poprock": {
      return "Pop-Rock";
    }
    case "popdanceelectronic": {
      return "Pop/Dance/Electronic";
    }
    case "prog": {
      return "Prog";
    }
    case "punk": {
      return "Punk";
    }
    case "rbsoulfunk": {
      return "R&B/Soul/Funk";
    }
    case "reggaeska": {
      return "Reggae/Ska";
    }
    case "inspirational": {
      return "Inspirational";
    }
    case "rock": {
      return "Rock";
    }
    case "southernrock": {
      return "Southern Rock";
    }
    case "urban": {
      return "Urban";
    }
    case "world": {
      return "World";
    }
    default: {
      return genre;
    }
  }
};

const SongGenre = {
  parseGenre,
  parseSubGenre,
};

export default SongGenre;
