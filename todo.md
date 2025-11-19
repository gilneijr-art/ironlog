# IronLog - TODO

## Design e Tema
- [x] Configurar tema escuro com cores personalizadas (preto/cinza/vermelho)
- [x] Configurar tipografia e espaçamentos
- [x] Criar componentes base de UI

## Banco de Dados
- [x] Schema de usuários (User)
- [x] Schema de exercícios (Exercise)
- [x] Schema de rotinas (Routine)
- [x] Schema de sessões de treino (WorkoutSession)
- [x] Schema de séries (Set)
- [x] Schema de recordes pessoais (PR)
- [x] Schema de grupos musculares (MuscleGroup)

## Backend e APIs
- [x] Rotas de exercícios (listar, criar, editar, deletar)
- [x] Rotas de rotinas (listar, criar, editar, deletar, duplicar)
- [x] Rotas de treino ativo (iniciar, adicionar série, finalizar)
- [x] Rotas de histórico (listar sessões, detalhes)
- [x] Rotas de estatísticas (PRs, volume, gráficos)
- [x] Rotas de perfil (dados do usuário, métricas gerais)
- [x] Sistema de backup/export JSON
- [x] Cálculo automático de PRs

## Frontend - Navegação
- [x] Menu inferior com 4 abas (Home, Rotinas, Exercícios, Perfil)
- [x] Estrutura de rotas

## Frontend - Telas
- [x] Tela Home (treino ativo ou botão iniciar)
- [x] Tela de Rotinas (lista, criar, editar, duplicar)
- [x] Tela de Exercícios (biblioteca com grupos musculares)
- [x] Tela de Treino Ativo (cards de exercícios, timer)
- [x] Tela de Histórico (timeline com métricas)
- [x] Tela de Estatísticas de Exercícios (PRs, gráficos)
- [x] Tela de Perfil (resumo geral)

## Funcionalidades Core
- [x] Registro de séries (carga, reps, RPE, falha)
- [x] Timer de descanso automático
- [x] Duplicar série anterior
- [ ] Drag & drop para ordenar exercícios em rotinas
- [x] Pesquisa rápida de exercícios
- [ ] Criar exercício personalizado
- [ ] Filtros no histórico
- [x] Gráficos de progressão (linha e coluna)

## Dados Iniciais
- [x] Base de exercícios pré-cadastrados
- [x] Grupos musculares padrão

## Funcionalidades Avançadas
- [x] Modo offline (PWA)
- [x] Backup automático local (via export)
- [x] Export/Import JSON

## Testes
- [x] Testes unitários das rotas principais
- [x] Testes de fluxo completo

## Deploy
- [x] Criar checkpoint final
- [x] Criar repositório GitHub
- [x] Enviar código para GitHub

## Melhorias v2.0

### Criação e Edição
- [x] Modal para criar exercício personalizado
- [x] Modal para editar exercício existente
- [x] Modal para criar rotina
- [x] Modal para editar rotina
- [x] Adicionar exercícios à rotina
- [x] Remover exercícios da rotina
- [x] Drag & drop para reordenar exercícios na rotina

### Filtros e Visualização
- [x] Filtros no histórico por período (semana, mês, ano)
- [x] Filtros no histórico por grupo muscular
- [ ] Filtros no histórico por exercício específico
- [ ] Comparação entre dois treinos
- [ ] Visualização de tendências

### Sistema de Metas
- [x] Criar meta de peso para exercício
- [x] Criar meta de repetições
- [x] Criar meta de volume semanal
- [x] Criar meta de frequência de treinos
- [x] Dashboard de progresso das metas
- [ ] Notificações de metas atingidas (requer backend job)

### Testes v2.0
- [x] Testes para CRUD de exercícios
- [x] Testes para CRUD de rotinas
- [x] Testes para sistema de metas
