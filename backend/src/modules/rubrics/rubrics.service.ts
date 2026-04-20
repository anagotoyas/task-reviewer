import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateRubricDto } from './dto/create-rubric.dto';
import { UpdateRubricDto } from './dto/update-rubric.dto';

@Injectable()
export class RubricsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRubricDto, ownerId: string) {
    const rubric = await this.prisma.rubric.create({
      data: {
        name: dto.name,
        description: dto.description,
        ownerId,
        criteria: {
          create: dto.criteria.map((c) => ({
            name: c.name,
            description: c.description,
            orderIndex: c.orderIndex,
            levelDescriptors: {
              create: c.levelDescriptors.map((ld) => ({
                level: ld.level,
                description: ld.description,
              })),
            },
          })),
        },
      },
      include: { criteria: { include: { levelDescriptors: true } } },
    });

    return { message: 'Rubric created', data: rubric };
  }

  async findAll(ownerId: string) {
    const rubrics = await this.prisma.rubric.findMany({
      where: { ownerId, state: 1 },
      include: { criteria: { where: { state: 1 }, include: { levelDescriptors: true } } },
    });
    return { message: 'Rubrics retrieved', data: rubrics };
  }

  async findOne(id: string, ownerId: string) {
    const rubric = await this.prisma.rubric.findFirst({
      where: { id, state: 1 },
      include: { criteria: { where: { state: 1 }, include: { levelDescriptors: true } } },
    });
    if (!rubric) throw new NotFoundException('Rubric not found');
    if (rubric.ownerId !== ownerId) throw new ForbiddenException();
    return { message: 'Rubric retrieved', data: rubric };
  }

  async update(id: string, dto: UpdateRubricDto, ownerId: string) {
    const rubric = await this.prisma.rubric.findFirst({ where: { id, state: 1 } });
    if (!rubric) throw new NotFoundException('Rubric not found');
    if (rubric.ownerId !== ownerId) throw new ForbiddenException();

    const updated = await this.prisma.rubric.update({
      where: { id },
      data: dto,
      include: { criteria: { where: { state: 1 }, include: { levelDescriptors: true } } },
    });

    return { message: 'Rubric updated', data: updated };
  }

  async remove(id: string, ownerId: string) {
    const rubric = await this.prisma.rubric.findFirst({ where: { id, state: 1 } });
    if (!rubric) throw new NotFoundException('Rubric not found');
    if (rubric.ownerId !== ownerId) throw new ForbiddenException();

    await this.prisma.rubric.update({ where: { id }, data: { state: 0 } });
    return { message: 'Rubric deleted', data: null };
  }
}
