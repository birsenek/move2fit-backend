import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    return await this.usuarioRepository.findOne({
      where: {
        usuario: usuario,
      },
    });
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

  async create(usuario: Usuario): Promise<Usuario> {
    const buscaUsuario = await this.findByUsuario(usuario.usuario);

    if (buscaUsuario)
      throw new HttpException('O Usuario já existe!', HttpStatus.BAD_REQUEST);
    usuario.senha = await this.bcrypt.criptografarSenha(usuario.senha);

    const { imc, classificacao } = this.calcularIMC(
      usuario.peso,
      usuario.altura,
    );

    usuario.imc = imc;
    usuario.classificacao = classificacao;

    return await this.usuarioRepository.save(usuario);
  }

  async update(usuario: Usuario): Promise<Usuario> {
    await this.findById(usuario.id);

    const buscaUsuario = await this.findByUsuario(usuario.usuario);

    if (buscaUsuario && buscaUsuario.id !== usuario.id)
      throw new HttpException('O Usuario já existe!', HttpStatus.BAD_REQUEST);

    const { imc, classificacao } = this.calcularIMC(
      usuario.peso,
      usuario.altura,
    );

    usuario.imc = imc;
    usuario.classificacao = classificacao;
    usuario.senha = await this.bcrypt.criptografarSenha(usuario.senha);

    return await this.usuarioRepository.save(usuario);
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
      if (imc < 24.9) return 'Peso normal';
      if (imc < 29.9) return 'Sobrepeso';
      if (imc < 34.9) return 'Obesidade Grau I';
      if (imc < 39.9) return 'Obesidade Grau II';
      return 'Obesidade Grau III (Mórbida)';
    };

    const classificacao = classificarIMC(imcArredondado);

    return { imc: imcArredondado, classificacao };
  };
}
