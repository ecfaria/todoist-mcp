/**
 * Todoist API v2 type definitions
 */

/**
 * Due date object for tasks
 */
export interface TodoistDue {
  /** Due date in YYYY-MM-DD format */
  date: string;
  /** Human-readable due date string */
  string: string;
  /** Whether the due date is recurring */
  is_recurring: boolean;
  /** Due datetime in RFC3339 format (optional) */
  datetime?: string;
  /** IANA timezone for the due datetime (optional) */
  timezone?: string;
}

/**
 * Task object from Todoist API
 */
export interface TodoistTask {
  /** Unique task ID */
  id: string;
  /** Project ID this task belongs to */
  project_id: string;
  /** Section ID within the project (optional) */
  section_id: string | null;
  /** Task content/title */
  content: string;
  /** Task description in markdown */
  description: string;
  /** Whether the task is completed */
  is_completed: boolean;
  /** Array of label names */
  labels: string[];
  /** Parent task ID for subtasks (optional) */
  parent_id: string | null;
  /** Task order */
  order: number;
  /** Priority: 1 (normal), 2 (medium), 3 (high), 4 (urgent) */
  priority: 1 | 2 | 3 | 4;
  /** Due date information (optional) */
  due: TodoistDue | null;
  /** URL to view the task in Todoist */
  url: string;
  /** Number of comments on the task */
  comment_count: number;
  /** Task creation timestamp in RFC3339 format */
  created_at: string;
  /** User ID of the task creator */
  creator_id: string;
  /** Assignee user ID (optional) */
  assignee_id: string | null;
  /** Assigner user ID (optional) */
  assigner_id: string | null;
}

/**
 * Project object from Todoist API
 */
export interface TodoistProject {
  /** Unique project ID */
  id: string;
  /** Project name */
  name: string;
  /** Color code for the project */
  color: string;
  /** Parent project ID (optional, for nested projects) */
  parent_id: string | null;
  /** Project order */
  order: number;
  /** Number of comments on the project */
  comment_count: number;
  /** Whether the project is shared */
  is_shared: boolean;
  /** Whether the project is favorited */
  is_favorite: boolean;
  /** Whether this is the inbox project */
  is_inbox_project: boolean;
  /** Whether this is a team inbox project */
  is_team_inbox: boolean;
  /** View style: 'list' or 'board' */
  view_style: 'list' | 'board';
  /** URL to view the project in Todoist */
  url: string;
}

/**
 * Section object from Todoist API
 */
export interface TodoistSection {
  /** Unique section ID */
  id: string;
  /** Project ID this section belongs to */
  project_id: string;
  /** Section order within the project */
  order: number;
  /** Section name */
  name: string;
}

/**
 * Parameters for creating a task
 */
export interface CreateTaskParams {
  /** Task content/title (required) */
  content: string;
  /** Task description */
  description?: string;
  /** Project ID to add the task to */
  project_id?: string;
  /** Section ID within the project */
  section_id?: string;
  /** Parent task ID for creating a subtask */
  parent_id?: string;
  /** Task order */
  order?: number;
  /** Array of label names */
  labels?: string[];
  /** Priority level: 1-4 */
  priority?: 1 | 2 | 3 | 4;
  /** Natural language due date (e.g., "tomorrow", "next Monday") */
  due_string?: string;
  /** Due date in YYYY-MM-DD format */
  due_date?: string;
  /** Due datetime in RFC3339 format */
  due_datetime?: string;
  /** Assignee user ID */
  assignee_id?: string;
}

/**
 * Parameters for updating a task
 */
export interface UpdateTaskParams {
  /** New task content */
  content?: string;
  /** New task description */
  description?: string;
  /** New array of label names */
  labels?: string[];
  /** New priority level: 1-4 */
  priority?: 1 | 2 | 3 | 4;
  /** New natural language due date */
  due_string?: string;
  /** New due date in YYYY-MM-DD format */
  due_date?: string;
  /** New due datetime in RFC3339 format */
  due_datetime?: string;
}

/**
 * Parameters for listing tasks
 */
export interface ListTasksParams {
  /** Filter by project ID */
  project_id?: string;
  /** Filter by section ID */
  section_id?: string;
  /** Filter by label name */
  label?: string;
  /** Todoist filter query */
  filter?: string;
  /** Language for due date strings */
  lang?: string;
  /** Specific task IDs to retrieve */
  ids?: string[];
}
