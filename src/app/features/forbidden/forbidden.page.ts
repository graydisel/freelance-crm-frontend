import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './forbidden.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './forbidden.page.scss',
})
export class ForbiddenPage {}
