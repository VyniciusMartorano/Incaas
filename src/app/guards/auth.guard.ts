import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    constructor(private router: Router) { }

    canActivate(): boolean {
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        const token = localStorage.getItem('token');
        const usuario = localStorage.getItem('usuario');

        if (!isAuthenticated || !token || !usuario) {
            this.router.navigate(['/login']);
            return false;
        }

        // Verificar se o token não expirou
        try {
            const tokenPayload = JSON.parse(atob(token));
            const agora = Date.now();

            if (tokenPayload.exp < agora) {
                // Token expirado
                this.limparDadosAutenticacao();
                this.router.navigate(['/login']);
                return false;
            }
        } catch (error) {
            // Token inválido
            this.limparDadosAutenticacao();
            this.router.navigate(['/login']);
            return false;
        }

        return true;
    }

    private limparDadosAutenticacao(): void {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
    }
} 