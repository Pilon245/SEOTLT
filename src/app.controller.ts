import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/mds')
  async getMds() {
    return await this.appService.getMds();
  }

  @Get('/mds/:id')
  async getMdsById(@Param() param: { id: string }) {
    return await this.appService.getMdsById(param.id);
  }

  @Put('/change')
  async getChange(@Body() obj: { mds: Array<object> }) {
    await this.appService.getChange(obj);

    return 'Update';
  }

  @Post('/mds')
  async createMds(@Body() obj: { mds: Array<object> }) {
    await this.appService.createMds(obj);

    return 'Save';
  }
}
