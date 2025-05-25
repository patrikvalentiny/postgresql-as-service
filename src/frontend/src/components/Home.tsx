import { Link } from 'react-router-dom'
import { useAuthContext } from '../contexts/useAuthContext'

function Home() {
  const { isAuthenticated, user, logout, isLoading } = useAuthContext()

  if (isLoading) {
    return (
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content text-center">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">PostgreSQL as a Service</h1>
          <p className="py-6">
            Exploring how PostgreSQL can replace specialized backend tools and services.
          </p>
          
          {isAuthenticated ? (
            <div className="space-y-4">
              <div className="alert alert-success">
                <span>Welcome back, {user?.email}!</span>
              </div>
              <div className="space-x-4">
                <button onClick={logout} className="btn btn-outline">
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="space-x-4">
              <Link to="/login" className="btn btn-primary">
                Login
              </Link>
              <Link to="/register" className="btn btn-secondary">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home
