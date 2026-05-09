import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { AlunoService } from './services/aluno.service';
import { AlunoController } from './controllers/aluno.controller';
import { UsuarioModule } from '../usuarios/usuarios.module';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario]), UsuarioModule],
  providers: [AlunoService],
  controllers: [AlunoController],
  exports: [TypeOrmModule],
})
export class AlunoModule {}
