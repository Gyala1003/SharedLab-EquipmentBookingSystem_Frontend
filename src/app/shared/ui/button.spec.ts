import { TestBed } from '@angular/core/testing'
import { Component } from '@angular/core'
import { ButtonComponent } from './button'

@Component({
  imports: [ButtonComponent],
  template: `<app-button [loading]="loading">Go</app-button>`,
})
class HostComponent {
  loading = false
}

describe('ButtonComponent', () => {
  it('projects content', async () => {
    const fixture = TestBed.createComponent(HostComponent)
    await fixture.whenStable()
    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement
    expect(btn.textContent).toContain('Go')
    expect(btn.disabled).toBe(false)
  })

  it('disables while loading', async () => {
    const fixture = TestBed.createComponent(HostComponent)
    fixture.componentInstance.loading = true
    await fixture.whenStable()
    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement
    expect(btn.disabled).toBe(true)
  })
})
