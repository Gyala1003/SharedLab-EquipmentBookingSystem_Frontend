import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms'

export type PasswordRuleKey = 'minLength' | 'uppercase' | 'lowercase' | 'digit' | 'special'

interface PasswordRule {
  key: PasswordRuleKey
  test: (value: string) => boolean
}

/**
 * Chainable password-policy builder (Zod/Yup-style method chaining).
 * Each method appends one rule; `.evaluate()` returns a per-rule pass/fail
 * map for checklist UIs, `.toValidatorFn()` returns a plain Angular ValidatorFn.
 */
export class FluentPasswordPolicy {
  private readonly rules: PasswordRule[] = []

  minLength(length: number): this {
    this.rules.push({ key: 'minLength', test: (v) => v.length > length })
    return this
  }

  uppercase(): this {
    this.rules.push({ key: 'uppercase', test: (v) => /[A-Z]/.test(v) })
    return this
  }

  lowercase(): this {
    this.rules.push({ key: 'lowercase', test: (v) => /[a-z]/.test(v) })
    return this
  }

  digit(): this {
    this.rules.push({ key: 'digit', test: (v) => /[0-9]/.test(v) })
    return this
  }

  specialChar(): this {
    this.rules.push({ key: 'special', test: (v) => /[!@#$%^&*(),.?":{}|<>_\-+=[\]/\\;'~`]/.test(v) })
    return this
  }

  evaluate(value: string): Record<PasswordRuleKey, boolean> {
    const result = {} as Record<PasswordRuleKey, boolean>
    for (const rule of this.rules) {
      result[rule.key] = rule.test(value)
    }
    return result
  }

  isValid(value: string): boolean {
    return this.rules.every((rule) => rule.test(value))
  }

  toValidatorFn(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = (control.value as string | null) ?? ''
      const checklist = this.evaluate(value)
      return this.isValid(value) ? null : { passwordPolicy: checklist }
    }
  }
}

/** ShareLab reset-password policy: > 8 chars, upper, lower, digit, special char. */
export function createResetPasswordPolicy(): FluentPasswordPolicy {
  return new FluentPasswordPolicy().minLength(8).uppercase().lowercase().digit().specialChar()
}

/** Cross-field validator: sets/clears `passwordMismatch` directly on the confirmation control. */
export function passwordMatchValidator(passwordKey: string, confirmKey: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const passwordControl = group.get(passwordKey)
    const confirmControl = group.get(confirmKey)
    if (!passwordControl || !confirmControl) return null

    if (confirmControl.value && confirmControl.value !== passwordControl.value) {
      confirmControl.setErrors({ ...confirmControl.errors, passwordMismatch: true }, { emitEvent: false })
    } else if (confirmControl.hasError('passwordMismatch')) {
      const { passwordMismatch: _removed, ...rest } = confirmControl.errors ?? {}
      confirmControl.setErrors(Object.keys(rest).length ? rest : null, { emitEvent: false })
    }
    return null
  }
}
