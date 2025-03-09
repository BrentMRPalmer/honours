import {
  ChatHandler,
  ChatInput,
  ChatMessages,
  ChatSection,
  Message,
} from '@llamaindex/chat-ui';
import { useState } from 'react';

function Chat() {
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  const handler: ChatHandler = {
    isLoading,
    input,
    setInput,
    messages,
    async append(message) {
      setIsLoading(true);
      setMessages((messages) => messages.concat([message]));
      const response = await window.ConnectionProxy.agent('1', message.content);
      setMessages((messages) =>
        messages.concat([
          { content: response, role: 'assistant', annotations: '' },
        ]),
      );
      setIsLoading(false);
      return Promise.resolve('');
    },
  };

  return (
    <ChatSection handler={handler}>
      <ChatMessages>
        <ChatMessages.List className='h-auto max-h-[400px]' />
        <ChatMessages.Actions />
      </ChatMessages>
      <ChatInput />
    </ChatSection>
  );
}

export { Chat };
