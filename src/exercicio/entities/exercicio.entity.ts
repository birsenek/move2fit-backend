import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, Length } from 'class-validator';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany } from 'typeorm';
import { Categoria } from '../../categoria/entities/categoria.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Aluno } from '../../aluno/entities/aluno.entity';

@Entity({ name: 'tb_exercicios' })
export class Exercicio {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return '';
  })
  @Column({ length: 100, nullable: false })
  @ApiProperty()
  nome: string;

  @IsNotEmpty()
  @Length(5, 255)
  @Transform(({ value }: TransformFnParams) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return '';
  })
  @Column({ length: 255, nullable: false })
  @ApiProperty()
  descricao: string;

  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => {
    if (typeof value === 'number') {
      return value;
    }
    return 0;
  })
  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  @ApiProperty()
  carga: number;

  @Column({ type: 'int', nullable: true })
  @ApiProperty()
  repeticao: number;

  @Column({ length: 10 })
  @ApiProperty()
  tempo: string;

  @Column({ length: 5000 })
  @ApiProperty()
  foto: string;

  @ApiProperty({ type: () => Categoria })
  @ManyToOne(() => Categoria, (categoria) => categoria.exercicio, {
    onDelete: 'CASCADE',
  })
  categoria: Categoria;

  @ApiProperty({ type: () => Aluno })
  @ManyToMany(() => Aluno, (aluno) => aluno.exercicio)
  aluno: Aluno[];
}
