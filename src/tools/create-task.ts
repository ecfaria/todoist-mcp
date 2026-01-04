/**
 * Tool: todoist_create_task
 * Creates a new task in Todoist
 */

import { TodoistClient } from '../api/client.js';
import { createTaskSchema, CreateTaskInput } from './schemas.js';
import { TodoistTask, CreateTaskParams } from '../types/todoist.js';
import { logger } from '../utils/logger.js';
import { ZodError } from 'zod';

/**
 * Tool response content type
 */
interface ToolResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  isError?: boolean;
}

/**
 * Create a new task in Todoist
 */
export async function createTask(
  client: TodoistClient,
  args: unknown
): Promise<ToolResponse> {
  try {
    // Validate input
    const params = createTaskSchema.parse(args) as CreateTaskInput;

    // Build API request parameters
    const taskParams: CreateTaskParams = {
      content: params.content,
    };

    if (params.description) {
      taskParams.description = params.description;
    }

    if (params.project_id) {
      taskParams.project_id = params.project_id;
    }

    if (params.section_id) {
      taskParams.section_id = params.section_id;
    }

    if (params.priority !== undefined) {
      taskParams.priority = params.priority as 1 | 2 | 3 | 4;
    }

    if (params.labels) {
      taskParams.labels = params.labels;
    }

    // Handle due date - send as due_string to leverage Todoist's natural language parsing
    if (params.due_date) {
      taskParams.due_string = params.due_date;
    }

    // Create task via API
    logger.debug('Creating task with params:', taskParams);
    const task = await client.post<TodoistTask>('/tasks', taskParams);

    // Format success response
    const text = formatTaskDetails(task);

    return {
      content: [{ type: 'text', text }],
    };
  } catch (error: any) {
    logger.error('Error creating task:', error);

    // Handle validation errors
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

    // Handle all other errors
    return {
      content: [{
        type: 'text',
        text: `Error creating task: ${error.message}`,
      }],
      isError: true,
    };
  }
}

/**
 * Format task details for display
 */
function formatTaskDetails(task: TodoistTask): string {
  const parts = [
    '✓ Task created successfully!',
    '',
    `ID: ${task.id}`,
    `Content: ${task.content}`,
  ];

  if (task.description) {
    parts.push(`Description: ${task.description}`);
  }

  if (task.due) {
    parts.push(`Due: ${task.due.string}`);
  }

  if (task.priority > 1) {
    const priorityNames = ['', 'Normal', 'Medium', 'High', 'Urgent'];
    parts.push(`Priority: ${priorityNames[task.priority]}`);
  }

  if (task.labels.length > 0) {
    parts.push(`Labels: ${task.labels.join(', ')}`);
  }

  parts.push('');
  parts.push(`View in Todoist: ${task.url}`);

  return parts.join('\n');
}
