import {
  Component,
  ElementRef,
  HostListener,
  Provider,
  forwardRef,
  inject,
  input,
  output,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

const CRM_DROPDOWN_PROVIDER: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => CrmDropdownComponent),
  multi: true,
};

@Component({
  selector: 'crm-dropdown',
  standalone: true,
  imports: [CommonModule],
  providers: [CRM_DROPDOWN_PROVIDER],
  templateUrl: './crm-dropdown.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './crm-dropdown.component.scss',
})
export class CrmDropdownComponent implements ControlValueAccessor {
  private readonly elementRef = inject(ElementRef);

  placeholder = input<string>('Select an option...');
  searchable = input<boolean>(false);
  allowCustomAdd = input<boolean>(false);

  searchChange = output<string>();

  protected readonly isOpen = signal<boolean>(false);
  protected readonly isDisabled = signal<boolean>(false);
  protected readonly currentSearchTerm = signal<string>('');
  protected value = signal<any>(null);

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: any): void {
    this.value.set(value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  toggle(): void {
    if (this.isDisabled()) return;
    this.isOpen.set(!this.isOpen());
    if (this.isOpen()) {
      this.currentSearchTerm.set('');
      this.onTouched();
    } else {
      this.currentSearchTerm.set('');
    }
  }

  close(): void {
    this.isOpen.set(false);
    this.currentSearchTerm.set('');
  }

  onSearchInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.currentSearchTerm.set(inputElement.value);
    this.searchChange.emit(inputElement.value);
  }

  selectOption(value: any): void {
    this.value.set(value);
    this.onChange(value);
    this.close();
  }

  @HostListener('document:click', ['$event'])
  protected onClickOutside(event: MouseEvent): void {
    if (!this.elementRef.nativeElement) return;
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.close();
    }
  }
}
