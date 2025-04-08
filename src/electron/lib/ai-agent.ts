import { FunctionTool, OpenAI, OpenAIAgent, Settings } from 'llamaindex';
import { markdownTable } from 'markdown-table';

import type { AbstractConnection } from '@/common/lib/abstract-connection';

Settings.callbackManager.on('llm-tool-call', (event) => {
  console.log(event.detail);
});
Settings.callbackManager.on('llm-tool-result', (event) => {
  console.log(event.detail);
});

function createAiAgent(
  connection: AbstractConnection<unknown>,
  selectedModel: string,
  baseSystemPrompt: string,
  customSystemPrompt: string
) {

  // Concatenate the base prompt and the custom system prompt
  const systemPrompt = `${baseSystemPrompt}\n\n${customSystemPrompt}`.trim();
  console.log("System prompt:");
  console.log(systemPrompt);

  // Instantiate the LLM for the agent
  const llm = new OpenAI({
    apiKey: process.env['OPENROUTER_API_KEY'] as string,
    baseURL: 'https://openrouter.ai/api/v1',
    model: selectedModel,
    temperature: 0.0
  });

  async function runQuery({ query }: { query: string }) {
    console.log('Running runQuery tool');
    return await connection
      .query(query)
      .then((result) =>
        markdownTable([result.columns, ...result.rows.map(Object.values)]),
      );
  }

  async function getTables() {
    console.log('Running get tables tool');
    return await connection
      .getTables()
      .then((result) =>
        markdownTable([['table names'], ...result.map((t) => [t])]),
      );
  }

  async function getTableSchema({ table }: { table: string }) {
    console.log('Running get table schema tool');
    return await connection
      .getTableSchema(table)
      .then((result) =>
        markdownTable([result.columns, ...result.rows.map(Object.values)]),
      );
  }

  async function getTableFirst5Rows({ table }: { table: string }) {
    console.log('Running get table five rows tool');
    return await connection
      .getPaginatedTableData(table, 1, 5)
      .then((result) =>
        markdownTable([result.columns, ...result.rows.map(Object.values)]),
      );
  }

  const runQueryTool = FunctionTool.from(runQuery, {
    name: 'runQuery',
    description:
      'Executes a query against the database and returns the result',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The query to execute',
        },
      },
      required: ['query'],
    },
  });

  const getTablesTool = FunctionTool.from(getTables, {
    name: 'getTables',
    description: 'Returns all the tables defined within the database',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  });

  const getTableSchemaTool = FunctionTool.from(getTableSchema, {
    name: 'getTableSchema',
    description: 'Returns the schema of the given table',
    parameters: {
      type: 'object',
      properties: {
        table: {
          type: 'string',
          description: 'Table to retrieve schema for',
        },
      },
      required: ['table'],
    },
  });

  const getTableFirst5RowsTool = FunctionTool.from(getTableFirst5Rows, {
    name: 'getTableFirst5Rows',
    description: 'Returns the first 5 rows of the given table',
    parameters: {
      type: 'object',
      properties: {
        table: {
          type: 'string',
          description: 'Table to retrieve the first 5 rows from',
        },
      },
      required: ['table'],
    },
  });

  const tools = [
    runQueryTool,
    getTablesTool,
    getTableSchemaTool,
    getTableFirst5RowsTool,
  ];

  return new OpenAIAgent({ llm, systemPrompt, tools });
}

export { createAiAgent };
