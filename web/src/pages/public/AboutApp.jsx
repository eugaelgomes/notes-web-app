import {
  FiShield,
  FiZap,
  FiCompass,
  FiDatabase,
  FiMail,
  FiUsers,
  FiLock,
} from "react-icons/fi";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-12">
          <div className="flex-1 space-y-6">
            <span className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-300 border border-emerald-500/40 px-3 py-1.5 rounded-full text-xs tracking-wide uppercase">
              Notes • Produtividade segura na nuvem
            </span>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Centralize ideias, organize projetos e estude com tranquilidade.
            </h1>
            <p className="text-base md:text-lg text-slate-300 leading-relaxed">
              O Notes é uma plataforma full-stack criada para estudantes, times enxutos e profissionais
              que precisam registrar aprendizados, tarefas e documentações rápidas sem abrir mão de segurança.
              Utilizamos autenticação com Google para agilizar o acesso, respeitando as políticas de dados da plataforma.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <FiZap className="text-emerald-400 mt-1" size={24} />
                  <div>
                    <h2 className="text-lg font-semibold text-white">Fluxo rápido e responsivo</h2>
                    <p className="text-sm text-slate-400 mt-1">
                      Interface SPA com Vite, caching inteligente e paginação para lidar com grandes quantidades de notas.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <FiShield className="text-emerald-400 mt-1" size={24} />
                  <div>
                    <h2 className="text-lg font-semibold text-white">Segurança em primeiro lugar</h2>
                    <p className="text-sm text-slate-400 mt-1">
                      Cookies HttpOnly, tokens com expiração curta e criptografia de senhas garantem a proteção das contas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full max-w-sm bg-slate-900/70 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
            <h2 className="text-xl font-semibold text-white">Por que pedimos login Google?</h2>
            <ul className="space-y-4 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <FiUsers className="text-emerald-400 mt-1" size={18} />
                <span>Autenticação rápida e sem senha para reduzir atrito no cadastro.</span>
              </li>
              <li className="flex items-start gap-2">
                <FiLock className="text-emerald-400 mt-1" size={18} />
                <span>Utilizamos apenas nome, e-mail e avatar fornecidos pela API de perfil para criar sua conta segura.</span>
              </li>
              <li className="flex items-start gap-2">
                <FiShield className="text-emerald-400 mt-1" size={18} />
                <span>Não armazenamos sua senha do Google e nunca enviamos e-mails em nome da sua conta.</span>
              </li>
            </ul>
            <div className="bg-emerald-500/15 border border-emerald-500/40 rounded-2xl p-4 text-sm text-emerald-200">
              <p>
                Transparência total: todos os usos de dados estão descritos abaixo. Esse material atende aos
                requisitos de verificação OAuth da Google Cloud Platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-16 space-y-16">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 space-y-6">
            <div className="flex items-center gap-3">
              <FiCompass className="text-emerald-400" size={24} />
              <h2 className="text-2xl font-semibold">Nossa missão</h2>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Democratizar a gestão de conhecimento pessoal com uma experiência simples, acessível em qualquer dispositivo
              e integrada ao ecossistema Google. O Notes nasceu de uma jornada de estudos e hoje suporta times enxutos no dia a dia.
            </p>
            <div className="grid gap-3 text-sm text-slate-400">
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                <p className="font-semibold text-slate-100">Público alvo</p>
                <p>Estudantes, squads em incubação, consultores independentes e qualquer pessoa que precise registrar insights com velocidade.</p>
              </div>
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                <p className="font-semibold text-slate-100">Modo de uso</p>
                <p>Crie notas ricas com tags, busque com filtros avançados e compartilhe aprendizados com sua equipe em poucos cliques.</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 space-y-6">
            <div className="flex items-center gap-3">
              <FiDatabase className="text-emerald-400" size={24} />
              <h2 className="text-2xl font-semibold">Como tratamos seus dados</h2>
            </div>
            <ul className="space-y-4 text-sm text-slate-300 leading-relaxed">
              <li>
                <strong className="text-slate-100">Dados coletados pelo Google OAuth:</strong> nome, e-mail, foto de perfil e ID único para identificação segura.
              </li>
              <li>
                <strong className="text-slate-100">Uso interno apenas:</strong> informações são usadas para autenticar e sincronizar suas notas entre dispositivos.
              </li>
              <li>
                <strong className="text-slate-100">Armazenamento seguro:</strong> dados residem em banco PostgreSQL privado, protegido por redes internas Docker e backups criptografados.
              </li>
              <li>
                <strong className="text-slate-100">Revogação fácil:</strong> ao desconectar sua conta Google ou solicitar exclusão, removemos o vínculo imediatamente.
              </li>
            </ul>
            <p className="text-xs text-slate-500">
              Nenhum dado sensível adicional é solicitado. Seguimos o mínimo necessário para cumprir a finalidade da aplicação.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-7 space-y-4">
            <h3 className="text-xl font-semibold text-white">Compromissos de segurança</h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li>• Tokens JWT HS256 com expiração de 12h e renovação manual.</li>
              <li>• Cookies HttpOnly com SameSite adequado e uso de HTTPS em produção.</li>
              <li>• Controle de acesso nos endpoints via middlewares e validações fortes.</li>
            </ul>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-7 space-y-4">
            <h3 className="text-xl font-semibold text-white">Recursos principais</h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li>• Paginação inteligente e busca com debounce.</li>
              <li>• Organização por tags, filtros e ordenação customizável.</li>
              <li>• Upload de avatar e atualização de perfil em tempo real.</li>
            </ul>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-7 space-y-4">
            <h3 className="text-xl font-semibold text-white">Canais oficiais</h3>
            <p className="text-sm text-slate-300">
              Possui dúvidas sobre privacidade ou precisa de suporte? Fale com nosso time dedicado.
            </p>
            <div className="flex items-center gap-3 text-sm text-slate-200">
              <FiMail className="text-emerald-400" size={20} />
              <a href="mailto:privacidade@codaweb.com.br" className="hover:text-emerald-300 transition">
                privacidade@codaweb.com.br
              </a>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-200">
              <FiMail className="text-emerald-400" size={20} />
              <a href="mailto:suporte@codaweb.com.br" className="hover:text-emerald-300 transition">
                suporte@codaweb.com.br
              </a>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 space-y-6">
          <h2 className="text-2xl font-semibold">FAQ rápido para a verificação OAuth</h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-slate-300">
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-2">
              <p className="font-semibold text-slate-100">Quais escopos Google são usados?</p>
              <p>Apenas escopos básicos de perfil (`openid`, `email`, `profile`). Não solicitamos acesso a Drive, Calendar ou APIs sensíveis.</p>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-2">
              <p className="font-semibold text-slate-100">Existe compartilhamento com terceiros?</p>
              <p>Não. As informações de login são utilizadas exclusivamente para autenticação interna e personalização do seu painel.</p>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-2">
              <p className="font-semibold text-slate-100">Como solicitar exclusão?</p>
              <p>Envie um e-mail para <a className="text-emerald-300 hover:underline" href="mailto:privacidade@codaweb.com.br">privacidade@codaweb.com.br</a> informando o e-mail cadastrado. A remoção é realizada em até 48h.</p>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-2">
              <p className="font-semibold text-slate-100">Onde posso testar o app?</p>
              <p>Acesse <a className="text-emerald-300 hover:underline" href="https://notes.codaweb.com.br">notes.codaweb.com.br</a> ou solicite acesso ao ambiente de homologação via suporte.</p>
            </div>
          </div>
        </div>

        <footer className="pb-10 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Notes · Construído com Vite, Express.js e Docker.
        </footer>
      </section>
    </div>
  );
};

export default AboutPage;