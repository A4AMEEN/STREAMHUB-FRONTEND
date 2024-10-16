/* eslint-disable @typescript-eslint/consistent-indexed-object-style */
import { AbstractControl, ValidatorFn, FormGroup, Validators } from '@angular/forms';

export class CustomValidators {
  static nameValidator(control: AbstractControl) {
    const regex = /^[a-zA-Z]+$/; // Regex to allow only alphabets
    return regex.test(control.value) ? null : { invalidName: true };
  }

  static passwordStrengthValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (!value) {
        return null;
      }
      const hasNumber = /[0-9]/.test(value);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
      const hasMinLength = value.length >= 8;
      const valid = hasNumber && hasSpecialChar && hasMinLength;
      return !valid ? { weakPassword: true } : null;
    };
  }

  static passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  static nameRegex = /^[a-zA-Z]+$/;

  static getSignupFormControls() {
    return {
      name: ['', [Validators.required, this.nameValidator]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, this.passwordStrengthValidator()]],
      confirmPassword: ['', Validators.required]
    };
  }

  static filterNameInput(event: KeyboardEvent) {
    const char = String.fromCharCode(event.charCode);
    if (!this.nameRegex.test(char)) {
      return { isInvalid: true, message: "Special Expressions not allowed" };
    }
    return { isInvalid: false, message: "" };
  }

  static getLoginFormControls() {
    return {
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    };
  }
}