/**
 * Tool: todoist_search_tasks
 * Searches tasks by text in content or description
 */

import { TodoistClient } from '../api/client.js';
import { searchTasksSchema, SearchTasksInput } from './schemas.js';
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
 * Search tasks by text content
 */
export async function searchTasks(
  client: TodoistClient,
  args: unknown
): Promise<ToolResponse> {
  try {
    // Validate input
    const params = searchTasksSchema.parse(args) as SearchTasksInput;

    // Fetch all tasks
    logger.debug(`Searching tasks for: "${params.query}"`);
    const allTasks = await client.get<TodoistTask[]>('/tasks');

    // Filter tasks by query (case-insensitive)
    const query = params.query.toLowerCase();
    const matchingTasks = allTasks.filter((task) => {
      const contentMatch = task.content.toLowerCase().includes(query);
      const descriptionMatch = task.description.toLowerCase().includes(query);
      return contentMatch || descriptionMatch;
    });

    // Apply limit
    const limitedTasks = matchingTasks.slice(0, params.limit);

    // Format response
    if (limitedTasks.length === 0) {
      return {
        content: [{
          type: 'text',
          text: `No tasks found matching "${params.query}".`
        }],
      };
    }

    const text = formatSearchResults(limitedTasks, matchingTasks.length, params.query);

    return {
      content: [{ type: 'text', text }],
    };
  } catch (error: any) {
    logger.error('Error searching tasks:', error);

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
        text: `Error searching tasks: ${error.message}`,
      }],
      isError: true,
    };
  }
}

/**
 * Format search results for display
 */
function formatSearchResults(tasks: TodoistTask[], total: number, query: string): string {
  const header = total > tasks.length
    ? `Found ${total} task(s) matching "${query}", showing first ${tasks.length}:\n`
    : `Found ${tasks.length} task(s) matching "${query}":\n`;

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
