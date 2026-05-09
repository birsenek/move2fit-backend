-- Move2Fit – Dados de exemplo (PostgreSQL)
--
-- ANTES DE EXECUTAR: gere o hash bcrypt da senha padrão (Senha@123) e
-- substitua todas as ocorrências de HASH_SENHA pelo valor gerado:
--
--   node -e "require('bcrypt').hash('Senha@123', 10).then(h => console.log(h))"
--
-- Depois execute:
--   psql -U <usuario> -d move2fit -f sql/seed.sql

BEGIN;

-- ─── CATEGORIAS ──────────────────────────────────────────────────────────────

INSERT INTO tb_categorias (nome, descricao, icone) VALUES
  ('Musculação',    'Exercícios com carga para ganho de massa muscular',       'https://img.icons8.com/fluency/96/dumbbell.png'),
  ('Cardio',        'Atividades aeróbicas para resistência cardiovascular',    'https://img.icons8.com/fluency/96/running.png'),
  ('Yoga',          'Prática de posturas e respiração para equilíbrio físico', 'https://img.icons8.com/fluency/96/yoga.png'),
  ('Pilates',       'Fortalecimento do core e melhora da postura',             'https://img.icons8.com/fluency/96/pilates.png'),
  ('Crossfit',      'Treinos funcionais de alta intensidade',                  'https://img.icons8.com/fluency/96/crossfit.png'),
  ('Natação',       'Exercícios aquáticos de baixo impacto',                   'https://img.icons8.com/fluency/96/swimming.png'),
  ('Ciclismo',      'Pedaladas indoor ou ao ar livre para condicionamento',    'https://img.icons8.com/fluency/96/cycling.png'),
  ('Funcional',     'Movimentos que imitam atividades do cotidiano',           'https://img.icons8.com/fluency/96/functional.png'),
  ('Alongamento',   'Exercícios de flexibilidade e prevenção de lesões',       'https://img.icons8.com/fluency/96/stretching.png'),
  ('HIIT',          'Treino intervalado de alta intensidade',                  'https://img.icons8.com/fluency/96/fire.png');

-- ─── EXERCÍCIOS ──────────────────────────────────────────────────────────────
-- categoriaId: 1=Musculação 2=Cardio 3=Yoga 4=Pilates 5=Crossfit
--              6=Natação 7=Ciclismo 8=Funcional 9=Alongamento 10=HIIT

INSERT INTO tb_exercicios (nome, descricao, carga, repeticao, tempo, foto, "categoriaId") VALUES
  ('Supino Reto',               'Exercício para peitoral com barra em banco horizontal',          80.00,  12, '00:04',  'https://img.icons8.com/fluency/96/bench-press.png',     1),
  ('Corrida na Esteira',        'Corrida em ritmo moderado para condicionamento aeróbico',         NULL,  NULL, '00:30', 'https://img.icons8.com/fluency/96/treadmill.png',        2),
  ('Postura da Árvore',         'Equilíbrio em uma perna com braços estendidos acima da cabeça',   NULL,  NULL, '00:05', 'https://img.icons8.com/fluency/96/yoga.png',              3),
  ('Prancha Abdominal',         'Isometria para fortalecimento do core',                           NULL,  NULL, '00:03', 'https://img.icons8.com/fluency/96/plank.png',             4),
  ('Burpee',                    'Movimento completo: agachamento, flexão e salto',                  NULL,  15,   '00:05', 'https://img.icons8.com/fluency/96/burpee.png',            5),
  ('Nado Crawl',                'Estilo de natação alternando braços com respiração lateral',       NULL,  NULL, '00:30', 'https://img.icons8.com/fluency/96/swimming.png',          6),
  ('Ciclismo Indoor',           'Pedalada em ritmo variado na bicicleta ergométrica',               NULL,  NULL, '00:45', 'https://img.icons8.com/fluency/96/exercise-bike.png',     7),
  ('Agachamento com Kettlebell','Agachamento livre segurando kettlebell à frente do corpo',         24.00,  20,   '00:06', 'https://img.icons8.com/fluency/96/kettlebell.png',        8),
  ('Alongamento Isquiotibiais', 'Extensão dos isquiotibiais sentado com leve flexão do tronco',    NULL,  NULL, '00:03', 'https://img.icons8.com/fluency/96/stretching.png',        9),
  ('Polichinelo',               'Saltos com abertura simultânea de pernas e braços',                NULL,  30,   '00:04', 'https://img.icons8.com/fluency/96/jumping-jacks.png',    10);

-- ─── USUÁRIOS ────────────────────────────────────────────────────────────────
-- Senha padrão: Senha@123  →  substitua HASH_SENHA pelo hash bcrypt gerado
-- IMC = peso / (altura * altura), arredondado em 2 casas

INSERT INTO tb_usuarios (nome, usuario, senha, foto, peso, altura, imc, classificacao) VALUES
  ('Carlos Oliveira',   'carlos.oliveira@email.com',   'HASH_SENHA', 'https://i.pravatar.cc/150?img=11', 78.00, 1.80, 24.07, 'Peso normal'),
  ('Ana Lima',          'ana.lima@email.com',           'HASH_SENHA', 'https://i.pravatar.cc/150?img=12', 62.00, 1.65, 22.77, 'Peso normal'),
  ('Roberto Santos',    'roberto.santos@email.com',     'HASH_SENHA', 'https://i.pravatar.cc/150?img=13', 95.00, 1.78, 29.97, 'Sobrepeso'),
  ('Fernanda Costa',    'fernanda.costa@email.com',     'HASH_SENHA', 'https://i.pravatar.cc/150?img=14', 55.00, 1.62, 20.96, 'Peso normal'),
  ('Marcos Pereira',    'marcos.pereira@email.com',     'HASH_SENHA', 'https://i.pravatar.cc/150?img=15', 112.00,1.83, 33.43, 'Obesidade Grau I'),
  ('Juliana Alves',     'juliana.alves@email.com',      'HASH_SENHA', 'https://i.pravatar.cc/150?img=16', 48.00, 1.60, 18.75, 'Peso normal'),
  ('Ricardo Fernandes', 'ricardo.fernandes@email.com',  'HASH_SENHA', 'https://i.pravatar.cc/150?img=17', 88.00, 1.75, 28.73, 'Sobrepeso'),
  ('Patricia Rocha',    'patricia.rocha@email.com',     'HASH_SENHA', 'https://i.pravatar.cc/150?img=18', 42.00, 1.58, 16.83, 'Abaixo do peso'),
  ('Eduardo Moura',     'eduardo.moura@email.com',      'HASH_SENHA', 'https://i.pravatar.cc/150?img=19', 105.00,1.90, 29.10, 'Sobrepeso'),
  ('Camila Souza',      'camila.souza@email.com',       'HASH_SENHA', 'https://i.pravatar.cc/150?img=20', 70.00, 1.72, 23.67, 'Peso normal');

-- ─── ALUNOS ──────────────────────────────────────────────────────────────────

INSERT INTO tb_alunos (nome, email, foto, peso, altura, imc, classificacao) VALUES
  ('Lucas Martins',     'lucas.martins@email.com',    'https://i.pravatar.cc/150?img=1',  72.00, 1.76, 23.24, 'Peso normal'),
  ('Beatriz Carvalho',  'beatriz.carvalho@email.com', 'https://i.pravatar.cc/150?img=2',  58.00, 1.64, 21.57, 'Peso normal'),
  ('Felipe Gomes',      'felipe.gomes@email.com',     'https://i.pravatar.cc/150?img=3',  98.00, 1.82, 29.59, 'Sobrepeso'),
  ('Amanda Ribeiro',    'amanda.ribeiro@email.com',   'https://i.pravatar.cc/150?img=4',  50.00, 1.60, 19.53, 'Peso normal'),
  ('Gustavo Ferreira',  'gustavo.ferreira@email.com', 'https://i.pravatar.cc/150?img=5', 115.00, 1.85, 33.61, 'Obesidade Grau I'),
  ('Larissa Mendes',    'larissa.mendes@email.com',   'https://i.pravatar.cc/150?img=6',  44.00, 1.57, 17.85, 'Abaixo do peso'),
  ('Thiago Barbosa',    'thiago.barbosa@email.com',   'https://i.pravatar.cc/150?img=7',  83.00, 1.79, 25.92, 'Sobrepeso'),
  ('Isabela Castro',    'isabela.castro@email.com',   'https://i.pravatar.cc/150?img=8',  65.00, 1.68, 23.03, 'Peso normal'),
  ('Bruno Nunes',       'bruno.nunes@email.com',      'https://i.pravatar.cc/150?img=9',  90.00, 1.77, 28.73, 'Sobrepeso'),
  ('Sofia Teixeira',    'sofia.teixeira@email.com',   'https://i.pravatar.cc/150?img=10', 52.00, 1.63, 19.57, 'Peso normal');

-- ─── ALUNO ↔ EXERCÍCIO ───────────────────────────────────────────────────────
-- Tabela de junção criada pelo TypeORM.
-- Se as colunas ou o nome da tabela não baterem, execute no psql:
--   \dt *aluno*   e   \d "tb_alunos_exercicio_tb_exercicios"

INSERT INTO "tb_alunos_exercicio_tb_exercicios" ("tbAlunosId", "tbExerciciosId") VALUES
  (1, 1), (1, 2),         -- Lucas: Supino + Corrida
  (2, 3), (2, 9),         -- Beatriz: Yoga + Alongamento
  (3, 5), (3, 8), (3, 10),-- Felipe: Burpee + Kettlebell + HIIT
  (4, 3), (4, 4),         -- Amanda: Yoga + Prancha
  (5, 1), (5, 8),         -- Gustavo: Supino + Funcional
  (6, 2), (6, 9),         -- Larissa: Corrida + Alongamento
  (7, 5), (7, 7), (7, 10),-- Thiago: Burpee + Ciclismo + HIIT
  (8, 4), (8, 6),         -- Isabela: Prancha + Natação
  (9, 1), (9, 5), (9, 8), -- Bruno: Supino + Burpee + Kettlebell
  (10, 3),(10, 9);        -- Sofia: Yoga + Alongamento

COMMIT;
