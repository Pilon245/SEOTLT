import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Component } from './component.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '194.87.219.88',
      port: 5432,
      username: 'postgres',
      password: '1234',
      database: 'postgres',
      entities: [Component],
      synchronize: false,
    }),
    TypeOrmModule.forFeature([Component]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
