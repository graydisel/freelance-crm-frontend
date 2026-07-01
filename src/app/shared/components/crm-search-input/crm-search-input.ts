import { Component, ElementRef, HostListener, Provider, forwardRef, inject, output, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, distinctUntilChanged, filter, of, switchMap, tap, Observable } from 'rxjs';

const CRM_SEARCH_INPUT_PROVIDER: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => CrmSearchInput),
  multi: true
};

@Component({
  selector: 'crm-search-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [CRM_SEARCH_INPUT_PROVIDER],
  templateUrl: './crm-search-input.html',
  styleUrl: './crm-search-input.scss'
})
export class CrmSearchInput {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly elementRef = inject(ElementRef);

  placeholder = input<string>('Search...');
  labelKey = input<string>('name');
  searchFn = input<((term: string) => Observable<{ data: any[] }>) | null>(null);

  enterPressed = output<string>();

  protected readonly searchControl = this.fb.control('');
  protected readonly searchResultsPreview = signal<any[]>([]);
  protected readonly showDropdown = signal<boolean>(false);
  protected readonly isDisabled = signal<boolean>(false);

  private onChange: (value: string) => void = () => { };
  private onTouched: () => void = () => { };

  constructor() {
    this.searchControl.valueChanges.pipe(
      takeUntilDestroyed(),
      tap(value => {
        this.onChange(value);
        if (!value) {
          this.searchResultsPreview.set([]);
          this.showDropdown.set(false);
        }
      }),
      debounceTime(300),
      distinctUntilChanged(),
      filter(text => !!text && text.trim().length > 0),
      switchMap(term => {
        if (!term.trim()) {
          return of({ data: [] });
        }
        const fetchPreview = this.searchFn();
        return fetchPreview
          ? fetchPreview(term).pipe(catchError(() => of({ data: [] })))
          : of({ data: [] });
      })
    ).subscribe((res: any) => {
      const data = res?.data ?? [];
      this.searchResultsPreview.set(data);
      this.showDropdown.set(data.length > 0);
    });
  }

  writeValue(value: string): void {
    this.searchControl.setValue(value || '', { emitEvent: false });
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
    if (isDisabled) {
      this.searchControl.disable({ emitEvent: false });
    } else {
      this.searchControl.enable({ emitEvent: false });
    }
  }

  protected onInputFocus(): void {
    this.onTouched();
    if (this.searchResultsPreview().length > 0) {
      this.showDropdown.set(true);
    }
  }

  protected onInputKeydownEnter(): void {
    this.showDropdown.set(false);
    this.enterPressed.emit(this.searchControl.value);
  }

  protected selectPreviewClient(item: any): void {
    const label = item[this.labelKey()];
    this.searchControl.setValue(label);
    this.searchResultsPreview.set([]);
    this.showDropdown.set(false);
    this.enterPressed.emit(label);
  }

  protected clearSearch(): void {
    this.searchControl.setValue('');
    this.searchResultsPreview.set([]);
    this.showDropdown.set(false);
    this.enterPressed.emit('');
  }

  @HostListener('document:click', ['$event'])
  protected onClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (!target || !this.elementRef.nativeElement) {
      return;
    }
    const clickedInside = this.elementRef.nativeElement.contains(target);

    if (!clickedInside) {
      this.showDropdown.set(false);
    }
  }
}
