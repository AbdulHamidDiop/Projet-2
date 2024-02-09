import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
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

    it('should verify password successfully', () => {
        const userInput = 'password';
        const mockResponse = { body: 'true' };
    
        spyOn(component.router, 'navigate');
        spyOn(component.communicationService, 'updateSharedVariable');
    
        component.userInput = userInput;
        component.verifyPassword();
    
        const req = httpMock.expectOne('http://localhost:3000/api/admin/password');
        expect(req.request.method).toBe('POST');
        req.flush(mockResponse);
    
        expect(component.router.navigate).toHaveBeenCalledWith(['/admin']);
        expect(component.communicationService.updateSharedVariable).toHaveBeenCalledWith(true);
      });
    
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
