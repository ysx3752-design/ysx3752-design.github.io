# skill脚本拓展

## 为什么使用脚本

使用脚本可以：

- 封装复杂的逻辑，避免在 SKILL\.md 中写大量代码
- 提供经过测试的可靠实现
- 让代理可以重复使用相同的工具和函数
- 处理更复杂的输入输出操作

脚本需放在技能目录的scripts文件夹下方，目录结构如下：

```
skill/
├── SKILL.md
└── scripts/
    ├── script1.py
    ├── script2.sh
    └── helper.js
```

---

## 脚本编写规范

### 1\. 自包含性

脚本应该尽量自包含，或者清楚地记录依赖关系。“脚本自包含性”（Self\-contained）指**一个脚本应该具备独立运行、独立完成任务的能力，不依赖外部环境、其他外部文件或特定的复杂状态。**

可以理解它是第一个打包好的压缩包，**Agent的运行环境是不确定的**，可以让别人拿到能够直接使用。

```python
#!/usr/bin/env python3
"""
PDF 文本提取脚本

依赖：pip install pdfplumber
运行：python scripts/extract_pdf.py input.pdf
"""

import sys
import pdfplumber

def extract_text_from_pdf(pdf_path):
    """从 PDF 文件提取文本"""
    with pdfplumber.open(pdf_path) as pdf:
        text = ""
        for page in pdf.pages:
            text += page.extract_text() or ""
    return text

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("用法: python extract_pdf.py <pdf 文件>")
        sys.exit(1)

    pdf_path = sys.argv[1]
    text = extract_text_from_pdf(pdf_path)
    print(text)
```

- **不自包含的代码**：可能会写成 ` import my_utils ` 或者 ` from config import PDF_CONFIG `。这意味着如果别人拿到这个脚本，还得去满世界找你写的 ` my_utils.py ` 和 ` config.py，少一个文件就跑不起来。

- **这段代码**：只使用了 Python 的**标准库**（`sys`）和一个公开的**第三方库**（`pdfplumber`）。它没有引用任何你自己写的其他隐藏文件。别人只要有 `pdfplumber` 这个包，直接就能跑。

- **清晰的依赖声明**：代码最上面的注释写了 `依赖：pip install pdfplumber`。这就像压缩饼干的包装袋上写了“保质期”和“食用方法”。Agent（智能体）看到这行字，就知道在运行它之前，得先帮它安装这个库。

- **自带参数校验**：底部的 `if len(sys.argv) < 2:` 是它的“防呆设计”。如果你不按规矩给它传 PDF 路径，它自己就会报错并打印出正确的使用方法（用法: python extract\_pdf.py \<pdf 文件\>），不会直接崩溃。

### 2\. 清晰的错误处理

脚本应该提供有用的错误信息，帮助代理理解出了什么问题。

```python
import sys

def main():
    if len(sys.argv) < 2:
        print("错误：缺少必需的参数", file=sys.stderr)
        print("用法: python script.py <输入文件> [输出文件]", file=sys.stderr)
        sys.exit(1)

    input_file = sys.argv[1]

    try:
        # 执行主要逻辑
        process_file(input_file)
    except FileNotFoundError:
        print(f"错误：找不到文件 {input_file}", file=sys.stderr)
        sys.exit(1)
    except PermissionError:
        print(f"错误：没有权限读取文件 {input_file}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"错误：处理文件时发生未知错误: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
```

### 3\. 处理边界情况

脚本应该优雅地处理各种边界情况，而不是崩溃。

```python
def validate_input(text):
    """验证输入是否有效"""
    if not text:
        return False, "输入不能为空"

    if len(text) > 10000:
        return False, "输入长度超过限制（最大 10000 字符）"

    return True, ""

# 使用验证
is_valid, error_msg = validate_input(user_input)
if not is_valid:
    print(f"验证失败: {error_msg}")
    sys.exit(1)
```

---

## 在 SKILL\.md 中引用脚本

当技能需要执行脚本时，在 SKILL\.md 中说明如何调用它。

引用脚本:

````markdown
## PDF 文本提取

使用脚本提取 PDF 中的文本：

```bash
python scripts/extract_pdf.py input.pdf
```

脚本会从 input.pdf 提取所有文本并输出到标准输出。

如果需要将结果保存到文件：

```bash
python scripts/extract_pdf.py input.pdf > output.txt
```
````

---

## 支持的脚本语言

支持的脚本语言取决于你使用的代理实现。常见的选项包括：

1. Python	最常用的选择，功能强大且易于编写
2. Bash	适合系统操作和命令行工具
3. JavaScript	适合 Web 相关的任务

   提示：在选择脚本语言时，**考虑目标用户的运行环境。如果不确定，Python 是最安全的选择。**

---

## 完整示例：PDF 处理技能

让我们看一个完整的示例，展示如何结合 SKILL\.md 和脚本：

```pdf\-tool/  
├── SKILL\.md  
└── scripts/  
    ├── extract\.py  
    ├── fill\_form\.py  
    └── merge\.py
```

SKILL\.md 内容:

````markdown
---
name: pdf-tool
description: 处理 PDF 文件，包括提取文本、填写表单、合并文件。使用场景：处理 PDF、提取文本、填写表单、合并 PDF。
---

## 提取 PDF 文本

从 PDF 文件中提取文本内容：

```bash
python scripts/extract.py input.pdf
```

输出是提取的纯文本内容。

## 填写 PDF 表单

使用 JSON 数据填写 PDF 表单：

```bash
python scripts/fill_form.py input.pdf data.json output.pdf
```

data.json 格式：
```json
{
  "field_name": "字段值",
  "another_field": "另一个值"
}
```

## 合并 PDF

将多个 PDF 文件合并为一个：

```bash
python scripts/merge.py output.pdf input1.pdf input2.pdf input3.pdf
```

## 依赖安装

需要安装 pdfplumber 和 PyPDF2：

```bash
pip install pdfplumber PyPDF2
```
````

---

## 两种使用方式

在 Skill 中使用代码有两种方式：

| 方式 | 适用场景 | 是否需要 scripts/ 目录 |
| :--- | :--- | :--- |
| 一次性命令 | 只需调用现有工具，无需自定义逻辑 | 不需要 |
| 自包含脚本 | 需要复用的复杂逻辑 | 需要 |

- **一次性命令**：AI 直接调用现成的工具。

  场景：你想让 AI 查一下当前文件夹里有哪些文件。

  做法：AI 直接在终端敲一句 ls（Linux/Mac）或 dir（Windows）。

  特点：不需要 scripts/ 目录，不需要写 Python 文件，即敲即用，用完就走。

- **自包含脚本**：你需要写一个完整的代码文件，让 AI 去执行。

  场景：你想让 AI 提取一个 PDF 里的文字，并过滤掉特定的符号。

  做法：你必须写一个 extract.py，放进 scripts/ 目录，然后 AI 去运行它。

  特点：需要 scripts/ 目录，适合处理复杂、需要复用的逻辑。

### 常用一次性命令运行方式

- ### **uvx（Python）**

  uvx 是 uv 自带的工具运行命令，会在隔离环境中运行 Python 包，且缓存积极，重复运行几乎瞬间完成。

  ```
  # 运行指定版本的 ruff 检查代码
  uvx ruff@0.8.0 check .
  
  # 运行指定版本的 black 格式化代码
  uvx black@24.10.0 .
  ```

- ### **pipx（Python）**

  pipx 是 uvx 的成熟替代方案，可通过系统包管理器安装（如 `brew install pipx`）。

  ```
  # 运行指定版本的 black
  pipx run 'black==24.10.0' .
  
  # 运行指定版本的 ruff
  pipx run 'ruff@0.8.0' check .
  ```

- ### **npx（Node.js）**

  npx 随 npm 自带，按需下载并运行 npm 包。

  ```
  # 运行 ESLint 检查
  npx eslint@9 --fix .
  
  # 使用 Vite 创建项目
  npx create-vite@6 my-app
  ```

- ### **go run（Go）**

  Go 自带的工具运行命令，直接编译并运行远程包.

  ```
  # 运行 goimports 格式化导入
  go run golang.org/x/tools/cmd/goimports@v0.28.0 .
  
  # 运行 golangci-lint 检查
  go run github.com/golangci/golangci-lint/cmd/golangci-lint@v1.62.0 run
  ```

### 在 SKILL.md 中怎么写“一次性命令”？

非常简单，你只需要在指令步骤里直接告诉 AI 去执行这个命令即可。

举个🌰，假设你写了一个“检查项目状态”的 Skill：

```
---
name: project-checker
description: 检查当前项目文件夹的大小，以及当前所在的 Git 分支。
---

# 指令
1. 请在终端运行 `du -sh .` 查看当前文件夹的总大小。
2. 请在终端运行 `git branch --show-current` 查看当前分支。
3. 把结果整理成一段话汇报给用户。
```

在这个例子里，<strong>完全没有用到 </strong>`scripts/`<strong> 目录</strong>。AI 看到你的指令后，会直接借用系统自带的 `du` 和 `git` 工具，各敲一行命令（这就是一次性命令），然后直接给你答案。

---

## 在 SKILL\.md 中引用脚本

使用从 Skill 目录根开始的 **相对路径**来引用打包的文件。

Agent 会自动解析这些路径，无需使用绝对路径。

首先在 SKILL\.md 中列出可用脚本：

```markdown 可用脚本
## 可用脚本

- **`scripts/validate.sh`** — 验证配置文件
- **`scripts/process.py`** — 处理输入数据
- **`scripts/report.py`** — 生成分析报告
```

然后在操作步骤中引用它们：

````markdown
## 操作流程

1. 运行验证脚本：
   ```bash
   bash scripts/validate.sh "$INPUT_FILE"
   ```

2. 处理数据：
   ```bash
   python3 scripts/process.py --input results.json
   ```
````

---

## **Python 自包含脚本（PEP 723）**

**PEP 723**（Python 增强提案），它解决了一个困扰程序员几十年的痛点：**“如何把代码和它依赖的库，打包在一个纯文本文件里，并且直接运行？”**

一个简单的案例：

```python
# /// script
# dependencies = [
#   "beautifulsoup4",
# ]
# ///

from bs4 import BeautifulSoup

# 示例 HTML 内容
html = '<html><body><h1>Welcome</h1><p class="info">RUNOOB 测试</p></body></html>'

# 使用 BeautifulSoup 解析 HTML
soup = BeautifulSoup(html, "html.parser")

# 提取 class="info" 的段落文本
info_text = soup.select_one("p.info").get_text()
print(info_text)
```


1. 什么是“依赖问题”？
   如果你写了一个 Python 脚本 extract.py，里面用了 bs4，你把代码发给别人，别人直接运行 python extract.py 会报错，因为他的电脑里没装 bs4。他必须先手动输入 pip install beautifulsoup4 安装，然后再运行。
2. &#32;PEP 723 是怎么解决的？

   PEP 723 规定了一种标准格式：在 Python 文件的最开头，用特定的注释符号（**`# ///`**）把需要的库写进去。

   ```python
   # /// script
   # dependencies = [
   #   "beautifulsoup4",
   # ]
   # ///
   ```

   这几行注释是给 Python 运行工具看的“说明书”。它告诉工具：“运行我之前，请先帮我自动下载 `beautifulsoup4`<strong>。</strong>”
3. 如何运行？

   因为这是新标准，传统的 `python extract.py` 是看不懂这个“说明书”的。你需要用到支持这个标准的新一代运行工具，比如 `uv` 或者 `pipx`。
   - `uv run scripts/extract.py`：`uv` 读到文件开头的注释，发现需要 `beautifulsoup4`。于是它立刻在后台建个临时环境，下载这个库，然后瞬间运行你的代码，最后打印出 `RUNOOB 测试`。整个过程你连 `pip install` 都不用敲，非常清爽。

### **为什么这对 Skill（技能）扩展非常重要？**

&#9;之前你写 `extract_pdf.py` 时，要在说明书写上“依赖：pip install pdfplumber”。但 Agent（智能体）有时候很笨，会忘记安装，或者因为电脑环境不对导致安装失败。

**如果你用了 PEP 723 标准写 Skill 脚本**：

1. 你把脚本放进 `scripts/` 目录。

2. 你在 `SKILL.md` 里告诉 AI：“请运行 `uv run scripts/xxx.py`”。

3. **AI 甚至不需要知道这个脚本需要什么依赖，** 因为脚本自己会告诉 `uv` 工具。AI 只管无脑执行 `uv run`，脚本自己解决所有安装问题。

---

### **Deno 自包含脚本**

Deno 通过 `npm:` 和 `jsr:` 导入说明符实现自包含：

```
#!/usr/bin/env -S deno run

import * as cheerio from "npm:cheerio@1.0.0";

const html = `<html><body><h1>Welcome</h1><p class="info">RUNOOB 测试</p></body></html>`;
const $ = cheerio.load(html);
console.log($("p.info").text());
```

运行：

```
deno run scripts/extract.ts
```

---

### **Bun 自包含脚本**

Bun 在没有 `node_modules` 目录时会自动安装缺失的包：

```Deno
#!/usr/bin/env bun

import * as cheerio from "cheerio@1.0.0";

const html = `<html><body><h1>Welcome</h1><p class="info">RUNOOB 测试</p></body></html>`;
const $ = cheerio.load(html);
console.log($("p.info").text());
```

运行：

```
bun run scripts/extract.ts
```

---

### **Ruby 自包含脚本**

Ruby 使用 `bundler/inline` 在脚本中声明 gem 依赖：

```ruby
require 'bundler/inline'

gemfile do
  source 'https://rubygems.org'
  gem 'nokogiri'
end

html = '<html><body><h1>Welcome</h1><p class="info">RUNOOB 测试</p></body></html>'
doc = Nokogiri::HTML(html)
puts doc.at_css('p.info').text
```

运行：

```
ruby scripts/extract.rb
```

---

## 设计脚本的要点

Agent 通过读取 stdout 和 stderr 来决定下一步操作，脚本的设计要考虑 Agent 的使用特点。

### 避免交互式提示

这是硬性要求。Agent 在非交互式 Shell 中运行，无法响应 TTY 提示、密码对话框或确认菜单。所有输入应通过命令行参数、环境变量或 stdin 传入。

```
# 错误：会卡住等待输入
$ python scripts/deploy.py
Target environment: _

# 正确：清晰的错误信息和引导
$ python scripts/deploy.py
Error: --env is required. Options: development, staging, production.
Usage: python scripts/deploy.py --env staging --tag v1.2.3
```

### 提供 --help 文档

`--help` 输出是 Agent 了解脚本接口的主要方式。包含简要说明、可用参数和使用示例：

```
Usage: scripts/process.py [OPTIONS] INPUT_FILE

处理输入数据并生成摘要报告。

Options:
  --format FORMAT    输出格式: json, csv, table (默认: json)
  --output FILE      将输出写入文件而非 stdout
  --verbose          在 stderr 中打印进度信息

Examples:
  scripts/process.py data.csv
  scripts/process.py --format csv --output report.csv data.csv
```

### **编写有用的错误信息**

Agent 看到错误信息后会据此调整策略，信息越具体，Agent 越容易自我纠正。

```
# 不好的错误信息
Error: invalid input

# 好的错误信息
Error: --format must be one of: json, csv, table.
       Received: "xml"
```

### **使用结构化输出**

优先使用 JSON、CSV、TSV 等结构化格式输出，而非自由文本。

结构化格式可同时被 Agent 和标准工具（jq、cut、awk）消费，方便组合使用。

```
# 不推荐：对齐文本，难以程序化解析
NAME          STATUS    CREATED
my-service    running   2025-01-15

# 推荐：JSON 格式，字段边界清晰
{"name": "my-service", "status": "running", "created": "2025-01-15"}
```

---

## 更多脚本设计建议

<table data-nomo-table="semantic"><tbody><tr><th data-align="left"><p>建议</p></th><th data-align="left"><p>说明</p></th></tr><tr><td><p><strong>幂等性</strong></p></td><td><p>Agent 可能重试命令。"不存在则创建"比"创建并在重复时报错"更安全</p></td></tr><tr><td><p><strong>输入约束</strong></p></td><td><p>用清晰的错误拒绝模糊输入，而非猜测用户意图</p></td></tr><tr><td><p><strong>Dry-run 支持</strong></p></td><td><p>对于破坏性或有状态操作，提供 <code>--dry-run</code> 标志让 Agent 预览操作</p></td></tr><tr><td><p><strong>有意义的退出码</strong></p></td><td><p>不同失败类型使用不同退出码（未找到、参数无效、认证失败等）</p></td></tr><tr><td><p><strong>可预测的输出大小</strong></p></td><td><p>默认输出摘要，提供 <code>--offset</code> 等参数让 Agent 按需获取更多信息</p></td></tr><tr><td><p><strong>安全默认值</strong></p></td><td><p>破坏性操作应要求明确的确认标志（<code>--confirm</code>、<code>--force</code>）</p></td></tr></tbody></table>

---

## 脚本分发和依赖

如果脚本需要外部依赖，你有几个选择：

1. 在 SKILL.md 中说明依赖
   最简单的方式是在 SKILL.md 中记录所需的依赖。

2. 使用虚拟环境
   对于复杂的项目，可以创建一个虚拟环境。

3. 使用 Docker
   如果需要完整的运行环境，可以使用 Docker 容器。

