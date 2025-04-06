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
} from "@/components/ui/select"

function Chat() {
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
      setIsLoading(true);
      setMessages((messages) => messages.concat([message]));
      const response = await window.ConnectionProxy.agent('1', message.content, selectedModel);
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
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <Select value={selectedModel} onValueChange={(val) => setSelectedModel(val)}>
          <SelectTrigger className="w-[240px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openrouter/quasar-alpha">Quasar Alpha</SelectItem>
            <SelectItem value="google/gemini-2.5-pro-exp-03-25:free">Gemini 2.5 Pro Experimental</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ChatSection handler={handler} className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <ChatMessages>
            <ChatMessages.List className="space-y-4" />
            <ChatMessages.Actions />
          </ChatMessages>
        </div>
        <ChatInput className="p-4 border-t"/>
      </ChatSection>
    </div>
  );
}

export { Chat };
