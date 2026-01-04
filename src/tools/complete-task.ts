/**
 * Tool: todoist_complete_task
 * Marks a task as completed
 */

import { TodoistClient } from '../api/client.js';
import { completeTaskSchema, CompleteTaskInput } from './schemas.js';
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
 * Mark a task as completed
 */
export async function completeTask(
  client: TodoistClient,
  args: unknown
): Promise<ToolResponse> {
  try {
    // Validate input
    const params = completeTaskSchema.parse(args) as CompleteTaskInput;

    // Complete task via API
    logger.debug(`Completing task ${params.task_id}`);
    await client.post(`/tasks/${params.task_id}/close`, {});

    return {
      content: [{
        type: 'text',
        text: `✓ Task ${params.task_id} marked as completed!`,
      }],
    };
  } catch (error: any) {
    logger.error('Error completing task:', error);

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
        text: `Error completing task: ${error.message}`,
      }],
      isError: true,
    };
  }
}
