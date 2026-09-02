"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertJourney = insertJourney;
exports.insertJourneyStep = insertJourneyStep;
exports.findActiveJourneyForUser = findActiveJourneyForUser;
exports.findJourneyById = findJourneyById;
exports.stepsForJourney = stepsForJourney;
exports.findStepById = findStepById;
exports.markStepCompleted = markStepCompleted;
exports.markStepStatus = markStepStatus;
exports.updateJourneyProgress = updateJourneyProgress;
exports.deleteJourneysForUser = deleteJourneysForUser;
const connection_1 = require("../../db/connection");
function insertJourney(j) {
    (0, connection_1.getDb)()
        .prepare(`INSERT INTO journeys (id, user_id, ticket_id, airport_id, current_step, progress, status, is_demo, started_at, completed_at)
       VALUES (@id, @user_id, @ticket_id, @airport_id, @current_step, @progress, @status, @is_demo, @started_at, @completed_at)`)
        .run(j);
}
function insertJourneyStep(s) {
    (0, connection_1.getDb)()
        .prepare(`INSERT INTO journey_steps (id, journey_id, title, description, location, node_id, step_order, status, estimated_duration, instructions, completed_at)
       VALUES (@id, @journey_id, @title, @description, @location, @node_id, @step_order, @status, @estimated_duration, @instructions, @completed_at)`)
        .run(s);
}
function findActiveJourneyForUser(userId) {
    return (0, connection_1.getDb)().prepare('SELECT * FROM journeys WHERE user_id = ? ORDER BY started_at DESC LIMIT 1').get(userId);
}
function findJourneyById(id) {
    return (0, connection_1.getDb)().prepare('SELECT * FROM journeys WHERE id = ?').get(id);
}
function stepsForJourney(journeyId) {
    return (0, connection_1.getDb)()
        .prepare('SELECT * FROM journey_steps WHERE journey_id = ? ORDER BY step_order')
        .all(journeyId);
}
function findStepById(journeyId, stepId) {
    return (0, connection_1.getDb)()
        .prepare('SELECT * FROM journey_steps WHERE journey_id = ? AND id = ?')
        .get(journeyId, stepId);
}
function markStepCompleted(stepId) {
    (0, connection_1.getDb)()
        .prepare('UPDATE journey_steps SET status = ?, completed_at = ? WHERE id = ?')
        .run('completed', new Date().toISOString(), stepId);
}
function markStepStatus(stepId, status) {
    (0, connection_1.getDb)().prepare('UPDATE journey_steps SET status = ? WHERE id = ?').run(status, stepId);
}
function updateJourneyProgress(j, currentStep, progress, status) {
    (0, connection_1.getDb)()
        .prepare('UPDATE journeys SET current_step = ?, progress = ?, status = ?, completed_at = ? WHERE id = ?')
        .run(currentStep, progress, status, status === 'completed' ? new Date().toISOString() : j.completed_at, j.id);
}
function deleteJourneysForUser(userId) {
    const db = (0, connection_1.getDb)();
    const journeys = db.prepare('SELECT id FROM journeys WHERE user_id = ?').all(userId);
    for (const j of journeys) {
        db.prepare('DELETE FROM journey_steps WHERE journey_id = ?').run(j.id);
    }
    db.prepare('DELETE FROM journeys WHERE user_id = ?').run(userId);
}
//# sourceMappingURL=journey.repo.js.map