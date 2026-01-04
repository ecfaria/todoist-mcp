/**
 * Tool: todoist_list_projects
 * Lists all projects
 */

import { TodoistClient } from '../api/client.js';
import { listProjectsSchema } from './schemas.js';
import { TodoistProject } from '../types/todoist.js';
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
 * List all projects
 */
export async function listProjects(
  client: TodoistClient,
  args: unknown
): Promise<ToolResponse> {
  try {
    // Validate input (no params needed, but validate structure)
    listProjectsSchema.parse(args);

    // Fetch projects
    logger.debug('Fetching all projects');
    const projects = await client.get<TodoistProject[]>('/projects');

    // Format response
    if (projects.length === 0) {
      return {
        content: [{ type: 'text', text: 'No projects found.' }],
      };
    }

    const text = formatProjectList(projects);

    return {
      content: [{ type: 'text', text }],
    };
  } catch (error: any) {
    logger.error('Error listing projects:', error);

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
        text: `Error listing projects: ${error.message}`,
      }],
      isError: true,
    };
  }
}

/**
 * Format project list for display
 */
function formatProjectList(projects: TodoistProject[]): string {
  const header = `Found ${projects.length} project(s):\n`;

  const projectLines = projects.map((project, index) => {
    const parts = [`${index + 1}. ${project.name}`];

    if (project.is_favorite) {
      parts.push('★');
    }

    if (project.is_inbox_project) {
      parts.push('(Inbox)');
    }

    if (project.is_shared) {
      parts.push('(Shared)');
    }

    parts.push(`[ID: ${project.id}]`);

    return parts.join(' ');
  });

  return header + '\n' + projectLines.join('\n');
}
