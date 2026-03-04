import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="text-center p-4 text-sm text-gray-500 border-t bg-white">
            © {new Date().getFullYear()} VinhoStock. Todos os direitos reservados.
        </footer>
    );
};

export default Footer;
