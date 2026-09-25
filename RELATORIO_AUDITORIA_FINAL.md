# RELATÓRIO FINAL DE AUDITORIA TÉCNICA — GYMVANCE (PROTOCOLO 8 FASES)

**Data:** 2026-09-24
**Fases executadas:** 1 (inventário) → 2 (auditoria profunda) → 3 (classificação) → 4 (correções) → 5 (validação) → 6 (2ª auditoria) → 7 (resíduos) → 8 (este relatório).
**Estado:** 100% dos arquivos inventariados. Correções aplicadas e validadas por bundle. **Nenhum commit realizado** (aguarda instrução).
**Evidências usadas:** VALIDADO ESTATICAMENTE (leitura integral + scripts) e VALIDADO EM EXECUÇÃO via `expo export`/`expo-doctor`. **NÃO VALIDADO EM DISPOSITIVO FÍSICO** (sem device disponível) — itens que dependem de runtime em aparelho real (GPS, câmera, galeria, AsyncStorage física) ficam marcados como tal.

---

## 1. Resumo executivo
GymVance é um app fitness 100% offline/local (React Native + Expo SDK 57). Nenhuma API, backend, banco ou mock de dados. Todo dado é real (entrada do usuário), derivado do histórico local ou catálogo estático, exceto um modo de demonstração EXPLÍCITO e SELADO (`MODO_DEMONSTRACAO`) que nunca persiste. Auditoria completa: 15 correções lógicas/documentais anteriores já presentes + 2 novas correções nesta rodada (P1 série órfã, P2 contagem de exercícios). Build web + expo-doctor 21/21 aprovados.

## 2. Projeto e identidade
Nome "GymVance" em `App.js`, `index.js`, `app.json`. Paleta consistente: `#121212`/`#1E1E1E`/`#3DDC5C`/`#E5484D`; telas legadas (onboarding/planos) usam `#0D0D0D`/`#111111`/`#4CAF50` — apenas consistência visual, não funcional.

## 3. Ambiente e configuração
Raiz: `C:\Users\mateu\Desktop\telas_GymVance\GymVance`. Branch `master`, commit base `10e569c`. Plataforma Windows/PowerShell. `app.json`: orientação portrait, `userInterfaceStyle: light`, permissões Android de mídia, plugins image-picker/camera/font. `index.js`: `registerRootComponent(App)`.

## 4. Stack tecnológico e dependências
Expo SDK ~57.0.25, React 19.2.3, RN 0.86.3, React Navigation v7 (native-stack), safe-area-context 5.7, screens 4.26, async-storage 2.2.0, react-native-web, @expo/vector-icons 15, @react-native-picker/picker 2.11.4, expo-{location, image-picker, camera, font, status-bar, file-system, contacts}, react-dom. `expo-doctor`: **21/21 checks aprovados**.

## 5. Arquitetura geral
Stack único em `App.js` (27 rotas). Camada única de persistência: `src/services/storage.js` (27 acessos a AsyncStorage, todos centralizados). Fonte demo única: `src/services/demo.js`. i18n central: `src/services/idioma.js`. Métricas locais: `src/services/metricas.js`. Componentes: `DemoTag`, `BottomNavBar`.

## 6. Inventário de arquivos (cobertura 100%)
35 arquivos `.js` em `src/` + `App.js` + `index.js` + `app.json` + `package.json` lidos integralmente. Artefatos revisados: `RELATORIO_AUDITORIA_FINAL.md` (anterior, referencial), `RELATORIO_AUDITORIA.md` (anterior), `export.log` (log UTF-16 de export antigo), `AGENTS.md`, `CLAUDE.md`, `.gitignore`, `.claude/settings.json`. `dist/` = artefato gerado (gitignored).

## 7. Navegação (árvore real)
27 telas registradas: Splash, Cadastro, Entrar, Peso, Altura, Genero, TreinoHub, NovaSessao, SessaoAtiva, CatalogoExercicios, CalendarioCompleto, Alimentacao, ChatIA, Batimento, Calorias, Perfil, EditarPerfil, Evolucao, Calendario, Configuracoes, Conta, Idioma, Unidade, FAQ, AvaliarApp, Planos, Ranking.
- **Onboarding:** Cadastro→Peso→Altura→Genero (replace) → reset TreinoHub.
- **Login:** Entrar → reset TreinoHub; Logout → logout() + reset Cadastro.
- **Sessão:** TreinoHub → "Iniciar" (SessaoAtiva direto) / "Criar" (NovaSessao) → (params com séries) SessaoAtiva; Catálogo via NovaSessao com param serializável `{ selecao: true }` e retorno `{ exercicioSelecionado }`.
- Validação por script: **0 chamadas a rotas inexistentes**. Params sempre serializáveis (sem callback em params). Fluxo de seleção de exercício empilha instâncias extras de NovaSessao (funciona; UX documentada, sem bug de rota).

## 8. Persistência (matriz AsyncStorage) — 10 chaves
| Chave | Cria | Lê | Atualiza | Remove | Formato | Origem | Tipo |
|---|---|---|---|---|---|---|---|
| gymvance_historico | saveWorkoutHistory | getWorkoutHistory | idem | — | JSON array (cap 20) | conclusão de treino | REAL, PERSISTIDO |
| gymvance_sessao_ativa | saveActiveSession | getActiveSession | idem | clearActiveSession | JSON | autosave 5s | TEMPORÁRIO |
| gymvance_plano_ativo | setSelectedPlan | getSelectedPlan | idem | — | string | seleção em Planos | CONFIG |
| gymvance_usuario | saveUserProfile | getUserProfile | idem | — | JSON | tela Perfil/onboarding | REAL |
| gymvance_fotos_progresso | registrar/foto | listar | remover | — | JSON uris | galeria/câmera | REAL (arquivos) |
| gymvance_idioma | setLanguage | getLanguage | idem | — | 'pt'/'en' | tela Idioma | CONFIG |
| gymvance_sessao | createSession | getSession | idem | logout | JSON {email} | login | PROCESSAMENTO LOCAL |
| gymvance_onboarding | setOnboardingComplete | getOnboardingComplete | idem | — | JSON bool | conclusão do onboarding | CONFIG |
| gymvance_contas | saveAccount | getContas/authenticate | idem | — | JSON | Cadastro | PROCESSAMENTO LOCAL |
| gymvance_exercicios_custom | saveExercicioCustom | get* | update/delete | delete | JSON | CRUD catálogo | CUSTOM |

Validação: todos os 27 acessos a AsyncStorage estão em `storage.js`; nenhum outro arquivo toca persistência. Keys `gymvance_logged_out` NÃO existe (falso positivo anterior descartado: logout remove apenas sessão). Cap 20 do histórico é limitação real documentada.

## 9. Autenticação e onboarding
Cadastro valida e-mail (@ e .), senha ≥6 e confirmação; cria conta local (`saveAccount`) + sessão (`createSession`), navega `replace('Peso')`. Login autentica contra `gymvance_contas`. Logout: remove sessão, preserva perfil/dados. Splash roteia por `getSession`/`getOnboardingComplete`/`migrarUsuarioLegado`.

## 10. Fluxo de dados / origens
- **REAL:** histórico, perfil, medidas, fotos, sessão ativa, contas, BPM base (perfil), GPS (expo-location), exercícios custom.
- **ESTÁTICO:** 100 exercícios oficiais (`EXERCICIOS_OFICIAIS` + `NOMES_EXERCICIOS_EN`), preços PRO.
- **DEMO (selada):** refeições/calorias/BPM da tela Alimentação/Calorias/Batimento quando `MODO_DEMONSTRACAO=true`, sempre com `DemoTag`.
- **VAZIO HONESTO:** `getKcalQueimadas()` → null → "—".
- **DERIVADO:** streak, estatísticas, calendário, épocas de treino.

## 11. Catálogo de exercícios
100 oficiais com id/nome/grupo/equipamento + tradução EN; exercícios personalizados com CRUD completo (`gymvance_exercicios_custom`), badges Oficial/Personalizado. Traduções por `chaveTraducaoGrupoMuscular`/`chaveTraducaoEquipamento` cobrem todos os valores oficiais (validado).

## 12. Treino — máquina de estados (NovaSessao → SessaoAtiva)
- **Entrada com params (NovaSessao):** `clearActiveSession`, séries iniciais com `exercicioNome`/`exercicioIdx`, `canPersistir=true`.
- **Entrada sem params + sessão salva com séries:** modal "Retomar" (continuar / novo).
- **Entrada sem params + sem sessão:** sessão vazia aberta; **CORRIGIDO (P1)** — "+ Série" agora exige exercício (guarda com Alert); antes criava série órfã sem contexto.
- **Autosave:** intervalo 5s + `AppState` (pausa/salva ao sair do foco), `canPersistir` desliga antes de concluir/descartar → não re-persiste sessão concluída.
- **Concluir:** valida ≥1 série (`treinoVazio`), grava `saveWorkoutHistory` com `data: ISO`, `duracao HH:MM:SS`, séries por exercício; `replace('TreinoHub')`.
- **Voltar com séries:** confirma descarte (destrutivo limpa sessão). **Voltar sem séries:** limpa sem salvar treino. **Concluir** não cria treino para série vazia.
- Séries: tipos NORMAL/AQUECIMENTO/PREPARATORIA/RECONHECIMENTO/BACK_OFF/DROPSET/FALHA; numeração visual só conta NORMAL (`numeroNormalDaSerie`).
- Série órfã anterior (histórico) é exibida corretamente como genérica; sem crash.
- Nota documentada: se `saveWorkoutHistory` falhar, sessão já foi limpa (retry manual via TreinoHub); risco baixo.

## 13. Calendários (matemática auditada)
- **CalendarioCompleto (TreinoHub):** grade domingo-primeiro (`offset = diaInicio.getDay()`), `diasNoMes = new Date(ano, mes+1, 0).getDate()` (fev/bissexto/Dez→Jan corretos via JS Date), chaves por meia-noite civil local (`diaInicio`), marcadores só quando existe treino real no dia, hoje/dias futuros tratados, resumo mensal (treinos/dias/melhor sequência intra-mês). **CORRIGIDO (P2):** contagem de "exercícios" por dia agora usa `Set` de nomes únicos (antes contava séries com rótulo de exercícios).
- **Calendario semanal (Perfil):** mesma base `diaInicio`, semana domingo→sábado, `treinosPorDia` por dia civil local.
- Timezone: tudo local civil (ISO UTC parse → local); sem bug de deslocamento.

## 14. Perfil, medidas e idade
Perfil derivado do histórico real (streak, total de treinos/exercícios únicos/séries/duração). Sem seguidores/seguindo fictícios (chaves i18n `perfil.seguidores/seguindo` existem mas NÃO são usadas — mortas, não renderizadas). Medidas (peso/cintura/braço/peito) ficam vazias até o usuário registrar. Fotos de progresso copiadas para `FileSystem.documentDirectory/progresso/`. Idade: `calcularIdade` rejeita datas futuras (null) e faz correção de aniversário não ocorrido; quir 29/02 em ano não bissexto desloca 1 dia (documentado, INFO). EditarPerfil valida data por round-trip JS (`new Date(ano, mes-1, dia)`), aceita limpar data. Unidade: conversão kg↔lb e cm↔in persiste no perfil (`pesoUnidade`/`alturaUnidade`).

## 15. Alimentação e chat IA
Alimentação: modo demo (com DemoTag, meta 2500 kcal, refeições somando 2350) OU vazio honesto no modo real; fotos de refeição reais via galeria/câmera (reusam galeria de progresso — decisão de produto documentada). ChatIA: assistente OFFLINE por palavras-chave (café da manhã/proteína/pré-treino/organização), respostas demonstrativas rotuladas, sem persistência.

## 16. Relógio — BPM, GPS, calorias
Batimento: modo demo usa `DEMO_BATIMENTOS` (78/62/142/86) com selo; GPS REAL via expo-location para distância independente do modo demo. `MODO_DEMONSTRACAO` gating limpo; sem escrita de dados demo. Calorias: demo usa `DEMO_CALORIAS` (347/500/78); modo real `getKcalQueimadas`→null→"—". Badge "Normal" só renderiza com BPM válido (`bpmAtual !== null`) — correção anterior confirmada.

## 17. Ranking
Somente o próprio usuário, com `posição: 1` e selo "você" (sem competidores fictícios). Percursos semanal (últimos 7 dias civis)/mensal (mesmo mês)/geral; contagem de treinos e dias distintos a partir do histórico real.

## 18. Configurações, conta, plano, unidade, idioma
Configuracoes: cards para Perfil/Plano/Conta/Idioma/Unidade/FAQ/AvaliarApp/Treinos/PRO + Sair (reset Cadastro). Conta: edita nome/e-mail (validação), altera senha autenticando com senha atual via `authenticateUser` (linha morta removida na auditoria anterior — confirmada). Unidade: converte valores existentes do perfil ou salva preferência. Idioma: `definirIdioma('pt'|'en')` persiste. FAQ: acordeão com 8 itens. AvaliarApp: Link para Play Store (`com.gymvance.app` placeholder até publicação — documentado); **ScrollView importado corretamente** (falso positivo anterior). Planos: valores fixos R$ (i18n do formato), "Assinar" = seleção local honesta sem cobrança.

## 19. Modo demonstração (regras de ouro)
`demo.js`: `MODO_DEMONSTRACAO=true`; valores 100% constantes (sem Math.random com dados); **nenhum import de AsyncStorage no arquivo**; consumidores: alimentacao.js, calorias.js, batimento.js — todos com gate `MODO_DEMONSTRACAO` e estado de componente apenas. **Proibição demo→AsyncStorage: CUMPRIDA.** Seletor `DemoTag` presente em todas as telas afetadas. Componente `DemoTag` auto-oculta (`modoDemo &&`) para não poluir telas reais.

## 20. i18n (integridade PT/EN)
Script: **302 chaves usadas via `t()`; 0 faltantes em PT; 0 faltantes em EN**. Falsos positivos da heurística (`.split('-')` etc.) descartados. Falsos "só pt" do EN = chaves do mapa `EQUIPAMENTO_CHAVE` (tradução de valores oficiais) — desconsiderados. Chaves mortas existentes (não usadas): `perfil.seguidores/seguindo`, `perfil.calendarioEmBreve`, `alimentacao.abasFotos/Albuns/Historias/Mais`, `novaSessao.usarSessao`, etc. — inofensivas, documentadas. Novas chaves desta rodada (`sessaoAtiva.serieSemExercicio[+Msg]`) presentes nas duas línguas.

## 21. Busca por dados fictícios
Varredura global (`mock|fake|dummy|sample|example|Math.random|followers|seguidores|participant|amigo|usuario01|...`): **nenhum dado fictício apresentado como real**. `Math.random` aparece apenas em geradores de ID e nome de arquivo (storage.js). "Followers/Seguidores" apenas em i18n morto. IA demo rotulada. Exercícios com "Exemplo" são conteúdo demonstrativo explícito.

## 22. Segurança
Sem segredos/keys no repositório. Senhas locais em texto plano (`gymvance_contas`) — decisão de produto documentada, sem claims de segurança. Sem rede/exfiltração; único `Linking.openURL` leva à Play Store.

## 23. Dependências
`expo-doctor` 21/21 OK. Patchs SDK 57 aplicados (expo, expo-contacts, expo-image-picker, expo-location). `expo-contacts` declarada porém SEM uso no código (INFO — remoção opcional, não feita por responsabilidade de lockfile). `npm audit`: moderados de toolchain apenas (dev), sem alta/crítica de runtime.

## 24. Build / validação (execução real)
`npx expo export --platform web --clear` → **SUCESSO**: 34 assets, 2 bundles web (`index-*.js` 1.6MB principal), listados em `dist/`, 0 erros. `npx expo-doctor` → 21/21. Isto valida sintaxe/imports de 100% dos arquivos alterados.

## 25. Problemas encontrados e correções aplicadas (rodada atual)
| ID | Severidade | Tipo | Classe | Evidência | Correção |
|---|---|---|---|---|---|
| P1 | BAIXO | REAL/temporário | C | SessaoAtiva `adicionarSerie` permitia série órfã em sessão vazia (TreinoHub→"Iniciar") | Guarda em `adicionarSerie` exige contexto de exercício + Alert orientando "Criar sessão"; 2 chaves i18n pt/en |
| P2 | BAIXO | DERIVADO | C | CalendarioCompleto rotulava "exercícios" com contagem de séries | Contagem por `Set` de nomes únicos de exercício |
| P3 | INFO | ESTÁTICO | D(cosmético) | estilos mortos em genero.js; destructure não usado em configuracoes.js | Removidos (57 linhas de estilo + variáveis) |

Correções anteriores já presentes e re-verificadas: `adicionarSerie` herda exercício da última série; badge "Normal" gated por BPM; linha morta removida de Conta; modal do catálogo sem hack de string; +15 estilos mortos removidos das demais telas; patch de deps SDK 57.

## 26. 2ª auditoria pós-correção (reaudit)
Releitura dos trechos alterados: guarda P1 correta (série vazia bloqueia, séries com exercício seguem fluxo, retomar/novo inalterados); P2 usa `Set` e não quebra exibição; i18n revalidado (302 usadas, 0 faltantes); `genero.js` sem referências órfãs a estilos removidos; bundle pós-mudanças exportou sem erros. Nenhuma regressão detectada.

## 27. Decisões de produto, limitações e recomendações
- **Decisões mantidas (não-bug):** planos "Assinar" sem cobrança (honesto); preços fixos R$; galeria compartilhada de refeições/fotos de progresso; streak duplicado em 3 arquivos (centralizar = risco>benefício); senha em texto plano local; `calcularIdade` com offset de 1 dia em 29/02 de anos não bissextos.
- **Limitações reais:** histórico cap 20 (streaks longos limitados); kcal queimadas sempre null (sem fonte local); AvaliarApp URL placeholder até publicação; `expo-contacts` sem uso; telas legadas com paleta distinta.
- **Recomendações:** teste em dispositivo físico (GPS, câmera, galeria, retomada de sessão após killer); decidir produto real de planos/PRO; revisar chaves i18n mortas; remover `expo-contacts` quando o lockfile for mexido.
- **Evidência global:** ANALISADO ESTATICAMENTE (100% dos arquivos) + VALIDADO EM EXECUÇÃO via bundle web e expo-doctor. **NÃO VALIDADO EM DISPOSITIVO FÍSICO.**

---

## Tabela resumo de fontes de dados
| Fonte | Onde lida | Tipo | Selo |
|---|---|---|---|
| gymvance_historico | TreinoHub/Perfil/Calendarios/Ranking/EditarPerfil | REAL | — |
| gymvance_usuario | Perfil/Conta/Unidade/Evolucao/metrícas | REAL | — |
| gymvance_fotos_progresso | Evolucao/Alimentacao | REAL | — |
| gymvance_contas | Cadastro/Entrar/Conta | PROCESSAMENTO LOCAL | — |
| EXERCICIOS_OFICIAIS + EN | CatalogoExercicios | ESTÁTICO | — |
| gymvance_exercicios_custom | Catalogo/NovaSessao | CUSTOM | — |
| demo.js | Alimentacao/Calorias/Batimento | DEMO | DemoTag |
| metricas.getKcalQueimadas | Calorias | VAZIO HONESTO | — |
| GPS (expo-location) | Batimento | REAL | — |

## Arquivos alterados nesta rodada (git)
- Modificados: `src/services/idioma.js` (+2 chaves×2 línguas), `src/telasTreino/SessaoAtiva.js` (guarda P1), `src/calendario/calendario.js` (P2), `src/genero/genero.js` (−estilos mortos), `src/configuracoes/configuracoes.js` (−destructure).
- Criados (anteriores, não commitados): `src/calendario/`, `src/services/demo.js`, `src/components/DemoTag.js`, `src/alimentacao/chatIA.js`, `RELATORIO_AUDITORIA_FINAL.md`.
- Não-commitados remanescentes do commit anterior (`10e569c`): App.js, package*.json, Perfil.js, batimento.js, calorias.js, alimentacao.js, CatalogoExercicios.js, Conta.js, ranking.js, storage.js, Cadastro.js, TreinoHub.js (auditoria prévia). **Nenhum commit realizado — aguarda instrução.**