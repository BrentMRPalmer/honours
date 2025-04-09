import { FunctionTool, OpenAI, OpenAIAgent, Settings } from 'llamaindex';
import { markdownTable } from 'markdown-table';

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
) {
  // Instantiate the LLM for the agent
  const llm = new OpenAI({
    apiKey: process.env['OPENROUTER_API_KEY'] as string,
    baseURL: 'https://openrouter.ai/api/v1',
    model: selectedModel,
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
      'Executes a sql query against the database and returns the result',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The SQL query to execute',
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

  const systemPrompt = `
    You are an SQL expert who answers questions using data from your database. When querying the database
    make sure to understand the tables within the database first by viewing the structure of the first 5 
    columns, along with checking the table schemas within the database. Make sure the casing of your strings
    match the same casing within the database.

    Use the following data for how grading works to determine averages. Letter grades with empty numeric 
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
  `.trim();

  return new OpenAIAgent({ llm, systemPrompt, tools });
}

export { createSqlAgent };
