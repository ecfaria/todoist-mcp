/**
 * Tool: todoist_update_task
 * Updates an existing task
 */

import { TodoistClient } from '../api/client.js';
import { updateTaskSchema, UpdateTaskInput } from './schemas.js';
import { TodoistTask, UpdateTaskParams } from '../types/todoist.js';
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
 * Update an existing task
 */
export async function updateTask(
  client: TodoistClient,
  args: unknown
): Promise<ToolResponse> {
  try {
    // Validate input
    const params = updateTaskSchema.parse(args) as UpdateTaskInput;

    // Build update payload with only provided fields
    const updateData: UpdateTaskParams = {};

    if (params.content !== undefined) {
      updateData.content = params.content;
    }

    if (params.description !== undefined) {
      updateData.description = params.description;
    }

    if (params.priority !== undefined) {
      updateData.priority = params.priority as 1 | 2 | 3 | 4;
    }

    if (params.labels !== undefined) {
      updateData.labels = params.labels;
    }

    // Handle due date - send as due_string
    if (params.due_date !== undefined) {
      updateData.due_string = params.due_date;
    }

    // Update task via API
    logger.debug(`Updating task ${params.task_id} with:`, updateData);
    const task = await client.post<TodoistTask>(
      `/tasks/${params.task_id}`,
      updateData
    );

    // Format response
    const text = `✓ Task updated successfully!\n\n${formatTaskSummary(task)}`;

    return {
      content: [{ type: 'text', text }],
    };
  } catch (error: any) {
    logger.error('Error updating task:', error);

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
        text: `Error updating task: ${error.message}`,
      }],
      isError: true,
    };
  }
}

/**
 * Format task summary
 */
function formatTaskSummary(task: TodoistTask): string {
  const parts = [
    `ID: ${task.id}`,
    `Content: ${task.content}`,
  ];

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
