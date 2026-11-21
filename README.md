# Meu relatório — app pessoal (PWA + Supabase)

Site estático (GitHub Pages) com login e banco de dados no Supabase. Sem servidor próprio.

## Configurar (uma vez)
(Já feito: projeto `ministerio` criado, `supabase/schema.sql` aplicado e `config.js` preenchido.)
4. **Authentication → Providers → Email**: para entrar logo após criar a conta, desligue "Confirm email".
   Depois de criar a sua conta, desligue também o cadastro de novos usuários (Sign In / Providers → *Allow new users to sign up*).
5. **Authentication → URL Configuration**: em *Site URL* coloque o endereço do GitHub Pages.

## Publicar
GitHub Pages: Settings → Pages → Deploy from branch → `main` / `(root)`.

## iPhone
Abra o endereço no **Safari** → Compartilhar → **Adicionar à Tela de Início**. Entre com sua conta dentro do app instalado.

## Backup
☰ → Cópia de Segurança → Exportar (JSON).

## Conta
- **Esqueci a senha:** tela de login → "Esqueci a senha" (link por e-mail; ao abrir o link, defina a nova senha).
- **Alterar nome/senha/e-mail e Excluir conta:** ☰ → Configurações. Excluir apaga a conta e todos os dados.
- No painel do Supabase (Authentication → URL Configuration), inclua o endereço do site em *Redirect URLs* para os links de e-mail funcionarem.

## iPhone — tela de abertura
Há imagens de abertura para iPhone 11 em diante (`splash/`). O iOS guarda a imagem de abertura no momento da instalação:
se você já instalou antes, **remova o ícone e adicione de novo** à Tela de Início para ver o nome, o ícone e a tela nova.
