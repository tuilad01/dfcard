import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class ChatService {
  env = environment;
  connection?: HubConnection;
  constructor() { }

  connect(): Promise<void> {
    this.connection = new HubConnectionBuilder().withUrl("http://localhost:43216/chatHub").build();
    return this.connection.start();
  }

  listen({event, handler}: {event: string, handler: (...args: any[]) => void}) {
    if (!this.connection) {
      console.error("ERROR. Connection is undefined.")
      return;
    }

    this.connection.on(event, handler);
  }
  send({method, args}: {method: string, args: any[]}) {
    if (!this.connection) {
      console.error("ERROR. Connection is undefined.")
      return;
    }

    this.connection.invoke(method, ...args);
  }
}
