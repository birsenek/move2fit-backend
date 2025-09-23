import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriaModule } from './categoria/categoria.module';
import { UsuarioModule } from './usuarios/usuarios.module';
import { ExercicioModule } from './exercicio/exercicio.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { DevService } from './data/services/dev.service';
import { ProdService } from './data/services/prod.service';
import { AlunoModule } from './aluno/aluno.module';
import { AwsService } from './data/services/aws.service';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      //useClass: ProdService,
      // useClass: AwsService,
       useClass: DevService,
      imports: [ConfigModule],
    }),
    AlunoModule,
    CategoriaModule,
    UsuarioModule,
    ExercicioModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
