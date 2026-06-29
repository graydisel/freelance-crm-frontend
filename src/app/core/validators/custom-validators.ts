import { AbstractControl, ValidationErrors } from '@angular/forms';

export class CrmValidators {
    static requiredNoWhitespace(control: AbstractControl): ValidationErrors | null {
        const isWhitespace = (control.value || '').toString().trim().length === 0;
        const isValid = !isWhitespace;
        return isValid ? null : { required: true };
    }
}