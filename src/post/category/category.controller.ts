import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from './entities/category.entity';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CategoryDto } from './response/category-response-dto';

@ApiTags('Category')
@ApiBearerAuth('JWT-auth')
@Controller('category')
@UseGuards(JwtAuthGuard)
export class CategoryController {
  constructor(private readonly service: CategoryService) { }

  @ApiOperation({ summary: '카테고리 생성' })
  @ApiResponse({ status: 201, description: '카테고리 생성 성공', type: CategoryDto })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  @ApiResponse({ status: 401, description: '인증이 필요합니다' })
  @ApiResponse({ status: 409, description: '이미 존재하는 카테고리 이름입니다.' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateCategoryDto): Promise<CategoryDto> {
    return this.service.create(dto);
  }

  @ApiOperation({ summary: '카테고리 목록 조회' })
  @ApiResponse({ status: 200, description: '카테고리 목록 조회 성공', type: [CategoryDto] })
  @ApiResponse({ status: 401, description: '인증이 필요합니다' })
  @Get()
  async findAll(): Promise<CategoryDto[]> {
    return this.service.findAll();
  }

  @ApiOperation({ summary: '카테고리 삭제' })
  @ApiParam({ name: 'id', description: '카테고리 ID', example: 1 })
  @ApiResponse({ status: 204, description: '카테고리 삭제 성공' })
  @ApiResponse({ status: 401, description: '인증이 필요합니다' })
  @ApiResponse({ status: 404, description: '카테고리를 찾을 수 없습니다' })
  @ApiResponse({ status: 409, description: '게시글에 연결되어 있는 카테고리가 있습니다. 연결된 카테고리를 변경 후 다시 시도해 주세요.' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.service.remove(+id);
    return;
  }
}
