import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { getLanguage, setLanguage as setLanguageStorage } from './storage';

const TRADUCOES = {
  pt: {
    'comum.usuario': 'Usuário',
    'comum.cancelar': 'Cancelar',
    'comum.descartar': 'Descartar',
    'comum.entrar': 'Entrar',
    'comum.criarConta': 'Criar conta',
    'comum.erro': 'Erro',
    'comum.erroSalvarDados': 'Não foi possível salvar seus dados. Tente novamente.',
    'comum.avancar': 'Avançar',
    'comum.evolucaoDiaria': 'Evolução diária',
    'comum.ranking': 'Ranking',
    'comum.abrirRanking': 'Abrir ranking',

    'tipo.NORMAL': 'Série',
    'tipo.AQUECIMENTO': 'Aquecimento',
    'tipo.PREPARATORIA': 'Preparatória',
    'tipo.RECONHECIMENTO': 'Reconhecimento',
    'tipo.BACK_OFF': 'Back-off set',
    'tipo.DROPSET': 'Dropset',
    'tipo.FALHA': 'Falha',

    'sessaoAtiva.tag': 'SESSÃO ATIVA',
    'sessaoAtiva.semTitulo': 'Sessão Ativa',
    'sessaoAtiva.concluir': 'Concluir',
    'sessaoAtiva.colSerie': 'Série',
    'sessaoAtiva.colNotas': 'Notas',
    'sessaoAtiva.acessibilidadeBadge': 'Alterar tipo ou remover série',
    'sessaoAtiva.descartarTreino': 'Descartar Treino',
    'sessaoAtiva.confirmarDescartar': 'Tem certeza de que deseja descartar este treino? As séries serão perdidas.',
    'sessaoAtiva.menuSubtitulo': 'Escolha o tipo ou remova esta série',
    'sessaoAtiva.removerSerie': 'Remover série',
    'sessaoAtiva.treinoConcluido': 'Treino concluído',
    'sessaoAtiva.salvoHistorico': 'Seu treino foi salvo no histórico local.',
    'sessaoAtiva.erroSalvar': 'Não foi possível salvar o treino localmente.',
    'sessaoAtiva.serieLabel': 'Série',
    'sessaoAtiva.adicionarSerie': 'Série',
    'sessaoAtiva.notaPlaceholder': 'Adicionar notas...',
    'sessaoAtiva.cancelar': 'Cancelar',
    'sessaoAtiva.treinoVazio': 'Treino vazio',
    'sessaoAtiva.treinoVazioMsg': 'Adicione ao menos uma série antes de concluir o treino.',

    'novaSessao.usarSessao': 'Usar sessão criada',
    'novaSessao.titulo': 'Título da sessão',
    'novaSessao.placeholderTitulo': 'Adicionar título...',

    'treinoHub.sessaoTreino': 'Sessão de Treino',
    'treinoHub.iniciar': 'Iniciar treino',
    'treinoHub.criar': 'Criar sessão de treino',

    'nav.treino': 'Treino',
    'nav.alimentacao': 'Alimentação',
    'nav.relogio': 'Relógio',

    'cadastro.titulo': 'Crie sua conta',
    'cadastro.subtitulo': 'Comece sua jornada com o GymVance',
    'cadastro.email': 'E-mail',
    'cadastro.senha': 'Senha',
    'cadastro.confirmarSenha': 'Confirmar senha',
    'cadastro.erroEmail': 'Insira um e-mail válido.',
    'cadastro.erroSenhaCurta': 'A senha deve ter pelo menos 6 caracteres.',
    'cadastro.erroSenhasDiferentes': 'As senhas não são iguais.',
    'cadastro.jaTemConta': 'Já tem uma conta?',

    'entrar.titulo': 'Bem-vindo de volta!',
    'entrar.subtitulo': 'Entre na sua conta do GymVance',
    'entrar.aindaNaoTemConta': 'Ainda não tem uma conta?',
    'entrar.erroCredenciais': 'E-mail ou senha incorretos. Verifique suas credenciais.',

    'peso.etapa': 'Etapa 2 de 4',
    'peso.titulo': 'Qual seu peso?',
    'peso.obrigatorio': 'Peso obrigatório',
    'peso.erroValor': 'Informe um peso válido para continuar.',

    'altura.etapa': 'Etapa 3 de 4',
    'altura.titulo': 'Qual sua altura?',
    'altura.nome': 'Altura',
    'altura.obrigatoria': 'Altura obrigatória',
    'altura.erroValor': 'Informe uma altura válida para continuar.',

    'genero.etapa': 'Etapa 4 de 4',
    'genero.titulo': 'Crie seu perfil',
    'genero.nome': 'Nome',
    'genero.placeholderNome': 'Digite seu nome',
    'genero.genero': 'Gênero',
    'genero.homem': 'Homem',
    'genero.mulher': 'Mulher',
    'genero.helperGenero': 'Usamos o gênero para adaptar o volume de treino, gasto calórico e dieta.',
    'genero.dataNascimento': 'Data de nascimento',
    'genero.placeholderData': 'DD/MM/AAAA',
    'genero.helperData': 'Informe a data completa do seu nascimento para personalizar sua evolução.',
    'genero.erroNome': 'Nome obrigatório',
    'genero.erroNomeMsg': 'Informe seu nome para continuar.',
    'genero.erroData': 'Data inválida',
    'genero.erroDataMsg': 'Informe uma data de nascimento válida no formato DD/MM/AAAA.',
    'genero.erroGenero': 'Gênero obrigatório',
    'genero.erroGeneroMsg': 'Selecione seu gênero para continuar.',

    'perfil.idioma': 'Idioma',
    'perfil.portugues': 'Português',
    'perfil.ingles': 'English',
    'perfil.meuPerfil': 'Meu Perfil',
    'perfil.treinosConcluidos': 'Treinos concluídos',
    'perfil.salvarAlteracoes': 'Salvar alterações',
    'perfil.minhaEvolucao': 'Minha Evolução',
    'perfil.subtitulo': 'Acompanhe suas fotos e evolução corporal',
    'perfil.antes': 'ANTES',
    'perfil.depois': 'DEPOIS',
    'perfil.adicionarFoto': 'Adicionar Foto',
    'perfil.medidasRecentes': 'Medidas Recentes',
    'perfil.medida.peso': 'Peso',
    'perfil.medida.cintura': 'Cintura',
    'perfil.medida.braco': 'Braço',
    'perfil.medida.peito': 'Peito',
    'perfil.editarPerfil': 'Editar Perfil',
    'perfil.historico': 'Histórico',
    'perfil.foto': 'foto',
    'perfil.fotos': 'fotos',
    'perfil.registrada': 'registrada',
    'perfil.registradas': 'registradas',
    'perfil.nomeLabel': 'Nome',
    'perfil.placeholderNome': 'Digite seu nome',
    'perfil.emailLabel': 'Email',
    'perfil.placeholderEmail': 'Digite seu email',
    'perfil.galeriaBloqueada': 'Galeria bloqueada',
    'perfil.galeriaBloqueadaMsg': 'Permita o acesso às fotos nas configurações para registrar seu progresso.',
    'perfil.abrirConfiguracoes': 'Abrir configurações',
    'perfil.permissaoNecessaria': 'Permissão necessária',
    'perfil.fotosPermissaoMsg': 'Precisamos acessar suas fotos para registrar seu progresso.',
    'perfil.erroAdicionarFoto': 'Não foi possível adicionar a foto.',
    'perfil.erroSalvarPerfil': 'Não foi possível salvar suas alterações.',
    'perfil.fecharFoto': 'Fechar foto',
    'perfil.voltar': 'Voltar',

    'configuracoes.titulo': 'Configurações',
    'configuracoes.idioma': 'Idioma',
    'configuracoes.conta': 'Conta',
    'configuracoes.plano': 'Meu Plano',
    'configuracoes.semPlano': 'Nenhum plano selecionado',
    'configuracoes.verPlanos': 'Ver planos',
    'configuracoes.sair': 'Sair da conta',
    'configuracoes.sairMsg': 'Deseja sair da conta?',
    'configuracoes.confirmarSair': 'Sair',

    'ranking.geral': 'Ranking Geral',
    'ranking.subtitulo': 'Supere seus limites e conquiste o topo!',
    'ranking.semanal': 'Semanal',
    'ranking.mensal': 'Mensal',
    'ranking.todas': 'Geral',
    'ranking.dias': 'dias',
    'ranking.voce': 'VOCÊ',
    'ranking.treinos': 'treinos concluídos',
    'ranking.vazioTitulo': 'Ranking ainda não está disponível',
    'ranking.vazioTexto': 'Volte mais tarde para acompanhar sua posição.',

    'alimentacao.consumoDiario': 'Consumo Diário',
    'alimentacao.refeicoesHoje': 'Refeições de hoje',
    'alimentacao.minhasFotos': 'Minhas fotos',
    'alimentacao.semFotos': 'Nenhuma foto salva ainda.',
    'alimentacao.abasFotos': 'Fotos',
    'alimentacao.abasAlbuns': 'Álbuns',
    'alimentacao.abasHistorias': 'Histórias',
    'alimentacao.abasMais': 'Mais',
    'alimentacao.permissaoTitulo': 'Permissão necessária',
    'alimentacao.permissaoMsg': 'Precisamos acessar suas fotos para salvar seu progresso.',
    'alimentacao.erroSalvarFoto': 'Não foi possível salvar a foto.',
    'alimentacao.cameraIndisponivel': 'Câmera indisponível',
    'alimentacao.cameraMsg': 'Abra as configurações do dispositivo para permitir o acesso à câmera.',
    'alimentacao.cameraPermMsg': 'Precisamos da câmera para registrar sua refeição.',
    'alimentacao.erroCapturar': 'Não foi possível capturar a imagem.',

    'batimento.aguardando': 'Aguardando...',
    'batimento.altaPrecisao': '🟢 Alta precisão',
    'batimento.mediaPrecisao': '🟡 Média precisão',
    'batimento.baixaPrecisao': '🔴 Baixa precisão',
    'batimento.queimaDiaria': 'QUEIMA DIÁRIA',
    'batimento.localizacao': 'LOCALIZAÇÃO',
    'batimento.atualizar': 'Atualizar',
    'batimento.buscando': 'Buscando...',
    'batimento.precisao': 'Precisão:',
    'batimento.precisaoAnalise': 'Precisão em análise',
    'batimento.erroBloqueadoTitulo': 'Localização bloqueada',
    'batimento.erroBloqueadoMsg': 'Abra as configurações do aparelho para permitir o uso do GPS.',
    'batimento.erroPermissao': 'Permissão de localização negada.',
    'batimento.erroGps': 'GPS desativado. Ative a localização para continuar.',
    'batimento.erroObter': 'Não foi possível obter a localização agora.',

    'calorias.batimentoCardiaco': 'BATIMENTO CARDÍACO',
    'calorias.normal': 'Normal',
    'calorias.de': 'de',

    'mensal.mensal': 'Mensal',
    'mensal.anual': 'Anual',
    'mensal.eterno': 'Eterno',
    'mensal.cobradoMensalmente': 'Cobrado mensalmente',
    'mensal.cobradoAnualmente': 'Cobrado Anualmente',
    'mensal.compraUnica': 'Compra única',
    'mensal.benef1Titulo': 'Rotinas ilimitadas',
    'mensal.benef1Desc': 'Crie a rotina que quiser',
    'mensal.benef2Titulo': '10 tokens de IA todos os dias',
    'mensal.benef2Desc': 'Monte treinos com ajuda da inteligência artificial',
    'mensal.benef3Titulo': 'Estatísticas avançadas',
    'mensal.benef3Desc': 'Acompanhe sua evolução em detalhes',
    'mensal.benef4Titulo': 'Apoie nossa equipe',
    'mensal.benef4Desc': 'Ajude o GymVance a continuar evoluindo',
    'mensal.assinar': 'Assinar',
    'mensal.agoraNao': 'Agora não',
    'mensal.ativadoTitulo': 'Plano PRO ativado',
    'mensal.ativadoMsg': 'Seu plano {plano} foi selecionado com sucesso.',
    'mensal.erroAtivar': 'Não foi possível ativar o plano no momento.',
  },
  en: {
    'comum.usuario': 'User',
    'comum.cancelar': 'Cancel',
    'comum.descartar': 'Discard',
    'comum.entrar': 'Sign in',
    'comum.criarConta': 'Create account',
    'comum.erro': 'Error',
    'comum.erroSalvarDados': 'Could not save your data. Please try again.',
    'comum.avancar': 'Continue',
    'comum.evolucaoDiaria': 'Daily progress',
    'comum.ranking': 'Ranking',
    'comum.abrirRanking': 'Open ranking',

    'tipo.NORMAL': 'Set',
    'tipo.AQUECIMENTO': 'Warm-up',
    'tipo.PREPARATORIA': 'Preparation',
    'tipo.RECONHECIMENTO': 'Recognition',
    'tipo.BACK_OFF': 'Back-off set',
    'tipo.DROPSET': 'Dropset',
    'tipo.FALHA': 'Failure',

    'sessaoAtiva.tag': 'ACTIVE SESSION',
    'sessaoAtiva.semTitulo': 'Active Session',
    'sessaoAtiva.concluir': 'Finish',
    'sessaoAtiva.colSerie': 'Set',
    'sessaoAtiva.colNotas': 'Notes',
    'sessaoAtiva.acessibilidadeBadge': 'Change set type or remove set',
    'sessaoAtiva.descartarTreino': 'Discard Workout',
    'sessaoAtiva.confirmarDescartar': 'Are you sure you want to discard this workout? Your sets will be lost.',
    'sessaoAtiva.menuSubtitulo': 'Choose the set type or remove this set',
    'sessaoAtiva.removerSerie': 'Remove set',
    'sessaoAtiva.treinoConcluido': 'Workout completed',
    'sessaoAtiva.salvoHistorico': 'Your workout was saved to the local history.',
    'sessaoAtiva.erroSalvar': 'Could not save the workout locally.',
    'sessaoAtiva.serieLabel': 'Set',
    'sessaoAtiva.adicionarSerie': 'Set',
    'sessaoAtiva.notaPlaceholder': 'Add notes...',
    'sessaoAtiva.cancelar': 'Cancel',
    'sessaoAtiva.treinoVazio': 'Empty workout',
    'sessaoAtiva.treinoVazioMsg': 'Add at least one set before finishing the workout.',

    'novaSessao.usarSessao': 'Use created session',
    'novaSessao.titulo': 'Session title',
    'novaSessao.placeholderTitulo': 'Add a title...',

    'treinoHub.sessaoTreino': 'Workout Session',
    'treinoHub.iniciar': 'Start workout',
    'treinoHub.criar': 'Create workout session',

    'nav.treino': 'Workout',
    'nav.alimentacao': 'Food',
    'nav.relogio': 'Clock',

    'cadastro.titulo': 'Create your account',
    'cadastro.subtitulo': 'Start your journey with GymVance',
    'cadastro.email': 'Email',
    'cadastro.senha': 'Password',
    'cadastro.confirmarSenha': 'Confirm password',
    'cadastro.erroEmail': 'Enter a valid email.',
    'cadastro.erroSenhaCurta': 'The password must have at least 6 characters.',
    'cadastro.erroSenhasDiferentes': 'Passwords do not match.',
    'cadastro.jaTemConta': 'Already have an account?',

    'entrar.titulo': 'Welcome back!',
    'entrar.subtitulo': 'Sign in to your GymVance account',
    'entrar.aindaNaoTemConta': "Don't have an account yet?",
    'entrar.erroCredenciais': 'Email or password is incorrect. Check your credentials.',

    'peso.etapa': 'Step 2 of 4',
    'peso.titulo': "What's your weight?",
    'peso.obrigatorio': 'Weight required',
    'peso.erroValor': 'Enter a valid weight to continue.',

    'altura.etapa': 'Step 3 of 4',
    'altura.titulo': "What's your height?",
    'altura.nome': 'Height',
    'altura.obrigatoria': 'Height required',
    'altura.erroValor': 'Enter a valid height to continue.',

    'genero.etapa': 'Step 4 of 4',
    'genero.titulo': 'Create your profile',
    'genero.nome': 'Name',
    'genero.placeholderNome': 'Type your name',
    'genero.genero': 'Gender',
    'genero.homem': 'Man',
    'genero.mulher': 'Woman',
    'genero.helperGenero': 'We use gender to adapt workout volume, calorie burn and diet.',
    'genero.dataNascimento': 'Date of birth',
    'genero.placeholderData': 'DD/MM/YYYY',
    'genero.helperData': 'Enter your full birth date to personalize your progress.',
    'genero.erroNome': 'Name required',
    'genero.erroNomeMsg': 'Enter your name to continue.',
    'genero.erroData': 'Invalid date',
    'genero.erroDataMsg': 'Enter a valid birth date in DD/MM/YYYY format.',
    'genero.erroGenero': 'Gender required',
    'genero.erroGeneroMsg': 'Select your gender to continue.',

    'perfil.idioma': 'Language',
    'perfil.portugues': 'Português',
    'perfil.ingles': 'English',
    'perfil.meuPerfil': 'My Profile',
    'perfil.treinosConcluidos': 'Workouts completed',
    'perfil.salvarAlteracoes': 'Save changes',
    'perfil.minhaEvolucao': 'My Progress',
    'perfil.subtitulo': 'Track your photos and body progress',
    'perfil.antes': 'BEFORE',
    'perfil.depois': 'AFTER',
    'perfil.adicionarFoto': 'Add Photo',
    'perfil.medidasRecentes': 'Recent Measurements',
    'perfil.medida.peso': 'Weight',
    'perfil.medida.cintura': 'Waist',
    'perfil.medida.braco': 'Arm',
    'perfil.medida.peito': 'Chest',
    'perfil.editarPerfil': 'Edit Profile',
    'perfil.historico': 'History',
    'perfil.foto': 'photo',
    'perfil.fotos': 'photos',
    'perfil.registrada': 'registered',
    'perfil.registradas': 'registered',
    'perfil.nomeLabel': 'Name',
    'perfil.placeholderNome': 'Type your name',
    'perfil.emailLabel': 'Email',
    'perfil.placeholderEmail': 'Type your email',
    'perfil.galeriaBloqueada': 'Gallery blocked',
    'perfil.galeriaBloqueadaMsg': 'Allow photo access in settings to record your progress.',
    'perfil.abrirConfiguracoes': 'Open settings',
    'perfil.permissaoNecessaria': 'Permission required',
    'perfil.fotosPermissaoMsg': 'We need access to your photos to record your progress.',
    'perfil.erroAdicionarFoto': 'Could not add the photo.',
    'perfil.erroSalvarPerfil': 'Could not save your changes.',
    'perfil.fecharFoto': 'Close photo',
    'perfil.voltar': 'Back',

    'configuracoes.titulo': 'Settings',
    'configuracoes.idioma': 'Language',
    'configuracoes.conta': 'Account',
    'configuracoes.plano': 'My Plan',
    'configuracoes.semPlano': 'No plan selected',
    'configuracoes.verPlanos': 'View plans',
    'configuracoes.sair': 'Sign out',
    'configuracoes.sairMsg': 'Do you want to sign out?',
    'configuracoes.confirmarSair': 'Sign out',

    'ranking.geral': 'General Ranking',
    'ranking.subtitulo': 'Push your limits and reach the top!',
    'ranking.semanal': 'Weekly',
    'ranking.mensal': 'Monthly',
    'ranking.todas': 'All',
    'ranking.dias': 'days',
    'ranking.voce': 'YOU',
    'ranking.treinos': 'workouts completed',
    'ranking.vazioTitulo': 'Ranking not available yet',
    'ranking.vazioTexto': 'Come back later to check your position.',

    'alimentacao.consumoDiario': 'Daily Consumption',
    'alimentacao.refeicoesHoje': "Today's meals",
    'alimentacao.minhasFotos': 'My photos',
    'alimentacao.semFotos': 'No photos saved yet.',
    'alimentacao.abasFotos': 'Photos',
    'alimentacao.abasAlbuns': 'Albums',
    'alimentacao.abasHistorias': 'Stories',
    'alimentacao.abasMais': 'More',
    'alimentacao.permissaoTitulo': 'Permission required',
    'alimentacao.permissaoMsg': 'We need access to your photos to save your progress.',
    'alimentacao.erroSalvarFoto': 'Could not save the photo.',
    'alimentacao.cameraIndisponivel': 'Camera unavailable',
    'alimentacao.cameraMsg': 'Open the device settings to allow camera access.',
    'alimentacao.cameraPermMsg': 'We need the camera to record your meal.',
    'alimentacao.erroCapturar': 'Could not capture the image.',

    'batimento.aguardando': 'Waiting...',
    'batimento.altaPrecisao': '🟢 High accuracy',
    'batimento.mediaPrecisao': '🟡 Medium accuracy',
    'batimento.baixaPrecisao': '🔴 Low accuracy',
    'batimento.queimaDiaria': 'DAILY BURN',
    'batimento.localizacao': 'LOCATION',
    'batimento.atualizar': 'Refresh',
    'batimento.buscando': 'Searching...',
    'batimento.precisao': 'Accuracy:',
    'batimento.precisaoAnalise': 'Calculating accuracy',
    'batimento.erroBloqueadoTitulo': 'Location blocked',
    'batimento.erroBloqueadoMsg': 'Open the device settings to allow GPS use.',
    'batimento.erroPermissao': 'Location permission denied.',
    'batimento.erroGps': 'GPS is off. Turn on location to continue.',
    'batimento.erroObter': 'Could not get your location right now.',

    'calorias.batimentoCardiaco': 'HEART RATE',
    'calorias.normal': 'Normal',
    'calorias.de': 'of',

    'mensal.mensal': 'Monthly',
    'mensal.anual': 'Annual',
    'mensal.eterno': 'Forever',
    'mensal.cobradoMensalmente': 'Billed monthly',
    'mensal.cobradoAnualmente': 'Billed annually',
    'mensal.compraUnica': 'One-time purchase',
    'mensal.benef1Titulo': 'Unlimited routines',
    'mensal.benef1Desc': 'Create any routine you want',
    'mensal.benef2Titulo': '10 AI tokens every day',
    'mensal.benef2Desc': 'Build workouts with AI assistance',
    'mensal.benef3Titulo': 'Advanced statistics',
    'mensal.benef3Desc': 'Track your progress in detail',
    'mensal.benef4Titulo': 'Support our team',
    'mensal.benef4Desc': 'Help GymVance keep improving',
    'mensal.assinar': 'Subscribe',
    'mensal.agoraNao': 'Not now',
    'mensal.ativadoTitulo': 'PRO plan activated',
    'mensal.ativadoMsg': 'Your {plano} plan was selected successfully.',
    'mensal.erroAtivar': 'Could not activate the plan right now.',
  },
};

function traduzir(dicionario, chave, params) {
  if (!Object.prototype.hasOwnProperty.call(dicionario, chave)) {
    return chave;
  }
  let texto = dicionario[chave];
  if (params) {
    Object.keys(params).forEach((nome) => {
      texto = texto.replace(new RegExp(`\\{${nome}\\}`, 'g'), String(params[nome]));
    });
  }
  return texto;
}

const IdiomaContext = createContext({
  idioma: 'pt',
  definirIdioma: () => {},
  t: (chave) => chave,
  numero: (valor) => String(valor ?? 0),
});

export function IdiomaProvider({ children }) {
  const [idioma, setIdiomaEstado] = useState('pt');

  useEffect(() => {
    let ativo = true;

    getLanguage().then((salvo) => {
      if (ativo && salvo) {
        setIdiomaEstado(salvo);
      }
    });

    return () => {
      ativo = false;
    };
  }, []);

  const definirIdioma = useCallback((novo) => {
    const limpo = novo === 'en' ? 'en' : 'pt';
    setIdiomaEstado(limpo);
    setLanguageStorage(limpo);
  }, []);

  const t = useCallback(
    (chave, params) => {
      const en = TRADUCOES.en;
      const pt = TRADUCOES.pt;
      const dicionario = idioma === 'en' ? en : pt;
      const direto = traduzir(dicionario, chave, params);
      if (direto !== chave) {
        return direto;
      }
      const emIngles = traduzir(en, chave, params);
      if (emIngles !== chave) {
        return emIngles;
      }
      return '';
    },
    [idioma]
  );

  const numero = useCallback(
    (valor) => {
      if (valor === null || valor === undefined) {
        return '—';
      }
      return Number(valor).toLocaleString(idioma === 'pt' ? 'pt-BR' : 'en-US');
    },
    [idioma]
  );

  return (
    <IdiomaContext.Provider value={{ idioma, definirIdioma, t, numero }}>
      {children}
    </IdiomaContext.Provider>
  );
}

export function useIdioma() {
  return useContext(IdiomaContext);
}