import { FunctionTool, OpenAI, OpenAIAgent, Settings } from 'llamaindex';
import { markdownTable } from 'markdown-table';
import { ConnectionDriver } from '@/common/types';

import type { AbstractConnection } from '@/common/lib/abstract-connection';

Settings.callbackManager.on('llm-tool-call', (event) => {
  console.log(event.detail);
});
Settings.callbackManager.on('llm-tool-result', (event) => {
  console.log(event.detail);
});

function createSqlAgent(
  connection: AbstractConnection<unknown>,
  selectedModel: string,
  customSystemPrompt: string
) {
  // Get the current connection driver name
  const connectionType: ConnectionDriver = connection.connectionDriver;

  // Use a record to establish which base system prompt should
  // be used depending on the current database type
  const dbPrompt: Record<ConnectionDriver, string> = {
    sqlite: `You are an SQL expert who answers questions using data from your database. When querying the database
    make sure to understand the tables within the database first by viewing the structure of the first 5 
    columns, along with checking the table schemas within the database. Make sure the casing of your strings
    match the same casing within the database.`,
    postgresql: 'not supported',
    mysql: 'not supported',
    maria: 'not supported',
    mongo: `You are a MongoDB expert who answers questions using data from your database. Each collection in the database is stored as its own table. When querying the database, make sure to understand the tables within the database first by viewing the structure of the first 5 columns, along with checking the table schemas. Make sure the casing of your strings match the same casing within the database. Although the function names may appear SQL-centric (for example, runQuery, getTables, getTableSchema, etc.), their functionality is specifically mapped for MongoDB operations. Here’s how to interpret and use them:
            - runQuery:
              This function is used to execute a MongoDB query using Mongo shell syntax (for example, db.collection.find(), db.collection.insertOne(), db.collection.updateOne(), etc.). Even if "runQuery" sounds like it would execute an SQL query, in this context it sends a MongoDB command to the appropriate collection in the database.
            - getTables:
              Although this function’s name implies it retrieves SQL tables, in our MongoDB implementation it returns a tabular representation of the documents in the specified collection. The table is dynamically generated so that its columns correspond to the keys present in the documents, and each row represents the values of a single document. This mapping allows you to view MongoDB data in a structured, table-like format despite its document-based nature.
            - Other Functions (e.g., getTableSchema, getTableFirst5Rows):
              These functions are similarly repurposed or mapped for MongoDB. Their SQL-sounding names are used for consistency within the codebase, but under the hood, they perform MongoDB-specific operations. For example, getTableSchema might provide information about the fields and overall structure of the data stored in the collection, while getTableFirst5Rows might retrieve a sample of documents for quick review.
            Always use MongoDB shell syntax when constructing queries for runQuery, and remember that even though the function names and some parameters might appear to be intended for SQL databases, they have been adapted to work with MongoDB. This mapping ensures that you receive results formatted to resemble SQL outputs while performing MongoDB operations.
            
            Please double check the datatype stored of a column. For example, a number might actually be stored as a string. If the number query doesn't work, try the string instead.
            `,
    redis: `You are a Redis expert who answers questions using data from your database. All of the data is stored in one table called "global." Although the function names may appear SQL-centric (for example, runQuery, getTables, getTableSchema, etc.), their functionality is specifically mapped for Redis operations. Here’s how to interpret and use them:
            - runQuery:
              This function is used to execute a Redis query using redis-cli syntax (e.g., GET, SET, HGET, etc.). Even if "runQuery" sounds like it would execute an SQL query, in this context it sends a redis-cli command to the database.
            - getTables:
              While this function’s name implies it retrieves SQL tables, in our Redis implementation it returns the keys and their corresponding values formatted as a two-column table. The first column represents the key names, and the second column shows the associated values. This mapping allows you to work with Redis data in a tabular format without actual SQL tables.
            - Other Functions (e.g., getTableSchema, getTableFirst5Rows):
              These functions are similarly repurposed or mapped for Redis. Their SQL-sounding names are used for consistency in the codebase, but under the hood, they perform Redis-specific operations.

            Always use redis-cli syntax when constructing queries for runQuery, and remember that even though the function names and some parameters might look like they are intended for SQL databases, they have been adapted to work with Redis. This mapping ensures that you get results formatted to resemble SQL outputs while performing Redis operations.
            `
  };

  // Extract the corresponding base system prompt from the record
  const basePrompt = dbPrompt[connectionType];

  // Concatenate the base prompt and the custom system prompt
  const systemPrompt = `${basePrompt}\n\n${customSystemPrompt}`.trim();
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
      .query(`SELECT * FROM ${table} LIMIT 5;`)
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

export { createSqlAgent };
