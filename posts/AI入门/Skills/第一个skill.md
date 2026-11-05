# 第一个skill

## 编辑skill文件

以claude code为例。你可以在c盘/用户/用户名下方找到.claude文件夹，内部含有skill文件夹，进入skill，创建新文件夹，名字起为python-naming-standard。该文件夹下方创建skill.md，打开输入以下内容。

```
---
name: Python 内部命名规范技能
description: 当用户要求重构、审查或编写 Python 代码时，请参考此规范。
---

## 指令
1. 所有的内部辅助函数必须以 `_internal_` 前缀命名。
2. 如果发现不符合此规则的代码，请自动提出修改建议。
3. 在执行 `claude commit` 前，必须检查此规范。

## 参考示例
- 正确：`def _internal_calculate_risk():`
- 错误：`def _calculate_risk():`
```

保存后在终端打开claude，输入“帮我写一个计算用户折扣的函数”，等待claude回应。可以看到claude成功读取并实现。

![image.png](./assets/image-2.png)

## 添加资源文件（可选）

另外我们可以在 **.claude/skills/** 下添加以下目录：

在同一文件夹添加：

- `examples/`：存放示例文件。

- `references/`：存放参考文档。

- `scripts/`：存放可执行脚本（例如 Python 处理 PDF）。

然后在 SKILL.md 中引用：

```
查看示例 commit：./examples/good-commit.txt
运行脚本：使用工具执行 ./scripts/process.py
```

## 官方skill市场

请访问 https://github.com/anthropics/skills 查看。内含多种技能。

### 将仓库注册为claude code插件市场

在claude code中执行：

```
/plugin marketplace add anthropics/skills
```

![image.png](./assets/image-3.png)

然后可使用/plugin查看。

![image.png](./assets/image-4.png)

### 安装指定集步骤

1. 选择anthropic-agent-skills。

   ![image.png](./assets/image-5.png)

2. 好吧这里我只能更新，一般情况下可以选择下载你想要的skill。

   ![image.png](./assets/image-6.png)

   安装好的插件在～/claude/plugins/marketplaces/目录下。

3. 使用的时候只需在指令中提及技能名称即可调用，例如安装 document-skills 插件后，可向 Claude Code 下达指令：

   ```
   使用 PDF 技能提取 path/to/some-file.pdf 文件中的表单字段
   ```

   或者创建一个 PPT：

   ```
   创建一个 Agent Skill 的演示文稿
   ```

