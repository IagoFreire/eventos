import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>✝ Igreja</h3>
            <p>Juntos em comunhão e fé</p>
          </div>
          <div className="footer-section">
            <h4>Contato</h4>
            <p>Email: contato@igreja.com</p>
            <p>Telefone: (00) 0000-0000</p>
          </div>
          <div className="footer-section">
            <h4>Redes Sociais</h4>
            <p>Instagram | Facebook | YouTube</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Igreja. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
