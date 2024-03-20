import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommunicationService } from '@app/services/communication.service';
import { QuestionsService } from '@app/services/questions.service';
import { API_URL } from '@common/consts';

@Component({
    selector: 'app-admin-button',
    templateUrl: './admin-button.component.html',
    styleUrls: ['./admin-button.component.scss'],
})
export class AdminButtonComponent {
    showAdminInput: boolean = false;
    userInput: string = '';
    passwordError: boolean;

    constructor(
        readonly communicationService: CommunicationService,
        readonly router: Router,
        readonly questionsService: QuestionsService,
    ) {}

    toggleAdmin() {
        this.showAdminInput = !this.showAdminInput;
    }

    async verifyPassword() {
        this.passwordError = false;
        const response = await fetch(API_URL + 'admin/password', {
            method: 'POST',
            headers: {
                // Ce sont des headers de HTML qui ne sont pas pris en compte dans la naming convention de ESLINT
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password: this.userInput }),
        });
        if (response.ok) {
            this.router.navigate(['/admin']);
            this.communicationService.updateSharedVariable(true);
        } else {
            this.passwordError = true;
        }
    }

    async onButtonClick() {
        await this.verifyPassword();
    }
}
