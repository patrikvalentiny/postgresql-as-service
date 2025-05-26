export interface Session {
  session_id: string;
  name: string;
  created_by: string;
  start_time: string;
  end_time?: string;
  status: 'active' | 'ended';
  created_at: string;
}

export interface DrinkType {
  drink_type_id: number;
  name: string;
  alcohol_percentage: number;
  created_at: string;
}

export interface Drink {
  drink_id: string;
  session_id: string;
  user_id: string;
  drink_type_id: number;
  amount_ml: number;
  consumed_at: string;
  drink_types?: DrinkType;
  users?: { username: string };
}

export interface SessionParticipant {
  participant_id: string;
  session_id: string;
  user_id: string;
  joined_at: string;
  users?: { username: string };
}

export interface User {
  user_id: string;
  auth_user_id: string;
  username: string;
  created_at: string;
}
