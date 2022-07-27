function PlayMusic() {
    const audio = new Audio('Littleroot-Town.mp3');
    audio.volume = 0.1;
    audio.muted= true
    audio.play();
}

export default PlayMusic