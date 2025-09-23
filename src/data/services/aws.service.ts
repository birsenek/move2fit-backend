import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Categoria } from '../../categoria/entities/categoria.entity';
import { Exercicio } from '../../exercicio/entities/exercicio.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Aluno } from '../../aluno/entities/aluno.entity';

@Injectable()
export class AwsService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: process.env.DB_HOST || '52.32.129.225',
      port: process.env.MYSQL_PORT_INTERNAL
        ? parseInt(process.env.MYSQL_PORT_INTERNAL)
        : 5432,
      username: process.env.DB_USERNAME || 'move2fit',
      password: process.env.DB_PASSWORD || 'move2fit',
      database: process.env.DB_NAME || 'db_move2fit',
      entities: [Categoria, Usuario, Exercicio, Aluno],
      synchronize: true,
    };
  }
}
