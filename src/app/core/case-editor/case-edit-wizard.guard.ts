import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { CaseEventTrigger } from '../../shared/domain/case-view/case-event-trigger.model';
import { WizardFactoryService } from './wizard-factory.service';
import { Predicate } from '../../shared/predicate';
import { WizardPage } from '../../shared/domain/wizard-page.model';
import { ShowCondition } from '../../shared/conditional-show/conditional-show.model';
import { CaseField } from '../../shared/domain/definition/case-field.model';
import { AlertService } from '../alert/alert.service';
import { Wizard } from '../../shared/case-editor/wizard.model';
import { RouterHelperService } from '../utils/router-helper.service';

@Injectable()
export class CaseEditWizardGuard implements Resolve<boolean> {

  constructor(
    private router: Router,
    private routerHelper: RouterHelperService,
    private wizardFactory: WizardFactoryService,
    private alertService: AlertService,
  ) {}

  resolve(route: ActivatedRouteSnapshot): Promise<boolean> {
    let eventTrigger: CaseEventTrigger = route.parent.data.eventTrigger;

    if (!eventTrigger.case_fields
        || !eventTrigger.case_fields.length
        || !eventTrigger.wizard_pages
        || !eventTrigger.wizard_pages.length) {
      this.router.navigate([...this.parentUrlSegments(route), 'submit']);
      return Promise.resolve(false);
    }

    let wizard = this.wizardFactory.create(eventTrigger);
    let currentState = this.buildState(eventTrigger.case_fields);
    // TODO Extract predicate and state creation in a factory
    let canShowPredicate: Predicate<WizardPage> = (page: WizardPage): boolean => {
      return new ShowCondition(page.show_condition).match(currentState);
    };

    if (!route.params['page']) {
      this.goToFirst(wizard, canShowPredicate, route);
      return Promise.resolve(false);
    }

    let pageId = route.params['page'];

    if (!wizard.hasPage(pageId)) {
      this.goToFirst(wizard, canShowPredicate, route)
        .then(() => {
          this.alertService.error(`No page could be found for '${pageId}'`);
        });
      return Promise.resolve(false);
    }

    return Promise.resolve(true);
  }

  private goToFirst(wizard: Wizard, canShowPredicate: Predicate<WizardPage>, route: ActivatedRouteSnapshot): Promise<boolean> {
    let firstPage = wizard.firstPage(canShowPredicate);
    return this.router.navigate([...this.parentUrlSegments(route), firstPage ? firstPage.id : 'submit']);
  }

  private buildState(caseFields: CaseField[]): any {
    let state = {};

    caseFields.forEach(field => {
      state[field.id] = field.value;
    });

    return state;
  }

  private parentUrlSegments(route: ActivatedRouteSnapshot): string[] {
    return this.routerHelper.getUrlSegmentsFromRoot(route.parent);
  }
}
