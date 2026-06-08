import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient();
    const token = this.extractToken(client);
    if (!token) {
      // 允许连接但标记未认证，消息级别处理
      return true;
    }
    try {
      const payload = this.jwtService.verify(token);
      (client as any).userId = payload.userId;
      (client as any).username = payload.username;
      return true;
    } catch {
      return true; // 允许未认证连接，具体事件自行判断
    }
  }

  private extractToken(client: Socket): string | undefined {
    const auth = client.handshake.auth?.token || client.handshake.query?.token;
    if (auth) return typeof auth === 'string' ? auth : undefined;
    const header = client.handshake.headers?.authorization;
    if (header && header.startsWith('Bearer ')) {
      return header.slice(7);
    }
    return undefined;
  }
}
