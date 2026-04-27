-- Existing decisions table
CREATE TABLE IF NOT EXISTS decisions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  decision TEXT NOT NULL,
  context TEXT NOT NULL,
  horizon TEXT NOT NULL,
  result TEXT,
  outcome TEXT CHECK(outcome IN ('good', 'bad', 'neutral')),
  outcome_note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_decisions_user_id ON decisions(user_id);
CREATE INDEX IF NOT EXISTS idx_decisions_created_at ON decisions(created_at);

-- Users table (for profile feature, next milestone)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  display_name TEXT,
  email TEXT,
  risk_tolerance TEXT CHECK(risk_tolerance IN ('low', 'medium', 'high')) DEFAULT 'medium',
  decision_style TEXT,
  life_context TEXT,
  goals TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
