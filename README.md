
██╗   ██╗███████╗████████╗███████╗██╗██████╗ ███████╗██╗  ██╗██╗ ██████╗██╗  ██╗
██║   ██║██╔════╝╚══██╔══╝██╔════╝██║██╔══██╗██╔════╝██║ ██╔╝██║██╔════╝██║ ██╔╝
██║   ██║█████╗     ██║   ███████╗██║██║  ██║█████╗  █████╔╝ ██║██║     █████╔╝
╚██╗ ██╔╝██╔══╝     ██║   ╚════██║██║██║  ██║██╔══╝  ██╔═██╗ ██║██║     ██╔═██╗
 ╚████╔╝ ███████╗   ██║   ███████║██║██████╔╝███████╗██║  ██╗██║╚██████╗██║  ██╗
  ╚═══╝  ╚══════╝   ╚═╝   ╚══════╝╚═╝╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝ ╚═════╝╚═╝  ╚═╝

# VetSidekick CPD Platform

A comprehensive veterinary education platform providing podcast-based continuing professional development (CPD) with interactive quizzes, progress tracking, and gamification features. Built with Next.js 14, TypeScript, and Supabase.

## ✨ Key Features

### 🎧 **Restructured Podcast Experience**

- **Compact Episode Cards**: Streamlined design with audio previews and click-through navigation
- **Series Organization**: Episodes grouped by category (Zoonoses, Surgery, Emergency Medicine, etc.)
- **Collapsible Series**: Expandable sections with episode counts and descriptions
- **Enhanced Player Page**: Dedicated full-featured player with permanent quiz and report buttons

### 📚 **Comprehensive CPD System**

- **Interactive Quizzes**: Multiple-choice questions with detailed explanations and rationale
- **Progress Tracking**: Real-time completion status and scoring with pass/fail indicators
- **Certificate Generation**: Professional PDF certificates for completed courses
- **CPD Reports**: Detailed learning outcome reports for professional development tracking

### 🎯 **Advanced Features**

- **Unified Content Management**: Seamless integration of podcasts, quizzes, and progress tracking
- **Role-Based Access**: Multi-tier permission system (super_admin, admin, editor, user, viewer)
- **Supabase Integration**: Full backend with Row Level Security and real-time updates
- **Responsive Design**: Mobile-first approach optimized for all devices
- **TypeScript**: Complete type safety throughout the application

## 🛠️ Tech Stack

### **Frontend**

- **Framework**: Next.js 14.2.30 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS v3 with custom design system
- **UI Components**: Custom React components with hooks
- **Audio**: HTML5 audio with advanced controls and progress tracking

### **Backend & Database**

- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth with role-based permissions
- **Storage**: Supabase Storage for audio files and images
- **API**: Next.js API routes with TypeScript
- **Real-time**: Supabase real-time subscriptions

### **Key Services**

- **Quiz Management**: Complete CRUD operations with scoring logic
- **Progress Tracking**: User completion status and achievement system
- **Report Generation**: PDF generation for CPD certificates and reports
- **Content Management**: Unified system for podcasts, quizzes, and articles

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **npm** or **yarn**
- **Supabase Account** (for database and authentication)

### Environment Setup

1. **Clone the repository:**

```bash
git clone https://github.com/paul-j-townsend/gemini-cli-test-2.git
cd gemini-cli-test-2
```

2. **Install dependencies:**

```bash
npm install
```

3. **Configure environment variables:**

```bash
cp .env.local.example .env.local
```

Add your Supabase credentials to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. **Run database migrations:**

```bash
npx supabase migration up
```

5. **Start the development server:**

```bash
npm run dev
```

6. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── components/
│   ├── Layout.tsx                    # Main layout wrapper
│   ├── CompactEpisodeCard.tsx        # Streamlined episode cards with preview
│   ├── SeriesGroup.tsx               # Collapsible series organization
│   ├── PodcastPlayer.tsx             # Full-featured audio player
│   ├── Quiz.tsx                      # Interactive quiz component
│   └── admin/
│       └── PodcastManagement.tsx     # Admin interface for content
├── pages/
│   ├── _app.tsx                      # App wrapper with user context
│   ├── index.tsx                     # Home page
│   ├── podcasts.tsx                  # Restructured episodes page
│   ├── player.tsx                    # Enhanced player page
│   ├── admin.tsx                     # Admin dashboard
│   └── api/
│       ├── admin/content.ts          # Unified content management
│       ├── quizzes/[id].ts          # Quiz CRUD operations
│       └── quiz-completions.ts       # Progress tracking
├── services/
│   ├── podcastService.ts             # Podcast data management
│   ├── quizCompletionService.ts      # Quiz completion logic
│   └── reportGenerator.ts            # PDF certificate/report generation
├── hooks/
│   ├── useQuizCompletion.ts          # Quiz progress hooks
│   └── usePodcastManagement.ts       # Podcast admin hooks
├── types/
│   └── database.ts                   # TypeScript interfaces
├── lib/
│   ├── supabase.ts                   # Supabase client
│   └── supabase-admin.ts             # Admin client
supabase/
├── migrations/                       # Database schema migrations
└── seed.sql                         # Initial data setup
```

## 🎨 Design System

### Color Palette

The platform uses a modern, professional color scheme:

Use these in the codebase:

TODO: implement these?

- **Primary Teal**: `#14b8a6`
- **Secondary Teal**: `#2dd4bf`
- **Accent Blue**: `#2563eb`
- **Neutral Gray 100**: `#f3f4f6`
- **Neutral Gray 700**: `#374151`
- **Success Green**: `#22c55e`
- **Warning Orange**: `#f59e42`

### UI Components

- **Cards**: Elevated surfaces with soft shadows and rounded corners
- **Buttons**: Primary, secondary, and ghost variants with hover states
- **Progress Bars**: Visual indicators for audio playback and quiz progress
- **Badges**: Status indicators for quiz completion and episode metadata

## 🛠️ Available Scripts

### Development

- `npm run dev` - Start development server (<http://localhost:3000>)
- `npm run build` - Build optimized production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality

### Database

- `npx supabase start` - Start local Supabase instance
- `npx supabase migration up` - Apply database migrations
- `npx supabase db reset` - Reset database to initial state

## 📚 Content Management

### Current Series

The platform organizes content into veterinary education series:

1. **Zoonoses Series** - Diseases transmissible between animals and humans
2. **General Practice** - Comprehensive veterinary topics
3. **Emergency Medicine** - Critical care and emergency protocols
4. **Surgery** - Advanced surgical techniques and procedures
5. **Nutrition** - Animal nutrition science and dietary management

## 🔧 Development Guide

### Adding New Content

#### Creating Episodes

1. **Access Admin Dashboard**: Navigate to `/admin` with admin permissions
2. **Content Management**: Use the unified content creation interface
3. **Upload Audio**: Use the audio upload functionality for episode files
4. **Create Quiz**: Add interactive quiz questions with explanations
5. **Publish**: Set episode status to published when ready

#### Episode Structure

```typescript
interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  audio_src: string | null;
  full_audio_src: string | null;
  thumbnail_path: string | null;
  category: string; // Series classification
  episode_number: number;
  season: number;
  published_at: string;
  content_id: string; // Links to quiz
}
```

### Database Schema

#### Key Tables

- **`vsk_content`**: Unified content management (episodes + quizzes)
- **`vsk_content_questions`**: Quiz questions with explanations
- **`vsk_content_question_answers`**: Multiple choice answers
- **`vsk_content_completions`**: User progress and scores
- **`vsk_users`**: User profiles and roles

### API Endpoints

#### Content Management

- `GET /api/admin/content` - Fetch all content
- `POST /api/admin/content` - Create new content
- `PUT /api/admin/content` - Update existing content
- `DELETE /api/admin/content` - Remove content

#### Quiz System

- `GET /api/quizzes/[id]` - Get quiz with questions
- `POST /api/quiz-completions` - Submit quiz answers
- `GET /api/user-progress` - User completion statistics

## 🚀 Recent Updates

### v2.0 - Podcast Restructuring (Latest)

- ✅ **Compact Episode Design**: Streamlined cards with audio previews
- ✅ **Series Organization**: Episodes grouped by veterinary specialties
- ✅ **Enhanced Player Page**: Permanent quiz and report buttons
- ✅ **CPD Report Generation**: Professional PDF certificates and reports
- ✅ **Unified Content System**: Seamless podcast-quiz integration
- ✅ **Improved Navigation**: Click-through from preview to full player

### Previous Releases

- **v1.5**: Unified content management system
- **v1.4**: Interactive quiz system with progress tracking
- **v1.3**: Supabase integration and user authentication
- **v1.2**: Audio player enhancements
- **v1.1**: Admin dashboard and content management
- **v1.0**: Initial podcast platform release

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions to improve the VetSidekick platform!

### How to Contribute

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Maintain test coverage for new features
- Use conventional commit messages
- Update documentation for API changes

## 📞 Support

For questions, issues, or feature requests:

- 📧 **Email**: <support@vetsidekick.com>
- 🐛 **Issues**: [GitHub Issues](https://github.com/paul-j-townsend/vetsidekick/issues)
- 📖 **Documentation**: [Wiki](https://github.com/paul-j-townsend/vetsidekick/wiki)
