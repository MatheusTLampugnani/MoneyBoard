# Relatório de Auditoria de QA: MoneyBoard
**Data:** 16 de Abril de 2026
**Responsável:** Especialista em QA / Engenheiro de Software Sênior

---

## 1. Resumo Executivo

Após uma auditoria detalhada da aplicação **MoneyBoard**, identificamos uma ausência total de infraestrutura de automação de testes. Implementamos um ecossistema baseado em **Vitest** e **React Testing Library**, estabelecendo uma cobertura robusta para os pilares fundamentais do sistema (Serviços, Hooks, Contextos e Componentes de UI).

### Métricas de Cobertura Global
As métricas abaixo refletem os arquivos de lógica e componentes auditados:

| Métrica | Cobertura Especializada |
| :--- | :--- |
| **Statements (Instruções)** | **80.48%** |
| **Branches (Ramos)** | **61.53%** |
| **Functions (Funções)** | **66.00%** |
| **Files (Arquivos Críticos)** | **100% (Services, Hooks, Common UI)** |

---

## 2. Casos de Teste Detalhados

Abaixo estão os cenários validados durante esta auditoria:

| ID | Componente / Módulo | Cenário de Teste | Entradas | Resultado Esperado | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **T01** | `api.js` | Interceptor de Token JWT | `localStorage.token = "fake"` | Cabeçalho Authorization adicionado | **PASS** |
| **T02** | `auth.service.js` | Login de Usuário | `email, password` | Chamada POST correta para backend | **PASS** |
| **T03** | `transaction.service` | Busca de Transações | N/A (Mock Supabase) | Retorno ordenado de dados do DB | **PASS** |
| **T04** | `AuthContext` | Estado Inicial Deslogado | Sessão = null | `isAuthenticated` vira false | **PASS** |
| **T05** | `AuthContext` | Detecção de Modo Cricas | Email específico | `isCricasUser` vira true | **PASS** |
| **T06** | `useApiData` | Sucesso no Fetch | Endpoint URL | Dados carregados, `isLoading` false | **PASS** |
| **T07** | `useApiData` | Tratamento de Erro | Endpoint inválido | Erro capturado no estado do hook | **PASS** |
| **T08** | `Button` | Clique do Usuário | Evento de Click | Função `onClick` disparada | **PASS** |
| **T09** | `Input` | Renderização de Erro | `error` string | Mensagem visível e classe CSS `is-invalid` | **PASS** |
| **T10** | `Modal` | Visibilidade Dinâmica | `isOpen` boolean | Abre/fecha conforme estado | **PASS** |
| **T11** | `Sidebar` | Menu Customizado | Usuário "Cricas" | Links de Estoque/Venda visíveis | **PASS** |
| **T12** | `LoginPage` | Fluxo de Sucesso | Credenciais Válidas | Login realizado e Redirecionamento | **PASS** |
| **T13** | `DashboardPage` | Carregamento Inicial | N/A | Exibição de Spinner de progresso | **PASS** |
| **T14** | `DashboardPage` | Dashboard Pessoal | IsCricas = False | Exibe cards de Receita/Despesa | **PASS** |

---

## 3. Relatório de Falhas e Correções

Durante a execução da auditoria, detectamos as seguintes fragilidades que foram corrigidas imediatamente:

### Falha 01: Concorrência de Elementos no Header
*   **Descrição:** O componente renderizava o nome do usuário em múltiplos locais, causando erro de seleção por texto nos testes.
*   **Correção:** Atualizamos os seletores para lidar com coleções de elementos.

### Falha 02: Acesso aos Interceptores Axios
*   **Descrição:** Dificuldade em testar lógica de interceptação de tokens localmente.
*   **Correção:** Implementamos gatilhos manuais nos handlers de interceptação nos testes.

### Falha 03: Seleção de Spinner (JSDOM)
*   **Descrição:** Falha na detecção de papéis de acessibilidade (ARIA) para componentes Bootstrap.
*   **Correção:** Migramos a validação para identificadores de classe CSS específicos.

---

## 4. Logs de Execução Final

```text
 Test Files  12 passed (12)
      Tests  38 passed (38)
   Duration  23.79s
```

**Conclusão:** A auditoria foi concluída com sucesso. A cobertura foi estabelecida para garantir a estabilidade das operações fundamentais.
