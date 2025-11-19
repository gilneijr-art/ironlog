# IronLog 🏋️

Aplicativo completo de registro de treinos de musculação, inspirado no Hevy, com tema escuro moderno (vermelho/preto/cinza) e **100% gratuito**.

## ✨ Funcionalidades

### Core
- ✅ **Registro de Séries** - Carga, repetições, RPE e marcação de falha
- ✅ **Timer de Descanso** - Inicia automaticamente após cada série
- ✅ **Duplicar Série** - Repita a última série com um toque
- ✅ **Treino Ativo** - Interface otimizada para uso durante o treino

### Biblioteca
- ✅ **39 Exercícios Pré-cadastrados** - Organizados em 8 grupos musculares
- ✅ **Busca Rápida** - Encontre exercícios instantaneamente
- ✅ **Exercícios Personalizados** - Crie seus próprios exercícios

### Rotinas
- ✅ **Rotinas Ilimitadas** - Crie quantas rotinas quiser
- ✅ **Duplicar Rotinas** - Clone rotinas existentes
- ✅ **Gerenciamento Completo** - Criar, editar e deletar

### Histórico & Estatísticas
- ✅ **Histórico Completo** - Timeline de todos os treinos
- ✅ **PRs Automáticos** - Recordes pessoais calculados automaticamente
- ✅ **Gráficos de Progressão** - Visualize sua evolução
- ✅ **Estatísticas Detalhadas** - Volume, séries, dias ativos

### Dados & Backup
- ✅ **Export JSON** - Exporte todos os seus dados
- ✅ **PWA** - Funciona offline como app nativo
- ✅ **Modo Offline** - Todos os dados salvos localmente

## 🎨 Design

- **Tema Escuro** com cores personalizadas:
  - Cinza escuro (#1C1C1C) - Background principal
  - Preto (#000000) - Cards e containers
  - Vermelho (#D40000) - Destaques e CTAs
  - Cinza claro (#E0E0E0) - Texto secundário

- **Interface Minimalista** inspirada no Hevy
- **Navegação Inferior** com 4 abas principais
- **Cards Amplos** para fácil interação durante treino

## 🛠️ Tecnologias

- **Frontend**: React 19 + TypeScript + Tailwind CSS 4
- **Backend**: Express + tRPC 11
- **Banco de Dados**: MySQL/TiDB (via Drizzle ORM)
- **Autenticação**: Manus OAuth
- **Gráficos**: Recharts
- **PWA**: Manifest + Service Worker ready

## 📦 Estrutura do Projeto

```
ironlog/
├── client/               # Frontend React
│   ├── src/
│   │   ├── pages/       # Páginas principais
│   │   ├── components/  # Componentes reutilizáveis
│   │   └── lib/         # tRPC client
│   └── public/          # Assets estáticos + manifest.json
├── server/              # Backend Express + tRPC
│   ├── routers/         # Rotas tRPC organizadas
│   ├── db.ts            # Funções de banco de dados
│   └── *.test.ts        # Testes unitários
├── drizzle/             # Schema e migrações
└── scripts/             # Scripts utilitários (seed, etc)
```

## 🚀 Como Executar

1. **Instalar dependências**
   ```bash
   pnpm install
   ```

2. **Configurar banco de dados**
   ```bash
   pnpm db:push
   ```

3. **Popular dados iniciais**
   ```bash
   node scripts/seed-exercises.mjs
   ```

4. **Iniciar servidor de desenvolvimento**
   ```bash
   pnpm dev
   ```

5. **Executar testes**
   ```bash
   pnpm test
   ```

## 📱 Grupos Musculares & Exercícios

O aplicativo vem com 39 exercícios pré-cadastrados organizados em:

- **Peito** - Supino reto, inclinado, crucifixo, etc.
- **Costas** - Barra fixa, remadas, levantamento terra
- **Ombros** - Desenvolvimento, elevações
- **Bíceps** - Roscas direta, alternada, martelo
- **Tríceps** - Tríceps testa, francês, corda
- **Pernas** - Agachamento, leg press, extensora
- **Glúteos** - Elevação pélvica, abdutora
- **Abdômen** - Abdominal supra, infra, prancha

## 🎯 Roadmap Futuro

Sugestões para próximas implementações:

1. **Funcionalidades de Criação**
   - Interface para criar exercícios personalizados
   - Interface para criar e editar rotinas
   - Drag & drop para reordenar exercícios

2. **Melhorias de UX**
   - Filtros avançados no histórico
   - Comparação de treinos
   - Metas e objetivos personalizados

3. **Social & Compartilhamento**
   - Compartilhar rotinas com amigos
   - Templates de rotinas populares
   - Integração com redes sociais

## 📄 Licença

Este projeto foi criado como demonstração e está disponível para uso livre.

## 🙏 Créditos

Desenvolvido com base na especificação inspirada no aplicativo Hevy, mas com implementação 100% original e gratuita.

---

**IronLog** - Registre seus treinos de forma rápida, simples e gratuita! 💪

## 🆕 Novidades v2.0

### Criação e Edição Avançada
- ✅ **Modal de Exercícios Personalizados** - Crie e edite seus próprios exercícios com equipamento e grupo muscular
- ✅ **Editor de Rotinas Completo** - Interface intuitiva para criar e editar rotinas
- ✅ **Drag & Drop** - Reordene exercícios nas rotinas arrastando e soltando
- ✅ **Botão Iniciar Direto** - Comece treinos diretamente da lista de rotinas

### Filtros e Visualização
- ✅ **Filtros de Período** - Últimos 7 dias, mês, 3 meses ou ano
- ✅ **Filtros por Grupo Muscular** - Veja treinos específicos de cada grupo
- ✅ **Contador de Resultados** - Saiba quantos treinos foram encontrados

### Sistema de Metas
- ✅ **4 Tipos de Metas** - Peso máximo, repetições, volume semanal, frequência
- ✅ **Dashboard de Progresso** - Visualize quantas metas foram atingidas
- ✅ **Barra de Progresso** - Acompanhe o progresso de cada meta individualmente
- ✅ **Metas por Exercício** - Defina metas específicas para cada exercício

### Melhorias de UX
- ✅ **Links Rápidos no Perfil** - Acesso direto ao histórico e metas
- ✅ **Validações Aprimoradas** - Feedback claro em todas as operações
- ✅ **Testes Unitários** - Cobertura completa das novas funcionalidades
