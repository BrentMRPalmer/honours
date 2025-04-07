import {
  ChatHandler,
  ChatInput,
  ChatMessages,
  ChatSection,
  Message,
} from '@llamaindex/chat-ui';

import { useState } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useConnectionViewContext } from './connection-view/connection-view-provider';

function Chat() {
  const { connection } = useConnectionViewContext();
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedModel, setSelectedModel] = useState('openrouter/quasar-alpha');

  const handler: ChatHandler = {
    isLoading,
    input,
    setInput,
    messages,
    async append(message) {
      try {
        setIsLoading(true);
        setMessages((messages) => messages.concat([message]));
        const response = await window.ConnectionProxy.agent(
          connection.id,
          message.content,
          selectedModel,
        );
        setMessages((messages) =>
          messages.concat([
            { content: response, role: 'assistant', annotations: '' },
          ]),
        );
        return Promise.resolve('');
      } catch (error) {
        console.error('Error in chat agent:', error);
        setMessages((messages) =>
          messages.concat([
            { 
              content: `Error: ${error.message || 'Failed to get response from agent'}`, 
              role: 'assistant', 
              annotations: '' 
            },
          ]),
        );
        return Promise.resolve('');
      } finally {
        setIsLoading(false);
      }
    },
  };

  return (
    <div className='flex h-full flex-col'>
      <div className='border-b p-4'>
        <Select
          value={selectedModel}
          onValueChange={(val) => setSelectedModel(val)}
        >
          <SelectTrigger className='w-[240px]'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='openrouter/quasar-alpha'>
              Quasar Alpha
            </SelectItem>
            <SelectItem value='google/gemini-2.5-pro-exp-03-25:free'>
              Gemini 2.5 Pro Experimental
            </SelectItem>
            <SelectItem value='rekaai/reka-flash-3:free'>reka</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ChatSection
        handler={handler}
        className='flex flex-1 flex-col overflow-hidden'
      >
        <div className='flex-1 overflow-y-auto'>
          <ChatMessages>
            <ChatMessages.List className='space-y-4' />
            <ChatMessages.Actions />
          </ChatMessages>
        </div>
        <ChatInput className='border-t p-4' />
      </ChatSection>
    </div>
  );
}

export { Chat };
