import PodcastPlayerItem from './PodcastPlayerItem';

interface Podcast {
  title: string;
  description: string;
  audioSrc: string;
  thumbnail: string;
}

const podcasts: Podcast[] = [
    {
        title: 'The Future of UK Companion Animal Veterinary Care',
        description: 'A discussion on the future of veterinary care for companion animals in the UK.',
        audioSrc: '/audio/the_future_of_uk_companion_animal_veterinary_care.mp3',
        thumbnail: 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=300&h=300&fit=crop&crop=center'
    },
    {
        title: 'The Evolving World of Animal Healthcare',
        description: 'A look at the evolving world of animal healthcare.',
        audioSrc: '/audio/the_evolving_world_of_animal_healthcare.mp3',
        thumbnail: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&h=300&fit=crop&crop=center'
    },
    {
      title: 'The Future of UK Companion Animal Veterinary Care',
      description: 'A discussion on the future of veterinary care for companion animals in the UK.',
      audioSrc: '/audio/the_future_of_uk_companion_animal_veterinary_care.mp3',
      thumbnail: 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=300&h=300&fit=crop&crop=center'
  },
  {
    title: 'The Future of UK Companion Animal Veterinary Care',
    description: 'A discussion on the future of veterinary care for companion animals in the UK.',
    audioSrc: '/audio/the_future_of_uk_companion_animal_veterinary_care.mp3',
    thumbnail: 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=300&h=300&fit=crop&crop=center'
},
];

const PodcastPlayer = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {podcasts.map((podcast, index) => (
        <PodcastPlayerItem key={index} podcast={podcast} />
      ))}
    </div>
  );
};

export default PodcastPlayer;
