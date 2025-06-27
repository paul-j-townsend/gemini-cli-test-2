import Layout from '../components/Layout';

export default function Forum() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Community Forum</h1>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Welcome to the Veterinary Community</h2>
            <p className="text-gray-600 mb-4">
              Connect with fellow veterinary professionals, share experiences, ask questions, and discuss the latest trends in animal healthcare.
            </p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Start New Discussion
            </button>
          </div>

          <div className="grid gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">DR</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-gray-900">Dr. Sarah Robertson</h3>
                    <span className="text-sm text-gray-500">• 2 hours ago</span>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    New Treatment Protocols for Feline Diabetes
                  </h4>
                  <p className="text-gray-600 mb-3">
                    Has anyone tried the new insulin protocols discussed in the recent JFMS publication? 
                    I'm particularly interested in the continuous glucose monitoring approach...
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>12 replies</span>
                    <span>•</span>
                    <span>45 views</span>
                    <span>•</span>
                    <span className="text-blue-600">Endocrinology</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold">MJ</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-gray-900">Dr. Michael Johnson</h3>
                    <span className="text-sm text-gray-500">• 4 hours ago</span>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Best Practices for Remote Consultations
                  </h4>
                  <p className="text-gray-600 mb-3">
                    With telemedicine becoming more common, what are your go-to tools and techniques 
                    for effective remote consultations with pet owners?
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>8 replies</span>
                    <span>•</span>
                    <span>23 views</span>
                    <span>•</span>
                    <span className="text-blue-600">Technology</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-semibold">LM</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-gray-900">Dr. Lisa Martinez</h3>
                    <span className="text-sm text-gray-500">• 6 hours ago</span>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Mental Health Resources for Veterinary Professionals
                  </h4>
                  <p className="text-gray-600 mb-3">
                    Let's discuss strategies for maintaining mental health in our demanding profession. 
                    What resources have you found most helpful?
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>15 replies</span>
                    <span>•</span>
                    <span>67 views</span>
                    <span>•</span>
                    <span className="text-blue-600">Wellness</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button className="text-blue-600 hover:text-blue-800 font-medium">
              Load More Discussions
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
} 