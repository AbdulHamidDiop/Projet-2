import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { CommunicationService } from '@app/services/communication.service';
import { of } from 'rxjs';
import SpyObj = jasmine.SpyObj;

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;
    let communicationServiceSpy: SpyObj<CommunicationService>;
    let httpMock: HttpTestingController;

    beforeEach(async () => {
        communicationServiceSpy = jasmine.createSpyObj('ExampleService', ['basicGet', 'basicPost']);
        communicationServiceSpy.basicGet.and.returnValue(of({ title: '', body: '' }));
        communicationServiceSpy.basicPost.and.returnValue(of(new HttpResponse<string>({ status: 201, statusText: 'Created' })));

        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientTestingModule],
            declarations: [MainPageComponent],
            providers: [CommunicationService],
        }).compileComponents();
    });

    beforeEach(() => {
        httpMock = TestBed.inject(HttpTestingController);
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should navigate to /admin and update shared variable when password is correct', fakeAsync(() => {
        const spyNavigate = spyOn(component.router, 'navigate').and.stub();
        const spyUpdateSharedVariable = spyOn(component.communicationService, 'updateSharedVariable').and.stub();

        component.userInput = 'LOG2990-312';

        component.verifyPassword();

        const req = httpMock.expectOne('http://localhost:3000/api/admin/password');
        expect(req.request.method).toBe('POST');

        req.flush(true);

        tick();

        expect(spyNavigate).toHaveBeenCalledWith(['/admin']);
        expect(spyUpdateSharedVariable).toHaveBeenCalledWith(true);
    }));

    it('should display alert for incorrect password', () => {
        const userInput = 'wrongpassword';
        const mockResponse = { body: 'false' };

        spyOn(window, 'alert');

        component.userInput = userInput;
        component.verifyPassword();

        const req = httpMock.expectOne('http://localhost:3000/api/admin/password');
        expect(req.request.method).toBe('POST');
        req.flush(mockResponse);

        expect(window.alert).toHaveBeenCalledWith('Incorrect password');
    });

    it('should call verifyPassword on button click', () => {
        spyOn(component, 'verifyPassword');
        component.onButtonClick();
        expect(component.verifyPassword).toHaveBeenCalled();
    });
});
