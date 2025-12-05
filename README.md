# 🚗 Sistema de Controle de Frota de Veículos

Sistema completo de gerenciamento de frota de veículos com controle de status, reservas, retiradas, devoluções e identificação automática de condutores em infrações.

## 🚀 Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Authentication)
- **Roteamento**: React Router v6
- **Estilização**: CSS Vanilla com design moderno
- **Data**: date-fns

## 📋 Funcionalidades

### ADMIN
- ✅ Dashboard com estatísticas em tempo real
- ✅ CRUD de veículos (cadastrar, editar, excluir)
- ✅ Cadastro de infrações com identificação automática de condutor
- ✅ Gerenciamento de usuários
- ✅ Visualização de todo histórico de uso

### USER
- ✅ Visualizar frota com filtros (Disponível, Em Uso, Reservado)
- ✅ Reservar veículo
- ✅ Registrar saída (retirada)
- ✅ Registrar retorno (devolução)
- ✅ Ver histórico próprio
- ✅ Ver infrações identificadas

## 🛠️ Configuração

### 1. Pré-requisitos

- Node.js 18+ instalado
- Conta no Supabase (gratuita)

### 2. Configurar Supabase

1. Acesse [supabase.com](https://supabase.com) e faça login
2. Seu projeto já está configurado com as credenciais no `.env.local`
3. Vá em **SQL Editor** e execute o script `supabase_schema.sql`
4. Aguarde a execução completa (cria tabelas, triggers, views, RLS)

### 3. Instalar Dependências

```bash
npm install
```

### 4. Criar Primeiro Usuário (ADMIN)

O primeiro usuário criado será automaticamente ADMIN!

1. Acesse http://localhost:5173
2. Clique em "Criar nova conta"
3. Preencha os dados e crie a conta
4. Este usuário terá permissões de ADMIN automaticamente

## 🚀 Executar Projeto

### Desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:5173

### Build para Produção

```bash
npm run build
```

### Preview da Build

```bash
npm run preview
```

## 📁 Estrutura do Banco de Dados

### Tabelas

1. **users** (Condutores)
   - Informações do usuário
   - Permissões (ADMIN/USER)
   - Primeiro usuário vira ADMIN automaticamente

2. **vehicles** (Veículos)
   - Placa, Renavam, Modelo, Empresa
   - Status: Disponível, Em Uso, Reservado

3. **vehicle_usage** (Retirada de Veículos)
   - Controle de reservas, saídas e devoluções
   - Datas e horários
   - Status atualizado automaticamente

4. **infractions** (Infrações)
   - Dados completos da infração
   - **Identificação automática do condutor**
   - Condutor identificado pela data da infração

### Lógica Automática

#### 1. Atualização de Status do Veículo
- **Reserva** → Status muda para "Reservado"
- **Saída** → Status muda para "Em Uso"
- **Devolução** → Status muda para "Disponível"

#### 2. Identificação Automática de Condutor
Quando uma infração é cadastrada:
1. Sistema busca quem estava usando o veículo na data da infração
2. Preenche automaticamente o campo "Infrator"
3. Marca "Condutor Identificado" como "SIM"
4. Se não encontrar → marca como "NÃO IDENTIFICADO"

#### 3. Primeiro Usuário = ADMIN
O primeiro usuário cadastrado no sistema recebe automaticamente permissões de ADMIN.

## 🎨 Design

- **Dark mode** por padrão
- **Cores por status**:
  - 🟢 Verde: Disponível
  - 🟡 Amarelo: Reservado
  - 🔴 Vermelho: Em Uso
- Gradientes e glassmorphism
- Animações suaves
- Design responsivo (mobile + web)

## 🔐 Permissões

### ADMIN pode:
- Cadastrar, editar e excluir veículos
- Cadastrar infrações
- Gerenciar usuários
- Ver todo o histórico
- Acessar dashboard completo

### USER pode:
- Visualizar frota
- Reservar veículos disponíveis
- Registrar saída (se reservou)
- Registrar devolução (se está usando)
- Ver próprio histórico
- Ver próprias infrações

### USER NÃO pode:
- Editar veículos
- Cadastrar infrações
- Ver dados de outros usuários
- Excluir dados

## 📝 Próximos Passos

As seguintes funcionalidades estão com páginas placeholder e podem ser implementadas:

1. **CRUD Completo de Veículos** (página criada, precisa implementar)
2. **Cadastro de Infrações** (página criada, precisa implementar)
3. **Gerenciamento de Usuários** (página criada, precisa implementar)
4. **Visualização de Frota para USER** (página criada, precisa implementar)
5. **Histórico de Uso** (página criada, precisa implementar)
6. **Minhas Infrações** (página criada, precisa implementar)

## 🐛 Troubleshooting

### Erro ao executar SQL
- Certifique-se de executar TODO o script `supabase_schema.sql`
- Verifique se não há erros no console do SQL Editor

### Primeiro usuário não é ADMIN
- Verifique se o trigger `trigger_first_user_admin` foi criado
- Delete o usuário e crie novamente (sendo o primeiro)

### Erro de autenticação
- Verifique se as credenciais no `.env.local` estão corretas
- Confirme que o projeto Supabase está ativo

## 📄 Arquivos Importantes

- `supabase_schema.sql` - Schema completo do banco de dados
- `.env.local` - Credenciais do Supabase (já configurado)
- `src/contexts/AuthContext.tsx` - Gerenciamento de autenticação
- `src/pages/Dashboard.tsx` - Dashboard do ADMIN
- `src/App.tsx` - Roteamento principal

## 🎯 Status do Projeto

| Componente | Status |
|------------|--------|
| Configuração do Projeto | ✅ Completo |
| Banco de Dados | ✅ Completo |
| Autenticação | ✅ Completo |
| Primeiro Usuário = ADMIN | ✅ Completo |
| Layout e Navegação | ✅ Completo |
| Dashboard ADMIN | ✅ Completo |
| Login/Cadastro | ✅ Completo |
| CRUD Veículos | 🔄 Página criada (implementar) |
| Cadastro Infrações | 🔄 Página criada (implementar) |
| Gestão Usuários | 🔄 Página criada (implementar) |
| Visualização Frota (USER) | 🔄 Página criada (implementar) |
| Histórico de Uso | 🔄 Página criada (implementar) |
| Minhas Infrações | 🔄 Página criada (implementar) |

---

**Sistema pronto para uso e desenvolvimento! 🎉**

O core do sistema está funcionando. As páginas restantes podem ser implementadas conforme necessidade.
