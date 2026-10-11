import { Avaliacao } from '../../avaliacoes/avaliacao.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { Exercicio } from '../../exercicio/entities/exercicio.entity';

@Entity({ name: 'tb_usuarios' })
export class Usuario {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Transform(({ value }: TransformFnParams) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return '';
  })
  @IsNotEmpty()
  @Column({ length: 255, nullable: false })
  @ApiProperty()
  nome: string;

  @IsEmail()
  @Transform(({ value }: TransformFnParams) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return '';
  })
  @IsNotEmpty()
  @Column({ length: 255, nullable: false })
  @ApiProperty()
  usuario: string;

  @MinLength(8)
  @Transform(({ value }: TransformFnParams) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return '';
  })
  @IsNotEmpty()
  @Column({ length: 255, nullable: false })
  @ApiProperty()
  senha: string;

  @Column({ length: 5000, nullable: true })
  @ApiProperty()
  foto: string;

  @IsNotEmpty()
  @Column({ length: 50, nullable: false, default: 'PERSONAL_TRAINER' })
  @ApiProperty()
  tipo: string;

  @OneToMany(() => Avaliacao, (avaliacao) => avaliacao.aluno)
  avaliacoes: Avaliacao[];

  @Column({ type: 'date', nullable: true })
  @ApiProperty()
  ultimoLogin: Date;

  @Column({ type: 'int', default: 0 })
  @ApiProperty()
  diasSeguidos: number;

  @ApiProperty({ type: () => Exercicio })
  @ManyToMany(() => Exercicio, (exercicio) => exercicio.aluno)
  @JoinTable()
  exercicio: Exercicio[];

  @ManyToMany(() => Usuario, (treinador) => treinador.alunos, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'tb_treinador_aluno',
    joinColumn: { name: 'alunoId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'treinadorId', referencedColumnName: 'id' },
  })
  treinadores: Usuario[];

  @ManyToMany(() => Usuario, (aluno) => aluno.treinadores, {
    onDelete: 'CASCADE',
  })
  alunos: Usuario[];
}
