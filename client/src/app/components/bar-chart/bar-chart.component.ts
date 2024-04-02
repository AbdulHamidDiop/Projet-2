import { Component, Input, OnInit } from '@angular/core';
import { SocketRoomService } from '@app/services/socket-room.service';
import { BarChartChoiceStats } from '@common/game-stats';
import { Events, Namespaces } from '@common/sockets';
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

    constructor(private socketService: SocketRoomService) {}

    ngOnInit(): void {
        this.updateData();

        this.socketService.listenForMessages(Namespaces.GAME_STATS, Events.QCM_STATS).subscribe(() => {
            this.updateData();
        });

        this.socketService.listenForMessages(Namespaces.GAME_STATS, Events.QRL_STATS).subscribe(() => {
            this.updateData();
        });

        this.socketService.listenForMessages(Namespaces.GAME_STATS, Events.UPDATE_CHART).subscribe(() => {
            this.updateData();
        });

        this.socketService.listenForMessages(Namespaces.GAME, Events.QRL_GRADE).subscribe(() => {
            this.updateData();
        });
    }

    updateData(): void {
        this.barChartData = {
            labels: [this.labels],
            datasets: this.datasets,
        };
    }
}
