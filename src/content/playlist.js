/**
 * The song at the top of the playlist, played from YouTube. Change `videoId` (the
 * part after watch?v= in a YouTube link) to feature a different song.
 */
export const FEATURED_SONG = {
  videoId: 'zyLmavBAY7k',
  title: 'Teh Hijau',
  channel: 'TULUS',
  label: 'Official Music Video',
};

/**
 * The coding playlist. Every track is original music synthesised in the browser
 * (see src/lib/synth.js), so there are no audio files or licences involved.
 *
 * To play a real recording instead, add `src: '/music/file.mp3'` (a file in
 * public/) or a full URL to a track. It then plays that file and ignores `synth`.
 *
 * - `tone`: the card's background colour
 * - `art`: the two artwork colours and a pattern (waves, sun, grid, rings, rain, pixels)
 * - `synth`: style (lofi, synthwave, ambient, chiptune), tempo, root note as a MIDI
 *   number, and four chords as semitone offsets from the root, one per bar
 */
export const TRACKS = [
  {
    id: 'mode-fokus',
    title: 'Mode Fokus',
    artist: 'Studio Ngoding',
    genre: 'Lo-fi',
    mood: 'Tenang, buat kerja panjang',
    about: 'Akor jazz yang pelan dan ketukan santai untuk sesi ngoding yang butuh konsentrasi.',
    tone: '#2a2140',
    art: { from: '#7c5cff', to: '#1b1530', pattern: 'waves' },
    synth: { style: 'lofi', bpm: 76, root: 57, key: 'A minor', chords: [[0, 3, 7, 10], [5, 8, 12, 15], [-2, 2, 5, 9], [3, 7, 10, 14]] },
  },
  {
    id: 'kopi-tengah-malam',
    title: 'Kopi Tengah Malam',
    artist: 'JokiWebApp Lo-fi',
    genre: 'Lo-fi',
    mood: 'Hangat, larut malam',
    about: 'Teman begadang menjelang deadline: bass bulat, hi-hat berayun, dan piano yang redup.',
    tone: '#1d3326',
    art: { from: '#00c853', to: '#0d1f15', pattern: 'rain' },
    synth: { style: 'lofi', bpm: 70, root: 53, key: 'F major', chords: [[0, 4, 7, 11], [-3, 0, 4, 7], [2, 5, 9, 12], [-5, -1, 2, 5]] },
  },
  {
    id: 'deploy-jumat-sore',
    title: 'Deploy Jumat Sore',
    artist: 'Synth Nusantara',
    genre: 'Synthwave',
    mood: 'Semangat, sedikit nekat',
    about: 'Arpeggio neon dan drum mesin untuk momen tekan tombol deploy sebelum akhir pekan.',
    tone: '#3d1c24',
    art: { from: '#ff4d6d', to: '#2a0d16', pattern: 'sun' },
    synth: { style: 'synthwave', bpm: 104, root: 52, key: 'E minor', chords: [[0, 3, 7], [-4, 0, 3], [-7, -3, 0], [-2, 2, 5]] },
  },
  {
    id: 'hujan-di-jakarta',
    title: 'Hujan di Jakarta',
    artist: 'Studio Ngoding',
    genre: 'Ambient',
    mood: 'Teduh, melamun',
    about: 'Pad panjang yang bergerak pelan seperti hujan di luar jendela. Cocok untuk membaca dokumentasi.',
    tone: '#26282b',
    art: { from: '#9aa5b1', to: '#15171a', pattern: 'rings' },
    synth: { style: 'ambient', bpm: 60, root: 50, key: 'D major', chords: [[0, 7, 11, 16], [5, 9, 12, 19], [-3, 4, 7, 12], [7, 11, 14, 19]] },
  },
  {
    id: 'commit-pertama',
    title: 'Commit Pertama',
    artist: 'Bit Kampung',
    genre: 'Chiptune',
    mood: 'Ceria, nostalgia',
    about: 'Melodi 8-bit yang riang untuk merayakan commit pertama di project baru.',
    tone: '#3a2a1e',
    art: { from: '#ffb547', to: '#24170c', pattern: 'pixels' },
    synth: { style: 'chiptune', bpm: 128, root: 60, key: 'C major', chords: [[0, 4, 7], [-3, 0, 4], [5, 9, 12], [7, 11, 14]] },
  },
  {
    id: 'bug-hilang',
    title: 'Bug Hilang',
    artist: 'Synth Nusantara',
    genre: 'Synthwave',
    mood: 'Lega, melaju',
    about: 'Bass yang melaju dan akor terbuka untuk perasaan lega saat semua test akhirnya hijau.',
    tone: '#1c2a3a',
    art: { from: '#00f0ff', to: '#0b1824', pattern: 'grid' },
    synth: { style: 'synthwave', bpm: 112, root: 45, key: 'A minor', chords: [[0, 3, 7], [5, 8, 12], [3, 7, 10], [-2, 2, 5]] },
  },
];
