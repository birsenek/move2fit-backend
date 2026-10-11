import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from '../constants/constants';
import { UsuarioService } from '../../usuarios/services/usuario.service';

export interface AuthenticatedUser {
  id: number;
  usuario: string;
  tipo: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usuarioService: UsuarioService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: { sub: string }): Promise<AuthenticatedUser> {
    const usuario = await this.usuarioService.findByUsuario(payload.sub);
    if (!usuario) throw new UnauthorizedException('Conta não encontrada.');
    return { id: usuario.id, usuario: usuario.usuario, tipo: usuario.tipo };
  }
}
