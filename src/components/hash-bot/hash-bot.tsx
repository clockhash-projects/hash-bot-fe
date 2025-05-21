import { Component, Prop, State, h } from '@stencil/core';
import { io, Socket } from 'socket.io-client';

@Component({
  tag: 'hash-bot',
  styleUrl: 'hash-bot.css',
  shadow: true,
})
export class HashBot {
  @Prop() apiurl: string;
  @Prop() iconsize: number = 40; // Default size is 40
  @Prop() chatbotwidth: number = 300; // Default chatbox width
  @Prop() chatbotheight: number = 400; // Default chatbox height
  @State() messages: { text: string; sender: 'user' | 'bot' }[] = [];
  @State() isChatOpen: boolean = false;
  @State() unreadMessages: number = 0;
  @State() isBotTyping: boolean = false;
  @State() isDragging: boolean = false;

  private socket: Socket;
  private inputRef: HTMLInputElement;
  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private offsetX: number = 0;
  private offsetY: number = 0;
  private floatingIconRef: HTMLElement;
  private chatContainerRef: HTMLElement;

  connectedCallback() {
    if (!this.apiurl) {
      console.error('API URL is required for the hash-bot component');
      return;
    }

    this.socket = io(this.apiurl, {
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    this.socket.on('answer', (data: any) => {
      this.isBotTyping = false;
      this.addMessage(data?.answer, 'bot');
      console.log('Received answer:', data);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });
  }

  addMessage(text: string, sender: 'user' | 'bot') {
    this.messages = [...this.messages, { text, sender }];
    if (!this.isChatOpen && sender === 'bot') {
      this.unreadMessages++;
    }
  }

  toggleChat() {
    if (!this.isDragging) {
      this.isChatOpen = !this.isChatOpen;
      if (this.isChatOpen) {
        this.unreadMessages = 0;
      }
    }
  }

  handleSendMessage() {
    const message = this.inputRef.value;
    if (message) {
      this.addMessage(message, 'user');
      this.isBotTyping = true;
      this.socket.emit("ask", {"question": message});
      this.inputRef.value = '';
    }
  }

  handleDragStart(event: MouseEvent) {
    this.isDragging = true;
    this.dragStartX = event.clientX - this.offsetX;
    this.dragStartY = event.clientY - this.offsetY;

    window.addEventListener('mousemove', this.handleDragMove);
    window.addEventListener('mouseup', this.handleDragEnd);
  }

  handleDragMove = (event: MouseEvent) => {
    this.offsetX = event.clientX - this.dragStartX;
    this.offsetY = event.clientY - this.dragStartY;

    if (this.floatingIconRef) {
      this.floatingIconRef.style.transform = `translate(${this.offsetX}px, ${this.offsetY}px)`;
    }

    if (this.chatContainerRef) {
      this.chatContainerRef.style.transform = `translate(${this.offsetX}px, ${this.offsetY}px)`;
    }
  };

  handleDragEnd = () => {
    this.isDragging = false;
    window.removeEventListener('mousemove', this.handleDragMove);
    window.removeEventListener('mouseup', this.handleDragEnd);
    this.dragStartX = 0; // Reset start positions
    this.dragStartY = 0;
  };

  render() {
    const iconStyle = {
      cursor: 'pointer',
      width: `${this.iconsize}px`,
      height: `${this.iconsize}px`,
      fontSize: `${this.iconsize * 0.6}px`,
    };

    const chatStyle = {
      width: `${this.chatbotwidth}px`,
      height: `${this.chatbotheight}px`,
    };

    return (
      <div class="hash-bot">
        <div
          class="floating-icon"
          ref={el => (this.floatingIconRef = el as HTMLElement)}
          onMouseDown={event => this.handleDragStart(event)}
          onClick={() => this.toggleChat()}
          title={this.unreadMessages > 0 ? `${this.unreadMessages} new messages` : 'Open chat'}
          style={iconStyle}
        >
          <span class="icon">💬</span>
          {this.unreadMessages > 0 && <span class="badge">{this.unreadMessages}</span>}
        </div>

        {this.isChatOpen && (
          <div
            class="chat-container"
            ref={el => (this.chatContainerRef = el as HTMLElement)}
            style={{ transform: `translate(${this.offsetX}px, ${this.offsetY}px)`, ...chatStyle }}
          >
            <div class="chat-header">
              <span class="chat-title">Hash bot</span>
              <span class="chat-status">{this.socket?.connected ? '(Online)' : '(Offline)'}</span>
              <button class="close-button" onClick={() => this.toggleChat()}>
                ✖
              </button>
            </div>
            <div class="chat-body" style={{ maxHeight: `${this.chatbotheight - 80}px` }}>
              {this.messages.map(message => (
                <div class={`message ${message.sender}`}>{message.text}</div>
              ))}
              {this.isBotTyping && <div class="typing-indicator">Typing...</div>}
            </div>
            <div class="input-container">
              <input
                ref={el => (this.inputRef = el as HTMLInputElement)}
                type="text"
                class="message-input"
                placeholder="Type a message..."
                onKeyPress={event => {
                  if (event.key === 'Enter') this.handleSendMessage();
                }}
              />
              <button class="send-button" onClick={() => this.handleSendMessage()} disabled={!this.socket?.connected}>
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
}
