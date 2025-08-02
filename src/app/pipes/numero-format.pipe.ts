import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numeroFormat',
  standalone: true
})
export class NumeroFormatPipe implements PipeTransform {
  transform(numero: number): string {
    if (!numero && numero !== 0) {
      return '0';
    }

    if (numero >= 1000000) {
      return (numero / 1000000).toFixed(1).replace('.', ',') + 'M';
    } else if (numero >= 1000) {
      return (numero / 1000).toFixed(1).replace('.', ',') + 'K';
    } else {
      return numero.toLocaleString('pt-BR');
    }
  }
} 