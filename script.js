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
const bcCategory = document.getElementById("bc-category");
const bcChapter = document.getElementById("bc-chapter");
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

// 动态渲染左侧树状目录（支持多分类及子章节）
function renderTreeMenu() {
  const treeMenu = document.getElementById("tree-menu");
  if (!treeMenu || !BLOG_POSTS.length) return;

  // 按分类 (categoryName) 和 章节 (chapter) 分组
  const categoryMap = new Map();

  BLOG_POSTS.forEach(post => {
    const catName = post.categoryName || "AI入门";
    const catId = post.category || "cat";
    const chapterName = (post.chapter !== undefined && post.chapter !== null) ? post.chapter.trim() : "";

    if (!categoryMap.has(catName)) {
      categoryMap.set(catName, {
        id: catId,
        chapters: new Map()
      });
    }

    const catObj = categoryMap.get(catName);
    if (!catObj.chapters.has(chapterName)) {
      catObj.chapters.set(chapterName, []);
    }

    catObj.chapters.get(chapterName).push(post);
  });

  const CATEGORY_ICONS = {
    "AI入门": "🌱",
    "机器学习": "🤖",
    "深度学习": "🧠",
    "神经网络": "⚡",
    "随笔杂记": "📜",
    "GIT": "🔀"
  };

  let html = "";
  categoryMap.forEach((catObj, catName) => {
    const icon = CATEGORY_ICONS[catName] || "📚";
    
    let chaptersHtml = "";
    catObj.chapters.forEach((posts, chapterName) => {
      const leavesHtml = posts.map(post => `
        <div class="tree-leaf-item ${post.id === currentArticleId ? 'active' : ''}" 
             data-id="${post.id}" 
             onclick="selectArticle(${post.id})">
          <span class="leaf-icon">📄</span>
          <span class="leaf-title">${post.title}</span>
        </div>
      `).join("");

      if (!chapterName || chapterName === "none" || chapterName.trim() === "") {
        chaptersHtml += `
          <div class="tree-leaf-container direct-category-leaves">
            ${leavesHtml}
          </div>
        `;
      } else {
        chaptersHtml += `
          <div class="tree-subgroup open">
            <div class="tree-node tree-subgroup-head" onclick="toggleTreeSubgroup(this)">
              <span class="node-icon">📁</span>
              <span class="node-label">${chapterName}</span>
              <svg class="chevron-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
            <div class="tree-leaf-container">
              ${leavesHtml}
            </div>
          </div>
        `;
      }
    });

    html += `
      <div class="tree-group open" id="group-${catObj.id}">
        <div class="tree-node tree-group-head" onclick="toggleTreeGroup(this)">
          <span class="node-icon">${icon}</span>
          <span class="node-label">${catName}</span>
          <svg class="chevron-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
        ${chaptersHtml}
      </div>
    `;
  });

  treeMenu.innerHTML = html;
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
  if (bcCategory) bcCategory.textContent = post.categoryName || "AI入门";
  if (bcChapter) {
    const chapterSep = bcChapter.previousElementSibling;
    if (post.chapter && post.chapter.trim()) {
      bcChapter.textContent = post.chapter;
      bcChapter.style.display = "";
      if (chapterSep) chapterSep.style.display = "";
    } else {
      bcChapter.textContent = "";
      bcChapter.style.display = "none";
      if (chapterSep) chapterSep.style.display = "none";
    }
  }
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

  // 3. 动态渲染右侧文档大纲 (根据题目级别树状分类)
  renderArticleOutline();

  // 4. 更新底部翻页按钮状态
  updatePager();

  // 5. 平滑滚动到正文顶部
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// ==========================================
// 3.1. 右侧文档大纲 (TOC Outline) 核心逻辑
// ==========================================

// 动态构建并渲染当前文章的文档大纲树
function renderArticleOutline() {
  const outlineContent = document.getElementById("outline-content");
  if (!outlineContent) return;

  const detailTitle = document.getElementById("detail-title");
  const detailBody = document.getElementById("detail-body");
  if (!detailBody) return;

  const titleText = detailTitle ? detailTitle.textContent.trim() : "当前篇章";
  const titleId = "outline-anchor-title";
  if (detailTitle) detailTitle.id = titleId;

  // 获取正文所有标题 (h2, h3, h4, h5)
  // 注意：Markdown ## -> h3, ### -> h4, #### -> h5
  const headingEls = Array.from(detailBody.querySelectorAll("h2, h3, h4, h5"));

  if (!headingEls.length) {
    outlineContent.innerHTML = `
      <div class="outline-empty">
        <span class="empty-icon">🍃</span>
        <span>当前篇章暂无二级小节</span>
      </div>
    `;
    return;
  }

  // 整理层级结构
  // H2 或 H3 (Markdown ##) 作为二级主节
  // H4 (Markdown ###) 作为三级小节
  // H5 (Markdown ####) 作为四级细分子项
  const tree = [];
  let currentH2Node = null;

  headingEls.forEach((el, index) => {
    const id = "outline-heading-" + index;
    el.id = id;
    const tagName = el.tagName.toUpperCase();
    const text = el.textContent.trim();

    if (tagName === "H2" || tagName === "H3") {
      currentH2Node = {
        id: id,
        text: text,
        level: 2,
        children: []
      };
      tree.push(currentH2Node);
    } else if (tagName === "H4") {
      const childNode = {
        id: id,
        text: text,
        level: 3,
        children: []
      };
      if (currentH2Node) {
        currentH2Node.children.push(childNode);
      } else {
        tree.push(childNode);
      }
    } else if (tagName === "H5") {
      const subChildNode = {
        id: id,
        text: text,
        level: 4
      };
      if (currentH2Node && currentH2Node.children.length > 0) {
        const lastChild = currentH2Node.children[currentH2Node.children.length - 1];
        lastChild.children = lastChild.children || [];
        lastChild.children.push(subChildNode);
      } else if (currentH2Node) {
        currentH2Node.children.push(subChildNode);
      } else {
        tree.push(subChildNode);
      }
    }
  });

  // 构建 HTML 树状节点
  let childrenHtml = "";

  tree.forEach(node => {
    const hasChildren = node.children && node.children.length > 0;
    
    let subHtml = "";
    if (hasChildren) {
      subHtml = node.children.map(child => {
        return `
          <div class="outline-leaf" data-heading-id="${child.id}" onclick="jumpToHeading('${child.id}')" title="${child.text}">
            <span class="outline-leaf-text">${child.text}</span>
          </div>
        `;
      }).join("");
    }

    childrenHtml += `
      <div class="outline-section ${hasChildren ? 'has-children open' : 'no-children'}" data-heading-id="${node.id}">
        <div class="outline-row">
          ${hasChildren ? `
            <span class="outline-chevron" onclick="toggleOutlineSection(event, this)">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </span>
          ` : `<span class="outline-spacer"></span>`}
          <span class="outline-row-title" onclick="jumpToHeading('${node.id}')" title="${node.text}">
            ${node.text}
          </span>
        </div>
        ${hasChildren ? `<div class="outline-sub-container">${subHtml}</div>` : ''}
      </div>
    `;
  });

  const rootHtml = `
    <div class="outline-root open" id="outline-root-node">
      <div class="outline-row root-row active">
        <span class="outline-chevron" onclick="toggleOutlineRoot(event, this)">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </span>
        <span class="outline-row-title root-title" onclick="jumpToHeading('${titleId}')" title="${titleText}">
          ${titleText}
        </span>
      </div>
      <div class="outline-root-children" id="outline-root-children">
        ${childrenHtml}
      </div>
    </div>
  `;

  outlineContent.innerHTML = rootHtml;
}

// 点击大纲项平滑滚动至对应正文位置
window.jumpToHeading = function(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const headerOffset = 95;
  const elementPosition = el.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

  window.scrollTo({
    top: offsetPosition,
    behavior: "smooth"
  });

  // 更新大纲高亮
  highlightOutlineItem(id);

  // 正文标题微跳反馈
  el.classList.remove("heading-jump-target");
  void el.offsetWidth;
  el.classList.add("heading-jump-target");
};

// 单节折叠切换
window.toggleOutlineSection = function(event, chevron) {
  if (event) event.stopPropagation();
  const section = chevron.closest(".outline-section");
  if (section) section.classList.toggle("open");
};

// 根节点（文档标题）折叠切换
window.toggleOutlineRoot = function(event, chevron) {
  if (event) event.stopPropagation();
  const root = chevron.closest(".outline-root");
  if (root) root.classList.toggle("open");
};

// 全部折叠/展开按钮
window.toggleAllOutlineNodes = function() {
  const sections = document.querySelectorAll(".outline-section.has-children, .outline-root");
  if (!sections.length) return;
  const anyClosed = Array.from(sections).some(s => !s.classList.contains("open"));
  sections.forEach(s => {
    if (anyClosed) s.classList.add("open");
    else s.classList.remove("open");
  });
};

// 高亮指定的大纲条目
function highlightOutlineItem(id) {
  document.querySelectorAll(".outline-row, .outline-leaf").forEach(el => {
    el.classList.remove("active");
  });

  if (!id || id === "outline-anchor-title") {
    const rootRow = document.querySelector(".outline-row.root-row");
    if (rootRow) rootRow.classList.add("active");
    return;
  }

  const targetEl = document.querySelector(`[data-heading-id="${id}"]`);
  if (!targetEl) return;

  if (targetEl.classList.contains("outline-leaf")) {
    targetEl.classList.add("active");
    const parentSection = targetEl.closest(".outline-section");
    if (parentSection) parentSection.classList.add("open");
  } else if (targetEl.classList.contains("outline-section")) {
    const row = targetEl.querySelector(".outline-row");
    if (row) row.classList.add("active");
  }
}

// 页面滚动监听：Scrollspy 大纲自动跟随高亮
let isScrollTicking = false;
window.addEventListener("scroll", () => {
  if (isScrollTicking) return;
  isScrollTicking = true;
  requestAnimationFrame(() => {
    updateOutlineScrollspy();
    isScrollTicking = false;
  });
}, { passive: true });

function updateOutlineScrollspy() {
  const detailBody = document.getElementById("detail-body");
  if (!detailBody) return;
  const headings = Array.from(detailBody.querySelectorAll("h2, h3, h4, h5"));
  if (!headings.length) return;

  const headerOffset = 130;
  let activeId = "outline-anchor-title";

  if (window.pageYOffset > 150) {
    for (let i = 0; i < headings.length; i++) {
      const rect = headings[i].getBoundingClientRect();
      if (rect.top <= headerOffset) {
        activeId = headings[i].id;
      } else {
        break;
      }
    }
  }

  highlightOutlineItem(activeId);
}

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

  // 动态更新右侧统计卡片的文章总数与专栏数
  const statArticles = document.getElementById("stat-articles");
  if (statArticles) statArticles.textContent = BLOG_POSTS.length;

  const statColumns = document.getElementById("stat-columns");
  if (statColumns) {
    const uniqueCats = new Set(BLOG_POSTS.map(p => p.categoryName));
    statColumns.textContent = uniqueCats.size;
  }

  // 渲染左侧分类树
  renderTreeMenu();

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
