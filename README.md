# Todoist MCP Server

A Model Context Protocol (MCP) server for Todoist task management, enabling Claude to interact with your Todoist tasks and projects.

## Features

- ✅ Create, read, update, and complete tasks
- 📋 List tasks with advanced filtering
- 🔍 Search tasks by text content
- 📁 Manage projects
- 🏷️ Support for labels and priorities
- 📅 Natural language date parsing
- ⚡ Rate limiting to stay within API limits
- 🛡️ Comprehensive error handling

## Installation

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- A Todoist account with an API token

### From Source

```bash
# Clone the repository
git clone <your-repo-url>
cd todoist-mcp

# Install dependencies
npm install

# Build the project
npm run build
```

## Configuration

### 1. Get Your Todoist API Token

1. Go to [Todoist Integrations Settings](https://todoist.com/app/settings/integrations/developer)
2. Scroll down to "API token" section
3. Copy your personal API token

### 2. Set Up Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your Todoist API token:

```bash
TODOIST_API_TOKEN=your_actual_token_here
LOG_LEVEL=error
```

### 3. Configure Claude Desktop

Add the server to your Claude Desktop configuration file:

**Location:**

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

**Configuration:**

```json
{
  "mcpServers": {
    "todoist": {
      "command": "node",
      "args": ["/absolute/path/to/todoist-mcp/build/server.js"],
      "env": {
        "TODOIST_API_TOKEN": "your_actual_token_here"
      }
    }
  }
}
```

**Important:** Replace `/absolute/path/to/todoist-mcp` with the actual absolute path to your project directory.

### 4. Restart Claude Desktop

After updating the configuration, restart Claude Desktop for the changes to take effect.

## Available Tools

### todoist_create_task

Create a new task in Todoist with optional project, due date, priority, and labels.

**Parameters:**

- `content` (required): The task content/title
- `description` (optional): Task description
- `project_id` (optional): Project ID to add the task to
- `section_id` (optional): Section ID within the project
- `due_date` (optional): Due date in natural language or YYYY-MM-DD format
- `priority` (optional): Priority level: 1 (normal), 2 (medium), 3 (high), 4 (urgent)
- `labels` (optional): Array of label names

**Examples:**

```
Create a task "Write report" due tomorrow with high priority
Create a task "Buy groceries" in the Shopping project
Create a task "Team meeting" due "next Monday at 2pm"
```

### todoist_list_tasks

List active tasks with optional filters for project, section, label, or custom Todoist filter.

**Parameters:**

- `project_id` (optional): Filter by project ID
- `section_id` (optional): Filter by section ID
- `label` (optional): Filter by label name
- `filter` (optional): Todoist filter query (e.g., "today", "overdue", "p1")
- `limit` (optional): Maximum number of tasks to return (default: 50, max: 200)

**Examples:**

```
List all my tasks
List tasks in project "Work"
List tasks due today
List all overdue tasks with limit 20
```

### todoist_get_task

Get detailed information about a specific task including all metadata.

**Parameters:**

- `task_id` (required): The task ID to retrieve

**Examples:**

```
Get details for task 123456789
Show me task 987654321
```

### todoist_update_task

Update an existing task with new content, description, due date, priority, or labels.

**Parameters:**

- `task_id` (required): The task ID to update
- `content` (optional): New task content
- `description` (optional): New task description
- `due_date` (optional): New due date (natural language or YYYY-MM-DD)
- `priority` (optional): New priority level (1-4)
- `labels` (optional): New labels array

**Examples:**

```
Update task 123 to have priority 4
Change task 456 due date to "next Friday"
Update task 789 content to "Revised meeting agenda"
```

### todoist_complete_task

Mark a task as completed.

**Parameters:**

- `task_id` (required): The task ID to complete

**Examples:**

```
Complete task 123456
Mark task 789012 as done
```

### todoist_list_projects

List all projects in Todoist, including inbox and shared projects.

**Parameters:** None

**Examples:**

```
List all my projects
Show me all my Todoist projects
```

### todoist_search_tasks

Search for tasks by text in their content or description.

**Parameters:**

- `query` (required): Text to search for in task content and description
- `limit` (optional): Maximum number of tasks to return (default: 50, max: 200)

**Examples:**

```
Search for tasks containing "meeting"
Find all tasks with "budget" in them
```

## Development

### Build

```bash
npm run build
```

### Development Mode (Watch)

```bash
npm run dev
```

### Run Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

## Rate Limits

The server respects Todoist's API rate limit of **450 requests per 15 minutes**. When the limit is exceeded, the API returns a 429 error which is caught and reported with a helpful error message. You can retry your request after waiting.

## Error Handling

All errors are returned with descriptive messages. Common errors include:

- **Invalid API token**: Check your `.env` configuration or Claude Desktop config
- **Task not found**: Verify the task ID exists and hasn't been deleted
- **Rate limit exceeded**: Wait 15 minutes or reduce request frequency
- **Network error**: Check your internet connection
- **Validation error**: Review the parameters you're providing to the tool

## Natural Language Date Support

The server supports Todoist's natural language date parsing. You can use phrases like:

- "tomorrow"
- "next Monday"
- "every Friday"
- "in 3 days"
- "next week"
- "Dec 25"

You can also use standard date formats:

- "2024-12-31"
- "2024-12-31T14:30:00"

## Project Structure

```
todoist-mcp/
├── src/
│   ├── server.ts           # Main MCP server entry point
│   ├── types/              # TypeScript type definitions
│   ├── api/                # Todoist API client and errors
│   ├── tools/              # MCP tool implementations
│   └── utils/              # Utilities (logger, rate limiter)
├── tests/
│   └── unit/               # Unit tests
├── build/                  # Compiled JavaScript output
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Troubleshooting

### Server not showing in Claude

1. Verify the path in `claude_desktop_config.json` is absolute and correct
2. Check that you've built the project (`npm run build`)
3. Ensure the API token is set in the config
4. Restart Claude Desktop completely

### API Token Invalid

1. Go to [Todoist Integrations Settings](https://todoist.com/app/settings/integrations/developer)
2. Generate a new API token
3. Update your `.env` file or Claude Desktop config
4. Restart the server/Claude Desktop

### Tasks Not Showing Up

1. Verify you're using the correct project ID or filter
2. Check that tasks aren't already completed
3. Try listing all tasks without filters to see what's available

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

- [Todoist API Documentation](https://developer.todoist.com/rest/v2/)
- [MCP Documentation](https://modelcontextprotocol.io/)
- [GitHub Issues](https://github.com/yourusername/todoist-mcp/issues)

## Acknowledgments

Built with:

- [Model Context Protocol SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Todoist REST API v2](https://developer.todoist.com/rest/v2/)
- [TypeScript](https://www.typescriptlang.org/)
- [Zod](https://github.com/colinhacks/zod)
