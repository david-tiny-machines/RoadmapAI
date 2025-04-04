import { useAuth } from '../contexts/AuthContext';

export default function TestPage() {
  const { user } = useAuth();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Authentication Test Page</h1>
      {user ? (
        <div>
          <p className="mb-2">You are logged in as:</p>
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      ) : (
        <p>You are not logged in.</p>
      )}
    </div>
  );
} 