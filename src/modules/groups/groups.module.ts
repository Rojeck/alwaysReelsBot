import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database';
import { groupsProviders } from './groups.providers';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';

@Module({
  imports: [DatabaseModule],
  controllers: [GroupsController],
  providers: [GroupsService, ...groupsProviders],
  exports: [GroupsService, ...groupsProviders],
})
export class GroupsModule {}
