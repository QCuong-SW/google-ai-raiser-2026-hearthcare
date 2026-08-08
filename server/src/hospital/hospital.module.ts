import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HospitalEntity } from './hospital.entity';
import { HospitalService } from './hospital.service';
import { HospitalController } from './hospital.controller';
import { RankingService } from '../ranking/ranking.service';

@Module({
  imports: [TypeOrmModule.forFeature([HospitalEntity])],
  providers: [HospitalService, RankingService],
  controllers: [HospitalController],
  exports: [HospitalService, TypeOrmModule],
})
export class HospitalModule {}
