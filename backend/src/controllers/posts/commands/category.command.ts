import { Injectable } from '@nestjs/common';
import { CategoryService } from 'src/entities/category/category.service';

@Injectable()
export class CategoryCommand {
  constructor(private readonly categoryService: CategoryService) {}

  /**
   * 카테고리 별 포스트 갯수 조회
   *
   * @returns
   */
  async getPostCountByCategories() {
    return this.categoryService.getPostCountByCategories();
  }
}
