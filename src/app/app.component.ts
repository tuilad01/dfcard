import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { GroupService } from './group/group.service';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { ListboxModule } from 'primeng/listbox';
import { InputSwitchChangeEvent, InputSwitchModule } from 'primeng/inputswitch';
import { SettingService } from './setting.service';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ButtonModule,
    SidebarModule,
    ListboxModule,
    InputSwitchModule,
    FormsModule,
    CalendarModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'card-app';
  sidebarVisible: boolean = false;
  now = new Date();
  value = new Date(
    this.now.getFullYear(),
    this.now.getMonth(),
    this.now.getDate(),
    8,
    0,
    0,
  );
  minDate = new Date(
    this.now.getFullYear(),
    this.now.getMonth(),
    this.now.getDate(),
    8,
    0,
    0,
  );
  maxDate = new Date(
    this.now.getFullYear(),
    this.now.getMonth(),
    this.now.getDate(),
    17,
    0,
    0,
  );
  pages = [
    {
      displayName: 'Home',
      path: '/home',
      active: false,
    },
    {
      displayName: 'Group',
      path: '/group',
      active: true,
    },
    {
      displayName: 'Flashcard',
      path: '/flashcard',
      active: false,
    },
  ];

  private _isOfflineMode: boolean = false;

  get isOfflineMode() {
    return this._isOfflineMode;
  }

  constructor(private _settingService: SettingService) {}

  ngOnInit(): void {
    this._settingService.getIsOfflineMode$().subscribe((value) => {
      this._isOfflineMode = value;
    });
  }

  changeMode(event: InputSwitchChangeEvent) {
    this._settingService.setIsOfflineMode(event.checked);
  }
}
