import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/useAuthContext';
import { sessionService } from '../services/sessionService';

function CreateSession() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  
  const [sessionName, setSessionName] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !sessionName.trim()) {
      setError('Session name is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const session = await sessionService.createSession({
        name: sessionName.trim(),
        created_by: user.id,
        start_time: new Date().toISOString(),
        status: 'active'
          });

      navigate(`/sessions/${session.session_id}`);
    } catch (error) {
      console.error('Error creating session:', error);
      setError('Failed to create session');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 shadow-lg">
        <div className="navbar-start">
          <button onClick={() => navigate('/dashboard')} className="btn btn-ghost">
            ← Back to Dashboard
          </button>
        </div>
        <div className="navbar-center">
          <h1 className="text-xl font-bold">Create New Session</h1>
        </div>
      </div>

      <div className="container mx-auto p-4 max-w-2xl">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="alert alert-error mb-4">
                  <span>{error}</span>
                </div>
              )}
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Session Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder="e.g., Friday Night Out"
                  required
                />
              </div>

              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text">Notes (Optional)</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="Location, special rules, or other notes..."
                  rows={3}
                />
              </div>

              <div className="form-control mt-6">
                <button
                  type="submit"
                  className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateSession;
