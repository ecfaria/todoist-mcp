/**
 * Tool: todoist_get_task
 * Gets detailed information about a specific task
 */

import { TodoistClient } from '../api/client.js';
import { getTaskSchema, GetTaskInput } from './schemas.js';
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
 * Get detailed information about a specific task
 */
export async function getTask(
  client: TodoistClient,
  args: unknown
): Promise<ToolResponse> {
  try {
    // Validate input
    const params = getTaskSchema.parse(args) as GetTaskInput;

    // Fetch task
    logger.debug(`Fetching task ${params.task_id}`);
    const task = await client.get<TodoistTask>(`/tasks/${params.task_id}`);

    // Format detailed response
    const text = formatTaskDetails(task);

    return {
      content: [{ type: 'text', text }],
    };
  } catch (error: any) {
    logger.error('Error getting task:', error);

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
        text: `Error getting task: ${error.message}`,
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
    'Task Details:',
    '─────────────',
    `ID: ${task.id}`,
    `Content: ${task.content}`,
    `Completed: ${task.is_completed ? 'Yes' : 'No'}`,
  ];

  if (task.description) {
    parts.push('');
    parts.push('Description:');
    parts.push(task.description);
  }

  parts.push('');

  if (task.due) {
    parts.push(`Due: ${task.due.string} (${task.due.date})`);
    if (task.due.is_recurring) {
      parts.push('Recurring: Yes');
    }
  } else {
    parts.push('Due: Not set');
  }

  const priorityNames = ['', 'Normal', 'Medium', 'High', 'Urgent'];
  parts.push(`Priority: ${priorityNames[task.priority]}`);

  if (task.labels.length > 0) {
    parts.push(`Labels: ${task.labels.join(', ')}`);
  }

  parts.push('');
  parts.push(`Project ID: ${task.project_id}`);

  if (task.section_id) {
    parts.push(`Section ID: ${task.section_id}`);
  }

  if (task.parent_id) {
    parts.push(`Parent Task ID: ${task.parent_id}`);
  }

  parts.push('');
  parts.push(`Created: ${task.created_at}`);
  parts.push(`Comments: ${task.comment_count}`);
  parts.push('');
  parts.push(`View in Todoist: ${task.url}`);

  return parts.join('\n');
}
