// src/app/core/interceptors/api.interceptor.ts
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

export const apiInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const cloned = req.clone({
    setHeaders: { 'Content-Type': 'application/json' }
  });
  return next(cloned).pipe(
    catchError(err => {
      const msg = err?.error?.message ?? err?.message ?? 'Network error';
      return throwError(() => new Error(msg));
    })
  );
};
