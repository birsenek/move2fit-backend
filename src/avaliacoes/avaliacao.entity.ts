import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Check,
} from 'typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity';
const decimal = {
  to: (value: number) => value,
  from: (value: string) => Number(value),
};
@Entity({ name: 'tb_avaliacoes' })
@Unique('UQ_avaliacao_semana', ['alunoId', 'semanaInicio'])
@Check('CK_avaliacao_medidas', 'peso > 0 AND altura > 0 AND imc > 0')
export class Avaliacao {
  @PrimaryGeneratedColumn() id: number;
  @Column() alunoId: number;
  @ManyToOne(() => Usuario, (aluno) => aluno.avaliacoes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'alunoId' })
  aluno: Usuario;
  @Column({ nullable: true }) treinadorId: number;
  @ManyToOne(() => Usuario, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'treinadorId' })
  treinador: Usuario;
  @Column({ type: 'date' }) dataColeta: string;
  @Column({ type: 'date' }) semanaInicio: string;
  @Column('decimal', { precision: 10, scale: 2, transformer: decimal })
  peso: number;
  @Column('decimal', { precision: 10, scale: 2, transformer: decimal })
  altura: number;
  @Column('decimal', { precision: 10, scale: 2, transformer: decimal })
  imc: number;
  @Column({ length: 255 }) classificacao: string;
  @Column({ length: 20, default: 'MANUAL' }) origem: string;
}
