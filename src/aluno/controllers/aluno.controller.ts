import { CreateAvaliacaoDto } from '../../avaliacoes/avaliacao.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { AuthenticatedUser } from '../../auth/strategy/jwt.strategy';
import { AlunoService } from '../services/aluno.service';
import {
  CreateAlunoDto,
  SearchAlunoDto,
  UpdateAlunoDto,
} from '../dto/aluno.dto';

type TrainerRequest = Request & { user: AuthenticatedUser };

@ApiTags('Aluno')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('/alunos')
export class AlunoController {
  constructor(private readonly alunoService: AlunoService) {}

  @Get()
  findAll(@Req() request: TrainerRequest) {
    return this.alunoService.findAll(request.user);
  }

  // Antes de /:id para evitar interpretar "buscar" como identificador.
  @Get('/buscar')
  search(
    @Query(new ValidationPipe({ whitelist: true })) query: SearchAlunoDto,
    @Req() request: TrainerRequest,
  ) {
    return this.alunoService.search(query.q || '', request.user);
  }

  @Get('/:id/avaliacoes')
  avaliacoes(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: TrainerRequest,
  ) {
    return this.alunoService.avaliacoes(id, request.user);
  }
  @Post('/:id/avaliacoes')
  registrarAvaliacao(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    dados: CreateAvaliacaoDto,
    @Req() request: TrainerRequest,
  ) {
    return this.alunoService.registrarAvaliacao(id, dados, request.user);
  }
  @Get('/:id')
  findById(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: TrainerRequest,
  ) {
    return this.alunoService.findById(id, request.user);
  }

  @Post('/:id/vincular')
  @HttpCode(HttpStatus.OK)
  linkExisting(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: TrainerRequest,
  ) {
    return this.alunoService.linkExisting(id, request.user);
  }

  @Post()
  create(
    @Body(new ValidationPipe({ whitelist: true })) dados: CreateAlunoDto,
    @Req() request: TrainerRequest,
  ) {
    return this.alunoService.create(dados, request.user);
  }

  @Put()
  update(
    @Body(new ValidationPipe({ whitelist: true })) dados: UpdateAlunoDto,
    @Req() request: TrainerRequest,
  ) {
    return this.alunoService.update(dados, request.user);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: TrainerRequest,
  ) {
    return this.alunoService.delete(id, request.user);
  }

  @Post('/:id/exercicios/:exercicioId')
  @HttpCode(HttpStatus.OK)
  addExercise(
    @Param('id', ParseIntPipe) id: number,
    @Param('exercicioId', ParseIntPipe) exercicioId: number,
    @Req() request: TrainerRequest,
  ) {
    return this.alunoService.addExercise(id, exercicioId, request.user);
  }

  @Delete('/:id/exercicios/:exercicioId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeExercise(
    @Param('id', ParseIntPipe) id: number,
    @Param('exercicioId', ParseIntPipe) exercicioId: number,
    @Req() request: TrainerRequest,
  ) {
    return this.alunoService.removeExercise(id, exercicioId, request.user);
  }
}
