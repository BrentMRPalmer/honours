import {
  ChatHandler,
  ChatInput,
  ChatMessages,
  ChatSection,
  Message,
} from '@llamaindex/chat-ui';

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import { useState } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useConnectionViewContext } from './connection-view/connection-view-provider';
import { getBasePrompt } from '@/common/lib/prompt-helpers';

function Chat() {
  const { connection } = useConnectionViewContext();
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedModel, setSelectedModel] = useState('openrouter/quasar-alpha');
  const [customSystemPrompt, setCustomSystemPrompt] = useState("");
  const [tempCustomPrompt, setTempCustomPrompt] = useState(customSystemPrompt);

  const basePrompt = getBasePrompt(connection)

  const handler: ChatHandler = {
    isLoading,
    input,
    setInput,
    messages,
    async append(message) {
      try {
        setIsLoading(true);
        setMessages((messages) => messages.concat([message]));
        console.log(customSystemPrompt)
        const response = await window.ConnectionProxy.agent(
          connection.id,
          message.content,
          selectedModel,
          basePrompt,
          customSystemPrompt
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
      <div className='border-b p-4 flex items-center justify-between'>
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
            <SelectItem value='openai/gpt-4o-mini'>
              GPT-4o mini
            </SelectItem>
            <SelectItem value='anthropic/claude-3.5-haiku'>
              Claude 3.5 Haiku
            </SelectItem>
            <SelectItem value='deepseek/deepseek-chat-v3-0324'>
              DeepSeek V3
            </SelectItem>
            <SelectItem value='mistral/ministral-8b'>
              Ministral-8b
            </SelectItem>
          </SelectContent>
        </Select>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">System Prompt</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Edit System Prompt</DialogTitle>
              <DialogDescription>
                Make changes to your system prompt here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="basePrompt" className="text-right text-lg font-semibold">
                  Base Prompt
                </Label>
                <Textarea id="basePrompt" value={basePrompt} disabled className="col-span-3 max-h-50 overflow-y-auto" />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="custom-prompt" className="text-right text-lg font-semibold">
                  Custom Prompt
                </Label>
                <Textarea 
                  id="custom-prompt"
                  value={tempCustomPrompt}
                  onChange={(e) => setTempCustomPrompt(e.target.value)}
                  className="col-span-3 max-h-50 overflow-y-auto"
                  placeholder="Enter your custom prompt here"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  type="submit"
                  onClick={() => setCustomSystemPrompt(tempCustomPrompt)}
                >
                  Save changes
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <ChatSection
        handler={handler}
        className='flex flex-1 flex-col overflow-hidden'
      >
        <div className='flex-1 overflow-y-auto'>
          <ChatMessages>
            <ChatMessages.List className='space-y-4 overflow-hidden' />
            <ChatMessages.Actions />
          </ChatMessages>
        </div>
        <ChatInput className='border-t p-4' />
      </ChatSection>
    </div>
  );
}

export { Chat };
