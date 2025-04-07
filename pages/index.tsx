import Link from 'next/link';

export default function Home() {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Welcome to RoadmapAI
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        Your intelligent product roadmap planning assistant
      </p>
      <div className="space-x-4">
        <Link href="/initiatives" className="btn-primary">
          View Initiatives
        </Link>
        <Link href="/capacity" className="btn-primary">
          Manage Capacity
        </Link>
        <Link href="/roadmap" className="btn-primary">
          View Roadmap
        </Link>
        <Link href="/metrics" className="btn-primary">
          View Metrics
        </Link>
      </div>
    </div>
  );
}
