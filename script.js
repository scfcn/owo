const App = {
  data: [],
  flatData: [],
  currentCategory: 'all',
  searchQuery: '',

  elements: {
    loading: document.getElementById('loading'),
    grid: document.getElementById('emoji-grid'),
    nav: document.getElementById('category-nav'),
    search: document.getElementById('search-input'),
    noResults: document.getElementById('no-results'),
    modal: document.getElementById('modal'),
    modalClose: document.getElementById('modal-close'),
    modalImage: document.getElementById('modal-image'),
    modalName: document.getElementById('modal-name'),
    modalCategory: document.getElementById('modal-category'),
  },

  categoryNames: {
    qingzhu: '青竹',
    liushen: '六神',
    blobcat: 'Blob Cat',
    bilibili: '哔哩哔哩',
    zhheo: 'Zhheo'
  },

  async init() {
    try {
      await this.loadData();
      this.transformData();
      this.renderNav();
      this.renderGrid();
      this.bindEvents();
    } catch (err) {
      console.error('初始化失败:', err);
      this.elements.loading.innerHTML = '<p>加载失败，请刷新重试</p>';
    } finally {
      this.elements.loading.classList.add('hidden');
    }
  },

  async loadData() {
    const res = await fetch('.json/artalk-emoji.json');
    if (!res.ok) throw new Error('加载失败');
    this.data = await res.json();
  },

  transformData() {
    this.flatData = this.data.flatMap(cat =>
      cat.items.map(item => ({
        key: item.key,
        name: this.formatName(item.key),
        image: item.val,
        category: cat.name,
        categoryName: this.categoryNames[cat.name] || cat.name
      }))
    );
  },

  formatName(key) {
    const parts = key.split('-');
    if (parts.length > 1) parts.shift();
    return parts.join(' ').replace(/_/g, ' ').trim();
  },

  renderNav() {
    const categories = ['all', ...this.data.map(d => d.name)];
    this.elements.nav.innerHTML = categories.map(cat => `
      <button class="category-btn ${cat === this.currentCategory ? 'active' : ''}" data-category="${cat}">
        ${cat === 'all' ? '全部' : this.categoryNames[cat] || cat}
      </button>
    `).join('');
  },

  renderGrid() {
    let items = this.flatData;

    if (this.currentCategory !== 'all') {
      items = items.filter(i => i.category === this.currentCategory);
    }

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      items = items.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.categoryName.toLowerCase().includes(q)
      );
    }

    this.elements.grid.innerHTML = '';

    if (items.length === 0) {
      this.elements.noResults.classList.remove('hidden');
      return;
    }

    this.elements.noResults.classList.add('hidden');

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'emoji-card';
      card.innerHTML = `
        <img src="${item.image}" alt="${item.name}" loading="lazy">
        <p class="emoji-name">${item.name}</p>
      `;
      card.addEventListener('click', () => this.openModal(item));
      this.elements.grid.appendChild(card);
    });
  },

  bindEvents() {
    this.elements.nav.addEventListener('click', e => {
      if (e.target.classList.contains('category-btn')) {
        this.currentCategory = e.target.dataset.category;
        this.renderNav();
        this.renderGrid();
      }
    });

    this.elements.search.addEventListener('input', e => {
      this.searchQuery = e.target.value.trim();
      this.renderGrid();
    });

    this.elements.modalClose.addEventListener('click', () => this.closeModal());
    this.elements.modal.addEventListener('click', e => {
      if (e.target.classList.contains('modal-overlay')) this.closeModal();
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') this.closeModal();
    });
  },

  openModal(item) {
    this.elements.modalImage.src = item.image;
    this.elements.modalImage.alt = item.name;
    this.elements.modalName.textContent = item.name;
    this.elements.modalCategory.textContent = item.categoryName;
    this.elements.modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  },

  closeModal() {
    this.elements.modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
};

App.init();
