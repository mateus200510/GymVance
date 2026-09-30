# GymVance - Blueprint Futuro: API + Banco de Dados

> Documento gerado após auditoria completa do código atual (Expo SDK 57, React Native 0.86, armazenamento 100% local via AsyncStorage).

---

## A. Entidades Reais Encontradas no Código

### 1. User (Usuário/Conta)
**Finalidade**: Autenticação local e identificação do usuário.
**Campos**:
| Campo | Tipo | Obrigatório | Default | Validação |
|-------|------|-------------|---------|-----------|
| email | string (PK) | Sim | - | Email válido, único, lowercase |
| senha | string | Sim | - | Mín. 6 chars (hash no futuro) |
| criadaEm | ISO string | Sim | now() | - |

**Relacionamentos**: 1 User → 1 Profile, 1 User → N WorkoutHistory, 1 User → N ProgressPhotos

---

### 2. Profile (Perfil do Usuário)
**Finalidade**: Dados pessoais, preferências e métricas base.
**Campos**:
| Campo | Tipo | Obrigatório | Default | Validação |
|-------|------|-------------|---------|-----------|
| email | string (FK) | Sim | - | Referência a User |
| nome | string | Não | '' | Trim, max 100 |
| bio | string | Não | '' | Max 500 |
| genero | enum | Não | null | 'Homem' \| 'Mulher' |
| dataNascimento | date (YYYY-MM-DD) | Não | null | Data válida, passado |
| peso | number | Não | null | > 0 |
| pesoUnidade | enum | Não | 'kg' | 'kg' \| 'lb' |
| altura | number | Não | null | > 0 |
| alturaUnidade | enum | Não | 'cm' | 'cm' \| 'in' |
| cintura | number | Não | null | > 0 |
| braco | number | Não | null | > 0 |
| peito | number | Não | null | > 0 |
| kcalMeta | int | Não | null | > 0 |
| bpmBase | int | Não | null | > 0 |
| foto | string (uri) | Não | null | file:// local |
| onboardingCompleto | boolean | Não | false | - |

**Dados derivados**: idade (calculada), IMC (calculado)

---

### 3. Workout (Treino/Sessão Concluída)
**Finalidade**: Registro imutável de treino finalizado (histórico).
**Campos**:
| Campo | Tipo | Obrigatório | Default | Validação |
|-------|------|-------------|---------|-----------|
| id | string (PK) | Sim | uuid | - |
| userEmail | string (FK) | Sim | - | Referência a User |
| treino | string | Sim | 'Sem título' | Trim, max 100 |
| data | ISO string | Sim | now() | - |
| duracao | string (HH:MM:SS) | Sim | '00:00:00' | Formato válido |
| exercicios | JSON array | Sim | [] | Array de WorkoutExercise |

**Nota**: Atualmente salvo como array no AsyncStorage (máx 20 itens). No backend, seria tabela com FK.

---

### 4. WorkoutExercise (Exercício do Treino)
**Finalidade**: Exercício realizado dentro de um treino, com suas séries.
**Campos**:
| Campo | Tipo | Obrigatório | Default |
|-------|------|-------------|---------|
| exercicioId | string | Sim | Ref. Exercise (oficial ou custom) |
| exercicioNome | string | Sim | Nome no momento do treino |
| exercicioIdx | int | Sim | Ordem no treino |
| series | JSON array | Sim | Array de Set |

---

### 5. Set (Série)
**Finalidade**: Série individual com carga, repetições e tipo.
**Campos**:
| Campo | Tipo | Obrigatório | Default | Validação |
|-------|------|-------------|---------|-----------|
| id | string (PK) | Sim | `serie-${timestamp}-${random}` | - |
| tipo | enum | Sim | 'NORMAL' | NORMAL, AQUECIMENTO, PREPARATORIA, RECONHECIMENTO, BACK_OFF, DROPSET, FALHA |
| kg | string | Não | '' | Numérico opcional |
| reps | string | Não | '' | Inteiro opcional |
| concluido | boolean | Não | false | - |
| falhou | boolean | Não | false | Mutex com concluido |
| nota | string | Não | '' | Max 200 |

**Regras de negócio**:
- Apenas séries `NORMAL` contam para numeração visual (#1, #2...)
- `concluido` e `falhou` são mutuamente exclusivos
- IDs estáveis permitem editar/remover sem afetar vizinhas

---

### 6. Exercise (Catálogo de Exercícios)
**Finalidade**: Catálogo oficial (100 itens) + exercícios personalizados do usuário.
**Campos**:
| Campo | Tipo | Obrigatório | Default |
|-------|------|-------------|---------|
| id | string (PK) | Sim | 'ex-XXX' oficial, 'custom-...' user |
| nome | string | Sim | - |
| categoria | enum | Sim | Máquinas, Cabos/Polias, Pesos Livres, Peso Corporal, Personalizados |
| grupoMuscular | enum | Sim | Peito, Costas, Ombros, Bíceps, Tríceps, Pernas, Glúteos, Panturrilhas, Abdômen, CorpoInteiro |
| equipamento | enum | Sim | Máquina, Cabo, Barra, Halteres, Halter, Peso Corporal, Paralelas, Personalizado |
| personalizado | boolean | Sim | false (oficial) / true (user) |
| instrucoes | string | Não | null |
| imagem | string | Não | null |

**Tradução**: Nomes oficiais têm mapa PT/EN em `NOMES_EXERCICIOS_EN`. Personalizados não traduzem.

---

### 7. ProgressPhoto (Foto de Progresso)
**Finalidade**: Registro visual da evolução corporal.
**Campos**:
| Campo | Tipo | Obrigatório | Default |
|-------|------|-------------|---------|
| id | string (PK) | Sim | `${timestamp}-${random}` |
| userEmail | string (FK) | Sim | - |
| uri | string | Sim | file:// local |
| data | ISO string | Sim | now() |
| metadata | JSON | Não | {} (peso, medidas opcionais) |

**Limite**: 30 fotos por usuário (política local).

---

### 8. ActiveSession (Sessão em Andamento - Autosave)
**Finalidade**: Permite retomar treino se app fechar durante sessão.
**Campos**:
| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| titulo | string | Não |
| series | JSON array | Sim |
| exercicios | JSON array | Sim |
| tempo | string | Sim |
| acumuladoMs | number | Sim |
| inicioPeriodo | timestamp | Não |
| proximoId | int | Sim |

**Ciclo de vida**: Criada ao entrar em SessaoAtiva → Autosave 5s → Limpa ao concluir ou descartar.

---

### 9. Streak / Gamificação
**Finalidade**: Sequência de dias consecutivos com treino (Ofensiva).
**Cálculo**: Derivado do `WorkoutHistory` (dias únicos com treino).
**Campos armazenados**: Nenhum (calculado on-demand).
**Exibição**: Streak atual, melhor streak, dias treinados no mês.

---

### 10. Settings (Configurações)
**Finalidade**: Preferências do app.
**Campos**:
| Campo | Tipo | Default |
|-------|------|---------|
| idioma | enum | 'pt' |
| pesoUnidade | enum | 'kg' |
| alturaUnidade | enum | 'cm' |
| planoAtivo | string | null |

---

## B. Esquema de Banco de Dados (PostgreSQL Sugerido)

```sql
-- USERS
CREATE TABLE users (
    email VARCHAR(255) PRIMARY KEY,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROFILES
CREATE TABLE profiles (
    user_email VARCHAR(255) PRIMARY KEY REFERENCES users(email) ON DELETE CASCADE,
    name VARCHAR(100) DEFAULT '',
    bio TEXT DEFAULT '',
    gender VARCHAR(20) CHECK (gender IN ('Homem','Mulher')),
    birth_date DATE,
    weight_kg NUMERIC(5,2),
    weight_unit VARCHAR(2) DEFAULT 'kg' CHECK (weight_unit IN ('kg','lb')),
    height_cm NUMERIC(5,2),
    height_unit VARCHAR(3) DEFAULT 'cm' CHECK (height_unit IN ('cm','in')),
    waist_cm NUMERIC(5,2),
    arm_cm NUMERIC(5,2),
    chest_cm NUMERIC(5,2),
    kcal_goal INT,
    bpm_rest INT,
    photo_uri TEXT,
    onboarding_complete BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- EXERCISES (CATALOG)
CREATE TABLE exercises (
    id VARCHAR(50) PRIMARY KEY,
    name_pt VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    category VARCHAR(50) NOT NULL,
    muscle_group VARCHAR(50) NOT NULL,
    equipment VARCHAR(50) NOT NULL,
    is_custom BOOLEAN DEFAULT FALSE,
    user_email VARCHAR(255) REFERENCES users(email) ON DELETE CASCADE, -- NULL for official
    instructions TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- WORKOUTS (HISTORY)
CREATE TABLE workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email VARCHAR(255) NOT NULL REFERENCES users(email) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL DEFAULT 'Sem título',
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    duration_seconds INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- WORKOUT_EXERCISES
CREATE TABLE workout_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    exercise_id VARCHAR(50) NOT NULL REFERENCES exercises(id),
    exercise_name_snapshot VARCHAR(100) NOT NULL,
    exercise_order INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SETS
CREATE TABLE sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_exercise_id UUID NOT NULL REFERENCES workout_exercises(id) ON DELETE CASCADE,
    set_type VARCHAR(20) NOT NULL DEFAULT 'NORMAL' CHECK (set_type IN ('NORMAL','AQUECIMENTO','PREPARATORIA','RECONHECIMENTO','BACK_OFF','DROPSET','FALHA')),
    weight_kg NUMERIC(6,2),
    reps INT,
    is_completed BOOLEAN DEFAULT FALSE,
    is_failed BOOLEAN DEFAULT FALSE,
    notes TEXT DEFAULT '',
    set_order INT NOT NULL, -- visual order within exercise
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROGRESS_PHOTOS
CREATE TABLE progress_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email VARCHAR(255) NOT NULL REFERENCES users(email) ON DELETE CASCADE,
    uri TEXT NOT NULL, -- S3/CDN URL
    taken_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ACTIVE_SESSIONS (autosave)
CREATE TABLE active_sessions (
    user_email VARCHAR(255) PRIMARY KEY REFERENCES users(email) ON DELETE CASCADE,
    title VARCHAR(100),
    state JSONB NOT NULL, -- serialized session state
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SETTINGS
CREATE TABLE user_settings (
    user_email VARCHAR(255) PRIMARY KEY REFERENCES users(email) ON DELETE CASCADE,
    language VARCHAR(2) DEFAULT 'pt' CHECK (language IN ('pt','en')),
    weight_unit VARCHAR(2) DEFAULT 'kg' CHECK (weight_unit IN ('kg','lb')),
    height_unit VARCHAR(3) DEFAULT 'cm' CHECK (height_unit IN ('cm','in')),
    active_plan VARCHAR(50),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_workouts_user_date ON workouts(user_email, started_at DESC);
CREATE INDEX idx_workout_exercises_workout ON workout_exercises(workout_id);
CREATE INDEX idx_sets_workout_exercise ON sets(workout_exercise_id);
CREATE INDEX idx_progress_photos_user_date ON progress_photos(user_email, taken_at DESC);
CREATE INDEX idx_exercises_custom ON exercises(user_email) WHERE is_custom = TRUE;
```

---

## C. Contratos de API (Endpoints)

### Autenticação
| Método | Rota | Objetivo | Auth | Body | Resposta |
|--------|------|----------|------|------|----------|
| POST | `/auth/register` | Criar conta | Não | `{email, password}` | `{user, token}` |
| POST | `/auth/login` | Login | Não | `{email, password}` | `{user, token}` |
| POST | `/auth/refresh` | Renovar token | Refresh | - | `{accessToken}` |
| POST | `/auth/logout` | Logout | Access | - | `204` |
| POST | `/auth/forgot-password` | Recuperar senha | Não | `{email}` | `204` |
| POST | `/auth/reset-password` | Redefinir senha | Não | `{token, newPassword}` | `204` |

### Usuário/Perfil
| Método | Rota | Objetivo | Auth | Body/Params | Resposta |
|--------|------|----------|------|-------------|----------|
| GET | `/user/profile` | Obter perfil | Access | - | `Profile` |
| PUT | `/user/profile` | Atualizar perfil | Access | `ProfileInput` | `Profile` |
| DELETE | `/user/profile/photo` | Remover foto | Access | - | `204` |
| PUT | `/user/password` | Alterar senha | Access | `{current, new, confirm}` | `204` |
| DELETE | `/user/account` | Excluir conta | Access | `{password}` | `204` |

### Exercícios (Catálogo)
| Método | Rota | Objetivo | Auth | Query/Body | Resposta |
|--------|------|----------|------|------------|----------|
| GET | `/exercises` | Listar (oficiais + custom) | Access | `?category=&muscle=&search=&limit=&offset=` | `Exercise[]` |
| GET | `/exercises/:id` | Detalhe | Access | - | `Exercise` |
| POST | `/exercises` | Criar personalizado | Access | `CustomExerciseInput` | `Exercise` |
| PUT | `/exercises/:id` | Editar personalizado | Access | `CustomExerciseInput` | `Exercise` |
| DELETE | `/exercises/:id` | Excluir personalizado | Access | - | `204` |

### Treinos (Histórico)
| Método | Rota | Objetivo | Auth | Body/Params | Resposta |
|--------|------|----------|------|-------------|----------|
| GET | `/workouts` | Listar histórico | Access | `?limit=20&offset=0&from=&to=` | `Workout[]` |
| GET | `/workouts/:id` | Detalhe completo | Access | - | `WorkoutDetail` |
| POST | `/workouts` | Salvar treino concluído | Access | `WorkoutInput` | `Workout` |
| PUT | `/workouts/:id` | Editar treino salvo | Access | `WorkoutInput` | `Workout` |
| DELETE | `/workouts/:id` | Excluir treino | Access | - | `204` |
| POST | `/workouts/:id/duplicate` | Duplicar treino | Access | - | `Workout` |

### Sessão Ativa (Autosave)
| Método | Rota | Objetivo | Auth | Body | Resposta |
|--------|------|----------|------|------|----------|
| GET | `/session/active` | Recuperar sessão | Access | - | `ActiveSession` |
| PUT | `/session/active` | Atualizar autosave | Access | `ActiveSessionInput` | `204` |
| DELETE | `/session/active` | Limpar sessão | Access | - | `204` |

### Fotos de Progresso
| Método | Rota | Objetivo | Auth | Body/Params | Resposta |
|--------|------|----------|------|-------------|----------|
| GET | `/progress/photos` | Listar fotos | Access | `?limit=30&offset=0` | `ProgressPhoto[]` |
| POST | `/progress/photos` | Upload foto | Access | `multipart/form-data` | `ProgressPhoto` |
| DELETE | `/progress/photos/:id` | Excluir foto | Access | - | `204` |

### Gamificação/Estatísticas
| Método | Rota | Objetivo | Auth | Query | Resposta |
|--------|------|----------|------|-------|----------|
| GET | `/stats/summary` | Resumo geral | Access | - | `StatsSummary` |
| GET | `/stats/streak` | Streak atual/melhor | Access | - | `StreakData` |
| GET | `/stats/calendar` | Dados do calendário | Access | `?year=&month=` | `CalendarMonth` |
| GET | `/stats/ranking` | Ranking (semanal/mensal/geral) | Access | `?period=weekly` | `RankingEntry[]` |

### Configurações
| Método | Rota | Objetivo | Auth | Body | Resposta |
|--------|------|----------|------|------|----------|
| GET | `/settings` | Obter configurações | Access | - | `Settings` |
| PUT | `/settings` | Atualizar configurações | Access | `SettingsInput` | `Settings` |

---

## D. Matriz Frontend → Backend

| Tela | Ação do Usuário | Dado Enviado | Origem Atual | Persistência Atual | Entidade Futura | API Futura |
|------|-----------------|--------------|--------------|-------------------|-----------------|------------|
| Cadastro | Criar conta | email, senha | Form local | AsyncStorage `gymvance_contas` | User | POST `/auth/register` |
| Entrar | Login | email, senha | Form local | AsyncStorage `gymvance_contas` + `gymvance_sessao` | User + Session | POST `/auth/login` |
| Configuracoes > Conta | Sair | - | - | Remove `gymvance_sessao` | - | POST `/auth/logout` |
| Peso/Altura/Genero | Onboarding | peso, altura, genero, nome, dataNasc | Form local | AsyncStorage `gymvance_usuario` | Profile | PUT `/user/profile` |
| Perfil > EditarPerfil | Editar perfil | nome, bio, genero, dataNasc, medidas, kcalMeta, bpmBase, foto | Form local | AsyncStorage `gymvance_usuario` + FileSystem | Profile | PUT `/user/profile` |
| Perfil > Evolucao | Adicionar foto | image file | ImagePicker | FileSystem + AsyncStorage `gymvance_fotos_progresso` | ProgressPhoto | POST `/progress/photos` |
| Perfil > Evolucao | Excluir foto | photoId | - | AsyncStorage + FileSystem | ProgressPhoto | DELETE `/progress/photos/:id` |
| TreinoHub > NovaSessao | Criar sessão | titulo, exercicios[], series[] | Estado React | Memória → navega para SessaoAtiva | - | - |
| NovaSessao > Editar | Editar treino salvo | titulo, exercicios[], series[] | Estado React (carregado do histórico) | AsyncStorage `gymvance_historico` | Workout + WorkoutExercise + Set | PUT `/workouts/:id` |
| MeusTreinos | Duplicar treino | - | Histórico local | AsyncStorage `gymvance_historico` (novo item) | Workout (novo) | POST `/workouts/:id/duplicate` |
| MeusTreinos | Excluir treino | workoutIndex | Histórico local | AsyncStorage `gymvance_historico` (filtro) | Workout | DELETE `/workouts/:id` |
| SessaoAtiva | Concluir treino | titulo, series[], tempo | Estado React + timer | AsyncStorage `gymvance_historico` (push) | Workout + WorkoutExercise + Set | POST `/workouts` |
| SessaoAtiva | Autosave | estado completo | Estado React | AsyncStorage `gymvance_sessao_ativa` | ActiveSession | PUT `/session/active` |
| SessaoAtiva | Retomar sessão | - | AsyncStorage `gymvance_sessao_ativa` | AsyncStorage | ActiveSession | GET `/session/active` |
| CatalogoExercicios | Criar exercício custom | nome, grupo, equipamento | Form modal | AsyncStorage `gymvance_exercicios_custom` | Exercise (is_custom=true) | POST `/exercises` |
| CatalogoExercicios | Editar exercício custom | id, nome, grupo, equipamento | Form modal | AsyncStorage `gymvance_exercicios_custom` | Exercise | PUT `/exercises/:id` |
| CatalogoExercicios | Excluir exercício custom | id | - | AsyncStorage `gymvance_exercicios_custom` | Exercise | DELETE `/exercises/:id` |
| Configuracoes > Idioma | Trocar idioma | 'pt'/'en' | Picker | AsyncStorage `gymvance_idioma` | Settings | PUT `/settings` |
| Configuracoes > Unidade | Trocar unidade | 'kg'/'lb', 'cm'/'in' | Picker | AsyncStorage `gymvance_usuario` (pesoUnidade, alturaUnidade) | Settings + Profile | PUT `/settings` + PUT `/user/profile` |
| Planos | Selecionar plano | 'mensal'/'anual'/'eterno' | Card click | AsyncStorage `gymvance_plano_ativo` | Settings (active_plan) | PUT `/settings` |

---

## E. Estratégia de Migração (AsyncStorage → API + DB)

### 1. Dados Migratórios (User-owned, persistentes)
| Chave AsyncStorage | Entidade | Ação |
|--------------------|----------|------|
| `gymvance_contas` | User | Migrar email + hash(senha) → users table |
| `gymvance_usuario` | Profile | Migrar todos campos → profiles table |
| `gymvance_historico` | Workout[] | Migrar cada item → workouts + workout_exercises + sets |
| `gymvance_fotos_progresso` | ProgressPhoto[] | Upload arquivos → S3/CDN, gravar metadados → progress_photos |
| `gymvance_exercicios_custom` | Exercise[] | Migrar → exercises (is_custom=true, user_email FK) |
| `gymvance_idioma` | Settings | Migrar → user_settings.language |
| `gymvance_plano_ativo` | Settings | Migrar → user_settings.active_plan |

### 2. Dados Temporários (Não migrar)
| Chave | Motivo |
|-------|--------|
| `gymvance_sessao` | Sessão atual → recriar via JWT/refresh token |
| `gymvance_onboarding` | Derivado do Profile.onboarding_complete |
| `gymvance_sessao_ativa` | Estado volátil de treino em andamento → recriar se app reaberto |

### 3. Dados Derivados (Recalcular no backend)
| Dado | Origem | Backend |
|------|--------|---------|
| Streak atual | WorkoutHistory | Query: COUNT(DISTINCT DATE(started_at)) consecutivos |
| Melhor streak | WorkoutHistory | Window function |
| Total treinos | WorkoutHistory | COUNT(*) |
| Exercícios únicos | WorkoutHistory | COUNT(DISTINCT exercise_id) |
| Tempo total | WorkoutHistory | SUM(duration_seconds) |
| Ranking | WorkoutHistory | Aggregation por período |

### 4. Conflitos e Sincronização
- **Login em múltiplos dispositivos**: Último write wins para Profile/Settings; Workouts são append-only (não editam remoto após criar).
- **Fotos**: Upload para S3 com presigned URL; AsyncStorage local mantém cache até sync confirmado.
- **Exercícios custom**: User_email FK garante isolamento; merge por ID na sincronização.
- **Versão de schema**: Adicionar `schema_version` em user_settings para migrações futuras.

### 5. Autenticação
- Substituir `gymvance_contas` (plain text password) por bcrypt/argon2 hash.
- JWT access token (15min) + refresh token (30d, httpOnly cookie ou secure storage).
- Endpoint `/auth/me` para validar token e retornar perfil básico.

---

## F. Limitações Conhecidas (Arquitetura Atual Local-Only)

1. **Senhas em texto plano** no AsyncStorage (`gymvance_contas.senha`). Risco se dispositivo comprometido.
2. **Sem backup na nuvem**: Perda do dispositivo = perda de todos os dados.
3. **Sem sincronização multi-dispositivo**: Dados presos ao aparelho.
4. **Limite de histórico**: 20 treinos máximos no AsyncStorage (política local).
5. **Fotos em FileSystem**: Não persistem se app desinstalado (exceto backup do SO).
6. **Sem auditoria**: Não há log de alterações sensíveis (senha, exclusão de treino).
7. **Concorrência**: Sem controle de versão otimista; último write wins no AsyncStorage.

---

## G. Próximos Passos Recomendados

1. **Fase 1 - Backend MVP**: API de auth (register/login/JWT) + Profile CRUD + Workout CRUD.
2. **Fase 2 - Sync Engine**: Cliente detecta conectividade → sync pendente → resolve conflitos.
3. **Fase 3 - Catálogo**: Migrar exercícios oficiais para DB (seed) + permitir custom por usuário.
4. **Fase 4 - Mídia**: Upload de fotos para S3/CDN com thumbnails.
5. **Fase 5 - Gamificação Server-side**: Streaks, rankings, conquistas calculados no backend.
6. **Fase 6 - IA/Planos**: Endpoints para geração de treinos, análise de progresso.

---

*Documento baseado no estado do código em 28/09/2026. Versão do app: 1.0.0 (Expo SDK 57).*