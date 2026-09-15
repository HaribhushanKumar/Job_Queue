import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job, JobStatus } from './entities/job.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobStatusDto } from './dto/update-job-status.dto';
import { JobsGateway } from './jobs.gateway';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    private readonly jobsGateway: JobsGateway,
  ) {}

  // Allowed state machine transitions matrix (strict intern assignment specification)
  // pending -> running -> completed OR failed
  // A completed or failed job CANNOT become running again!
  private readonly allowedTransitions: Record<JobStatus, JobStatus[]> = {
    [JobStatus.PENDING]: [JobStatus.RUNNING],
    [JobStatus.RUNNING]: [JobStatus.RUNNING, JobStatus.COMPLETED, JobStatus.FAILED],
    [JobStatus.FAILED]: [], // Terminal state - cannot transition back to running
    [JobStatus.COMPLETED]: [], // Terminal state - cannot transition back to running
  };

  /**
   * Validate state transition according to rules
   */
  private validateTransition(currentStatus: JobStatus, targetStatus: JobStatus) {
    const validTargets = this.allowedTransitions[currentStatus] || [];
    if (!validTargets.includes(targetStatus)) {
      throw new BadRequestException(
        `Invalid state transition from '${currentStatus}' to '${targetStatus}'. Allowed transitions from '${currentStatus}' are: [${validTargets.length > 0 ? validTargets.join(', ') : 'none (terminal state)'}]`,
      );
    }
  }

  /**
   * Create a new job
   */
  async create(createJobDto: CreateJobDto): Promise<Job> {
    const job = this.jobRepository.create({
      title: createJobDto.title,
      type: createJobDto.type,
      status: JobStatus.PENDING,
      progress: 0,
      errorMessage: null,
    });

    const savedJob = await this.jobRepository.save(job);
    this.jobsGateway.notifyJobCreated(savedJob);
    await this.emitStatsUpdate();
    return savedJob;
  }

  /**
   * List all jobs with optional status filter and search query
   */
  async findAll(status?: JobStatus, search?: string): Promise<Job[]> {
    const query = this.jobRepository.createQueryBuilder('job');

    if (status) {
      query.andWhere('job.status = :status', { status });
    }

    if (search) {
      query.andWhere('(job.title LIKE :search OR job.type LIKE :search)', {
        search: `%${search}%`,
      });
    }

    query.orderBy('job.createdAt', 'DESC');
    return await query.getMany();
  }

  /**
   * Get job by ID
   */
  async findOne(id: string): Promise<Job> {
    const job = await this.jobRepository.findOne({ where: { id } });
    if (!job) {
      throw new NotFoundException(`Job with ID '${id}' not found`);
    }
    return job;
  }

  /**
   * Get status summary statistics counters
   */
  async getStats(): Promise<Record<string, number>> {
    const rawStats = await this.jobRepository
      .createQueryBuilder('job')
      .select('job.status', 'status')
      .addSelect('COUNT(job.id)', 'count')
      .groupBy('job.status')
      .getRawMany();

    const stats: Record<string, number> = {
      total: 0,
      [JobStatus.PENDING]: 0,
      [JobStatus.RUNNING]: 0,
      [JobStatus.COMPLETED]: 0,
      [JobStatus.FAILED]: 0,
    };

    let total = 0;
    for (const stat of rawStats) {
      const count = parseInt(stat.count, 10);
      stats[stat.status] = count;
      total += count;
    }
    stats.total = total;

    return stats;
  }

  /**
   * Update job status safely with state machine rules & atomic race condition protection
   */
  async updateStatus(id: string, dto: UpdateJobStatusDto): Promise<Job> {
    // 1. Fetch current job record from database
    const existingJob = await this.findOne(id);
    const expectedCurrent = dto.expectedCurrentStatus || existingJob.status;

    // 2. Enforce strict state machine transition rules (pending -> running -> completed/failed)
    this.validateTransition(existingJob.status, dto.status);

    // 3. Determine progress & error message values
    let newProgress = dto.progress !== undefined ? dto.progress : existingJob.progress;
    if (dto.status === JobStatus.PENDING) newProgress = 0;
    if (dto.status === JobStatus.COMPLETED) newProgress = 100;

    let newErrorMessage = dto.errorMessage !== undefined ? dto.errorMessage : existingJob.errorMessage;
    if (dto.status === JobStatus.RUNNING) {
      newErrorMessage = null;
    }

    // 4. ATOMIC UPDATE QUERY GUARDING AGAINST CONCURRENCY RACE CONDITIONS
    // Performs UPDATE jobs SET status = :newStatus ... WHERE id = :id AND status = :expectedCurrent
    const result = await this.jobRepository
      .createQueryBuilder()
      .update(Job)
      .set({
        status: dto.status,
        progress: newProgress,
        errorMessage: newErrorMessage,
        updatedAt: new Date(),
      })
      .where('id = :id AND status = :expectedCurrent', {
        id,
        expectedCurrent,
      })
      .execute();

    // If no rows were affected, another concurrent request modified the job state first!
    if (result.affected === 0) {
      this.logger.warn(`Race condition blocked for job ${id}: Expected state '${expectedCurrent}' mismatch.`);
      throw new ConflictException(
        `Race Condition Guard: The job status was modified concurrently by another tab or process. Expected state '${expectedCurrent}' no longer matches server state.`,
      );
    }

    // 5. Fetch updated entity & notify via WebSockets
    const updatedJob = await this.findOne(id);
    this.jobsGateway.notifyJobUpdated(updatedJob);
    await this.emitStatsUpdate();

    return updatedJob;
  }

  /**
   * Simulate worker background execution
   */
  async runWorker(id: string): Promise<Job> {
    const job = await this.findOne(id);

    // Initial transition to RUNNING
    const runningJob = await this.updateStatus(id, {
      status: JobStatus.RUNNING,
      expectedCurrentStatus: job.status,
      progress: 10,
    });

    // Asynchronously progress the job step by step
    this.simulateAsyncProcessing(id);

    return runningJob;
  }

  private async simulateAsyncProcessing(id: string) {
    const steps = [30, 65, 85, 100];
    const isFailTest = Math.random() < 0.2; // 20% chance of failure scenario

    for (let i = 0; i < steps.length; i++) {
      await new Promise((res) => setTimeout(res, 1200));

      try {
        const currentJob = await this.jobRepository.findOne({ where: { id } });
        if (!currentJob || currentJob.status !== JobStatus.RUNNING) {
          // Job state altered or removed
          break;
        }

        const progress = steps[i];

        if (isFailTest && progress === 65) {
          // Fail the job at 65%
          await this.updateStatus(id, {
            status: JobStatus.FAILED,
            expectedCurrentStatus: JobStatus.RUNNING,
            progress: 65,
            errorMessage: 'Worker process encountered an unexpected execution error or resource timeout.',
          });
          break;
        } else if (progress === 100) {
          // Complete the job
          await this.updateStatus(id, {
            status: JobStatus.COMPLETED,
            expectedCurrentStatus: JobStatus.RUNNING,
            progress: 100,
          });
        } else {
          // Increment progress
          await this.updateStatus(id, {
            status: JobStatus.RUNNING,
            expectedCurrentStatus: JobStatus.RUNNING,
            progress,
          });
        }
      } catch (err) {
        this.logger.error(`Error during processing of job ${id}: ${err.message}`);
        break;
      }
    }
  }

  /**
   * Delete job record
   */
  async remove(id: string): Promise<void> {
    const job = await this.findOne(id);
    await this.jobRepository.remove(job);
    this.jobsGateway.notifyJobDeleted(id);
    await this.emitStatsUpdate();
  }

  private async emitStatsUpdate() {
    const stats = await this.getStats();
    this.jobsGateway.notifyStatsUpdated(stats);
  }
}
