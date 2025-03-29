import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  Observable,
  catchError,
  from,
  lastValueFrom,
  map,
  of,
  tap,
  window,
} from 'rxjs';
import { SettingService } from '../setting.service';
import { v4 as uuidv4 } from 'uuid';

export interface Phrase {
  id: string;
  name: string;
  meaning: string;
}
export interface Group {
  id: string;
  name: string;
  description: string;
  phrases: Phrase[];
}

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private apiUrl = environment.apiUrl + '/group'; // Replace with your API endpoint
  private readonly KEY: string = '/myapp/flashcards/groups';

  constructor(
    private http: HttpClient,
    private settingService: SettingService,
  ) {}

  // Create
  createGroup(item: any): Observable<any> {
    const isOfflineMode = this.settingService.getIsOfflineMode();
    if (isOfflineMode) {
      item.id = uuidv4();
      const groups = this.getGroupsFromLocal(this.KEY);
      groups.push(item);
      this.saveGroupsToLocal(this.KEY)(groups);
      return of(item);
    }

    return this.http
      .post<any>(`${this.apiUrl}`, item, httpOptions)
      .pipe(catchError(this.handleError<any>('createGroup')));
  }

  // Read
  getGroups(): Observable<any[]> {
    const isOfflineMode = this.settingService.getIsOfflineMode();
    if (isOfflineMode) {
      return of(this.getGroupsFromLocal(this.KEY));
    }

    return this.http
      .get<any[]>(`${this.apiUrl}`)
      .pipe(
        tap(this.saveGroupsToLocal(this.KEY)),
        catchError(this.handleError<any[]>('getGroups')),
      );
  }

  getGroup(id: string): Observable<any> {
    const isOfflineMode = this.settingService.getIsOfflineMode();
    if (isOfflineMode) {
      return of(this.getGroupFromLocal(this.KEY, id));
    }

    return this.http
      .get<any>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError<any>(`getGroup id=${id}`)));
  }

  // Update
  updateGroup(id: string, item: any): Observable<any> {
    const isOfflineMode = this.settingService.getIsOfflineMode();
    if (isOfflineMode) {
      const groups = this.getGroupsFromLocal(this.KEY);
      const updatedGroup = groups.find((gr: { id: string; }) => gr.id === id);
      if (!updatedGroup) {
        return of(null);
      }
      updatedGroup.name = item.name;
      updatedGroup.description = item.description;
      updatedGroup.phrases = item.phrases;
      this.saveGroupsToLocal(this.KEY)(groups);
      return of(item);
    }

    return this.http
      .put<any>(`${this.apiUrl}/${id}`, item, httpOptions)
      .pipe(catchError(this.handleError<any>('updateGroup')));
  }

  // Delete
  deleteGroup(id: string): Observable<any> {
    const isOfflineMode = this.settingService.getIsOfflineMode();
    if (isOfflineMode) {
      let groups = this.getGroupsFromLocal(this.KEY);
      groups = groups.filter((gr: { id: string; }) => gr.id !== id);
      this.saveGroupsToLocal(this.KEY)(groups);
      return of(true);
    }

    return this.http
      .delete<any>(`${this.apiUrl}/${id}`, httpOptions)
      .pipe(catchError(this.handleError<any>('deleteGroup')));
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error); // log to console instead
      return of(result as T);
    };
  }

  private getGroupsFromLocal(key: string): any {
    const strGroups = localStorage.getItem(key);
    if (!strGroups) {
      return [];
    }

    const groups = JSON.parse(strGroups);
    if (!groups || !Array.isArray(groups)) {
      return [];
    }

    return groups;
  }

  private getGroupFromLocal(key: string, id: string): any | undefined {
    const groups = this.getGroupsFromLocal(key);
    return groups.find((gr: any) => gr.id === id);
  }

  private saveGroupsToLocal(key: string) {
    return (data: any) => {
      localStorage.setItem(key, JSON.stringify(data));
    };
  }
}

