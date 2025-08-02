import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { InputMaskModule } from 'primeng/inputmask';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ValidacaoService } from '../../services/validacao.service';
import { DocumentoValidator } from '../../validators/documento.validator';
import { PartesInteressadasService, ParteInteressada } from '../../services/partes-interessadas.service';
import { Subject, takeUntil } from 'rxjs';

interface ParteFormData {
    id?: number;
    nome: string;
    tipo: 'PF' | 'PJ';
    documento: string;
    email: string;
    telefone: string;
    endereco: string;
}

@Component({
    selector: 'app-partes-interessadas',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ButtonModule,
        TableModule,
        DialogModule,
        InputTextModule,
        DropdownModule,
        InputMaskModule,
        CardModule,
        ToastModule,
        ConfirmDialogModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './partes-interessadas.component.html',
    styles: []
})
export class PartesInteressadasComponent implements OnInit, OnDestroy {
    partesInteressadas: ParteInteressada[] = [];
    parteForm!: FormGroup;
    dialogVisible = false;
    editMode = false;
    editingId: number | null = null;
    documentoMask = '999.999.999-99';
    documentoPlaceholder = '000.000.000-00';
    loading = false;

    private destroy$ = new Subject<void>();

    tipos = [
        { label: 'Pessoa Física', value: 'PF' },
        { label: 'Pessoa Jurídica', value: 'PJ' }
    ];

    constructor(
        private fb: FormBuilder,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private validacaoService: ValidacaoService,
        private partesInteressadasService: PartesInteressadasService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.initializeForm();
        this.loadPartesInteressadas();
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private initializeForm(): void {
        this.parteForm = this.fb.group({
            nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
            tipo: ['PF', [Validators.required]],
            documento: ['', [Validators.required, DocumentoValidator.validarDocumento(this.validacaoService)]],
            email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
            telefone: ['', [Validators.required, Validators.minLength(14)]],
            endereco: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]]
        });

        // Escutar mudanças no tipo para atualizar a máscara
        this.parteForm.get('tipo')?.valueChanges
            .pipe(takeUntil(this.destroy$))
            .subscribe(tipo => {
                this.updateDocumentoMask(tipo);
                this.revalidateDocumento();
            });
    }

    private updateDocumentoMask(tipo: string): void {
        if (tipo === 'PF') {
            this.documentoMask = '999.999.999-99';
            this.documentoPlaceholder = '000.000.000-00';
        } else {
            this.documentoMask = '99.999.999/9999-99';
            this.documentoPlaceholder = '00.000.000/0000-00';
        }

        // Só limpar o campo documento quando não estiver editando
        if (!this.editMode) {
            this.parteForm.patchValue({ documento: '' });
        }
    }

    private revalidateDocumento(): void {
        const documentoControl = this.parteForm.get('documento');
        if (documentoControl) {
            documentoControl.updateValueAndValidity();
        }
    }

    loadPartesInteressadas(): void {
        // Inicializar com dados de exemplo se não houver dados
        this.partesInteressadasService.initializeWithSampleData();

        // Carregar dados do serviço
        this.partesInteressadas = this.partesInteressadasService.getPartesInteressadas();

        // Escutar mudanças
        this.partesInteressadasService.partesInteressadas$
            .pipe(takeUntil(this.destroy$))
            .subscribe(partes => {
                this.partesInteressadas = partes;
                this.cdr.detectChanges();
            });
    }

    showDialog(): void {
        this.editMode = false;
        this.editingId = null;
        this.resetForm();
        this.dialogVisible = true;
    }

    hideDialog(): void {
        this.dialogVisible = false;
        this.resetForm();
    }

    private resetForm(): void {
        this.parteForm.reset({ tipo: 'PF' });
        this.updateDocumentoMask('PF');
        this.clearFormErrors();
    }

    private clearFormErrors(): void {
        Object.keys(this.parteForm.controls).forEach(key => {
            const control = this.parteForm.get(key);
            control?.setErrors(null);
            control?.markAsUntouched();
            control?.markAsPristine();
        });
    }

    editParte(parte: ParteInteressada): void {
        this.editMode = true;
        this.editingId = parte.id;

        // Primeiro atualizar a máscara baseada no tipo
        this.updateDocumentoMask(parte.tipo);

        // Depois preencher o formulário com os dados da parte
        this.parteForm.patchValue(parte);

        this.dialogVisible = true;
    }

    saveParte(): void {
        if (this.loading) return;

        this.marcarCamposComoTouched();

        if (this.parteForm.valid) {
            this.loading = true;

            try {
                const parteData: ParteFormData = this.parteForm.value;
                const documentoFormatado = this.validacaoService.formatarDocumento(
                    parteData.documento,
                    parteData.tipo
                );

                const dadosParaSalvar = {
                    ...parteData,
                    documento: documentoFormatado
                };

                if (this.editMode && this.editingId) {
                    this.updateParte(dadosParaSalvar as ParteInteressada);
                } else {
                    this.createParte(dadosParaSalvar as ParteInteressada);
                }

                this.hideDialog();
                this.cdr.detectChanges();
            } catch (error) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro interno ao salvar parte interessada.'
                });
            } finally {
                this.loading = false;
            }
        } else {
            this.handleValidationErrors();
        }
    }

    private createParte(dados: Omit<ParteInteressada, 'id'>): void {
        this.partesInteressadasService.addParteInteressada(dados);

        this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Parte interessada adicionada com sucesso!'
        });
    }

    private updateParte(dados: ParteInteressada): void {
        if (this.editingId) {
            const success = this.partesInteressadasService.updateParteInteressada(this.editingId, dados);

            if (success) {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: 'Parte interessada atualizada com sucesso!'
                });
            }
        }
    }

    private handleValidationErrors(): void {
        const documentoControl = this.parteForm.get('documento');
        if (documentoControl?.errors?.['documentoInvalido']) {
            const tipo = this.parteForm.get('tipo')?.value;
            const mensagem = tipo === 'PF' ? 'CPF inválido' : 'CNPJ inválido';
            this.messageService.add({
                severity: 'error',
                summary: 'Erro de Validação',
                detail: mensagem
            });
        } else {
            this.messageService.add({
                severity: 'error',
                summary: 'Erro de Validação',
                detail: 'Por favor, corrija os erros no formulário antes de salvar.'
            });
        }
    }

    private marcarCamposComoTouched(): void {
        Object.keys(this.parteForm.controls).forEach(key => {
            const control = this.parteForm.get(key);
            control?.markAsTouched();
        });
    }

    deleteParte(parte: ParteInteressada): void {
        this.confirmationService.confirm({
            message: `Tem certeza que deseja excluir "${parte.nome}"?`,
            header: 'Confirmar Exclusão',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const success = this.partesInteressadasService.deleteParteInteressada(parte.id);

                if (success) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Sucesso',
                        detail: 'Parte interessada excluída com sucesso!'
                    });
                }
            }
        });
    }

    // Getters para facilitar o acesso aos controles no template
    get nomeControl(): AbstractControl | null {
        return this.parteForm.get('nome');
    }

    get tipoControl(): AbstractControl | null {
        return this.parteForm.get('tipo');
    }

    get documentoControl(): AbstractControl | null {
        return this.parteForm.get('documento');
    }

    get emailControl(): AbstractControl | null {
        return this.parteForm.get('email');
    }

    get telefoneControl(): AbstractControl | null {
        return this.parteForm.get('telefone');
    }

    get enderecoControl(): AbstractControl | null {
        return this.parteForm.get('endereco');
    }

    getDocumentoErrorMessage(): string {
        const documentoControl = this.parteForm.get('documento');
        if (documentoControl?.errors?.['documentoInvalido']) {
            const tipo = this.parteForm.get('tipo')?.value;
            return tipo === 'PF' ? 'CPF inválido' : 'CNPJ inválido';
        }
        return '';
    }

    isFieldInvalid(fieldName: string): boolean {
        const control = this.parteForm.get(fieldName);
        return !!(control?.invalid && (control?.touched || control?.dirty));
    }

    getFieldError(fieldName: string): string {
        const control = this.parteForm.get(fieldName);
        if (!control?.errors) return '';

        const errors = control.errors;

        if (errors['required']) return `${fieldName} é obrigatório`;
        if (errors['email']) return 'Email inválido';
        if (errors['minlength']) return `${fieldName} deve ter pelo menos ${errors['minlength'].requiredLength} caracteres`;
        if (errors['maxlength']) return `${fieldName} deve ter no máximo ${errors['maxlength'].requiredLength} caracteres`;
        if (errors['documentoInvalido']) return this.getDocumentoErrorMessage();

        return '';
    }
} 