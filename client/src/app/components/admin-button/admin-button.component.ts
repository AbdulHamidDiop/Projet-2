import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommunicationService } from '@app/services/communication.service';
import { QuestionsService } from '@app/services/questions.service';
import { environment } from 'src/environments/environment';
import { NamingConvention } from '@app/services/headers';

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
        const response = await fetch(environment.serverUrl + 'admin/password', {
            method: 'POST',
            headers: {
                [NamingConvention.CONTENT_TYPE]: 'application/json',
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
