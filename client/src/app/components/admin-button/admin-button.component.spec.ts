import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { CommunicationService } from '@app/services/communication.service';
import { API_URL } from '@common/consts';
import { of } from 'rxjs';
import { AdminButtonComponent } from './admin-button.component';
import SpyObj = jasmine.SpyObj;

describe('AdminButtonComponent', () => {
    let component: AdminButtonComponent;
    let fixture: ComponentFixture<AdminButtonComponent>;
    let communicationServiceSpy: SpyObj<CommunicationService>;

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
        fixture = TestBed.createComponent(AdminButtonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should verify password successfully', fakeAsync(() => {
        component.userInput = 'log2990-312';

        spyOn(component.router, 'navigate');
        spyOn(component.communicationService, 'updateSharedVariable');

        spyOn(window, 'fetch').and.returnValue(Promise.resolve(new Response(null, { status: 200, headers: { contentType: 'application/json' } })));

        component.verifyPassword();
        tick();

        expect(component.router.navigate).toHaveBeenCalledWith(['/admin']);
        expect(component.communicationService.updateSharedVariable).toHaveBeenCalledWith(true);

        expect(window.fetch).toHaveBeenCalledWith(
            API_URL + 'admin/password',
            jasmine.objectContaining({
                method: 'POST',
                body: JSON.stringify({ password: component.userInput }),
            }),
        );
    }));

    it('should call verifyPassword on button click', () => {
        spyOn(component, 'verifyPassword');
        component.onButtonClick();
        expect(component.verifyPassword).toHaveBeenCalled();
    });
});
