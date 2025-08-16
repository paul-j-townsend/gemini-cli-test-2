import Head from 'next/head';
import Layout from '../components/Layout';

export default function Jobs() {
  const jobListings = [
    {
      title: "Senior Veterinary Surgeon",
      company: "City Animal Hospital",
      location: "London, UK",
      type: "Full-time",
      salary: "£45,000 - £60,000",
      posted: "2 days ago",
      description: "We are seeking an experienced veterinary surgeon to join our busy small animal practice. The ideal candidate will have 3+ years of experience in general practice.",
      requirements: ["RCVS registration", "3+ years experience", "Small animal focus", "Excellent communication skills"],
      benefits: ["Competitive salary", "CPD allowance", "Health insurance", "Pension scheme"]
    },
    {
      title: "Veterinary Nurse",
      company: "Countryside Veterinary Clinic",
      location: "Manchester, UK",
      type: "Full-time",
      salary: "£22,000 - £28,000",
      posted: "1 week ago",
      description: "Join our friendly team providing high-quality care for companion animals. We offer excellent training opportunities and career development.",
      requirements: ["RVN qualification", "1+ years experience", "Team player", "Compassionate nature"],
      benefits: ["Training opportunities", "Flexible hours", "Staff discounts", "Career progression"]
    },
    {
      title: "Locum Veterinary Surgeon",
      company: "VetStaff Solutions",
      location: "Various locations",
      type: "Contract",
      salary: "£350 - £450 per day",
      posted: "3 days ago",
      description: "Flexible locum positions available across the UK. Perfect for experienced vets looking for work-life balance and variety.",
      requirements: ["RCVS registration", "5+ years experience", "Own transport", "Flexible availability"],
      benefits: ["Competitive daily rates", "Flexible schedule", "Travel expenses", "Professional indemnity"]
    },
    {
      title: "Head of Veterinary Services",
      company: "Regional Animal Charity",
      location: "Birmingham, UK",
      type: "Full-time",
      salary: "£55,000 - £70,000",
      posted: "5 days ago",
      description: "Lead our veterinary team in providing exceptional care to rescued animals. This role combines clinical work with management responsibilities.",
      requirements: ["RCVS registration", "Management experience", "Charity sector knowledge", "Leadership skills"],
      benefits: ["Leadership role", "Making a difference", "Excellent benefits", "Professional development"]
    },
    {
      title: "Farm Animal Veterinarian",
      company: "Rural Veterinary Practice",
      location: "Yorkshire, UK",
      type: "Full-time",
      salary: "£38,000 - £50,000",
      posted: "1 week ago",
      description: "Join our large animal team serving farming communities. Experience with cattle, sheep and pigs preferred.",
      requirements: ["RCVS registration", "Large animal experience", "On-call availability", "Valid driving license"],
      benefits: ["Company vehicle", "Rural lifestyle", "Varied work", "Supportive team"]
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Full-time': return 'bg-green-100 text-green-800';
      case 'Part-time': return 'bg-emerald-100 text-emerald-800';
      case 'Contract': return 'bg-purple-100 text-purple-800';
      default: return 'bg-emerald-100 text-emerald-800';
    }
  };

  return (
    <Layout>
      <Head>
        <title>Veterinary Jobs - Vet Sidekick</title>
        <meta name="description" content="Find your next career opportunity in veterinary medicine. Browse jobs from general practice to specialized roles." />
      </Head>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-emerald-900 mb-4">Veterinary Jobs</h1>
          <p className="text-lg text-emerald-700 max-w-2xl mx-auto">
            Find your next career opportunity in veterinary medicine. Explore positions from general practice to specialized roles across the UK.
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid gap-4 md:grid-cols-4">
            <input
              type="text"
              placeholder="Job title or keyword"
              className="px-4 py-2 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <input
              type="text"
              placeholder="Location"
              className="px-4 py-2 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <select className="px-4 py-2 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option>All job types</option>
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
            </select>
            <button className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors">
              Search Jobs
            </button>
          </div>
        </div>

        {/* Job Listings */}
        <div className="space-y-6">
          {jobListings.map((job, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-semibold text-emerald-900">{job.title}</h2>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(job.type)}`}>
                      {job.type}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-emerald-600 mb-3">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                      </svg>
                      {job.company}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      {job.location}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                      </svg>
                      {job.salary}
                    </span>
                    <span className="text-emerald-500">• {job.posted}</span>
                  </div>

                  <p className="text-emerald-700 mb-4">{job.description}</p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-emerald-900 mb-2">Requirements:</h4>
                      <ul className="text-sm text-emerald-600 space-y-1">
                        {job.requirements.map((req, idx) => (
                          <li key={idx} className="flex items-center">
                            <svg className="w-3 h-3 mr-2 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                            </svg>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-emerald-900 mb-2">Benefits:</h4>
                      <ul className="text-sm text-emerald-600 space-y-1">
                        {job.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-center">
                            <svg className="w-3 h-3 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                            </svg>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="mt-4 lg:mt-0 lg:ml-6 flex-shrink-0">
                  <button className="w-full lg:w-auto bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors mb-2">
                    Apply Now
                  </button>
                  <button className="w-full lg:w-auto border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                    Save Job
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="bg-gray-100 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors">
            Load More Jobs
          </button>
        </div>

        {/* Job Alert Signup */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-8 mt-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Get Job Alerts</h2>
          <p className="text-green-100 mb-6 max-w-2xl mx-auto">
            Never miss an opportunity! Sign up for job alerts and get notified when new veterinary positions match your criteria.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-4 py-2 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-green-300"
            />
            <button className="bg-white text-green-600 px-6 py-2 rounded-lg hover:bg-green-50 transition-colors font-medium">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
} 