import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BehaviorLogService } from '@/modules/behavior-log/behavior-log.service';

@Injectable()
export class BehaviorInterceptor implements NestInterceptor {
  constructor(private behaviorLogService: BehaviorLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const startTime = Date.now();

    // 只记录客户端请求，跳过管理后台、健康检查等
    const path = request.route?.path || request.url || '';
    if (
      path.startsWith('/api/v1/admin') ||
      path.startsWith('/admin') ||
      path.includes('health') ||
      path.includes('api-docs')
    ) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(() => {
        try {
          const duration = Date.now() - startTime;
          const userId = request.user?.userId;
          const method = request.method || 'GET';
          const page = request.route?.path || request.path || '/';

          // Only log for authenticated users
          if (userId) {
            this.behaviorLogService.log({
              userId,
              eventType: `${method}:${page}`,
              page,
              duration,
              extra: {
                method,
                query: Object.keys(request.query || {}).length > 0 ? 'hasQuery' : undefined,
              },
            });
          }
        } catch {
          // Silent fail for behavior logging
        }
      }),
    );
  }
}
