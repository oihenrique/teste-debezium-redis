-- ENUM para status da cesta
CREATE TYPE status_cesta AS ENUM ('aberta', 'fechada', 'cancelada');

-- Tabela de produtos
CREATE TABLE produtos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  preco NUMERIC(10, 2) NOT NULL,
  ean VARCHAR(20) UNIQUE NOT NULL
);

-- Tabela de cestas
CREATE TABLE cestas (
  id SERIAL PRIMARY KEY,
  caixa_id INTEGER NOT NULL,
  status status_cesta NOT NULL DEFAULT 'aberta',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela associativa de produtos na cesta
CREATE TABLE cesta_produtos (
  id SERIAL PRIMARY KEY,
  cesta_id INTEGER NOT NULL REFERENCES cestas(id) ON DELETE CASCADE,
  produto_id INTEGER NOT NULL REFERENCES produtos(id),
  quantidade INTEGER NOT NULL DEFAULT 1,
  preco_unitario NUMERIC(10, 2) NOT NULL
);
