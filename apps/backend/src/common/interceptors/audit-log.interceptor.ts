import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    // Only audit write operations
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return next.handle();
    }

    const userId = request.user?.userId;
    const action = `${method} ${request.url}`;
    const ip = request.ip || request.headers['x-forwarded-for'];

    return next.handle().pipe(
      tap(async () => {
        try {
          await this.prisma.auditLog.create({
            data: {
              userId,
              action,
              entity: context.getClass().name,
              ipAddress: ip,
              metadata: {
                body: this.sanitize(request.body),
                params: request.params,
              },
            },
          });
        } catch {
          // Don't fail requests if audit logging fails
        }
      }),
    );
  }

  private sanitize(body: any): any {
    if (!body) return body;
    const sanitized = { ...body };
    // Strip sensitive fields
    delete sanitized.password;
    delete sanitized.otp;
    delete sanitized.refreshToken;
    return sanitized;
  }
}
