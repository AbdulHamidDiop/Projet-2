import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommunicationService } from '@app/services/communication.service';
import { QuestionsService } from '@app/services/questions.service';
import { API_URL } from '@common/consts';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    readonly title: string = 'Qui(ck)zz';
    message: BehaviorSubject<string> = new BehaviorSubject<string>('');
    userInput: string = '';
    constructor(
        readonly communicationService: CommunicationService,
        readonly router: Router,
        readonly questionsService: QuestionsService,
    ) {
        // Pourra être supprimé après la démo.
        this.questionsService.getAllQuestions();
    }

    async verifyPassword() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await fetch(API_URL + 'admin/password', {
            method: 'POST',
            headers: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password: this.userInput }),
        });
        if (response.ok) {
            this.router.navigate(['/admin']);
            this.communicationService.updateSharedVariable(true);
        } else {
            alert('Mot de passe incorrect.');
        }
    }

    async onButtonClick() {
        await this.verifyPassword();
    }
}
