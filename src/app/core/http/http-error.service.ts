import { Injectable } from '@angular/core';
import { HttpError } from './http-error.model';
import { Observable } from 'rxjs/Observable';
import { Response } from '@angular/http';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class HttpErrorService {

  private static readonly CONTENT_TYPE = 'Content-Type';
  private static readonly APPLICATION_JSON = 'application/json';

  private error: HttpError;

  constructor(private authService: AuthService) {
  }

  setError(error: HttpError) {
      this.error = error;
  }

  removeError(): HttpError {
      let error = this.error;
      this.error = null;
      return error;
  }

  handle(error: Response | any) {
    let httpError = new HttpError();

    if (error instanceof Response) {
      httpError.status = error.status;

      if (error.headers
          && error.headers.get(HttpErrorService.CONTENT_TYPE)
          && error.headers.get(HttpErrorService.CONTENT_TYPE).startsWith(HttpErrorService.APPLICATION_JSON)) {
        try {
          httpError = HttpError.from(error.json() || {});
        } catch (e) {
          console.error(e, e.message);
        }
      }
    } else if (error) {
      if (error.message) {
        httpError.message = error.message;
      }
      if (error.status) {
        httpError.status = error.status;
      }
    }
    if (httpError.status === 401 || httpError.status === 403) {
      this.authService.signIn();
    }
    return Observable.throw(httpError);
  }
}
