import { useState, useEffect } from 'react';
import { useAuthContext } from '../contexts/useAuthContext';

function Dashboard() {
  const { user, logout } = useAuthContext();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // For now, just set loading to false since we don't have the services yet
    setIsLoading(false);
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 shadow-lg">
        <div className="navbar-start">
          <h1 className="btn btn-ghost text-xl">DrinkTracker</h1>
        </div>
        <div className="navbar-end">
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost">
              {user?.email}
            </div>
            <ul className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
              <li><button onClick={logout}>Logout</button></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Your Sessions</h2>
          <button className="btn btn-primary" disabled>
            Create New Session (Coming Soon)
          </button>
        </div>

        <div className="text-center py-12">
          <p className="text-lg text-base-content/60 mb-4">No sessions yet</p>
          <p className="text-sm text-base-content/40">Session management coming soon!</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
