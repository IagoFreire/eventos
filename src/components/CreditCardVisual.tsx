import React from 'react';
import { CreditCard } from 'lucide-react';

interface CreditCardVisualProps {
  cardNumber: string;
  cardholderName: string;
  expirationMonth: string;
  expirationYear: string;
  isFlipped?: boolean;
}

const CreditCardVisual: React.FC<CreditCardVisualProps> = ({
  cardNumber,
  cardholderName,
  expirationMonth,
  expirationYear,
  isFlipped = false,
}) => {
  // Formatar número do cartão com espaços
  const formatCardNumber = (number: string) => {
    const cleaned = number.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g) || [];
    return groups.join(' ').padEnd(19, '•');
  };

  // Formatar nome (máximo 20 caracteres, mantém espaços)
  const formatName = (name: string) => {
    if (!name) return 'SEU NOME AQUI';
    // Mantém espaços e converte para maiúsculas
    const formatted = name.toUpperCase();
    // Limita a 20 caracteres mas preserva espaços
    return formatted.length > 20 ? formatted.slice(0, 20) : formatted;
  };

  // Formatar validade
  const formatExpiry = (month: string, year: string) => {
    const mm = month.padStart(2, '0').slice(0, 2) || 'MM';
    const yy = year.slice(0, 2) || 'AA';
    return `${mm}/${yy}`;
  };

  // Detectar tipo de cartão pelo número
  const getCardType = (number: string) => {
    const cleaned = number.replace(/\s/g, '');
    if (cleaned.startsWith('4')) return 'visa';
    if (cleaned.startsWith('5')) return 'mastercard';
    if (cleaned.startsWith('3')) return 'amex';
    return 'default';
  };

  const cardType = getCardType(cardNumber);
  const displayNumber = formatCardNumber(cardNumber);
  const displayName = formatName(cardholderName);
  const displayExpiry = formatExpiry(expirationMonth, expirationYear);

  return (
    <div className="relative perspective-1000">
      <div
        className={`relative w-[317px] h-[200px] transition-transform duration-700 transform-style-preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Frente do Cartão */}
        <div
          className="absolute inset-0 backface-hidden rounded-2xl p-8 text-white shadow-2xl overflow-hidden card-glow"
          style={{
            background: cardType === 'visa'
              ? 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
              : cardType === 'mastercard'
              ? 'linear-gradient(135deg, #eb001b 0%, #f79e1b 100%)'
              : cardType === 'amex'
              ? 'linear-gradient(135deg, #006fcf 0%, #00a8e8 100%)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            transform: 'rotateY(0deg)',
            backfaceVisibility: 'hidden',
          }}
        >
          {/* Efeito de brilho animado */}
          <div className="absolute inset-0 opacity-20 card-shine"></div>
          {/* Chip e Logo */}
          <div className="flex justify-between items-start mb-5">
            <div className="w-9 h-7 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-md flex items-center justify-center shadow-lg">
              <div className="w-5 h-4 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-sm"></div>
            </div>
            <div className="text-base font-bold opacity-90">
              {cardType === 'visa' && 'VISA'}
              {cardType === 'mastercard' && 'MC'}
              {cardType === 'amex' && 'AMEX'}
            </div>
          </div>

          {/* Número do Cartão */}
          <div className="mb-5">
            <p className="text-[9px] text-white/70 mb-1.5 tracking-wider">NÚMERO DO CARTÃO</p>
            <div className="text-lg font-mono tracking-widest font-semibold">
              {displayNumber.split('').map((char, index) => {
                const isNewChar = index < cardNumber.replace(/\s/g, '').length;
                return (
                  <span
                    key={index}
                    className="inline-block transition-all duration-200"
                    style={{
                      animation: isNewChar && char !== '•' ? 'charAppear 0.3s ease-out' : 'none',
                      color: isNewChar ? 'white' : 'rgba(255, 255, 255, 0.5)',
                    }}
                  >
                    {char}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Nome e Validade */}
          <div className="flex justify-between items-end mt-1.5">
            <div className="flex-1 pr-4">
              <p className="text-[9px] text-white/70 mb-1 tracking-wider">PORTADOR</p>
              <p className="text-xs font-semibold tracking-wide">
                {displayName.split('').map((char, index) => {
                  const isNewChar = index < cardholderName.length;
                  return (
                    <span
                      key={index}
                      className="inline-block transition-all duration-200"
                      style={{
                        animation: isNewChar && char !== ' ' ? 'charAppear 0.3s ease-out' : 'none',
                        color: isNewChar ? 'white' : 'rgba(255, 255, 255, 0.5)',
                        width: char === ' ' ? '0.25em' : 'auto',
                      }}
                    >
                      {char}
                    </span>
                  );
                })}
              </p>
            </div>
            <div className="text-right pl-4">
              <p className="text-[9px] text-white/70 mb-1 tracking-wider">VÁLIDO ATÉ</p>
              <p className="text-xs font-semibold tracking-wider">
                {displayExpiry.split('').map((char, index) => {
                  const isNewChar = (index === 0 && expirationMonth.length > 0) || 
                                   (index === 1 && expirationMonth.length > 1) ||
                                   (index === 3 && expirationYear.length > 0) ||
                                   (index === 4 && expirationYear.length > 1);
                  return (
                    <span
                      key={index}
                      className="inline-block transition-all duration-200"
                      style={{
                        animation: isNewChar && char !== '/' ? 'charAppear 0.3s ease-out' : 'none',
                        color: isNewChar ? 'white' : 'rgba(255, 255, 255, 0.5)',
                      }}
                    >
                      {char}
                    </span>
                  );
                })}
              </p>
            </div>
          </div>

          {/* Decoração */}
          <div className="absolute bottom-5 right-5 opacity-20">
            <CreditCard className="w-10 h-10" />
          </div>
        </div>

        {/* Verso do Cartão (para futuro uso com CVV) */}
        <div
          className="absolute inset-0 backface-hidden rounded-2xl p-6 text-white shadow-2xl"
          style={{
            background: cardType === 'visa'
              ? 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
              : cardType === 'mastercard'
              ? 'linear-gradient(135deg, #eb001b 0%, #f79e1b 100%)'
              : cardType === 'amex'
              ? 'linear-gradient(135deg, #006fcf 0%, #00a8e8 100%)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden',
          }}
        >
          <div className="h-full flex flex-col">
            <div className="h-12 bg-black mt-4 mb-6"></div>
            <div className="bg-white rounded px-4 py-2 text-black text-sm">
              <p className="text-xs text-gray-500 mb-1">CVV</p>
              <p className="text-right font-mono">•••</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes charAppear {
          0% { 
            opacity: 0; 
            transform: translateY(-10px) scale(0.8); 
          }
          50% {
            transform: translateY(2px) scale(1.1);
          }
          100% { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        @keyframes shine {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          100% { transform: translateX(200%) translateY(200%) rotate(45deg); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.1); }
          50% { box-shadow: 0 0 30px rgba(255, 255, 255, 0.2); }
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .card-glow {
          animation: glow 3s ease-in-out infinite;
        }
        .card-shine {
          background: linear-gradient(
            45deg,
            transparent 30%,
            rgba(255, 255, 255, 0.3) 50%,
            transparent 70%
          );
          animation: shine 3s infinite;
        }
      `}</style>
    </div>
  );
};

export default CreditCardVisual;
