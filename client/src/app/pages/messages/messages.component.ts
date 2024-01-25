import { Component, OnInit, signal } from '@angular/core';
import { Message,ChatDetails, ChatService } from '../../services/chat.service';
import { UserStoreService } from '../../services/user-store.service';
import { ActivatedRoute } from '@angular/router';
import { UserDetails } from '../../services/user.service';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [ReactiveFormsModule,FormsModule,CommonModule],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.css'
})
export class MessagesComponent implements OnInit{
  public loading = signal<boolean>(true);
  public chat = signal<ChatDetails | undefined>(undefined);
  public messages = signal<Message[]>([]);
  

  chatId: string = '';
  otherUser: UserDetails | undefined

  public messageInput = new FormControl<string>('');
  public messages$ = this.chatService.loadMessages(this.route.snapshot.paramMap.get('id')!) as Observable<Message[]>;

  constructor(
    private chatService:ChatService,
    public userStore: UserStoreService,    
    private route:ActivatedRoute
  ){
    const chatId = this.route.snapshot.paramMap.get('id');
    
    this.chatService.getChatById(chatId!).subscribe({
      next: (response) => this.chat.set(response),
      complete: () => this.loading.set(false),
      error: (err) => console.error(err),
    });
  
  }

  ngOnInit() {
    this.chatId = this.route.snapshot.paramMap.get('id')!
  }

  updateMessages(chatId = this.route.snapshot.paramMap.get('id')){
    this.chatService.getMessages$(chatId!).subscribe({
      next: (response) => this.messages.set(response),
      complete: () => this.loading.set(false),
      error: (err) => console.error(err),
    }); 
  }

  sendMessage(chatId: string){
    this.chatService.sendMessage(chatId, this.messageInput?.value ?? '').subscribe();
    this.messageInput.reset();
  }

  formatDate(date: any): string {
    return new Date(date.seconds * 1000).toLocaleString();
  }

}