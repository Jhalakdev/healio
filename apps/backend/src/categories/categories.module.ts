import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { PublicContentController } from './public-content.controller';

@Module({
  controllers: [CategoriesController, PublicContentController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
