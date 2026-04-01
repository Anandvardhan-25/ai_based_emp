import { Client } from '@stomp/stompjs';

export class WebSocketClient {
  private client: Client | null = null;
  private url: string;

  
  constructor() {
    const isWss = window.location.protocol === 'https:';
    const envUrl = import.meta.env.VITE_API_BASE_URL ?? import.meta.env.REACT_APP_API_URL;
    const baseUrl = envUrl 
        ? envUrl.replace(/^https?/, isWss ? 'wss' : 'ws')
        : `${isWss ? 'wss' : 'ws'}://ai-based-emp.onrender.com`;
        
    this.url = `${baseUrl}/ws`;
  }

  connect(
    onConnected: () => void,
    onNotification: (msg: any) => void,
    onDashboardUpdate: () => void
  ) {
    this.client = new Client({
      brokerURL: this.url,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = () => {
      onConnected();
      
      this.client?.subscribe('/user/queue/notifications', (message) => {
        if (message.body) {
          onNotification(JSON.parse(message.body));
        }
      });
      
      this.client?.subscribe('/topic/dashboard', (message) => {
        if (message.body) {
          onDashboardUpdate();
        }
      });
    };

    this.client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
  }
}
