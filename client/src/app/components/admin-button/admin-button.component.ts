import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '@app/services/admin.service';
import { CommunicationService } from '@app/services/communication.service';

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
        private readonly adminService: AdminService,
    ) {}

    toggleAdmin() {
        this.showAdminInput = !this.showAdminInput;
    }

    async verifyPassword() {
        this.passwordError = false;
        const validated = await this.adminService.verifyPassword(this.userInput);
        if (validated) {
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
