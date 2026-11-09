# M03 实验工作簿：Token、Embedding 与 Context

> 课程版本：0.40.9

> **证据等级：** E2 Simulated（玩具 tokenizer/上下文预算）+ E3 Local-tested（本地示例测试）；不证明供应商 Token 计量。 统一定义见[全课程证据等级](../CURRICULUM_EVIDENCE_LEVELS.md)。

> 配合浏览器内 Tokenizer Lab。Lab 使用内置玩具 BPE 词表，不等同任何生产 tokenizer，不验证厂商 API 的真实 token 计量。

## 学习成果
区分 Unicode/UTF-8/token/token ID/embedding；理解 BPE 等切分机制；计算 embedding 参数和存储；建立可复核的上下文预算与消息序列化审计。

## 实验环境
- 浏览器内 Tokenizer Lab；
- 纸笔或表格；
- 无需外部模型、GPU、API Key 或第三方依赖。

## 实验一：文本到 Token ID
**对应课程：** 第一讲《从文本到 Token ID》

1. 选择英文、中文、数字、代码和混合标点五类文本；
2. 记录字符数、Unicode 码点数、UTF-8 字节数；
3. 在 Tokenizer Lab 中观察玩具 BPE 合并；
4. 解释为什么字符数、字节数和 token 数不能互换；
5. 标注玩具词表结果与真实模型 tokenizer 的差别。

提交：五类输入对照表和至少三个边界观察。

## 实验二：Embedding 参数与存储
**对应课程：** 第二讲《从 Token ID 到 Embedding》

假设词表大小 V=32,000，embedding 维度 d=4,096，权重采用 BF16。

1. 计算 embedding 参数量 V×d；
2. 按每参数 2 bytes 估算权重 payload；
3. 讨论十进制 GB 与二进制 GiB 的区别；
4. 说明 weight tying 对输入 embedding 与输出投影参数共享的影响；
5. 列出训练优化器状态、梯度和运行时内存为何不包含在权重 payload 内。

提交：公式、单位、结果和估算边界。

## 实验三：Token Budget
**对应课程：** 第三讲《Context Window 与 Token Budget》

给定模型上下文窗口 32,000 tokens，设计一个企业知识助手请求预算。自行设定 system/developer、用户问题、历史、检索证据、工具结果、输出预留和安全余量。

1. 列出每个预算项和 token 数；
2. 检查总和不超过窗口；
3. 模拟检索结果增加 25% 后的超限情况；
4. 比较截断、摘要、减少检索候选和分轮处理；
5. 解释输出预留和隐藏模板开销为何不能忽略。

提交：预算表、超限情景和有优先级的降载策略。

## 实验四：Context Assembly 与序列化
**对应课程：** 第四讲《Context Engineering》

1. 画出 system/developer/user/assistant/tool 消息序列；
2. 说明工具调用与工具结果在消息序列中的位置；
3. 标记不可信检索内容和外部文档边界；
4. 解释 Chat Template 和特殊 token 与目标模型绑定；
5. 对错误角色顺序、遗漏结束标记或错误模板设计负向检查。

提交：序列化示意、信任边界图和错误检查清单。

## 实验五：端到端 Token/Context 审计
**对应课程：** 第五讲《综合实操》

对一个假想 RAG + Tool 请求，提交从原始输入到最终模型上下文的完整审计：
- tokenizer/模型版本和计量方法；
- 原始输入、检索 chunk、工具结果和模板开销；
- token budget 分配与超限策略；
- embedding 参数/存储估算；
- 版本、假设、未知项和复现步骤。

## 统一评价 Rubric（每项 2 分，共 10 分）
| 维度 | 2 分标准 |
|---|---|
| 表示概念 | Unicode、字节、token、token ID 和 embedding 区分准确 |
| Tokenizer | 能解释 BPE 示例和生产 tokenizer 的边界 |
| 参数账本 | 参数量、字节数和单位换算正确 |
| Context 预算 | 总量、输出预留、安全余量和超限策略完整 |
| 序列化与证据 | 消息顺序、模板版本、信任边界和复现信息明确 |

低于 7 分需补交；把 token ID 当 embedding 向量、把玩具 tokenizer 当生产计量或遗漏上下文预算总量时必须重做对应部分。


## 延伸阅读与来源

- [Neural Machine Translation of Rare Words with Subword Units](https://arxiv.org/abs/1508.07909)：BPE 子词单元论文。
- [SentencePiece](https://arxiv.org/abs/1808.06226)：语言无关的子词 tokenizer/detokenizer。
- [Hugging Face Tokenizer Summary](https://huggingface.co/docs/transformers/tokenizer_summary)：BPE、WordPiece、Unigram 等方法概览。
- [OpenAI API Token Counting](https://developers.openai.com/api/docs/guides/token-counting)：目标 API 输入结构的服务端 token 计数边界。
- [Hugging Face Chat Templates](https://huggingface.co/docs/transformers/chat_templating)：结构化消息到模型输入序列的模板机制。
