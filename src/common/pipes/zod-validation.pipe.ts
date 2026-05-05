import { PipeTransform, BadRequestException } from "@nestjs/common";
import { ZodSchema, ZodError } from "zod";

/**
 * A NestJS pipe that validates incoming data against a Zod schema.
 * If validation fails, it throws a BadRequestException with formatted error details.
 */
export class ZodValidationPipe implements PipeTransform<unknown> {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown): unknown {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));

        throw new BadRequestException(errors);
      }

      throw error;
    }
  }
}
