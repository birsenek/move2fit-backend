import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { UsuarioService } from '../../usuarios/services/usuario.service';

@Injectable()
export class AlunoService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    private usuarioService: UsuarioService,
  ) {}

  async findAll(): Promise<Usuario[]> {
    return this.usuarioRepository.find({
      where: { tipo: 'ALUNO' },
      relations: {
        exercicio: {
          categoria: true,
        },
      },
    });
  }

  async findById(id: number): Promise<Usuario> {
    const aluno = await this.usuarioRepository.findOne({
      where: { id, tipo: 'ALUNO' },
      relations: {
        exercicio: {
          categoria: true,
        },
      },
    });

    if (!aluno)
      throw new HttpException('Aluno não encontrado!', HttpStatus.NOT_FOUND);

    aluno.senha = '';
    return aluno;
  }

  async create(usuario: Usuario): Promise<Usuario> {
    usuario.tipo = 'ALUNO';
    return this.usuarioService.create(usuario);
  }

  async update(usuario: Usuario): Promise<Usuario> {
    await this.findById(usuario.id);
    usuario.senha = '';
    return this.usuarioService.update(usuario);
  }

  async delete(id: number): Promise<DeleteResult> {
    await this.findById(id);
    return this.usuarioService.delete(id);
  }
}
