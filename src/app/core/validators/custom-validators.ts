import { AbstractControl, ValidationErrors } from '@angular/forms';

export class CrmValidators {
  static requiredNoWhitespace(control: AbstractControl): ValidationErrors | null {
    const rawVal: unknown = control.value;
    const strVal =
      typeof rawVal === 'string'
        ? rawVal
        : typeof rawVal === 'number' || typeof rawVal === 'boolean'
          ? String(rawVal)
          : '';
    const isWhitespace = strVal.trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { required: true };
  }
}
