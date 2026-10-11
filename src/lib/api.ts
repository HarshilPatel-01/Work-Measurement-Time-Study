import { NextRequest, NextResponse } from 'next/server';
import { ZodError, ZodSchema } from 'zod';

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status });
}

export function err(
  message: string,
  status = 400,
  details?: unknown
): NextResponse {
  return NextResponse.json(
    Object.assign({ success: false, error: message }, details ? { details } : {}),
    { status }
  );
}

export function paginated<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  });
}

export function parsePagination(req: NextRequest): { page: number; limit: number; skip: number } {
  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(req.nextUrl.searchParams.get('limit') || '20')));
  return { page, limit, skip: (page - 1) * limit };
}

type HandlerContext = {
  req: NextRequest;
};

type HandlerOptions<T> = {
  bodySchema?: ZodSchema<T>;
};

export function createHandler<Body = unknown>(
  options: HandlerOptions<Body>,
  handler: (ctx: HandlerContext, body: Body) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      let body: Body = undefined as Body;
      if (options.bodySchema) {
        let raw: unknown;
        try {
          raw = await req.json();
        } catch {
          return err('Invalid JSON body', 400);
        }
        const result = options.bodySchema.safeParse(raw);
        if (!result.success) {
          return err('Validation failed', 422, result.error.flatten());
        }
        body = result.data;
      }

      return await handler({ req }, body);
    } catch (e) {
      if (e instanceof ZodError) {
        return err('Validation failed', 422, e.flatten());
      }
      console.error('[API Error]', e);
      return err('Internal server error', 500);
    }
  };
}

export function sanitize(input: string): string {
  return input.replace(/<[^>]*>/g, '').trim();
}
