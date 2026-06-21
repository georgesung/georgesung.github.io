---
layout: post
title: "Tracing Claude Code's LLM Traffic: Agentic loop, sub-agents, tool use, prompts"
date: 2026-01-26
categories: AI
---

# TLDR
I analyzed Claude Code's LLM requests and responses to get a glimpse of how it actually works. Here are the prompts, tool calls, and agentic loops I discovered.

If you prefer, this blog post is also available on:
- [Medium](https://medium.com/@georgesung/tracing-claude-codes-llm-traffic-agentic-loop-sub-agents-tool-use-prompts-7796941806f5)
- [Substack](https://open.substack.com/pub/georgesung/p/tracing-claude-codes-llm-traffic?utm_campaign=post-expanded-share&utm_medium=web)

# Intro
I’m late to the Claude Code party, mostly because I’ve been living in a world of subsidized Gemini tokens (thank you GCP startup program). However, I saw Ollama’s recent announcement that we can use Claude Code via Ollama, so I thought it would be fun to give Claude Code a try without a Claude Pro/Max subscription (sorry). Further, it would be even more fun to get some insight into what Claude Code is doing step by step. To that end, I decided to examine the LLM requests/responses coming from/to Claude Code, by adding a few simple print statements to Ollama. Let’s see what happened!

# Task
Since this was my first time using Claude Code, I wanted to start with a small and simple code repo, with simple tasks. This also helped keep the LLM token consumption relatively low, so I was able to use Ollama’s cloud service on their free tier.

I will use a small code repo I wrote a few years ago, where I fine-tuned LLMs with QLora ([repo here](https://github.com/georgesung/llm_qlora)). I will give Claude Code two simple tasks as test cases.

**Test case 1:** Add debug print statements

*“I want you to add some debug prints so I can see the parameters going into the LoraConfig when I start training”*
![test case 1](/assets/img/tracing-cc-1.jpg)

**Test case 2:** Explain codebase

*“Tell me about this codebase”*
![test case 2](/assets/img/tracing-cc-2.jpg)

# Method
![architecture](/assets/img/tracing-cc-arch.jpg)

- **Connect Claude Code to Ollama:** Per the instructions from the [Ollama blog post](https://ollama.com/blog/claude), I updated a couple of environment variables so Claude Code now makes its LLM calls through Ollama. For this experiment, I used [Claude Code version 2.1.19](https://github.com/anthropics/claude-code/releases/tag/v2.1.19)
- **Log/print the LLM requests/responses:** I forked [Ollama v0.14.2](https://github.com/ollama/ollama/releases/tag/v0.14.2) and added some print statements to log the LLM requests and responses coming from/to Claude Code: https://github.com/georgesung/ollama-v0.14.2-georgesung — then I [built Ollama from source](https://github.com/georgesung/ollama-v0.14.2-georgesung/blob/main/docs/development.md).
- **For the LLM, I used [GLM 4.7](https://ollama.com/library/glm-4.7:cloud) on Ollama Cloud.** For the purposes of my simple tasks, I was able to stay within the token quota of the free tier on Ollama Cloud.

# Results
For my two simple test cases, at a very high level this was what Claude Code was doing:

- Generate metadata about the conversation and user’s latest request
- Run agentic loop (this applies to main agent and any sub-agents)
    - Loop through tool calls until agent/sub-agent completes the user/parent-agent’s request
        - Note that spawning & running a sub-agent is a tool call as well
    - Summarize/present the results to the user/parent-agent, end the loop
- Generate suggestions for user’s next prompt (if any)

For the first test case of adding debug prints, Claude Code had the main agent do everything: search the codebase for the relevant file and also edit it. I was hoping it would spawn a sub-agent, but I guess my request was too specific so an explorer sub-agent was not necessary, per this excerpt from the main agent’s system prompt:
