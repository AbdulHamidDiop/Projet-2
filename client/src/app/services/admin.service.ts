import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { FetchService } from './fetch.service';
import { NamingConvention } from './headers';

@Injectable({
    providedIn: 'root',
})
export class AdminService {
    constructor(private fetchService: FetchService) {}

    async verifyPassword(password: string): Promise<boolean> {
        const response = await this.fetchService.fetch(environment.serverUrl + 'admin/password', {
            method: 'POST',
            headers: {
                [NamingConvention.CONTENT_TYPE]: 'application/json',
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
