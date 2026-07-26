// Proxy de desenvolvimento para o backend Oddify (../oddify), que não tem CORS configurado e
// expõe suas rotas na raiz (sem prefixo /api), ex.: /ligas, /partidas, /analises, /bancas.
// Como essas mesmas raízes também são rotas de página do Angular (ex. tela "/ligas"), o `bypass`
// deixa a navegação/F5 do browser (Accept: text/html) cair no index.html em vez de ser
// encaminhada ao backend; só chamadas HttpClient (Accept: application/json) são de fato
// proxiadas.
const backend = 'http://localhost:8080';

const apiPaths = [
  '/ligas',
  '/equipes',
  '/jogadores',
  '/partidas',
  '/cotacoes',
  '/estatisticas-de-equipe',
  '/estatisticas-de-jogador',
  '/analises',
  '/bancas',
  '/apostas-multiplas',
  '/health'
];

module.exports = apiPaths.reduce((config, path) => {
  config[path] = {
    target: backend,
    secure: false,
    changeOrigin: true,
    bypass: (req) => {
      if (req.headers.accept && req.headers.accept.includes('html')) {
        return '/index.html';
      }
    }
  };
  return config;
}, {});
