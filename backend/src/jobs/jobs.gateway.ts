import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { Job } from './entities/job.entity';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class JobsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('JobsGateway');

  afterInit(server: Server) {
    this.logger.log('Websocket Gateway Initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  notifyJobCreated(job: Job) {
    this.server?.emit('jobCreated', job);
  }

  notifyJobUpdated(job: Job) {
    this.server?.emit('jobUpdated', job);
  }

  notifyJobDeleted(jobId: string) {
    this.server?.emit('jobDeleted', { id: jobId });
  }

  notifyStatsUpdated(stats: Record<string, number>) {
    this.server?.emit('statsUpdated', stats);
  }
}
