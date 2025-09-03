import { Sound } from "littlejsengine";
import { sounds } from "../cat_sounds.json";

const zzfxKeyOrder = [
  "volume",
  "randomness",
  "frequency",
  "attack",
  "sustain",
  "release",
  "shape",
  "shapeCurve",
  "slide",
  "deltaSlide",
  "pitchJump",
  "pitchJumpTime",
  "repeatTime",
  "noise",
  "modulation",
  "bitCrush",
  "delay",
  "sustainVolume",
  "decay",
  "tremolo",
  "filter",
];

// Convert sound object to zzfx array format
const toZzfxArray = (sound: any) => zzfxKeyOrder.map((key) => sound[key]);

export const leap = new Sound(toZzfxArray(sounds[0]));
export const meow = new Sound(toZzfxArray(sounds[1]));
export const clover = new Sound(toZzfxArray(sounds[2]));


