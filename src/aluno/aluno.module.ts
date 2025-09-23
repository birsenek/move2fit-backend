import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Aluno } from './entities/aluno.entity';
import { AlunoService } from './services/aluno.service';
import { AlunoController } from './controllers/aluno.controller';
import { ExercicioModule } from '../exercicio/exercicio.module';

@Module({
  imports: [TypeOrmModule.forFeature([Aluno]), ExercicioModule],
  providers: [AlunoService],
  controllers: [AlunoController],
  exports: [TypeOrmModule],
})
export class AlunoModule {}
