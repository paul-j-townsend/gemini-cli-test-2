import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/Layout';
import Badge from '@/components/Badge';
import {
  PawIcon,
  HeadphoneIcon,
  PlayIcon,
  FireIcon,
  CompassIcon,
  RepeatIcon,
  PencilIcon,
  BrainIcon,
  TargetIcon,
  ArrowUpRightIcon,
  LaurelWreathIcon,
  CertificateIcon,
  MicroscopeIcon,
  UsersIcon,
  UserCheckIcon,
  ShareIcon,
  MessageSquareIcon,
  GiftIcon,
  StarIcon,
  CalendarIcon,
  CheckSquareIcon,
} from '@/components/icons/BadgeIcons';

const Badges = () => {
  const badgeCategories = [
    {
      title: 'Engagement Milestones',
      description: 'Reward users for interacting with your content regularly',
      badges: [
        {
          name: 'First Listener',
          description: 'Listened to your first podcast episode.',
          icon: <HeadphoneIcon />,
          color: 'blue',
        },
        {
          name: 'Podcast Binger',
          description: 'Listened to 5 full podcast episodes.',
          icon: <PlayIcon />,
          color: 'blue',
        },
        {
          name: 'On a Roll',
          description: 'Listened to 3 episodes in one week.',
          icon: <FireIcon />,
          color: 'orange',
        },
        {
          name: 'Season Explorer',
          description: 'Finished a whole podcast season.',
          icon: <CompassIcon />,
          color: 'green',
        },
        {
          name: 'Repeat Visitor',
          description: 'Visited the site 10 times.',
          icon: <RepeatIcon />,
          color: 'teal',
        },
      ],
    },
    {
      title: 'Quiz & Learning Achievements',
      description: 'Gamify learning and knowledge retention',
      badges: [
        {
          name: 'First Attempt',
          description: 'Completed your first quiz.',
          icon: <PencilIcon />,
          color: 'yellow',
        },
        {
          name: 'Quiz Wiz',
          description: 'Completed any quiz successfully.',
          icon: <BrainIcon />,
          color: 'purple',
        },
        {
          name: 'Knowledge Hound',
          description: 'Completed 10 quizzes.',
          icon: <TargetIcon />,
          color: 'green',
        },
        {
          name: 'Bounce Back',
          description: 'Improved your score on a retaken quiz.',
          icon: <ArrowUpRightIcon />,
          color: 'blue',
        },
        {
          name: 'Vet Savvy',
          description: 'Passed 5 RCVS-certified quizzes.',
          icon: <LaurelWreathIcon />,
          color: '#FFD700',
        },
      ],
    },
    {
      title: 'Certification & CPD Badges',
      description: 'Highlight user learning achievements with visual flair',
      badges: [
        {
          name: 'Certified Starter',
          description: 'Gained your first CPD certificate.',
          icon: <CertificateIcon />,
          color: '#FFD700',
        },
        {
          name: 'CPD Collector',
          description: 'Collected 5 CPD certificates.',
          icon: <CertificateIcon />,
          color: '#FFD700',
        },
        {
          name: 'Specialist Path',
          description: 'Completed a learning track.',
          icon: <MicroscopeIcon />,
          color: 'purple',
        },
        {
          name: 'Marathon Learner',
          description: 'Logged 10 hours of CPD.',
          icon: <PlayIcon />,
          color: 'orange',
        },
        {
          name: 'Lifelong Learner',
          description: 'Logged 50 hours of CPD.',
          icon: <LaurelWreathIcon />,
          color: '#FFD700',
        },
      ],
    },
    {
      title: 'Streaks and Consistency',
      description: 'Encourage regular interaction with time-based challenges',
      badges: [
        {
          name: '3-Day Streak',
          description: 'Logged in three days in a row.',
          icon: <FireIcon />,
          color: 'orange',
        },
        {
          name: 'Weekly Winner',
          description: 'Logged in every day for a week.',
          icon: <CalendarIcon />,
          color: 'blue',
        },
        {
          name: 'Monthly Mastery',
          description: 'Logged in 20 times in a month.',
          icon: <CheckSquareIcon />,
          color: 'green',
        },
        {
          name: 'No Days Off',
          description: 'Maintained a 30-day login streak.',
          icon: <FireIcon style={{ color: 'red' }} />,
          color: 'red',
        },
      ],
    },
    {
      title: 'Community & Profile',
      description: 'Building connections and contributing to the community',
      badges: [
        {
          name: 'Early Adopter',
          description: 'Joined within the first month of launch.',
          icon: <StarIcon />,
          color: 'teal',
        },
        {
          name: 'Profile Complete',
          description: 'Filled out your entire user profile.',
          icon: <UserCheckIcon />,
          color: 'blue',
        },
        {
          name: 'Social Sharer',
          description: 'Shared a podcast or article.',
          icon: <ShareIcon />,
          color: 'purple',
        },
        {
          name: 'Feedback Giver',
          description: 'Submitted feedback through the site.',
          icon: <MessageSquareIcon />,
          color: 'yellow',
        },
      ],
    },
    {
      title: 'Vet Sidekick Themed Fun',
      description: 'Add some personality and playfulness to your achievements',
      badges: [
        {
          name: 'Vet Squad',
          description: 'For being part of the team.',
          icon: <UsersIcon />,
          color: 'blue',
        },
        {
          name: 'Hidden Gem',
          description: 'Found an easter egg on the site.',
          icon: <GiftIcon />,
          color: 'yellow',
        },
        {
          name: 'Fearless Explorer',
          description: 'Visited every main page.',
          icon: <CompassIcon />,
          color: 'green',
        },
        {
          name: 'Holiday Special',
          description: 'Logged in during a special event.',
          icon: <GiftIcon />,
          color: 'red',
        },
      ],
    },
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'from-emerald-400 to-emerald-500';
      case 'uncommon':
        return 'from-teal-400 to-teal-500';
      case 'rare':
        return 'from-emerald-500 to-teal-600';
      case 'epic':
        return 'from-teal-500 to-emerald-600';
      case 'legendary':
        return 'from-emerald-600 to-teal-700';
      default:
        return 'from-emerald-400 to-emerald-500';
    }
  };

  const getBorderColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'border-emerald-300';
      case 'uncommon':
        return 'border-teal-300';
      case 'rare':
        return 'border-emerald-400';
      case 'epic':
        return 'border-teal-400';
      case 'legendary':
        return 'border-emerald-500';
      default:
        return 'border-emerald-300';
    }
  };

  return (
    <Layout>
      <Head>
        <title>Badges - Vet Sidekick</title>
        <meta name="description" content="Browse all the badges you can earn on Vet Sidekick." />
      </Head>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/3 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative container-wide">
          <div className="text-center animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              Professional <span className="text-gradient-primary">Badges</span>
            </h1>

            <p className="text-xl lg:text-2xl text-neutral-600 max-w-4xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              Showcase your veterinary expertise and achievements. Earn badges for clinical excellence, 
              continuous learning and community contributions.
            </p>

            <div className="mt-10 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
              <Link href="/about" className="btn-primary btn-lg">
                Learn How to Earn Badges
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Badge Categories */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-4">Your Badges</h1>
        <p className="text-lg text-gray-600 text-center mb-12">
          Unlock achievements, show off your expertise and get recognized for
          your contributions.
        </p>

        {badgeCategories.map((category) => (
          <div key={category.title} className="mb-12">
            <h2 className="text-2xl font-semibold mb-2">{category.title}</h2>
            <p className="text-gray-500 mb-6">{category.description}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
              {category.badges.map((badge) => (
                <Badge
                  key={badge.name}
                  name={badge.name}
                  description={badge.description}
                  icon={badge.icon}
                  color={badge.color}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
        <div className="container-wide text-center">
          <div className="animate-fade-in-up">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Start Earning Badges Today
            </h2>
            <p className="text-xl text-emerald-100 max-w-3xl mx-auto mb-10">
              Join our community of veterinary professionals and start building your professional badge collection. 
              Track your progress and showcase your expertise.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/forum" className="btn-secondary btn-lg bg-white text-emerald-600 hover:bg-emerald-50">
                Join the Community
              </Link>
              <Link href="/podcasts" className="btn-ghost btn-lg text-white border-white hover:bg-white/10">
                Start Learning
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Badges;