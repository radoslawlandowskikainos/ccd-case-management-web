import { Injectable } from '@angular/core';
import { AppConfig } from '../../app.config';
import { RequestOptionsArgs } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';
import { PaginationMetadata } from '../../shared/search/pagination-metadata.model';
import { HttpService } from '../http/http.service';
import { RequestOptionsBuilder } from '../request.options.builder';

@Injectable()
export class PaginationService {

  constructor(private appConfig: AppConfig, private httpService: HttpService, private requestOptionsBuilder: RequestOptionsBuilder) { }

  public getPaginationMetadata(jurisdictionId: string, caseTypeId: string,
                               metaCriteria: object, caseCriteria: object): Observable<PaginationMetadata> {
    const url = this.appConfig.getCaseDataUrl() + `/caseworkers/:uid`
                                                + `/jurisdictions/${jurisdictionId}`
                                                + `/case-types/${caseTypeId}`
                                                + `/cases/pagination_metadata`;

    let options: RequestOptionsArgs = this.requestOptionsBuilder.buildOptions(metaCriteria, caseCriteria);

    return this.httpService
      .get(url, options)
      .map(response => response.json());
  }
}
