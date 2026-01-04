#!/usr/bin/env node

/**
 * Todoist MCP Server
 * Model Context Protocol server for Todoist task management
 */

import { config } from 'dotenv';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  CallToolResult,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { TodoistClient } from './api/client.js';
import { logger } from './utils/logger.js';

// Tool imports
import { createTask } from './tools/create-task.js';
import { listTasks } from './tools/list-tasks.js';
import { getTask } from './tools/get-task.js';
import { updateTask } from './tools/update-task.js';
import { completeTask } from './tools/complete-task.js';
import { listProjects } from './tools/list-projects.js';
import { searchTasks } from './tools/search-tasks.js';

// Load environment variables
config();

/**
 * Main server initialization
 */
async function main() {
  // Validate API token
  const apiToken = process.env.TODOIST_API_TOKEN;
  if (!apiToken) {
    logger.error('TODOIST_API_TOKEN environment variable is required');
    logger.error('Get your API token from: https://todoist.com/app/settings/integrations/developer');
    process.exit(1);
  }

  // Initialize Todoist client
  const client = new TodoistClient(apiToken);
  logger.debug('Todoist client initialized');

  // Create MCP server
  const server = new Server(
    {
      name: 'todoist-mcp-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  /**
   * Handler for listing available tools
   */
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'todoist_create_task',
          description: 'Create a new task in Todoist with optional project, due date, priority, labels, and parent task for subtasks',
          inputSchema: {
            type: 'object',
            properties: {
              content: {
                type: 'string',
                description: 'The task content/title',
              },
              description: {
                type: 'string',
                description: 'Optional task description',
              },
              project_id: {
                type: 'string',
                description: 'Optional project ID to add the task to',
              },
              section_id: {
                type: 'string',
                description: 'Optional section ID within the project',
              },
              due_date: {
                type: 'string',
                description: 'Due date in natural language (e.g., "tomorrow", "next Monday") or YYYY-MM-DD format',
              },
              priority: {
                type: 'number',
                description: 'Priority level: 1 (normal), 2 (medium), 3 (high), 4 (urgent)',
                enum: [1, 2, 3, 4],
              },
              labels: {
                type: 'array',
                items: { type: 'string' },
                description: 'Array of label names',
              },
              parent_id: {
                type: 'string',
                description: 'Parent task ID to create this as a subtask',
              },
              parent_task_name: {
                type: 'string',
                description: 'Parent task name to search for (alternative to parent_id). The tool will search for tasks matching this name.',
              },
            },
            required: ['content'],
          },
        },
        {
          name: 'todoist_list_tasks',
          description: 'List active tasks with optional filters for project, section, label, or custom Todoist filter',
          inputSchema: {
            type: 'object',
            properties: {
              project_id: {
                type: 'string',
                description: 'Filter by project ID',
              },
              section_id: {
                type: 'string',
                description: 'Filter by section ID',
              },
              label: {
                type: 'string',
                description: 'Filter by label name',
              },
              filter: {
                type: 'string',
                description: 'Todoist filter query (e.g., "today", "overdue", "p1")',
              },
              limit: {
                type: 'number',
                description: 'Maximum number of tasks to return (default: 50, max: 200)',
                default: 50,
              },
            },
          },
        },
        {
          name: 'todoist_get_task',
          description: 'Get detailed information about a specific task including all metadata',
          inputSchema: {
            type: 'object',
            properties: {
              task_id: {
                type: 'string',
                description: 'The task ID to retrieve',
              },
            },
            required: ['task_id'],
          },
        },
        {
          name: 'todoist_update_task',
          description: 'Update an existing task with new content, description, due date, priority, or labels',
          inputSchema: {
            type: 'object',
            properties: {
              task_id: {
                type: 'string',
                description: 'The task ID to update',
              },
              content: {
                type: 'string',
                description: 'New task content',
              },
              description: {
                type: 'string',
                description: 'New task description',
              },
              due_date: {
                type: 'string',
                description: 'New due date (natural language or YYYY-MM-DD)',
              },
              priority: {
                type: 'number',
                description: 'New priority level (1-4)',
                enum: [1, 2, 3, 4],
              },
              labels: {
                type: 'array',
                items: { type: 'string' },
                description: 'New labels array',
              },
            },
            required: ['task_id'],
          },
        },
        {
          name: 'todoist_complete_task',
          description: 'Mark a task as completed',
          inputSchema: {
            type: 'object',
            properties: {
              task_id: {
                type: 'string',
                description: 'The task ID to complete',
              },
            },
            required: ['task_id'],
          },
        },
        {
          name: 'todoist_list_projects',
          description: 'List all projects in Todoist, including inbox and shared projects',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'todoist_search_tasks',
          description: 'Search for tasks by text in their content or description',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Text to search for in task content and description',
              },
              limit: {
                type: 'number',
                description: 'Maximum number of tasks to return (default: 50, max: 200)',
                default: 50,
              },
            },
            required: ['query'],
          },
        },
      ],
    };
  });

  /**
   * Handler for tool execution
   */
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    logger.debug(`Tool called: ${name}`);

    try {
      let result;

      switch (name) {
        case 'todoist_create_task':
          result = await createTask(client, args);
          break;

        case 'todoist_list_tasks':
          result = await listTasks(client, args);
          break;

        case 'todoist_get_task':
          result = await getTask(client, args);
          break;

        case 'todoist_update_task':
          result = await updateTask(client, args);
          break;

        case 'todoist_complete_task':
          result = await completeTask(client, args);
          break;

        case 'todoist_list_projects':
          result = await listProjects(client, args);
          break;

        case 'todoist_search_tasks':
          result = await searchTasks(client, args);
          break;

        default:
          result = {
            content: [{
              type: 'text' as const,
              text: `Unknown tool: ${name}`,
            }],
            isError: true,
          };
      }

      return result as CallToolResult;
    } catch (error: any) {
      logger.error(`Error executing tool ${name}:`, error);
      return {
        content: [{
          type: 'text' as const,
          text: `Error: ${error.message}`,
        }],
        isError: true,
      } as CallToolResult;
    }
  });

  // Connect to stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  logger.error('Todoist MCP server started successfully');
}

// Start server
main().catch((error) => {
  logger.error('Fatal error starting server:', error);
  process.exit(1);
});
