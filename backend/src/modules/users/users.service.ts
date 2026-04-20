import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto, actorId: string) {
    const existing = await this.prisma.user.findFirst({
      where: { email: dto.email, state: 1 },
    });
    if (existing) throw new ConflictException('Email already in use');

    const role = await this.prisma.role.findFirst({
      where: { id: dto.roleId, state: 1 },
    });
    if (!role) throw new NotFoundException('Role not found');

    const hashed = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        lastname: dto.lastname,
        email: dto.email,
        password: hashed,
        roleId: dto.roleId,
        createdUser: actorId,
      },
      include: { role: true },
    });

    return { message: 'User created', data: this.sanitize(user) };
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      where: { state: 1 },
      include: { role: true },
    });
    return { message: 'Users retrieved', data: users.map(this.sanitize) };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, state: 1 },
      include: { role: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return { message: 'User retrieved', data: this.sanitize(user) };
  }

  async update(id: string, dto: UpdateUserDto, actorId: string) {
    const user = await this.prisma.user.findFirst({ where: { id, state: 1 } });
    if (!user) throw new NotFoundException('User not found');

    if (dto.email && dto.email !== user.email) {
      const conflict = await this.prisma.user.findFirst({
        where: { email: dto.email, state: 1 },
      });
      if (conflict) throw new ConflictException('Email already in use');
    }

    const data: any = { ...dto, updatedUser: actorId };
    if (dto.password) data.password = await bcrypt.hash(dto.password, 10);

    const updated = await this.prisma.user.update({
      where: { id },
      data,
      include: { role: true },
    });

    return { message: 'User updated', data: this.sanitize(updated) };
  }

  async remove(id: string, actorId: string) {
    const user = await this.prisma.user.findFirst({ where: { id, state: 1 } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.user.update({
      where: { id },
      data: { state: 0, updatedUser: actorId },
    });

    return { message: 'User deleted', data: null };
  }

  private sanitize(user: any) {
    const { password, hashedRefreshToken, ...safe } = user;
    return safe;
  }
}
