import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Exercicio } from '../../exercicio/entities/exercicio.entity';

@Entity({ name: 'tb_alunos' })
export class Aluno {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Transform(({ value }: TransformFnParams) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return '';
  })
  @IsNotEmpty()
  @Column({ length: 255, nullable: false })
  nome: string;

  @ApiProperty()
  @IsEmail()
  @Transform(({ value }: TransformFnParams) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return '';
  })
  @IsNotEmpty()
  @Column({ length: 255, nullable: false })
  email: string;

  @ApiProperty()
  @Column({ length: 5000 })
  foto: string;

  @ApiProperty()
  @Column('decimal', { precision: 10, scale: 2, nullable: false })
  peso: number;

  @ApiProperty()
  @Column('decimal', { precision: 10, scale: 2, nullable: false })
  altura: number;

  @ApiProperty()
  @Column('decimal', { precision: 10, scale: 2, nullable: false })
  imc: number;

  @ApiProperty()
  @Column({ length: 255 })
  classificacao: string;

  @ApiProperty({ type: () => Exercicio })
  @ManyToMany(() => Exercicio, (exercicio) => exercicio.aluno)
  @JoinTable()
  exercicio: Exercicio[];
}
