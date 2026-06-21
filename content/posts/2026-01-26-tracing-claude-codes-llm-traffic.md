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

I will use a small code repo I wrote a few years ago, where I fine-tuned LLMs with QLora (https://github.com/georgesung/llm_qlora). I will give Claude Code two simple tasks as test cases.

**Test case 1:** Add debug print statements

*“I want you to add some debug prints so I can see the parameters going into the LoraConfig when I start training”*
foo