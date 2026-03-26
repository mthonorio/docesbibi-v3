import React from "react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contato" className="bg-marrom-900 text-marrom-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div>
            <h3 className="font-serif text-2xl font-bold text-rosa-600 mb-4">
              Doces Bibi
            </h3>
            <p className="text-marrom-300 text-sm">
              Confeitaria artesanal com amor em cada detalhe.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#home" className="text-marrom-300 hover:text-rosa-600">
                  Início
                </a>
              </li>
              <li>
                <a
                  href="#produtos"
                  className="text-marrom-300 hover:text-rosa-600"
                >
                  Produtos
                </a>
              </li>
              <li>
                <a
                  href="#sobre"
                  className="text-marrom-300 hover:text-rosa-600"
                >
                  Sobre
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Atendimento</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://wa.me/83986513392"
                  className="text-marrom-300 hover:text-rosa-600"
                >
                  (83) 98651-3392
                </a>
              </li>
              <li>
                <a
                  href="mailto:docesbibi@gmail.com"
                  className="text-marrom-300 hover:text-rosa-600"
                >
                  docesbibi@gmail.com
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Redes Sociais</h4>
            <div className="flex gap-4">
              {/* <a href="#" className="text-marrom-300 hover:text-rosa-600">
                  Facebook
                </a> */}
              <a
                href="https://www.instagram.com/doce_sbibi/"
                className="text-marrom-300 hover:text-rosa-600"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-marrom-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-marrom-400 text-sm mb-4 md:mb-0">
            &copy; &nbsp; {currentYear} Doces Bibi. Todos os direitos
            reservados.
          </p>
          {/* <div className="flex gap-6 text-sm">
            <a href="#" className="text-marrom-400 hover:text-rosa-600">
              Privacidade
            </a>
            <a href="#" className="text-marrom-400 hover:text-rosa-600">
              Termos
            </a>
          </div> */}
        </div>
      </div>
    </footer>
  );
}
