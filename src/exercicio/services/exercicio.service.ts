import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';
import { Exercicio } from '../entities/exercicio.entity';

@Injectable()
export class ExercicioService {
  constructor(
    @InjectRepository(Exercicio)
    private exercicioRepository: Repository<Exercicio>,
  ) {}

  async findAll(): Promise<Exercicio[]> {
    return await this.exercicioRepository.find({
      relations: {
        categoria: true,
      },
    });
  }

  async findById(id: number): Promise<Exercicio> {
    const exercicio = await this.exercicioRepository.findOne({
      where: { id },
      relations: {
        categoria: true,
      },
    });

    if (!exercicio) {
      throw new HttpException('Exercicio não encontrado', HttpStatus.NOT_FOUND);
    }

    return exercicio;
  }

  async findByNome(nome: string): Promise<Exercicio[]> {
    return await this.exercicioRepository.find({
      where: {
        nome: ILike(`%${nome}%`),
      },
      relations: {
        categoria: true,
      },
    });
  }

  async findByIds(ids: number[]): Promise<Exercicio[]> {
    if (!ids || ids.length === 0) {
      return [];
    }

    return await this.exercicioRepository.findBy({ id: In(ids) });
  }

  async create(exercicio: Exercicio): Promise<Exercicio> {
    return await this.exercicioRepository.save(this.catalogFields(exercicio));
  }

  async update(exercio: Exercicio): Promise<Exercicio> {
    const exercicioExistente = await this.findById(exercio.id);

    if (!exercicioExistente) {
      throw new HttpException('Exercicio não encontrado', HttpStatus.NOT_FOUND);
    }

    return await this.exercicioRepository.save({
      ...this.catalogFields(exercio),
      id: exercicioExistente.id,
    });
  }

  private catalogFields(exercicio: Exercicio) {
    if (exercicio.aluno !== undefined) {
      throw new BadRequestException(
        'Associe exercícios pelas rotas de alunos vinculados.',
      );
    }
    // O catálogo não pode expor nem modificar alunos por relações aninhadas.
    return this.exercicioRepository.create({
      nome: exercicio.nome,
      descricao: exercicio.descricao,
      carga: exercicio.carga,
      repeticao: exercicio.repeticao,
      tempo: exercicio.tempo,
      foto: exercicio.foto,
      categoria: exercicio.categoria?.id
        ? { id: exercicio.categoria.id }
        : undefined,
    });
  }

  async delete(id: number): Promise<void> {
    const exercicioExistente = await this.findById(id);

    if (!exercicioExistente) {
      throw new HttpException('Exercicio não encontrado', HttpStatus.NOT_FOUND);
    }

    await this.exercicioRepository.delete(id);
  }
}
