import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-error-dialog',
    template: `
      <div class="dialog-container">
        <h2 mat-dialog-title>Alert</h2>
        <mat-dialog-content>
          {{ data.message }}
        </mat-dialog-content>
        <mat-dialog-actions align="end">
          <button mat-button color="primary" [mat-dialog-close]="true">OK</button>
        </mat-dialog-actions>
      </div>
    `,
    styles: [`
      :host {
        display: block;
      }
      .dialog-container {
        background: linear-gradient(135deg, #e0f7fa 0%, #80deea 100%);
        color: #333333;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      h2 {
        margin-top: 0;
        color: #01579b;
        font-weight: bold;
      }
      mat-dialog-content {
        margin-bottom: 20px;
        font-size: 16px;
      }
      mat-dialog-actions {
        margin-bottom: 0;
      }
      button {
        background-color: #0288d1;
        color: white;
      }
    `]
  })
  export class ErrorDialogComponent {
    constructor(
      public dialogRef: MatDialogRef<ErrorDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: { message: string }
    ) {}
  }