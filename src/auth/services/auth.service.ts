import { JwtService } from '@nestjs/jwt';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Bcrypt } from '../bcrypt/bcrypt';
import { UsuarioLogin } from '../entities/usuariologin.entity';
import { UsuarioService } from '../../usuarios/services/usuario.service';
@Injectable()
export class AuthService {
  constructor(
    private usuarioService: UsuarioService,
    private jwtService: JwtService,
    private bcrypt: Bcrypt,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const buscaUsuario = await this.usuarioService.findByUsuario(username);

    if (!buscaUsuario) {
      throw new HttpException('Usuário não encontrado!', HttpStatus.NOT_FOUND);
    }

    const matchPassword = await this.bcrypt.compararSenhas(
      password,
      buscaUsuario.senha,
    );

    if (buscaUsuario && matchPassword) {
      const { senha, ...resposta } = buscaUsuario;
      return resposta;
    }

    return null;
  }

  async login(usuarioLogin: UsuarioLogin) {
    const payload = { sub: usuarioLogin.usuario };

    const buscaUsuario = await this.usuarioService.findByUsuario(
      usuarioLogin.usuario,
    );

    if (!buscaUsuario) {
      throw new HttpException('Usuário não encontrado!', HttpStatus.NOT_FOUND);
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    let diasSeguidos = 1;
    if (buscaUsuario.ultimoLogin) {
      const ultimoLogin = new Date(buscaUsuario.ultimoLogin);
      ultimoLogin.setHours(0, 0, 0, 0);
      const diffDias = Math.round(
        (hoje.getTime() - ultimoLogin.getTime()) / 86400000,
      );
      if (diffDias === 0) {
        diasSeguidos = buscaUsuario.diasSeguidos;
      } else if (diffDias === 1) {
        diasSeguidos = buscaUsuario.diasSeguidos + 1;
      }
    }

    await this.usuarioService.updateLoginStreak(buscaUsuario.id, diasSeguidos, hoje);

    return {
      id: buscaUsuario.id,
      nome: buscaUsuario.nome,
      usuario: usuarioLogin.usuario,
      senha: '',
      foto: buscaUsuario.foto,
      tipo: buscaUsuario.tipo,
      peso: buscaUsuario.peso,
      altura: buscaUsuario.altura,
      imc: buscaUsuario.imc,
      classificacao: buscaUsuario.classificacao,
      diasSeguidos,
      token: `Bearer ${this.jwtService.sign(payload)}`,
    };
  }
}
