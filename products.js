/**
 * La Casa Del Helado — Products Module
 * Carga productos desde Supabase y los renderiza en el menú.
 * Si Supabase no está configurado, usa datos de muestra.
 */

// ─── Datos de muestra (fallback mientras configuras Supabase)
const SAMPLE_PRODUCTS = [
  // HELADOS
  { id: 1, nombre: 'Helado de Vainilla',        descripcion: 'Clásico cremoso con esencia de vainilla natural.',             precio: 150, categoria: 'helados',   disponible: true },
  { id: 2, nombre: 'Helado de Chocolate',       descripcion: 'Intenso y cremoso, hecho con cacao premium.',                  precio: 150, categoria: 'helados',   disponible: true },
  { id: 3, nombre: 'Helado de Fresa',           descripcion: 'Fresco y afrutado con fresas naturales.',                      precio: 150, categoria: 'helados',   disponible: true },
  { id: 4, nombre: 'Helado de Coco',            descripcion: 'Tropical y cremoso con coco fresco rallado.',                  precio: 160, categoria: 'helados',   disponible: true },
  { id: 5, nombre: 'Helado de Mango',           descripcion: 'Sabor tropical intenso con mango dominicano.',                 precio: 160, categoria: 'helados',   disponible: true },
  { id: 6, nombre: 'Helado de Nutella',         descripcion: 'La combinación perfecta de avellanas y chocolate.',            precio: 175, categoria: 'helados',   disponible: true },

  // BATIDAS
  { id: 7,  nombre: 'Batida de Fresa',          descripcion: 'Cremosa batida con fresas frescas y leche entera.',            precio: 200, categoria: 'batidas',   disponible: true },
  { id: 8,  nombre: 'Batida de Vainilla',       descripcion: 'Suave y dulce, perfecta para cualquier momento.',              precio: 200, categoria: 'batidas',   disponible: true },
  { id: 9,  nombre: 'Batida de Oreo',           descripcion: 'Galletas Oreo trituradas con helado y leche fría.',            precio: 220, categoria: 'batidas',   disponible: true },
  { id: 10, nombre: 'Batida de Guanábana',      descripcion: 'Exótica batida con guanábana natural dominicana.',             precio: 210, categoria: 'batidas',   disponible: true },
  { id: 11, nombre: 'Batida de Chinola',        descripcion: 'Refrescante batida de maracuyá con un toque cítrico.',         precio: 210, categoria: 'batidas',   disponible: true },

  // JUGOS NATURALES
  { id: 12, nombre: 'Jugo de Naranja Natural',  descripcion: 'Naranjas exprimidas al momento, sin azúcar añadida.',          precio: 120, categoria: 'jugos',     disponible: true },
  { id: 13, nombre: 'Jugo de Limón',            descripcion: 'Refrescante limonada natural con menta.',                     precio: 120, categoria: 'jugos',     disponible: true },
  { id: 14, nombre: 'Jugo de Melón',            descripcion: 'Suave y dulce, ideal para el calor caribeño.',                precio: 130, categoria: 'jugos',     disponible: true },
  { id: 15, nombre: 'Jugo de Piña',             descripcion: 'Piña tropical fresca exprimida al instante.',                 precio: 130, categoria: 'jugos',     disponible: true },
  { id: 16, nombre: 'Jugo Mixto',               descripcion: 'Combinación especial de frutas de temporada.',                precio: 140, categoria: 'jugos',     disponible: true },

  // TOSTADAS
  { id: 17, nombre: 'Tostada con Mantequilla',  descripcion: 'Pan tostado dorado con mantequilla fresca.',                  precio: 80,  categoria: 'tostadas',  disponible: true },
  { id: 18, nombre: 'Tostada con Queso',        descripcion: 'Crujiente tostada con queso derretido al gusto.',             precio: 100, categoria: 'tostadas',  disponible: true },
  { id: 19, nombre: 'Tostada con Mermelada',    descripcion: 'Pan tostado con mermelada de fresa o guayaba.',               precio: 90,  categoria: 'tostadas',  disponible: true },
  { id: 20, nombre: 'Tostada Completa',         descripcion: 'Pan tostado, queso, jamón y aguacate. Todo incluido.',        precio: 150, categoria: 'tostadas',  disponible: true },

  // OTROS
  { id: 21, nombre: 'Brownie con Helado',       descripcion: 'Brownie tibio de chocolate con una bola de helado de vainilla.', precio: 250, categoria: 'otros', disponible: true },
  { id: 22, nombre: 'Sundae de Chocolate',      descripcion: 'Helado con salsa de chocolate, crema y topping de cereal.',  precio: 220, categoria: 'otros',     disponible: true },
  { id: 23, nombre: 'Waffle con Helado',        descripcion: 'Waffle crujiente con dos bolas de helado a elegir.',          precio: 280, categoria: 'otros',     disponible: true },
  { id: 24, nombre: 'Copa Especial',            descripcion: 'Copa con tres sabores de helado y toppings variados.',        precio: 300, categoria: 'otros',     disponible: true },
];

// ─── Category icon map
const CAT_ICONS = {
  helados:  'ice-cream-bowl',
  batidas:  'cup-soda',
  jugos:    'citrus',
  tostadas: 'sandwich',
  otros:    'package',
};

// ─── Category color map
const CAT_COLORS = {
  helados:  { bg: '#F9E8EE', icon: '#C97A94' },
  batidas:  { bg: '#E8DAEF', icon: '#9E7FBA' },
  jugos:    { bg: '#E8F5E9', icon: '#4CAF50' },
  tostadas: { bg: '#FFF3E0', icon: '#FF9800' },
  otros:    { bg: '#E3F2FD', icon: '#2196F3' },
};

// ─── State
let allProducts    = [];
let activeCategory = 'todos';
let searchQuery    = '';

// ─── Load products from Supabase (or fallback)
async function loadProducts() {
  try {
    const query = await supabase.from('productos');
    const { data, error } = await query.select('*').order('categoria', { ascending: true });

    if (error || !data || data.length === 0) {
      console.warn('Usando datos de muestra. Configura Supabase para datos reales.');
      allProducts = SAMPLE_PRODUCTS;
    } else {
      allProducts = data;
    }
  } catch (e) {
    console.warn('Supabase no disponible, usando datos de muestra.', e);
    allProducts = SAMPLE_PRODUCTS;
  }

  renderProducts();
}

// ─── Render products grid
function renderProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  let filtered = allProducts.filter(p => p.disponible !== false);

  if (activeCategory !== 'todos') {
    filtered = filtered.filter(p => p.categoria === activeCategory);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(p =>
      p.nombre.toLowerCase().includes(q) ||
      (p.descripcion || '').toLowerCase().includes(q)
    );
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
        <i data-lucide="search-x" class="w-10 h-10 opacity-30"></i>
        <p class="text-sm">No se encontraron productos</p>
        <button onclick="clearFilters()" class="text-xs px-4 py-2 rounded-full border border-gray-300 hover:border-gray-400 transition-colors">
          Ver todos
        </button>
      </div>`;
    lucide.createIcons();
    return;
  }

  grid.innerHTML = filtered.map(product => productCard(product)).join('');
  lucide.createIcons();

  // Intersection observer for card reveal
  grid.querySelectorAll('.product-card').forEach((card, i) => {
    card.style.opacity   = '0';
    card.style.transform = 'translateY(24px)';
    setTimeout(() => {
      card.style.transition = 'opacity 0.5s ease, transform 0.5s ease, box-shadow 0.3s ease';
      card.style.opacity    = '1';
      card.style.transform  = 'translateY(0)';
    }, i * 60);
  });
}

// ─── Single product card HTML
function productCard(p) {
  const cat    = CAT_COLORS[p.categoria] || { bg: '#F9E8EE', icon: '#C97A94' };
  const icon   = CAT_ICONS[p.categoria]  || 'package';
  const catLabel = {
    helados: 'Helados', batidas: 'Batidas', jugos: 'Jugos',
    tostadas: 'Tostadas', otros: 'Otros',
  }[p.categoria] || p.categoria;

  return `
  <div class="product-card bg-white rounded-2xl border overflow-hidden cursor-pointer" style="border-color:#f0e0e8"
       onclick="">
    <!-- Icon area instead of photo -->
    <div class="h-36 flex items-center justify-center relative" style="background:${cat.bg}">
      <div class="w-16 h-16 rounded-full flex items-center justify-center" style="background:rgba(255,255,255,0.7)">
        <i data-lucide="${icon}" class="w-8 h-8" style="color:${cat.icon}"></i>
      </div>
      <div class="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium" style="background:rgba(255,255,255,0.85); color:${cat.icon}">
        ${catLabel}
      </div>
      ${!p.disponible ? `<div class="absolute inset-0 bg-white/70 flex items-center justify-center"><span class="text-xs font-medium text-gray-500">No disponible</span></div>` : ''}
    </div>

    <div class="p-4 space-y-3">
      <div>
        <h3 class="font-display font-semibold text-base leading-snug" style="color:#2D2D2D">${p.nombre}</h3>
        <p class="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">${p.descripcion || ''}</p>
      </div>

      <div class="flex items-center justify-between pt-1">
        <span class="font-bold text-lg" style="color:#C97A94">RD$ ${Number(p.precio).toLocaleString('es-DO')}</span>
        <button
          onclick="addToCart(${JSON.stringify(p).replace(/"/g, '&quot;')})"
          ${!p.disponible ? 'disabled' : ''}
          class="flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-xs font-medium transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          style="background:#C97A94">
          <i data-lucide="plus" class="w-3.5 h-3.5"></i>
          Agregar
        </button>
      </div>
    </div>
  </div>`;
}

// ─── Filter helpers
function filterByCategory(cat) {
  activeCategory = cat;
  document.querySelectorAll('.cat-pill').forEach(btn => {
    const isActive = btn.dataset.cat === cat;
    btn.classList.toggle('active', isActive);
    if (isActive) {
      btn.style.background = '#C97A94';
      btn.style.color      = 'white';
      btn.style.borderColor= '#C97A94';
    } else {
      btn.style.background = 'white';
      btn.style.color      = '#2D2D2D';
      btn.style.borderColor= '#f0d0d8';
    }
  });
  renderProducts();
}

function clearFilters() {
  activeCategory = 'todos';
  searchQuery    = '';
  const inp = document.getElementById('searchInput');
  if (inp) inp.value = '';
  filterByCategory('todos');
}

// ─── Init
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();

  // Category pills
  document.querySelectorAll('.cat-pill').forEach(btn => {
    btn.addEventListener('click', () => filterByCategory(btn.dataset.cat));
  });

  // Search
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      searchQuery = e.target.value;
      renderProducts();
    });
  }
});
