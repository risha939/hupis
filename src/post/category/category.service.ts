import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const { name } = createCategoryDto;

    // 중복 카테고리 이름 체크
    const existingCategory = await this.categoryRepo.findOne({
      where: { name },
    });

    if (existingCategory) {
      throw new ConflictException('이미 존재하는 카테고리 이름입니다.');
    }

    const category = this.categoryRepo.create({ name });
    return await this.categoryRepo.save(category);
  }

  async findAll(): Promise<Category[]> {
    return await this.categoryRepo.find({
      order: { categoryId: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepo.findOne({
      where: { categoryId: id },
    });

    if (!category) {
      throw new NotFoundException('카테고리를 찾을 수 없습니다.');
    }

    return category;
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);

    // 연결된 포스트가 있는지 확인
    const postCount = await this.categoryRepo
      .createQueryBuilder('category')
      .leftJoin('category.posts', 'post')
      .where('category.categoryId = :id', { id })
      .getCount();

    if (postCount > 0) {
      throw new BadRequestException(
        '게시글에 연결되어 있는 카테고리가 있습니다. 연결된 카테고리를 변경 후 다시 시도해 주세요.'
      );
    }

    await this.categoryRepo.remove(category);
  }
}
