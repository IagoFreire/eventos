# 🔌 Modo Offline

Guia completo para usar o sistema em modo offline com dados mockados.

## 🎯 Para que serve?

O modo offline permite desenvolver e testar o sistema **sem precisar do backend**, usando dados simulados (mocks). Isso é útil para:

- ✅ Desenvolver frontend enquanto backend está sendo desenvolvido
- ✅ Testar funcionalidades sem conexão com internet
- ✅ Demonstrar o sistema sem infraestrutura
- ✅ Desenvolver em viagens ou locais sem internet
- ✅ Onboarding de novos desenvolvedores
- ✅ Apresentações e demos

## 🚀 Como Usar

### Modo Simples

```bash
npm run dev-offline
```

Isso iniciará o servidor em modo offline automaticamente.

### Modo Manual (Alternativo)

Se preferir configurar manualmente:

```bash
# 1. Criar arquivo .env.local
echo "VITE_OFFLINE_MODE=true" > .env.local

# 2. Iniciar normalmente
npm run dev
```

## 🌐 URLs

```
Online:  http://localhost:5173  (com backend)
Offline: http://localhost:5173  (com mocks)
```

**A URL é a mesma!** O modo é detectado automaticamente.

## 🎭 Dados Mockados

### Credenciais de Login

```
Email: admin@igreja.com
Senha: admin123
```

### Eventos Disponíveis

1. **Retiro Espiritual 2026**
   - Data: 15/03/2026
   - Local: Serra da Mantiqueira, MG
   - Valor: R$ 350,00

2. **Congresso de Jovens 2026**
   - Data: 20/04/2026
   - Local: São Paulo, SP
   - Valor: R$ 180,00

3. **Escola Bíblica de Férias**
   - Data: 10/07/2026
   - Local: Rio de Janeiro, RJ
   - Valor: R$ 80,00

### Inscrições Mockadas

O sistema já vem com 6 inscrições de exemplo com diferentes status:
- 3 aprovadas (2 com check-in, 1 pendente)
- 1 pendente
- 1 rejeitada
- 1 para outro evento

## ✨ Funcionalidades Disponíveis

### ✅ Totalmente Funcionais

- [x] Visualizar página inicial
- [x] Ver detalhes dos eventos
- [x] Fazer inscrição (dados são salvos em memória)
- [x] Login administrativo
- [x] Painel de administração
- [x] Ver estatísticas
- [x] Buscar e filtrar inscrições
- [x] Editar inscrições
- [x] Fazer check-in
- [x] Simular pagamentos

### ⚠️ Limitações

- ❌ Dados não persistem após recarregar a página
- ❌ QR Code do PIX é apenas exemplo
- ❌ Emails não são enviados
- ❌ Webhooks não são processados

## 🧪 Testando Fluxos

### Fluxo de Inscrição

```
1. Acesse http://localhost:5173
2. Clique em "Faça sua inscrição"
3. Preencha os dados:
   - Nome: Teste da Silva
   - Email: teste@email.com
   - Telefone: (11) 98765-4321
   - CPF: 123.456.789-00
   - Endereço: Rua Teste, 123
4. Clique em "Próximo"
5. Escolha forma de pagamento
6. Clique em "Confirmar Pagamento"
7. ✅ Inscrição criada!
```

### Fluxo Administrativo

```
1. Acesse http://localhost:5173/login
2. Login:
   - Email: admin@igreja.com
   - Senha: admin123
3. Você será redirecionado para /admin
4. Teste as funcionalidades:
   - Ver estatísticas
   - Buscar inscrições
   - Filtrar por status
   - Editar uma inscrição
   - Fazer check-in
```

## 🔍 Console do Navegador

Abra o console (F12) para ver logs úteis:

```javascript
// Ao iniciar em modo offline:
🔌 [OFFLINE MODE] Usando API mockada
📝 Credenciais de teste:
   Email: admin@igreja.com
   Senha: admin123

// Ao fazer operações:
✅ [MOCK] Inscrição criada: { ... }
✅ [MOCK] Login bem-sucedido
✅ [MOCK] Check-in realizado: { ... }
```

## 🎨 Personalizando Mocks

### Adicionar Eventos

Edite `src/mocks/data.ts`:

```typescript
export const mockEvents: Event[] = [
  // ... eventos existentes
  {
    id: '4',
    title: 'Seu Novo Evento',
    description: 'Descrição do evento',
    date: '2026-05-10T19:00:00',
    location: 'Sua Cidade, Estado',
    price: 100.00,
    image_url: 'https://sua-imagem.jpg',
    max_participants: 200,
  },
];
```

### Adicionar Inscrições

Edite `src/mocks/data.ts`:

```typescript
export const mockRegistrations: Registration[] = [
  // ... inscrições existentes
  {
    id: 'reg-7',
    event_id: '1',
    name: 'Novo Participante',
    email: 'novo@email.com',
    phone: '(11) 98765-0000',
    cpf: '000.000.000-00',
    address: 'Novo endereço',
    payment_status: 'approved',
    checked_in: false,
    created_at: new Date().toISOString(),
  },
];
```

### Adicionar Usuários Admin

Edite `src/mocks/data.ts`:

```typescript
// Adicione mais credenciais válidas no mockApi.login()
if (email === 'novo@admin.com' && password === 'senha123') {
  return {
    token: mockToken,
    user: { ...mockAdmin, email: 'novo@admin.com' },
  };
}
```

## 🔄 Resetar Dados

Durante o desenvolvimento, os dados ficam na memória. Para resetar:

```javascript
// No console do navegador:
import { resetMockData } from './mocks/api';
resetMockData();
```

Ou simplesmente **recarregue a página** (F5).

## 🆚 Comparação

| Recurso | Online | Offline |
|---------|--------|---------|
| Backend necessário | ✅ Sim | ❌ Não |
| Internet necessária | ✅ Sim | ❌ Não |
| Dados persistem | ✅ Sim | ❌ Não |
| Pagamentos reais | ✅ Sim | ❌ Simulado |
| Emails enviados | ✅ Sim | ❌ Não |
| Velocidade | Normal | 🚀 Rápido |
| Setup | Complexo | ⚡ Imediato |

## 🛠️ Alternando Modos

### De Online para Offline

```bash
# Parar servidor online (Ctrl+C)
# Iniciar offline
npm run dev-offline
```

### De Offline para Online

```bash
# Parar servidor offline (Ctrl+C)
# Iniciar online
npm run dev
```

## 🔧 Configuração Avançada

### Latência Simulada

Por padrão, as operações têm um delay para simular rede real.

Ajustar em `src/mocks/data.ts`:

```typescript
// Delay padrão: 500ms
export const mockDelay = (ms: number = 500) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Sem delay (instantâneo):
export const mockDelay = (ms: number = 0) => 
  new Promise(resolve => setTimeout(resolve, ms));
```

### Status de Pagamento

Simular diferentes resultados de pagamento em `src/mocks/api.ts`:

```typescript
createPayment: async (paymentData: PaymentData) => {
  // Sempre aprovado (padrão)
  const payment = {
    status: 'approved',
    // ...
  };
  
  // Ou simular rejeição:
  // status: 'rejected',
  
  // Ou simular pendente:
  // status: 'pending',
  
  return payment;
}
```

## 📊 Estrutura dos Arquivos

```
src/
├── mocks/
│   ├── data.ts          # Dados mockados
│   └── api.ts           # API mockada
├── services/
│   ├── api.ts           # API real
│   └── apiSelector.ts   # Seletor de API
```

## 🎓 Como Funciona

1. **Seletor de API** (`apiSelector.ts`)
   - Verifica `VITE_OFFLINE_MODE`
   - Exporta API mockada ou real

2. **Contexts e Pages**
   - Importam de `apiSelector`
   - Não sabem qual API estão usando

3. **API Mock** (`mocks/api.ts`)
   - Simula todas as operações
   - Adiciona delays realistas
   - Loga operações no console

4. **Dados Mock** (`mocks/data.ts`)
   - Eventos de exemplo
   - Inscrições variadas
   - Usuários admin

## 💡 Dicas

### 1. Desenvolvimento Frontend
```bash
npm run dev-offline
# Desenvolva a UI sem se preocupar com backend
```

### 2. Demonstrações
```bash
npm run dev-offline
# Mostre o sistema funcionando sem infraestrutura
```

### 3. Testes de UI
```bash
npm run dev-offline
# Teste diferentes estados e fluxos
```

### 4. Onboarding
```bash
npm run dev-offline
# Novos devs podem ver o sistema funcionando imediatamente
```

## 🐛 Troubleshooting

### Não está funcionando offline

```bash
# Verificar variável de ambiente
console.log(import.meta.env.VITE_OFFLINE_MODE)
# Deve mostrar "true"

# Se não estiver, parar e reiniciar:
# Ctrl+C
npm run dev-offline
```

### Dados não aparecem

```bash
# Abrir console (F12)
# Deve ver mensagem:
# 🔌 [OFFLINE MODE] Usando API mockada

# Se não ver, verificar import:
# src/pages/xxx.tsx deve importar de apiSelector
```

### Login não funciona

```bash
# Credenciais de teste:
Email: admin@igreja.com
Senha: admin123

# Exatamente como está acima!
```

## 📚 Referências

- **Dados Mock:** `src/mocks/data.ts`
- **API Mock:** `src/mocks/api.ts`
- **Seletor:** `src/services/apiSelector.ts`
- **Script:** `package.json` (dev-offline)

## 🎉 Pronto para Usar!

```bash
npm run dev-offline
```

Acesse: http://localhost:5173

Login: `admin@igreja.com` / `admin123`

---

Desenvolvido para facilitar o desenvolvimento sem dependências! 🚀
