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
import { getBasePrompt } from '@/common/lib/prompt-helpers';

function Chat() {
  const { connection } = useConnectionViewContext();
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedModel, setSelectedModel] = useState('openrouter/quasar-alpha');
  const [customSystemPrompt, setCustomSystemPrompt] = useState(
    `Use the following data for how grading works to determine averages. Letter grades with empty numeric 
    column does not contribute to GPA:

    | Letter Grade | Numeric Value |
    | ------------ | ------------- |
    | A+           | 10            |
    | A            | 9             |
    | A-           | 8             |
    | B+           | 7             |
    | B            | 6             |
    | C+           | 5             |
    | C            | 4             |
    | D+           | 3             |
    | D            | 2             |
    | E            | 1             |
    | F            | 0             |
    | ABS          | 0             |
    | EIN          | 0             |
    | CR           |               |
    | NC           |               |
    | P            |               |
    | S            |               |
    | NS           |               |

    The following python code is used to generate the term id:

    \`\`\`python
    def term_id(year, season):
      season_id = {"winter": 0, "summer": 1, "fall": 2}
      return (year * 10) + season_id

    term_id(2022, "winter")   # 20220
    term_id(2017, "fall")     # 20172
    term_id(2019, "summer")   # 20191
    \`\`\`

    The following python code is used to get what year the course is for:

    \`\`\`python
    def course_year(course):
      return course['code'].replace(course['subject_code'], '')[0]

    course_year({"code": "CSI2101", "subject_code": "CSI"})   # 2
    course_year({"code": "PSY1101", "subject_code": "PSY"})   # 1
    course_year({"code": "MAT4130", "subject_code": "MAT"})   # 4
    course_year({"code": "ECO3020", "subject_code": "ECO"})   # 3
    \`\`\`
  `.trim()
  );

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
