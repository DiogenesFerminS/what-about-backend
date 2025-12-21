import { DatabaseError } from '../interfaces/databaseError.interface';

export function isDatabaseError(error: unknown): error is DatabaseError {
  return (
    error instanceof Error &&
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'detail' in error
  );
}
