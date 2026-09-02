import { getDb } from '../../db/connection';
import { genId } from '../../utils/ids';
import { badRequest, forbidden, notFound, unauthorized } from '../../utils/errors';
import { getJourneyAccess } from './journey.access';
import { AuthService } from '../auth/auth.service';
import { LOYALTY_RULES, config } from '../../config';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { NotificationService } from '../notifications/notification.service';
import { findAirportByCode } from '../airports/airport.repo';
import {
  insertJourney,
  insertJourneyStep,
  findActiveJourneyForUser,
  findJourneyById,
  stepsForJourney,
  findStepById,
  markStepCompleted,
  markStepStatus,
  updateJourneyProgress,
  JourneyStepRow,
} from './journey.repo';
import { nodesForAirport } from '../airports/airport.repo';
import { findRoute } from '../airports/navigation';

const StepCatalog: any[] = [
  { title: 'Arrive at Airport', description: 'Arrive at the airport with enough time before departure.', location: 'Arrivals Hall', type: 'entrance', duration: 15, instructions: 'Follow airport entrance signs. Have your documents ready.' },
  { title: 'Check-in', description: 'Check in for your flight and drop any checked luggage.', location: 'Check-in', type: 'checkin', duration: 20, instructions: 'Approach the check-in counter: counters 1-20. Have your passport and booking reference ready.' },
  { title: 'Baggage Drop', description: 'Drop off any checked luggage.', location: 'Baggage Drop', type: 'baggage', duration: 10, instructions: 'Weigh your luggage at Baggage Drop K. Tags will be printed automatically.' },
  { title: 'Security Check', description: 'Pass through airport security screening.', location: 'Security', type: 'security', duration: 15, instructions: 'Remove liquids and electronics. Place coats and metallic items in the tray.' },
  { title: 'Passport Control', description: 'Clear passport and document check.', location: 'Passport Control', type: 'passport', duration: 10, instructions: 'Scan your passport at the automatic e-gates for faster processing.' },
  { title: 'Gate', description: 'Proceed to your departure gate.', location: 'Gate A14', type: 'gate', duration: 12, instructions: 'Follow signs for Gate A14. Keep an ear out for boarding announcements.' },
  { title: 'Boarding', description: 'Boarding begins shortly. Be at the gate on time.', location: 'Gate A14', type: 'boarding', duration: 5, instructions: 'Have your boarding pass ready. Boarding groups are called in order.' },
];

export class JourneyService {
  constructor(
    private loyalty = new LoyaltyService(),
    private notifications = new NotificationService()
  ) {}

  getJourney(userId: string, accountNumber: number) {
    const access = getJourneyAccess(userId, accountNumber);
    if (access.type === 'required') {
      return { access: 'required', message: 'Add your travel ticket to unlock your personalized Journey.', journey: null };
    }

    // Regenerate journeys if airport data changed or if no journey exists
    let journey = findActiveJourneyForUser(userId);
    if (!journey || journey.is_demo !== (access.type === 'demo' ? 1 : 0)) {
      if (!journey) {
        const airport = findAirportByCode(access.airportCode);
        if (!airport) return { access: access.type, journey: null };
        journey = {
          id: genId('jny'),
          user_id: userId,
          ticket_id: access.ticket ? access.ticket.id : null,
          airport_id: airport.id,
          current_step: 0,
          progress: 0,
          status: 'in_progress',
          is_demo: access.type === 'demo' ? 1 : 0,
          started_at: new Date().toISOString(),
          completed_at: null,
        };
        insertJourney(journey);
        this.buildSteps(journey.id, 'CAI', access.type === 'personal');
      }
      journey = findActiveJourneyForUser(userId)!;
    }

    const steps = stepsForJourney(journey.id).map((s) => this.decorateStep(s, access));
    const currentStep = steps[journey.current_step] || null;
    const nextStep = steps[journey.current_step + 1] || null;

    return {
      access: access.type,
      reason: access.reason,
      journey: {
        id: journey.id,
        status: journey.status,
        progress: Math.round(journey.progress),
        currentStepIndex: journey.current_step,
        isDemo: journey.is_demo === 1,
        startedAt: journey.started_at,
        completedAt: journey.completed_at,
        stepCount: steps.length,
        flight: {
          flightNumber: access.flight ? access.flight.flight_number : access.ticket?.booking_reference || null,
          airline: access.flight ? access.flight.airline : 'CYCLONE Demo',
          origin: access.ticket ? access.ticket.origin : 'CAI',
          destination: access.ticket ? access.ticket.destination : 'DXB',
          departureTime: access.flight ? access.flight.departure_time : access.ticket?.departure_time || null,
          terminal: access.flight ? access.flight.terminal : access.ticket?.terminal || '2',
          gate: access.flight ? access.flight.gate : access.ticket?.gate || 'A14',
          status: access.flight ? access.flight.status : access.ticket?.status || 'Scheduled',
          isDemoTicket: ticketIsDemo(access.ticket),
        },
        steps,
        currentStep,
        nextStep,
      },
    };
  }

  private buildSteps(journeyId: string, _airportCode: string, isPersonal: boolean) {
    const nodes = nodesForAirport(findAirportByCode('CAI')!.id);
    StepCatalog.forEach((spec, idx) => {
      const node = nodes.find((n) => n.type === spec.type) || null;
      const step: JourneyStepRow = {
        id: genId('jst'),
        journey_id: journeyId,
        title: spec.title,
        description: spec.description,
        location: spec.location,
        node_id: node ? node.id : null,
        step_order: idx,
        status: idx === 0 ? 'current' : 'upcoming',
        estimated_duration: spec.duration,
        instructions: isPersonal ? spec.instructions : spec.instructions,
        completed_at: null,
      };
      insertJourneyStep(step);
    });
  }

  private decorateStep(step: JourneyStepRow, access: any) {
    let navigation = null;
    let route = null;
    const nodes = nodesForAirport(findAirportByCode('CAI')!.id);
    const node = nodes.find((n) => n.id === step.node_id) || null;
    if (node) {
      navigation = {
        id: node.id,
        name: node.name,
        type: node.type,
        terminal: node.terminal,
      };
      // route from entrance node to this step's node
      const entrance = nodes.find((n) => n.type === 'entrance') || nodes[0];
      if (entrance && node.id !== entrance.id) {
        const r = findRoute('CAI', entrance.id, node.id, nodes);
        if (r.found) route = { distance: r.distance, walkingTime: r.walkingTime, route: r.nodes };
      }
    }
    return {
      id: step.id,
      title: step.title,
      description: step.description,
      location: step.location,
      order: step.step_order,
      status: step.status,
      estimatedDuration: step.estimated_duration,
      instructions: step.instructions,
      completedAt: step.completed_at,
      navigation,
      route,
    };
  }

  completeStep(userId: string, journeyId: string, stepId: string) {
    const journey = findJourneyById(journeyId);
    if (!journey) throw notFound('Journey not found');
    if (journey.user_id !== userId) throw forbidden('You do not own this journey');

    let step = findStepById(journeyId, stepId);
    if (!step) throw notFound('Step not found');
    const accountRow = getDb().prepare('SELECT account_number FROM users WHERE id = ?').get(userId) as any;
    const accountNumber = accountRow ? accountRow.account_number : 0;
    if (step.status === 'completed') {
      // idempotent
      return this.getJourney(userId, accountNumber);
    }

    const steps = stepsForJourney(journeyId);
    const stepIndex = steps.findIndex((s) => s.id === stepId);
    if (stepIndex < 0) throw badRequest('Step not in journey');

    markStepCompleted(stepId);

    const updatedSteps = stepsForJourney(journeyId);
    const newlyCompleted = updatedSteps.filter((s) => s.status === 'completed').length;
    let allComplete = newlyCompleted === updatedSteps.length;
    let progress = Math.round((newlyCompleted / updatedSteps.length) * 100);

    const user = getDb().prepare('SELECT account_number, loyalty_points FROM users WHERE id = ?').get(userId) as any;

    // Award journey completion points (once)
    const loyalty = new LoyaltyService();
    const awardResult = loyalty.awardJourneyCompletion(userId, stepIndex);

    // If all complete, award bonus and mark journey complete
    if (allComplete) {
      updateJourneyProgress(journey, updatedSteps.length - 1, 100, 'completed');
      loyalty.awardAllStepsBonus(userId);
      this.notifications.create(userId, 'Journey complete', 'Congrats! You completed your journey. +50 bonus Cyclone Points awarded.', 'loyalty');
    } else {
      const newCurrent = stepIndex + 1;
      if (newCurrent < updatedSteps.length) {
        markStepStatus(updatedSteps[newCurrent].id, 'current');
      }
      // any upcoming beyond that stay upcoming
      for (let i = newCurrent + 1; i < updatedSteps.length; i++) {
        if (updatedSteps[i].status === 'current') markStepStatus(updatedSteps[i].id, 'upcoming');
      }
      updateJourneyProgress(journey, newCurrent, progress, 'in_progress');
      const pct = progress;
      if (pct >= 60) {
        this.notifications.create(userId, 'Journey progress', `Your Journey is ${pct}% complete. Keep going!`, 'journey');
      }
      this.notifications.create(userId, 'Step completed', `You completed ${step.title}.`, 'journey');
    }

    return this.getJourney(userId, user.account_number);
  }

  getJourneyById(userId: string, journeyId: string, accountNumber: number) {
    const journey = findJourneyById(journeyId);
    if (!journey) throw notFound('Journey not found');
    if (journey.user_id !== userId) throw forbidden('You do not own this journey');
    return this.getJourney(userId, accountNumber);
  }

  canAccess(userId: string, accountNumber: number) {
    const access = getJourneyAccess(userId, accountNumber);
    return access.type !== 'required';
  }
}

function ticketIsDemo(ticket: any): boolean {
  return !!ticket && !!ticket.is_demo;
}