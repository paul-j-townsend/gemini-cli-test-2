
██╗   ██╗███████╗████████╗███████╗██╗██████╗ ███████╗██╗  ██╗██╗ ██████╗██╗  ██╗
██║   ██║██╔════╝╚══██╔══╝██╔════╝██║██╔══██╗██╔════╝██║ ██╔╝██║██╔════╝██║ ██╔╝
██║   ██║█████╗     ██║   ███████╗██║██║  ██║█████╗  █████╔╝ ██║██║     █████╔╝ 
╚██╗ ██╔╝██╔══╝     ██║   ╚════██║██║██║  ██║██╔══╝  ██╔═██╗ ██║██║     ██╔═██╗ 
 ╚████╔╝ ███████╗   ██║   ███████║██║██████╔╝███████╗██║  ██╗██║╚██████╗██║  ██╗
  ╚═══╝  ╚══════╝   ╚═╝   ╚══════╝╚═╝╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝ ╚═════╝╚═╝  ╚═╝

# Veterinary Podcast CPD Website

A modern, responsive website for veterinary podcasts built with Next.js, React, and Tailwind CSS.

## Features

- **Custom Veterinary Color Scheme**: Professional teal, cream, peach, and orange palette
- **Responsive Design**: Mobile-first approach with beautiful layouts across all devices
- **Podcast Player**: Custom audio player with thumbnail images, progress bar, and controls
- **Modern UI**: Clean, professional design with gradient backgrounds and smooth animations
- **TypeScript**: Full type safety throughout the application

## Tech Stack

- **Framework**: Next.js 14.2.30
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3
- **UI Components**: Custom React components
- **Audio**: HTML5 audio with custom controls

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/paul-j-townsend/gemini-cli-test-2.git
cd gemini-cli-test-2
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── components/
│   ├── Header.tsx              # Navigation header
│   ├── Footer.tsx              # Site footer
│   ├── Layout.tsx              # Main layout wrapper
│   ├── PodcastPlayer.tsx       # Podcast list container
│   └── PodcastPlayerItem.tsx   # Individual podcast player
├── pages/
│   ├── _app.tsx               # App wrapper
│   ├── index.tsx              # Home page
│   ├── about.tsx              # About page
│   └── podcasts.tsx           # Podcasts page
├── styles/
│   └── globals.css            # Global styles and Tailwind imports
public/
├── audio/
│   ├── the_future_of_uk_companion_animal_veterinary_care.mp3
│   └── the_evolving_world_of_animal_healthcare.mp3
```

## Color Palette

The website uses a custom veterinary-themed color palette:

- **Teal**: `#03A6A1` - Primary brand color for headers and accents
- **Cream**: `#FFE3BB` - Background highlights and hover states
- **Peach**: `#FFA673` - Secondary accents and progress bars
- **Orange**: `#FF4F0F` - Call-to-action elements and footer

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Podcast Content

The website currently features two veterinary podcasts:

1. **The Future of UK Companion Animal Veterinary Care** - Discussion on the future of veterinary care for companion animals in the UK
2. **The Evolving World of Animal Healthcare** - Insights into the evolving world of animal healthcare

## Customization

### Adding New Podcasts

Edit `src/components/PodcastPlayer.tsx` and add new podcast objects to the `podcasts` array:

```typescript
{
  title: 'Your Podcast Title',
  description: 'Your podcast description',
  audioSrc: '/audio/your-audio-file.mp3',
  thumbnail: 'https://your-thumbnail-url.jpg'
}
```

### Modifying Colors

Update the color palette in `tailwind.config.js`:

```javascript
extend: {
  colors: {
    'vet-teal': '#03A6A1',
    'vet-cream': '#FFE3BB', 
    'vet-peach': '#FFA673',
    'vet-orange': '#FF4F0F',
  }
}
```

## License

This project is licensed under the MIT License.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request 