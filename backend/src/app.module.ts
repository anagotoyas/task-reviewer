import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@/prisma/prisma.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { UsersModule } from '@/modules/users/users.module';
import { RolesModule } from '@/modules/roles/roles.module';
import { CoursesModule } from '@/modules/courses/courses.module';
import { RubricsModule } from '@/modules/rubrics/rubrics.module';
import { HomeworksModule } from '@/modules/homeworks/homeworks.module';
import { SubmissionsModule } from '@/modules/submissions/submissions.module';
import { UploadModule } from '@/modules/upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    RolesModule,
    CoursesModule,
    RubricsModule,
    HomeworksModule,
    SubmissionsModule,
    UploadModule,
  ],
})
export class AppModule {}
