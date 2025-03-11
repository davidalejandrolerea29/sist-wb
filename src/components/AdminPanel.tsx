import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
interface NewsForm {
  title: string;
  category: string;
  excerpt: string;
  content: string;
  image_url: string; // URL de la imagen subida
}

const initialForm: NewsForm = {
  title: '',
  category: '',
  excerpt: '',
  content: '',
  image_url: '',
};

export function AdminPanel() {
  const [form, setForm] = useState<NewsForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const navigate = useNavigate(); 
  // Función para manejar la subida de la imagen a Supabase Storage
  const handleFileUpload = async () => {
    if (!imageFile) return null;

    const fileName = `${Date.now()}_${imageFile.name}`;
    const { data, error } = await supabase.storage.from('news-images').upload(fileName, imageFile);

    if (error) {
      console.error('Error al subir imagen:', error.message);
      setMessage('Error al subir la imagen');
      return null;
    }

    // Obtener la URL pública de la imagen
    const { data: publicUrl } = supabase.storage.from('news-images').getPublicUrl(fileName);
    return publicUrl.publicUrl;
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMessage('Por favor inicia sesión para publicar noticias');
        return;
      }

      // Subir imagen antes de guardar la noticia
      const imageUrl = await handleFileUpload();
      if (!imageUrl) throw new Error('No se pudo obtener la URL de la imagen');

      const { error } = await supabase
        .from('news')
        .insert([{ ...form, image_url: imageUrl, user_id: user.id }]);

      if (error) throw error;

      setMessage('¡Noticia publicada exitosamente!');
      setForm(initialForm);
      setImageFile(null);
      setTimeout(() => navigate('/'), 1000);
    } catch (error) {
      setMessage('Error al publicar la noticia');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Manejo de cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Manejo del input de archivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Panel de Administración</h2>
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Título
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Categoría
            </label>
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Selecciona una categoría</option>
              <option value="Espectáculos">Espectáculos</option>
              <option value="Gastronomía">Gastronomía</option>
              <option value="Lifestyle">Lifestyle</option>
              <option value="Negocios">Negocios</option>
              <option value="Turismo">Turismo</option>
            </select>
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700">
              Imagen
            </label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleFileChange}
              required
              className="mt-1 block w-full"
            />
          </div>

          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
              Extracto
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={form.excerpt}
              onChange={handleChange}
              required
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Contenido
            </label>
            <textarea
              id="content"
              name="content"
              value={form.content}
              onChange={handleChange}
              required
              rows={6}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {message && (
          <div className={`mt-4 p-4 rounded-md ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}

        <div className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Publicando...' : 'Publicar Noticia'}
          </button>
        </div>
      </form>
    </div>
  );
}
