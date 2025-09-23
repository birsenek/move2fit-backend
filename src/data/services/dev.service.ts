import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Categoria } from '../../categoria/entities/categoria.entity';
import { Exercicio } from '../../exercicio/entities/exercicio.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Aluno } from '../../aluno/entities/aluno.entity';

@Injectable()
export class DevService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT
        ? parseInt(process.env.DB_PORT)
        : 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'move2fit',
      entities: [Categoria, Usuario, Exercicio, Aluno],
      synchronize: true,
    };
  }
}
