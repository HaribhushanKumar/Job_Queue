import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { JobsModule } from './jobs/jobs.module';
import { Job } from './jobs/entities/job.entity';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: join(__dirname, '..', 'job_queue.sqlite'),
      entities: [Job],
      synchronize: true, // Auto create/update SQLite database schema in dev
    }),
    JobsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
