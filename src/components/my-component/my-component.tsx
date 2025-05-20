import { Component, Prop, State, h } from '@stencil/core';

@Component({
  tag: 'my-component',
  styleUrl: 'my-component.css',
  shadow: true,
})
export class MyComponent {
  /**
   * The URL of the WebSocket server to connect to.
   */
  @Prop() apiurl: string;

  @State() messages: { text: string; sender: 'user' | 'bot' }[] = [];
  private socket: WebSocket;
  private inputRef: HTMLInputElement;

  constructor() {
    console.log(this.apiurl);
    this.socket = new WebSocket(this.apiurl);

    this.socket.addEventListener('open', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.addEventListener('message', event => {
      this.addMessage(event.data, 'bot');
    });

    this.socket.addEventListener('close', () => {
      console.log('Disconnected from WebSocket server');
    });
  }

  addMessage(text: string, sender: 'user' | 'bot') {
    this.messages = [...this.messages, { text, sender }];
  }

  handleSendMessage() {
    const message = this.inputRef.value;
    if (message) {
      this.addMessage(message, 'user');
      this.socket.send(message);
      this.inputRef.value = '';
    }
  }

  render() {
    return (
      <div class="chat-container">
        <div class="chat-window">
          {this.messages.map(message => (
            <div class={`message ${message.sender}`}>{message.text}</div>
          ))}
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
          <button class="send-button" onClick={() => this.handleSendMessage()}>
            Send
          </button>
        </div>
      </div>
    );
  }
}
