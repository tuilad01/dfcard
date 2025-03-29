import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputSwitchChangeEvent, InputSwitchModule } from 'primeng/inputswitch';

import { SettingService } from '../setting.service';
import { ChartModule } from 'primeng/chart';
import { ReportComponent } from '../components/report/report.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, InputSwitchModule, ChartModule, ReportComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  providers: [SettingService],
})
export class HomeComponent {
  basicData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      {
        label: 'Sales',
        data: [540, 325, 702, 620],
        backgroundColor: [
          'rgba(255, 159, 64, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(153, 102, 255, 0.2)',
        ],
        borderColor: [
          'rgb(255, 159, 64)',
          'rgb(75, 192, 192)',
          'rgb(54, 162, 235)',
          'rgb(153, 102, 255)',
        ],
        borderWidth: 1,
      },
    ],
  };
  basicOptions = {
    // plugins: {
    //   legend: {
    //     labels: {
    //       color: '#000',
    //     },
    //   },
    // },
    // scales: {
    //   y: {
    //     beginAtZero: true,
    //     ticks: {
    //       color: '#000',
    //     },
    //     grid: {
    //       color: '#000',
    //       drawBorder: false,
    //     },
    //   },
    //   x: {
    //     ticks: {
    //       color: '#000',
    //     },
    //     grid: {
    //       color: '#000',
    //       drawBorder: false,
    //     },
    //   },
    // },
  };

  data = {
    labels: ['A', 'B', 'C'],
    datasets: [
      {
        data: [540, 325, 702],
        // backgroundColor: [
        //   documentStyle.getPropertyValue('--blue-500'),
        //   documentStyle.getPropertyValue('--yellow-500'),
        //   documentStyle.getPropertyValue('--green-500'),
        // ],
        // hoverBackgroundColor: [
        //   documentStyle.getPropertyValue('--blue-400'),
        //   documentStyle.getPropertyValue('--yellow-400'),
        //   documentStyle.getPropertyValue('--green-400'),
        // ],
      },
    ],
  };
  options = {};

  // private _isOfflineMode: boolean = false;

  // get isOfflineMode() {
  //   return this._isOfflineMode;
  // }

  // constructor(private _settingService: SettingService) {}

  // ngOnInit(): void {
  //   this._settingService.getIsOfflineMode$().subscribe((value) => {
  //     this._isOfflineMode = value;
  //   });
  // }

  // changeMode(event: InputSwitchChangeEvent) {
  //   this._settingService.setIsOfflineMode(event.checked);
  // }
}
