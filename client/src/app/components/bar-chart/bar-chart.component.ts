import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { BarChartChoiceStats } from '@common/game-stats';
import { ChartConfiguration } from 'chart.js';

@Component({
    selector: 'app-bar-chart',
    templateUrl: './bar-chart.component.html',
    styleUrls: ['./bar-chart.component.scss'],
})
export class BarChartComponent implements OnInit {
    @Input() labels: string = '';
    @Input() datasets: BarChartChoiceStats[] = [];
    title = 'ng2-charts-demo';

    barChartLegend = false;
    barChartPlugins = [];

    barChartData: ChartConfiguration<'bar'>['data'];

    barChartOptions: ChartConfiguration<'bar'>['options'] = {
        responsive: true,
        maintainAspectRatio: false, // Added for non-proportional resizing
        scales: {
            x: {
                display: false,
            },
            y: {
                display: true, // Show y-axis
                grid: {
                    display: false, // Hide grid lines
                },
                ticks: {
                    stepSize: 1,
                    color: 'white',
                    font: {
                        size: 14,
                        weight: 'bold',
                    },
                },
            },
        },
    };

    constructor(private changeDetector: ChangeDetectorRef) {}

    ngOnInit(): void {
        this.updateData();
    }

    updateData(): void {
        this.changeDetector.detectChanges();
        this.barChartData = {
            labels: [this.labels],
            datasets: this.datasets,
        };
    }
}
