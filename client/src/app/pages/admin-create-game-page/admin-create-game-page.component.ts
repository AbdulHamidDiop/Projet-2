import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateQuestionDialogComponent } from '@app/components/create-question-dialog/create-question-dialog.component';

@Component({
    selector: 'app-admin-create-game-page',
    templateUrl: './admin-create-game-page.component.html',
    styleUrls: ['./admin-create-game-page.component.scss'],
})
export class AdminCreateGamePageComponent {
    constructor(public dialog: MatDialog) {}

    openDialog(): void {
        const dialogRef = this.dialog.open(CreateQuestionDialogComponent, {
            
            // you can pass data as well
        });

        dialogRef.afterClosed().subscribe(result => {
            // handle result if needed
        });
    }
}
