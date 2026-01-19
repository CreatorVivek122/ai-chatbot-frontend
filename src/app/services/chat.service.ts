import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private readonly API_URL =
    'https://ai-chatbot-backend-s8qj.vercel.app/api/chat';

  constructor(private http: HttpClient) {}

  /**
   * Send message to backend with selected model
   */
  sendMessage(
    message: string,
    model: 'FAST' | 'SMART' | 'LONG' | 'LIGHT'
  ): Observable<{ reply: string; modelUsed?: string }> {

    return this.http.post<{ reply: string; modelUsed?: string }>(
      this.API_URL,
      {
        message,
        model
      }
    );
  }


  generateTitle(message: string) {
    return this.http.post<{ title: string }>(
      'https://ai-chatbot-backend-s8qj.vercel.app/api/title',
      { message }
    );
  }

}
