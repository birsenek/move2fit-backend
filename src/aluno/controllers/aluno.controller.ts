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
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { AlunoService } from '../services/aluno.service';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@ApiTags('Aluno')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('/alunos')
export class AlunoController {
  constructor(private readonly alunoService: AlunoService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(): Promise<Usuario[]> {
    return this.alunoService.findAll();
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  findById(@Param('id', ParseIntPipe) id: number): Promise<Usuario> {
    return this.alunoService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() usuario: Usuario): Promise<Usuario> {
    return this.alunoService.create(usuario);
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  update(
    @Body(new ValidationPipe({ skipMissingProperties: true })) usuario: Usuario,
  ): Promise<Usuario> {
    return this.alunoService.update(usuario);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.alunoService.delete(id);
  }
}
