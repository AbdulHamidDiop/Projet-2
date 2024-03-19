import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SocketRoomService } from '@app/services/socket-room.service';
import { of } from 'rxjs';
import { BarChartComponent } from './bar-chart.component';

describe('BarChartComponent', () => {
    let component: BarChartComponent;
    let fixture: ComponentFixture<BarChartComponent>;
    let mockSocketRoomService: jasmine.SpyObj<SocketRoomService>;

    beforeEach(async () => {
        mockSocketRoomService = jasmine.createSpyObj('SocketRoomService', ['listenForMessages']);

        await TestBed.configureTestingModule({
            declarations: [BarChartComponent],
            providers: [{ provide: SocketRoomService, useValue: mockSocketRoomService }],
        }).compileComponents();
    });

    beforeEach(() => {
        mockSocketRoomService.listenForMessages.and.returnValues(of({}), of({}));
        fixture = TestBed.createComponent(BarChartComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize barChartData with labels and datasets', () => {
        component.labels = 'Test Label';
        component.datasets = [{ data: [1, 2], label: 'Test Dataset', backgroundColor: 'red' }];
        component.updateData();

        expect(component.barChartData).toEqual({
            labels: ['Test Label'],
            datasets: [{ data: [1, 2], label: 'Test Dataset', backgroundColor: 'red' }],
        });
    });

    it('should update data on QCM_STATS and UPDATE_CHART events', fakeAsync(() => {
        const updateDataSpy = spyOn(component, 'updateData');
        mockSocketRoomService.listenForMessages.and.returnValues(of({}), of({}));
        fixture.detectChanges(); // ngOnInit is called
        tick();
        expect(updateDataSpy).toHaveBeenCalledTimes(2);
    }));
});
