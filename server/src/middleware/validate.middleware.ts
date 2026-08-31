import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors: Record<string, string[]> = {};
        error.issues.forEach((err) => {
          const field = err.path.join('.') || 'general';
          if (!formattedErrors[field]) formattedErrors[field] = [];
          formattedErrors[field].push(err.message);
        })
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          errors: formattedErrors,
        });
      }
      next(error);
    }
  };
}
export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query) as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors: Record<string, string[]> = {};
        error.issues.forEach((err) => {
          const field = err.path.join('.') || 'general';
          if (!formattedErrors[field]) formattedErrors[field] = [];
          formattedErrors[field].push(err.message);
        });

        return res.status(400).json({
          success: false,
          error: 'Query parameter validation failed',
          errors: formattedErrors,
        });
      }
      next(error);
    }
  };
}
