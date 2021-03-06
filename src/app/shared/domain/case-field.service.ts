import { Injectable } from '@angular/core';
import { CaseField } from './definition/case-field.model';

@Injectable()
export class CaseFieldService {

  public isReadOnly (field: CaseField) {
    if (!field || !field.display_context) {
      return false;
    }
    return field.display_context.toUpperCase() === 'READONLY';
  }

  public isMandatory (field: CaseField) {
    if (!field || !field.display_context) {
      return false;
    }
    return field.display_context.toUpperCase() === 'MANDATORY';
  }
}
