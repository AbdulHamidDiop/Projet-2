import { Component } from '@angular/core';
import { ChartConfiguration } from 'chart.js';

@Component({
    selector: 'app-bar-chart',
    templateUrl: './bar-chart.component.html',
    styleUrls: ['./bar-chart.component.scss'],
})
export class BarChartComponent {
    // @Input() labels: string = '';
    // @Input() datasets: { data: number[]; label: string }[] = [];
    title = 'ng2-charts-demo';

    barChartLegend = false;
    barChartPlugins = [];

    barChartData: ChartConfiguration<'bar'>['data'] = {
        // labels: [this.labels],
        // datasets: this.datasets,
        // {'Question 1' :
        // [
        //     { data: [2], label: 'Choix 1', backgroundColor: 'rgba(255, 0, 0, 0.6)' },
        //     { data: [1], label: 'Choix 2', backgroundColor: 'rgba(255, 0, 0, 0.6)' },
        //     { data: [1], label: 'Choix 3', backgroundColor: 'rgba(0, 255, 0, 0.6)' },
        //     { data: [1], label: 'Choix 4', backgroundColor: 'rgba(255, 0, 0, 0.6)' },
        // ],}

        labels: ['Question 1'],
        datasets: [
            { data: [2], label: 'Choix 1', backgroundColor: 'rgba(255, 0, 0, 0.6)' },
            { data: [1], label: 'Choix 2', backgroundColor: 'rgba(255, 0, 0, 0.6)' },
            { data: [1], label: 'Choix 3', backgroundColor: 'rgba(0, 255, 0, 0.6)' },
            { data: [1], label: 'Choix 4', backgroundColor: 'rgba(255, 0, 0, 0.6)' },
        ],
    };

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

    constructor() {
        console.log('constructed');
    }
}
