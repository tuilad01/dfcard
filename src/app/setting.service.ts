import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

const IS_OFFLINE_MODE_KEY = '/myapp/flashcards/settings/is_offline_mode';

// TODO: make generic setting service that can get/set a setting
//
// interface Setting {
//   [key:string]: string
//   key: string
//   value: string
// }

// const KEYS = [

// ]

@Injectable({
  providedIn: 'root',
})
export class SettingService {
  //private _settings: BehaviorSubject<Setting>[] = [];

  private _isOfflineMode = new BehaviorSubject<boolean>(true);
  constructor() {
    const item = localStorage.getItem(IS_OFFLINE_MODE_KEY) || true.toString();
    this._isOfflineMode.next(JSON.parse(item));
  }

  getIsOfflineMode$(): Observable<boolean> {
    return this._isOfflineMode.asObservable();
  }

  getIsOfflineMode(): boolean {
    return JSON.parse(
      localStorage.getItem(IS_OFFLINE_MODE_KEY) || true.toString(),
    );
  }

  setIsOfflineMode(value: boolean) {
    this._isOfflineMode.next(value);
    localStorage.setItem(IS_OFFLINE_MODE_KEY, value.toString());
  }
}
