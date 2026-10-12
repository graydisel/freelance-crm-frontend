import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HasPermissionDirective } from './has-permission.directive';
import { AuthStore } from '../../core/stores/auth.store';

@Component({
  standalone: true,
  imports: [HasPermissionDirective],
  template: `
    <div id="granted" *hasPermission="'projects:read'">Granted Content</div>
    <div id="denied" *hasPermission="'projects:delete'">Denied Content</div>
  `,
})
class TestHostComponent {}

describe('HasPermissionDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    const mockAuthStore = {
      hasPermission: (permission: string) => permission === 'projects:read',
      hasAnyPermission: (permissions: string[]) => permissions.includes('projects:read'),
    };

    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        {
          provide: AuthStore,
          useValue: mockAuthStore,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should render content when user has required permission', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('#granted')).toBeTruthy();
    expect(compiled.querySelector('#granted')?.textContent).toContain('Granted Content');
  });

  it('should not render content when user lacks required permission', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('#denied')).toBeNull();
  });
});
