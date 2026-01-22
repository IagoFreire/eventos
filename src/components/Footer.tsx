import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white/60 backdrop-blur-sm border-t border-[#E8DCC4] py-8 px-4 mt-auto">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-full flex items-center justify-center">
                <span className="text-white">✝</span>
              </div>
              <h3 className="text-lg text-[#B8860B] font-semibold">Igreja Comunidade</h3>
            </div>
            <p className="text-gray-600">Juntos em comunhão e fé</p>
          </div>
          <div>
            <h4 className="text-gray-800 font-semibold mb-3">Contato</h4>
            <p className="text-gray-600">Email: contato@igreja.com</p>
            <p className="text-gray-600">Telefone: (00) 0000-0000</p>
          </div>
          <div>
            <h4 className="text-gray-800 font-semibold mb-3">Redes Sociais</h4>
            <p className="text-gray-600">Instagram | Facebook | YouTube</p>
          </div>
        </div>
        <div className="text-center text-gray-600 pt-6 border-t border-[#E8DCC4]">
          <p>&copy; 2026 Igreja Comunidade. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
