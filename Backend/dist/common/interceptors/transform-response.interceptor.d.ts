import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
export interface ResponseFormat<T> {
    success: boolean;
    statusCode: number;
    data: T;
    meta?: any;
    timestamp: string;
    requestId: string;
}
export declare class TransformResponseInterceptor<T> implements NestInterceptor<T, ResponseFormat<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseFormat<T>>;
}
