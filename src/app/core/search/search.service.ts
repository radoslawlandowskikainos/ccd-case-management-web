import { Injectable } from '@angular/core';
import { AppConfig } from '../../app.config';
import { RequestOptionsArgs } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';
import { SearchResultView } from '../../shared/search/search-result-view.model';
import { SearchInput } from './search-input.model';
import { HttpService } from '../http/http.service';
import { RequestOptionsBuilder, SearchView } from '../request.options.builder';

@Injectable()
export class SearchService {

  public static readonly VIEW_SEARCH = 'SEARCH';
  public static readonly VIEW_WORKBASKET = 'WORKBASKET';
  public static readonly FIELD_PREFIX = 'case.';

  constructor(private appConfig: AppConfig, private httpService: HttpService, private requestOptionsBuilder: RequestOptionsBuilder) { }

  public search(jurisdictionId: string, caseTypeId: string,
                metaCriteria: object, caseCriteria: object, view?: SearchView): Observable<SearchResultView> {
    const url = this.appConfig.getApiUrl() + `/caseworkers/:uid`
                                           + `/jurisdictions/${jurisdictionId}`
                                           + `/case-types/${caseTypeId}`
                                           + `/cases`;

    let options: RequestOptionsArgs = this.requestOptionsBuilder.buildOptions(metaCriteria, caseCriteria, view);

    return this.httpService
      .get(url, options)
      .map(response => response.json());
  }

  getSearchInputUrl(jurisdictionId: string, caseTypeId: string): string {
    return `${this.appConfig.getApiUrl()}/caseworkers/:uid/jurisdictions/${jurisdictionId}/case-types/${caseTypeId}/inputs`;
  }

  getSearchInputs(jurisdictionId: string, caseTypeId: string): Observable<SearchInput[]> {
    let url = this.getSearchInputUrl(jurisdictionId, caseTypeId);
    return this.httpService
      .get(url)
      .map(response => {
        let searchInputs = response.json();
        searchInputs
          .forEach( item => { item.field.label = item.label; });
        return searchInputs;
      });
  }
}
