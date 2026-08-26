import { Controller, Get, Post, Query, Param, Body, UseGuards } from '@nestjs/common';
import { HospitalService } from './hospital.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/user.entity';

@Controller('api/hospitals')
export class HospitalController {
  constructor(private readonly hospitalService: HospitalService) {}

  @Get()
  async getAllHospitals() {
    return this.hospitalService.getAllHospitals();
  }

  @Get('emergency')
  async getEmergencyHospitals(
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
  ) {
    const userLat = lat ? parseFloat(lat) : 10.8028;
    const userLng = lng ? parseFloat(lng) : 106.6947;
    return this.hospitalService.getImmediateEmergencyHospitals(userLat, userLng);
  }

  @Get('search')
  async searchHospitals(
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('specialties') specialtiesStr?: string,
    @Query('isEmergency') isEmergencyStr?: string,
  ) {
    const userLat = lat ? parseFloat(lat) : 10.8028;
    const userLng = lng ? parseFloat(lng) : 106.6947;
    const specialties = specialtiesStr ? specialtiesStr.split(',') : [];
    const isEmergency = isEmergencyStr === 'true';

    return this.hospitalService.searchAndRankHospitals(userLat, userLng, specialties, isEmergency);
  }

  @Get(':id')
  async getHospitalById(@Param('id') id: string) {
    return this.hospitalService.getHospitalById(id);
  }

  // ADMIN ONLY ROUTE
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  async createHospital(@Body() body: any) {
    return this.hospitalService.createHospital(body);
  }
}
