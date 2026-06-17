# Eventos

> Sistema de inscrições para eventos com pagamento integrado e gestão completa

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)

## Funcionalidades

- Formulário de inscrição em múltiplas etapas (dados pessoais + pagamento)
- Integração com Mercado Pago: PIX e cartão de crédito
- Geração de ingresso com QR Code único por participante
- Consulta de ingresso por CPF
- Painel administrativo com dashboard de estatísticas e filtros
- Sistema de check-in via scanner de QR Code
- Exportação de dados dos participantes
- Configuração completa do evento via painel (título, imagem, datas, perguntas personalizadas)

## Tecnologias

**Frontend:** React 19, TypeScript, Vite, React Router, Tailwind CSS  
**Backend:** Node.js, Express, PostgreSQL / Supabase  
**Integrações:** Mercado Pago API, JWT

## Como rodar

```bash
npm install
cp env.example .env
npm run dev
```

> Configure `MERCADO_PAGO_ACCESS_TOKEN`, `DATABASE_URL` e `JWT_SECRET` no `.env`.