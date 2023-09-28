import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PostEntity } from './entities/post.entity';
import { Repository } from 'typeorm';
import { SearchPostDto } from './dto/search-post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private repository: Repository<PostEntity>,
  ) {}

  create(dto: CreatePostDto) {
    return this.repository.save(dto);
  }

  findAll() {
    return this.repository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async popular() {
    const queryBuilder = this.repository.createQueryBuilder();

    queryBuilder.orderBy('views', 'DESC');
    queryBuilder.limit(10);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      total,
    };
  }

  async search(dto: SearchPostDto) {
    const queryBuilder = this.repository.createQueryBuilder('p');

    queryBuilder.limit(dto.limit || 0);
    queryBuilder.take(dto.take || 10);

    if (dto.views) {
      queryBuilder.orderBy('views', dto.views);
    }

    if (dto.body) {
      queryBuilder.andWhere(`p.body ILIKE :body`);
    }

    if (dto.title) {
      queryBuilder.andWhere(`p.title ILIKE :title`);
    }

    if (dto.tag) {
      queryBuilder.andWhere(`p.tags ILIKE :tag `);
    }

    queryBuilder.setParameters({
      title: `%${dto.title}%`,
      body: `%${dto.body}%`,
      tag: `%${dto.tag}%`,
      views: dto.views || '',
    });

    const [items, total] = await queryBuilder.getManyAndCount();

    return { items, total };
  }

  async findOne(id: number) {
    const find = await this.repository.findOneBy({ id: id });
    if (!find) {
      throw new NotFoundException('Статья не найдена');
    }
    return find;
  }

  async update(id: number, dto: UpdatePostDto) {
    const find = await this.repository.findOneBy({ id: id });
    if (!find) {
      throw new NotFoundException('Статья не найдена');
    }

    return this.repository.update(id, dto);
  }

  async remove(id: number) {
    const find = await this.repository.findOneBy({ id: id });
    if (!find) {
      throw new NotFoundException('Статья не найдена');
    }
    return this.repository.delete(id);
  }
}
