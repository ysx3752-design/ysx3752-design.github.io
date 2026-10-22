/**
 * 墨竹轩 · 博客前端交互逻辑
 */

// ==========================================
// 1. 全网平台配置（在此处填入你的主页链接）
// ==========================================
const SOCIAL_CONFIG = {
  // GitHub 主页地址（账号：ysx3752-design，昵称显示：YuanSX）
  github: "https://github.com/ysx3752-design",

  // 哔哩哔哩主页空间
  bilibili: "https://space.bilibili.com/3546774568438667"
};

// ==========================================
// 2. 博客文稿数据源（由 articles.js 动态注入）
// ==========================================
if (typeof BLOG_POSTS === "undefined") {
  window.BLOG_POSTS = [];
}

// ==========================================
// 2. DOM 元素获取
// ==========================================
const introScreen = document.getElementById("intro-screen");
const enterBlogBtn = document.getElementById("enter-blog-btn");
const blogMain = document.getElementById("blog-main");
const backToIntroBtn = document.getElementById("back-to-intro-btn");
const headerLogo = document.getElementById("header-logo");

// 文章视图相关
const articleListView = document.getElementById("article-list-view");
const articleDetailView = document.getElementById("article-detail-view");
const backToListBtn = document.getElementById("back-to-list-btn");
const currentViewTitle = document.getElementById("current-view-title");
const articleCountEl = document.getElementById("article-count");
const searchInput = document.getElementById("article-search");

// 详情容器
const detailCategory = document.getElementById("detail-category");
const detailTitle = document.getElementById("detail-title");
const detailDate = document.getElementById("detail-date");
const detailReadtime = document.getElementById("detail-readtime");
const detailViews = document.getElementById("detail-views");
const detailBody = document.getElementById("detail-body");

// 导航栏
const navItems = document.querySelectorAll(".nav-item");

// 当前状态
let currentCategory = "all";
let searchQuery = "";

// ==========================================
// 3. 页面开屏切换逻辑（核心要求 1 & 2）
// ==========================================

// 点击“进入博客 ->”过渡到博客主页
enterBlogBtn.addEventListener("click", () => {
  introScreen.classList.add("fade-out");
  
  // 等待渐隐动画完毕后隐藏封面、展开博客主体
  setTimeout(() => {
    introScreen.style.display = "none";
    blogMain.style.display = "flex";
    window.scrollTo({ top: 0, behavior: "instant" });
  }, 650);
});

// 点击顶部“返回封面”或“Logo”重新呼出开屏封面
function returnToCover() {
  introScreen.style.display = "flex";
  // 强制触发回流以保证淡入动画生效
  void introScreen.offsetWidth;
  introScreen.classList.remove("fade-out");
  setTimeout(() => {
    blogMain.style.display = "none";
  }, 300);
}

backToIntroBtn.addEventListener("click", returnToCover);
headerLogo.addEventListener("click", returnToCover);

// ==========================================
// 4. 左侧文章列表与检索渲染
// ==========================================

function filterArticles() {
  return BLOG_POSTS.filter(post => {
    const matchCategory = currentCategory === "all" || post.category === currentCategory;
    const matchSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });
}

function renderArticleList() {
  const filtered = filterArticles();
  articleCountEl.textContent = `共 ${filtered.length} 篇文章`;

  if (filtered.length === 0) {
    articleListView.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: var(--ink-light); background: var(--card-bg); border-radius: var(--radius-md); border: 1px dashed var(--ink-border);">
        <p style="font-size: 1.1rem; margin-bottom: 8px;">暂未找到匹配文稿</p>
        <p style="font-size: 0.9rem;">试着更换检索词，或点击导航栏查看全部文章。</p>
      </div>
    `;
    return;
  }

  articleListView.innerHTML = filtered.map(post => `
    <article class="article-card" onclick="openArticleDetail(${post.id})">
      <span class="card-category-tag">${post.categoryName}</span>
      <h3 class="card-title">${post.title}</h3>
      <p class="card-excerpt">${post.excerpt}</p>
      <div class="card-footer">
        <div class="card-info">
          <span>${post.date}</span> · 
          <span>${post.readTime}</span> · 
          <span>${post.views} 阅读</span>
        </div>
        <span class="read-more-link">阅读全文 →</span>
      </div>
    </article>
  `).join("");
}

// 打开文章详情阅读
window.openArticleDetail = function(id) {
  const post = BLOG_POSTS.find(p => p.id === id);
  if (!post) return;

  // 填充文章详情内容
  detailCategory.textContent = post.categoryName;
  detailTitle.textContent = post.title;
  detailDate.textContent = post.date;
  detailReadtime.textContent = `阅读约需 ${post.readTime}`;
  detailViews.textContent = `${post.views} 次阅览`;
  detailBody.innerHTML = post.content;

  // 切换视图
  articleListView.style.display = "none";
  articleDetailView.style.display = "block";
  document.querySelector(".content-toolbar").style.display = "none";

  // 平滑滚动到顶部
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// 返回文章列表
backToListBtn.addEventListener("click", () => {
  articleDetailView.style.display = "none";
  articleListView.style.display = "flex";
  document.querySelector(".content-toolbar").style.display = "flex";
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// 检索过滤
searchInput.addEventListener("input", (e) => {
  searchQuery = e.target.value.trim();
  renderArticleList();
});

// 分类导航切换
navItems.forEach(item => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    navItems.forEach(n => n.classList.remove("active"));
    item.classList.add("active");
    
    currentCategory = item.getAttribute("data-category");
    
    // 更新标题文字
    if (currentCategory === "all") currentViewTitle.textContent = "最新文稿";
    else currentViewTitle.textContent = item.textContent;

    // 如果当前在详情页，自动切回列表
    articleDetailView.style.display = "none";
    articleListView.style.display = "flex";
    document.querySelector(".content-toolbar").style.display = "flex";

    renderArticleList();
  });
});

// 标签云点击快速搜索
document.querySelectorAll(".tag-pill").forEach(pill => {
  pill.addEventListener("click", () => {
    const tagText = pill.textContent.trim();
    searchInput.value = tagText;
    searchQuery = tagText;
    renderArticleList();
  });
});

// 应用全网平台配置
function applySocialConfig() {
  const ghLink = document.querySelector(".profile-social-grid a[title*='GitHub']");
  if (ghLink && SOCIAL_CONFIG.github) ghLink.href = SOCIAL_CONFIG.github;

  const biliLink = document.querySelector(".profile-social-grid a.bilibili");
  if (biliLink && SOCIAL_CONFIG.bilibili) biliLink.href = SOCIAL_CONFIG.bilibili;
}

// ==========================================
// 5. 初始化渲染
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  applySocialConfig();
  
  // 动态更新右侧统计卡片的文章总数
  const statArticles = document.getElementById("stat-articles");
  if (statArticles) statArticles.textContent = BLOG_POSTS.length;

  renderArticleList();
});
