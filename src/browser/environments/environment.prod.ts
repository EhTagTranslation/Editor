import type { MatLegacySnackBarConfig as MatSnackBarConfig } from '@angular/material/legacy-snack-bar';

export const environment = {
    production: true,
};

export const snackBarConfig: MatSnackBarConfig = {
    duration: 10000,
    horizontalPosition: 'end',
    verticalPosition: 'top',
};
