/**
 * Unit tests for Zod validation schemas
 */

import {
  createTaskSchema,
  listTasksSchema,
  getTaskSchema,
  updateTaskSchema,
  completeTaskSchema,
  searchTasksSchema,
} from '../../../src/tools/schemas.js';

describe('Zod Schemas', () => {
  describe('createTaskSchema', () => {
    it('should validate valid task creation params', () => {
      const validInput = {
        content: 'Buy groceries',
        description: 'Milk, bread, eggs',
        priority: 3,
        labels: ['shopping'],
      };

      const result = createTaskSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should require content field', () => {
      const invalidInput = {
        priority: 1,
      };

      const result = createTaskSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject empty content', () => {
      const invalidInput = {
        content: '',
      };

      const result = createTaskSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject invalid priority', () => {
      const invalidInput = {
        content: 'Task',
        priority: 5,
      };

      const result = createTaskSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe('listTasksSchema', () => {
    it('should validate with default limit', () => {
      const validInput = {
        project_id: '123',
      };

      const result = listTasksSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(50);
      }
    });

    it('should reject limit over 200', () => {
      const invalidInput = {
        limit: 300,
      };

      const result = listTasksSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject negative limit', () => {
      const invalidInput = {
        limit: -1,
      };

      const result = listTasksSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe('getTaskSchema', () => {
    it('should validate valid task ID', () => {
      const validInput = {
        task_id: '123456',
      };

      const result = getTaskSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should require task_id', () => {
      const invalidInput = {};

      const result = getTaskSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject empty task_id', () => {
      const invalidInput = {
        task_id: '',
      };

      const result = getTaskSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe('updateTaskSchema', () => {
    it('should validate update with task_id only', () => {
      const validInput = {
        task_id: '123',
      };

      const result = updateTaskSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should validate update with multiple fields', () => {
      const validInput = {
        task_id: '123',
        content: 'Updated content',
        priority: 4,
        labels: ['urgent', 'work'],
      };

      const result = updateTaskSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should require task_id', () => {
      const invalidInput = {
        content: 'New content',
      };

      const result = updateTaskSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe('completeTaskSchema', () => {
    it('should validate valid task ID', () => {
      const validInput = {
        task_id: '789',
      };

      const result = completeTaskSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should require task_id', () => {
      const invalidInput = {};

      const result = completeTaskSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe('searchTasksSchema', () => {
    it('should validate search with query', () => {
      const validInput = {
        query: 'meeting',
      };

      const result = searchTasksSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should validate with custom limit', () => {
      const validInput = {
        query: 'test',
        limit: 100,
      };

      const result = searchTasksSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should require query', () => {
      const invalidInput = {
        limit: 50,
      };

      const result = searchTasksSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject empty query', () => {
      const invalidInput = {
        query: '',
      };

      const result = searchTasksSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });
});
