import SoundPlayer from "./player-small.js";
import swingMusicData from "./swingmusic.js";

const musicGenerator = new SoundPlayer();
musicGenerator.init(swingMusicData);

while (musicGenerator.generate() < 1);

const audioContext = new AudioContext();
const buffer = musicGenerator.createAudioBuffer(audioContext);
const source = audioContext.createBufferSource();
source.buffer = buffer;
source.connect(audioContext.destination);

document.addEventListener("keydown", () => source.start(), { once: true });
