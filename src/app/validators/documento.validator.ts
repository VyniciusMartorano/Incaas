import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ValidacaoService } from '../services/validacao.service';

export class DocumentoValidator {
    static validarDocumento(validacaoService: ValidacaoService): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const documento = control.value;
            const tipo = control.parent?.get('tipo')?.value;

            if (!documento || !tipo) {
                return null;
            }

            const isValid = validacaoService.validarDocumento(documento, tipo);

            if (!isValid) {
                return {
                    documentoInvalido: {
                        value: documento,
                        tipo: tipo,
                        message: tipo === 'PF' ? 'CPF inválido' : 'CNPJ inválido'
                    }
                };
            }

            return null;
        };
    }
} 