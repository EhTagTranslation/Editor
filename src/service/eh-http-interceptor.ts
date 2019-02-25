import { Injectable } from '@angular/core';
import {catchError, mergeMap, tap} from 'rxjs/operators';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable()
export class EhHttpInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // const authReq = req.clone({
    //   url: (req.url + '&token=')
    // });

    return next.handle(req).pipe(
      tap(v => {
        console.log('tap', v);
      })
    );
  }
}
