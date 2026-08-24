#!/bin/bash
# Roda o schema de sql/ na ordem de dependência real (não a ordem alfabética
# que o docker-entrypoint-initdb.d usaria se os .sql estivessem soltos
# aqui) — por isso os arquivos ficam montados em /sql (fora de
# docker-entrypoint-initdb.d) e só este script, que sabe a ordem certa,
# fica na pasta que o Postgres executa automaticamente.
#
# orders.sql referencia products(id) via FK, então precisa rodar depois de
# init.sql. 003_rls_policies.sql é específico do Supabase (RLS via
# PostgREST) e não se aplica aqui — ver nota no próprio arquivo.
set -e

# init.sql usa uuid_generate_v4() mas só orders.sql cria a extensão — e
# orders.sql só pode rodar DEPOIS de init.sql (FK em products). Criar aqui
# resolve a dependência circular sem reescrever os arquivos históricos.
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  -c 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'

FILES=(
  "init.sql"
  "orders.sql"
  "easter_customization.sql"
  "002_payment_flow.sql"
  "004_auth_users.sql"
  "005_payment_events_status_key.sql"
  "006_customers.sql"
  "007_delivery_and_stock.sql"
  "008_special_categories.sql"
)

for f in "${FILES[@]}"; do
  echo "==> Aplicando sql/$f"
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f "/sql/$f"
done

echo "==> Schema aplicado com sucesso."
