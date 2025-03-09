import { describe, expect, it } from 'bun:test';
import {
  paginatorReqSchema,
  paginatorSearchReqSchema,
  wrapPaginatorResSchema,
  okPaginator,
  type PaginatorReq,
} from '../lib/paginator';
import { HttpCode, z } from '../lib/common';

describe('paginatorReqSchema', () => {
  it('should validate valid input', () => {
    const input = {
      currentPage: 2,
      pageSize: 10,
    };

    const result = paginatorReqSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(input);
    }
  });

  it('should use default values when not provided', () => {
    const input = {};

    const result = paginatorReqSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        currentPage: 1,
        pageSize: 20,
      });
    }
  });

  it('should reject invalid currentPage', () => {
    const input = {
      currentPage: -1,
      pageSize: 10,
    };

    const result = paginatorReqSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('should reject invalid pageSize', () => {
    const input = {
      currentPage: 1,
      pageSize: 100,
    };

    const result = paginatorReqSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

describe('paginatorSearchReqSchema', () => {
  it('should validate valid input with search word', () => {
    const input = {
      currentPage: 2,
      pageSize: 10,
      searchWord: '测试关键词',
    };

    const result = paginatorSearchReqSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(input);
    }
  });

  it('should validate valid input without search word', () => {
    const input = {
      currentPage: 2,
      pageSize: 10,
    };

    const result = paginatorSearchReqSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(input);
    }
  });
});

describe('wrapPaginatorResSchema', () => {
  it('should create a valid schema for paginated responses', () => {
    // 创建一个简单的项目模式
    const itemSchema = z.object({
      id: z.number(),
      name: z.string(),
    });

    const schema = wrapPaginatorResSchema(itemSchema);

    // 验证模式结构
    expect(schema).toBeDefined();

    // 测试有效数据
    const validData = {
      code: HttpCode.OK,
      message: 'ok',
      data: {
        list: [
          { id: 1, name: '项目1' },
          { id: 2, name: '项目2' },
        ],
        paginator: {
          currentPage: 1,
          pageSize: 10,
          totalPage: 3,
          totalRecord: 25,
        },
      },
    };

    const result = schema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});

describe('okPaginator', () => {
  it('should create a valid paginated response', () => {
    const req: PaginatorReq = {
      currentPage: 2,
      pageSize: 10,
    };

    const data = {
      list: [
        { id: 11, name: '项目11' },
        { id: 12, name: '项目12' },
        { id: 13, name: '项目13' },
      ],
      count: 25,
    };

    const response = okPaginator(req, data);

    expect(response).toEqual({
      code: HttpCode.OK,
      message: 'ok',
      data: {
        list: data.list,
        paginator: {
          currentPage: 2,
          pageSize: 10,
          totalPage: 3, // 25 / 10 = 2.5 -> 3
          totalRecord: 25,
        },
      },
    });
  });

  it('should calculate totalPage correctly', () => {
    const req: PaginatorReq = {
      currentPage: 1,
      pageSize: 10,
    };

    // 测试整除的情况
    const data1 = {
      list: [],
      count: 30,
    };

    const response1 = okPaginator(req, data1);
    expect(response1.data.paginator.totalPage).toBe(3);

    // 测试非整除的情况
    const data2 = {
      list: [],
      count: 31,
    };

    const response2 = okPaginator(req, data2);
    expect(response2.data.paginator.totalPage).toBe(4);
  });
});
