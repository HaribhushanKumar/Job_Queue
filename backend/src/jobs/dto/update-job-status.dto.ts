import { IsEnum, IsOptional, IsNumber, Min, Max, IsString } from 'class-validator';
import { JobStatus } from '../entities/job.entity';

export class UpdateJobStatusDto {
  @IsEnum(JobStatus, { message: 'Invalid status value. Must be pending, running, completed, or failed.' })
  status: JobStatus;

  @IsOptional()
  @IsEnum(JobStatus)
  expectedCurrentStatus?: JobStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress?: number;

  @IsOptional()
  @IsString()
  errorMessage?: string;
}
