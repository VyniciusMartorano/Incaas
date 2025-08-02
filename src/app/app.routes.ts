import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './auth/login/login.component';
import { PartesInteressadasComponent } from './components/partes-interessadas/partes-interessadas.component';
import { ProcessosComponent } from './components/processos/processos.component';
import { LayoutComponent } from './layout/layout.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    {
        path: '',
        component: LayoutComponent,
        canActivate: [AuthGuard],
        children: [
            { path: 'dashboard', component: DashboardComponent },
            { path: 'partes-interessadas', component: PartesInteressadasComponent },
            { path: 'processos', component: ProcessosComponent },
            { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
        ]
    }
];
