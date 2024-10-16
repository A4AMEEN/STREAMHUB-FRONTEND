import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ActionConfirmationData {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
}

@Component({
  selector: 'app-action-confirmation-dialog',
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <div mat-dialog-content>
      {{ data.message }}
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>{{ data.cancelText }}</button>
      <button mat-button color="primary" [mat-dialog-close]="true">{{ data.confirmText }}</button>
    </div>
  `,
  styles: [`
    h2 {
      color: #e0e0e0;
    }
    div[mat-dialog-content] {
      color: #bdbdbd;
    }
  `]
})
export class ActionConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ActionConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ActionConfirmationData
  ) {}
}