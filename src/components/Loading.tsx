import React from 'react';

const Loading: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
      <div className="w-12 h-12 border-4 border-[#F5F5DC] border-t-[#D4AF37] rounded-full animate-spin"></div>
      <p className="text-[#D4AF37] font-medium">Carregando...</p>
    </div>
  );
};

export default Loading;
