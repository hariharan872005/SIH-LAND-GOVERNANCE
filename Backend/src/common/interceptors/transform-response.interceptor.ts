import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

export interface ResponseFormat<T> {
  success: boolean;
  statusCode: number;
  data: T;
  meta?: any;
  timestamp: string;
  requestId: string;
}

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, ResponseFormat<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseFormat<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const requestId = (request.headers['x-request-id'] as string) || uuidv4();

    return next.handle().pipe(
      map((res) => {
        // If the service returned a paginated result with meta
        if (res && typeof res === 'object' && 'items' in res && 'meta' in res) {
          return {
            success: true,
            statusCode: response.statusCode,
            data: res.items,
            meta: res.meta,
            timestamp: new Date().toISOString(),
            requestId,
          };
        }

        return {
          success: true,
          statusCode: response.statusCode,
          data: res,
          timestamp: new Date().toISOString(),
          requestId,
        };
      }),
    );
  }
}
