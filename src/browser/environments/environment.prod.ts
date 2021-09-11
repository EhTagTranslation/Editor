import type { MatSnackBarConfig } from '@angular/material/snack-bar';

export const environment = {
    production: true,
};

export const snackBarConfig: MatSnackBarConfig = {
    duration: 10000,
    horizontalPosition: 'end',
    verticalPosition: 'top',
};
