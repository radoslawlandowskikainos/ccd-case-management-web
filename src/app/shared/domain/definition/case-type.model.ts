import { CaseEvent } from './case-event.model';
import { CaseState } from './case-state.model';
import { CaseField } from './case-field.model';
import { Jurisdiction } from './jurisdiction.model';

export class CaseType {
  id: string;
  name: string;
  events: CaseEvent[];
  states: CaseState[];
  case_fields: CaseField[];
  description: string;
  jurisdiction: Jurisdiction;
}
