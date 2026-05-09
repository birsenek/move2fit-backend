-- Move2Fit – DDL PostgreSQL
-- Este arquivo é referência. Com synchronize:true o TypeORM cria o schema automaticamente.
-- Use este script apenas em ambientes sem synchronize (ex.: produção).

CREATE TABLE IF NOT EXISTS tb_categorias (
    id          SERIAL PRIMARY KEY,
    nome        VARCHAR(255)  NOT NULL,
    descricao   VARCHAR(255)  NOT NULL,
    icone       VARCHAR(5000)
);

CREATE TABLE IF NOT EXISTS tb_exercicios (
    id           SERIAL PRIMARY KEY,
    nome         VARCHAR(100)  NOT NULL,
    descricao    VARCHAR(255)  NOT NULL,
    carga        DECIMAL(6,2),
    repeticao    INT,
    tempo        VARCHAR(10),
    foto         VARCHAR(5000),
    "categoriaId" INT REFERENCES tb_categorias(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tb_usuarios (
    id            SERIAL PRIMARY KEY,
    nome          VARCHAR(255) NOT NULL,
    usuario       VARCHAR(255) NOT NULL UNIQUE,
    senha         VARCHAR(255) NOT NULL,
    foto          VARCHAR(5000),
    peso          DECIMAL(10,2),
    altura        DECIMAL(10,2),
    imc           DECIMAL(10,2),
    classificacao VARCHAR(255),
    ultimo_login  DATE,
    dias_seguidos INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS tb_alunos (
    id            SERIAL PRIMARY KEY,
    nome          VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    foto          VARCHAR(5000),
    peso          DECIMAL(10,2) NOT NULL,
    altura        DECIMAL(10,2) NOT NULL,
    imc           DECIMAL(10,2) NOT NULL,
    classificacao VARCHAR(255)
);

-- Tabela de junção gerada pelo TypeORM para Aluno <-> Exercicio.
-- Nome e colunas seguem o padrão DefaultNamingStrategy do TypeORM 0.3.x.
-- Se o nome não bater, execute \dt no psql após subir o servidor para confirmar.
CREATE TABLE IF NOT EXISTS "tb_alunos_exercicio_tb_exercicios" (
    "tbAlunosId"     INT NOT NULL REFERENCES tb_alunos(id)     ON DELETE CASCADE,
    "tbExerciciosId" INT NOT NULL REFERENCES tb_exercicios(id) ON DELETE CASCADE,
    PRIMARY KEY ("tbAlunosId", "tbExerciciosId")
);
