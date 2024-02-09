import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Message } from '@common/message';
import { StatusCodes } from 'http-status-codes';
import { environment } from 'src/environments/environment';
import { CommunicationService } from './communication.service';

describe('CommunicationService', () => {
    let httpMock: HttpTestingController;
    let service: CommunicationService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [CommunicationService],
        });
        service = TestBed.inject(CommunicationService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return expected message (HttpClient.get called once)', () => {
        const expectedMessage: Message = { body: 'Hello', title: 'World' };

        service.basicGet().subscribe((message) => {
            expect(message).toEqual(expectedMessage);
        });

        const req = httpMock.expectOne(`${environment.serverUrl}/example`);
        expect(req.request.method).toBe('GET');
        req.flush(expectedMessage);
    });

    it('should send a POST request and receive a response', () => {
        const sentMessage: Message = { body: 'Hello', title: 'World' };

        service.basicPost(sentMessage).subscribe((response) => {
            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body).toBe('OK');
        });

        const req = httpMock.expectOne(`${environment.serverUrl}/example/send`);
        expect(req.request.method).toBe('POST');
        req.flush('OK', { status: StatusCodes.OK, statusText: 'OK' });
    });

    it('should handle http error safely', () => {
        service.basicGet().subscribe({
            next: (response) => {
                expect(response).toBeUndefined();
            },
            error: () => fail('expected an error, not heroes'),
        });

        const req = httpMock.expectOne(`${environment.serverUrl}/example`);
        req.flush('Something went wrong', { status: StatusCodes.NOT_FOUND, statusText: 'Not Found' });
    });

    it('should update sharedVariable$ when updateSharedVariable is called', () => {
        let initialValue = false;
        service.sharedVariable$.subscribe((value) => {
            initialValue = value;
        });
        expect(initialValue).toBe(false);

        service.updateSharedVariable(true);
        service.sharedVariable$.subscribe((value) => {
            expect(value).toBe(true);
        });
    });
});
