// ============================================================
// Response Helpers
// ============================================================

import { Response } from 'express';

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: PaginationMeta;
}

interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface PaginatedData<T> {
  items: T[];
  meta: PaginationMeta;
}

// Success Response
export function success<T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: number = 200
): Response {
  const response: ApiResponse<T> = {
    success: true,
    ...(data !== undefined && { data }),
    ...(message && { message })
  };

  return res.status(statusCode).json(response);
}

// Success Response (for controller pattern)
export function successResponse<T>(
  data?: T,
  message?: string,
  meta?: Partial<PaginationMeta>
): { success: boolean; data?: T; message?: string; meta?: PaginationMeta } {
  return {
    success: true,
    ...(data !== undefined && { data }),
    ...(message && { message }),
    ...(meta && Object.keys(meta).length > 0 && { meta: buildPaginationMeta(
      meta.page || 1,
      meta.pageSize || 20,
      meta.total || 0
    )})
  };
}

// Created Response
export function created<T>(
  res: Response,
  data?: T,
  message: string = 'Created successfully'
): Response {
  return success(res, data, message, 201);
}

// No Content Response
export function noContent(res: Response): Response {
  return res.status(204).send();
}

// Paginated Response
export function paginated<T>(
  res: Response,
  items: T[],
  meta: PaginationMeta,
  message?: string
): Response {
  const response: ApiResponse<T[]> = {
    success: true,
    data: items,
    ...(message && { message }),
    meta
  };

  return res.status(200).json(response);
}

// Build pagination meta
export function buildPaginationMeta(
  page: number,
  pageSize: number,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / pageSize);

  return {
    page,
    pageSize,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
}

// Error Response
export function error(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: unknown
): Response {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details ? { details: details as Record<string, unknown> } : {})
    }
  });
}

// Helper to set rate limit headers
export function setRateLimitHeaders(
  res: Response,
  remaining: number,
  resetAt: number
): void {
  res.setHeader('X-RateLimit-Remaining', remaining.toString());
  res.setHeader('X-RateLimit-Reset', resetAt.toString());
}

// Helper to set pagination headers
export function setPaginationHeaders(
  res: Response,
  meta: PaginationMeta
): void {
  res.setHeader('X-Total-Count', meta.total.toString());
  res.setHeader('X-Page-Count', meta.totalPages.toString());
  res.setHeader('X-Current-Page', meta.page.toString());
}

// Export types
export type { ApiResponse, PaginationMeta, PaginatedData };
