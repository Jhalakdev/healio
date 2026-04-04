import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';

export const ADMIN_MODULE_KEY = 'admin_module';
export const ADMIN_ACTION_KEY = 'admin_action';

export interface AdminAccess {
  module: string;
  action: 'read' | 'write' | 'delete';
}

// Decorator: @RequireAdminAccess('doctors', 'write')
export function RequireAdminAccess(module: string, action: 'read' | 'write' | 'delete') {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(ADMIN_MODULE_KEY, module, descriptor.value);
    Reflect.defineMetadata(ADMIN_ACTION_KEY, action, descriptor.value);
    return descriptor;
  };
}

@Injectable()
export class AdminPermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const module = this.reflector.get<string>(
      ADMIN_MODULE_KEY,
      context.getHandler(),
    );
    const action = this.reflector.get<string>(
      ADMIN_ACTION_KEY,
      context.getHandler(),
    );

    // If no module/action specified, allow (just role-based)
    if (!module || !action) return true;

    const { user } = context.switchToHttp().getRequest();

    // SUPER_ADMIN bypasses all permission checks
    if (user.role === 'SUPER_ADMIN') return true;

    // Check granular permissions
    const permission = await this.prisma.adminPermission.findUnique({
      where: {
        userId_module: {
          userId: user.userId,
          module,
        },
      },
    });

    if (!permission) {
      throw new ForbiddenException(
        `No permission for ${module}:${action}`,
      );
    }

    const actionMap: Record<string, keyof typeof permission> = {
      read: 'canRead',
      write: 'canWrite',
      delete: 'canDelete',
    };

    if (!permission[actionMap[action]]) {
      throw new ForbiddenException(
        `No ${action} permission for ${module}`,
      );
    }

    return true;
  }
}
