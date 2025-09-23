import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Aluno } from '../entities/aluno.entity';
import { DeleteResult, In, Repository } from 'typeorm';
import { ExercicioService } from '../../exercicio/services/exercicio.service';

@Injectable()
export class AlunoService {
  constructor(
    @InjectRepository(Aluno)
    private alunoRepository: Repository<Aluno>,
    private exercicioService: ExercicioService,
  ) {}

  async findAll(): Promise<Aluno[]> {
    return this.alunoRepository.find({
      relations: {
        exercicio: true,
      },
    });
  }

  async findById(id: number): Promise<Aluno> {
    const aluno = await this.alunoRepository.findOne({
      where: {
        id,
      },
      relations: {
        exercicio: {
          categoria: true,
        },
      },
    });

    if (!aluno)
      throw new HttpException('Aluno não encontrado!', HttpStatus.NOT_FOUND);

    return aluno;
  }

  async findByEmail(email: string): Promise<Aluno | null> {
    return await this.alunoRepository.findOne({
      where: {
        email,
      },
      relations: {
        exercicio: {
          categoria: true,
        },
      },
    });
  }

  async create(aluno: Aluno): Promise<Aluno> {
    const buscaAluno = await this.findByEmail(aluno.email);

    if (buscaAluno)
      throw new HttpException('O aluno já existe', HttpStatus.BAD_REQUEST);

    const { imc, classificacao } = this.calcularIMC(aluno.peso, aluno.altura);

    aluno.imc = imc;
    aluno.classificacao = classificacao;

    return this.alunoRepository.save(aluno);
  }

  async update(aluno: Aluno): Promise<Aluno> {
    await this.findById(aluno.id);

    const { imc, classificacao } = this.calcularIMC(aluno.peso, aluno.altura);

    aluno.imc = imc;
    aluno.classificacao = classificacao;

    if (aluno.exercicio && aluno.exercicio.length > 0) {
      const exercicioIds = aluno.exercicio.map((ex) =>
        typeof ex === 'number' ? ex : ex.id,
      );

      const exercicios = await this.exercicioService.findByIds(exercicioIds);

      if (exercicios.length !== aluno.exercicio.length) {
        throw new HttpException(
          'Um ou mais exercícios informados não foram encontrados',
          HttpStatus.BAD_REQUEST,
        );
      }

      aluno.exercicio = exercicios;
    }

    return await this.alunoRepository.save(aluno);
  }

  async delete(id: number): Promise<DeleteResult> {
    await this.findById(id);

    return await this.alunoRepository.delete(id);
  }

  calcularIMC = (
    peso: number,
    altura: number,
  ): { imc: number; classificacao: string } => {
    if (peso <= 0 || altura <= 0) {
      throw new HttpException(
        'Peso e altura devem conter valores válidos',
        HttpStatus.BAD_REQUEST,
      );
    }

    const imc = peso / (altura * altura);
    const imcArredondado = parseFloat(imc.toFixed(2));

    const classificarIMC = (imc: number): string => {
      if (imc < 18.5) return 'Abaixo do peso';
      if (imc < 24.9) return 'Peso normal';
      if (imc < 29.9) return 'Sobrepeso';
      if (imc < 34.9) return 'Obesidade Grau I';
      if (imc < 39.9) return 'Obesidade Grau II';
      return 'Obesidade Grau III (Mórbida)';
    };

    const classificacao = classificarIMC(imcArredondado);

    return { imc: imcArredondado, classificacao };
  };
}
