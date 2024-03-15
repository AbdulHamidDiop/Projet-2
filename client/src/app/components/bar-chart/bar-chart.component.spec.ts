import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BarChartComponent } from './bar-chart.component';

describe('BarChartComponent', () => {
    let component: BarChartComponent;
    let fixture: ComponentFixture<BarChartComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [BarChartComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(BarChartComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have correct chart legend setting', () => {
        expect(component.barChartLegend).toBe(false);
    });

    it('should have correct chart data', () => {
        expect(component.barChartData.labels).toEqual(['Question 1']);
        expect(component.barChartData.datasets.length).toBe(4);
        expect(component.barChartData.datasets[0].data).toEqual([2]);
        expect(component.barChartData.datasets[1].data).toEqual([1]);
        expect(component.barChartData.datasets[2].data).toEqual([1]);
        expect(component.barChartData.datasets[3].data).toEqual([1]);
    });

    it('should have correct chart options', () => {
        if (component.barChartOptions) {
            expect(component.barChartOptions.responsive).toBe(true);
            expect(component.barChartOptions.maintainAspectRatio).toBe(false);
            expect(component.barChartOptions.scales?.x?.display).toBe(false);
            expect(component.barChartOptions.scales?.y?.display).toBe(true);
            expect(component.barChartOptions.scales?.y?.grid?.display).toBe(false);
        } else {
            fail('barChartOptions is undefined');
        }
    });
});
