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
// 2. 博客文稿数据源（由 articles.js 动态载入）
// ==========================================
if (typeof BLOG_POSTS === "undefined") {
  window.BLOG_POSTS = [];
}

// 当前选中的文章 ID
let currentArticleId = 1;

// DOM 元素获取
const introScreen = document.getElementById("intro-screen");
const enterBlogBtn = document.getElementById("enter-blog-btn");
const blogMain = document.getElementById("blog-main");
const backToIntroBtn = document.getElementById("back-to-intro-btn");
const headerLogo = document.getElementById("header-logo");

// 中间正文容器
const detailTitle = document.getElementById("detail-title");
const detailDate = document.getElementById("detail-date");
const detailReadtime = document.getElementById("detail-readtime");
const detailViews = document.getElementById("detail-views");
const detailBody = document.getElementById("detail-body");
const bcCurrent = document.getElementById("bc-current");

// 翻页按钮
const prevBtn = document.getElementById("prev-article-btn");
const nextBtn = document.getElementById("next-article-btn");
const prevTitle = document.getElementById("prev-article-title");
const nextTitle = document.getElementById("next-article-title");

// 树检索
const treeSearchInput = document.getElementById("tree-search");

// ==========================================
// 3. 页面开屏切换逻辑
// ==========================================

// 点击“进入博客 ->”过渡到博客主页
enterBlogBtn.addEventListener("click", () => {
  introScreen.classList.add("fade-out");
  setTimeout(() => {
    introScreen.style.display = "none";
    blogMain.style.display = "flex";
    window.scrollTo({ top: 0, behavior: "instant" });
  }, 650);
});

// 点击顶部“返回封面”或“Logo”重新呼出开屏封面
function returnToCover() {
  introScreen.style.display = "flex";
  void introScreen.offsetWidth;
  introScreen.classList.remove("fade-out");
  setTimeout(() => {
    blogMain.style.display = "none";
  }, 300);
}

backToIntroBtn.addEventListener("click", returnToCover);
headerLogo.addEventListener("click", returnToCover);

// ==========================================
// 4. 左侧树状目录交互
// ==========================================

// 一级主分类折叠切换
window.toggleTreeGroup = function(element) {
  const group = element.closest(".tree-group");
  if (group) group.classList.toggle("open");
};

// 二级章节折叠切换
window.toggleTreeSubgroup = function(element) {
  const subgroup = element.closest(".tree-subgroup");
  if (subgroup) subgroup.classList.toggle("open");
};

// 动态渲染左侧树叶子列表
function renderTreeLeaves() {
  const container = document.getElementById("tree-leaf-container");
  if (!container || !BLOG_POSTS.length) return;

  container.innerHTML = BLOG_POSTS.map(post => `
    <div class="tree-leaf-item ${post.id === currentArticleId ? 'active' : ''}" 
         data-id="${post.id}" 
         onclick="selectArticle(${post.id})">
      <span class="leaf-icon">📄</span>
      <span class="leaf-title">${post.title}</span>
    </div>
  `).join("");
}

// 选中并显示特定文章
window.selectArticle = function(id) {
  const post = BLOG_POSTS.find(p => p.id === id);
  if (!post) return;

  currentArticleId = id;

  // 1. 更新正文展示
  detailTitle.textContent = post.title;
  detailDate.textContent = post.date;
  detailReadtime.textContent = `阅读约需 ${post.readTime}`;
  detailViews.textContent = `${post.views} 次阅览`;
  detailBody.innerHTML = post.content;
  if (bcCurrent) bcCurrent.textContent = post.title;

  // 2. 更新树叶高亮状态
  document.querySelectorAll(".tree-leaf-item").forEach(item => {
    const itemId = parseInt(item.getAttribute("data-id"));
    if (itemId === id) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  // 3. 更新底部翻页按钮状态
  updatePager();

  // 4. 平滑滚动到正文顶部
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// 底部上一篇/下一篇切换
window.navigateArticle = function(delta) {
  const currentIndex = BLOG_POSTS.findIndex(p => p.id === currentArticleId);
  if (currentIndex === -1) return;

  const targetIndex = currentIndex + delta;
  if (targetIndex >= 0 && targetIndex < BLOG_POSTS.length) {
    selectArticle(BLOG_POSTS[targetIndex].id);
  }
};

function updatePager() {
  const currentIndex = BLOG_POSTS.findIndex(p => p.id === currentArticleId);
  if (currentIndex === -1) return;

  // 上一篇
  if (currentIndex > 0) {
    const prevPost = BLOG_POSTS[currentIndex - 1];
    prevBtn.disabled = false;
    prevTitle.textContent = prevPost.title;
  } else {
    prevBtn.disabled = true;
    prevTitle.textContent = "无";
  }

  // 下一篇
  if (currentIndex < BLOG_POSTS.length - 1) {
    const nextPost = BLOG_POSTS[currentIndex + 1];
    nextBtn.disabled = false;
    nextTitle.textContent = nextPost.title;
  } else {
    nextBtn.disabled = true;
    nextTitle.textContent = "无";
  }
}

// 树状检索过滤
if (treeSearchInput) {
  treeSearchInput.addEventListener("input", (e) => {
    const query = e.target.value.trim().toLowerCase();
    const leafItems = document.querySelectorAll(".tree-leaf-item");
    
    leafItems.forEach(item => {
      const title = item.querySelector(".leaf-title").textContent.toLowerCase();
      if (!query || title.includes(query)) {
        item.style.display = "flex";
      } else {
        item.style.display = "none";
      }
    });
  });
}

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

  // 渲染左侧树
  renderTreeLeaves();

  // 默认显示第一篇文章
  if (BLOG_POSTS.length > 0) {
    selectArticle(BLOG_POSTS[0].id);
  }
});
