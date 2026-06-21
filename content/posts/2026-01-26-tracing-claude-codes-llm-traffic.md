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

> VERY IMPORTANT: When exploring the codebase to gather context or to answer a question that is not a needle query for a specific file/class/function, it is CRITICAL that you use the Task tool with subagent_type=Explore instead of running search commands directly.

My query might have been interpreted as “a needle query for a specific file/class/function”.

So, for my second test case, I simply asked Claude Code to “tell me about this codebase”. Indeed, it spawned a sub-agent to explore the codebase, so I was able to see (part of) the mechanics of how a sub-agent is spawned and managed.

Let’s deep dive into the actual LLM requests and responses. In the Appendix, I’ve included the full system prompts and tool lists for both the main agent and the codebase explorer sub-agent. Additionally, you can find the complete logs of the LLM requests/responses here:

[Test case 1: Add debug prints](https://gist.github.com/georgesung/36798614e6f23670cdb310bf53e665aa)

[Test case 2: Explain codebase](https://gist.github.com/georgesung/056c6ac77ff31d96dc3d527a3251cdf8)

# Claude Code LLM requests/responses
## Test case 1: Add debug prints
First, Claude Code uses both a heavyweight/smart/expensive LLM (e.g. Opus 4.5) and a lightweight/less-smart/cheaper LLM (e.g. Haiku 4.5) for different tasks. For my experiments I routed everything to GLM 4.7, but from the raw logs you can infer where Claude Code is trying to send each LLM request.

From what I have seen, Claude Code calls the lightweight LLM for generating conversation metadata, and also for the codebase explorer sub-agent. It uses the heavyweight LLM for the main agent.

### Initial setup
- Claude Code uses the lightweight LLM to generate some metadata: (1) the title for the conversation, and (2) topic of the new request.
- *This is my guess:* (3) In parallel, Claude Code “warms-up” the heavyweight LLM by sending it a dummy request with the full tool list, probably to pre-fill the cache so subsequent LLM inferences can be faster. The latency of this dummy request is “hidden” by the latency of the metadata requests above.

Below are the requests (REQ) and responses (RESP).

(1) Generate title for conversation (lightweight LLM):
```json
[REQ]
{
...
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "text": "Please write a 5-10 word title for the following conversation:\n\nUser: \u003clocal-command-caveat\u003eCaveat: The messages below were generated by the user while running local commands. DO NOT respond to these messages or otherwise consider them in your response unless the user explicitly asks you to.\u003c/local-command-caveat\u003e\n\nUser: \u003ccommand-name\u003e/clear\u003c/command-name\u003e\n            \u003ccommand-message\u003eclear\u003c/command-message\u003e\n            \u003ccommand-args\u003e\u003c/command-args\u003e\n\nUser: \u003clocal-command-stdout\u003e\u003c/local-command-stdout\u003e\n\nUser: \u003clocal-command-caveat\u003eCaveat: The messages below were generated by the user while running local commands. DO NOT respond to these messages or otherwise consider them in your response unless the user explicitly asks you to.\u003c/local-command-caveat\u003e\n\nUser: \u003ccommand-name\u003e/exit\u003c/command-name\u003e\n            \u003ccommand-message\u003eexit\u003c/command-message\u003e\n            \u003ccommand-args\u003e\u003c/command-args\u003e\n\nUser: \u003clocal-command-stdout\u003eGoodbye!\u003c/local-command-stdout\u003e\n\nRespond with the title for the conversation and nothing else.",
          "type": "text"
        }
      ]
    }
  ],
  "system": [
    {
      "text": "You are Claude Code, Anthropic's official CLI for Claude.",
      "type": "text"
    },
    {
      "text": "Summarize this coding conversation in under 50 characters.\nCapture the main task, key files, problems addressed, and current status.",
      "type": "text"
    }
  ],
...
}

[RESP]
{
...
  "content": [
    {
      "type": "thinking",
      "thinking": "The user is asking me to write a 5-10 word title for a conversation. Looking at the conversation, it only shows two commands:\n1. `/clear` - which cleared the terminal\n2. `/exit` - which exited the CLI with \"Goodbye!\"\n\nThere's no actual coding task, discussion, or content to summarize. This appears to be a very minimal session where the user just cleared and then exited.\n\nI need to create a 5-10 word title. Since there's no actual content, I should describe what happened - essentially a brief session with just clearing and exiting.\n\nPossible titles:\n- Brief CLI Session with Clear and Exit\n- Minimal Session: Clear and Exit Commands\n- Short Session: Terminal Clear and Exit\n- CLI Session: Clear and Exit Only\n- Empty Session: Clear and Exit Commands\n\nI'll go with \"Brief CLI Session: Clear and Exit\" - it's 6 words and accurately describes what happened."
    },
    {
      "type": "text",
      "text": "Brief CLI Session: Clear and Exit"
    }
  ],
...
}
```

(2) Generate topic of new request, if applicable (lightweight LLM):
```json
[REQ]
{
...
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "text": "I want you to add some debug prints so I can see the parameters going into the LoraConfig when I start training.",
          "type": "text"
        }
      ]
    },
    {
      "role": "assistant",
      "content": [
        {
          "text": "{",
          "type": "text"
        }
      ]
    }
  ],
  "system": [
    {
      "text": "You are Claude Code, Anthropic's official CLI for Claude.",
      "type": "text"
    },
    {
      "text": "Analyze if this message indicates a new conversation topic. If it does, extract a 2-3 word title that captures the new topic. Format your response as a JSON object with two fields: 'isNewTopic' (boolean) and 'title' (string, or null if isNewTopic is false). Only include these fields, no other text. ONLY generate the JSON object, no other text (eg. no markdown).",
      "type": "text"
    }
  ],
...
}

[RESP]
{
...
  "content": [
    {
      "type": "thinking",
      "thinking": "The user is asking me to add debug prints to see parameters going into LoraConfig during training. This is a specific technical task related to debugging and training code. \n\nIs this a new conversation topic? This seems like a continuation of work on training code, specifically related to LoRA (Low-Rank Adaptation) configuration. Without context of previous messages, it's hard to definitively say if this is new or continuing a topic. However, this is a specific debugging request that could be its own focused topic.\n\nGiven the specificity - adding debug prints for LoraConfig parameters - this could reasonably be considered a new focused topic/conversation direction. A 2-3 word title that captures this would be something like \"LoraConfig Debug Prints\" or \"Debug LoraConfig Parameters\".\n\nI'll go with this being a new topic since it's a specific actionable request that represents a focused task."
    },
    {
      "type": "text",
      "text": "{"
    }
  ],
...
}
```

(3) Dummy request to warm-up (cache pre-fill?) the heavyweight LLM:

```json
[REQ]
  "max_tokens": 1,
  "messages": [
    {
      "role": "user",
      "content": "count"
    }
  ],
  "tools": [...]

[RESP]
  "content": [
    {
      "type": "thinking",
      "thinking": "The"
    }
  ],
  "stop_reason": "max_tokens",
  "usage": {
    "input_tokens": 13050,
    "output_tokens": 1
  }
```

In this dummy request, the user message is “count” and max output tokens is set to 1. The LLM response is just “The” (1 token).

### Start main agent
Now the main agent starts processing the user’s prompt, which is:

*“I want you to add some debug prints so I can see the parameters going into the LoraConfig when I start training”*

These LLM requests/responses are to/from the heavyweight LLM.
```json
[REQ]
{
...
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "text": "\u003csystem-reminder\u003e\nAs you answer the user's questions, you can use the following context:\n# claudeMd\nCodebase and user instructions are shown below. Be sure to adhere to these instructions. IMPORTANT: These instructions OVERRIDE any default behavior and you MUST follow them exactly as written.\n\nContents of /path/to/project/llm_qlora/CLAUDE.md (project instructions, checked into the codebase):\n\nThis is just a placeholder! Otherwise put stuff here that's more helpful.\n\n\n      IMPORTANT: this context may or may not be relevant to your tasks. You should not respond to this context unless it is highly relevant to your task.\n\u003c/system-reminder\u003e\n",
          "type": "text"
        },
        {
          "cache_control": {
            "type": "ephemeral"
          },
          "text": "I want you to add some debug prints so I can see the parameters going into the LoraConfig when I start training.",
          "type": "text"
        }
      ]
    }
  ],
  "system": [
    {
      "cache_control": {
        "type": "ephemeral"
      },
      "text": "You are Claude Code, Anthropic's official CLI for Claude.",
      "type": "text"
    },
    {
      "cache_control": {
        "type": "ephemeral"
      },
      "text": <main agent system prompt>
      "type": "text"
    }
  ],
  "stream": true,
  "tools": <main agent tool list>
...
}

[RESP]
{
...
  "content": [
    {
      "type": "thinking",
      "thinking": "The user wants me to add debug prints for the parameters going into LoraConfig when training starts. Let me first explore the codebase to find where LoraConfig is being created and used."
    },
    {
      "type": "tool_use",
      "id": "call_3cs6eu75",
      "name": "Glob",
      "input": {
        "pattern": "**/*.py"
      }
    }
  ],
  "stop_reason": "tool_use",
...
}
```

In the request, you can see my user prompt in the second user message. Also, note the first user message is a “system-reminder” message, which includes the CLAUDE.md contents, among other information:

> <system-reminder>
>
> As you answer the user’s questions, you can use the following context:
>
> \# claudeMd
>
> Codebase and user instructions are shown below. Be sure to adhere to these instructions. IMPORTANT: These instructions OVERRIDE any default behavior and you MUST follow them exactly as written.
>
> Contents of /path/to/project/llm_qlora/CLAUDE.md (project instructions, checked into the codebase):
>
> This is just a placeholder! Otherwise put stuff here that’s more helpful.
>
> IMPORTANT: this context may or may not be relevant to your tasks. You should not respond to this context unless it is highly relevant to your task.
>
> </system-reminder>

In the response, the LLM decides to make a tool call: `Glob **/*.py`. To keep track of things, Claude Code also makes use of a tool call ID, in this case the ID is “call_3cs6eu75”.

Now Claude Code will execute the Glob tool per the LLM’s specification, and give the result back to the LLM in the next LLM request. Let’s see the next request/response cycle:
```json
[REQ]

{
...
  "messages": [
    ...
    {
      "role": "assistant",
      "content": [
        {
          "thinking": "The user wants me to add debug prints for the parameters going into LoraConfig when training starts. Let me first explore the codebase to find where LoraConfig is being created and used.",
          "type": "thinking"
        },
        {
          "cache_control": {
            "type": "ephemeral"
          },
          "id": "call_3cs6eu75",
          "input": {
            "pattern": "**/*.py"
          },
          "name": "Glob",
          "type": "tool_use"
        }
      ]
    },
    {
      "role": "user",
      "content": [
        {
          "cache_control": {
            "type": "ephemeral"
          },
          "content": "/path/to/project/llm_qlora/data_processor/DataProcessor.py\n/path/to/project/llm_qlora/data_processor/OrcaDataProcessor.py\n/path/to/project/llm_qlora/data_processor/RawTextDataProcessor.py\n/path/to/project/llm_qlora/data_processor/VicunaDataProcessor.py\n/path/to/project/llm_qlora/inference.py\n/path/to/project/llm_qlora/train.py\n/path/to/project/llm_qlora/QloraTrainer.py",
          "tool_use_id": "call_3cs6eu75",
          "type": "tool_result"
        }
      ]
    }
  ],
...
}


[RESP]
{
...
  "content": [
    {
      "type": "thinking",
      "thinking": "Let me search for LoraConfig in the codebase to find where it's being instantiated."
    },
    {
      "type": "tool_use",
      "id": "call_g7zm8nbi",
      "name": "Grep",
      "input": {
        "pattern": "LoraConfig",
        "output_mode": "content"
      }
    }
  ],
  "stop_reason": "tool_use",
...
}
```

In the request to the LLM, Claude Code provided the output of the Glob tool in the latest user message. Note that the tool-use ID matches from before: “call_3cs6eu75”.

In response, the LLM decides to make another tool call: Grep for “LoraConfig” in the codebase.

Again, Claude Code provides the result of the Grep tool call, via a new LLM request:
```json
[REQ]
{
...
  "messages": [
    ...
    {
      "role": "assistant",
      "content": [
        {
          "thinking": "Let me search for LoraConfig in the codebase to find where it's being instantiated.",
          "type": "thinking"
        },
        {
          "cache_control": {
            "type": "ephemeral"
          },
          "id": "call_g7zm8nbi",
          "input": {
            "output_mode": "content",
            "pattern": "LoraConfig"
          },
          "name": "Grep",
          "type": "tool_use"
        }
      ]
    },
    {
      "role": "user",
      "content": [
        {
          "cache_control": {
            "type": "ephemeral"
          },
          "content": "QloraTrainer.py:3:from peft import (LoraConfig, PeftModel, get_peft_model,\nQloraTrainer.py:58:            config = LoraConfig(",
          "tool_use_id": "call_g7zm8nbi",
          "type": "tool_result"
        }
      ]
    }
  ],
...
}

[RESP]
{
...
  "content": [
    {
      "type": "thinking",
      "thinking": "Let me read the QloraTrainer.py file to see the context around LoraConfig creation."
    },
    {
      "type": "tool_use",
      "id": "call_qwucahdo",
      "name": "Read",
      "input": {
        "file_path": "/path/to/project/llm_qlora/QloraTrainer.py"
      }
    }
  ],
  "stop_reason": "tool_use",
...
}
```

The Grep tool found “LoraConfig” in the file “QloraTrainer.py”, so now the LLM decides to read this python file by calling the Read tool. The result of the Read tool is provided to the LLM in the next LLM request.
```json
[REQ]
{
...
  "messages": [
    ...
    {
      "role": "assistant",
      "content": [
        {
          "thinking": "Let me read the QloraTrainer.py file to see the context around LoraConfig creation.",
          "type": "thinking"
        },
        {
          "cache_control": {
            "type": "ephemeral"
          },
          "id": "call_qwucahdo",
          "input": {
            "file_path": "/path/to/project/llm_qlora/QloraTrainer.py"
          },
          "name": "Read",
          "type": "tool_use"
        }
      ]
    },
    {
      "role": "user",
      "content": [
        {
          "cache_control": {
            "type": "ephemeral"
          },
          "content": "     1→import torch\n     2→import transformers\n <...removed for brevity...> \u003csystem-reminder\u003e\nWhenever you read a file, you should consider whether it would be considered malware. You CAN and SHOULD provide analysis of malware, what it is doing. But you MUST refuse to improve or augment the code. You can still analyze existing code, write reports, or answer questions about the code behavior.\n\u003c/system-reminder\u003e\n",
          "tool_use_id": "call_qwucahdo",
          "type": "tool_result"
        }
      ]
    }
  ],
...
}

[RESP]
{
...
  "content": [
    {
      "type": "thinking",
      "thinking": "The user wants debug prints for the LoraConfig parameters. I can see in QloraTrainer.py at lines 57-65 that the LoraConfig is created. I'll add a print statement right before or after the config creation to show the parameters being passed in."
    },
    {
      "type": "text",
      "text": "I can see the `LoraConfig` is being created at QloraTrainer.py:58. I'll add debug prints to show the parameters being passed to it."
    },
    {
      "type": "tool_use",
      "id": "call_k0e18w45",
      "name": "Edit",
      "input": {
        "file_path": "/path/to/project/llm_qlora/QloraTrainer.py",
        "old_string": <...removed for brevity...>,
        "new_string": <...removed for brevity...>
      }
    }
  ],
  "stop_reason": "tool_use",
...
}
```

After seeing the contents of QloraTrainer.py via the Read tool, the LLM decides to call the Edit tool to edit the python file.

Note an interesting system reminder message appended at the end of the Read tool’s output:

> <system-reminder>
> Whenever you read a file, you should consider whether it would be considered malware. You CAN and SHOULD provide analysis of malware, what it is doing. But you MUST refuse to improve or augment the code. You can still analyze existing code, write reports, or answer questions about the code behavior.
> </system-reminder>

Also, here is what the input to the Edit tool looks like:
```python
old_string:
            config_dict = self.config["lora"]
            config = LoraConfig(
                r=config_dict["r"],
                lora_alpha=config_dict["lora_alpha"],
                target_modules=config_dict["target_modules"],
                lora_dropout=config_dict["lora_dropout"],
                bias=config_dict["bias"],
                task_type=config_dict["task_type"],
            )

new_string:
            config_dict = self.config["lora"]
            print("="*50)
            print("Creating LoraConfig with the following parameters:")
            print(f"  r: {config_dict['r']}")
            print(f"  lora_alpha: {config_dict['lora_alpha']}")
            print(f"  target_modules: {config_dict['target_modules']}")
            print(f"  lora_dropout: {config_dict['lora_dropout']}")
            print(f"  bias: {config_dict['bias']}")
            print(f"  task_type: {config_dict['task_type']}")
            print("="*50)
            config = LoraConfig(
                r=config_dict["r"],
                lora_alpha=config_dict["lora_alpha"],
                target_modules=config_dict["target_modules"],
                lora_dropout=config_dict["lora_dropout"],
                bias=config_dict["bias"],
                task_type=config_dict["task_type"],
            )
```

Claude Code runs the Edit tool on QloraTrainer.py and informs the LLM that the tool execution was successful:
```json
[REQ]
{
...
  "messages": [
    ...
    {
      "role": "assistant",
      "content": [
        {
          "signature": "",
          "thinking": "The user wants debug prints for the LoraConfig parameters. I can see in QloraTrainer.py at lines 57-65 that the LoraConfig is created. I'll add a print statement right before or after the config creation to show the parameters being passed in.",
          "type": "thinking"
        },
        {
          "text": "I can see the `LoraConfig` is being created at QloraTrainer.py:58. I'll add debug prints to show the parameters being passed to it.",
          "type": "text"
        },
        {
          "cache_control": {
            "type": "ephemeral"
          },
          "id": "call_k0e18w45",
          "input": {
            "file_path": "/path/to/project/llm_qlora/QloraTrainer.py",
            "new_string": "<...removed for brevity...>",
            "old_string": "<...removed for brevity...>",
            "replace_all": false
          },
          "name": "Edit",
          "type": "tool_use"
        }
      ]
    },
    {
      "role": "user",
      "content": [
        {
          "cache_control": {
            "type": "ephemeral"
          },
          "content": "The file /path/to/project/llm_qlora/QloraTrainer.py has been updated successfully.",
          "tool_use_id": "call_k0e18w45",
          "type": "tool_result"
        }
      ]
    }
  ],
...
}

[RESP]
{
...
  "content": [
    {
      "type": "thinking",
      "thinking": "I've added debug prints to show the LoraConfig parameters. Let me provide a summary for the user."
    },
    {
      "type": "text",
      "text": "Done. I added debug prints that will display when creating the `LoraConfig` at QloraTrainer.py:58-70. When you start training, you'll see output like:\n\n```\n==================================================\nCreating LoraConfig with the following parameters:\n  r: \u003cvalue\u003e\n  lora_alpha: \u003cvalue\u003e\n  target_modules: \u003cvalue\u003e\n  lora_dropout: \u003cvalue\u003e\n  bias: \u003cvalue\u003e\n  task_type: \u003cvalue\u003e\n==================================================\n```"
    }
  ],
  "stop_reason": "end_turn",
...
}
```

Success! The agent has satisfied the user’s request to add the debug prints, and informs the user. Note that stop_reason = end_turn, which signals Claude Code to return control to the user.

Finally, Claude Code generates possible suggestions for the user’s next prompt. This is accomplished via the following LLM request/response:
```json
[REQ]
{
...
  "messages": [
    ...
    {
      "role": "assistant",
      "content": [
        {
          "signature": "",
          "thinking": "I've added debug prints to show the LoraConfig parameters. Let me provide a summary for the user.",
          "type": "thinking"
        },
        {
          "cache_control": {
            "type": "ephemeral"
          },
          "text": "Done. I added debug prints that will display when creating the `LoraConfig` at QloraTrainer.py:58-70. When you start training, you'll see output like:\n\n```\n==================================================\nCreating LoraConfig with the following parameters:\n  r: \u003cvalue\u003e\n  lora_alpha: \u003cvalue\u003e\n  target_modules: \u003cvalue\u003e\n  lora_dropout: \u003cvalue\u003e\n  bias: \u003cvalue\u003e\n  task_type: \u003cvalue\u003e\n==================================================\n```",
          "type": "text"
        }
      ]
    },
    {
      "role": "user",
      "content": [
        {
          "cache_control": {
            "type": "ephemeral"
          },
          "text": "[SUGGESTION MODE: Suggest what the user might naturally type next into Claude Code.]\n\nFIRST: Look at the user's recent messages and original request.\n\nYour job is to predict what THEY would type - not what you think they should do.\n\nTHE TEST: Would they think \"I was just about to type that\"?\n\nEXAMPLES:\nUser asked \"fix the bug and run tests\", bug is fixed → \"run the tests\"\nAfter code written → \"try it out\"\nClaude offers options → suggest the one the user would likely pick, based on conversation\nClaude asks to continue → \"yes\" or \"go ahead\"\nTask complete, obvious follow-up → \"commit this\" or \"push it\"\nAfter error or misunderstanding → silence (let them assess/correct)\n\nBe specific: \"run the tests\" beats \"continue\".\n\nNEVER SUGGEST:\n- Evaluative (\"looks good\", \"thanks\")\n- Questions (\"what about...?\")\n- Claude-voice (\"Let me...\", \"I'll...\", \"Here's...\")\n- New ideas they didn't ask about\n- Multiple sentences\n\nStay silent if the next step isn't obvious from what the user said.\n\nFormat: 2-8 words, match the user's style. Or nothing.\n\nReply with ONLY the suggestion, no quotes or explanation.",
          "type": "text"
        }
      ]
    }
  ],
...
}

[RESP]
(bugged out? no response logged on my end)
```

For clarity, the LLM prompt to generate suggestions for the user’s next message is:

> [SUGGESTION MODE: Suggest what the user might naturally type next into Claude Code.]
>
> FIRST: Look at the user’s recent messages and original request.
>
> Your job is to predict what THEY would type — not what you think they should do.
>
> THE TEST: Would they think “I was just about to type that”?
>
> EXAMPLES:
> User asked “fix the bug and run tests”, bug is fixed → “run the tests”
> After code written → “try it out”
> Claude offers options → suggest the one the user would likely pick, based on conversation
> Claude asks to continue → “yes” or “go ahead”
> Task complete, obvious follow-up → “commit this” or “push it”
> After error or misunderstanding → silence (let them assess/correct)
>
> Be specific: “run the tests” beats “continue”.
>
> NEVER SUGGEST:
> - Evaluative (“looks good”, “thanks”)
> - Questions (“what about…?”)
> - Claude-voice (“Let me…”, “I’ll…”, “Here’s…”)
> - New ideas they didn’t ask about
> - Multiple sentences
>
> Stay silent if the next step isn’t obvious from what the user said.
>
> Format: 2–8 words, match the user’s style. Or nothing.
>
> Reply with ONLY the suggestion, no quotes or explanation.

In the case above, there might have been a bug somewhere, as I was unable to find the LLM response with the user prompt suggestions. That’s ok though, because I see it at the end of my next test case. So let’s take a look at my second test case.

## Test case 2: Explain codebase
As mentioned earlier, I wanted a test case where I can see a sub-agent in action — how a sub-agent is spawned/de-spawned, how control is passed between main agent and sub-agent, etc. Fortunately, I was able to see a codebase explorer sub-agent in action for this test case, where I prompted Claude Code with:

*“Tell me about this codebase”*

### Initial setup
The initial setup requests/responses are the same as before:

- Call the lightweight LLM to generate a title for the conversation, and determine the topic of the request (if there is a new topic)
- In parallel, call the heavyweight LLM with a dummy request to “warm it up” via cache pre-fill (that’s my guess)
- For brevity, I will omit the requests/responses here, but you can check the [full printouts](https://gist.github.com/georgesung/056c6ac77ff31d96dc3d527a3251cdf8) from Ollama if you’re interested.

### Start main agent
The main agent is initiated similarly as before:
```json
[REQ]
{
...
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "text": <same initial system-reminder message with CLAUDE.md contents>,
          "type": "text"
        },
        {
          "cache_control": {
            "type": "ephemeral"
          },
          "text": "Tell me about this codebase",
          "type": "text"
        }
      ]
    }
  ],
  "system": <main agent system prompt>,
  ...
  "tools": <main agent tool list>,
...
}

[RESP]
{
...
  "content": [
    {
      "type": "thinking",
      "thinking": "The user wants to know about this codebase. Let me explore it to understand its structure and purpose."
    },
    {
      "type": "tool_use",
      "id": "call_eev71b93",
      "name": "Task",
      "input": {
        "description": "Explore codebase structure",
        "prompt": "Explore this codebase thoroughly to understand its structure, purpose, and main components. Look at:\n1. The overall directory structure\n2. Main configuration files (setup.py, requirements.txt, pyproject.toml, etc.)\n3. Key source files and their purposes\n4. Any documentation (README, etc.)\n5. The technology stack being used\n\nProvide a comprehensive overview of what this codebase is about, its architecture, and key components.",
        "subagent_type": "Explore"
      }
    }
  ],
...
}
```

From the LLM response, we can see a “Task” tool call, which will spawn an “Explore” sub-agent to “Explore codebase structure”, with the following objectives:

> Explore this codebase thoroughly to understand its structure, purpose, and main components. Look at:
> 1. The overall directory structure
> 2. Main configuration files (setup.py, requirements.txt, pyproject.toml, etc.)
> 3. Key source files and their purposes
> 4. Any documentation (README, etc.)
> 5. The technology stack being used
>
> Provide a comprehensive overview of what this codebase is about, its architecture, and key components.

### Start codebase explorer sub-agent
Now Claude Code spawns a sub-agent of the “Explore” type to explore my codebase. We can see the following LLM request/response:
```json
[REQ]
{
...
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "text": <same initial system-reminder message with CLAUDE.md contents>,
          "type": "text"
        },
        {
          "cache_control": {
            "type": "ephemeral"
          },
          "text": "Explore this codebase thoroughly to understand its structure, purpose, and main components. Look at:\n1. The overall directory structure\n2. Main configuration files (setup.py, requirements.txt, pyproject.toml, etc.)\n3. Key source files and their purposes\n4. Any documentation (README, etc.)\n5. The technology stack being used\n\nProvide a comprehensive overview of what this codebase is about, its architecture, and key components.",
          "type": "text"
        }
      ]
    }
  ],
  "system": <Explore sub-agent system prompt>,
  ...
  "tools": <Explore sub-agent tool list>,
...
}

[RESP]
{
...
  "content": [
    {
      "type": "thinking",
      "thinking": "The user wants me to thoroughly explore this codebase to understand its structure, purpose, and main components. Let me start by examining the directory structure and then dive into key files.\n\nI'll need to:\n1. First, look at the overall directory structure\n2. Find configuration files (setup.py, requirements.txt, pyproject.toml, etc.)\n3. Read key source files\n4. Read documentation (README, etc.)\n5. Understand the technology stack\n\nLet me start with parallel searches to understand the structure."
    },
    {
      "type": "text",
      "text": "I'll explore this codebase thoroughly. Let me start by examining the directory structure and key files in parallel."
    },
    {
      "type": "tool_use",
      "id": "call_fg68lx93",
      "name": "Bash",
      "input": {
        "command": "ls -la /path/to/project/llm_qlora",
        "description": "List directory contents"
      }
    },
    {
      "type": "tool_use",
      "id": "call_8t9w7t85",
      "name": "Glob",
      "input": {
        "pattern": "**/*",
        "path": "/path/to/project/llm_qlora"
      }
    },
    {
      "type": "tool_use",
      "id": "call_smf1trca",
      "name": "Glob",
      "input": {
        "pattern": "*.{py,txt,toml,yaml,yml,md,json}",
        "path": "/path/to/project/llm_qlora"
      }
    }
  ],
...
}
```

From the request, we can see:

- The second user message is the “prompt” argument of the “Task” tool call from the main agent, which are the instructions/objectives for the codebase explorer agent
- The system prompt is specific to the “Explore” sub-agent type (see Appendix for full system prompt)
- The tool list is a subset of the main agent’s tool list. Since the “Explore” sub-agent is a read-only agent (should not change any files), it should not have access to tools like “Edit”, “Write”, etc. (see Appendix for full tool list)
- The tool list includes “Bash” and “Skill”, which might allow it to accidentally write something (there are prompts to reduce this likelihood, and likely further guardrails within Claude Code itself)
- From the system prompt, Claude Code intends to use the lightweight LLM (Haiku 4.5) for this sub-agent. However, I routed all LLM calls to GLM 4.7, as mentioned earlier.

From the response, we can see the LLM requests to make three parallel tool calls, to understand the directory structure and key files in this codebase:

- Bash: `ls -la /path/to/project/llm_qlora`
- Glob `**/*`
- Glob `*.{py,txt,toml,yaml,yml,md,json}`

Interesting observation: For the output of the “Bash” tool call (`ls -la` in this case), Claude Code makes an LLM call to “Extract any file paths that this command reads or modifies”, except for commands like “ls”. So in this case, it basically returns null, but I’ll include the request/response here anyway since it was pretty interesting.

```json
[REQ]
{
...
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "text": "Command: ls -la /path/to/project/llm_qlora\nOutput: total 112\ndrwxr-xr-x  13 george  staff    416 Jan 24 20:18 .\ndrwxr-xr-x   5 george  staff    160 Jan 22 19:08 ..\ndrwxr-xr-x  12 george  staff    384 Jan 24 20:23 .git\n-rw-r--r--   1 george  staff     74 Jan 22 19:38 CLAUDE.md\n-rw-r--r--   1 george  staff   1080 Jan 22 19:09 LICENSE\n-rw-r--r--   1 george  staff   6421 Jan 24 20:18 QloraTrainer.py\n-rw-r--r--   1 george  staff   3001 Jan 22 19:09 README.md\ndrwxr-xr-x   7 george  staff    224 Jan 22 19:09 configs\ndrwxr-xr-x   6 george  staff    192 Jan 22 19:09 data_processor\n-rw-r--r--   1 george  staff  22329 Jan 22 19:09 inference.ipynb\n-rw-r--r--   1 george  staff   1894 Jan 22 19:09 inference.py\n-rw-r--r--   1 george  staff    103 Jan 22 19:09 requirements.txt\n-rw-r--r--   1 george  staff    733 Jan 22 19:09 train.py\n\n",
          "type": "text"
        }
      ]
    }
  ],
  "system": [
    {
      "text": "You are Claude Code, Anthropic's official CLI for Claude.",
      "type": "text"
    },
    {
      "text": "Extract any file paths that this command reads or modifies. For commands like \"git diff\" and \"cat\", include the paths of files being shown. Use paths verbatim -- don't add any slashes or try to resolve them. Do not try to infer paths that were not explicitly listed in the command output.\n\nIMPORTANT: Commands that do not display the contents of the files should not return any filepaths. For eg. \"ls\", pwd\", \"find\". Even more complicated commands that don't display the contents should not be considered: eg \"find . -type f -exec ls -la {} + | sort -k5 -nr | head -5\"\n\nFirst, determine if the command displays the contents of the files. If it does, then \u003cis_displaying_contents\u003e tag should be true. If it does not, then \u003cis_displaying_contents\u003e tag should be false.\n\nFormat your response as:\n\u003cis_displaying_contents\u003e\ntrue\n\u003c/is_displaying_contents\u003e\n\n\u003cfilepaths\u003e\npath/to/file1\npath/to/file2\n\u003c/filepaths\u003e\n\nIf no files are read or modified, return empty filepaths tags:\n\u003cfilepaths\u003e\n\u003c/filepaths\u003e\n\nDo not include any other text in your response.",
      "type": "text"
    }
  ],
...
}

[RESP]
{
...
  "content": [
    {
      "type": "thinking",
      "thinking": "The user is asking me to extract file paths from a command that reads or modifies files. Let me analyze this command:\n\nCommand: `ls -la /path/to/project/llm_qlora`\n\nThis is an `ls` command which lists files and directories. It does NOT display the contents of any files. It only shows:\n- file/directory names\n- permissions\n- owner\n- group\n- size\n- modification date\n\nAccording to the instructions:\n\"IMPORTANT: Commands that do not display the contents of the files should not return any filepaths. For eg. \"ls\", pwd\", \"find\".\"\n\nThe instruction explicitly states that `ls` should not return any filepaths because it doesn't display file contents.\n\nSo:\n- \u003cis_displaying_contents\u003e should be false\n- \u003cfilepaths\u003e should be empty"
    },
    {
      "type": "text",
      "text": "\u003cis_displaying_contents\u003e\nfalse\n\u003c/is_displaying_contents\u003e\n\n\u003cfilepaths\u003e\n\u003c/filepaths\u003e"
    }
  ],
...
}
```

The response was just this:
```xml
<is_displaying_contents>
false
</is_displaying_contents>

<filepaths>
</filepaths>
```

Back to the results of those three tool calls — the `ls -la` and two `glob` commands (match the tool call IDs in the assistant/user messages):
```json
[REQ]
{
...
  "messages": [
    ...
    {
      "role": "assistant",
      "content": [
        {
          "signature": "",
          "thinking": "The user wants me to thoroughly explore this codebase to understand its structure, purpose, and main components. Let me start by examining the directory structure and then dive into key files.\n\nI'll need to:\n1. First, look at the overall directory structure\n2. Find configuration files (setup.py, requirements.txt, pyproject.toml, etc.)\n3. Read key source files\n4. Read documentation (README, etc.)\n5. Understand the technology stack\n\nLet me start with parallel searches to understand the structure.",
          "type": "thinking"
        },
        {
          "text": "I'll explore this codebase thoroughly. Let me start by examining the directory structure and key files in parallel.",
          "type": "text"
        },
        {
          "id": "call_fg68lx93",
          "input": {
            "command": "ls -la /path/to/project/llm_qlora",
            "description": "List directory contents"
          },
          "name": "Bash",
          "type": "tool_use"
        },
        {
          "id": "call_8t9w7t85",
          "input": {
            "path": "/path/to/project/llm_qlora",
            "pattern": "**/*"
          },
          "name": "Glob",
          "type": "tool_use"
        },
        {
          "cache_control": {
            "type": "ephemeral"
          },
          "id": "call_smf1trca",
          "input": {
            "path": "/path/to/project/llm_qlora",
            "pattern": "*.{py,txt,toml,yaml,yml,md,json}"
          },
          "name": "Glob",
          "type": "tool_use"
        }
      ]
    },
    {
      "role": "user",
      "content": [
        {
          "content": "/path/to/project/llm_qlora/README.md\n/path/to/project/llm_qlora/configs/llama2_7b_chat_uncensored.yaml\n<...removed for brevity...>",
          "tool_use_id": "call_smf1trca",
          "type": "tool_result"
        },
        {
          "content": "/path/to/project/llm_qlora/.git/info/exclude\n/path/to/project/llm_qlora/.git/description\n<...removed for brevity...>",
          "tool_use_id": "call_8t9w7t85",
          "type": "tool_result"
        },
        {
          "cache_control": {
            "type": "ephemeral"
          },
          "content": "total 112\ndrwxr-xr-x  13 george  staff    416 Jan 24 20:18 .\ndrwxr-xr-x   5 george  staff    160 Jan 22 19:08 ..\ndrwxr-xr-x  12 george  staff    384 Jan 24 20:23 .git\n<...removed for brevity...>\u003csystem-reminder\u003e\nCRITICAL: This is a READ-ONLY task. You CANNOT edit, write, or create files.\n\u003c/system-reminder\u003e",
          "is_error": false,
          "tool_use_id": "call_fg68lx93",
          "type": "tool_result"
        }
      ]
    }
  ],
...
}

[RESP]
{
...
  "content": [
    {
      "type": "thinking",
      "thinking": "Now I have a good view of the directory structure. Let me read the key files to understand the codebase better:\n1. README.md - for documentation\n2. requirements.txt - for dependencies\n3. train.py - main training script\n4. inference.py - inference script\n5. QloraTrainer.py - core trainer class\n6. DataProcessor.py - base data processor\n7. Config files to understand the model configurations\n\nLet me read these files in parallel."
    },
    {
      "type": "text",
      "text": "Now let me read the key files to understand the codebase structure, purpose, and components."
    },
    {
      "type": "tool_use",
      "id": "call_kup1duad",
      "name": "Read",
      "input": {
        "file_path": "/path/to/project/llm_qlora/README.md"
      }
    },
    {
      "type": "tool_use",
      "id": "call_etbl20kz",
      "name": "Read",
      "input": {
        "file_path": "/path/to/project/llm_qlora/requirements.txt"
      }
    },
    {
      "type": "tool_use",
      "id": "call_ku6slgzz",
      "name": "Read",
      "input": {
        "file_path": "/path/to/project/llm_qlora/train.py"
      }
    },
    {
      "type": "tool_use",
      "id": "call_gzdahuix",
      "name": "Read",
      "input": {
        "file_path": "/path/to/project/llm_qlora/inference.py"
      }
    },
    {
      "type": "tool_use",
      "id": "call_68juv36a",
      "name": "Read",
      "input": {
        "file_path": "/path/to/project/llm_qlora/QloraTrainer.py"
      }
    }
  ],
  "stop_reason": "tool_use",
...
}
```

After getting an idea of the directory structure, the agent will now read the contents of relevant files. For brevity, I won’t paste the printout snippets here, but the codebase explorer agent goes through a couple more iterations of reading various files in the codebase. For those curious, please refer to the [full LLM request/response printout from Ollama](https://gist.github.com/georgesung/056c6ac77ff31d96dc3d527a3251cdf8).

After reading multiple files in the codebase, the codebase explorer agent has come to its conclusion. The sub-agent’s final output is a markdown report titled “Comprehensive Codebase Overview”:
```json
[RESP]
{
...
  "content": [
    {
      "type": "thinking",
      "thinking": "I now have a comprehensive understanding of this codebase. Let me provide a thorough overview for the user."
    },
    {
      "type": "text",
      "text": "## Comprehensive Codebase Overview\n\n<...removed for brevity...>"
    }
  ],
  "stop_reason": "end_turn",
...
}
```

Note the stop_reason is end_turn, which signifies that the sub-agent has completed its task, and control returns to the main/parent agent.

### Control returns to main agent
The main agent receives the result of the sub-agent via a user message in the LLM request. It also receives the agent ID of the sub-agent “for resuming to continue this agent’s work if needed”, which is pretty cool.
```json
[REQ]
{
...
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "text": <system-reminder message>,
          "type": "text"
        },
        {
          "text": "Tell me about this codebase",
          "type": "text"
        }
      ]
    },
    {
      "role": "assistant",
      "content": [
        {
          "thinking": "The user wants to know about this codebase. Let me explore it to understand its structure and purpose.",
          "type": "thinking"
        },
        {
          "cache_control": {
            "type": "ephemeral"
          },
          "id": "call_eev71b93",
          "input": {
            "description": "Explore codebase structure",
            "prompt": <...removed for brevity...>,
            "subagent_type": "Explore"
          },
          "name": "Task",
          "type": "tool_use"
        }
      ]
    },
    {
      "role": "user",
      "content": [
        {
          "cache_control": {
            "type": "ephemeral"
          },
          "content": [
            {
              "text": "## Comprehensive Codebase Overview\n\n<...removed for brevity...>",
              "type": "text"
            },
            {
              "text": "agentId: a09479d (for resuming to continue this agent's work if needed)",
              "type": "text"
            }
          ],
          "tool_use_id": "call_eev71b93",
          "type": "tool_result"
        }
      ]
    }
  ],
  "system": <main agent system prompt>,
  ...
  "tools": <main agent tool list>,
...
}

[RESP]
{
...
  "content": [
    {
      "type": "thinking",
      "thinking": "The agent provided a comprehensive overview of the codebase. Let me summarize this information for the user in a clear, concise way."
    },
    {
      "type": "text",
      "text": "## Codebase Overview\n\nThis is a **QLoRA (Quantized Low-Rank Adaptation)** fine-tuning framework for Large Language Models. <...removed for brevity...>"
    }
  ],
  "stop_reason": "end_turn",
...
}
```

From the response, stop_reason = end_turn, so the main agent’s work is done! The user’s request is fulfilled. The final response text gets shown to the user at the end.

![done](/assets/img/tracing-cc-3.jpg)

As before, Claude Code will try to generate suggestions for the user’s next prompt via the same request as in the previous example:
```json
[REQ]
{
...
  "messages": [
...
    {
      "role": "user",
      "content": [
        {
          "cache_control": {
            "type": "ephemeral"
          },
          "text": "[SUGGESTION MODE: Suggest what the user might naturally type next into Claude Code.]<rest of user message suggestion prompt>",
          "type": "text"
        }
      ]
    }
  ],

[RESP]
{
...
  "content": [
    {
      "type": "thinking",
      "thinking": "The user just asked for an overview of the codebase, and I provided a comprehensive summary. Looking at the conversation:\n\n1. User asked \"Tell me about this codebase\"\n2. I explored and provided a detailed overview\n\nThis was an informational request that has been completed. The user now understands what the codebase is. What would they naturally type next?\n\nThere's no obvious next step here. The user might:\n- Ask a follow-up question about how to use it\n- Ask to modify something\n- Ask to run something\n- Just read the summary and decide what they want to do\n\nSince the user's intent is unclear and there's no obvious continuation from just getting information, I should stay silent. This isn't a task completion situation where \"commit this\" or \"run it\" would make sense - the user was just gathering information."
    },
    {
      "type": "text",
      "text": "(no suggestion - informational request complete, user's intent unclear)"
    }
  ],
  "stop_reason": "end_turn",
...
}
```

# Final thoughts
I hope this gave you some insight into the mechanics of how Claude Code works.

As I could only observe the LLM requests and responses, this only paints a partial picture of what is going on. Furthermore, the test cases I ran were very simple, and I am curious about how Claude Code would work for more complex scenarios. I’m looking forward to learning more!

# Appendix
Since this blog post is already way too long, I will refer you to the Appendix I wrote on Substack [here](https://georgesung.substack.com/i/185830843/appendix). The Appendix includes:
- System prompt - Main agent
- System prompt - Codebase explorer sub-agent
- Tool list - Main agent
- Tool list - Codebase explorer sub-agent

Thanks for reading!
