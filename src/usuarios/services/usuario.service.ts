import { Avaliacao } from '../../avaliacoes/avaliacao.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, EntityManager, Repository } from 'typeorm';
import { Usuario } from '../entities/usuario.entity';
import { Bcrypt } from '../../auth/bcrypt/bcrypt';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    private bcrypt: Bcrypt,
  ) {}

  async findByUsuario(usuario: string): Promise<Usuario | null> {
    if (typeof usuario !== 'string') return null;
    return this.usuarioRepository
      .createQueryBuilder('conta')
      .where('LOWER(TRIM(conta.usuario)) = :email', {
        email: usuario.trim().toLowerCase(),
      })
      .getOne();
  }

  async findAll(): Promise<Usuario[]> {
    return await this.usuarioRepository.find();
  }

  async findById(id: number): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({
      where: {
        id,
      },
    });

    if (!usuario)
      throw new HttpException(
        `Usuário com ID ${id} não encontrado`,
        HttpStatus.NOT_FOUND,
      );

    return usuario;
  }

  async create(
    usuario: Usuario,
    manager = this.usuarioRepository.manager,
  ): Promise<Usuario> {
    const email = usuario.usuario.trim().toLowerCase();
    return manager.transaction(async (transaction: EntityManager) => {
      await transaction.query('SELECT pg_advisory_xact_lock(hashtext($1))', [
        email,
      ]);
      const repository = transaction.getRepository(Usuario);
      const existing = await repository
        .createQueryBuilder('conta')
        .where('LOWER(TRIM(conta.usuario)) = :email', { email })
        .getOne();
      if (existing)
        throw new HttpException('O usuário já existe!', HttpStatus.CONFLICT);
      if (!['ALUNO', 'PERSONAL_TRAINER'].includes(usuario.tipo)) {
        throw new HttpException(
          'Tipo de usuário inválido.',
          HttpStatus.BAD_REQUEST,
        );
      }
      // Não aceitar IDs ou relações enviados no cadastro público.
      const novo = repository.create({
        nome: usuario.nome,
        usuario: email,
        tipo: usuario.tipo,
        senha: await this.bcrypt.criptografarSenha(usuario.senha),
        foto: usuario.foto,
      });
      const salvo = await repository.save(novo);
      const medidas = usuario as Usuario & { peso?: number; altura?: number };
      if (salvo.tipo === 'ALUNO' && medidas.peso && medidas.altura) {
        const peso = Number(medidas.peso),
          altura = Number(medidas.altura);
        if (
          !Number.isFinite(peso) ||
          !Number.isFinite(altura) ||
          peso < 1 ||
          peso > 500 ||
          altura < 0.3 ||
          altura > 2.7
        )
          throw new HttpException(
            'Peso ou altura inválidos.',
            HttpStatus.BAD_REQUEST,
          );
        const dataColeta = new Date().toLocaleDateString('en-CA', {
          timeZone: 'America/Sao_Paulo',
        });
        const date = new Date(dataColeta + 'T00:00:00Z');
        date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
        await transaction
          .getRepository(Avaliacao)
          .save({
            alunoId: salvo.id,
            peso,
            altura,
            ...this.calcularIMC(peso, altura),
            dataColeta,
            semanaInicio: date.toISOString().slice(0, 10),
            origem: 'MANUAL',
          });
      }
      return salvo;
    });
  }

  async update(usuario: Usuario): Promise<Usuario> {
    await this.findById(usuario.id);

    const buscaUsuario = await this.findByUsuario(usuario.usuario);

    if (buscaUsuario && buscaUsuario.id !== usuario.id)
      throw new HttpException('O Usuario já existe!', HttpStatus.BAD_REQUEST);

    if (usuario.senha) {
      usuario.senha = await this.bcrypt.criptografarSenha(usuario.senha);
    } else {
      const existing = await this.findById(usuario.id);
      usuario.senha = existing.senha;
    }

    return await this.usuarioRepository.save(usuario);
  }

  async updateLoginStreak(
    id: number,
    diasSeguidos: number,
    ultimoLogin: Date,
  ): Promise<void> {
    await this.usuarioRepository.update(id, { diasSeguidos, ultimoLogin });
  }

  async delete(id: number): Promise<DeleteResult> {
    await this.findById(id);
    return await this.usuarioRepository.delete(id);
  }

  calcularIMC = (
    peso: number,
    altura: number,
  ): { imc: number; classificacao: string } => {
    if (peso <= 0 || altura <= 0) {
      throw new HttpException(
        'Peso e altura devem conter valores válidos',
        HttpStatus.BAD_REQUEST,
      );
    }

    const imc = peso / (altura * altura);
    const imcArredondado = parseFloat(imc.toFixed(2));

    const classificarIMC = (imc: number): string => {
      if (imc < 18.5) return 'Abaixo do peso';
      if (imc < 25) return 'Peso normal';
      if (imc < 30) return 'Sobrepeso';
      if (imc < 35) return 'Obesidade Grau I';
      if (imc < 40) return 'Obesidade Grau II';
      return 'Obesidade Grau III (Mórbida)';
    };

    const classificacao = classificarIMC(imcArredondado);

    return { imc: imcArredondado, classificacao };
  };
}
