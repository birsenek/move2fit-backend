import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Categoria } from '../../categoria/entities/categoria.entity';
import { Exercicio } from '../../exercicio/entities/exercicio.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
@Injectable()
export class DevService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT
        ? parseInt(process.env.DB_PORT)
        : 5432,
      username: process.env.DB_USERNAME || 'movetofit',
      password: process.env.DB_PASSWORD || 'move2fit',
      database: process.env.DB_NAME || 'movetofit',
      entities: [Categoria, Usuario, Exercicio],
      synchronize: true,
    };
  }
}
