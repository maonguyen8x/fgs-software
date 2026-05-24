import { NextResponse } from "next/server";

export interface ApiErrorBody {
  error: string;
  code?: string;
}

export function apiSuccess<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function apiError(
  message: string,
  status: number,
  code?: string
): NextResponse<ApiErrorBody> {
  return NextResponse.json({ error: message, code }, { status });
}

export function apiValidationError(message = "Validation failed"): NextResponse<ApiErrorBody> {
  return apiError(message, 400, "VALIDATION_ERROR");
}

export function apiUnauthorized(message = "Unauthorized"): NextResponse<ApiErrorBody> {
  return apiError(message, 401, "UNAUTHORIZED");
}

export function apiServerError(message = "Internal server error"): NextResponse<ApiErrorBody> {
  return apiError(message, 500, "INTERNAL_ERROR");
}
