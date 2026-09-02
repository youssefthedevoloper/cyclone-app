import { JourneyAccess, getJourneyAccess } from './journey.access';

export interface StepSpec {
  title: string;
  description: string;
  location: string;
  type: string;
  duration: number;
  instructions: string;
}