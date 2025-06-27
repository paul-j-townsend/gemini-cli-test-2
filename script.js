// Let's define some sample podcast data.
// In a real application, you might fetch this from a server.

const podcasts = [
    {
        title: 'The Future of UK Companion Animal Veterinary Care',
        description: 'A discussion on the future of veterinary care for companion animals in the UK.',
        audioSrc: 'audio/the_future_of_uk_companion_animal_veterinary_care.wav'
    },
    {
        title: 'Episode 2: The Middle',
        description: 'Things are starting to get interesting. We discuss some cool topics.',
        audioSrc: 'audio/the_evolving_world_of_animal_healthcare.wav'
    },
    {
        title: 'Episode 3: The End?',
        description: 'Is this the end, or just a new beginning? Tune in to find out.',
        audioSrc: 'audio/the_future_of_uk_companion_animal_veterinary_care.wav'
    }
];

// Function to display podcasts on the page
function displayPodcasts() {
    const podcastListElement = document.getElementById('podcast-list');
    podcastListElement.innerHTML = ''; // Clear any existing content

    podcasts.forEach((podcast) => {
        // --- Create Main Card ---
        const card = document.createElement('div');
        card.className = 'bg-white p-6 rounded-lg shadow-md';

        // --- Title and Description ---
        const title = document.createElement('h2');
        title.className = 'text-2xl font-semibold mb-2';
        title.textContent = podcast.title;
        card.appendChild(title);

        const description = document.createElement('p');
        description.className = 'text-slate-600 mb-4';
        description.textContent = podcast.description;
        card.appendChild(description);

        // --- Create Player Bar ---
        const playerBar = document.createElement('div');
        playerBar.className = 'flex w-full items-center space-x-3 bg-slate-100 rounded-full p-2';

        // Underlying audio element (kept hidden)
        const audio = new Audio(podcast.audioSrc);

        // --- Player Controls ---
        const playIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path fill-rule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.647c1.295.742 1.295 2.545 0 3.286L7.279 20.99c-1.25.717-2.779-.217-2.779-1.643V5.653Z" clip-rule="evenodd" /></svg>`;
        const pauseIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path fill-rule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0a.75.75 0 0 1 .75-.75H16.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z" clip-rule="evenodd" /></svg>`;

        // Rewind Button
        const rewindBtn = document.createElement('button');
        rewindBtn.className = 'text-slate-500 hover:text-slate-700 transition-colors flex-shrink-0';
        rewindBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M21 16.811c0 .864-.933 1.406-1.683.977l-7.108-4.061a1.125 1.125 0 0 1 0-1.954l7.108-4.061A1.125 1.125 0 0 1 21 8.689v8.122ZM11.25 16.811c0 .864-.933 1.406-1.683.977l-7.108-4.061a1.125 1.125 0 0 1 0-1.954l7.108-4.061a1.125 1.125 0 0 1 1.683.977v8.122Z" /></svg>`;
        playerBar.appendChild(rewindBtn);

        // Play/Pause Button
        const playPauseBtn = document.createElement('button');
        playPauseBtn.className = 'text-slate-700 hover:text-slate-900 transition-colors flex-shrink-0';
        playPauseBtn.innerHTML = playIcon;
        playerBar.appendChild(playPauseBtn);
        
        // Forward Button
        const forwardBtn = document.createElement('button');
        forwardBtn.className = 'text-slate-500 hover:text-slate-700 transition-colors flex-shrink-0';
        forwardBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.689ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 12.75 16.811V8.689Z" /></svg>`;
        playerBar.appendChild(forwardBtn);

        // --- Scrubber/Time Container ---
        const scrubberContainer = document.createElement('div');
        scrubberContainer.className = 'flex flex-grow items-center space-x-2 min-w-0';

        // Current Time
        const currentTimeEl = document.createElement('span');
        currentTimeEl.className = 'text-sm text-slate-500 w-12 text-center';
        currentTimeEl.textContent = '0:00';
        scrubberContainer.appendChild(currentTimeEl);
        
        // Progress Slider
        const progressSlider = document.createElement('input');
        progressSlider.type = 'range';
        progressSlider.min = 0;
        progressSlider.max = 100;
        progressSlider.value = 0;
        progressSlider.className = 'w-full h-1.5 bg-slate-300 rounded-lg appearance-none cursor-pointer';
        scrubberContainer.appendChild(progressSlider);

        // Total Duration
        const totalDurationEl = document.createElement('span');
        totalDurationEl.className = 'text-sm text-slate-500 w-12 text-center';
        totalDurationEl.textContent = '0:00';
        scrubberContainer.appendChild(totalDurationEl);

        playerBar.appendChild(scrubberContainer);
        
        // --- Volume Controls ---
        const volumeBtn = document.createElement('button');
        volumeBtn.className = 'text-slate-500 hover:text-slate-700 transition-colors flex-shrink-0';
        const volumeHighIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" /></svg>`;
        const volumeMuteIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-3.03a.75.75 0 0 0 0-1.06l-1.72-1.72a.75.75 0 0 0-1.06 1.06l1.72 1.72a.75.75 0 0 0 1.06 0ZM6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" /></svg>`;
        volumeBtn.innerHTML = volumeHighIcon;
        playerBar.appendChild(volumeBtn);

        // --- Add Player to Card and Card to List ---
        card.appendChild(playerBar);
        podcastListElement.appendChild(card);

        // --- Player Logic ---
        const formatTime = (seconds) => {
            const minutes = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
        };

        audio.addEventListener('loadedmetadata', () => {
            totalDurationEl.textContent = formatTime(audio.duration);
            progressSlider.max = audio.duration;
        });

        audio.addEventListener('timeupdate', () => {
            progressSlider.value = audio.currentTime;
            currentTimeEl.textContent = formatTime(audio.currentTime);
        });

        audio.addEventListener('play', () => { playPauseBtn.innerHTML = pauseIcon; });
        audio.addEventListener('pause', () => { playPauseBtn.innerHTML = playIcon; });
        audio.addEventListener('ended', () => { playPauseBtn.innerHTML = playIcon; audio.currentTime = 0; });

        playPauseBtn.addEventListener('click', () => {
            if (audio.paused) {
                // Pause all other players before playing this one
                document.querySelectorAll('audio').forEach(otherAudio => {
                    if (otherAudio !== audio) otherAudio.pause();
                });
                audio.play();
            } else {
                audio.pause();
            }
        });

        rewindBtn.addEventListener('click', () => { audio.currentTime -= 10; });
        forwardBtn.addEventListener('click', () => { audio.currentTime += 10; });
        progressSlider.addEventListener('input', () => { audio.currentTime = progressSlider.value; });
        
        volumeBtn.addEventListener('click', () => {
            audio.muted = !audio.muted;
        });
        
        audio.addEventListener('volumechange', () => {
            volumeBtn.innerHTML = audio.muted ? volumeMuteIcon : volumeHighIcon;
        });
        
        // Add a hidden audio tag to the card so our querySelector can find it
        audio.style.display = 'none';
        card.appendChild(audio);
    });
}

// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', displayPodcasts); 