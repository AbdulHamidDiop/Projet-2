import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class FetchService {
    async fetch(input: RequestInfo | URL, init?: RequestInit | undefined): Promise<Response> {
        return fetch(input, init);
    }
}
