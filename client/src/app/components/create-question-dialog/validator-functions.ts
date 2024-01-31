import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Choices } from '@common/game';

const MULTIPLE_OF_TEN = 10;

export const multipleOfTenValidator: ValidatorFn = (control: AbstractControl): { [key: string]: unknown } | null => {
    const isValid = control.value % MULTIPLE_OF_TEN === 0;
    return isValid ? null : { notMultipleOfTen: { value: control.value } };
};
export const hasIncorrectAndCorrectAnswer: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const choices: Choices[] = control.value;

    let hasCorrectAnswer = false;
    let hasIncorrectAnswer = false;

    for (const choice of choices) {
        if (choice.isCorrect) {
            hasCorrectAnswer = true;
        } else {
            hasIncorrectAnswer = true;
        }

        if (hasCorrectAnswer && hasIncorrectAnswer) {
            return null;
        }
    }
    return { hasIncorrectAndCorrectAnswer: true };
};
