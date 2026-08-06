import { Component, Inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { NgClass } from '@angular/common';

export interface ConfirmationModalData {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [NgClass],
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss']
})
export class ConfirmationModalComponent {
  title: string;
  description: string;
  confirmText: string;
  cancelText: string;
  variant: 'danger' | 'warning' | 'info';

  constructor(
    public dialogRef: DialogRef<boolean>,
    @Inject(DIALOG_DATA) public data: ConfirmationModalData
  ) {
    this.title = data.title;
    this.description = data.description;
    this.confirmText = data.confirmText || 'Confirm';
    this.cancelText = data.cancelText || 'Cancel';
    this.variant = data.variant || 'danger';
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
