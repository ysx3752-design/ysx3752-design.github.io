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
const detailView = document.getElementById("article-detail-view");
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

  // 毫秒级动态微跳动画 (丝滑弹性入场，消除切换生硬感)
  if (detailView) {
    detailView.classList.remove("article-switching");
    void detailView.offsetWidth; // 触发 reflow 重置动画
    detailView.classList.add("article-switching");
  }

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

// ==========================================
// 6. 页面右下角：日光 / 黑夜 模式背景切换
// ==========================================
const themeToggleBtn = document.getElementById("theme-toggle-btn");
const themeBtnIcon = document.getElementById("theme-btn-icon");
const themeBtnLabel = document.getElementById("theme-btn-label");

function applyTheme(theme) {
  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    if (themeBtnIcon) themeBtnIcon.textContent = "🌙";
    if (themeBtnLabel) themeBtnLabel.textContent = "黑夜";
    try { localStorage.setItem("mozhu_theme", "dark"); } catch (e) {}
  } else {
    document.documentElement.removeAttribute("data-theme");
    if (themeBtnIcon) themeBtnIcon.textContent = "☀️";
    if (themeBtnLabel) themeBtnLabel.textContent = "日光";
    try { localStorage.setItem("mozhu_theme", "light"); } catch (e) {}
  }
}

// 初始化读取用户已保存的主题（默认日光模式）
let savedTheme = "light";
try {
  savedTheme = localStorage.getItem("mozhu_theme") || "light";
} catch (e) {}
applyTheme(savedTheme);

if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    applyTheme(isDark ? "light" : "dark");
  });
}

// ==========================================
// 7. 右侧博主资料：跟随鼠标滚轮滚动 + 局部外圈 QQ 弹弹动效
// ==========================================
(function initProfileCardQQMotion() {
  const profileCard = document.querySelector(".profile-card");
  const avatarBox = document.querySelector(".profile-avatar-box");
  if (!profileCard) return;

  // 物理弹簧模型参数 (Q 弹果冻物理动力学)
  let posX = 0, posY = 0;
  let velX = 0, velY = 0;
  let targetX = 0, targetY = 0;

  let rotX = 0, rotY = 0;
  let velRotX = 0, velRotY = 0;
  let targetRotX = 0, targetRotY = 0;

  // 弹簧回复力与阻尼比（调校出富有生命力的 QQ 弹感）
  const SPRING = 0.075;
  const DAMPING = 0.78;

  // 触发范围外边距：严格缩小至信息框外圈一小部分 (30px)
  const TRIGGER_PADDING = 30;

  // 1. 鼠标移动：仅在信息框外圈一小部分内触发微动
  window.addEventListener("mousemove", (e) => {
    if (blogMain && blogMain.style.display === "none") return;

    const rect = profileCard.getBoundingClientRect();
    
    // 判断鼠标是否在信息框及其外圈 30px 范围内
    const inTriggerZone = (
      e.clientX >= rect.left - TRIGGER_PADDING &&
      e.clientX <= rect.right + TRIGGER_PADDING &&
      e.clientY >= rect.top - TRIGGER_PADDING &&
      e.clientY <= rect.bottom + TRIGGER_PADDING
    );

    if (inTriggerZone) {
      const cardCenterX = rect.left + rect.width / 2;
      const cardCenterY = rect.top + rect.height / 2;

      const distX = e.clientX - cardCenterX;
      const distY = e.clientY - cardCenterY;

      // 归一化偏移量 (-1 到 1)
      const normX = Math.max(-1, Math.min(1, distX / (rect.width / 2)));
      const normY = Math.max(-1, Math.min(1, distY / (rect.height / 2)));

      // 弹性微位移与 3D 悬浮视差
      targetX = normX * 18;
      targetY = normY * 15;
      targetRotX = -normY * 8;
      targetRotY = normX * 8;
    } else {
      // 超出外圈范围时，目标迅速归零，弹簧系统自动优雅回弹至原位
      targetX = 0;
      targetY = 0;
      targetRotX = 0;
      targetRotY = 0;
    }
  });

  // 鼠标离开浏览器视口时复位
  document.addEventListener("mouseleave", () => {
    targetX = 0;
    targetY = 0;
    targetRotX = 0;
    targetRotY = 0;
  });

  // 2. 鼠标滚轮滑动：跟随滚轮上下滚动，同时注入 QQ 弹弹的冲量回弹
  window.addEventListener("wheel", (e) => {
    if (blogMain && blogMain.style.display === "none") return;

    // 根据滚轮方向与速度注入瞬时垂直微冲量
    const impulse = Math.max(-16, Math.min(16, e.deltaY * 0.08));
    velY += impulse;
    velRotX += impulse * 0.18;
  }, { passive: true });

  // 3. 弹簧振子物理更新循环 (60fps 硬件加速)
  function updatePhysics() {
    // 弹簧回复力与阻尼迭代
    const forceX = (targetX - posX) * SPRING;
    velX = (velX + forceX) * DAMPING;
    posX += velX;

    const forceY = (targetY - posY) * SPRING;
    velY = (velY + forceY) * DAMPING;
    posY += velY;

    const forceRotX = (targetRotX - rotX) * SPRING;
    velRotX = (velRotX + forceRotX) * DAMPING;
    rotX += velRotX;

    const forceRotY = (targetRotY - rotY) * SPRING;
    velRotY = (velRotY + forceRotY) * DAMPING;
    rotY += velRotY;

    // 仅在有动量时驱动变换，节省能耗
    if (
      Math.abs(posX) > 0.005 || Math.abs(posY) > 0.005 ||
      Math.abs(velX) > 0.005 || Math.abs(velY) > 0.005 ||
      Math.abs(rotX) > 0.005 || Math.abs(rotY) > 0.005
    ) {
      profileCard.style.transform = `perspective(800px) translate3d(${posX.toFixed(2)}px, ${posY.toFixed(2)}px, 0) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;

      if (avatarBox) {
        avatarBox.style.transform = `translate3d(${(posX * 0.35).toFixed(2)}px, ${(posY * 0.35).toFixed(2)}px, 12px)`;
      }
    }

    requestAnimationFrame(updatePhysics);
  }

  requestAnimationFrame(updatePhysics);
})();
