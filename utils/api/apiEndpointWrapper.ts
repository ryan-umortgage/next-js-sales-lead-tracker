import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Define a common response structure
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: { message: string; key?: string }[];
  statusCode: number;
}

interface ValidationResult {
  valid: boolean;
  message?: string;
  errorCode?: number;
  errors?: { message: string; key?: string }[];
}

type ValidationFunction = (prisma: PrismaClient) => Promise<ValidationResult>;

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface HandlerFunction<T> {
  method: HttpMethod;
  handler: (prisma: PrismaClient) => Promise<T>;
  validationFunction?: ValidationFunction;
}

const successResponses: Record<
  HttpMethod,
  ApiResponse<Record<string, unknown>>
> = {
  GET: { success: true, message: "Read", statusCode: 200 },
  POST: { success: true, message: "Created", statusCode: 201 },
  PUT: { success: true, message: "Updated", statusCode: 200 },
  DELETE: { success: true, message: "Deleted", statusCode: 200 },
};

async function apiEndpointWrapper<T>(
  handler: HandlerFunction<T>
): Promise<NextResponse> {
  const prisma = new PrismaClient();

  try {
    // Check if a validation function is provided
    const validationResult = handler.validationFunction
      ? await handler.validationFunction(prisma)
      : { valid: true };

    // Determine whether to proceed with the handler function or return an error response
    if (!validationResult.valid) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        message: validationResult.message || "Unauthorized",
        statusCode: validationResult.errorCode || 403,
        errors: validationResult.errors,
      };
      return NextResponse.json(errorResponse, {
        status: errorResponse.statusCode,
      });
    }

    const responseData = await handler.handler(prisma);

    // Get the custom success response for the specified HTTP method
    const successResponse = {
      ...successResponses[handler.method],
      data: responseData,
    };

    return NextResponse.json(successResponse, {
      status: successResponse.statusCode,
    });
  } catch (error) {
    // Create an internal server error response
    const errorResponse: ApiResponse<null> = {
      success: false,
      message: "Internal Server Error",
      statusCode: 500,
    };
    return NextResponse.json(errorResponse, {
      status: errorResponse.statusCode,
    });
  } finally {
    await prisma.$disconnect();
  }
}

export default apiEndpointWrapper;
