import { MatSnackBarConfig } from '@angular/material';

export const environment = {
  production: true
};

export const snackBarConfig: MatSnackBarConfig = {
  duration: 10000,
  horizontalPosition: 'end',
  verticalPosition: 'top',
}