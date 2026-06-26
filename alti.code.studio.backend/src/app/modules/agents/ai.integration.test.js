import { describe, it, expect } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseYaml } from './yaml_agent_loader.js';
import { agenticRouter } from './agentic_router.service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFINITIONS_DIR = path.join(__dirname, 'definitions');
const AI_DIR = path.join(DEFINITIONS_DIR, 'ai');

describe('Modular AI Engineering & LLMOps Declarative Agents & Swarm Router Integration', () => {
  describe('Recursive Declarative YAML Parsing & Ingestion', () => {
    it('should successfully parse and load LLM Prompt Optimization & Few-Shot Specialist', async () => {
      const agentPath = path.join(AI_DIR, 'ai.prompt_engineer.agent.yaml');
      const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

      expect(def.id).toBe('agent.ai.prompt_engineer');
      expect(def.name).toBe('LLM Prompt Optimization & Few-Shot Specialist');
      expect(def.capabilities).toContain('prompt_template_design');
      expect(def.capabilities).toContain('chain_of_thought_cot');
    });

    it('should successfully parse and load Retrieval-Augmented Generation (RAG) & Chunking Specialist', async () => {
      const agentPath = path.join(AI_DIR, 'ai.rag_optimizer.agent.yaml');
      const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

      expect(def.id).toBe('agent.ai.rag_optimizer');
      expect(def.name).toBe(
        'Retrieval-Augmented Generation (RAG) & Chunking Specialist',
      );
      expect(def.capabilities).toContain('semantic_chunking_strategies');
      expect(def.capabilities).toContain('hybrid_vector_lexical_search');
    });

    it('should successfully parse and load Vector Database & Indexing Specialist', async () => {
      const agentPath = path.join(AI_DIR, 'ai.vector_tuner.agent.yaml');
      const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

      expect(def.id).toBe('agent.ai.vector_tuner');
      expect(def.name).toBe('Vector Database & Indexing Specialist');
      expect(def.capabilities).toContain('hnsw_index_tuning');
      expect(def.capabilities).toContain('product_quantization_compress');
    });

    it('should successfully parse and load LLM Fine-Tuning & PEFT Specialist', async () => {
      const agentPath = path.join(AI_DIR, 'ai.fine_tuning.agent.yaml');
      const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

      expect(def.id).toBe('agent.ai.fine_tuning');
      expect(def.name).toBe('LLM Fine-Tuning & PEFT Specialist');
      expect(def.capabilities).toContain('lora_peft_tuning');
      expect(def.capabilities).toContain('instruction_dataset_curation');
    });

    it('should successfully parse and load Multi-Agent Frameworks & Orchestrator Specialist', async () => {
      const agentPath = path.join(AI_DIR, 'ai.agent_orchestrator.agent.yaml');
      const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

      expect(def.id).toBe('agent.ai.agent_orchestrator');
      expect(def.name).toBe('Multi-Agent Frameworks & Orchestrator Specialist');
      expect(def.capabilities).toContain('multi_agent_graphs');
      expect(def.capabilities).toContain('loop_state_monitoring');
    });

    it('should successfully parse and load AI Safety & Guardrails Officer', async () => {
      const agentPath = path.join(AI_DIR, 'ai.guardrails.agent.yaml');
      const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

      expect(def.id).toBe('agent.ai.guardrails');
      expect(def.name).toBe('AI Safety & Guardrails Officer');
      expect(def.capabilities).toContain('jailbreak_detection_gates');
      expect(def.capabilities).toContain('hallucination_prevention_shields');
    });

    it('should successfully parse and load LLM Evaluation & Benchmarking Auditor', async () => {
      const agentPath = path.join(AI_DIR, 'ai.llm_evaluator.agent.yaml');
      const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

      expect(def.id).toBe('agent.ai.llm_evaluator');
      expect(def.name).toBe('LLM Evaluation & Benchmarking Auditor');
      expect(def.capabilities).toContain('automated_benchmarking_harness');
      expect(def.capabilities).toContain('ragas_metric_alignment');
    });

    it('should successfully parse and load Model Inference Serving & Quantization Optimizer', async () => {
      const agentPath = path.join(AI_DIR, 'ai.model_serving.agent.yaml');
      const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

      expect(def.id).toBe('agent.ai.model_serving');
      expect(def.name).toBe('Model Inference Serving & Quantization Optimizer');
      expect(def.capabilities).toContain('inference_engine_tuning');
      expect(def.capabilities).toContain('model_quantization_formats');
    });

    it('should successfully parse and load Semantic Prompt Caching Specialist', async () => {
      const agentPath = path.join(AI_DIR, 'ai.semantic_cache.agent.yaml');
      const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

      expect(def.id).toBe('agent.ai.semantic_cache');
      expect(def.name).toBe('Semantic Prompt Caching Specialist');
      expect(def.capabilities).toContain('semantic_caching_thresholds');
      expect(def.capabilities).toContain('similarity_cutoff_rules');
    });

    it('should successfully parse and load Synthetic Dataset Generator & Data Augmenter', async () => {
      const agentPath = path.join(AI_DIR, 'ai.synthetic_data.agent.yaml');
      const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

      expect(def.id).toBe('agent.ai.synthetic_data');
      expect(def.name).toBe('Synthetic Dataset Generator & Data Augmenter');
      expect(def.capabilities).toContain('synthetic_data_pipelines');
      expect(def.capabilities).toContain('data_diversity_scoring');
    });
  });

  describe('Precision Swarm Routing for All 10 AI Engineering & LLMOps Agents', () => {
    it('should route prompt engineering keywords to the prompt engineer agent', async () => {
      const output =
        'Perform high-level prompt_template_design and chain_of_thought_cot for few-shot systems';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe(
        'Advanced AI Swarm: Prompt Optimization & Few-Shot',
      );
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain(
        'LLM Prompt Optimization & Few-Shot Specialist',
      );
    });

    it('should route RAG keywords to the RAG optimizer agent', async () => {
      const output =
        'Establish semantic_chunking_strategies and hybrid_vector_lexical_search over documentation corpus';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('Advanced AI Swarm: RAG & Chunking Optimization');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain(
        'Retrieval-Augmented Generation (RAG) & Chunking Specialist',
      );
    });

    it('should route vector index keywords to the vector database tuner agent', async () => {
      const output =
        'Apply hnsw_index_tuning and product_quantization_compress to compress the embeddings';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('Advanced AI Swarm: Vector Database & Indexing');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain('Vector Database & Indexing Specialist');
    });

    it('should route fine-tuning keywords to the LLM fine-tuning agent', async () => {
      const output =
        'Launch lora_peft_tuning and format an instruction_dataset_curation JSONL bundle';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('Advanced AI Swarm: LLM Fine-Tuning & PEFT');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain('LLM Fine-Tuning & PEFT Specialist');
    });

    it('should route multi-agent graphs keywords to the agent orchestrator agent', async () => {
      const output =
        'Design crewAI multi_agent_graphs and run a loop_state_monitoring cycle';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('Advanced AI Swarm: Multi-Agent Frameworks');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain(
        'Multi-Agent Frameworks & Orchestrator Specialist',
      );
    });

    it('should route guardrails keywords to the AI safety and guardrails officer', async () => {
      const output =
        'Install jailbreak_detection_gates and hallucination_prevention_shields in the gateway';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('Advanced AI Swarm: Safety & Guardrails');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain('AI Safety & Guardrails Officer');
    });

    it('should route evaluation keywords to the LLM evaluation agent', async () => {
      const output =
        'Configure automated_benchmarking_harness and verify ragas_metric_alignment values';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('Advanced AI Swarm: Evaluation & Benchmarking');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain('LLM Evaluation & Benchmarking Auditor');
    });

    it('should route serving optimization keywords to the model serving agent', async () => {
      const output =
        'Perform inference_engine_tuning and optimize model_quantization_formats configurations';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('Advanced AI Swarm: Serving & Quantization');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain(
        'Model Inference Serving & Quantization Optimizer',
      );
    });

    it('should route semantic cache keywords to the semantic prompt caching agent', async () => {
      const output =
        'Initialize semantic_caching_thresholds and define similarity_cutoff_rules on Redis';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('Advanced AI Swarm: Semantic Prompt Caching');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain('Semantic Prompt Caching Specialist');
    });

    it('should route synthetic data keywords to the synthetic data agent', async () => {
      const output =
        'Create synthetic_data_pipelines and compute data_diversity_scoring indices';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('Advanced AI Swarm: Synthetic Data & Augmentation');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain(
        'Synthetic Dataset Generator & Data Augmenter',
      );
    });
  });
});
