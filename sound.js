const notes = {light:210,heavy:100,rocket:300,bomb:420,emp:525,shield:660,repair:780};

export function createSound() {
  let audio;
  return function play(event) {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    audio ??= new Audio();
    if (audio.state === 'suspended') audio.resume().catch(() => {});
    if (!event) return;
    const start = audio.currentTime;
    const hit = event.type === 'hit';
    const pitch = hit ? 92 : notes[event.key] ?? 680;
    const oscillator = audio.createOscillator();
    const volume = audio.createGain();
    oscillator.type = hit ? 'triangle' : 'sine';
    oscillator.frequency.setValueAtTime(pitch,start);
    oscillator.frequency.exponentialRampToValueAtTime(pitch*(pitch>=660 ? 1.35 : .45),start+.16);
    volume.gain.setValueAtTime(.0001,start);
    volume.gain.exponentialRampToValueAtTime(.095,start+.025);
    volume.gain.exponentialRampToValueAtTime(.0001,start+.18);
    oscillator.connect(volume).connect(audio.destination);
    oscillator.start();
    oscillator.stop(start+.18);
  };
}
