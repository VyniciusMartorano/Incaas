import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const exceptionInterceptor: HttpInterceptorFn = (req, next) => {
    const toast = inject(MessageService);

    return next(req).pipe(
        catchError((error) => {
            const errorMessage = error.error.error || 'Ocorreu um erro inesperado';
            const errorStatus = error.status;
            toast.add({
                severity: 'error',
                summary: errorStatus,
                detail: errorMessage,
                life: 3000,
                closable: true
            });
            return throwError(() => error);
        })
    );
}; 