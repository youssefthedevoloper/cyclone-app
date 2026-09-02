import { getDb } from '../../db/connection';

export interface JourneyRow {
  id: string;
  user_id: string;
  ticket_id: string | null;
  airport_id: string;
  current_step: number;
  progress: number;
  status: string;
  is_demo: number;
  started_at: string;
  completed_at: string | null;
}

export interface JourneyStepRow {
  id: string;
  journey_id: string;
  title: string;
  description: string;
  location: string;
  node_id: string | null;
  step_order: number;
  status: string;
  estimated_duration: number | null;
  instructions: string | null;
  completed_at: string | null;
}

export function insertJourney(j: JourneyRow) {
  getDb()
    .prepare(
      `INSERT INTO journeys (id, user_id, ticket_id, airport_id, current_step, progress, status, is_demo, started_at, completed_at)
       VALUES (@id, @user_id, @ticket_id, @airport_id, @current_step, @progress, @status, @is_demo, @started_at, @completed_at)`
    )
    .run(j);
}

export function insertJourneyStep(s: JourneyStepRow) {
  getDb()
    .prepare(
      `INSERT INTO journey_steps (id, journey_id, title, description, location, node_id, step_order, status, estimated_duration, instructions, completed_at)
       VALUES (@id, @journey_id, @title, @description, @location, @node_id, @step_order, @status, @estimated_duration, @instructions, @completed_at)`
    )
    .run(s);
}

export function findActiveJourneyForUser(userId: string): JourneyRow | undefined {
  return getDb().prepare('SELECT * FROM journeys WHERE user_id = ? ORDER BY started_at DESC LIMIT 1').get(userId) as JourneyRow | undefined;
}

export function findJourneyById(id: string): JourneyRow | undefined {
  return getDb().prepare('SELECT * FROM journeys WHERE id = ?').get(id) as JourneyRow | undefined;
}

export function stepsForJourney(journeyId: string): JourneyStepRow[] {
  return getDb()
    .prepare('SELECT * FROM journey_steps WHERE journey_id = ? ORDER BY step_order')
    .all(journeyId) as JourneyStepRow[];
}

export function findStepById(journeyId: string, stepId: string): JourneyStepRow | undefined {
  return getDb()
    .prepare('SELECT * FROM journey_steps WHERE journey_id = ? AND id = ?')
    .get(journeyId, stepId) as JourneyStepRow | undefined;
}

export function markStepCompleted(stepId: string) {
  getDb()
    .prepare('UPDATE journey_steps SET status = ?, completed_at = ? WHERE id = ?')
    .run('completed', new Date().toISOString(), stepId);
}

export function markStepStatus(stepId: string, status: string) {
  getDb().prepare('UPDATE journey_steps SET status = ? WHERE id = ?').run(status, stepId);
}

export function updateJourneyProgress(j: JourneyRow, currentStep: number, progress: number, status: string) {
  getDb()
    .prepare(
      'UPDATE journeys SET current_step = ?, progress = ?, status = ?, completed_at = ? WHERE id = ?'
    )
    .run(currentStep, progress, status, status === 'completed' ? new Date().toISOString() : j.completed_at, j.id);
}

export function deleteJourneysForUser(userId: string) {
  const db = getDb();
  const journeys = db.prepare('SELECT id FROM journeys WHERE user_id = ?').all(userId) as any[];
  for (const j of journeys) {
    db.prepare('DELETE FROM journey_steps WHERE journey_id = ?').run(j.id);
  }
  db.prepare('DELETE FROM journeys WHERE user_id = ?').run(userId);
}