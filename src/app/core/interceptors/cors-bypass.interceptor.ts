// src/app/core/interceptors/cors-bypass.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class CorsBypassInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.method === 'OPTIONS') {
      const cloned = req.clone({
        setHeaders: {
          'X-Cache-Bust': Date.now().toString()
        }
      });
      return next.handle(cloned);
    }
    return next.handle(req);
  }
}