import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHealthRoot() {
    return this.getHealth();
  }

  @Get('status')
  getHealthStatus() {
    return this.getHealth();
  }

  private getHealth() {
    return {
      status: 'online',
      name: 'TaskPulse Job Queue API',
      version: '1.0.0',
      endpoints: {
        createJob: 'POST /jobs',
        getAllJobs: 'GET /jobs',
        updateJobStatus: 'PATCH /jobs/:id/status',
        deleteJob: 'DELETE /jobs/:id',
        jobStats: 'GET /jobs/stats',
      },
    };
  }
}
