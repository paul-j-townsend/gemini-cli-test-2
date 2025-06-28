import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/Layout';

const Badges = () => {
  const badgeCategories = [
    {
      title: 'Engagement Milestones',
      description: 'Reward users for interacting with your content regularly',
      badges: [
        {
          name: 'First Listener',
          description: 'Welcome to the Vet Sidekick community!',
          icon: '🎧',
          rarity: 'common',
          criteria: 'Watched/listened to 1 full podcast',
        },
        {
          name: 'Podcast Binger',
          description: 'Getting into the learning groove',
          icon: '📺',
          rarity: 'uncommon',
          criteria: 'Completed 5 podcasts',
        },
        {
          name: 'On a Roll',
          description: 'Serious dedication to learning this month',
          icon: '🔥',
          rarity: 'rare',
          criteria: 'Completed 10 podcasts in a month',
        },
        {
          name: 'Season Explorer',
          description: 'Diverse learning across all our content',
          icon: '🗺️',
          rarity: 'epic',
          criteria: 'Listened to at least one episode from each series',
        },
        {
          name: 'Repeat Visitor',
          description: 'Building a consistent learning habit',
          icon: '📅',
          rarity: 'uncommon',
          criteria: 'Returned to the site 5 days in a row',
        },
      ],
    },
    {
      title: 'Quiz & Learning Achievements',
      description: 'Gamify learning and knowledge retention',
      badges: [
        {
          name: 'First Attempt',
          description: 'Taking the first step in testing your knowledge',
          icon: '✏️',
          rarity: 'common',
          criteria: 'Completed your first quiz',
        },
        {
          name: 'Quiz Wiz',
          description: 'Becoming a quiz master',
          icon: '🧠',
          rarity: 'uncommon',
          criteria: 'Completed 5 quizzes',
        },
        {
          name: 'Knowledge Hound',
          description: 'Perfect performance in multiple assessments',
          icon: '🎯',
          rarity: 'rare',
          criteria: 'Achieved 100% in 3 quizzes',
        },
        {
          name: 'Bounce Back',
          description: 'Perseverance and improvement mindset',
          icon: '⚡',
          rarity: 'uncommon',
          criteria: 'Scored poorly (<50%) but later aced the same quiz',
        },
        {
          name: 'Vet Savvy',
          description: 'Consistently high performance across assessments',
          icon: '🏆',
          rarity: 'epic',
          criteria: 'Averaged over 80% across 10+ quizzes',
        },
      ],
    },
    {
      title: 'Certification Badges',
      description: 'Highlight user learning achievements with visual flair',
      badges: [
        {
          name: 'Certified Starter',
          description: 'Your journey to professional excellence begins',
          icon: '🎓',
          rarity: 'common',
          criteria: 'Earned first certificate',
        },
        {
          name: 'CPD Collector',
          description: 'Building a solid foundation of knowledge',
          icon: '📜',
          rarity: 'uncommon',
          criteria: 'Earned 5 CPD certificates',
        },
        {
          name: 'Specialist Path',
          description: 'Deep expertise in a focused area',
          icon: '🔬',
          rarity: 'rare',
          criteria: 'Completed all certificates in a particular category',
        },
        {
          name: 'Marathon Learner',
          description: 'Exceptional commitment to professional development',
          icon: '🏃‍♂️',
          rarity: 'epic',
          criteria: 'Earned 10+ certificates',
        },
        {
          name: 'Lifelong Learner',
          description: 'Consistent dedication to continuous education',
          icon: '📚',
          rarity: 'legendary',
          criteria: 'Earned at least one certificate every month for 6 months',
        },
      ],
    },
    {
      title: 'Streaks and Consistency',
      description: 'Encourage regular interaction with time-based challenges',
      badges: [
        {
          name: '3-Day Streak',
          description: 'Building a learning habit',
          icon: '📈',
          rarity: 'common',
          criteria: 'Engaged with the site 3 days in a row',
        },
        {
          name: 'Weekly Winner',
          description: 'Consistent weekly engagement pattern',
          icon: '🗓️',
          rarity: 'uncommon',
          criteria: 'Completed a podcast + quiz each week for 4 weeks',
        },
        {
          name: 'Monthly Mastery',
          description: 'Regular professional development routine',
          icon: '📆',
          rarity: 'rare',
          criteria: 'Earned at least one certificate per calendar month',
        },
        {
          name: 'No Days Off',
          description: 'Incredible dedication and consistency',
          icon: '🔥',
          rarity: 'legendary',
          criteria: '30-day engagement streak',
        },
      ],
    },
    {
      title: 'Community & Profile',
      description: 'Building connections and contributing to the community',
      badges: [
        {
          name: 'Early Adopter',
          description: 'Among the first to join our community',
          icon: '🌟',
          rarity: 'rare',
          criteria: 'Joined within first 1000 users',
        },
        {
          name: 'Profile Complete',
          description: 'Professional presentation matters',
          icon: '👤',
          rarity: 'common',
          criteria: 'Filled out all profile information',
        },
        {
          name: 'Social Sharer',
          description: 'Spreading veterinary knowledge',
          icon: '📱',
          rarity: 'uncommon',
          criteria: 'Shared a podcast/achievement to social media',
        },
        {
          name: 'Feedback Giver',
          description: 'Helping improve our platform',
          icon: '💬',
          rarity: 'uncommon',
          criteria: 'Submitted a review or quiz feedback',
        },
      ],
    },
    {
      title: 'Vet Sidekick Themed Fun',
      description: 'Add some personality and playfulness to your achievements',
      badges: [
        {
          name: 'Paw-dcast Pup',
          description: 'Welcome to the pack!',
          icon: '🐶',
          rarity: 'common',
          criteria: 'First-time podcast listener',
        },
        {
          name: 'Top Dog Learner',
          description: 'Leading the pack in knowledge',
          icon: '🥇',
          rarity: 'uncommon',
          criteria: 'Earned highest score in a quiz that week',
        },
        {
          name: 'CPD Cat',
          description: 'Curious and always learning',
          icon: '🐱',
          rarity: 'uncommon',
          criteria: 'Collected 5 certificates',
        },
        {
          name: 'Fetching Facts',
          description: 'Perfect retrieval of knowledge',
          icon: '🎾',
          rarity: 'rare',
          criteria: 'Got every quiz answer right in a row (streak of 5)',
        },
        {
          name: 'Vet Sidekick Superfan',
          description: 'The ultimate achievement - you are a true sidekick!',
          icon: '🏆',
          rarity: 'legendary',
          criteria: 'Unlock all other badges',
        },
      ],
    },
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'from-gray-400 to-gray-500';
      case 'uncommon':
        return 'from-green-400 to-green-500';
      case 'rare':
        return 'from-blue-400 to-blue-500';
      case 'epic':
        return 'from-purple-400 to-purple-500';
      case 'legendary':
        return 'from-yellow-400 to-orange-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  const getBorderColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'border-gray-300';
      case 'uncommon':
        return 'border-green-300';
      case 'rare':
        return 'border-blue-300';
      case 'epic':
        return 'border-purple-300';
      case 'legendary':
        return 'border-yellow-300';
      default:
        return 'border-gray-300';
    }
  };

  return (
    <Layout>
      <Head>
        <title>Badges - Vet Sidekick</title>
        <meta name="description" content="Earn badges for your professional achievements and contributions to the veterinary community." />
      </Head>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-primary-50 via-white to-neutral-50 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/3 w-80 h-80 bg-primary-200/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-secondary-200/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative container-wide">
          <div className="text-center animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              Professional <span className="text-gradient-primary">Badges</span>
            </h1>

            <p className="text-xl lg:text-2xl text-neutral-600 max-w-4xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              Showcase your veterinary expertise and achievements. Earn badges for clinical excellence, 
              continuous learning, and community contributions.
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
      {badgeCategories.map((category, categoryIndex) => (
        <section key={categoryIndex} className={`py-20 lg:py-32 ${categoryIndex % 2 === 0 ? 'bg-white' : 'bg-gradient-to-br from-neutral-50 to-primary-50'}`}>
          <div className="container-wide">
            <div className="text-center mb-16 animate-fade-in-up">
              <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-6">
                {category.title}
              </h2>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                {category.description}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {category.badges.map((badge, badgeIndex) => (
                <div
                  key={badgeIndex}
                  className={`card-hover text-center group animate-fade-in-up p-6 ${getBorderColor(badge.rarity)} border-2`}
                  style={{ animationDelay: `${badgeIndex * 200}ms` }}
                >
                  <div className="relative mb-6">
                    <div className={`w-20 h-20 bg-gradient-to-r ${getRarityColor(badge.rarity)} rounded-full flex items-center justify-center text-white mx-auto shadow-soft group-hover:shadow-hard transition-all duration-300 text-3xl`}>
                      {badge.icon}
                    </div>
                    <div className={`absolute -bottom-2 -right-2 px-2 py-1 bg-gradient-to-r ${getRarityColor(badge.rarity)} rounded-full text-white text-xs font-semibold uppercase tracking-wide`}>
                      {badge.rarity}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                    {badge.name}
                  </h3>
                  <p className="text-neutral-600 leading-relaxed mb-4">{badge.description}</p>
                  
                  <div className="bg-neutral-50 rounded-lg p-4 mt-4">
                    <h4 className="text-sm font-semibold text-neutral-900 mb-2">Criteria:</h4>
                    <p className="text-sm text-neutral-600">{badge.criteria}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <div className="container-wide text-center">
          <div className="animate-fade-in-up">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Start Earning Badges Today
            </h2>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto mb-10">
              Join our community of veterinary professionals and start building your professional badge collection. 
              Track your progress and showcase your expertise.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/forum" className="btn-secondary btn-lg bg-white text-primary-600 hover:bg-neutral-50">
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