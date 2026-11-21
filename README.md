# Ministério — app pessoal (PWA + Supabase)

Site estático (GitHub Pages) com login e banco de dados no Supabase. Sem servidor próprio.

## Configurar (uma vez)
1. Crie um projeto em https://supabase.com.
2. **SQL Editor → New query**: cole o conteúdo de `supabase/schema.sql` e rode (cria as tabelas com segurança por usuário).
3. **Project Settings → API**: copie a *Project URL* e a chave *anon / publishable* e cole em `config.js`.
4. **Authentication → Providers → Email**: para entrar logo após criar a conta, desligue "Confirm email".
   Depois de criar a sua conta, desligue também o cadastro de novos usuários (Sign In / Providers → *Allow new users to sign up*).
5. **Authentication → URL Configuration**: em *Site URL* coloque o endereço do GitHub Pages.

## Publicar
GitHub Pages: Settings → Pages → Deploy from branch → `main` / `(root)`.

## iPhone
Abra o endereço no **Safari** → Compartilhar → **Adicionar à Tela de Início**. Entre com sua conta dentro do app instalado.

## Backup
☰ → Cópia de Segurança → Exportar (JSON).
