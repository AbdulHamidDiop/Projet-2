import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { FetchService } from './fetch.service';

@Injectable({
    providedIn: 'root',
})
export class AdminService {
    constructor(private fetchService: FetchService) {}

    async verifyPassword(password: string): Promise<boolean> {
        const response = await this.fetchService.fetch(environment.serverUrl + 'admin/password', {
            method: 'POST',
            headers: {
                // Ce sont des headers de HTML qui ne sont pas pris en compte dans la naming convention de ESLINT
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password }),
        });
        if (response.ok) {
            return true;
        } else {
            return false;
        }
    }
}
