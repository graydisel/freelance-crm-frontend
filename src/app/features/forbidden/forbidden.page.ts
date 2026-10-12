import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CrmButtonComponent } from '../../shared/components/crm-button/crm-button';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [RouterLink, CrmButtonComponent],
  templateUrl: './forbidden.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './forbidden.page.scss',
})
export class ForbiddenPage {
  goBack(): void {
    window.history.back();
  }
}
