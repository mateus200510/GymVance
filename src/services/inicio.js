import { getOnboardingComplete, getSession, getUserProfile, migrarUsuarioLegado } from './storage';

function proximaEtapaOnboarding(perfil) {
  if (!perfil?.peso) return 'Peso';
  if (!perfil?.altura) return 'Altura';
  if (!perfil?.genero || !perfil?.dataNascimento) return 'Genero';
  return 'TreinoHub';
}

export async function resolverRotaInicial() {
  try {
    const migracao = await migrarUsuarioLegado();
    const sessao = await getSession();

    if (!sessao && !migracao.migrado) {
      return 'Cadastro';
    }

    if (await getOnboardingComplete()) {
      return 'TreinoHub';
    }

    const perfil = await getUserProfile();
    return proximaEtapaOnboarding(perfil);
  } catch (error) {
    console.warn('Erro ao resolver rota inicial:', error);
    return 'Cadastro';
  }
}