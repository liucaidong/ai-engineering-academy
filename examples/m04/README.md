# M04 可复现实验代码

本目录提供 M04 五讲对应的 Python 标准库教学计算器。无需 GPU、模型权重或第三方依赖。

## 环境

- Python 3.10+
- 仅使用 Python 标准库

## 运行

从仓库根目录执行：

    python3 examples/m04/01_pretraining_budget.py
    python3 examples/m04/02_moe_budget.py
    python3 examples/m04/03_lora_qlora_budget.py
    python3 examples/m04/04_preference_objectives.py
    python3 examples/m04/05_evaluation_metrics.py
    python3 -m unittest discover -s examples/m04 -p 'test_examples.py'

## 文件与课程映射

| 文件 | 对应主题 | 学习目标 |
|---|---|---|
| 01_pretraining_budget.py | 预训练与计算预算 | 复算 dense 模型粗略训练 FLOPs，并理解设备时间换算假设 |
| 02_moe_budget.py | 架构与 MoE | 区分总参数、每 token 激活参数和权重存储 payload |
| 03_lora_qlora_budget.py | SFT、LoRA 与 QLoRA | 计算 adapter 参数量，识别量化权重与总显存的区别 |
| 04_preference_objectives.py | RLHF、PPO 与 DPO | 观察 Bradley–Terry、PPO clipping 和 DPO loss 的数值行为 |
| 05_evaluation_metrics.py | 评测与发布 | 计算分类 accuracy、Brier score 和 ECE |

## 重要边界

- 6ND 是常用 dense Transformer 粗略估算，不适用于所有模型和训练配方，也不直接给出 GPU-hours。
- MoE active parameters 不是显存驻留量；所有专家权重可能仍需存储或分布式驻留。
- LoRA 参数比例不是总显存比例；QLoRA 的量化权重 payload 也不是峰值显存。
- 目标函数脚本仅展示局部数学机制，不是 PPO、RLHF 或 DPO 的训练框架。
- ECE 依赖分桶策略；分类概率校准不能直接替代自由文本生成的事实性评测。

所有输出均为教学样例，不代表任何具体模型的实测性能。
