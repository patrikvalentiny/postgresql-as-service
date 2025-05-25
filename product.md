# Alcohol Tracking App

An app that you can use with your friends to track who drank how much during a night out / session.

## Features

- **User authentication & management**  
  Register, login, manage user profiles.

- **Session management**  
  Create, update, delete, and list sessions.

- **Invitations**  
  Invite users to sessions, accept/decline invites.

- **Drink tracking**  
  Add, update, and remove drinks (alcoholic, soft, combinations) per user per session.

# Data Storage Design

For each feature, specify which data should be stored in regular columns (structured) and which in a document (JSONB/unstructured):

- **User authentication & management**  
  - Columns: user_id, username, email, password_hash, created_at, updated_at, status  
  - Document (JSONB): profile details (avatar, preferences, optional metadata)

- **Session management**  
  - Columns: session_id, name, created_by, start_time, end_time, status  
  - Document (JSONB): session notes, location info, custom rules/settings

- **Invitations**  
  - Columns: invitation_id, session_id, sender_id, recipient_id, status, sent_at, responded_at  
  - Document (JSONB): custom message, metadata (e.g., RSVP reason)

- **Drink tracking**  
  - Columns: drink_id, session_id, user_id, drink_type_id, amount_ml, added_at  
  - Document (JSONB): drink details (brand, notes, custom mix info, optional tags)