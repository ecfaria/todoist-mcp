/**
 * Zod schemas for tool input validation
 */

import { z } from 'zod';

/**
 * Priority validation (1-4)
 */
export const prioritySchema = z.number().int().min(1).max(4).optional();

/**
 * Task ID validation
 */
export const taskIdSchema = z.string().min(1, 'Task ID is required');

/**
 * Schema for creating a task
 */
export const createTaskSchema = z.object({
  content: z.string().min(1, 'Task content is required').describe('The task content/title'),
  description: z.string().optional().describe('Optional task description'),
  project_id: z.string().optional().describe('Optional project ID to add the task to'),
  section_id: z.string().optional().describe('Optional section ID within the project'),
  due_date: z.string().optional().describe('Due date in natural language or YYYY-MM-DD format'),
  priority: prioritySchema.describe('Priority level: 1 (normal), 2 (medium), 3 (high), 4 (urgent)'),
  labels: z.array(z.string()).optional().describe('Array of label names'),
  parent_id: z.string().optional().describe('Parent task ID for creating a subtask'),
  parent_task_name: z.string().optional().describe('Parent task name to search for (alternative to parent_id)'),
}).refine(
  (data) => {
    // Can't specify both parent_id and parent_task_name
    if (data.parent_id && data.parent_task_name) {
      return false;
    }
    return true;
  },
  {
    message: 'Cannot specify both parent_id and parent_task_name. Use one or the other.',
  }
);

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

/**
 * Schema for listing tasks
 */
export const listTasksSchema = z.object({
  project_id: z.string().optional().describe('Filter by project ID'),
  section_id: z.string().optional().describe('Filter by section ID'),
  label: z.string().optional().describe('Filter by label name'),
  filter: z.string().optional().describe('Todoist filter query (e.g., "today", "overdue")'),
  limit: z.number().int().positive().max(200).default(50).describe('Maximum number of tasks to return'),
});

export type ListTasksInput = z.infer<typeof listTasksSchema>;

/**
 * Schema for getting a single task
 */
export const getTaskSchema = z.object({
  task_id: taskIdSchema.describe('The task ID to retrieve'),
});

export type GetTaskInput = z.infer<typeof getTaskSchema>;

/**
 * Schema for updating a task
 */
export const updateTaskSchema = z.object({
  task_id: taskIdSchema.describe('The task ID to update'),
  content: z.string().optional().describe('New task content'),
  description: z.string().optional().describe('New task description'),
  due_date: z.string().optional().describe('New due date in natural language or YYYY-MM-DD'),
  priority: prioritySchema.describe('New priority level (1-4)'),
  labels: z.array(z.string()).optional().describe('New labels array'),
});

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

/**
 * Schema for completing a task
 */
export const completeTaskSchema = z.object({
  task_id: taskIdSchema.describe('The task ID to complete'),
});

export type CompleteTaskInput = z.infer<typeof completeTaskSchema>;

/**
 * Schema for listing projects (no parameters)
 */
export const listProjectsSchema = z.object({});

export type ListProjectsInput = z.infer<typeof listProjectsSchema>;

/**
 * Schema for searching tasks
 */
export const searchTasksSchema = z.object({
  query: z.string().min(1, 'Search query is required').describe('Text to search for in task content and description'),
  limit: z.number().int().positive().max(200).default(50).describe('Maximum number of tasks to return'),
});

export type SearchTasksInput = z.infer<typeof searchTasksSchema>;
