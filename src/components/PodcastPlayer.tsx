
import PodcastPlayerItem from './PodcastPlayerItem';

interface Podcast {
  title: string;
  description: string;
  audioSrc: string;
}

const podcasts: Podcast[] = [
    {
        title: 'The Future of UK Companion Animal Veterinary Care',
        description: 'A discussion on the future of veterinary care for companion animals in the UK.',
        audioSrc: '/audio/the_future_of_uk_companion_animal_veterinary_care.wav'
    },
    {
        title: 'The Evolving World of Animal Healthcare',
        description: 'A look at the evolving world of animal healthcare.',
        audioSrc: '/audio/the_evolving_world_of_animal_healthcare.wav'
    },
];

const PodcastPlayer = () => {
  return (
    <div className="space-y-8">
      {podcasts.map((podcast, index) => (
        <PodcastPlayerItem key={index} podcast={podcast} />
      ))}
    </div>
  );
};

export default PodcastPlayer;
