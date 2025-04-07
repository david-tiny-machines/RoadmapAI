import Link from 'next/link';
// Remove MainLayout import if no longer needed, or keep if other layout elements are used
// import MainLayout from '../../components/layout/MainLayout';

const AgentsPage = () => {
  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        AI Agents
      </h1>
      <p className="text-gray-700 mb-8">
        Explore AI-powered agents designed to assist with various product management tasks.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* PRD Generator Agent Card */}
        <div className="bg-white shadow-soft rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">PRD Generator</h2>
          <p className="text-gray-600 mb-4">
            Generate a Product Requirements Document (PRD) through a guided conversational process.
          </p>
          <Link href="/agents/prd-generator">
            <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 cursor-pointer">
              Launch Agent
            </span>
          </Link>
        </div>

        {/* Add more agent cards here in the future */}
        {/*
        <div className="bg-white shadow-soft rounded-lg p-6 border border-gray-200 opacity-50 cursor-not-allowed">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Forecast Explainer (Coming Soon)</h2>
          <p className="text-gray-600 mb-4">
            Get explanations for changes in roadmap forecasts.
          </p>
          <span className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-400 bg-gray-100">
            Coming Soon
          </span>
        </div>
        */}
      </div>
    </>
  );
};

export default AgentsPage; 