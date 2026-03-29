#!/bin/bash

# Script para testar os endpoints da API de produtos
# Use: bash test-api.sh

BASE_URL="http://localhost:3000/api/products"

echo "=========================================="
echo "Testando API de Produtos"
echo "=========================================="

# 1. GET - Listar todos os produtos
echo ""
echo "1. GET - Listar todos os produtos"
echo "---"
curl -X GET "$BASE_URL" \
  -H "Content-Type: application/json"
echo ""

# 2. GET - Filtrar por categoria
echo ""
echo "2. GET - Filtrar por categoria (chocolates)"
echo "---"
curl -X GET "$BASE_URL?category=chocolates" \
  -H "Content-Type: application/json"
echo ""

# 3. POST - Criar novo produto
echo ""
echo "3. POST - Criar novo produto"
echo "---"
PRODUCT_ID=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Produto Teste",
    "category": "nodoses",
    "price": 99.99,
    "image": "https://static.photos/food/400x400/18",
    "description": "Produto de teste para a API"
  }' | jq '.data.id')

echo "Produto criado com ID: $PRODUCT_ID"
echo ""

# 4. PATCH - Atualizar produto
echo ""
echo "4. PATCH - Atualizar produto"
echo "---"
curl -X PATCH "$BASE_URL/$PRODUCT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 199.99,
    "description": "Descrição atualizada"
  }'
echo ""

# 5. DELETE - Deletar produto
echo ""
echo "5. DELETE - Deletar produto"
echo "---"
curl -X DELETE "$BASE_URL/$PRODUCT_ID" \
  -H "Content-Type: application/json"
echo ""

echo ""
echo "=========================================="
echo "Testes concluídos!"
echo "=========================================="
