import {
  Component,
  input,
  output,
  signal,
  HostListener,
  ElementRef,
  inject,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
// import { RouterModule } from '@angular/router';
import { Project } from '../../../../core/models/project.model';
import { ProjectStatusEnum } from '../../../../core/enums/project-status.enum';
import { CrmMetricCard } from '../../../../shared/components/crm-metric-card/crm-metric-card';
import { CrmExpandableTextComponent } from '../../../../shared/components/crm-expandable-text/crm-expandable-text.component';

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [CommonModule, CrmMetricCard, CrmExpandableTextComponent],
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    '[class.is-card-expanded]': 'isExpanded()',
  },
})
export class ProjectCardComponent {
  project = input.required<Project>();
  projectClick = output<Project>();
  protected readonly ProjectStatusEnum = ProjectStatusEnum;

  isExpanded = signal(false);
  private elementRef = inject(ElementRef);

  @ViewChild(CrmExpandableTextComponent) expandableText!: CrmExpandableTextComponent;

  onExpandedChange(expanded: boolean) {
    this.isExpanded.set(expanded);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.isExpanded() && !this.elementRef.nativeElement.contains(event.target)) {
      this.isExpanded.set(false);
      if (this.expandableText) {
        this.expandableText.isExpanded.set(false);
      }
    }
  }

  onTitleClick(event: Event): void {
    event.preventDefault();
    this.projectClick.emit(this.project());
  }
}
