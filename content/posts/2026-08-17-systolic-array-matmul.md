---
layout: post
title: "Matrix multiplication on systolic arrays, and why it's important for LLMs"
date: 2026-08-17
categories: AI-hardware
---

# TLDR

I discuss why matmuls are important for LLMs and where they occur. I also show how systolic arrays work for computing matmuls, via an interactive simulator built in Rust and wrapped in a web app. The systolic array simulator is live and deployed at:

[https://systolic-array-simulator.georgesung.com/](https://systolic-array-simulator.georgesung.com/)

# Intro

The vast majority of floating point operations (FLOPs) in LLM inference and training are matrix-matrix multiplications ("matmuls"). In the paper [Data Movement is All You Need](https://arxiv.org/abs/2007.00072), the authors show that matmuls make up 99.80% of all FLOPs (floating point operations) in training a transformer layer -- the fundamental building block of LLMs.

<img src="/assets/img/systolic-array-matmul/dmiayn-table-1.png" alt="table 1" style="width: 40%;" />

*Table 1 of [Data Movement is All You Need](https://arxiv.org/abs/2007.00072). [Tensor contraction](https://jacobkahn.me/writing/post/ml_systems_tensors/#contractions) refers to matrix-matrix multiplication (general tensor contractions can be expressed as General Matrix Multiply / GEMM operations, which are highly optimized for the target hardware), and the study was done in the context of training a [BERT](https://huggingface.co/docs/transformers/model_doc/bert) model.*

Matmuls make up the vast majority of the FLOPs in LLM training and inference, so it's important to optimize matrix multiplication operations. And systolic arrays happen to be very good at doing matmuls in silicon!

In fact, you see that although matmuls represent 99.80% of BERT training FLOPs, it's "only" 61.0% of runtime, so to some extent those matmuls have already been optimized, in part by running them on systolic arrays (*the study above used [NVIDIA V100 GPUs](https://en.wikipedia.org/wiki/Volta_(microarchitecture)), which includes NVIDIA's Tensor Cores, which are generally speculated to use systolic arrays for matmuls*).

# Show me the matmuls 👀

If "LLMs are a bunch of matmuls", then where exactly do those matmuls appear? Here are some examples.

## Q, K, V projections
If you only look at one token, the Q/K/V projections are actually vector-matrix multiplies, not matrix-matrix multiplies. The vector is the hidden state vector `x`, and the matrix is the Q/K/V weight matrix `W_Q`/`W_K`/`W_V`.

However, memory access takes a very long time, in terms of number of compute cycles, and generally we want to make sure we do lots of computing for every byte of data we read from memory -- i.e. we want high [arithmetic intensity](https://jax-ml.github.io/scaling-book/roofline/). Otherwise, our compute units would be sitting around doing nothing most of the time.

So, if we take all this time loading the `W_Q` weight matrix from memory into the registers of the compute unit (e.g. systolic array), and it just does *one* vector-matrix multiply, it's quite a waste. What if we can get a bunch of different input `x` vectors concatenated together, and multiply that group of vectors with the same `W_Q` matrix? One vector at a time, in a pipelined fashion. That should improve our arithmetic intensity, because we enable data re-use with our `W_Q` matrix. And if our memory access patterns are done well ([spatial locality](https://en.wikipedia.org/wiki/Locality_of_reference)!), we can take advantage of [memory burst reads](https://en.wikipedia.org/wiki/Burst_mode_(computing)) to get all those input `x` vectors next to our compute in an efficient manner. And if we concatenate all those `x` vectors together... it becomes a matrix! Let's call that matrix `X` (capital X).

So where do we get all those `x` vectors? Looking at the Q projections for LLM inference, during the *[prefill](https://redis.io/blog/prefill-vs-decode/)* phase, we want to compute the `q` vector for all tokens in the sequence, so we can concatenate all those input `x` vectors across the sequence, and have an input matrix `X` of size `[sequence_length, hidden_dim]`. Further, if we have a batch size greater than 1, our input matrix `X` can have dimensions `[batch_size * sequence_length, hidden_dim]`, allowing even more data re-use and improving our arithmetic intensity, i.e keeping the systolic array very busy.

*Side note:* This is one of the reasons why LLM inference prefill tends to be *[compute bound](https://jax-ml.github.io/scaling-book/roofline/)*. In the memory bound decode phase, we only need to do the Q, K, V projection for one token -- the latest/current token -- so `sequence_length = 1`. Thus we spend all this time loading the Q, K, V matrix weights from memory into our compute units, just to perform a vector-matrix multiply. With [continuous batching](https://www.anyscale.com/blog/continuous-batching-llm-inference), we can get a batch of input vectors such that we can build an input matrix `X` of size `[batch_size, hidden_dim]`, so we can make a judgement call here: If `batch_size > threshold`, then push the Q, K, V projection computation to systolic arrays. Else, the Q, K, V projections can be run on standard SIMT CUDA cores / "[Vector Processing Units](https://jax-ml.github.io/scaling-book/tpus/)" / CPU SIMD vector compute.

## Attention computation: Q * K_T, score * V

Once we have our Q/K/V matrices, we perform two matmuls for self-attention:

1. The attention scores: Q * K_T (K_T refers to the K matrix [transposed](https://en.wikipedia.org/wiki/Transpose#Transpose_of_a_matrix))
2. The attention output: After the attention scores are normalized and softmaxed (typically *not* using a systolic array), we multiply that matrix by V

For more details, see [this blog post from NVIDIA](https://developer.nvidia.com/blog/co-designing-ai-model-attention-for-fast-interactive-long-context-inference/#how_does_the_flashattention_kernel_compute_attention_on_gpu%C2%A0).

## Linear layers / FFN (Feed Forward Network)

The transformer's linear/dense layers can also be expressed as matmuls, thus mapped to systolic arrays. If we look at a single linear layer, the input is a vector, and that input vector is multiplied by a weight matrix ([optionally adding a bias](https://sebastianraschka.com/faq/docs/bias-terms-modern-llms.html), though the bias vector can be "included" in the weight matrix as well so everything is just one matmul), and the output is a vector. We can concatenate these input vectors together into a matrix, e.g. across the sequence and batch dimensions to get an input matrix of size `[batch_size * sequence_length, input_dim]`. Then multiply this input matrix with the weight matrix, and *ta-da*, a matmul.

## Which matmuls take up the most FLOPs?

It depends on the sequence length! The attention matmuls scale quadratically with sequence length, whereas the FFN matmuls scale linearly with sequence length, even though the weight matrices for the FFNs are significantly larger than those of attention.

For example, looking at the breakdown of prefill time on DeepSeek R1 from [this blog post](https://developer.nvidia.com/blog/co-designing-ai-model-attention-for-fast-interactive-long-context-inference):

<img src="https://developer-blogs.nvidia.com/wp-content/uploads/2026/07/attention-prefill-time-ai-model.webp" alt="figure 1" style="width: 80%;" />

*Figure 1. DeepSeek-R1 prefill time breakdown at 4K, 32K, and 128K context lengths, where the attention share rises from 18% to 85%*

At shorter sequence lengths, the FFNs dominate the computation time. At longer sequence lengths, the attention matmuls dominate. With modern agentic workflows, we easily exceed 128k tokens context length, so optimizing attention computation is very important (e.g. DeepSeek has some very cool optimizations for sparse attention).

# Systolic arrays for matmuls

Matmuls are a huge part of LLM computations, so how do we compute them efficiently in hardware (silicon)? Enter [systolic arrays](https://en.wikipedia.org/wiki/Systolic_array).

To illustrate how systolic arrays work, first let's refresh our memory from grade school regarding what a basic [matrix-matrix multiply (matmul)](https://en.wikipedia.org/wiki/Matrix_multiplication) is. Let's say we have matrix A of size M x K, and matrix B of size K x N, and we want to do A * B. The result is matrix C of size M x N:
```
[
  dot(A_row1, B_col1),  dot(A_row1, B_col2),  ...,  dot(A_row1, B_colN)
  dot(A_row2, B_col1),  dot(A_row2, B_col2),  ...,  dot(A_row2, B_colN)
  ...
  dot(A_rowM, B_col1),  dot(A_rowM, B_col2),  ...,  dot(A_rowM, B_colN)
]
```

And these dot products (denoted above by `dot()`) take two vectors of size K and do this:
```
A_rowI[1] * B_colJ[1] + A_rowI[2] * B_colJ[2] + ... + A_rowI[K] * B_colJ[K]
```
In the example above, every row of matrix A and every column of matrix B is a K-dimensional vector (recall matrix A's size is M x K, matrix B is K x N).

As you can see, a matmul is a bunch of dot products, and a dot product is a bunch of [multiply and accumulate (MAC)](https://en.wikipedia.org/wiki/Multiply%E2%80%93accumulate_operation) operations.

## Weight-stationary systolic arrays

For our examples to follow, we will assume a *weight-stationary* systolic array. For simplicity let's assume the weights of the LLM will be loaded into the systolic array's "Processing Elements" *a priori* (i.e. beforehand).

## Interactive systolic array simulator

To understand how systolic arrays work, I wrote an interactive cycle-accurate systolic array simulator (ok, I told AI to write it for me, and I made sure it works). It is written in Rust, compiled to WebAssembly, and wrapped in a Next.js web app.

**Try it here:** [https://systolic-array-simulator.georgesung.com/](https://systolic-array-simulator.georgesung.com/)

The code of both the Rust systolic array simulator and the web app around it are available here: [https://github.com/georgesung/systolic-array-simulator](https://github.com/georgesung/systolic-array-simulator)

Here is what you can explore inside the simulator:

### 1. The Processing Element (PE)
https://systolic-array-simulator.georgesung.com/#pe

<img src="/assets/img/systolic-array-matmul/pe-animation.gif" alt="pe" style="width: 80%;" />

The basic building block of a systolic array. It's basically a multiply-and-accumulate / MAC unit, with a register to store the weight, a register to store the output, and a pass-through register for the input. In the simulator, you can load a stationary weight into the PE, input values cycle-by-cycle, and watch the registers capture the results.

### 2. Pipelined Dot Product (1D Array)
https://systolic-array-simulator.georgesung.com/#dot-product

<img src="/assets/img/systolic-array-matmul/dot-product-animation.gif" alt="dot-product" style="width: 80%;" />

A 1D vertical array of PEs computing a vector dot product. This illustrates why the input vectors must be staggered (delayed by one cycle per element) so the individual input values meet the accumulating sums at the right cycle. It also shows how we can pipeline multiple vector dot products, given a weight stationary setup.

### 3. Systolic Matrix Multiply (2D Array)
https://systolic-array-simulator.georgesung.com/#matmul

<img src="/assets/img/systolic-array-matmul/matmul-animation.gif" alt="matmul" style="width: 80%;" />

A weight-stationary 2D grid multiplying two matrices. See how the input matrix streams in from the left and staggers in time. Also observe how the final result matrix gets computed, coming from the bottom of the array.

<img src="/assets/img/systolic-array-matmul/batched-matmul-animation.gif" alt="matmul" style="width: 80%;" />

Same as above, but this time we see a batched matmul in action. Notice that the PE utilization is maintained at 100% for much longer.
