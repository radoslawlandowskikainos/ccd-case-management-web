import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CaseEditComponent } from './case-edit.component';
import { Router } from '@angular/router';
import { Confirmation } from './confirmation.model';

@Component({
  templateUrl: './case-edit-confirm.html',
  styleUrls: ['./case-edit.scss']
})
export class CaseEditConfirmComponent {

  private caseId: string;

  triggerText = 'Close and Return to case details';
  formGroup = new FormControl();
  confirmation: Confirmation;

  constructor(private caseEdit: CaseEditComponent, private router: Router) {
    if (this.caseEdit.confirmation) {
      this.confirmation = this.caseEdit.confirmation;
      this.caseId = this.caseEdit.confirmation.getCaseId();
    } else {
      this.router.navigate(['/']);
    }
  }

  submit(): void {
    this.caseEdit.submitted.emit({caseId: this.confirmation.getCaseId(), status: this.confirmation.getStatus()});
  }
}
