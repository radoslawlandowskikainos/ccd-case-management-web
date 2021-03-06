import { Response, ResponseOptions, Headers } from '@angular/http';
import { AppConfig } from '../../app.config';
import { CasesService } from './cases.service';
import { CaseView } from './case-view.model';
import { HttpService } from '../http/http.service';
import { Observable } from 'rxjs/Observable';
import { CaseEventTrigger } from '../../shared/domain/case-view/case-event-trigger.model';
import { CaseEventData } from '../../shared/domain/case-event-data';
import { CasePrintDocument } from '../../shared/domain/case-view/case-print-document.model';
import { OrderService } from '../order/order.service';
import createSpyObj = jasmine.createSpyObj;
import { HttpError } from '../http/http-error.model';
import { HttpErrorService } from '../http/http-error.service';

describe('CasesService', () => {

  const API_URL = 'http://aggregated.ccd.reform';
  const JID = 'TEST';
  const CTID = 'TestAddressBookCase';
  const CASE_ID = '1';
  const CASE_URL = API_URL + `/caseworkers/:uid/jurisdictions/${JID}/case-types/${CTID}/cases/` + CASE_ID;
  const EVENT_TRIGGER_ID = 'enterCaseIntoLegacy';
  const EVENT_TRIGGER_URL = API_URL
    + `/caseworkers/:uid/jurisdictions/${JID}/case-types/${CTID}/cases/${CASE_ID}/event-triggers/${EVENT_TRIGGER_ID}?ignore-warning=true`;
  const CREATE_EVENT_URL = API_URL + `/caseworkers/:uid/jurisdictions/${JID}/case-types/${CTID}/cases/${CASE_ID}/events`;
  const VALIDATE_CASE_URL = API_URL + `/caseworkers/:uid/jurisdictions/${JID}/case-types/${CTID}/validate`;
  const PRINT_DOCUMENTS_URL = API_URL + `/caseworkers/:uid/jurisdictions/${JID}/case-types/${CTID}/cases/${CASE_ID}/documents`;
  const CREATE_CASE_URL = API_URL + `/caseworkers/:uid/jurisdictions/${JID}/case-types/${CTID}/cases?ignore-warning=false`;
  const ERROR: HttpError = new HttpError();
  ERROR.message = 'Critical error!';

  let appConfig: any;
  let httpService: any;
  let orderService: any;
  let errorService: any;

  let casesService: CasesService;

  beforeEach(() => {
    appConfig = createSpyObj<AppConfig>('appConfig', ['getApiUrl', 'getCaseDataUrl']);
    appConfig.getApiUrl.and.returnValue(API_URL);
    appConfig.getCaseDataUrl.and.returnValue(API_URL);

    httpService = createSpyObj<HttpService>('httpService', ['get', 'post']);
    errorService = createSpyObj<HttpErrorService>('errorService', ['setError']);

    orderService = createSpyObj<OrderService>('orderService', ['sort']);

    casesService = new CasesService(httpService, appConfig, orderService, errorService);
  });

  describe('getCaseView()', () => {

    const CASE_VIEW: CaseView = {
      case_id: '1',
      case_type: {
        id: 'TestAddressBookCase',
        name: 'Test Address Book Case',
        jurisdiction: {
          id: 'TEST',
          name: 'Test',
        }
      },
      channels: [],
      state: {
        id: 'CaseCreated',
        name: 'Case created'
      },
      tabs: [],
      triggers: [],
      events: []
    };

    beforeEach(() => {
      httpService.get.and.returnValue(Observable.of(new Response(new ResponseOptions({
        body: JSON.stringify(CASE_VIEW)
      }))));
    });

    it('should use HttpService::get with correct url', () => {
      casesService
        .getCaseView(JID, CTID, CASE_ID)
        .subscribe();

      expect(httpService.get).toHaveBeenCalledWith(CASE_URL);
    });

    it('should retrieve case from server', () => {
      casesService
        .getCaseView(JID, CTID, CASE_ID)
        .subscribe(
          caseData => expect(caseData).toEqual(CASE_VIEW)
        );
    });

    it('should set error when error is thrown', () => {
      httpService.get.and.returnValue(Observable.throw(ERROR));

      casesService
        .getCaseView(JID, CTID, CASE_ID)
        .subscribe(data => {
          expect(data).toEqual(CASE_VIEW);
        }, err => {
          expect(err).toEqual(ERROR);
          expect(errorService.setError).toHaveBeenCalledWith(ERROR);
        });
    });

  });

  describe('getEventTrigger()', () => {

    const EVENT_TRIGGER: CaseEventTrigger = {
      id: '',
      name: '',
      case_id: '',
      case_fields: [],
      event_token: 'test-token',
      wizard_pages: []
    };

    beforeEach(() => {
      httpService.get.and.returnValue(Observable.of(new Response(new ResponseOptions({
        body: JSON.stringify(EVENT_TRIGGER)
      }))));
    });

    it('should use HttpService::get with correct url', () => {
      casesService
        .getEventTrigger(JID, CTID, EVENT_TRIGGER_ID, CASE_ID, 'true')
        .subscribe();

      expect(httpService.get).toHaveBeenCalledWith(EVENT_TRIGGER_URL);
    });

    it('should retrieve event trigger from server by case id', () => {
      casesService
        .getEventTrigger(JID, CTID, EVENT_TRIGGER_ID, CASE_ID, 'true')
        .subscribe(
          eventTrigger => expect(eventTrigger).toEqual(EVENT_TRIGGER)
        );
    });

    it('should retrieve event trigger from server by case type id', () => {
      casesService
        .getEventTrigger(JID, CTID, EVENT_TRIGGER_ID, 'true')
        .subscribe(
          eventTrigger => expect(eventTrigger).toEqual(EVENT_TRIGGER)
        );
    });

    it('should set error when error is thrown', () => {
      httpService.get.and.returnValue(Observable.throw(ERROR));

      casesService
      .getEventTrigger(JID, CTID, EVENT_TRIGGER_ID, 'true')
        .subscribe(data => {
          expect(data).toEqual(EVENT_TRIGGER);
        }, err => {
          expect(err).toEqual(ERROR);
          expect(errorService.setError).toHaveBeenCalledWith(ERROR);
        });
    });
  });

  describe('createEvent()', () => {
    const CASE_DETAILS: CaseView = {
      case_id: CASE_ID,
      case_type: {
        id: CTID,
        name: 'Test Address Book Case',
        jurisdiction: {
          id: JID,
          name: 'Test',
        }
      },
      channels: [],
      state: {
        id: 'CaseCreated',
        name: 'Case created'
      },
      tabs: [],
      triggers: [],
      events: []
    };

    const CASE_EVENT_DATA: CaseEventData = {
      event: {
        id: EVENT_TRIGGER_ID,
        summary: 'Short summary',
        description: 'A very nice description'
      },
      event_token: 'test-token',
      ignore_warning: false
    };

    const EVENT_RESPONSE = { id: 5 };
    const EMPTY_RESPONSE = { id: '' };
    const HEADERS = new Headers({'content-type': 'application/json;charset=UTF-8'});

    beforeEach(() => {
      httpService.post.and.returnValue(Observable.of(new Response(new ResponseOptions({
        headers: HEADERS,
        body: JSON.stringify(EVENT_RESPONSE)
      }))));
    });

    it('should use HttpService::post with correct url', () => {
      casesService
        .createEvent(CASE_DETAILS, CASE_EVENT_DATA)
        .subscribe();

      expect(httpService.post).toHaveBeenCalledWith(CREATE_EVENT_URL, CASE_EVENT_DATA);
    });

    it('should create event on server', () => {
      casesService
        .createEvent(CASE_DETAILS, CASE_EVENT_DATA)
        .subscribe(
          data => expect(data).toEqual(EVENT_RESPONSE)
        );
    });

    it('should return body with empty id if no content-type response header', () => {
      httpService.post.and.returnValue(Observable.of(new Response(new ResponseOptions({
        body: JSON.stringify(EVENT_RESPONSE)
      }))));

      casesService
        .createEvent(CASE_DETAILS, CASE_EVENT_DATA)
        .subscribe(
          data => expect(data).toEqual(EMPTY_RESPONSE)
        );
    });

    it('should set error when error is thrown', () => {
      httpService.post.and.returnValue(Observable.throw(ERROR));

      casesService
      .createEvent(CASE_DETAILS, CASE_EVENT_DATA)
        .subscribe(data => {
          expect(data).toEqual(EVENT_RESPONSE);
        }, err => {
          expect(err).toEqual(ERROR);
          expect(errorService.setError).toHaveBeenCalledWith(ERROR);
        });
    });
  });

  describe('validateCase()', () => {
    const CASE_DETAILS: CaseView = {
      case_id: CASE_ID,
      case_type: {
        id: CTID,
        name: 'Test Address Book Case',
        jurisdiction: {
          id: JID,
          name: 'Test',
        }
      },
      channels: [],
      state: {
        id: 'CaseCreated',
        name: 'Case created'
      },
      tabs: [],
      triggers: [],
      events: []
    };

    const CASE_EVENT_DATA: CaseEventData = {
      event: {
        id: EVENT_TRIGGER_ID,
        summary: 'Short summary',
        description: 'A very nice description'
      },
      event_token: 'test-token',
      ignore_warning: false
    };

    const EVENT_RESPONSE = { id: 5 };

    beforeEach(() => {
      httpService.post.and.returnValue(Observable.of(new Response(new ResponseOptions({
        body: JSON.stringify(EVENT_RESPONSE)
      }))));
    });

    it('should use HttpService::post with correct url', () => {
      casesService
        .validateCase(JID, CTID, CASE_EVENT_DATA)
        .subscribe();

      expect(httpService.post).toHaveBeenCalledWith(VALIDATE_CASE_URL, CASE_EVENT_DATA);
    });

    it('should validate case on server', () => {
      casesService
        .validateCase(JID, CTID, CASE_EVENT_DATA)
        .subscribe(
          data => expect(data).toEqual(EVENT_RESPONSE)
        );
    });

    it('should set error when error is thrown', () => {
      httpService.post.and.returnValue(Observable.throw(ERROR));

      casesService
      .createEvent(CASE_DETAILS, CASE_EVENT_DATA)
        .subscribe(data => {
          expect(data).toEqual(EVENT_RESPONSE);
        }, err => {
          expect(err).toEqual(ERROR);
          expect(errorService.setError).toHaveBeenCalledWith(ERROR);
        });
    });
  });

  describe('createCase()', () => {
    const CASE_EVENT_DATA: CaseEventData = {
      event: {
        id: EVENT_TRIGGER_ID,
        summary: 'Short summary',
        description: 'A very nice description',
      },
      event_token: 'test-token',
      ignore_warning: false
    };

    const CASE_RESPONSE = { id: 5 };
    const EMPTY_RESPONSE = { id: '' };
    const HEADERS = new Headers({'content-type': 'application/json;charset=UTF-8'});

    beforeEach(() => {
      httpService.post.and.returnValue(Observable.of(new Response(new ResponseOptions({
        headers: HEADERS,
        body: JSON.stringify(CASE_RESPONSE)
      }))));
    });

    it('should use HttpService::post with correct url', () => {
      casesService
        .createCase(JID, CTID, CASE_EVENT_DATA)
        .subscribe();

      expect(httpService.post).toHaveBeenCalledWith(CREATE_CASE_URL, CASE_EVENT_DATA);
    });

    it('should create case on server', () => {
      casesService
        .createCase(JID, CTID, CASE_EVENT_DATA)
        .subscribe(
          data => expect(data).toEqual(CASE_RESPONSE)
        );
    });

    it('should return body with empty id if no content-type response header', () => {
      httpService.post.and.returnValue(Observable.of(new Response(new ResponseOptions({
        body: JSON.stringify(CASE_RESPONSE)
      }))));

      casesService
        .createCase(JID, CTID, CASE_EVENT_DATA)
        .subscribe(
          data => expect(data).toEqual(EMPTY_RESPONSE)
        );
    });

    it('should set error when error is thrown', () => {
      httpService.post.and.returnValue(Observable.throw(ERROR));

      casesService
      .createCase(JID, CTID, CASE_EVENT_DATA)
        .subscribe(data => {
          expect(data).toEqual(CASE_RESPONSE);
        }, err => {
          expect(err).toEqual(ERROR);
          expect(errorService.setError).toHaveBeenCalledWith(ERROR);
        });
    });
  });

  describe('getPrintDocuments()', () => {

    const DOCUMENTS: CasePrintDocument[] = [
      {
        name: 'Doc1',
        type: 'application/pdf',
        url: 'https://test.service.reform.hmcts.net/doc1'
      }
    ];

    beforeEach(() => {
      httpService.get.and.returnValue(Observable.of(new Response(new ResponseOptions({
        body: JSON.stringify(DOCUMENTS)
      }))));
    });

    it('should use HttpService::get with correct url', () => {
      casesService
        .getPrintDocuments(JID, CTID, CASE_ID)
        .subscribe();

      expect(httpService.get).toHaveBeenCalledWith(PRINT_DOCUMENTS_URL);
    });

    it('should retrieve document list from server', () => {
      casesService
        .getPrintDocuments(JID, CTID, CASE_ID)
        .subscribe(
          eventTrigger => expect(eventTrigger).toEqual(DOCUMENTS)
        );
    });

    it('should set error when error is thrown', () => {
      httpService.get.and.returnValue(Observable.throw(ERROR));

      casesService
      .getPrintDocuments(JID, CTID, CASE_ID)
        .subscribe(data => {
          expect(data).toEqual(DOCUMENTS);
        }, err => {
          expect(err).toEqual(ERROR);
          expect(errorService.setError).toHaveBeenCalledWith(ERROR);
        });
    });
  });
});
