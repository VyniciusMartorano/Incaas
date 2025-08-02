import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { filter } from 'rxjs/operators';

interface Usuario {
    id: number;
    username: string;
    nome: string;
    email: string;
    perfil: string;
}

@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [CommonModule, RouterModule, ButtonModule, ToastModule],
    templateUrl: './layout.component.html',
    styles: [],
    providers: [MessageService]
})
export class LayoutComponent implements OnInit {
    usuarioLogado: Usuario | null = null;
    currentRoute: string = '';

    constructor(
        private router: Router,
        private messageService: MessageService
    ) {
        // Escutar mudanças de rota
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe((event: any) => {
            this.currentRoute = event.url;
        });
    }

    ngOnInit() {
        this.carregarDadosUsuario();
        this.currentRoute = this.router.url;
    }

    private carregarDadosUsuario() {
        const usuarioStr = localStorage.getItem('usuario');
        if (usuarioStr) {
            this.usuarioLogado = JSON.parse(usuarioStr);
        }
    }

    navigateTo(route: string) {
        this.router.navigate([route]);
        this.currentRoute = route;
    }

    logout() {
        // Limpar dados de autenticação
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        
        this.messageService.add({
            severity: 'info',
            summary: 'Logout',
            detail: 'Você foi desconectado do sistema'
        });
        
        // Redirecionar para login
        setTimeout(() => {
            this.router.navigate(['/login']);
        }, 1000);
    }

    getUsuarioNome(): string {
        return this.usuarioLogado?.nome || 'Usuário';
    }

    getUsuarioPerfil(): string {
        return this.usuarioLogado?.perfil || 'USER';
    }

    isActiveRoute(route: string): boolean {
        return this.currentRoute === route;
    }
} 