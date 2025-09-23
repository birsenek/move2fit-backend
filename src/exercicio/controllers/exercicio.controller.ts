import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  HttpCode,
  HttpStatus,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ExercicioService } from '../services/exercicio.service';
import { Exercicio } from '../entities/exercicio.entity';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Exercicio')
@UseGuards(JwtAuthGuard)
@Controller('/exercicios')
@ApiBearerAuth()
export class ExercicioController {
  constructor(private readonly exercicioService: ExercicioService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(): Promise<Exercicio[]> {
    return this.exercicioService.findAll();
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  findById(@Param('id') id: number) {
    return this.exercicioService.findById(id);
  }

  @Get('/nome/:nome')
  @HttpCode(HttpStatus.OK)
  findByNome(@Param('nome') nome: string): Promise<Exercicio[]> {
    return this.exercicioService.findByNome(nome);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() exercicio: Exercicio): Promise<Exercicio> {
    return this.exercicioService.create(exercicio);
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  update(@Body() exercicio: Exercicio): Promise<Exercicio> {
    return this.exercicioService.update(exercicio);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.exercicioService.delete(id);
  }
}
