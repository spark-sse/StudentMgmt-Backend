import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CourseModule } from './course/course.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm-config';
import { UserModule } from './user/user.module';
import { TestModule } from './test/test.module';

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig), CourseModule, UserModule, TestModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
