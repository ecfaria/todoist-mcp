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

    // Handle parent task lookup
    let parentId = params.parent_id;

    if (params.parent_task_name) {
      // Search for parent task by name
      logger.debug(`Searching for parent task: "${params.parent_task_name}"`);

      const allTasks = await client.get<TodoistTask[]>('/tasks');
      const query = params.parent_task_name.toLowerCase();

      const matches = allTasks.filter((task) =>
        task.content.toLowerCase().includes(query)
      );

      if (matches.length === 0) {
        return {
          content: [{
            type: 'text',
            text: `No parent task found matching "${params.parent_task_name}". Please check the task name or use a task ID instead.`,
          }],
          isError: true,
        };
      }

      if (matches.length > 1) {
        // Multiple matches - ask user to clarify
        const matchList = matches
          .slice(0, 5) // Show max 5 matches
          .map((t, i) => `${i + 1}. "${t.content}" [ID: ${t.id}]`)
          .join('\n');

        const moreText = matches.length > 5 ? `\n\n...and ${matches.length - 5} more` : '';

        return {
          content: [{
            type: 'text',
            text: `Found ${matches.length} tasks matching "${params.parent_task_name}":\n\n${matchList}${moreText}\n\nPlease be more specific or use the task ID instead.`,
          }],
          isError: true,
        };
      }

      // Exact one match - use it
      parentId = matches[0].id;
      logger.debug(`Found parent task: ${matches[0].content} (${parentId})`);
    }

    if (parentId) {
      taskParams.parent_id = parentId;
    }

    // Create task via API
    logger.debug('Creating task with params:', taskParams);
    const task = await client.post<TodoistTask>('/tasks', taskParams);

    // Format success response
    let text = formatTaskDetails(task);

    // Add note if this is a subtask
    if (task.parent_id) {
      text += `\n\nℹ️  This is a subtask (parent: ${task.parent_id})`;
    }

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
