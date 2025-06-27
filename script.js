// Let's define some sample podcast data.
// In a real application, you might fetch this from a server.

const podcasts = [
    {
        title: 'The Future of UK Companion Animal Veterinary Care',
        description: 'A discussion on the future of veterinary care for companion animals in the UK.',
        audioSrc: 'audio/The Future of UK Companion Animal Veterinary Care.wav'
    },
    {
        title: 'Episode 2: The Middle',
        description: 'Things are starting to get interesting. We discuss some cool topics.',
        audioSrc: 'audio/The Future of UK Companion Animal Veterinary Care.wav'
    },
    {
        title: 'Episode 3: The End?',
        description: 'Is this the end, or just a new beginning? Tune in to find out.',
        audioSrc: 'audio/The Future of UK Companion Animal Veterinary Care.wav'
    }
];

// Function to display podcasts on the page
function displayPodcasts() {
    const podcastListElement = document.getElementById('podcast-list');
    podcastListElement.innerHTML = ''; // Clear any existing content

    podcasts.forEach((podcast, index) => {
        // Create the card container
        const card = document.createElement('div');
        card.className = 'bg-white p-6 rounded-lg shadow-md flex flex-col';

        // Title
        const title = document.createElement('h2');
        title.className = 'text-2xl font-semibold mb-2';
        title.textContent = podcast.title;
        card.appendChild(title);

        // Description
        const description = document.createElement('p');
        description.className = 'text-slate-600 mb-4 flex-grow';
        description.textContent = podcast.description;
        card.appendChild(description);

        // Waveform container
        const waveformContainer = document.createElement('div');
        waveformContainer.id = `waveform-${index}`;
        waveformContainer.className = 'mb-4';
        card.appendChild(waveformContainer);

        // Play/Pause button
        const button = document.createElement('button');
        button.className = 'play-pause-btn bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300';
        button.textContent = 'Play';
        card.appendChild(button);

        // Append the fully constructed card to the list
        podcastListElement.appendChild(card);

        // Initialize WaveSurfer on the container we just added
        const wavesurfer = WaveSurfer.create({
            container: `#waveform-${index}`,
            waveColor: 'rgb(203 213 225)', // slate-300 from Tailwind
            progressColor: 'rgb(59 130 246)', // blue-500 from Tailwind
            url: podcast.audioSrc,
            barWidth: 3,
            barGap: 2,
            barRadius: 2,
            height: 64,
        });

        // Add click event listener to our custom button
        button.addEventListener('click', () => {
            wavesurfer.playPause();
        });

        // Update button text on play/pause events
        wavesurfer.on('play', () => {
            button.textContent = 'Pause';
        });
        wavesurfer.on('pause', () => {
            button.textContent = 'Play';
        });
        wavesurfer.on('finish', () => {
            button.textContent = 'Play'; // Reset on finish
        });
    });
}

// Call the function to run when the script loads
displayPodcasts(); 