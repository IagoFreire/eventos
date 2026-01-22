# 🎫 Página de Confirmação com Ingresso

Documentação da funcionalidade de geração de ingresso após inscrição.

## 🎯 Funcionalidade

Após completar a inscrição e o pagamento, o usuário é redirecionado para uma página de confirmação que exibe um **ingresso visual** completo e profissional.

## 📍 Rota

```
/confirmacao?id=[id-da-inscricao]
```

## ✨ Características do Ingresso

### 🎨 Design

O ingresso possui um design elegante e profissional com:

- ✅ **Header dourado** com logo da igreja
- ✅ **Informações do evento** (título, data, local)
- ✅ **Dados do participante** (nome, email, telefone, CPF)
- ✅ **QR Code** visual (SVG gerado)
- ✅ **Código de verificação** único
- ✅ **Status do pagamento** com badge colorido
- ✅ **Linha perfurada** simulando ticket real
- ✅ **Paleta de cores** branco/bege/dourado

### 📋 Informações Exibidas

#### Evento
- Título do evento
- Data e hora formatada
- Local completo
- Valor pago

#### Participante
- Nome completo
- Email
- Telefone
- CPF
- Endereço (opcional)

#### Verificação
- Código da inscrição (ID único)
- QR Code visual
- Status do pagamento
- Data de criação

## 🔄 Fluxo de Uso

```
1. Usuário preenche formulário (Etapa 1)
   ↓
2. Usuário confirma pagamento (Etapa 2)
   ↓
3. Sistema processa pagamento
   ↓
4. Redireciona para /confirmacao?id=xxx
   ↓
5. Página carrega dados da inscrição
   ↓
6. Exibe ingresso visual completo
```

## 💾 Ações Disponíveis

### 🖨️ Imprimir Ingresso
```typescript
handlePrint() {
  window.print();
}
```

Usa a função nativa do navegador para imprimir. O CSS de impressão esconde elementos desnecessários e otimiza o ingresso para papel.

### 💾 Baixar PDF
```typescript
handleDownload() {
  // Funcionalidade a ser implementada
  // Pode usar bibliotecas como jsPDF ou html2canvas
}
```

Placeholder para funcionalidade futura de download em PDF.

### ➕ Nova Inscrição
```typescript
handleNewRegistration() {
  resetRegistration(); // Limpa contexto
  navigate('/');       // Volta para home
}
```

Reseta o processo de inscrição e permite criar uma nova.

## 🎨 CSS Print-Friendly

O ingresso possui estilos especiais para impressão:

```css
@media print {
  /* Esconde elementos desnecessários */
  .success-header,
  .confirmation-actions,
  .important-info,
  .ticket-perforation {
    display: none;
  }

  /* Otimiza o ticket para papel */
  .ticket {
    box-shadow: none;
    border: 2px solid #d4af37;
  }

  /* Evita quebra de página */
  .ticket-wrapper {
    page-break-inside: avoid;
  }
}
```

## 🔍 QR Code

### Geração

O QR Code é gerado como SVG usando retângulos posicionados:

```tsx
<svg viewBox="0 0 100 100" width="120" height="120">
  <rect width="100" height="100" fill="white"/>
  <g fill="#d4af37">
    {/* Padrão de QR Code simplificado */}
    <rect x="5" y="5" width="15" height="15"/>
    {/* ... mais retângulos ... */}
  </g>
</svg>
```

### Dados do QR Code (Futuro)

Para implementar QR Code real, use bibliotecas como:

```bash
npm install qrcode.react
```

```tsx
import QRCode from 'qrcode.react';

<QRCode
  value={`REG-${registration.id}-${registration.email}`}
  size={120}
  fgColor="#d4af37"
  bgColor="#ffffff"
/>
```

## 📱 Responsividade

O ingresso é totalmente responsivo:

### Desktop (> 768px)
- Layout horizontal completo
- QR Code ao lado das informações
- Todos os detalhes visíveis

### Mobile (< 768px)
- Layout vertical
- QR Code acima dos dados
- Informações empilhadas
- Botões em coluna

## 🔐 Segurança

### Validação de ID

```typescript
const regId = searchParams.get('id') || registrationId;

if (!regId) {
  navigate('/'); // Redireciona se não houver ID
  return;
}
```

### Carregamento de Dados

```typescript
// Tenta carregar da API
const registrations = await api.getRegistrations();
const found = registrations.find(r => r.id === regId);

// Fallback para dados do contexto
if (!found && formData.name) {
  // Usa dados do formulário
}
```

## 🎯 Estados da Página

### ⏳ Carregando
```tsx
if (loading) {
  return <Loading />;
}
```

### ❌ Erro (ID não encontrado)
```tsx
if (!registration) {
  return (
    <div className="error-container">
      <h1>❌ Inscrição não encontrada</h1>
      <button onClick={() => navigate('/')}>
        Voltar para o início
      </button>
    </div>
  );
}
```

### ✅ Sucesso
```tsx
return (
  <div className="confirmation">
    <div className="success-header">
      <div className="success-icon">✓</div>
      <h1>Inscrição Confirmada!</h1>
    </div>
    <div className="ticket">
      {/* Ingresso completo */}
    </div>
  </div>
);
```

## 🎨 Animações

### Entrada da Página
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.success-header {
  animation: fadeIn 0.6s ease-out;
}
```

### Ícone de Sucesso
```css
@keyframes scaleIn {
  0% { transform: scale(0); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.success-icon {
  animation: scaleIn 0.5s ease-out;
}
```

### Ticket
```css
@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.ticket-wrapper {
  animation: slideUp 0.6s ease-out 0.2s backwards;
}
```

## 📊 Estrutura de Componentes

```
Confirmation
├── success-header
│   ├── success-icon (animado)
│   ├── título
│   └── mensagem
│
├── ticket-wrapper
│   ├── ticket
│   │   ├── ticket-header (dourado)
│   │   ├── ticket-event (info do evento)
│   │   ├── ticket-divider (linha decorativa)
│   │   ├── ticket-participant (dados)
│   │   └── ticket-footer (código + status)
│   └── ticket-perforation (bolinhas)
│
├── confirmation-actions
│   ├── btn-imprimir
│   ├── btn-download
│   └── btn-nova-inscricao
│
└── important-info
    └── lista de instruções
```

## 🔄 Integração com Fluxo

### Registration.tsx

```typescript
// Após pagamento bem-sucedido
const payment = await api.createPayment(paymentData);
navigate(`/confirmacao?id=${registrationId}`);
```

### Context

```typescript
// RegistrationContext mantém dados durante navegação
const { registrationId, formData } = useRegistration();
```

### App.tsx

```typescript
<Route path="/confirmacao" element={<Confirmation />} />
```

## 🚀 Melhorias Futuras

### 1. Download PDF Real
```bash
npm install jspdf html2canvas
```

```typescript
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const handleDownload = async () => {
  const element = ticketRef.current;
  const canvas = await html2canvas(element);
  const imgData = canvas.toDataURL('image/png');
  
  const pdf = new jsPDF();
  pdf.addImage(imgData, 'PNG', 10, 10);
  pdf.save('ingresso.pdf');
};
```

### 2. QR Code Real
```typescript
import QRCode from 'qrcode.react';

<QRCode
  value={JSON.stringify({
    id: registration.id,
    event: event.id,
    email: registration.email,
    timestamp: Date.now()
  })}
  size={120}
  level="H"
/>
```

### 3. Envio por Email
```typescript
// No backend
import nodemailer from 'nodemailer';

async function sendTicketEmail(registration) {
  const transporter = nodemailer.createTransport({...});
  
  await transporter.sendMail({
    to: registration.email,
    subject: 'Seu ingresso - ' + event.title,
    html: generateTicketHTML(registration),
    attachments: [{
      filename: 'ingresso.pdf',
      content: generateTicketPDF(registration)
    }]
  });
}
```

### 4. Compartilhar em Redes Sociais
```typescript
const handleShare = () => {
  if (navigator.share) {
    navigator.share({
      title: 'Minha inscrição confirmada!',
      text: `Estou inscrito no ${event.title}!`,
      url: window.location.href
    });
  }
};
```

### 5. Adicionar ao Calendário
```typescript
const handleAddToCalendar = () => {
  const startDate = new Date(event.date);
  const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000);
  
  const icsContent = `
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${event.title}
DTSTART:${formatDateICS(startDate)}
DTEND:${formatDateICS(endDate)}
LOCATION:${event.location}
DESCRIPTION:ID: ${registration.id}
END:VEVENT
END:VCALENDAR
  `.trim();
  
  const blob = new Blob([icsContent], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'evento.ics';
  a.click();
};
```

## 📞 Informações de Contato

A página exibe informações importantes:

- Como usar o ingresso
- Quando chegar ao evento
- Contato para dúvidas
- Confirmação por email

## ✅ Checklist de Implementação

- [x] Página criada (`Confirmation.tsx`)
- [x] Estilos aplicados (`Confirmation.css`)
- [x] Rota adicionada (`/confirmacao`)
- [x] Integração com fluxo de inscrição
- [x] Design responsivo
- [x] Animações de entrada
- [x] Estilos de impressão
- [x] QR Code visual (SVG)
- [x] Informações completas
- [x] Ações (imprimir, download, nova inscrição)
- [ ] Download PDF real (futuro)
- [ ] QR Code escaneável (futuro)
- [ ] Envio por email (futuro)

## 🎉 Resultado

Uma página de confirmação profissional e completa que:

✨ Confirma visualmente a inscrição  
✨ Gera um ingresso bonito e funcional  
✨ Pode ser impresso facilmente  
✨ Fornece todas as informações necessárias  
✨ Melhora a experiência do usuário  
✨ Segue o design system da igreja  

---

Desenvolvido com ❤️ para proporcionar uma excelente experiência aos participantes!
