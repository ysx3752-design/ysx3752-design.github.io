# 什么是skills

## 什么是 Agent？

在讲 Skill 之前，得先知道它是给谁用的。
现在的 AI 大模型（比如 ChatGPT、DeepSeek）本身只是个“坐在办公室里的理论大师”。你问它“怎么做红烧肉”，它能给你写出完美菜谱，但它没有手脚，不能帮你去买菜、切肉、开火。
为了让它能真正“干活”，我们给它配了手脚、眼睛和工具，这个能自己动手干活的 AI，就叫 Agent（智能体）。

---

## 什么是 Skill？

Skill 就是给这个 AI 打工人的“岗位标准操作手册”（SOP）或者“专用工具包”。

你可以这么想：你招了一个绝顶聪明但刚毕业的大学生。他懂全世界的理论，但如果你直接让他“去把公司上个月的财务报销核对了”，他会一脸懵逼，因为他不知道你们公司的报销流程是什么。这时候，你递给他一本 **Skill（技能手册）**，上面写着：

> **技能名称**：核对上个月财务报销\
> **什么时候用**：当老板说“查上个月账”的时候。\
> **第一步**：打开财务部的共享文件夹。\
> **第二步**：下载《报销规定.pdf》。\
> **第三步**：把每一张发票的金额加一遍，对比 PDF 里的规定，超标就标红。\
> **第四步**：生成一个 Excel 表格交给我。

一旦 AI 掌握了这个 Skill，下次你再喊“查上个月账”，它就会自动按照这本手册一步步去执行，甚至它还可以自己调用计算器（工具）来算数。

<u>**Skills 在技术上是一个 Markdown 文件（SKILL.md），写着该任务的完整执行指南。它由人类编写，然后被智能体在执行任务时自动读取和遵循。**</u>

---

## Skills 的核心价值

- **1、Skills 让智能体从会聊天变成会干活**：没有 Skills，智能体只是个知识渊博的聊天机器人。有了 Skills，它成为能真正完成任务的执行者。

- **2、Skills 是可复用的经验包**：一旦有人把生成 Word 文档这件事的经验写进了 Skill，所有人、所有次调用，都能得到稳定一致的结果。不会因为换了个人提问就失效。

- **3、Skills 是人与 AI 协作的桥梁**\
  人类把领域知识、流程经验、环境约束写进 Skill；AI 读懂后去执行。Skills 就是这座桥——人类专注定义怎么做，AI 负责真正去做。

---

## 起手开发

开发一个 Skill，其实**不需要从头去写特别复杂的底层代码**。

它通常就是一个**文件夹**，里面最核心的是一个 Markdown 格式的文本文件（一般都叫 `SKILL.md`），里面用大白话写清楚：

- **这个技能叫什么名字？**（比如：自动做旅游攻略）

- **这个技能什么时候触发？**（比如：当用户问“我想去哪哪玩”时）

- **具体的操作步骤是什么？**（比如：第一步调用搜索引擎查天气；第二步调用地图工具查路线；第三步写一份文案。）

- （可选）你还可以在文件夹里放一些写好的 Python 小脚本，告诉 AI：“当你走到第三步的时候，运行这个脚本”。

*一个skill的最基本模板*：

```
---
name: your-skill-name  #skil唯一标识符
description: 一句话描述该 Skill 的功能和使用场景  #告诉AI何时使用这个skill
---

# Skill 名称

## 使用指引
[给 AI 的分步骤行为指引]

## 示例
[该 Skill 的具体使用示例]

```

---

## YAML frontmatter + Markdown正文

### frontmatter

1. frontmatter 的六个字段

   | 字段 | 必填 | 限制与用途 |
   | :--- | :--- | :--- |
   | `name` | 是 | 最多 64 字符；小写字母、数字、连字符 |
   | `description` | 是 | 1–1024 字符；说明做什么、什么时候用 |
   | `license` | 否 | 许可证名称，或指向随 Skill 附带的许可证文件 |
   | `compatibility` | 否 | 最多 500 字符；说明环境要求（面向哪个产品、需要哪些系统包、是否要联网） |
   | `metadata` | 否 | 字符串到字符串的键值表，放规范之外的附加信息，如作者、版本 |
   | `allowed-tools` | 否 | 用空格分隔的、预先批准可用的工具列表 |


   带可选字段的官方示例：

   ```
   markdown
   ---
   name: pdf-processing
   description: Extract PDF text, fill forms, merge files. Use when handling PDFs.
   license: Apache-2.0
   metadata:
     author: example-org
     version: "1.0"
   ---
   ```

   **规范特别说明**：大多数 Skill 不需要 compatibility，只有确实对环境有要求时才写，例如「Requires git, docker, jq, and access to the internet」。

2. name 的规则
   规范列出的全部要求：

   - 1–64 个字符；

   - 只能包含小写字母 a-z、数字 0-9 和连字符 -；

   - 不能以连字符开头或结尾；

   - 不能出现连续的连字符 --；

   - 必须和上级目录名一致。

   ```
   name: processing-pdfs        # 好：动名词形式，清晰描述功能
   name: analyzing-spreadsheets # 好：一眼知道用途
   name: my-brand-guidelines    # 好：组织专属知识
   
   name: helper      # 差：太模糊
   name: MySkill     # 差：包含大写字母（不合规）
   name: data files  # 差：包含空格（不合规）
   ```

3. description 怎么写
   规范的要求是三条：1–1024 字符、同时描述做什么和什么时候用、包含能帮智能体识别相关任务的具体关键词。

   官方给的一好一坏：

   ```
   # 好的，精准定位场景+覆盖出触发键词
   description: Extracts text and tables from PDF files, fills PDF forms, and merges multiple PDFs. Use when working with PDF documents or when the user mentions PDFs, forms, or document extraction.
   
   # 差，模糊不清，AI无法判断什么是触发
   description: Helps with PDFs.
   ```


   《Optimizing skill descriptions》里还有四条写法建议：

   - 用祈使句，写成「Use this skill when...」而不是「This skill does...」；

   - 写用户想达成什么，而不是 Skill 内部怎么实现；

   - 宁可写得主动一点，把用户没有直接说出领域名称的场景也列进去；

   - 保持简短，几句话到一小段，装了很多 Skill 时描述太长会挤占上下文。description 写不好导致 Skill 不被调用，是最常见的问题，排查办法见《Skill 不触发怎么办》。


   ### 正文

   范对正文没有格式要求，**推荐包含三类内容：分步骤的说明、输入输出的例子、常见的边界情况**。要注意的是，智能体一旦决定启用某个 Skill，就会把整份 SKILL.md 读进上下文，所以写多了是有代价的。

   官方最佳实践里几条最实用的原则：

   只写智能体不知道的。 不需要解释 PDF 是什么、HTTP 怎么工作。对每一段内容问一句：没有这条说明，智能体会做错吗？不会就删掉。该写的是项目特有的约定、领域流程、不明显的坑、指定要用的工具或接口。

   给默认做法，不要给菜单。 「可以用 pypdf、pdfplumber、PyMuPDF 或 pdf2image」不如「用 pdfplumber 提取文本；扫描件需要 OCR 时改用 pdf2image 加 pytesseract」。

   教方法，不要给某一次的答案。 「把 orders 表和 customers 表按 customer_id 关联，筛选 EMEA 区域」只对这一次有用；「先读 schema 文件找到相关的表，再按外键约定关联，再把用户的条件写成筛选」才可以复用。

   按任务的脆弱程度决定写多死。 多种做法都行的地方，说明目的、让智能体自己判断；顺序不能错、命令不能改的地方（比如数据库迁移），就写「严格按以下命令执行，不要增删参数」。

   专门留一节「注意事项」（Gotchas）。 官方认为这往往是一个 Skill 里价值最高的部分：那些违反直觉的环境事实，例如「users 表是软删除，查询必须带 WHERE deleted_at IS NULL」。智能体每犯一次需要你纠正的错，就往这里加一条。

   要固定输出格式就给模板。 比起用文字描述格式，直接给一份带占位符的模板更可靠。

   多步骤流程用清单，关键步骤后做校验。 让智能体做完之后跑一遍校验脚本或对照检查表，不通过就修到通过为止。

### 一个完整的skill.md

```
---
name: weekly-report
description: Write the team's weekly report in the fixed four-section format. Use when the user asks for a weekly report, a week summary, or wants to turn notes or commit logs into a status update, even if they do not say "weekly report".
metadata:
  author: your-team
  version: "1.0"
---

# 周报

## 步骤
1. 向用户确认本周的起止日期；用户已提供材料时不要重复询问。
2. 把材料归入下面四个部分，每部分不超过 5 条。
3. 每一条以结果开头，写清数字或交付物，不写过程。

## 输出模板
### 本周完成
### 进行中
### 风险与需要的支持
### 下周计划

## 注意事项
- 没有材料支撑的内容不要编写，标注「待补充」。
- 涉及客户名称时使用内部代号，见 references/customers.md。
```


最小必填示例：

```
---
name: skill-name
description: 说明该 Skill 的功能以及适用场景
---
```


## Skill 的文件目录结构

一个技能就是一个文件夹，至少包含一个 SKILL.md 文件，根据需要，还可以包含其他目录和文件。

为避免上下文膨胀：

- 核心规则 → `SKILL.md`

- 详细资料 → 单独文件

- 实用逻辑 → 脚本执行（不加载）

<p align="center">
  <img src="./assets/image.png" alt="image.png" width="500px">
</p>

