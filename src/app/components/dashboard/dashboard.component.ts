import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DatajudService } from '../../services/datajud.service';
import { Processo } from '../../models/datajud.model';
import { PartesInteressadasService } from '../../services/partes-interessadas.service';
import { NumeroFormatPipe } from '../../pipes/numero-format.pipe';

interface Usuario {
    id: number;
    username: string;
    nome: string;
    email: string;
    perfil: string;
}

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, ButtonModule, CardModule, TableModule, ProgressSpinnerModule, ToastModule, NumeroFormatPipe],
    templateUrl: './dashboard.component.html',
    styles: [],
    providers: [MessageService]
})
export class DashboardComponent implements OnInit {
    usuarioLogado: Usuario | null = null;
    totalPartesInteressadas = 0;
    totalProcessos = 0;
    processosRecentes: Processo[] = [];
    loadingProcessos = false;

    constructor(
        private router: Router,
        private messageService: MessageService,
        private datajudService: DatajudService,
        private partesInteressadasService: PartesInteressadasService
    ) { }

    ngOnInit() {
        this.carregarDadosUsuario();
        this.carregarDadosDashboard();

        this.partesInteressadasService.partesInteressadas$.subscribe(() => {
            this.totalPartesInteressadas = this.partesInteressadasService.getTotalPartesInteressadas();
        });
    }

    private carregarDadosUsuario() {
        const usuarioStr = localStorage.getItem('usuario');
        if (usuarioStr) {
            this.usuarioLogado = JSON.parse(usuarioStr);
        }
    }

    private carregarDadosDashboard() {
        this.carregarDadosPartesInteressadas();

        this.carregarDadosProcessos();

        this.carregarUltimosProcessos();
    }

    private carregarDadosProcessos() {
        this.datajudService.buscarTotalProcessos('api_publica_trf1').subscribe({
            next: (response) => {
                this.totalProcessos = response.total;
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao carregar total de processos'
                });
                this.totalProcessos = 342;
            }
        });
    }



    private carregarDadosPartesInteressadas() {
        this.partesInteressadasService.initializeWithSampleData();
        this.totalPartesInteressadas = this.partesInteressadasService.getTotalPartesInteressadas();
    }

    private carregarUltimosProcessos() {
        this.loadingProcessos = true;
        this.datajudService.buscarProcessos({ tribunal: 'api_publica_trf1' }, 5).subscribe({
            next: (response) => {
                if (response.hits && response.hits.hits) {
                    this.processosRecentes = response.hits.hits
                        .slice(0, 5)
                        .map(hit => this.datajudService.mapearProcessoParaInterface(hit));
                }
                this.loadingProcessos = false;
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao carregar processos recentes'
                });
                this.loadingProcessos = false;
            }
        });
    }

    navigateTo(route: string) {
        this.router.navigate([route]);
    }

    logout() {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');

        this.messageService.add({
            severity: 'info',
            summary: 'Logout',
            detail: 'Você foi desconectado do sistema'
        });

        setTimeout(() => {
            this.router.navigate(['/login']);
        }, 1000);
    }

    showReports() {
        this.messageService.add({
            severity: 'info',
            summary: 'Relatórios',
            detail: 'Funcionalidade de relatórios será implementada em breve'
        });
    }

    getUsuarioNome(): string {
        return this.usuarioLogado?.nome || 'Usuário';
    }

    getUsuarioPerfil(): string {
        return this.usuarioLogado?.perfil || 'USER';
    }
} 