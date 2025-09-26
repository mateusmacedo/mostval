# Regras do Projeto (Agent + Inline Edit, @Cursor Rules)

Estas regras são consumidas pelo Agent e pelo Inline Edit como contexto persistente do repositório. Permanecem versionadas junto ao código em `.cursor/rules/`, com escopo limitado ao repositório e modularização por domínio.

- Para incluir explicitamente estas regras no contexto de uma conversa ou edição, usar `@Cursor Rules`.
- Para tarefas que dependem de documentação sensível a versão (APIs/SDKs/CLIs/flags), adicionar `use context7` ao prompt e declarar a versão consultada.
