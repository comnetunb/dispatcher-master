import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AdminModeInterceptor implements HttpInterceptor {
  constructor(
    public authService: AuthService
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.authService.adminMode) {
      request = request.clone({
        setHeaders: {
          AdminMode: 'true',
        },
      });
    }
    return next.handle(request);
  }
}
