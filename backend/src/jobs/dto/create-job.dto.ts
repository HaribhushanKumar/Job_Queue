import { IsNotEmpty, IsString, IsEnum, MaxLength } from 'class-validator';

export class CreateJobDto {
  @IsNotEmpty({ message: 'Title is required' })
  @IsString()
  @MaxLength(255)
  title: string;

  @IsNotEmpty({ message: 'Type is required' })
  @IsString()
  @MaxLength(100)
  type: string;
}
