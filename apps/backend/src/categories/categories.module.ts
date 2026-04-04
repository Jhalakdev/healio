import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController, SymptomsController } from './categories.controller';
import { PublicContentController } from './public-content.controller';

@Module({
  controllers: [CategoriesController, SymptomsController, PublicContentController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
