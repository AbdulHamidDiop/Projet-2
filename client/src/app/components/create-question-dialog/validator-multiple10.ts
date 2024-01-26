import { AbstractControl, ValidatorFn } from '@angular/forms';

const MULTIPLE_OF_TEN = 10;

export const multipleOfTenValidator: ValidatorFn = (control: AbstractControl): { [key: string]: unknown } | null => {
    const isValid = control.value % MULTIPLE_OF_TEN === 0;
    return isValid ? null : { notMultipleOfTen: { value: control.value } };
};
