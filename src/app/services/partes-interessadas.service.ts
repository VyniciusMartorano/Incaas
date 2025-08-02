import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ParteInteressada {
    id: number;
    nome: string;
    tipo: 'PF' | 'PJ';
    documento: string;
    email: string;
    telefone: string;
    endereco: string;
}

@Injectable({
    providedIn: 'root'
})
export class PartesInteressadasService {
    private readonly STORAGE_KEY = 'partes_interessadas';
    private partesInteressadasSubject = new BehaviorSubject<ParteInteressada[]>([]);
    public partesInteressadas$ = this.partesInteressadasSubject.asObservable();

    constructor() {
        this.loadFromStorage();
    }

    private loadFromStorage(): void {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                const partes = JSON.parse(stored);
                this.partesInteressadasSubject.next(partes);
            }
        } catch (error) {
            console.error('Erro ao carregar partes interessadas do localStorage:', error);
            this.partesInteressadasSubject.next([]);
        }
    }

    private saveToStorage(partes: ParteInteressada[]): void {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(partes));
        } catch (error) {
            console.error('Erro ao salvar partes interessadas no localStorage:', error);
        }
    }

    getPartesInteressadas(): ParteInteressada[] {
        return this.partesInteressadasSubject.value;
    }

    getTotalPartesInteressadas(): number {
        return this.partesInteressadasSubject.value.length;
    }

    addParteInteressada(parte: Omit<ParteInteressada, 'id'>): ParteInteressada {
        const newParte: ParteInteressada = {
            ...parte,
            id: Date.now()
        };

        const currentPartes = this.partesInteressadasSubject.value;
        const updatedPartes = [...currentPartes, newParte];

        this.partesInteressadasSubject.next(updatedPartes);
        this.saveToStorage(updatedPartes);

        return newParte;
    }

    updateParteInteressada(id: number, parte: Partial<ParteInteressada>): boolean {
        const currentPartes = this.partesInteressadasSubject.value;
        const index = currentPartes.findIndex(p => p.id === id);

        if (index !== -1) {
            const updatedPartes = [...currentPartes];
            updatedPartes[index] = { ...updatedPartes[index], ...parte };

            this.partesInteressadasSubject.next(updatedPartes);
            this.saveToStorage(updatedPartes);
            return true;
        }

        return false;
    }

    deleteParteInteressada(id: number): boolean {
        const currentPartes = this.partesInteressadasSubject.value;
        const updatedPartes = currentPartes.filter(p => p.id !== id);

        if (updatedPartes.length !== currentPartes.length) {
            this.partesInteressadasSubject.next(updatedPartes);
            this.saveToStorage(updatedPartes);
            return true;
        }

        return false;
    }

    getParteInteressadaById(id: number): ParteInteressada | undefined {
        return this.partesInteressadasSubject.value.find(p => p.id === id);
    }

    // Método para inicializar com dados de exemplo se não houver dados
    initializeWithSampleData(): void {
        const currentPartes = this.partesInteressadasSubject.value;
        if (currentPartes.length === 0) {
            const sampleData: ParteInteressada[] = [
                {
                    id: 1,
                    nome: 'João Silva',
                    tipo: 'PF',
                    documento: '123.456.789-00',
                    email: 'joao@email.com',
                    telefone: '(11) 99999-9999',
                    endereco: 'Rua das Flores, 123 - São Paulo/SP'
                },
                {
                    id: 2,
                    nome: 'Empresa ABC Ltda',
                    tipo: 'PJ',
                    documento: '12.345.678/0001-90',
                    email: 'contato@abc.com',
                    telefone: '(11) 3333-3333',
                    endereco: 'Av. Paulista, 1000 - São Paulo/SP'
                }
            ];

            this.partesInteressadasSubject.next(sampleData);
            this.saveToStorage(sampleData);
        }
    }
} 