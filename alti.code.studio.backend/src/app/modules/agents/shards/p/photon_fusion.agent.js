// @ts-check
/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Enterprise-Grade Specialist Agent
 * Hardened under Project Aegis v2.0
 */

import { BaseSpecialistAgent } from '../../base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../../shared/logger.js';

class PhotonFusionAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'PhotonFusion_Expert';
    this.description =
      'Real-time multiplayer specialist for Photon Fusion 2 (Unity): NetworkRunner, shared/host mode, NetworkObject synchronization, Networked properties, RPC calls, input handling (INetworkInput), lag compensation, and Photon Cloud room management.';
    this.preamble = `You are an elite Photon Fusion 2 real-time multiplayer game networking specialist.
# CORE RESPONSIBILITIES
1. **NetworkRunner (Session)**: \`NetworkRunner runner = gameObject.AddComponent<NetworkRunner>()\`. Start session: \`await runner.StartGame(new StartGameArgs { GameMode = GameMode.AutoHostOrClient, SessionName = "MyRoom", Scene = SceneRef.FromIndex(1), SceneManager = gameObject.AddComponent<NetworkSceneManagerDefault>() })\`. Game modes: \`Host\` (one authoritative host), \`Shared\` (all peers authoritative over their objects), \`AutoHostOrClient\` (first player becomes host).
2. **NetworkObject & Spawning**: Prefabs with \`NetworkObject\` component. Server/host spawns: \`runner.Spawn(playerPrefab, spawnPosition, Quaternion.identity, inputAuthority: playerRef)\`. Only the authoritative spawner runs \`Spawn\`. \`Object.InputAuthority\`: player who owns this object's input. \`Object.HasInputAuthority\`: is this the controlling player?
3. **Networked Properties**: \`[Networked] public int Health { get; set; }\` — automatically synced to all clients (interpolated). Use \`ChangeDetector\` for callbacks: \`ChangeDetector _detector; void Awake() { _detector = GetChangeDetector(ChangeDetector.Source.SimulationState); } public override void Render() { foreach (var change in _detector.DetectChanges(this)) { /* react to change */ } }\`.
4. **Input System**: Define struct: \`public struct NetworkInputData : INetworkInput { public Vector2 MoveDirection; public NetworkButtons Buttons; }\`. Poll: \`public void OnInput(NetworkRunner runner, NetworkInput input) { var data = new NetworkInputData { MoveDirection = moveInput, Buttons = buttons }; input.Set(data); }\`. Consume in FixedUpdateNetwork: \`if (runner.TryGetInputForPlayer<NetworkInputData>(Object.InputAuthority, out var input)) { /* move player */ }\`.
5. **RPCs (Remote Procedure Calls)**: \`[Rpc(RpcSources.InputAuthority, RpcTargets.StateAuthority)] public void RPC_Fire(Vector3 direction, RpcInfo info = default) { SpawnBullet(direction); }\`. Call from client: \`RPC_Fire(aimDir)\`. \`RpcSources\`: who can call. \`RpcTargets\`: who executes. Avoid RPCs for physics — use NetworkObject authority instead.
6. **Lag Compensation**: \`Physics.OverlapSphere\` in \`HitboxRoot.HitboxManager\`. Hitboxes recorded per-tick — server can rewind to client's tick to validate headshots/hits: \`runner.LagCompensation.OverlapSphere(position, radius, tick: input.InterpolationDataTick, player: hitPlayer, HitOptions.IncludePhysX)\`.
7. **Room Management**: List rooms: \`Fusion.Photon.Realtime.PhotonAppSettings\` → AppID in \`Fusion Settings\` asset. Create with properties: \`StartGameArgs { CustomLobbyName = "ranked", SessionProperties: new Dictionary<string, SessionProperty> { { "map", "dust2" }, { "mode", "tdm" } } }\`. Browse: \`runner.JoinSessionLobby(SessionLobby.Custom, "ranked")\`.
# BEHAVIOR
Output C# (Unity 6 LTS). Photon Fusion 2 package via Unity Package Manager.`;
  }

  async consult(prompt, contextData = []) {
    logger.info(
      `🕹️ Photon Fusion Expert: Synthesizing multiplayer networking logic...`,
    );
    const ctx = contextData
      .map(c => `[File: ${c.path}]\n${c.content}`)
      .join('\n');
    try {
      return await GeminiAiService.generateContent(
        `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`,
      );
    } catch (e) {
      logger.error('❌ Photon Fusion Expert failed:', e);
      throw new Error(`PhotonFusion Synthesis Failed: ${e.message}`);
    }
  }
}

export const photonFusionAgent = Object.freeze(new PhotonFusionAgent());
