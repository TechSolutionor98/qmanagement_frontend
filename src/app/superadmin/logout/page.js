'use client';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const router = useRouter();

  const handleLogout = () => {
    // Logout logic yahan implement karen
    router.push('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-8">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-semibold text-gray-700 mb-4">Logout</h1>
        <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Yes, Logout
          </button>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
