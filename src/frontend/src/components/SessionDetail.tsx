import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/useAuthContext';
import { sessionService } from '../services/sessionService';
import { drinkService } from '../services/drinkService';
import type { Session, Drink, DrinkType, SessionParticipant } from '../types/app';

function SessionDetail() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  
  const [session, setSession] = useState<Session | null>(null);
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [drinkTypes, setDrinkTypes] = useState<DrinkType[]>([]);
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDrink, setShowAddDrink] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  // Add drink form
  const [selectedDrinkType, setSelectedDrinkType] = useState('');
  const [drinkAmount, setDrinkAmount] = useState('');

  useEffect(() => {
    if (sessionId) {
      loadSessionData();
    }
  }, [sessionId]);

  const loadSessionData = async () => {
    if (!sessionId) return;
    
    try {
      const [sessionData, sessionDrinks, drinkTypesData, sessionParticipants] = await Promise.all([
        sessionService.getSession(sessionId),
        drinkService.getSessionDrinks(sessionId),
        drinkService.getDrinkTypes(),
        sessionService.getSessionParticipants(sessionId)
      ]);
      
      setSession(sessionData);
      setDrinks(sessionDrinks);
      setDrinkTypes(drinkTypesData);
      setParticipants(sessionParticipants);
    } catch (error) {
      console.error('Error loading session data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addDrink = async () => {
    if (!user || !sessionId || !selectedDrinkType || !drinkAmount) return;
    
    try {
      await drinkService.addDrink({
        session_id: sessionId,
        user_id: user.user_id,
        drink_type_id: selectedDrinkType,
        amount_ml: parseInt(drinkAmount),
        added_at: new Date().toISOString()
      });
      
      setSelectedDrinkType('');
      setDrinkAmount('');
      setShowAddDrink(false);
      loadSessionData();
    } catch (error) {
      console.error('Error adding drink:', error);
    }
  };

  const sendInvite = async () => {
    if (!sessionId || !inviteEmail) return;
    
    try {
      await invitationService.sendInvitation(sessionId, inviteEmail);
      setInviteEmail('');
      setShowInvite(false);
      alert('Invitation sent!');
    } catch (error) {
      console.error('Error sending invitation:', error);
      alert('Failed to send invitation');
    }
  };

  const deleteDrink = async (drinkId: string) => {
    try {
      await drinkService.deleteDrink(drinkId);
      loadSessionData();
    } catch (error) {
      console.error('Error deleting drink:', error);
    }
  };

  const calculateAlcohol = (drink: Drink) => {
    if (!drink.drink_type) return 0;
    return (drink.amount_ml * drink.drink_type.alcohol_content) / 100;
  };

  const getUserStats = (userId: string) => {
    const userDrinks = drinks.filter(d => d.user_id === userId);
    const totalVolume = userDrinks.reduce((sum, d) => sum + d.amount_ml, 0);
    const totalAlcohol = userDrinks.reduce((sum, d) => sum + calculateAlcohol(d), 0);
    return { totalVolume, totalAlcohol, drinkCount: userDrinks.length };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Session not found</h1>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 shadow-lg">
        <div className="navbar-start">
          <button onClick={() => navigate('/dashboard')} className="btn btn-ghost">
            ← Back
          </button>
        </div>
        <div className="navbar-center">
          <h1 className="text-xl font-bold">{session.name}</h1>
        </div>
        <div className="navbar-end">
          <button onClick={() => setShowInvite(true)} className="btn btn-outline btn-sm mr-2">
            Invite
          </button>
          <button onClick={() => setShowAddDrink(true)} className="btn btn-primary btn-sm">
            Add Drink
          </button>
        </div>
      </div>

      <div className="container mx-auto p-4">
        {/* Session Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          {participants.map((participant) => {
            const stats = getUserStats(participant.user_id);
            return (
              <div key={participant.user_id} className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title text-sm">{participant.email}</h3>
                  <div className="stats stats-vertical text-xs">
                    <div className="stat">
                      <div className="stat-title">Drinks</div>
                      <div className="stat-value text-2xl">{stats.drinkCount}</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">Volume</div>
                      <div className="stat-value text-lg">{stats.totalVolume}ml</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">Alcohol</div>
                      <div className="stat-value text-lg">{stats.totalAlcohol.toFixed(1)}ml</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Drinks Timeline */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Drinks Timeline</h2>
            <div className="space-y-2">
              {drinks.sort((a, b) => new Date(b.added_at).getTime() - new Date(a.added_at).getTime()).map((drink) => (
                <div key={drink.drink_id} className="flex justify-between items-center p-3 bg-base-200 rounded-lg">
                  <div>
                    <span className="font-semibold">{participants.find(p => p.user_id === drink.user_id)?.email}</span>
                    <span className="ml-2">{drink.drink_type?.name}</span>
                    <span className="ml-2 text-sm text-base-content/60">{drink.amount_ml}ml</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-base-content/60">
                      {new Date(drink.added_at).toLocaleTimeString()}
                    </span>
                    {drink.user_id === user?.user_id && (
                      <button 
                        onClick={() => deleteDrink(drink.drink_id)} 
                        className="btn btn-error btn-xs"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Drink Modal */}
      {showAddDrink && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Add Drink</h3>
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Drink Type</span>
              </label>
              <select 
                className="select select-bordered"
                value={selectedDrinkType}
                onChange={(e) => setSelectedDrinkType(e.target.value)}
              >
                <option value="">Select drink type</option>
                {drinkTypes.map((type) => (
                  <option key={type.drink_type_id} value={type.drink_type_id}>
                    {type.name} ({type.alcohol_content}%)
                  </option>
                ))}
              </select>
            </div>
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Amount (ml)</span>
              </label>
              <input
                type="number"
                className="input input-bordered"
                value={drinkAmount}
                onChange={(e) => setDrinkAmount(e.target.value)}
                placeholder="e.g., 330"
              />
            </div>
            <div className="modal-action">
              <button className="btn" onClick={() => setShowAddDrink(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={addDrink}>Add Drink</button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInvite && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Invite Friend</h3>
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                className="input input-bordered"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="friend@example.com"
              />
            </div>
            <div className="modal-action">
              <button className="btn" onClick={() => setShowInvite(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={sendInvite}>Send Invite</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SessionDetail;
