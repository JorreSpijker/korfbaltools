import { NextResponse } from "next/server";
import { apiError, apiErrorStatus, type ApiErrorCode } from "@korfbaltools/types";
import type { ZodError } from "zod";

export function errorResponse(code: ApiErrorCode, message: string, details?: unknown) {
  return NextResponse.json(apiError(code, message, details), { status: apiErrorStatus(code) });
}

export function validationErrorResponse(error: ZodError) {
  return errorResponse("validation_error", "Ongeldige invoer", error.flatten());
}
