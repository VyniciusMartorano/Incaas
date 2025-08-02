import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ValidacaoService {

  constructor() { }

  /**
   * Valida se um CPF é válido
   * @param cpf - CPF a ser validado (com ou sem máscara)
   * @returns true se o CPF for válido, false caso contrário
   */
  validarCPF(cpf: string): boolean {
    const cpfLimpo = cpf.replace(/[^\d]+/g, '');

    if (cpfLimpo.length !== 11 || /^(\d)\1{10}$/.test(cpfLimpo)) {
      return false;
    }

    const cpfArray = cpfLimpo.split('').map(Number);

    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += cpfArray[i] * (10 - i);
    }
    let primeiroDigito = 11 - (soma % 11);
    if (primeiroDigito >= 10) primeiroDigito = 0;

    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += cpfArray[i] * (11 - i);
    }
    let segundoDigito = 11 - (soma % 11);
    if (segundoDigito >= 10) segundoDigito = 0;

    return primeiroDigito === cpfArray[9] && segundoDigito === cpfArray[10];
  }

  /**
   * Valida se um CNPJ é válido
   * @param cnpj - CNPJ a ser validado (com ou sem máscara)
   * @returns true se o CNPJ for válido, false caso contrário
   */
  validarCNPJ(cnpj: string): boolean {
    const cnpjLimpo = cnpj.replace(/[^\d]+/g, '');

    if (cnpjLimpo.length !== 14 || /^(\d)\1{13}$/.test(cnpjLimpo)) {
      return false;
    }

    const cnpjArray = cnpjLimpo.split('').map(Number);

    const calcularDigito = (base: number[]) => {
      let soma = 0;
      let pos = base.length - 7;
      for (let i = 0; i < base.length; i++) {
        soma += base[i] * pos--;
        if (pos < 2) pos = 9;
      }
      const resultado = soma % 11;
      return resultado < 2 ? 0 : 11 - resultado;
    };

    const base1 = cnpjArray.slice(0, 12);
    const digito1 = calcularDigito(base1);
    const base2 = [...base1, digito1];
    const digito2 = calcularDigito(base2);

    return digito1 === cnpjArray[12] && digito2 === cnpjArray[13];
  }

  /**
   * Valida CPF ou CNPJ baseado no tipo
   * @param documento - Documento a ser validado
   * @param tipo - Tipo de pessoa ('PF' ou 'PJ')
   * @returns true se o documento for válido, false caso contrário
   */
  validarDocumento(documento: string, tipo: 'PF' | 'PJ'): boolean {
    if (tipo === 'PF') {
      return this.validarCPF(documento);
    } else {
      return this.validarCNPJ(documento);
    }
  }

  /**
   * Formata CPF ou CNPJ baseado no tipo
   * @param documento - Documento a ser formatado
   * @param tipo - Tipo de pessoa ('PF' ou 'PJ')
   * @returns Documento formatado
   */
  formatarDocumento(documento: string, tipo: 'PF' | 'PJ'): string {
    const numeros = documento.replace(/[^\d]/g, '');

    if (tipo === 'PF') {
      return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      return numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
  }
} 