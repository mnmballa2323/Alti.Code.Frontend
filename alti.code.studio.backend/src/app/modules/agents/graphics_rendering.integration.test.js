import { describe, it, expect } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseYaml } from './yaml_agent_loader.js';
import { agenticRouter } from './agentic_router.service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFINITIONS_DIR = path.join(__dirname, 'definitions');
const GRAPHICS_DIR = path.join(DEFINITIONS_DIR, 'graphics');

describe('Modular Graphics, 3D Rendering & Game Engines Swarm Router Integration', () => {
    describe('Recursive Declarative YAML Parsing & Ingestion', () => {
        it('should successfully parse and load WebGPU & WebGL Rendering Pipeline Engineer', async () => {
            const agentPath = path.join(GRAPHICS_DIR, 'graphics.webgpu.agent.yaml');
            const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

            expect(def.id).toBe('agent.graphics.webgpu');
            expect(def.name).toBe('WebGPU & WebGL Rendering Pipeline Engineer');
            expect(def.capabilities).toContain('webgpu_gpu_render_passes');
            expect(def.capabilities).toContain('wgsl_glsl_shader_compile');
        });

        it('should successfully parse and load Ray Tracing & Global Illumination Specialist', async () => {
            const agentPath = path.join(GRAPHICS_DIR, 'graphics.raytracing.agent.yaml');
            const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

            expect(def.id).toBe('agent.graphics.raytracing');
            expect(def.name).toBe('Ray Tracing & Global Illumination Specialist');
            expect(def.capabilities).toContain('bounding_volume_hierarchies_bvh');
            expect(def.capabilities).toContain('ray_box_intersection_algorithms');
        });

        it('should successfully parse and load Creative Shader & Visual Effects Artist', async () => {
            const agentPath = path.join(GRAPHICS_DIR, 'graphics.shader.agent.yaml');
            const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

            expect(def.id).toBe('agent.graphics.shader');
            expect(def.name).toBe('Creative Shader & Visual Effects Artist');
            expect(def.capabilities).toContain('fragment_vertex_shader_effects');
            expect(def.capabilities).toContain('simplex_perlin_noise_functions');
        });

        it('should successfully parse and load Game Physics Engine & Rigid Body Dynamics Specialist', async () => {
            const agentPath = path.join(GRAPHICS_DIR, 'graphics.physics.agent.yaml');
            const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

            expect(def.id).toBe('agent.graphics.physics');
            expect(def.name).toBe('Game Physics Engine & Rigid Body Dynamics Specialist');
            expect(def.capabilities).toContain('collision_detection_gjk_aabb');
            expect(def.capabilities).toContain('rigid_body_impulse_solvers');
        });

        it('should successfully parse and load Scene Graph & Entity Component System (ECS) Architect', async () => {
            const agentPath = path.join(GRAPHICS_DIR, 'graphics.scene_graph.agent.yaml');
            const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

            expect(def.id).toBe('agent.graphics.scene_graph');
            expect(def.name).toBe('Scene Graph & Entity Component System (ECS) Architect');
            expect(def.capabilities).toContain('quadtree_octree_spatial_partitioning');
            expect(def.capabilities).toContain('scene_graph_frustum_culling');
        });

        it('should successfully parse and load Video & Image Compression Codec Specialist', async () => {
            const agentPath = path.join(GRAPHICS_DIR, 'graphics.video_codec.agent.yaml');
            const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

            expect(def.id).toBe('agent.graphics.video_codec');
            expect(def.name).toBe('Video & Image Compression Codec Specialist');
            expect(def.capabilities).toContain('h264_hevc_av1_quantization');
            expect(def.capabilities).toContain('motion_vector_estimation_encoding');
        });

        it('should successfully parse and load Spatial Audio & Interactive Acoustics Engineer', async () => {
            const agentPath = path.join(GRAPHICS_DIR, 'graphics.spatial_audio.agent.yaml');
            const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

            expect(def.id).toBe('agent.graphics.spatial_audio');
            expect(def.name).toBe('Spatial Audio & Interactive Acoustics Engineer');
            expect(def.capabilities).toContain('web_audio_api_node_connections');
            expect(def.capabilities).toContain('hrtf_spatial_panning_filters');
        });

        it('should successfully parse and load AR/VR XR Runtime & Spatial Computing Specialist', async () => {
            const agentPath = path.join(GRAPHICS_DIR, 'graphics.ar_vr.agent.yaml');
            const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

            expect(def.id).toBe('agent.graphics.ar_vr');
            expect(def.name).toBe('AR/VR XR Runtime & Spatial Computing Specialist');
            expect(def.capabilities).toContain('webxr_device_pose_estimation');
            expect(def.capabilities).toContain('foveated_rendering_eye_tracking');
        });

        it('should successfully parse and load CAD Engine & Vector Graphics Specialist', async () => {
            const agentPath = path.join(GRAPHICS_DIR, 'graphics.cad_vector.agent.yaml');
            const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

            expect(def.id).toBe('agent.graphics.cad_vector');
            expect(def.name).toBe('CAD Engine & Vector Graphics Specialist');
            expect(def.capabilities).toContain('bezier_bspline_subdivision_curves');
            expect(def.capabilities).toContain('svg_path_rendering_pipelines');
        });

        it('should successfully parse and load Texture Mapping & Materials Shader Specialist', async () => {
            const agentPath = path.join(GRAPHICS_DIR, 'graphics.texture.agent.yaml');
            const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

            expect(def.id).toBe('agent.graphics.texture');
            expect(def.name).toBe('Texture Mapping & Materials Shader Specialist');
            expect(def.capabilities).toContain('pbr_material_reflectance_rendering');
            expect(def.capabilities).toContain('displacement_normal_bump_mapping');
        });
    });

    describe('Precision Swarm Routing for All 10 Graphics & Rendering Agents', () => {
        it('should route WebGPU keywords to WebGPU & WebGL Rendering Pipeline Engineer agent', async () => {
            const output = 'Perform webgpu_gpu_render_passes commands and trigger wgsl_glsl_shader_compile tasks';
            const { strategy, sequence } = await agenticRouter.routeDownstreamSwarm(output);

            expect(strategy).toBe('Graphics Swarm: WebGPU & GPU Pipelines');
            const agentIds = sequence.map(s => s.agentId);
            expect(agentIds).toContain('WebGPU & WebGL Rendering Pipeline Engineer');
        });

        it('should route Ray Tracing keywords to Ray Tracing & Global Illumination Specialist agent', async () => {
            const output = 'Examine bounding_volume_hierarchies_bvh traversals and execute ray_box_intersection_algorithms calculations';
            const { strategy, sequence } = await agenticRouter.routeDownstreamSwarm(output);

            expect(strategy).toBe('Graphics Swarm: Ray Tracing & Global Illumination');
            const agentIds = sequence.map(s => s.agentId);
            expect(agentIds).toContain('Ray Tracing & Global Illumination Specialist');
        });

        it('should route Shader Artist keywords to Creative Shader & Visual Effects Artist agent', async () => {
            const output = 'Apply fragment_vertex_shader_effects rendering and run raymarching_signed_distance_fields simulations';
            const { strategy, sequence } = await agenticRouter.routeDownstreamSwarm(output);

            expect(strategy).toBe('Graphics Swarm: Shaders & Visual Effects');
            const agentIds = sequence.map(s => s.agentId);
            expect(agentIds).toContain('Creative Shader & Visual Effects Artist');
        });

        it('should route Physics Engine keywords to Game Physics Engine & Rigid Body Dynamics Specialist agent', async () => {
            const output = 'Calculate collision_detection_gjk_aabb intersections and resolve rigid_body_impulse_solvers vectors';
            const { strategy, sequence } = await agenticRouter.routeDownstreamSwarm(output);

            expect(strategy).toBe('Graphics Swarm: Game Physics & Dynamics');
            const agentIds = sequence.map(s => s.agentId);
            expect(agentIds).toContain('Game Physics Engine & Rigid Body Dynamics Specialist');
        });

        it('should route Scene Graph keywords to Scene Graph & Entity Component System (ECS) Architect agent', async () => {
            const output = 'Structure quadtree_octree_spatial_partitioning grids and run entity_component_system_ecs_layouts contiguous sweeps';
            const { strategy, sequence } = await agenticRouter.routeDownstreamSwarm(output);

            expect(strategy).toBe('Graphics Swarm: ECS & Scene Graph Architecture');
            const agentIds = sequence.map(s => s.agentId);
            expect(agentIds).toContain('Scene Graph & Entity Component System (ECS) Architect');
        });

        it('should route Video Codec keywords to Video & Image Compression Codec Specialist agent', async () => {
            const output = 'Assert h264_hevc_av1_quantization bounds and track macroblock_entropy_coding bitstreams';
            const { strategy, sequence } = await agenticRouter.routeDownstreamSwarm(output);

            expect(strategy).toBe('Graphics Swarm: Codecs & Image Compression');
            const agentIds = sequence.map(s => s.agentId);
            expect(agentIds).toContain('Video & Image Compression Codec Specialist');
        });

        it('should route Spatial Audio keywords to Spatial Audio & Interactive Acoustics Engineer agent', async () => {
            const output = 'Audit web_audio_api_node_connections bindings and analyze acoustic_room_impulse_responses results';
            const { strategy, sequence } = await agenticRouter.routeDownstreamSwarm(output);

            expect(strategy).toBe('Graphics Swarm: Spatial Audio & Acoustics');
            const agentIds = sequence.map(s => s.agentId);
            expect(agentIds).toContain('Spatial Audio & Interactive Acoustics Engineer');
        });

        it('should route AR/VR keywords to AR/VR XR Runtime & Spatial Computing Specialist agent', async () => {
            const output = 'Fetch webxr_device_pose_estimation tracks and compensate lens_distortion_warp_compensation ratios';
            const { strategy, sequence } = await agenticRouter.routeDownstreamSwarm(output);

            expect(strategy).toBe('Graphics Swarm: AR/VR & XR Runtimes');
            const agentIds = sequence.map(s => s.agentId);
            expect(agentIds).toContain('AR/VR XR Runtime & Spatial Computing Specialist');
        });

        it('should route CAD Engine keywords to CAD Engine & Vector Graphics Specialist agent', async () => {
            const output = 'Examine bezier_bspline_subdivision_curves segments and execute boolean_polygon_clipping_operations cuts';
            const { strategy, sequence } = await agenticRouter.routeDownstreamSwarm(output);

            expect(strategy).toBe('Graphics Swarm: CAD Engines & Vector Graphics');
            const agentIds = sequence.map(s => s.agentId);
            expect(agentIds).toContain('CAD Engine & Vector Graphics Specialist');
        });

        it('should route Texture Material keywords to Texture Mapping & Materials Shader Specialist agent', async () => {
            const output = 'Build pbr_material_reflectance_rendering profiles and verify mipmap_filtering_anisotropic_levels interpolation';
            const { strategy, sequence } = await agenticRouter.routeDownstreamSwarm(output);

            expect(strategy).toBe('Graphics Swarm: Textures & Materials Shading');
            const agentIds = sequence.map(s => s.agentId);
            expect(agentIds).toContain('Texture Mapping & Materials Shader Specialist');
        });
    });
});
