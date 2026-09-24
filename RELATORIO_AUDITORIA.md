# Relatório Técnico de Auditoria e Correções — GymVance

**Data:** 24/09/2026
**Objeto:** Aplicativo React Native / Expo SDK 57
**Escopo:** Funcionalidade, código, UI/UX, i18n, assets, persistência, navegação e QA.
**Regra pactuada:** "Se existe, deve funcionar" — corrigir ou ocultar coerentemente; nada de redesign arbitrário, dados inventados ou funcionalidades fora de escopo.

Convenções usadas neste relatório:
- ✅ **Confirmado pelo código** — verificado em fonte.
- 🔶 **Inferido** — comportamento deduzido (ex.: sem emulador RNGP para captura de câmera).
- ❌ **Não foi possível testar fisicamente** — recursos que exigem dispositivo/periférico.

---

## 1. Resumo executivo

O GymVance é um app de treino **100% local** (AsyncStorage), sem backend. Durante a auditoria encontramos pontos em três faixas:

1. **Incompletudes intencionais** (mock data, telas "em breve", navbar falsa) que violavam a regra "se existe, deve funcionar".
2. **Defeitos reais** (estilos referenciados e não definidos nas telas de login/cadastro; chaves i18n duplicadas; uma dentre duas definições vencendo ao acaso).
3. **Ausências honestas** (sem cadastro de refeições, sem logging de kcal, sem wearable) — tratadas com estado vazio/ocultamento, nunca com dados falsos.

Ao final, todas as fases planejadas foram executadas; as correções estão listadas na seção 14 e tabuladas na seção 15. Restam 5 pontos que exigem decisão humana (seção 17).

---

## 2. Ambiente e configuração do projeto

| Item | Valor | Status |
|---|---|---|
| Framework | Expo SDK ~57 (`expo@~57.0.23`) | ✅ |
| RN | `react-native@0.86.3` | ✅ |
| React | `react@19.2.3` | ✅ |
| Navegação | `@react-navigation/native-stack@7` | ✅ |
| Persistência | `@react-native-async-storage/async-storage@2.2.0` | ✅ |
| Ícones | `@expo/vector-icons` | ✅ |
| Permissões | `expo-camera`, `expo-image-picker`, `expo-location`, `expo-contacts` (declaradas) | ✅ |
| Scripts | `start` / `android` / `ios` / `web` | ✅ (sem lint/typecheck — ver nota em 12) |

**Documentação base:** `AGENTS.md` determina leitura dos docs versionados de Expo em `https://docs.expo.dev/versions/v57.0.0/` antes de escrever código (cumprido).

---

## 3. Arquitetura

- Single `Stack.Navigator` em `App.js` (23 telas registradas + Splash). `headerShown: false` globalmente; cada tela monta seu próprio header.
- Camada de serviço em `src/services/`:
  - `storage.js` — toda a persistência + helpers de conversão/formatos/unidades.
  - `idioma.js` — i18n própria (contexto + dicionários `pt`/`en`, com `t()` de fallback devolvendo a própria chave).
  - `metricas.js` — kcal/bpm (leituras honestas de perfil ou `null`).
  - `UserContext.js` / `useUserProfile.js` — nome e `refreshUsuario`.
  - `fotoPerfil.js` — persistência de foto de perfil.
- Navigation targets verificados: **todos** os `navigation.navigate('X')` apontam para uma rota registrada em `App.js` (Cadastro, Entrar, Peso, Altura, Genero, TreinoHub, Perfil, EditarPerfil, Evolucao, Calendario*, Configuracoes, Idioma, Unidade, FAQ, AvaliarApp, Conta, CatalogoExercicios, Planos, Alimentacao, Batimento, Calorias, Ranking, NovaSessao, SessaoAtiva). *`Calendario` adicionada nesta auditoria.*

---

## 4. Navegação (fluxos)

| Fluxo | Rota origem → destino | Status |
|---|---|---|
| Splash → onboarding/login | `Splash` → `Cadastro` / `Peso` / `Altura` / `Genero` / `TreinoHub` | ✅ |
| Cadastro real | `Cadastro` → `saveAccount` + `createSession` → `Peso` | ✅ |
| Login real | `Entrar` → `authenticateUser` → restore de sessão | ✅ |
| Treino | `TreinoHub` → `SessaoAtiva` (início rápido) ou `NovaSessao` → `SessaoAtiva` | ✅ |
| Sessão ativa | autosave + retomada (novo) — ver §9 | ✅ |
| Evolução | `Perfil` → `Evolucao` | ✅ |
| Calendário | `Perfil` → `Calendario` (novo) | ✅ |
| Config | `Perfil` → `Configuracoes` → subrotas | ✅ |
| BottomNav | presente em TreinoHub, Ranking, Perfil, Alimentacao, SessaoAtiva | ✅ |

---

## 5. Armazenamento (storage.js)

Chaves utililizadas:

| Chave | Uso | Alteração |
|---|---|---|
| `gymvance_historico` | histórico de treinos (últimos 20) | — |
| `gymvance_plano_ativo` | assinatura PRO simulada | — |
| `gymvance_usuario` | perfil | [+] medidas cintura/braco/peito |
| `gymvance_fotos_progresso` | fotos de progresso | [+] `deleteProgressPhoto` |
| `gymvance_idioma` | idioma | — |
| `gymvance_sessao` | sessão de login | — |
| `gymvance_onboarding` | onboarding | — |
| `gymvance_contas` | contas locais | — |
| `gymvance_exercicios_custom` | exercícios personalizados | (edit/delete já existiam) |
| **`gymvance_sessao_ativa`** | **sessão de treino em andamento (nova)** | **[+]** `save/get/clearActiveSession` |

Novos helpers adicionados em `storage.js`:
- `ACTIVE_SESSION_KEY` (const), `saveActiveSession`, `getActiveSession`, `clearActiveSession`.
- `deleteProgressPhoto(id)` — remove do AsyncStorage e apaga o arquivo físico via `FileSystem`.

---

## 6. Autenticação e onboarding

- Contas locais (`saveAccount`/`authenticateUser`) — funcionam (sem backend).
- **Provedores** (Google/Facebook/Apple/Telefone): **por design** não possuem backend/configuração; os botões exibem `Alert` honesto. Confirmado no código que nenhum cria conta/sessão falsa.
- **Defeito corrigido:** os estilos `dividerContainer`, `divider`, `dividerText`, `providersRow`, `providerButton`, `providerIcon`, `providerNote` eram **referenciados mas não definidos** em `Cadastro.js`/`Entrar.js` — o layout dos provedores renderizava sem estilo. Estilos adicionados nos dois arquivos. ✅
- **Defeito corrigido:** a nota de transparência estava hardcoded em PT (`ProviderNote`); agora usa `t('auth.notaProvedores')`.
- **i18n:** a segunda ocorrência do bloco `auth.*` no dicionário EN sobrescrevia a primeira (chaves duplicadas). Bloco removido; `auth.ouContinueCom` e `auth.emailMsg` (que só existiam em PT) adicionadas em EN.

---

## 7. Recursos (assets)

| Asset | Referenciado? | Status |
|---|---|---|
| `assets/FundoPretoRestoBranco-removebg-preview.png` | Splash/Cadastro/Entrar | ✅ |
| `assets/Google.png`, `Facebook.png`, `Apple.png` | botões de provedor | ✅ |
| `assets/anilha.png`, `alimentacao.png`, `relogio.png`, `icon.png` | — | 🔶 não referenciados (sem defeito) |

---

## 8. i18n

- Dicionários `pt`/`en` (~370 chaves cada).
- **Auditoria automatizada:** um script varre todas as chamadas `t('chave')` do código e confere existência no dicionário `pt` — **0 chaves faltando**. Paridade `pt ↔ en` verificada: apenas falsos positivos do mapa `chaveTraducaoEquipamento` (não é dicionário de UI).
- **Duplicatas removidas:** `configuracoes.conta`, `perfil.foto`, `exercicios.criarPersonalizado` (valores idênticos; a última definição vencia — agora só há uma).
- **Indentação corrigida** nas linhas do dict `pt` (`exercicios.grupo.panturrilhas`) e `en` (`exercicios.grupoMuscular`).
- **Chaves adicionadas (PT e EN):** `auth.notaProvedores`, `exercicios.editar/editarTitulo/excluir/excluirTitulo/excluirMsg`, `sessaoAtiva.retomarTitulo/retomarMsg/continuarTreino/comecarNovo`, `perfil.ofensiva`, `calendario.*` (título, verCalendario, treinosMes, semTreinosMes, semTreinosDia, mesAnterior, proximoMes, exercicios, `diaSemana.0–6`, `mes.0–11`), `auth.ouContinueCom`/`auth.emailMsg` (EN).

---

## 9. Treino (TreinoHub → NovaSessao → SessaoAtiva)

- **Tipos de série** suportados (armazenados e renderizados): `NORMAL`, `AQUECIMENTO`, `PREPARATORIA`, `RECONHECIMENTO`, `BACK_OFF`, `DROPSET`, `FALHA`. Rótulos via `t('tipo.*')`. Número visual só conta NORMAL (função `numeroNormalDaSerie`). ✅
- Timer: acumulação com `acumuladoMs` + `inicioPeriodo` (estável em background), resumido por `isFocused`. ✅ (inferido — sem teste físico de background app)
- **Nova funcionalidade (autosave/restore):**
  - `persistirSessao` grava o estado inteiro (título, séries, `acumuladoMs`, `inicioPeriodo`, `proximoId`, `tempo`) na chave nova.
  - Gatilhos de gravação: a cada mudança de série/título, a cada 5s (intervalo), em background do app e no unmount.
  - Ao abrir sem `route.params` (início rápido) havendo sessão salva, um modal pergunta **Continuar treino** × **Começar nova sessão**.
  - Ao iniciar com `route.params` (criada via NovaSessao), a sessão salva anterior é descartada.
  - Concluir/Descartar/Voltar limpam a chave (`clearActiveSession`) e desativam novos saves (`canPersistir=false`) antes do `navigation.replace/goBack`, evitando "re-salvar" no cleanup.
- Fluxo "Iniciar treino" (TreinoHub) permanece vazio; agora é recuperável.

---

## 10. Catálogo de exercícios

- Categorias com `CATEGORIA_ORDEM`, busca por acento-insensitiva, modo seleção (NovaSessao) × navegação.
- **Nova funcionalidade (edit/delete de personalizados):**
  - Tocando um exercício personalizado (fora do modo seleção) abre o modal **Editar exercício personalizado** (pré-preenchido via `updateExercicioCustom`).
  - Botão de **excluir** (ícone lixeira) com `Alert` de confirmação usando `deleteExercicioCustom`.
  - Ações visíveis apenas para itens `personalizado` e fora do modo seleção (sem impactar o fluxo NovaSessao).
- Verificado: `saveExercicioCustom`, `updateExercicioCustom`, `deleteExercicioCustom` existem e operam por `id` string `custom-*`. ✅

---

## 11. Perfil, Medidas e Evolução

- **Perfil:**
  - StatCards falsos "Seguidores 0" / "Seguindo 0" **substituídos** por stats reais: **Ofensiva (streak)**, **Treinos concluídos**, **Exercícios únicos**.
  - Pesos/alturas exibidos via `formatarPeso`/`formatarAltura`.
  - Card "Calendário em breve" **substituído** por card navegável para a nova tela `Calendario`.
- **EditarPerfil:** novos campos **Cintura, Braço, Peito** (cm) persistidos no perfil via `saveUserProfile` (merge), com parse numérico defensivo (`parseFloat`/vírgula).
- **Evolução:** a seção "Medidas Recentes" agora lê valores reais do perfil (antes exibia `--` exceto peso). Peso usa `formatarPeso` + `pesoUnidade`.
- **Calendário (nova tela `src/Perfil/Calendario.js`):**
  - Grade mensal com navegação `« ‹ mês/ano › »`, dots verdes nos dias com treino, seleção de dia com lista de treinos (hora, nº de exercícios, duração), resumo "N treinos neste mês".
  - Registrada em `App.js` (`Stack.Screen name="Calendario"`).

---

## 12. Alimentação

- **Honestidade:** sem cadastro de refeições/macros no app. Constantes vazias removidas; a seção "Refeições de hoje" só renderiza se houver registros (hoje `[]` → oculta). Sem dados falsos.
- `getKcalQueimadas`/`getKcalMeta` agora são **lidos de `metricas.js`** e propagados ao dashboard (percentual real ou null). Sem constrangedor `KCAL_ATUAL = null` em módulo.
- **Galeria:** navbar fake "Fotos / Álbuns / Histórias / Mais" e ícones decorativos (search, more-vertical) **removidos**.
- **Delete de fotos adicionado** na galeria (botão × sobre a foto, com confirmação implícita no fluxo) via `deleteProgressPhoto` e refresh do estado.
- Layout da grade corrigido: `galeriaFotoWrapper` agora tem estilo real (rato/posição do botão ×).
- Indentação do `try {` corrigida.

---

## 13. Relógio / Batimento / Calorias / Planos / Config

- `metricas.js` expõe `getKcalQueimadas()` (sempre `null` — sem fonte; honesto), `getKcalMeta()` e `getBpmAtual()` (leem perfil). 
- Planos (`mensal`) selecionam assinatura PRO local — sem cobrança real (comentado como simulação; sem backend).
- Configurações/FAQ/Avaliar/Conta — fluxos locais consistentes com o restante do app (leitura realizada; sem inconsistências bloqueantes).
- Atenção: `batimento.js`/`calorias.js`/`NovaSessao.js`/`TreinoHub.js`/`configuracoes.js` já constavam com mudanças **anteriores** à auditoria no working tree; não foram alteradas nesta passada exceto onde citado.

---

## 14. Arquivos modificados nesta auditoria

| Arquivo | Mudança |
|---|---|
| `src/services/storage.js` | [+] `ACTIVE_SESSION_KEY`, `save/get/clearActiveSession`, `deleteProgressPhoto` |
| `src/services/idioma.js` | duplicatas removidas; indentação; [+] chaves (pt/en); `auth.*` EN completado |
| `src/configuracoes/CatalogoExercicios.js` | edit/delete de exercícios personalizados (modal + Alert + ações) |
| `src/alimentacao/alimentacao.js` | kcal reais, refeições ocultas se vazias, galeria limpa, delete de foto, styles da grade |
| `src/ranking/ranking.js` | dados reais (streak + treinos por período), remoção do pódio vazio |
| `src/Perfil/Perfil.js` | StatCards reais, formatação de unidades, card calendário navegável |
| `src/Perfil/EditarPerfil.js` | campos Cintura/Braço/Peito |
| `src/Perfil/Evolucao.js` | medidas reais do perfil + unidade de peso |
| `src/telasTreino/SessaoAtiva.js` | autosave/restore de sessão, modal Continuar/Nova, limpeza em concluir/descartar/voltar |
| `src/telasCadastro/Cadastro.js` | `t('auth.notaProvedores')` + estilos ausentes dos provedores |
| `src/telasLogin/Entrar.js` | idem |
| `App.js` | registro da tela `Calendario` |
| **`src/Perfil/Calendario.js`** | **(novo)** tela de calendário de treinos |
| `src/telasPlanos/mensal.js` | `shadowColor/Offset/Opacity/Radius` (deprecados) removidos; manter apenas `boxShadow` |
| `src/Perfil/Perfil.js` | StatCard `icone="barbell"` (inexistente em Feather) → `"repeat"` |

---

## 15. Tabela final de auditoria

| # | Item | Situação original | Ação | Evidência | Classe |
|---|---|---|---|---|---|
| 1 | Alvo de navegação inexistente | Não havia | − | grep `navigation.navigate` × `App.js` | — |
| 2 | Assets usados inexistentes | Não havia | − | `require(...)` × `assets/` | — |
| 3 | `getKcalQueimadas` sempre null | Honesto, sem fonte | mantido + wired de `metricas.js` | `metricas.js:6` | P3 |
| 4 | NFC: navbar fake na galeria | Falsa (4 abas mortas) | removida | `alimentacao.js` | P1 |
| 5 | Refeições/macros placeholder | Constantes vazias | seção oculta se vazia; sem fake | `alimentacao.js` | P1 |
| 6 | Seguidores/Seguindo (0) | Não há rede social | stats reais | `Perfil.js` | P1 |
| 7 | Calendário "em breve" | Card morto | tela nova + card ativo | `Calendario.js`; `Perfil.js` | P1 |
| 8 | Medidas cint/braço/peito `--` | Sem fonte | campos editáveis + leitura no perfil | `EditarPerfil.js`; `Evolucao.js` | P1 |
| 9 | Custom sem edit/delete | Incompleto | botões + modal | `CatalogoExercicios.js` | P1 |
| 10 | Sessão perdida ao fechar app | Perda de dados | autosave/restore | `SessaoAtiva.js`; `storage.js` | P1 |
| 11 | Ranking sem dados | Pódio vazio | dados reais (streak/períodos) | `ranking.js` | P1 |
| 12 | Estilos de provedor ausentes | Referenciados, indefinidos | styles adicionados | `Cadastro.js`/`Entrar.js` | P0 |
| 13 | Nota de provedores hardcoded PT | Sem i18n | `t('auth.notaProvedores')` | `idioma.js` | P2 |
| 14 | `auth.*` duplicados no dict EN | Sobrescrita | removidos | `idioma.js` | P2 |
| 15 | `ouContinueCom`/`emailMsg` só PT | EN mostrava chave | adicionadas EN | `idioma.js` | P2 |
| 16 | Unidades de display (decisões longas) | Peso cru | `formatarPeso`/`formatarAltura` | `Perfil.js`/`Evolucao.js` | P3 |
| 17 | Exclusão de foto de progresso | Inexistente | `deleteProgressPhoto` + UI | `storage.js:443`; `alimentacao.js` | P1 |
| 18 | Timer (perda em background) | Só visual | storage de sessão | `SessaoAtiva.js` | P1 |
| 19 | Ícone Feather `barbell` | Glyph inexistente (warning/erro no Android) | trocado por `repeat` (Feather válido) | `Perfil.js:197` | P0 |
| 20 | `shadow*` deprecados (RN NA/web) | Warning de deprecação | removidos; mantido `boxShadow` | `mensal.js` | P3 |

Classificação (técnica): **P0** afeta render/layout crítico; **P1** afeta funcionalidade/completude; **P2** i18n/limpeza; **P3** polimento.

---

## 16. Testes realizados

- **Parse/compilação (Babel)**: 13 arquivos tocados validados com `@babel/core` + `babel-preset-expo` → 0 erros.
- **Dicionário i18n**: script automático — todas as `t('chave')` existem no PT; paridade PT↔EN; 0 duplicatas.
- **Exports de serviço**: todos os helpers usados importados existem em `storage.js`/`metricas.js`/`idioma.js`.
- **Navegação**: todos os `navigate` apontam para rotas registradas.
- ❌ **Não foi possível testar fisicamente**: câmera (sem device), GPS de batimento (requer hardware), restauração real após kill do SO (simulada apenas por lógica/refs), streak no dia 1 (depende de dados).
- 🔶 Comportamentos inferidos: rebuild de AsyncStorage em background; `Linking.openSettings` em device.

**Sem test runner configurado** no `package.json` (só expo start/android/ios/web) — não há script de lint/typecheck para rodar; verificado por parse+análise estática.

**Passada final (QR — ícones/shadow/web):**
- Todos os nomes de ícones do app validados contra o glyph set real da respectiva família (`Feather`, `Ionicons`, `MaterialCommunityIcons`), incluindo arrays dinâmicos (`BottomNavBar`, `configuracoes`, `mensal` benefícios) — nenhum inválido. ✅
- `grep shadowColor/shadowOpacity/shadowRadius/shadowOffset` → 0 ocorrências após correção.
- `barbell` restante apenas como `Ionicons barbell-outline` (válido) e `dumbbell` (`MaterialCommunityIcons`, válido).
- `expo export --platform web`: bundle OK, 675 módulos, 0 erros (web compila).
- `expo-doctor`: 20/21 — único apontamento é patch de versões dos packages Expo (`expo` 57.0.23 vs ~57.0.25, `expo-contacts`, `expo-image-picker`, `expo-location`), **sem ação** por regra pactuada (não atualizar dependências).

---

## 17. Pontos que exigem decisão humana

1. **kcal queimadas** — permanece `null`/não exibido. Precisaria de integração com wearable/Watch ou diário manual (decisão de produto).
2. **Barra de treinamento do Batimento** — leituras dependem de `expo-location`/hardware; validar se a UI "em branco" é aceitável ou se deve ser ocultada.
3. **Planos PRO** — seleção local não cobra nem valida. Decidir se `Planos` deve ter aviso de demonstração ou aguardar backend.
4. **Excluir foto do Evolução** — a exclusão foi adicionada na galeria de Alimentação; incluir também no modal do Evolução se desejado (aí a foto some das duas telas pelo mesmo storage).
5. **Dupla fonte de nome (`UserContext` × `getUserProfile`)** — coerentes hoje; decidir padronização futura.

---

## 18. Notas finais

- Nenhuma conta/sessão/cálculo falso foi introduzido; onde não há fonte de dados, a UI declara "—" ou oculta a seção.
- O `package-lock.json`/`package.json` exibem diferência em relação ao `origin/master` por mudanças **anteriores** a esta auditoria (working tree já tinha alterações não commitadas) — **nada foi commitado**.
- Para rodar: `npm run start` (Expo), depois testar fluxos indicados nas seções 9–11.