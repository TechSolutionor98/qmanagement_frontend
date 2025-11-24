import UserSidebar from '@/Components/UserSidebar';

export default function UserLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <UserSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
        <footer className="bg-white border-t border-gray-200 px-6 py-3">
          <p className="text-sm text-gray-600 text-right">
            © 2025 Tech Solutionor. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
