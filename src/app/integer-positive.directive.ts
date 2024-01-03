
import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appIntegerPositive]'
})
export class IntegerPositiveDirective {

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event']) onInput(event: any) {
    const initialValue = this.el.nativeElement.value;
    this.el.nativeElement.value = initialValue.replace(/[^0-9]/g, ''); // Solo permite dígitos
    if (this.el.nativeElement.value !== initialValue) {
      event.stopPropagation();
     
    }
  }
}