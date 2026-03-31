# Setup da API de Produtos

## 1. Variáveis de Ambiente

Adicione ao seu `.env`:

```env
NEXT_PUBLIC_CONNECTION_DB_URL=postgresql://user:password@host:port/database
NEXT_PUBLIC_API_URL=http://localhost:3000
```

> **Nota**: Use o URL do Supabase que já está configurado em um `.env` existente.

## 2. Criar a Tabela no Banco de Dados

Execute o script SQL em `sql/init.sql`:

### Opção 1: Via Supabase Dashboard

1. Vá para https://app.supabase.com
2. Selecione seu projeto
3. Abra o SQL Editor
4. Cole o conteúdo de `sql/init.sql`
5. Clique em "Run"

### Opção 2: Via Terminal (psql)

```bash
psql -U postgres -h your-db-host -d postgres -f sql/init.sql
```

## 3. Dependências

As dependências já foram instaladas:

```bash
pnpm add pg @types/pg dotenv
```

## 4. Estrutura de Arquivos

```
src/
├── app/api/products/
│   ├── route.ts          # GET, POST
│   └── [id]/route.ts     # PATCH, DELETE
├── lib/
│   └── db.ts             # Configuração do banco
├── api/
│   └── products.ts       # Cliente HTTP (frontend)
└── types/
    └── api.ts            # Tipos TypeScript

sql/
└── init.sql              # Script para criar tabela

API_DOCS.md               # Documentação completa
test-api.sh              # Script de testes
```

## 5. Como Usar

### No Frontend (Componentes React)

```typescript
import { productApi } from "@/api/products";

// Listar produtos
const products = await productApi.getAll();

// Criar
const newProduct = await productApi.create({
  name: "Novo Produto",
  category: "chocolates",
  price: 25.0,
  image: "https://...",
  description: "Descrição",
});

// Atualizar
await productApi.update(id, { price: 30.0 });

// Deletar
await productApi.delete(id);
```

### Com cURL (Testes)

```bash
# Listar todos
curl http://localhost:3000/api/products

# Criar
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","category":"doces","price":25,"image":"https://...","description":"Test"}'

# Atualizar
curl -X PATCH http://localhost:3000/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{"price":30}'

# Deletar
curl -X DELETE http://localhost:3000/api/products/1
```

## 6. Endpoints Disponíveis

| Método | Endpoint            | Descrição                          |
| ------ | ------------------- | ---------------------------------- |
| GET    | `/api/products`     | Listar todos (com filtro opcional) |
| POST   | `/api/products`     | Criar novo                         |
| PATCH  | `/api/products/:id` | Atualizar                          |
| DELETE | `/api/products/:id` | Deletar                            |

## 7. Tratamento de Erros

Todos os endpoints retornam um padrão consistente:

```json
{
  "success": true/false,
  "data": {...} ou null,
  "error": "mensagem de erro" ou undefined
}
```

## 8. Validações

### POST (Criar)

- Todos os campos são obrigatórios
- `price` deve ser um número válido
- `name` não pode ser vazio

### PATCH (Atualizar)

- Pelo menos um campo deve ser fornecido
- ID deve ser válido
- Produto deve existir

### DELETE (Deletar)

- ID deve ser válido
- Produto deve existir

## 9. Performance

- Índices criados em: `category` e `created_at`
- Queries ordenadas por `created_at DESC`
- Pool de conexões configurado automaticamente

## 10. Segurança (Próximas Etapas)

- [ ] Adicionar autenticação JWT
- [ ] Adicionar validação de permissões
- [ ] Rate limiting
- [ ] CORS configurado corretamente
- [ ] Validação com Zod/Joi
- [ ] Sanitização de inputs

## 11. Testing

Execute o script de teste:

```bash
bash test-api.sh
```

Ou use Postman/Insomnia com os exemplos em `API_DOCS.md`

## 12. Troubleshooting

**Erro de conexão com BD:**

- Verifique se `NEXT_PUBLIC_CONNECTION_DB_URL` está correto
- Teste a conexão com: `psql -U postgres -h host -d database`
- Certifique-se de que SSL está habilitado (já configurado)

**Tabela não existe:**

- Execute `sql/init.sql` novamente
- Verifique no Supabase Dashboard se a tabela foi criada

**CORS error:**

- Adicione headers CORS se necessário (frontend e backend em domínios diferentes)

---

Para mais detalhes, veja `API_DOCS.md`
