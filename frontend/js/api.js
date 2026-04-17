// API client for DGIP Portal
const API_BASE = '/api';

const Api = {
  async getFeatured() {
    try {
      const res = await fetch(`${API_BASE}/posts/featured`);
      if (!res.ok) throw new Error('Failed to fetch featured');
      return await res.json();
    } catch (err) {
      console.warn('API: Using demo data for featured posts');
      return { posts: this._demoFeatured() };
    }
  },

  async getPosts(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/posts?${query}`);
      if (!res.ok) throw new Error('Failed to fetch posts');
      return await res.json();
    } catch (err) {
      console.warn('API: Using demo data for posts');
      return { total: 9, posts: this._demoPosts() };
    }
  },

  async getPost(slug) {
    const res = await fetch(`${API_BASE}/posts/${slug}`);
    if (!res.ok) throw new Error('Post not found');
    return await res.json();
  },

  async getCategories() {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      if (!res.ok) throw new Error('Failed to fetch categories');
      return await res.json();
    } catch (err) {
      return { categories: [
        { id: 1, name: 'Investigación', slug: 'investigacion', color: '#192D63' },
        { id: 2, name: 'Posgrado', slug: 'posgrado', color: '#2A4080' },
        { id: 3, name: 'Innovación', slug: 'innovacion', color: '#D4B012' },
        { id: 4, name: 'Eventos', slug: 'eventos', color: '#735920' },
        { id: 5, name: 'Convocatorias', slug: 'convocatorias', color: '#0F1B3D' }
      ]};
    }
  },

  // Demo data when API is not available
  _demoFeatured() {
    return [
      { id: 1, title: 'Investigadores UNACH Descubren Nueva Especie en la Selva Lacandona', slug: 'nueva-especie-lacandona', excerpt: 'Un equipo de biólogos de la UNACH ha identificado una nueva especie de anfibio en la reserva de la biósfera.', cover_image: null, category: { name: 'Investigación', color: '#192D63' }, published_at: '2026-04-10' },
      { id: 2, title: 'Convocatoria Abierta: Maestría en Ciencias en Bioquímica Clínica 2026', slug: 'maestria-bioquimica-2026', excerpt: 'Registro de aspirantes abierto hasta el 14 de mayo de 2026 para la Maestría en Ciencias.', cover_image: null, category: { name: 'Convocatorias', color: '#0F1B3D' }, published_at: '2026-04-08' },
      { id: 3, title: 'UNACH Sede del 4to Congreso Internacional de Biotecnología Aplicada', slug: 'congreso-biotecnologia', excerpt: 'Del 16 al 18 de abril se celebra el congreso con participación de investigadores de 12 países.', cover_image: null, category: { name: 'Eventos', color: '#735920' }, published_at: '2026-04-05' }
    ];
  },

  _demoPosts() {
    const cats = [
      { name: 'Investigación', color: '#192D63' },
      { name: 'Posgrado', color: '#2A4080' },
      { name: 'Innovación', color: '#D4B012' },
      { name: 'Eventos', color: '#735920' },
      { name: 'Convocatorias', color: '#0F1B3D' }
    ];
    const titles = [
      'Investigadores Desarrollan Tecnología Solar Innovadora para Comunidades Rurales',
      'Programa de Posgrado en Desarrollo Local Abre Inscripciones',
      'UNACH y CONACYT Firman Convenio de Colaboración Científica',
      'III Congreso Internacional de Investigación y Docencia en Lenguas',
      'Convocatoria para la Medalla Federico Salazar Narváez 2026',
      'Estudiantes de Doctorado Publican en Revistas de Alto Impacto',
      'Seminario de Innovación Tecnológica en el Campus Central',
      'Maestría en Derecho: Registro en Línea Hasta Mayo 2026',
      'Laboratorio de Biotecnología Recibe Equipamiento de Última Generación'
    ];
    return titles.map((title, i) => ({
      id: i + 1,
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      excerpt: 'La Dirección General de Investigación y Posgrado impulsa el desarrollo científico y tecnológico al servicio de la comunidad universitaria y la sociedad chiapaneca.',
      cover_image: null,
      category: cats[i % cats.length],
      author: { full_name: 'DGIP UNACH' },
      published_at: new Date(2026, 3, 15 - i).toISOString()
    }));
  }
};
