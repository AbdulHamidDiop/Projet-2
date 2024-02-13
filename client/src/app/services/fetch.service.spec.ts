/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { TestBed } from '@angular/core/testing';
import { FetchService } from './fetch.service';

async function fetchMock(): Promise<Response> {
    const fakeResponse = new Response(
        JSON.stringify({
            data: 'fake data',
        }),
        {
            status: 200,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            headers: { 'Content-Type': 'application/json' },
        },
    );
    return Promise.resolve(fakeResponse);
}

describe('FetchService', () => {
    let service: FetchService;
    const fetchSpy = jasmine.createSpy().and.callFake(fetchMock);

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: FetchService,
                    useValue: {
                        fetch: fetchSpy,
                    },
                },
            ],
        });
        service = TestBed.inject(FetchService);
    });

    it('Should be possible to call fetch method', () => {
        //  Vérifie que l'adresse de la méthode existe
        expect(service.fetch).toBeTruthy();
    });
});
