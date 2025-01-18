export const colors = {
  "defaultFill": "white",
  "defaultActiveFill": "#ff636c",
  "defaultStroke": "black",
  "defaultActiveStroke": "#ff636c",
  "disabled": "#aaa",
  "primaryFill": "#3273dc",
  "activeOverlayFill": "yellow",
  "overlayFill": "white",
  intervals: {
    "1P": "#F25116",
    "2M": "#FCFF6C",
    "2m": "#FCFF6C",
    "3m": "#F29727",
    "3M": "#F29727",
    "4P": "#2FABEE",
    "4A": "#2FABEE",
    "5P": "#D89D6A",
    "5A": "#D89D6A",
    "6M": "#D7FFAB",
    "6m": "#D7FFAB",
    "7M": "#96ADC8",
    "7m": "#96ADC8",
  },
  octaves: [
    "#70D6FF",
    "#FFBE0B",
    "#E9FF70",
    "#FF70A6",
    "#6ae674",
  ],
  chordTypes: {
    "maj7": "#00bbf9",
    "7": "#F25116",
    "m7": "#F29727",
    "m7b5": "#8338ec",
  },
  modes: {
    "ionian": "#e76f51",
    "dorian": "#6a994e",
    "phrygian": "#8338ec",
    "lydian": "#ffbd00",
    "mixolydian": "#e36414",
    "aeolian": "#00bbf9",
    "locrian": "#1D5DF2",
  }
}


export const fretboardConfiguration = {
  height: 200,
  stringsWidth: 1.5,
  dotSize: 25,
  fretCount: 16,
  fretsWidth: 1.2,
  font: 'Futura'
};

export const abcjsConfig = {
  program: 25,
  responsive: 'resize',
  add_classes: true,
  soundFontUrl: 'https://paulrosen.github.io/midi-js-soundfonts/MusyngKite/'
};

export const notesWithAccidentals = 'CDEFGAB'.split('').map(x => 'EB'.indexOf(x) > -1 ? x : [x, `${x}#`] ).flat();
export const modes = ['ionian', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian', 'locrian'];

const notes = 'CDEFGAB'.split('');

export const modeMap = modes.map((mode, index) => ({
  mode,
  root: notes[index],
  color: colors.modes[mode]
}));
