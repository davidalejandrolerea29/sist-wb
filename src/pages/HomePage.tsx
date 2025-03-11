import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Menu, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth, useUserRole, signOut } from '../lib/auth';

interface News {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  image_url: string;
  created_at: string;
}

const categories = [
  {
    name: "Gastronomía",
    subCategories: ["Restaurantes", "Recetas", "Chefs"]
  },
  {
    name: "Lifestyle",
    subCategories: ["Moda", "Belleza", "Bienestar"]
  },
  {
    name: "Negocios",
    subCategories: ["Emprendimiento", "Finanzas", "Tecnología"]
  },
  {
    name: "Turismo",
    subCategories: ["Nacional", "Internacional", "Aventura"]
  },
  {
    name: "Nosotros",
    subCategories: ["Equipo", "Historia", "Contacto"]
  }
];

export function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [news, setNews] = useState<News[]>([]);
  const { user } = useAuth();
  const role = useUserRole();

  useEffect(() => {
    fetchNews();
  }, []);

  async function fetchNews() {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      if (data) setNews(data);
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-gray-900 p-2"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-800">NewsPortal</h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {categories.map((category) => (
                <div
                  key={category.name}
                  className="relative group"
                  onMouseEnter={() => setActiveCategory(category.name)}
                  onMouseLeave={() => setActiveCategory(null)}
                >
                  <a
                    href={`#${category.name.toLowerCase()}`}
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                  >
                    {category.name}
                  </a>
                  {/* Dropdown menu */}
                  <div className={`absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ${activeCategory === category.name ? 'block' : 'hidden'}`}>
                    {category.subCategories.map((subCategory) => (
                      <a
                        key={subCategory}
                        href={`#${subCategory.toLowerCase()}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {subCategory}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            {/* Search and Auth */}
            <div className="flex items-center space-x-4">
              <div className="relative w-64">
                <input
                  type="text"
                  placeholder="Buscar noticias..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
              </div>
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/admin"
                    className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                  >
                    Panel Admin
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                >
                  Iniciar Sesión
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {categories.map((category) => (
                <div key={category.name} className="space-y-1">
                  <button
                    onClick={() => setActiveCategory(activeCategory === category.name ? null : category.name)}
                    className="w-full text-left px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  >
                    {category.name}
                  </button>
                  {activeCategory === category.name && (
                    <div className="pl-6 space-y-1">
                      {category.subCategories.map((subCategory) => (
                        <a
                          key={subCategory}
                          href={`#${subCategory.toLowerCase()}`}
                          className="block px-3 py-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                        >
                          {subCategory}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Article (Left) */}
          <div className="lg:col-span-5">
            {news[0] && (
              <article className="bg-white rounded-lg overflow-hidden shadow-lg h-full">
                <div className="aspect-w-16 aspect-h-9 relative">
                  <img
                    src={news[0].image_url}
                    alt={news[0].title}
                    className="w-full h-64 object-cover"
                  />
                </div>
                <div className="p-6 flex flex-col h-[calc(100%-16rem)]">
                  <span className="text-blue-600 text-sm font-semibold">{news[0].category}</span>
                  <h2 className="text-2xl font-bold mt-2">{news[0].title}</h2>
                  <p className="mt-4 text-gray-600 flex-grow">{news[0].excerpt}</p>
                  <button className="mt-4 text-blue-600 font-semibold hover:text-blue-800">
                    Leer más →
                  </button>
                </div>
              </article>
            )}
          </div>

          {/* Center Articles */}
          <div className="lg:col-span-4 space-y-6">
            {news.slice(1).map((article) => (
              <article key={article.id} className="bg-white rounded-lg overflow-hidden shadow-md">
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="w-full h-40 object-cover"
                  />
                </div>
                <div className="p-4">
                  <span className="text-blue-600 text-sm font-semibold">{article.category}</span>
                  <h3 className="text-lg font-semibold mt-2">{article.title}</h3>
                  <p className="mt-2 text-gray-600 text-sm">{article.excerpt}</p>
                  <button className="mt-3 text-blue-600 text-sm font-semibold hover:text-blue-800">
                    Leer más →
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* Advertisement Space (Right) */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-24">
              <h3 className="text-sm font-semibold text-gray-500 mb-4">PUBLICIDAD</h3>
              <div className="bg-gray-100 h-[500px] flex items-center justify-center">
                <p className="text-gray-500 text-center">Espacio Publicitario</p>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.slice(0, -1).map((category) => (
            <section key={category.name} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">{category.name}</h2>
              <div className="space-y-2">
                {category.subCategories.map((subCategory) => (
                  <a
                    key={subCategory}
                    href={`#${subCategory.toLowerCase()}`}
                    className="block text-gray-600 hover:text-gray-900"
                  >
                    {subCategory}
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Bottom Advertisement Banner */}
        <div className="mt-12 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-semibold text-gray-500 mb-4">PUBLICIDAD</h3>
          <div className="bg-gray-100 h-24 flex items-center justify-center">
            <p className="text-gray-500">Espacio Publicitario</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-12">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Sobre Nosotros</h3>
              <p className="text-gray-400">Tu fuente confiable de noticias y entretenimiento en México.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Categorías</h3>
              <ul className="space-y-2">
                {categories.map((category) => (
                  <li key={category.name}>
                    <a href={`#${category.name.toLowerCase()}`} className="text-gray-400 hover:text-white">
                      {category.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Contacto</h3>
              <p className="text-gray-400">Email: contacto@newsportal.com</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}