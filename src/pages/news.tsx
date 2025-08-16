import Head from 'next/head';
import Layout from '../components/Layout';
import Image from 'next/image';

export default function News() {
  const newsArticles = [
    {
      title: "xNew WSAVA Guidelines for Vaccination Protocols Released",
      summary: "The World Small Animal Veterinary Association has published updated guidelines for core and non-core vaccination schedules for dogs and cats.",
      date: "2024-01-15",
      category: "Vaccination",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=400&h=250&fit=crop"
    },
    {
      title: "Breakthrough in Feline Chronic Kidney Disease Treatment",
      summary: "Researchers announce promising results from clinical trials of a new therapeutic approach for managing CKD in cats, showing significant improvement in quality of life.",
      date: "2024-01-12",
      category: "Research",
      readTime: "7 min read",
      image: "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=400&h=250&fit=crop"
    },
    {
      title: "Telemedicine Regulations Updated for Veterinary Practice",
      summary: "New regulatory framework provides clearer guidelines for remote consultations and prescription of medications via telemedicine platforms.",
      date: "2024-01-10",
      category: "Regulation",
      readTime: "4 min read",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop"
    },
    {
      title: "Mental Health Support Resources Expanded for Veterinary Professionals",
      summary: "Professional associations launch comprehensive mental health initiative including 24/7 support hotlines and wellness programs.",
      date: "2024-01-08",
      category: "Wellness",
      readTime: "6 min read",
      image: "https://images.unsplash.com/photo-1612277795421-9bc7706a4a34?w=400&h=250&fit=crop"
    },
    {
      title: "Antibiotic Resistance Monitoring Program Shows Concerning Trends",
      summary: "Annual surveillance report reveals increasing resistance patterns in companion animal pathogens, emphasizing need for stewardship programs.",
      date: "2024-01-05",
      category: "Public Health",
      readTime: "8 min read",
      image: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=400&h=250&fit=crop"
    },
    {
      title: "Advanced Diagnostic Imaging Technology Now Available at Regional Centers",
      summary: "New CT and MRI facilities expand access to advanced diagnostics for complex cases in underserved areas.",
      date: "2024-01-03",
      category: "Technology",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=250&fit=crop"
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Vaccination': return 'bg-blue-100 text-blue-800';
      case 'Research': return 'bg-green-100 text-green-800';
      case 'Regulation': return 'bg-purple-100 text-purple-800';
      case 'Wellness': return 'bg-pink-100 text-pink-800';
      case 'Public Health': return 'bg-red-100 text-red-800';
      case 'Technology': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <Head>
        <title>Veterinary News - Vet Sidekick</title>
        <meta name="description" content="Stay updated with the latest developments in veterinary medicine, research breakthroughs and industry news." />
      </Head>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-emerald-900 mb-4">Veterinary News</h1>
          <p className="text-lg text-emerald-700 max-w-2xl mx-auto">
            Stay updated with the latest developments in veterinary medicine, research breakthroughs, 
            and industry news that matters to animal healthcare professionals.
          </p>
        </div>

        {/* Featured Article */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-12">
          <div className="md:flex">
            <div className="md:w-1/2">
              <Image 
                src={newsArticles[0].image} 
                alt={newsArticles[0].title}
                className="w-full h-64 md:h-full object-cover"
                width={400}
                height={250}
              />
            </div>
            <div className="md:w-1/2 p-8">
              <div className="flex items-center mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(newsArticles[0].category)}`}>
                  {newsArticles[0].category}
                </span>
                <span className="text-emerald-600 text-sm ml-4">Featured Article</span>
              </div>
              <h2 className="text-2xl font-bold text-emerald-900 mb-4">{newsArticles[0].title}</h2>
              <p className="text-emerald-700 mb-6">{newsArticles[0].summary}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-emerald-600">
                  <span>{newsArticles[0].date}</span>
                  <span className="mx-2">•</span>
                  <span>{newsArticles[0].readTime}</span>
                </div>
                <button className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors">
                  Read Full Article
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Article Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {newsArticles.slice(1).map((article, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <Image 
                src={article.image} 
                alt={article.title}
                className="w-full h-48 object-cover"
                width={400}
                height={250}
              />
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex flex-wrap gap-1">
                    {article.category?.split(',').map((cat, index) => (
                      <span key={index} className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(cat.trim())}`}>
                        {cat.trim()}
                      </span>
                    ))}
                  </div>
                  <span className="text-emerald-600 text-sm">{article.readTime}</span>
                </div>
                <h3 className="text-lg font-semibold text-emerald-900 mb-2 line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-emerald-700 text-sm mb-4 line-clamp-3">{article.summary}</p>
                <div className="flex items-center justify-between">
                  <span className="text-emerald-600 text-sm">{article.date}</span>
                  <button className="text-emerald-600 hover:text-teal-700 font-medium text-sm">
                    Read More →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg p-8 mt-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Stay Informed</h2>
          <p className="text-emerald-100 mb-6 max-w-2xl mx-auto">
            Subscribe to our newsletter to receive the latest veterinary news, research updates, 
            and professional development opportunities directly in your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-4 py-2 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
            <button className="bg-white text-emerald-600 px-6 py-2 rounded-lg hover:bg-emerald-50 transition-colors font-medium">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
} 