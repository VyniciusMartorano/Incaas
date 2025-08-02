import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

// Banco de dados simulado de usuários
const USUARIOS_DB = [
    {
        id: 1,
        username: 'teste',
        password: 'teste123',
        nome: 'Usuário Teste',
        email: 'teste@sistema.com',
        perfil: 'ADMIN',
        ativo: true
    },
    {
        id: 2,
        username: 'admin',
        password: 'admin123',
        nome: 'Administrador',
        email: 'admin@sistema.com',
        perfil: 'ADMIN',
        ativo: true
    },
    {
        id: 3,
        username: 'usuario',
        password: 'user123',
        nome: 'Usuário Comum',
        email: 'usuario@sistema.com',
        perfil: 'USER',
        ativo: true
    }
];

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ButtonModule,
        InputTextModule,
        PasswordModule,
        CardModule,
        ToastModule
    ],
    templateUrl: './login.component.html',
    styles: [],
    providers: [MessageService]
})
export class LoginComponent {
    loginForm: FormGroup;
    loading = false;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private messageService: MessageService
    ) {
        this.loginForm = this.fb.group({
            username: ['', [Validators.required, Validators.minLength(3)]],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });
    }

    onSubmit() {
        this.loading = true;

        // Validar se os campos estão preenchidos
        if (!this.loginForm.get('username')?.value || !this.loginForm.get('password')?.value) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Atenção',
                detail: 'Por favor, preencha usuário e senha'
            });
            this.loading = false;
            return;
        }

        // Simular delay de rede
        setTimeout(() => {
            const { username, password } = this.loginForm.value;
            const usuario = this.autenticarUsuario(username, password);

            if (usuario) {
                // Salvar dados do usuário no localStorage
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('usuario', JSON.stringify(usuario));
                localStorage.setItem('token', this.gerarTokenSimulado(usuario));

                this.messageService.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: `Bem-vindo, ${usuario.nome}!`
                });

                // Redirecionar para o dashboard
                setTimeout(() => {
                    this.router.navigate(['/dashboard']);
                }, 1000);
            } else {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Usuário ou senha incorretos!'
                });
            }

            this.loading = false;
        }, 1000);
    }

    private autenticarUsuario(username: string, password: string): any {
        // Buscar usuário no banco simulado
        const usuario = USUARIOS_DB.find(u =>
            u.username.toLowerCase() === username.toLowerCase() &&
            u.password === password &&
            u.ativo
        );

        return usuario || null;
    }

    private gerarTokenSimulado(usuario: any): string {
        // Gerar um token simulado baseado nos dados do usuário
        const payload = {
            userId: usuario.id,
            username: usuario.username,
            perfil: usuario.perfil,
            exp: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
        };

        // Simular um JWT token (em produção seria um token real)
        return btoa(JSON.stringify(payload));
    }

    // Método para obter usuários de teste (para debug)
    getUsuariosTeste(): any[] {
        return USUARIOS_DB.map(u => ({
            username: u.username,
            password: u.password,
            nome: u.nome,
            perfil: u.perfil
        }));
    }
} 