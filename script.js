class EmojiGallery {
  constructor() {
    this.emojiData = [];
    this.filteredEmojis = [];
    this.currentCategory = 'all';
    this.searchQuery = '';
    
    // DOM 元素
    this.elements = {
      loading: document.getElementById('loading'),
      emojiGrid: document.getElementById('emoji-grid'),
      categoryList: document.getElementById('category-list'),
      searchInput: document.getElementById('search-input'),
      searchBtn: document.getElementById('search-btn'),
      noResults: document.getElementById('no-results'),
      previewModal: document.getElementById('preview-modal'),
      closeModal: document.getElementById('close-modal'),
      previewContent: document.getElementById('preview-content')
    };
    
    // 初始化
    this.init();
  }
  
  async init() {
    try {
      // 加载表情数据
      await this.loadEmojiData();
      
      // 生成分类导航
      this.generateCategoryNav();
      
      // 初始渲染所有表情
      this.renderEmojis();
      
      // 绑定事件
      this.bindEvents();
    } catch (error) {
      console.error('初始化失败:', error);
      this.elements.loading.innerHTML = '<p>加载失败，请刷新页面重试</p>';
    } finally {
      // 隐藏加载状态
      this.elements.loading.classList.add('hidden');
    }
  }
  
  async loadEmojiData() {
    try {
      const response = await fetch('.json/artalk-emoji.json');
      if (!response.ok) {
        throw new Error('网络响应失败');
      }
      this.emojiData = await response.json();
      
      // 转换数据格式，方便后续处理
      this.transformEmojiData();
    } catch (error) {
      console.error('加载表情数据失败:', error);
      throw error;
    }
  }
  
  transformEmojiData() {
    // 将数据转换为扁平化结构，方便搜索和筛选
    this.flatEmojis = [];
    
    this.emojiData.forEach(category => {
      category.items.forEach(item => {
        this.flatEmojis.push({
          id: item.key,
          name: this.formatEmojiName(item.key),
          image: item.val,
          category: category.name,
          categoryName: this.formatCategoryName(category.name)
        });
      });
    });
    
    this.filteredEmojis = [...this.flatEmojis];
  }
  
  formatEmojiName(key) {
    // 格式化表情名称，去除前缀和特殊字符
    const parts = key.split('-');
    if (parts.length > 1) {
      // 移除分类前缀
      parts.shift();
    }
    return parts.join(' ').replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
  }
  
  formatCategoryName(category) {
    // 格式化分类名称
    const categoryMap = {
      'qingzhu': '青竹',
      'liushen': '六神',
      'blobcat': 'Blob Cat',
      'bilibili': '哔哩哔哩',
      'zhheo': 'Zhheo'
    };
    return categoryMap[category] || category;
  }
  
  generateCategoryNav() {
    // 生成分类导航
    const categories = ['all', ...this.emojiData.map(item => item.name)];
    
    this.elements.categoryList.innerHTML = categories.map(category => {
      const categoryName = category === 'all' ? '全部' : this.formatCategoryName(category);
      return `
        <li class="category-item">
          <button 
            class="category-btn ${this.currentCategory === category ? 'active' : ''}"
            data-category="${category}"
          >
            ${categoryName}
          </button>
        </li>
      `;
    }).join('');
  }
  
  bindEvents() {
    // 分类切换事件
    this.elements.categoryList.addEventListener('click', (e) => {
      const categoryBtn = e.target.closest('.category-btn');
      if (categoryBtn) {
        this.currentCategory = categoryBtn.dataset.category;
        
        // 更新分类按钮状态
        document.querySelectorAll('.category-btn').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.category === this.currentCategory);
        });
        
        // 重新渲染表情
        this.filterEmojis();
      }
    });
    
    // 搜索事件
    this.elements.searchBtn.addEventListener('click', () => {
      this.searchQuery = this.elements.searchInput.value.trim();
      this.filterEmojis();
    });
    
    // 回车键搜索
    this.elements.searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.searchQuery = this.elements.searchInput.value.trim();
        this.filterEmojis();
      }
    });
    
    // 关闭模态框
    this.elements.closeModal.addEventListener('click', () => {
      this.closeModal();
    });
    
    // 点击模态框外部关闭
    this.elements.previewModal.addEventListener('click', (e) => {
      if (e.target === this.elements.previewModal) {
        this.closeModal();
      }
    });
    
    // 键盘事件关闭模态框
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.elements.previewModal.classList.contains('hidden')) {
        this.closeModal();
      }
    });
  }
  
  filterEmojis() {
    let result = [...this.flatEmojis];
    
    // 按分类筛选
    if (this.currentCategory !== 'all') {
      result = result.filter(emoji => emoji.category === this.currentCategory);
    }
    
    // 按搜索词筛选
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(emoji => 
        emoji.name.toLowerCase().includes(query) ||
        emoji.categoryName.toLowerCase().includes(query)
      );
    }
    
    this.filteredEmojis = result;
    this.renderEmojis();
  }
  
  renderEmojis() {
    // 清空表情网格
    this.elements.emojiGrid.innerHTML = '';
    
    // 显示无结果提示
    if (this.filteredEmojis.length === 0) {
      this.elements.noResults.classList.remove('hidden');
      return;
    }
    
    // 隐藏无结果提示
    this.elements.noResults.classList.add('hidden');
    
    // 渲染表情卡片
    this.filteredEmojis.forEach(emoji => {
      const card = this.createEmojiCard(emoji);
      this.elements.emojiGrid.appendChild(card);
    });
    
    // 初始化懒加载
    this.initLazyLoading();
  }
  
  createEmojiCard(emoji) {
    const card = document.createElement('div');
    card.className = 'emoji-card';
    card.dataset.emoji = JSON.stringify(emoji);
    
    card.innerHTML = `
      <img 
        src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3C/svg%3E" 
        data-src="${emoji.image}" 
        alt="${emoji.name}" 
        class="emoji-image lazy-load"
      >
      <h3 class="emoji-name">${emoji.name}</h3>
      <p class="emoji-category">${emoji.categoryName}</p>
    `;
    
    // 添加点击事件，打开预览
    card.addEventListener('click', () => {
      this.openPreview(emoji);
    });
    
    return card;
  }
  
  initLazyLoading() {
    // 图片懒加载
    const lazyImages = document.querySelectorAll('.lazy-load');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const image = entry.target;
            image.src = image.dataset.src;
            image.classList.remove('lazy-load');
            imageObserver.unobserve(image);
          }
        });
      });
      
      lazyImages.forEach(image => {
        imageObserver.observe(image);
      });
    } else {
      // 降级方案，兼容不支持 IntersectionObserver 的浏览器
      lazyImages.forEach(image => {
        image.src = image.dataset.src;
        image.classList.remove('lazy-load');
      });
    }
  }
  
  openPreview(emoji) {
    // 打开表情预览模态框
    this.elements.previewContent.innerHTML = `
      <img src="${emoji.image}" alt="${emoji.name}" class="preview-image">
      <h2 class="preview-name">${emoji.name}</h2>
      <p class="preview-category">分类：${emoji.categoryName}</p>
    `;
    
    this.elements.previewModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // 防止背景滚动
  }
  
  closeModal() {
    // 关闭预览模态框
    this.elements.previewModal.classList.add('hidden');
    document.body.style.overflow = ''; // 恢复背景滚动
  }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
  new EmojiGallery();
});

// 平滑滚动
if (window.scrollBehavior !== 'smooth') {
  // 降级方案，为不支持平滑滚动的浏览器添加平滑滚动效果
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}