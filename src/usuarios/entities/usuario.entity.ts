import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column({ length: 5000 })
  @ApiProperty()
  foto: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: false })
  @ApiProperty()
  peso: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: false })
  @ApiProperty()
  altura: number;

  @Column('decimal', { precision: 10, scale: 2})
  @ApiProperty()
  imc: number;

  @Column({ length: 255 })
  @ApiProperty()
  classificacao: string;
}
