import { ChangeDetectionStrategy, Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { BarChartChoiceStats } from '@common/game-stats';
import { ChartConfiguration } from 'chart.js';

@Component({
    selector: 'app-bar-chart',
    templateUrl: './bar-chart.component.html',
    styleUrls: ['./bar-chart.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
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
                display: false, // Hide x-axis
            },
            y: {
                display: true, // Show y-axis
                grid: {
                    display: false, // Hide grid lines
                },
                ticks: {
                    stepSize: 1, // Set tick value to 1
                },
            },
        },
    };

    ngOnInit(): void {
        // Initialize the chart data after inputs are received
        this.barChartData = {
            labels: [this.labels],
            datasets: this.datasets,
        };
    }

    ngOnChanges(changes: SimpleChanges): void {
        // Check if the input properties have changed and are not undefined
        this.barChartData = {
            labels: [this.labels],
            datasets: this.datasets,
        };
    }
}
