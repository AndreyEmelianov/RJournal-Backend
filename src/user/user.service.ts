import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { LoginUserDto } from './dto/login-user.dto';
import { SearchUserDto } from './dto/search-user.dto';
import { CommentEntity } from 'src/comment/entities/comment.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private repository: Repository<UserEntity>,
  ) {}

  create(dto: CreateUserDto) {
    return this.repository.save(dto);
  }

  async findAll() {
    const arr = await this.repository
      .createQueryBuilder('u')
      .leftJoinAndMapMany(
        'u.comments',
        CommentEntity,
        'comment',
        'comment.userId = u.id',
      )
      .loadRelationCountAndMap('u.commentsCount', 'u.comments', 'comments')
      .getMany();

    return arr.map((obj) => {
      delete obj.comments;
      return obj;
    });
  }

  findOne(id: number) {
    return this.repository.findOneBy({ id: id });
  }

  findByCond(cond: LoginUserDto) {
    return this.repository.findOneBy({
      email: cond.email,
      password: cond.password,
    });
  }

  update(id: number, dto: UpdateUserDto) {
    return this.repository.update(id, dto);
  }

  async search(dto: SearchUserDto) {
    const queryBuilder = this.repository.createQueryBuilder('u');

    queryBuilder.limit(dto.limit || 0);
    queryBuilder.take(dto.take || 10);

    if (dto.fullName) {
      queryBuilder.andWhere(`u.fullName ILIKE :fullName`);
    }

    if (dto.email) {
      queryBuilder.andWhere(`u.email ILIKE :email`);
    }

    queryBuilder.setParameters({
      email: `%${dto.email}%`,
      fullName: `%${dto.fullName}%`,
    });

    const [items, total] = await queryBuilder.getManyAndCount();

    return { items, total };
  }
}
