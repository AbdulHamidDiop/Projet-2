/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { TestBed } from '@angular/core/testing';

import { AdminService } from './admin.service';
import { FetchService } from './fetch.service';

async function arrayBufferMock(): Promise<ArrayBuffer> {
    const buffer = new ArrayBuffer(0);
    return buffer;
}

async function blobMock(): Promise<Blob> {
    const blob = new Blob();
    return blob;
}

async function formDataMock(): Promise<FormData> {
    const formData = new FormData();
    return formData;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function jsonMock(): Promise<any> {
    return {};
}

async function textMock(): Promise<string> {
    return '';
}

let responseSetToOk = true;
const response: Response = {
    ok: true,
    status: 200,
    headers: new Headers(),
    type: 'basic',
    redirected: false,
    statusText: '',
    url: '',
    clone: () => {
        return new Response();
    },
    body: new ReadableStream<Uint8Array>(),
    bodyUsed: false,
    arrayBuffer: arrayBufferMock,
    blob: blobMock,
    formData: formDataMock,
    json: jsonMock,
    text: textMock,
};
const errorResponse: Response = {
    ok: false,
    status: 404,
    type: 'basic',
    headers: new Headers(),
    redirected: false,
    statusText: '',
    url: '',
    clone: () => {
        return new Response();
    },
    body: new ReadableStream<Uint8Array>(),
    bodyUsed: false,
    arrayBuffer: arrayBufferMock,
    blob: blobMock,
    formData: formDataMock,
    json: jsonMock,
    text: textMock,
};

async function fetchMock(): Promise<Response> {
    if (responseSetToOk) {
        return response;
    } else {
        return errorResponse;
    }
}

describe('AdminServiceService', () => {
    let service: AdminService;
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
        service = TestBed.inject(AdminService);
    });

    afterEach(() => {
        responseSetToOk = true;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('Should return true for correct password', async () => {
        const answer = await service.verifyPassword('right');
        expect(answer).toBeTruthy();
    });

    it('Should return false for incorrect password', async () => {
        responseSetToOk = false;
        const answer = await service.verifyPassword('wrong');
        expect(answer).toBeFalsy();
    });
});
