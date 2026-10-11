import { Avaliacao } from '../../avaliacoes/avaliacao.entity';
import { CreateAvaliacaoDto } from '../../avaliacoes/avaliacao.dto';
import { tendencia } from '../../avaliacoes/tendencia';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { UsuarioService } from '../../usuarios/services/usuario.service';
import { Exercicio } from '../../exercicio/entities/exercicio.entity';
import { AuthenticatedUser } from '../../auth/strategy/jwt.strategy';
import { CreateAlunoDto, UpdateAlunoDto } from '../dto/aluno.dto';

@Injectable()
export class AlunoService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly usuarioService: UsuarioService,
  ) {}

  private assertTrainer(treinador: AuthenticatedUser) {
    if (treinador.tipo !== 'PERSONAL_TRAINER')
      throw new ForbiddenException('Acesso exclusivo para treinadores.');
  }

  private safeAluno(aluno: Usuario) {
    const { senha, treinadores, alunos, avaliacoes, ...dados } = aluno;
    const ultimaAvaliacao =
      [...(avaliacoes || [])].sort((a, b) =>
        b.dataColeta.localeCompare(a.dataColeta),
      )[0] || null;
    return {
      ...dados,
      ultimaAvaliacao,
      peso: ultimaAvaliacao?.peso ?? null,
      altura: ultimaAvaliacao?.altura ?? null,
      imc: ultimaAvaliacao?.imc ?? null,
      classificacao: ultimaAvaliacao?.classificacao ?? null,
    };
  }

  private async requireLinked(
    id: number,
    treinador: AuthenticatedUser,
    manager = this.usuarioRepository.manager,
  ) {
    this.assertTrainer(treinador);
    const aluno = await manager.getRepository(Usuario).findOne({
      where: { id, tipo: 'ALUNO', treinadores: { id: treinador.id } },
      relations: { exercicio: { categoria: true }, avaliacoes: true },
    });
    if (!aluno)
      throw new NotFoundException('Aluno não encontrado na sua lista.');
    return aluno;
  }

  async findAll(treinador: AuthenticatedUser) {
    this.assertTrainer(treinador);
    const alunos = await this.usuarioRepository.find({
      where: { tipo: 'ALUNO', treinadores: { id: treinador.id } },
      relations: { exercicio: { categoria: true }, avaliacoes: true },
      order: { nome: 'ASC', id: 'ASC' },
    });
    return alunos.map((aluno) => this.safeAluno(aluno));
  }

  async findById(id: number, treinador: AuthenticatedUser) {
    return this.safeAluno(await this.requireLinked(id, treinador));
  }

  async search(term: string, treinador: AuthenticatedUser) {
    this.assertTrainer(treinador);
    const query = term.trim();
    if (query.length < 2) return [];
    if (query.length > 100)
      throw new BadRequestException('Busca deve ter até 100 caracteres.');
    const escaped = query.replace(/[\\%_]/g, '\\$&');
    const rows = await this.usuarioRepository
      .createQueryBuilder('aluno')
      .leftJoin(
        'aluno.treinadores',
        'treinador',
        'treinador.id = :treinadorId',
        { treinadorId: treinador.id },
      )
      .select('aluno.id', 'id')
      .addSelect('aluno.nome', 'nome')
      .addSelect('aluno.usuario', 'usuario')
      .addSelect('treinador.id IS NOT NULL', 'vinculado')
      .where('aluno.tipo = :tipo', { tipo: 'ALUNO' })
      .andWhere('(aluno.nome ILIKE :query OR aluno.usuario ILIKE :query)', {
        query: `%${escaped}%`,
      })
      .orderBy('aluno.nome', 'ASC')
      .addOrderBy('aluno.id', 'ASC')
      .limit(10)
      .getRawMany<{
        id: number;
        nome: string;
        usuario: string;
        vinculado: boolean;
      }>();
    return rows;
  }

  private async link(
    manager: EntityManager,
    alunoId: number,
    treinadorId: number,
  ) {
    await manager.query(
      'INSERT INTO tb_treinador_aluno ("alunoId", "treinadorId") VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [alunoId, treinadorId],
    );
  }

  async linkExisting(id: number, treinador: AuthenticatedUser) {
    this.assertTrainer(treinador);
    await this.usuarioRepository.manager.transaction(async (manager) => {
      const aluno = await manager
        .getRepository(Usuario)
        .findOneBy({ id, tipo: 'ALUNO' });
      if (!aluno) throw new NotFoundException('Aluno não encontrado.');
      await this.link(manager, aluno.id, treinador.id);
    });
    return this.findById(id, treinador);
  }

  async create(dados: CreateAlunoDto, treinador: AuthenticatedUser) {
    this.assertTrainer(treinador);
    const email = dados.usuario.trim().toLowerCase();
    const id = await this.usuarioRepository.manager.transaction(
      async (manager) => {
        // Mesmo bloqueio utilizado pelo cadastro público: duas requisições não criam o mesmo email.
        await manager.query('SELECT pg_advisory_xact_lock(hashtext($1))', [
          email,
        ]);
        let aluno = await manager
          .getRepository(Usuario)
          .createQueryBuilder('usuario')
          .where('LOWER(TRIM(usuario.usuario)) = :email', { email })
          .getOne();
        if (aluno && aluno.tipo !== 'ALUNO')
          throw new ConflictException(
            'Este e-mail pertence a uma conta de treinador.',
          );
        if (!aluno) {
          if (!dados.nome || !dados.senha || !dados.peso || !dados.altura) {
            throw new BadRequestException(
              'Informe nome, senha, peso e altura para cadastrar um novo aluno.',
            );
          }
          aluno = await this.usuarioService.create(
            { ...dados, usuario: email, tipo: 'ALUNO' } as Usuario,
            manager,
          );
          await manager
            .getRepository(Avaliacao)
            .update({ alunoId: aluno.id }, { treinadorId: treinador.id });
        }
        await this.link(manager, aluno.id, treinador.id);
        return aluno.id;
      },
    );
    return this.findById(id, treinador);
  }

  async update(dados: UpdateAlunoDto, treinador: AuthenticatedUser) {
    await this.usuarioRepository.manager.transaction(async (manager) => {
      const aluno = await this.requireLinked(dados.id, treinador, manager);
      const nome = dados.nome ?? aluno.nome;
      const foto = dados.foto ?? aluno.foto;
      await manager.getRepository(Usuario).update(aluno.id, { nome, foto });
    });
    return this.findById(dados.id, treinador);
  }

  async avaliacoes(id: number, treinador: AuthenticatedUser) {
    await this.requireLinked(id, treinador);
    const historico = await this.usuarioRepository.manager
      .getRepository(Avaliacao)
      .find({ where: { alunoId: id }, order: { dataColeta: 'ASC' } });
    return {
      historico,
      tendencia: tendencia(historico.filter((a) => a.origem !== 'MIGRACAO')),
    };
  }

  async registrarAvaliacao(
    id: number,
    dados: CreateAvaliacaoDto,
    treinador: AuthenticatedUser,
  ) {
    return this.usuarioRepository.manager.transaction(async (manager) => {
      await this.requireLinked(id, treinador, manager);
      const hoje = new Date().toLocaleDateString('en-CA', {
        timeZone: 'America/Sao_Paulo',
      });
      if (dados.dataColeta > hoje)
        throw new BadRequestException(
          'A data de coleta não pode estar no futuro.',
        );
      const date = new Date(dados.dataColeta + 'T00:00:00Z');
      date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
      const semanaInicio = date.toISOString().slice(0, 10);
      await manager.query('SELECT pg_advisory_xact_lock(hashtext($1))', [
        'avaliacao:' + id,
      ]);
      const repo = manager.getRepository(Avaliacao);
      if (await repo.existsBy({ alunoId: id, semanaInicio }))
        throw new ConflictException(
          'Já existe uma avaliação para este aluno nesta semana.',
        );
      return repo.save({
        alunoId: id,
        treinadorId: treinador.id,
        ...dados,
        semanaInicio,
        ...this.usuarioService.calcularIMC(dados.peso, dados.altura),
        origem: 'MANUAL',
      });
    });
  }

  async delete(id: number, treinador: AuthenticatedUser): Promise<void> {
    await this.usuarioRepository.manager.transaction(async (manager) => {
      await this.requireLinked(id, treinador, manager);
      await manager.query(
        'DELETE FROM tb_treinador_aluno WHERE "alunoId" = $1 AND "treinadorId" = $2',
        [id, treinador.id],
      );
    });
  }

  async addExercise(
    id: number,
    exercicioId: number,
    treinador: AuthenticatedUser,
  ) {
    await this.usuarioRepository.manager.transaction(async (manager) => {
      await this.requireLinked(id, treinador, manager);
      if (
        !(await manager.getRepository(Exercicio).existsBy({ id: exercicioId }))
      )
        throw new NotFoundException('Exercício não encontrado.');
      await manager.query(
        'INSERT INTO tb_usuarios_exercicio_tb_exercicios ("tbUsuariosId", "tbExerciciosId") VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [id, exercicioId],
      );
    });
    return this.findById(id, treinador);
  }

  async removeExercise(
    id: number,
    exercicioId: number,
    treinador: AuthenticatedUser,
  ): Promise<void> {
    await this.usuarioRepository.manager.transaction(async (manager) => {
      await this.requireLinked(id, treinador, manager);
      await manager.query(
        'DELETE FROM tb_usuarios_exercicio_tb_exercicios WHERE "tbUsuariosId" = $1 AND "tbExerciciosId" = $2',
        [id, exercicioId],
      );
    });
  }
}
