/**
 * Tool: todoist_list_tasks
 * Lists tasks with optional filtering
 */

import { TodoistClient } from '../api/client.js';
import { listTasksSchema, ListTasksInput } from './schemas.js';
import { TodoistTask } from '../types/todoist.js';
import { logger } from '../utils/logger.js';
import { ZodError } from 'zod';

interface ToolResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  isError?: boolean;
}

/**
 * List tasks with optional filtering
 */
export async function listTasks(
  client: TodoistClient,
  args: unknown
): Promise<ToolResponse> {
  try {
    // Validate input
    const params = listTasksSchema.parse(args) as ListTasksInput;

    // Build query parameters
    const queryParams: Record<string, any> = {};
    if (params.project_id) queryParams.project_id = params.project_id;
    if (params.section_id) queryParams.section_id = params.section_id;
    if (params.label) queryParams.label = params.label;
    if (params.filter) queryParams.filter = params.filter;

    // Fetch tasks
    logger.debug('Fetching tasks with params:', queryParams);
    const tasks = await client.get<TodoistTask[]>('/tasks', queryParams);

    // Apply limit
    const limitedTasks = tasks.slice(0, params.limit);

    // Format response
    if (limitedTasks.length === 0) {
      return {
        content: [{ type: 'text', text: 'No tasks found.' }],
      };
    }

    const text = formatTaskList(limitedTasks, tasks.length);

    return {
      content: [{ type: 'text', text }],
    };
  } catch (error: any) {
    logger.error('Error listing tasks:', error);

    if (error instanceof ZodError) {
      const errorMessages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      return {
        content: [{
          type: 'text',
          text: `Validation error: ${errorMessages}`,
        }],
        isError: true,
      };
    }

    return {
      content: [{
        type: 'text',
        text: `Error listing tasks: ${error.message}`,
      }],
      isError: true,
    };
  }
}

/**
 * Format task list for display
 */
function formatTaskList(tasks: TodoistTask[], total: number): string {
  const header = total > tasks.length
    ? `Found ${total} task(s), showing first ${tasks.length}:\n`
    : `Found ${tasks.length} task(s):\n`;

  const taskLines = tasks.map((task, index) => {
    const parts = [`${index + 1}. ${task.content}`];

    if (task.due) {
      parts.push(`(Due: ${task.due.string})`);
    }

    if (task.priority > 1) {
      parts.push(`[P${task.priority}]`);
    }

    if (task.labels.length > 0) {
      parts.push(`[${task.labels.join(', ')}]`);
    }

    parts.push(`[ID: ${task.id}]`);

    return parts.join(' ');
  });

  return header + '\n' + taskLines.join('\n');
}
