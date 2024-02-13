import { TestBed } from '@angular/core/testing';

import { FetchService } from './fetch.service';

describe('FetchService', () => {
    let service: FetchService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(FetchService);
    });

    it('Should be possible to call fetch method', () => {
        //  Vérifie que l'adresse de la méthode existe
        expect(service.fetch).toBeTruthy();
    });
});
