/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * capability.router.js — The Swarm's Semantic Agent Router
 *
 * Accepts a free-text query and routes it to the most capable agent
 * using keyword-score matching. Now includes ALL 133 registered agents:
 *   Tier 9    — Growth & Operations (7)
 *   Tier 12   — Hyper-Niche Micro Specialists (10)
 *   Tier 13   — Enterprise SDK Integrations (12)
 *   Tier 14   — AI/ML, Mobile, Testing & Data (11)
 *   Tier 15   — Security, Platform & Creative (10)
 *   Tier 16   — Extended Cloud Providers (10)
 *   Tier 6/7  — Original Cloud & Language (7)
 *   Tier 17   — Systems Languages (8)
 *   Tier 18   — Dynamic / Scripting Languages (8)
 *   Tier 19   — Functional Languages (8)
 *   Tier 20   — Legacy, Specialized & Esoteric Languages (16)
 */

import { logger } from '../../../shared/logger.js';
// v6.5.0 — AgentProfiler: weighted routing + surge protection
import { agentProfiler } from '../agentProfiler/agentProfiler.service.js';
import { voiceBiometricsService } from '../security/voice_biometrics.service.js';

// ── Tier 9: Growth & Operations ───────────────────────────────────────────────
import { seoAgent } from './seo.agent.js';
import { accessibilityAgent } from './accessibility.agent.js';
import { onboardingAgent } from './onboarding.agent.js';
import { apiDesignAgent } from './api_design.agent.js';
import { incidentAgent } from './incident.agent.js';
import { migrationAgent } from './migration.agent.js';
import { costAgent } from './cost.agent.js';

// ── Tier 12: Hyper-Niche Micro Specialists ────────────────────────────────────
import { regexAgent } from './regex.agent.js';
import { dockerAgent } from './docker.agent.js';
import { kubernetesAgent } from './kubernetes.agent.js';
import { nginxAgent } from './nginx.agent.js';
import { graphqlAgent } from './graphql.agent.js';
import { bashAgent } from './bash.agent.js';
import { cronAgent } from './cron.agent.js';
import { ffmpegAgent } from './ffmpeg.agent.js';
import { jwtAgent } from './jwt.agent.js';
import { threejsAgent } from './threejs.agent.js';
import { openClawAgent } from './openclaw.agent.js';

// ── Tier 13: Enterprise SDK Integrations ──────────────────────────────────────
import { stripeAgent } from './stripe.agent.js';
import { redisAgent } from './redis.agent.js';
import { supabaseAgent } from './supabase.agent.js';
import { prismaAgent } from './prisma.agent.js';
import { webrtcAgent } from './webrtc.agent.js';
import { solidityAgent } from './solidity.agent.js';
import { svelteAgent } from './svelte.agent.js';
import { vueAgent } from './vue.agent.js';
import { storybookAgent } from './storybook.agent.js';
import { opentelemetryAgent } from './opentelemetry.agent.js';
import { ansibleAgent } from './ansible.agent.js';
import { terraformAgent } from './terraform.agent.js';
import { composioAgent } from './composio.agent.js';

// ── Tier 14: AI/ML, Mobile, Testing & Data ────────────────────────────────────
import { langchainAgent } from './langchain.agent.js';
import { mlopsAgent } from './mlops.agent.js';
import { promptengAgent } from './prompteng.agent.js';
import { reactnativeAgent } from './reactnative.agent.js';
import { flutterAgent } from './flutter.agent.js';
import { pwaAgent } from './pwa.agent.js';
import { vitestAgent } from './vitest.agent.js';
import { playwrightAgent } from './playwright.agent.js';
import { sqlAgent } from './sql.agent.js';
import { elasticsearchAgent } from './elasticsearch.agent.js';
import { kafkaAgent } from './kafka.agent.js';

// ── Tier 15: Security, Platform & Creative ────────────────────────────────────
import { pentestAgent } from './pentest.agent.js';
import { githubactionsAgent } from './githubactions.agent.js';
import { figmaAgent } from './figma.agent.js';
import { wasmAgent } from './wasm.agent.js';
import { denoAgent } from './deno.agent.js';
import { mongodbAgent } from './mongodb.agent.js';
import { grpcAgent } from './grpc.agent.js';
import { tailwindAgent } from './tailwind.agent.js';
import { i18nAgent } from './i18n.agent.js';
import { websocketAgent } from './websocket.agent.js';

// ── Tier 16: Extended Cloud Providers ─────────────────────────────────────────
import { cloudflareAgent } from './cloudflare.agent.js';
import { vercelAgent } from './vercel.agent.js';
import { netlifyAgent } from './netlify.agent.js';
import { digitaloceanAgent } from './digitalocean.agent.js';
import { oracleAgent } from './oracle.agent.js';
import { ibmcloudAgent } from './ibmcloud.agent.js';
import { alibabaAgent } from './alibaba.agent.js';
import { hetznerAgent } from './hetzner.agent.js';
import { flyioAgent } from './flyio.agent.js';
import { railwayAgent } from './railway.agent.js';
// Tier 16b: Extended Cloud Providers (Wave 2 — brings total to 21)
import { renderAgent } from './render.agent.js';
import { linodeAgent } from './linode.agent.js';
import { vultrAgent } from './vultr.agent.js';
import { scalewayAgent } from './scaleway.agent.js';
import { ovhcloudAgent } from './ovhcloud.agent.js';
import { neonAgent } from './neon.agent.js';
import { fastlyAgent } from './fastly.agent.js';
import { backblazeAgent } from './backblaze.agent.js';


// ── Tier 6/7: Original Cloud & Language Experts ───────────────────────────────
import { awsAgent } from './aws.agent.js';
import { gcpAgent } from './gcp.agent.js';
import { azureAgent } from './azure.agent.js';
import { typescriptAgent } from './typescript.agent.js';
import { pythonAgent } from './python.agent.js';
import { rustAgent } from './rust.agent.js';
import { golangAgent } from './golang.agent.js';

// ── Tier 17: Systems Languages ────────────────────────────────────────────────
import { cAgent } from './c.agent.js';
import { cppAgent } from './cpp.agent.js';
import { csharpAgent } from './csharp.agent.js';
import { javaAgent } from './java.agent.js';
import { kotlinAgent } from './kotlin.agent.js';
import { swiftAgent } from './swift.agent.js';
import { zigAgent } from './zig.agent.js';
import { nimAgent } from './nim.agent.js';

// ── Tier 18: Dynamic / Scripting Languages ────────────────────────────────────
import { rubyAgent } from './ruby.agent.js';
import { phpAgent } from './php.agent.js';
import { perlAgent } from './perl.agent.js';
import { rAgent } from './r.agent.js';
import { juliaAgent } from './julia.agent.js';
import { matlabAgent } from './matlab.agent.js';
import { powershellAgent } from './powershell.agent.js';
import { groovyAgent } from './groovy.agent.js';

// ── Tier 19: Functional Languages ─────────────────────────────────────────────
import { haskellAgent } from './haskell.agent.js';
import { elixirAgent } from './elixir.agent.js';
import { erlangAgent } from './erlang.agent.js';
import { scalaAgent } from './scala.agent.js';
import { fsharpAgent } from './fsharp.agent.js';
import { ocamlAgent } from './ocaml.agent.js';
import { clojureAgent } from './clojure.agent.js';
import { racketAgent } from './racket.agent.js';

// ── Tier 20: Legacy, Specialized & Esoteric Languages ─────────────────────────
import { cobolAgent } from './cobol.agent.js';
import { fortranAgent } from './fortran.agent.js';
import { adaAgent } from './ada.agent.js';
import { assemblyAgent } from './assembly.agent.js';
import { objcAgent } from './objc.agent.js';
import { crystalAgent } from './crystal.agent.js';
import { luaAgent } from './lua.agent.js';
import { aplAgent } from './apl.agent.js';
import { vhdlAgent } from './vhdl.agent.js';
import { apexAgent } from './apex.agent.js';
import { abapAgent } from './abap.agent.js';
import { prologAgent } from './prolog.agent.js';
import { dartAgent } from './dart.agent.js';
import { wolframAgent } from './wolfram.agent.js';
import { plsqlAgent } from './plsql.agent.js';

// ── Phases 7-10: Industry Vertical Specialists ────────────────────────────────
// Real Estate & PropTech
import { zillowAgent } from './zillow.agent.js';
import { buildiumAgent } from './buildium.agent.js';
import { procoreAgent } from './procore.agent.js';
import { guestyAgent } from './guesty.agent.js';
import { attomAgent } from './attom.agent.js';
// EdTech & Education
import { canvasLmsAgent } from './canvas_lms.agent.js';
import { googleClassroomAgent } from './google_classroom.agent.js';
import { zoomSdkAgent } from './zoom_sdk.agent.js';
import { brightspaceAgent } from './brightspace.agent.js';
// FinTech depth
import { alphaVantageAgent } from './alpha_vantage.agent.js';
import { stripeTreasuryAgent } from './stripe_treasury.agent.js';
// Gaming depth
import { agoraAgent } from './agora.agent.js';
// Cybersecurity
import { virusTotalAgent } from './virustotal.agent.js';
import { shodanAgent } from './shodan.agent.js';
import { crowdStrikeAgent } from './crowdstrike.agent.js';
import { splunkAgent } from './splunk.agent.js';
import { hibpAgent } from './hibp.agent.js';
// Marketing & Analytics
import { hubspotAgent } from './hubspot.agent.js';
import { klaviyoAgent } from './klaviyo.agent.js';
import { anthropicAgent } from './anthropic.agent.js';
// DevSecOps vertical (v4.1.0)
import { snykAgent } from './snyk.agent.js';
import { semgrepAgent } from './semgrep.agent.js';
import { sonarqubeAgent } from './sonarqube.agent.js';
import { owaspZapAgent } from './owasp_zap.agent.js';
import { veracodeAgent } from './veracode.agent.js';
// Supply Chain & Logistics vertical (v4.1.0)
import { fedexAgent } from './fedex.agent.js';
import { shipbobAgent } from './shipbob.agent.js';
import { flexportAgent } from './flexport.agent.js';
import { sapAribaAgent } from './sap_ariba.agent.js';
// AgriTech vertical (v4.2.0)
import { johnDeereAgent } from './john_deere.agent.js';
import { trimbleAgAgent } from './trimble_ag.agent.js';
import { climateCorpAgent } from './climate_corp.agent.js';
// Energy vertical (v4.2.0)
import { siemensMindSphereAgent } from './siemens_mindsphere.agent.js';
import { osduAgent } from './osdu.agent.js';
import { evGridAgent } from './ev_grid.agent.js';
// Auto & Manufacturing vertical (v4.2.0)
import { automotiveDigitalAgent } from './automotive_digital.agent.js';
// Agent Quality (v4.3.0)
import { promptfooAgent } from './promptfoo.agent.js';
import { enterpriseGovernanceAgent } from './enterprise_governance.agent.js';
// v6.0.0 — Vision-to-UI + Self-Expanding Swarm
import { visionToUIAgent } from './vision_to_ui.agent.js';
import { selfExpandingSwarmService } from './self_expanding_swarm.service.js';
// Phase 25 — The Omniscient FinOps
import { finopsAgent } from './finops.agent.js';
// Phase 26 — The Synthetic Demographics
// Duplicate import removed
// Phase 27 — The Cryptographic Vanguard
import { quantumSecAgent } from './quantumSec.agent.js';
// Phase 28 — The Physical Bridge
import { hardwareAgent } from './hardware.agent.js';
// Phase 31 — The Legal Oracle
import { legalAgent } from './legal.agent.js';
// Open-Inspect Background Agent Integration
import { backgroundAgent } from './background.agent.js';
// PentAGI Autonomous Pentesting Integration
import { pentagiAgent } from './pentagi.agent.js';
// FossFLOW Isometric Architecture Integration
import { fossflowAgent } from './fossflow.agent.js';
// Phase 46 — Extreme Vertical Expansion
import { ncbiAgent } from './ncbi.agent.js';
import { ensemblAgent } from './ensembl.agent.js';
import { illuminaAgent } from './illumina.agent.js';
import { sevenbridgesAgent } from './sevenbridges.agent.js';
import { nasaAgent } from './nasa.agent.js';
import { maxarAgent } from './maxar.agent.js';
import { spireAgent } from './spire.agent.js';
import { starlinkAgent } from './starlink.agent.js';
import { datagovAgent } from './datagov.agent.js';
import { openfemaAgent } from './openfema.agent.js';
import { irsAgent } from './irs.agent.js';
import { ticketmasterAgent } from './ticketmaster.agent.js';
import { eventbriteAgent } from './eventbrite.agent.js';
import { seatgeekAgent } from './seatgeek.agent.js';
// Phase 47 — Unprecedented Vertical Expansion
import { shippoAgent } from './shippo.agent.js';
import { samsaraAgent } from './samsara.agent.js';
import { amadeusAgent } from './amadeus.agent.js';
import { uberAgent } from './uber.agent.js';
import { skyscannerAgent } from './skyscanner.agent.js';
import { smartcarAgent } from './smartcar.agent.js';
import { chargepointAgent } from './chargepoint.agent.js';
import { teslaAgent } from './tesla.agent.js';
import { myjohndeereAgent } from './myjohndeere.agent.js';
import { climatefieldviewAgent } from './climatefieldview.agent.js';
import { planetlabsAgent } from './planetlabs.agent.js';
import { watttimeAgent } from './watttime.agent.js';
import { enphaseAgent } from './enphase.agent.js';
import { persefoniAgent } from './persefoni.agent.js';
// Phase 48 — Hyper-Vertical Deepening
import { onfleetAgent } from './onfleet.agent.js';
import { sabreAgent } from './sabre.agent.js';
import { geotabAgent } from './geotab.agent.js';
import { cropinAgent } from './cropin.agent.js';
import { nrelAgent } from './nrel.agent.js';
import { yodleeAgent } from './yodlee.agent.js';
import { epicMychartAgent } from './epic_mychart.agent.js';
import { epicOnlineServicesAgent } from './epic_online_services.agent.js';
import { magentoAgent } from './magento.agent.js';
import { tuyaAgent } from './tuya.agent.js';
import { costarAgent } from './costar.agent.js';
import { moodleAgent } from './moodle.agent.js';
import { ironcladAgent } from './ironclad.agent.js';
import { muxAgent } from './mux.agent.js';
import { workdayAgent } from './workday.agent.js';
import { tenableAgent } from './tenable.agent.js';
import { marketoAgent } from './marketo.agent.js';
import { rcsbPdbAgent } from './rcsb_pdb.agent.js';
import { esaCopernicusAgent } from './esa_copernicus.agent.js';
import { censusGovAgent } from './census_gov.agent.js';
import { stubhubAgent } from './stubhub.agent.js';

// Phase 49 — Strategic VIP Integrations
import { BrexAgent } from './agent.fintech.brex.js';
import { CernerAgent } from './agent.healthcare.cerner.js';
import { RobloxCloudAgent } from './agent.gaming.roblox.js';
import { ShopifyHydrogenAgent } from './agent.ecommerce.shopify_hydrogen.js';
import { BalenaAgent } from './agent.iot.balena.js';
import { YardiAgent } from './agent.proptech.yardi.js';
import { BlackboardAgent } from './agent.edtech.blackboard.js';
import { EverlawAgent } from './agent.legaltech.everlaw.js';
import { FrameioAgent } from './agent.media.frame_io.js';
import { LatticeAgent } from './agent.hr.lattice.js';
import { Auth0Agent } from './agent.cybersec.auth0.js';
import { IterableAgent } from './agent.marketing.iterable.js';
import { BenchlingAgent } from './agent.biotech.benchling.js';
import { CapellaAgent } from './agent.spacetech.capella.js';
import { USAspendingAgent } from './agent.govtech.usaspending.js';
import { LiveNationAgent } from './agent.events.livenation.js';
import { Project44Agent } from './agent.logistics.project44.js';
import { HopperAgent } from './agent.travel.hopper.js';
import { RivianAgent } from './agent.auto.rivian.js';
import { TrimbleAgent } from './agent.agri.trimble.js';
import { OctopusEnergyAgent } from './agent.energy.octopus.js';

// Phase 53 — Vertical Immersion (The Industry Grid Expansion)
import { chainalysisAgent } from './chainalysis.agent.js';
import { dicomImagingAgent } from './dicom_imaging.agent.js';
import { openMatchAgent } from './open_match.agent.js';
import { supplierRiskAgent } from './supplier_risk.agent.js';
import { twinMakerAgent } from './aws_twinmaker.agent.js';
import { zoneOmicsAgent } from './zone_omics.agent.js';
import { proctorAiAgent } from './proctor_ai.agent.js';
import { usptoIpAgent } from './uspto_ip.agent.js';
import { songtrustAgent } from './songtrust.agent.js';
import { checkHqPayrollAgent } from './checkhq_payroll.agent.js';
import { oktaIdentityAgent } from './okta_identity.agent.js';
import { brandwatchAgent } from './brandwatch.agent.js';
import { schrodingerAgent } from './schrodinger.agent.js';
import { droneDeployAgent } from './drone_deploy.agent.js';
import { netafimAgent } from './netafim.agent.js';

// Phase 54 — The Final Frontier (Vertical Immersion Completion)
import { federalRampAgent } from './federal_ramp.agent.js';
import { blackrockAladdinAgent } from './blackrock_aladdin.agent.js';
import { epicGamesMetaverseAgent } from './epic_games_metaverse.agent.js';
import { mindbodyAgent } from './mindbody.agent.js';
import { clearIdentityAgent } from './clear_identity.agent.js';
import { guidewireAgent } from './guidewire.agent.js';
import { blackbaudAgent } from './blackbaud.agent.js';
import { maerskAgent } from './maersk.agent.js';
import { veevaSystemsAgent } from './veeva_systems.agent.js';
import { plaidIdentityAgent } from './plaid_identity.agent.js';

// Phase 55 — The Capstone Expansion (Final 155 Milestone)
import { sapS4HanaAgent } from './sap_s4hana.agent.js';
import { nvidiaOmniverseAgent } from './nvidia_omniverse.agent.js';
import { solanaRustAgent } from './solana_rust.agent.js';
import { ffmpegMediaAgent } from './ffmpeg_media.agent.js';
import { hl7FhirAgent } from './hl7_fhir.agent.js';
import { ros2RoboticsAgent } from './ros2_robotics.agent.js';
import { autodeskForgeAgent } from './autodesk_forge.agent.js';
import { salesforceApexAgent } from './salesforce_apex.agent.js';
import { webrtcSfuAgent } from './webrtc_sfu.agent.js';
import { gdprComplianceAgent } from './gdpr_compliance.agent.js';
import { huggingfaceHubAgent } from './huggingface_hub.agent.js';

// Phase 56 — The Hyper-Specialization Expansion (Final 170 Milestone)
import { qiskitQuantumAgent } from './qiskit_quantum.agent.js';
import { planetGeospatialAgent } from './planet_geospatial.agent.js';
import { openAdrSmartGridAgent } from './open_adr_smartgrid.agent.js';
import { fpgaHftTradingAgent } from './fpga_hft_trading.agent.js';
import { nextflowGenomicsAgent } from './nextflow_genomics.agent.js';
import { wasmWasiAgent } from './wasm_wasi.agent.js';
import { ghidraReversingAgent } from './ghidra_reversing.agent.js';
import { ccsdsTelemetryAgent } from './ccsds_telemetry.agent.js';
import { ocppEvChargingAgent } from './ocpp_ev_charging.agent.js';
import { zephyrRtosAgent } from './zephyr_rtos.agent.js';
import { pdalPointcloudAgent } from './pdal_pointcloud.agent.js';
import { quantlibPricingAgent } from './quantlib_pricing.agent.js';
import { sbolSyntheticBioAgent } from './sbol_synthetic_bio.agent.js';
import { opcuaScadaAgent } from './opcua_scada.agent.js';
import { homomorphicEncryptionAgent } from './homomorphic_encryption.agent.js';

// Phase 57 — The 200-Agent Ascendancy (Final Milestone)
import { qnxAutosarAgent } from './qnx_autosar.agent.js';
import { vaspMaterialsAgent } from './vasp_materials.agent.js';
import { cesmClimateAgent } from './cesm_climate.agent.js';
import { epicsFusionAgent } from './epics_fusion.agent.js';
import { obspySeismologyAgent } from './obspy_seismology.agent.js';
import { openfoamCfdAgent } from './openfoam_cfd.agent.js';
import { loihiNeuromorphicAgent } from './loihi_neuromorphic.agent.js';
import { gaussianChemistryAgent } from './gaussian_chemistry.agent.js';
import { rootCernAgent } from './root_cern.agent.js';
import { monaiDicomAgent } from './monai_dicom.agent.js';
import { qiime2MetagenomicsAgent } from './qiime2_metagenomics.agent.js';
import { epimodelDiseaseAgent } from './epimodel_disease.agent.js';
import { openbciEegAgent } from './openbci_eeg.agent.js';
import { lorawanAgtechAgent } from './lorawan_agtech.agent.js';
import { acousticRovAgent } from './acoustic_rov.agent.js';
import { openroadEdaAgent } from './openroad_eda.agent.js';
import { dwdmOpticalAgent } from './dwdm_optical.agent.js';
import { arinc429AvionicsAgent } from './arinc_429_avionics.agent.js';
import { stratumMiningAgent } from './stratum_mining.agent.js';
import { iec61850SubstationAgent } from './iec61850_substation.agent.js';
import { slic3r3dprintAgent } from './slic3r_3dprint.agent.js';
import { gurobiOptimizationAgent } from './gurobi_optimization.agent.js';
import { volatilityForensicsAgent } from './volatility_forensics.agent.js';
import { prophetActuarialAgent } from './prophet_actuarial.agent.js';
import { essentiaAudioAgent } from './essentia_audio.agent.js';
import { sumoTrafficAgent } from './sumo_traffic.agent.js';
import { nltkLinguisticsAgent } from './nltk_linguistics.agent.js';
import { hawkeyeSportsAgent } from './hawkeye_sports.agent.js';
import { orekitAstrodynamicsAgent } from './orekit_astrodynamics.agent.js';
import { bb84QkdAgent } from './bb84_qkd.agent.js';

// Phase 34 — OSS Agent Armada Expansion II
import vllmAgent from './domain/vllm.agent.js';
import ollamaAgent from './domain/ollama.agent.js';
import hfTransformersAgent from './domain/hf_transformers.agent.js';
import ggufAgent from './domain/gguf.agent.js';
import dbtAgent from './domain/dbt.agent.js';
import airflowAgent from './domain/airflow.agent.js';
import snowflakeAgent from './domain/snowflake.agent.js';
import databricksAgent from './domain/databricks.agent.js';
import solidityAgentV2 from './domain/solidity.agent.js';
import hardhatAgent from './domain/hardhat.agent.js';
import ethersAgent from './domain/ethers.agent.js';
import anchorAgent from './domain/anchor.agent.js';

// Phase 35 — OSS Agent Armada Expansion III
import gitlabCiAgent from './domain/gitlab_ci.agent.js';
import jenkinsAgent from './domain/jenkins.agent.js';
import argocdAgent from './domain/argocd.agent.js';
import fluxcdAgent from './domain/fluxcd.agent.js';
import godotAgent from './domain/godot.agent.js';
import bevyAgent from './domain/bevy.agent.js';
import phaserAgent from './domain/phaser.agent.js';
import webgpuAgent from './domain/webgpu.agent.js';
import sstAgent from './domain/sst.agent.js';
import serverlessFwAgent from './domain/serverless_fw.agent.js';
import localstackAgent from './domain/localstack.agent.js';
import awsSamAgent from './domain/aws_sam.agent.js';

// Phase 36 — OSS Agent Armada Expansion IV
import streamlitAgent from './domain/streamlit.agent.js';
import gradioAgent from './domain/gradio.agent.js';
import scikitLearnAgent from './domain/scikit_learn.agent.js';
import xgboostAgent from './domain/xgboost.agent.js';
import quarkusAgent from './domain/quarkus.agent.js';
import micronautAgent from './domain/micronaut.agent.js';
import vertXAgent from './domain/vert_x.agent.js';
import akkaAgent from './domain/akka.agent.js';
import keycloakAgent from './domain/keycloak.agent.js';
import sentryAgent from './domain/sentry.agent.js';
import posthogAgent from './domain/posthog.agent.js';
import metabaseAgent from './domain/metabase.agent.js';

// ---- 🏗️ Pillar 1: High-Stakes Finance & Banking (Phase 52+) ----
import { fixProtocolAgent } from './domain/fix_protocol.agent.js';
import { fintechLedgerAgent } from './domain/fintech.ledger.agent.js';

// ---- 🏗️ Pillar 2: Industrial Engineering & Manufacturing (Phase 54+) ----
import { industrialIotAgent } from './domain/industrial_iot.agent.js';
import { automotiveFirmwareAgent } from './domain/automotive_firmware.agent.js';

// ---- 🏗️ Pillar 3: Legacy ERP & Enterprise Nervous Systems (Phase 56+) ----
import { enterpriseErpAgent } from './domain/enterprise_erp.agent.js';
import { salesforceApexAgent as domainSalesforceApexAgent } from './domain/salesforce_apex.agent.js';

// ---- 🏗️ Pillar 4: Healthcare & Insurance (Phase 58+) ----
import { healthcareFhirAgent } from './domain/healthcare_fhir.agent.js';
import { insuranceGuidewireAgent } from './domain/insurance_guidewire.agent.js';

// ---- 🚀 Pillar 5: Aerospace, Defense & Space Systems (Phase 61+) ----
import { aerospaceAvionicsAgent } from './domain/aerospace.avionics.agent.js';
import { spaceTelemetryAgent } from './domain/space.telemetry.agent.js';

// ---- ⚡ Pillar 6: Energy, Smart Grid & Renewables (Phase 63+) ----
import { energySmartGridAgent } from './domain/energy.smartgrid.agent.js';

// ---- 📡 Pillar 7: Telecommunications & 5G Core (Phase 64+) ----
import { telecom5GAgent } from './domain/telecom.5G.agent.js';

// ---- 📦 Pillar 8: Global Logistics & Supply Chain (Phase 65+) ----
import { logisticsEdiAgent } from './domain/logistics.edi.agent.js';

// ---- ⚖️ Pillar 9: Legal, Compliance, & GovTech (Phase 66+) ----
import { legalForensicsAgent } from './domain/legal.forensics.agent.js';
import { govtechSecurityAgent } from './domain/govtech.security.agent.js';

// ---- 🔐 Pillar 10: Advanced Applied Cryptography (Phase 69+) ----
import { cryptoZkAgent } from './domain/crypto.zk.agent.js';
import { cryptoPqcAgent } from './domain/crypto.pqc.agent.js';

// ---- 🌐 Pillar 11: Distributed Consensus & P2P Networks (Phase 71+) ----
import { distributedConsensusAgent } from './domain/distributed.consensus.agent.js';
import { distributedNetworkingAgent } from './domain/distributed.networking.agent.js';

// ---- 🗄️ Pillar 12: High-Performance Database Internals (Phase 73+) ----
import { databaseStorageAgent } from './domain/database.storage.agent.js';
import { databaseQueryAgent } from './domain/database.query.agent.js';

// ---- 🧠 Pillar 13: Edge AI & TinyML Optimization (Phase 75+) ----
import { edgeTinymlAgent } from './domain/edge.tinyml.agent.js';

// Phase 9.0 — The Sovereign Delivery Pipeline
import { reviewAgent } from './review.agent.js';
import { prepareAgent } from './prepare.agent.js';
import { mergeAgent } from './merge.agent.js';
import { releaseOpsAgent } from './release_ops.agent.js';
import { docsAgent } from './docs.agent.js';

// Phase 10.0 — The Enterprise Genesis Kernel
import { omniRefactorAgent } from './omni_refactor.agent.js';
import { complianceGuardAgent } from './compliance_guard.agent.js';

// Phase 11.0 — The Zero-Downtime Migration Engine
import { migrationArchitectAgent } from './migration_architect.agent.js';
import { dbShadowAgent } from './db_shadow.agent.js';

// Phase 12.0 — The Omnipresent Threat Intel Matrix
import { cveSentinelAgent } from './cve_sentinel.agent.js';
import { wasmSandboxAgent } from './wasm_sandbox.agent.js';

// Phase 13.0 — The Omnilayer Integration Nexus
import { jiraArchitectAgent } from './jira_architect.agent.js';
import { figmaCompilerAgent } from './figma_compiler.agent.js';
import { datadogSentryCorrelatorAgent } from './datadog_sentry_correlator.agent.js';

// Phase 14.0 — The Multimodal Synthetic User & QA Matrix
import { visionQaAgent } from './vision_qa.agent.js';
import { syntheticUserAgent } from './synthetic_user.agent.js';
import { a11yEnforcerAgent } from './a11y_enforcer.agent.js';

// Phase 15.0 — The Global Governance & Compliance Engine
import { hipaaFhirAuditorAgent } from './hipaa_fhir_auditor.agent.js';
import { fintechPciAuditorAgent } from './fintech_pci_auditor.agent.js';
import { gdprPrivacyAuditorAgent } from './gdpr_privacy_auditor.agent.js';

// Phase 16.0 — The Sovereign Cloud Automata (GCP Native)
import { gcpIacArchitectAgent } from './gcp_iac_architect.agent.js';
import { cloudSpannerOrchestratorAgent } from './cloud_spanner_orchestrator.agent.js';
import { beyondcorpZeroTrustAgent } from './beyondcorp_zero_trust.agent.js';

// Phase 17.0 — The Sovereign Resilience & Confidential Compute Core
import { confidentialComputeAgent } from './confidential_compute.agent.js';
import { multiRegionDrAgent } from './multi_region_dr.agent.js';
import { ransomwareVaultGuardianAgent } from './ransomware_vault_guardian.agent.js';

// Phase 18.0 — The Cryptographic Supply Chain & Forensic Audit Engine
import { slsaBuildEnforcerAgent } from './slsa_build_enforcer.agent.js';
import { forensicTelemetryAuditorAgent } from './forensic_telemetry_auditor.agent.js';
import { sovereignIncidentResponderAgent } from './sovereign_incident_responder.agent.js';

// Phase 19.0 — The Anthropic Data Warehouse & AI Analytics Core
import { bigqueryArchitectAgent } from './bigquery_architect.agent.js';
import { vertexAiModelerAgent } from './vertex_ai_modeler.agent.js';
import { generativeBiAnalystAgent } from './generative_bi_analyst.agent.js';

// Phase 20.0 — The Planetary Edge & Sovereign Distributed Cloud
import { edgeComputeArchitectAgent } from './edge_compute_architect.agent.js';
import { distributedCloudOrchestratorAgent } from './distributed_cloud_orchestrator.agent.js';
import { serverlessV8MutatorAgent } from './serverless_v8_mutator.agent.js';
import { cognitiveSreNavigatorAgent } from './cognitive_sre_navigator.agent.js';

// Phase 21.0 — The Gemini Multimodal Workspace & Copilot Integration
import { geminiCliCopilotAgent } from './gemini_cli_copilot.agent.js';
import { workspaceIntelligenceRouterAgent } from './workspace_intelligence_router.agent.js';
import { multimodalContextSynthesizerAgent } from './multimodal_context_synthesizer.agent.js';

// Phase 22.0 — The Quantum AI Gateway & API Monetization Engine
import { apigeeMonetizationArchitectAgent } from './apigee_monetization_architect.agent.js';
import { aiGatewayRouterAgent } from './ai_gateway_router.agent.js';
import { graphqlFederationBuilderAgent } from './graphql_federation_builder.agent.js';

// Phase 23.0 — Seamless Coworker Handoff & Omnipresent Context
import { coworkerHandoffOrchestratorAgent } from './coworker_handoff_orchestrator.agent.js';
import { multiAgentConsensusEngineAgent } from './multi_agent_consensus_engine.agent.js';
import { humanInLoopEscalatorAgent } from './human_in_loop_escalator.agent.js';

// Phase 24.0 — The Omniscient Incident Commander & RCA Synthesizer
import { incidentCommanderAgent } from './incident_commander.agent.js';
import { rootCauseSynthesizerAgent } from './root_cause_synthesizer.agent.js';
import { chaosEngineeringChaosMonkeyAgent } from './chaos_engineering_chaos_monkey.agent.js';
import { blamelessCultureEnforcerAgent } from './blameless_culture_enforcer.agent.js';

// Phase 25.0 — The Cognitive FinOps & Cloud Cost Eradicator
import { finopsBillingAnalyzerAgent } from './finops_billing_analyzer.agent.js';
import { spotInstanceArbitrageAgent } from './spot_instance_arbitrage.agent.js';
import { algorithmicEfficiencyRefactorerAgent } from './algorithmic_efficiency_refactorer.agent.js';
import { carbonFootprintOptimizerAgent } from './carbon_footprint_optimizer.agent.js';

// Phase 26.0 — The Global ERP Integration & Legacy Migration Fabric
import { sapHanaFinancialsBridgeAgent } from './sap_hana_financials_bridge.agent.js';
import { salesforceApexArchitectAgent } from './salesforce_apex_architect.agent.js';
import { workdayHcmSynchronizerAgent } from './workday_hcm_synchronizer.agent.js';
import { legacyCobolModernizerAgent } from './legacy_cobol_modernizer.agent.js';

// Phase 27.0 — The Industry-Specific ERP & Core Systems Expansion
import { netsuiteErpOrchestratorAgent } from './netsuite_erp_orchestrator.agent.js';
import { guidewireInsuranceBridgeAgent } from './guidewire_insurance_bridge.agent.js';
import { epicFhirHealthRouterAgent } from './epic_fhir_health_router.agent.js';
import { plaidOpenBankingSyncAgent } from './plaid_open_banking_sync.agent.js';

// Phase 28.0 — The Autonomous Semantic RPA & GUI Singularity
import { semanticGuiExtractorAgent } from './semantic_gui_extractor.agent.js';
import { playwrightDomPuppeteerAgent } from './playwright_dom_puppeteer.agent.js';
import { computerVisionOcrArbiterAgent } from './computer_vision_ocr_arbiter.agent.js';
import { osLevelMacroOrchestratorAgent } from './os_level_macro_orchestrator.agent.js';

// Phase 29.0 — The Autonomous Edge & IoT Firmware Fabric
import { embeddedCRustTranspilerAgent } from './embedded_c_rust_transpiler.agent.js';
import { rtosKernelOptimizerAgent } from './rtos_kernel_optimizer.agent.js';
import { lorawanTelemetryDecoderAgent } from './lorawan_telemetry_decoder.agent.js';
import { overTheAirOtaDeployerAgent } from './over_the_air_ota_deployer.agent.js';

// Phase 30.0 — The Web3 & DeFi Autonomous Nexus
import { solidityEvmArchitectAgent } from './solidity_evm_architect.agent.js';
import { smartContractFormalVerifierAgent } from './smart_contract_formal_verifier.agent.js';
import { defiArbitrageOrchestratorAgent } from './defi_arbitrage_orchestrator.agent.js';
import { decentralizedIdentityBridgeAgent } from './decentralized_identity_bridge.agent.js';

// Phase 31.0 — The Autonomous Manufacturing & Industrial Systems Nexus
import { siemensTeamcenterPlmBridgeAgent } from './siemens_teamcenter_plm_bridge.agent.js';
import { scadaIndustrialControlRouterAgent } from './scada_industrial_control_router.agent.js';
import { sapIbpSupplyChainOptimizerAgent } from './sap_ibp_supply_chain_optimizer.agent.js';
import { rockwellMesOrchestratorAgent } from './rockwell_mes_orchestrator.agent.js';

// Phase 32.0 — The Enterprise Legacy System & Industry SDK Synthesizer
import { automotiveAutosarCppArchitectAgent } from './automotive_autosar_cpp_architect.agent.js';
import { insuranceGuidewireGosuGeneratorAgent } from './insurance_guidewire_gosu_generator.agent.js';
import { bankingIso8583CobolRefactorAgent } from './banking_iso8583_cobol_refactor.agent.js';
import { mortgageEncompassSdkBuilderAgent } from './mortgage_encompass_sdk_builder.agent.js';

// Phase 33.0 — The Sovereign Defense & Aerospace Systems Integrator
import { aerospaceDo178cAvionicsCertifierAgent } from './aerospace_do178c_avionics_certifier.agent.js';
import { defenseRos2RoboticsOrchestratorAgent } from './defense_ros2_robotics_orchestrator.agent.js';
import { satelliteC2TelemetryDecoderAgent } from './satellite_c2_telemetry_decoder.agent.js';
import { tacticalDatalinkLink16ParserAgent } from './tactical_datalink_link16_parser.agent.js';

// Phase 34.0 — The Quantum Computing & Applied Cryptography Integrator
import { quantumQiskitAlgorithmSynthesizerAgent } from './quantum_qiskit_algorithm_synthesizer.agent.js';
import { cryptoPostQuantumLatticeGeneratorAgent } from './crypto_post_quantum_lattice_generator.agent.js';
import { quantumAnnealingDwaveOptimizerAgent } from './quantum_annealing_dwave_optimizer.agent.js';
import { homomorphicEncryptionFheCompilerAgent } from './homomorphic_encryption_fhe_compiler.agent.js';

// Phase 35.0 — The Precision Medicine & Bioinformatics Geneticist
import { bioinformaticsGenomicPipelineOrchestratorAgent } from './bioinformatics_genomic_pipeline_orchestrator.agent.js';
import { crisprCas9OfftargetPredictorAgent } from './crispr_cas9_offtarget_predictor.agent.js';
import { proteomicsAlphafoldModelerAgent } from './proteomics_alphafold_modeler.agent.js';
import { medicalHl7FhirInteroperabilityAgent } from './medical_hl7_fhir_interoperability.agent.js';

// Phase 36.0 — The Climate Modeling & Geospatial Meteorologist
import { climateCesmSimulationArchitectAgent } from './climate_cesm_simulation_architect.agent.js';
import { geospatialSentinelSarAnalystAgent } from './geospatial_sentinel_sar_analyst.agent.js';
import { esgCarbonLedgerAuditorAgent } from './esg_carbon_ledger_auditor.agent.js';
import { precisionAgricultureIotAgronomistAgent } from './precision_agriculture_iot_agronomist.agent.js';

// ── Deep Integration: Agent-Skills, deer-flow, PageIndex, learn-claude-code ────
import { agentSkillsContextAgent } from './agent-skills-context.agent.js';
import { deerFlowAgent } from './deer-flow.agent.js';
import { pageIndexAgent } from './pageindex.agent.js';
import { learnClaudeCodeAgent } from './learn-claude-code.agent.js';

// ── Tier OS: Open Source Department (v7.7.0) — 34 hand-crafted OSS specialists ─
import {
    // Frontend Frameworks
    reactOssAgent, nextjsOssAgent, vueOssAgent, svelteOssAgent,
    // Backend Frameworks
    fastapiOssAgent, djangoOssAgent, flaskOssAgent, expressOssAgent, nestjsOssAgent, honoOssAgent,
    // AI / ML
    pytorchOssAgent, huggingfaceOssAgent, langchainOssAgent, ollamaOssAgent,
    // Databases & ORMs
    supabaseOssAgent, redisOssAgent, mongodbOssAgent,
    // DevOps / Infrastructure
    dockerOssAgent, kubernetesOssAgent, githubActionsOssAgent,
    // Testing
    playwrightOssAgent, vitestOssAgent,
    // Developer Tooling
    tailwindcssOssAgent, trpcOssAgent, zodOssAgent,
    // Languages / Runtimes
    golangOssAgent, rustOssAgent, bunOssAgent, graphqlOssAgent,
    // Batch 2: Additional Frameworks, Desktop, AI Extended, Testing
    angularOssAgent, astroOssAgent, remixOssAgent, electronOssAgent, tauriOssAgent,
    tensorflowOssAgent, llamaIndexOssAgent, jestOssAgent,
    // Batch 3: Data Science, Tooling
    pandasOssAgent, pydanticOssAgent, celeryOssAgent,
    shadcnOssAgent, turborepoOssAgent, rxjsOssAgent, denoOssAgent,
    // Batch 4: Database, Infra, AI APIs, Auth
    postgresqlOssAgent, nginxOssAgent, prometheusOssAgent,
    openaiSdkOssAgent, socketioOssAgent, passportOssAgent,
    // Batch 5: Cloud IaC, ORMs, Languages
    awsCdkOssAgent, kotlinOssAgent, swiftOssAgent,
    // Batch 6: Enterprise Backend, Mobile
    springBootOssAgent, laravelOssAgent, railsOssAgent, dotnetOssAgent,
    reactNativeOssAgent, flutterOssAgent,

    // Batch 15: Hypermedia, Lightweight Reactivity, Frameworks
    htmxOssAgent, alpinejsOssAgent, solidjsOssAgent, fastifyOssAgent,

    // Batch 16: TypeScript/Edge Frameworks & Tooling
    elysiaOssAgent, qwikOssAgent, xstateOssAgent, meilisearchOssAgent,

    // Batch 17: Modern Fullstack & BaaS Ecosystems
    nuxtjsOssAgent, appwriteOssAgent, adonisjsOssAgent,

    // Batch 18: 3D, Automation, CMS & High-Perf Go
    threejsOssAgent, puppeteerOssAgent, strapiOssAgent, ginOssAgent,

    // Batch 19: Foundational & Ubiquitous Tooling
    viteOssAgent,

    // Batch 20: Frontend UI & Data Visualization
    bootstrapOssAgent, d3OssAgent, muiOssAgent, antdOssAgent,

    // Batch 21: Vector Databases & Real-Time Analytics
    chromaOssAgent, milvusOssAgent, qdrantOssAgent, clickhouseOssAgent,

    // Batch 22: Database ORMs & Tooling
    prismaOssAgent, drizzleOssAgent, typeormOssAgent, sqlalchemyOssAgent,

    // Batch 23: Testing & State Management (Final 100)
    zustandOssAgent, cypressOssAgent,

    // Batch 24: Static Sites & Headless CMS
    docusaurusOssAgent, gatsbyOssAgent, hugoOssAgent, ghostOssAgent,

    // Batch 25: Data Engineering & AI Scaling
    opencvOssAgent, rayOssAgent, sparkOssAgent, airflowOssAgent,

    // Batch 26: Cloud Native & IaC
    terraformOssAgent, pulumiOssAgent, crossplaneOssAgent, helmOssAgent,

    // Batch 27: Messaging, Event Streaming & RPC
    kafkaOssAgent, rabbitmqOssAgent, grpcOssAgent, natsOssAgent
} from './oss/index.js';

const brexAgent = new BrexAgent();
const cernerAgent = new CernerAgent();
const robloxCloudAgent = new RobloxCloudAgent();
const shopifyHydrogenAgent = new ShopifyHydrogenAgent();
const balenaAgent = new BalenaAgent();
const yardiAgent = new YardiAgent();
const blackboardAgent = new BlackboardAgent();
const everlawAgent = new EverlawAgent();
const frameioAgent = new FrameioAgent();
const latticeAgent = new LatticeAgent();
const auth0Agent = new Auth0Agent();
const iterableAgent = new IterableAgent();
const benchlingAgent = new BenchlingAgent();
const capellaAgent = new CapellaAgent();
const usaspendingAgent = new USAspendingAgent();
const liveNationAgent = new LiveNationAgent();
const project44Agent = new Project44Agent();
const hopperAgent = new HopperAgent();
const rivianAgent = new RivianAgent();
const trimbleAgent = new TrimbleAgent();
const octopusEnergyAgent = new OctopusEnergyAgent();

// Phase 53 Instantiations
const chainalysisAgent_i = chainalysisAgent;
const dicomImagingAgent_i = dicomImagingAgent;
const openMatchAgent_i = openMatchAgent;
const supplierRiskAgent_i = supplierRiskAgent;
const twinMakerAgent_i = twinMakerAgent;
const zoneOmicsAgent_i = zoneOmicsAgent;
const proctorAiAgent_i = proctorAiAgent;
const usptoIpAgent_i = usptoIpAgent;
const songtrustAgent_i = songtrustAgent;
const checkHqPayrollAgent_i = checkHqPayrollAgent;
const oktaIdentityAgent_i = oktaIdentityAgent;
const brandwatchAgent_i = brandwatchAgent;
const schrodingerAgent_i = schrodingerAgent;
const droneDeployAgent_i = droneDeployAgent;
const netafimAgent_i = netafimAgent;

// Phase 54 Instantiations
const federalRampAgent_i = federalRampAgent;
const blackrockAladdinAgent_i = blackrockAladdinAgent;
const epicGamesMetaverseAgent_i = epicGamesMetaverseAgent;
const mindbodyAgent_i = mindbodyAgent;
const clearIdentityAgent_i = clearIdentityAgent;
const guidewireAgent_i = guidewireAgent;
const blackbaudAgent_i = blackbaudAgent;
const maerskAgent_i = maerskAgent;
const veevaSystemsAgent_i = veevaSystemsAgent;
const plaidIdentityAgent_i = plaidIdentityAgent;

// Phase 55 Instantiations (Final Capstone)
const sapS4HanaAgent_i = sapS4HanaAgent;
const nvidiaOmniverseAgent_i = nvidiaOmniverseAgent;
const solanaRustAgent_i = solanaRustAgent;
const ffmpegMediaAgent_i = ffmpegMediaAgent;
const hl7FhirAgent_i = hl7FhirAgent;
const ros2RoboticsAgent_i = ros2RoboticsAgent;
const autodeskForgeAgent_i = autodeskForgeAgent;
const stripeTreasuryAgent_i = stripeTreasuryAgent;
const salesforceApexAgent_i = salesforceApexAgent;
const webrtcSfuAgent_i = webrtcSfuAgent;
const gdprComplianceAgent_i = gdprComplianceAgent;
const huggingfaceHubAgent_i = huggingfaceHubAgent;

// Phase 56 Instantiations (Hyper-Specialization)
const qiskitQuantumAgent_i = qiskitQuantumAgent;
const planetGeospatialAgent_i = planetGeospatialAgent;
const openAdrSmartGridAgent_i = openAdrSmartGridAgent;
const fpgaHftTradingAgent_i = fpgaHftTradingAgent;
const nextflowGenomicsAgent_i = nextflowGenomicsAgent;
const wasmWasiAgent_i = wasmWasiAgent;
const ghidraReversingAgent_i = ghidraReversingAgent;
const ccsdsTelemetryAgent_i = ccsdsTelemetryAgent;
const ocppEvChargingAgent_i = ocppEvChargingAgent;
const zephyrRtosAgent_i = zephyrRtosAgent;
const pdalPointcloudAgent_i = pdalPointcloudAgent;
const quantlibPricingAgent_i = quantlibPricingAgent;
const sbolSyntheticBioAgent_i = sbolSyntheticBioAgent;
const opcuaScadaAgent_i = opcuaScadaAgent;
const homomorphicEncryptionAgent_i = homomorphicEncryptionAgent;
// Phase 57 Instantiations (The 200-Agent Ascendancy)
const qnxAutosarAgent_i = qnxAutosarAgent;
const vaspMaterialsAgent_i = vaspMaterialsAgent;
const cesmClimateAgent_i = cesmClimateAgent;
const epicsFusionAgent_i = epicsFusionAgent;
const obspySeismologyAgent_i = obspySeismologyAgent;
const openfoamCfdAgent_i = openfoamCfdAgent;
const loihiNeuromorphicAgent_i = loihiNeuromorphicAgent;
const gaussianChemistryAgent_i = gaussianChemistryAgent;
const rootCernAgent_i = rootCernAgent;
const monaiDicomAgent_i = monaiDicomAgent;
const qiime2MetagenomicsAgent_i = qiime2MetagenomicsAgent;
const epimodelDiseaseAgent_i = epimodelDiseaseAgent;
const openbciEegAgent_i = openbciEegAgent;
const lorawanAgtechAgent_i = lorawanAgtechAgent;
const acousticRovAgent_i = acousticRovAgent;
const openroadEdaAgent_i = openroadEdaAgent;
const dwdmOpticalAgent_i = dwdmOpticalAgent;
const arinc429AvionicsAgent_i = arinc429AvionicsAgent;
const stratumMiningAgent_i = stratumMiningAgent;
const iec61850SubstationAgent_i = iec61850SubstationAgent;
const slic3r3dprintAgent_i = slic3r3dprintAgent;
const gurobiOptimizationAgent_i = gurobiOptimizationAgent;
const volatilityForensicsAgent_i = volatilityForensicsAgent;
const prophetActuarialAgent_i = prophetActuarialAgent;
const essentiaAudioAgent_i = essentiaAudioAgent;
const sumoTrafficAgent_i = sumoTrafficAgent;
const nltkLinguisticsAgent_i = nltkLinguisticsAgent;
const hawkeyeSportsAgent_i = hawkeyeSportsAgent;
const orekitAstrodynamicsAgent_i = orekitAstrodynamicsAgent;
const bb84QkdAgent_i = bb84QkdAgent;

// Phase 34 Instantiations
const vllmAgent_i = vllmAgent;
const ollamaAgent_i = ollamaAgent;
const hfTransformersAgent_i = hfTransformersAgent;
const ggufAgent_i = ggufAgent;
const dbtAgent_i = dbtAgent;
const airflowAgent_i = airflowAgent;
const snowflakeAgent_i = snowflakeAgent;
const databricksAgent_i = databricksAgent;
const solidityAgentV2_i = solidityAgentV2;
const hardhatAgent_i = hardhatAgent;
const ethersAgent_i = ethersAgent;
const anchorAgent_i = anchorAgent;

// Phase 35 Instantiations
const gitlabCiAgent_i = gitlabCiAgent;
const jenkinsAgent_i = jenkinsAgent;
const argocdAgent_i = argocdAgent;
const fluxcdAgent_i = fluxcdAgent;
const godotAgent_i = godotAgent;
const bevyAgent_i = bevyAgent;
const phaserAgent_i = phaserAgent;
const webgpuAgent_i = webgpuAgent;
const sstAgent_i = sstAgent;
const serverlessFwAgent_i = serverlessFwAgent;
const localstackAgent_i = localstackAgent;
const awsSamAgent_i = awsSamAgent;

// Phase 36 Instantiations
const streamlitAgent_i = streamlitAgent;
const gradioAgent_i = gradioAgent;
const scikitLearnAgent_i = scikitLearnAgent;
const xgboostAgent_i = xgboostAgent;
const quarkusAgent_i = quarkusAgent;
const micronautAgent_i = micronautAgent;
const vertXAgent_i = vertXAgent;
const akkaAgent_i = akkaAgent;
const keycloakAgent_i = keycloakAgent;
const sentryAgent_i = sentryAgent;
const posthogAgent_i = posthogAgent;
const metabaseAgent_i = metabaseAgent;

/**
 * The Capability Route Table — 200 entries.
 * Scoring: +1 per keyword found in query (case-insensitive).
 * Highest total score wins.
 */
export const CAPABILITY_TABLE = [

    // ── Tier 9: Growth & Operations ───────────────────────────────────────────
    { keywords: ['seo', 'search engine', 'meta', 'sitemap', 'core web vitals', 'opengraph', 'structured data', 'robots.txt'], agent: seoAgent },
    { keywords: ['accessibility', 'a11y', 'wcag', 'aria', 'screen reader', 'color contrast', 'ada'], agent: accessibilityAgent },
    { keywords: ['onboarding', 'quickstart', 'readme', 'developer guide', 'getting started', 'documentation'], agent: onboardingAgent },
    { keywords: ['api design', 'openapi', 'swagger', 'rest design', 'graphql schema', 'contract first', 'api spec'], agent: apiDesignAgent },
    { keywords: ['incident', 'outage', 'postmortem', 'rca', 'root cause', 'sre', 'on-call', 'pagerduty', 'stacktrace'], agent: incidentAgent },
    { keywords: ['migrate', 'migration', 'schema change', 'ddl', 'zero downtime', 'rollback', 'alter table'], agent: migrationAgent },
    { keywords: ['cost', 'finops', 'cloud spend', 'billing', 'right-size', 'spot instance', 'savings plan'], agent: costAgent },

    // ── Tier 12: Hyper-Niche Micro Specialists ────────────────────────────────
    { keywords: ['regex', 'regular expression', 'pattern match', 'capture group', 'lookahead', 'lookbehind'], agent: regexAgent },
    { keywords: ['dockerfile', 'docker', 'container', 'multi-stage build', 'containerize', 'image size'], agent: dockerAgent },
    { keywords: ['kubernetes', 'k8s', 'pod', 'deployment yaml', 'helm', 'ingress', 'kubectl', 'kube'], agent: kubernetesAgent },
    { keywords: ['nginx', 'reverse proxy', 'load balancer', 'upstream', 'server block', 'ssl termination'], agent: nginxAgent },
    { keywords: ['graphql', 'resolver', 'n+1', 'dataloader', 'apollo', 'gql mutation', 'gql query'], agent: graphqlAgent },
    { keywords: ['bash', 'shell script', 'awk', 'sed', 'grep', 'unix pipeline', 'zsh', 'posix'], agent: bashAgent },
    { keywords: ['cron', 'schedule', 'crontab', 'periodic job', 'cron expression', 'at command'], agent: cronAgent },
    { keywords: ['ffmpeg', 'video encode', 'transcode', 'hls', 'dash', 'codec', 'bitrate', 'audio processing'], agent: ffmpegAgent },
    { keywords: ['jwt', 'json web token', 'rs256', 'token expiry', 'auth token', 'bearer token', 'claims'], agent: jwtAgent },
    { keywords: ['three.js', 'threejs', 'webgl', 'glsl', 'shader', 'canvas 3d', 'three scene'], agent: threejsAgent },
    { keywords: ['openclaw', 'local execute', 'host machine', 'browser automation', 'surrogate', 'local intent'], agent: openClawAgent },

    // ── Tier 13: Enterprise SDK Integrations ──────────────────────────────────
    { keywords: ['stripe', 'payment', 'subscription', 'webhook stripe', 'checkout', 'invoice', 'radar fraud'], agent: stripeAgent },
    { keywords: ['redis', 'cache', 'pub/sub', 'pubsub', 'rate limit', 'sorted set', 'ioredis', 'upstash'], agent: redisAgent },
    { keywords: ['supabase', 'row level security', 'rls', 'supabase auth', 'realtime subscriptions', 'edge function supabase'], agent: supabaseAgent },
    { keywords: ['prisma', 'prisma schema', 'prisma migrate', 'prisma client', 'orm', 'drizzle'], agent: prismaAgent },
    { keywords: ['webrtc', 'peer connection', 'ice candidate', 'sdp', 'media stream', 'stun', 'turn server'], agent: webrtcAgent },
    { keywords: ['solidity', 'smart contract', 'evm', 'erc20', 'erc721', 'hardhat', 'foundry', 'web3', 'blockchain'], agent: solidityAgent },
    { keywords: ['svelte', 'sveltekit', 'svelte runes', 'svelte store', 'svelte component'], agent: svelteAgent },
    { keywords: ['vue', 'vuejs', 'nuxt', 'pinia', 'composition api', 'vue router', 'vue 3'], agent: vueAgent },
    { keywords: ['storybook', 'story', 'component story', 'csf3', 'storybook addon', 'chromatic'], agent: storybookAgent },
    { keywords: ['opentelemetry', 'otel', 'tracing', 'span', 'jaeger', 'zipkin', 'observability', 'prometheus metrics'], agent: opentelemetryAgent },
    { keywords: ['ansible', 'playbook', 'ansible role', 'inventory', 'vault ansible', 'idempotent'], agent: ansibleAgent },
    { keywords: ['terraform', 'hcl', 'tf plan', 'terraform module', 'remote state', 'terragrunt'], agent: terraformAgent },
    { keywords: ['composio', 'open-claude', 'jira', 'slack message composio', 'notion integration', 'salesforce record', 'github issue composer'], agent: composioAgent },

    // ── Tier 14: AI/ML, Mobile, Testing & Data ────────────────────────────────
    { keywords: ['langchain', 'rag', 'retrieval augmented', 'chain of thought langchain', 'lcel', 'langsmith', 'openwork', 'hitl', 'deepagentsjs'], agent: langchainAgent },
    { keywords: ['mlops', 'mlflow', 'model drift', 'model serving', 'retraining', 'feature store'], agent: mlopsAgent },
    { keywords: ['prompt engineering', 'few-shot', 'chain of thought', 'prompt template', 'structured output prompt'], agent: promptengAgent },
    { keywords: ['react native', 'expo', 'eas build', 'react native navigation', 'flipper', 'metro bundler'], agent: reactnativeAgent },
    { keywords: ['flutter', 'riverpod', 'flutter widget', 'cupertino', 'flutter animation'], agent: flutterAgent },
    { keywords: ['pwa', 'service worker', 'workbox', 'offline', 'web app manifest', 'install prompt'], agent: pwaAgent },
    { keywords: ['vitest', 'vi.mock', 'unit test', 'describe it expect', 'testing library'], agent: vitestAgent },
    { keywords: ['playwright', 'e2e test', 'page object', 'getbyrole', 'test automation', 'browser test'], agent: playwrightAgent },
    { keywords: ['sql', 'cte', 'window function', 'query plan', 'explain analyze', 'partition table', 'index scan'], agent: sqlAgent },
    { keywords: ['elasticsearch', 'kibana', 'elasticsearch mapping', 'aggregation pipeline', 'ilm', 'knn search'], agent: elasticsearchAgent },
    { keywords: ['kafka', 'consumer group', 'kafka topic', 'kafkajs', 'kafka streams', 'exactly once'], agent: kafkaAgent },

    // ── Tier 15: Security, Platform & Creative ────────────────────────────────
    { keywords: ['pentest', 'owasp', 'xss', 'sql injection', 'sqli', 'ssrf', 'penetration test', 'red team', 'cve'], agent: pentestAgent },
    { keywords: ['github actions', 'workflow yaml', 'ci/cd pipeline', 'oidc auth', 'matrix strategy', 'github runner'], agent: githubactionsAgent },
    { keywords: ['figma', 'design token', 'design system', 'component variant', 'figma to code'], agent: figmaAgent },
    { keywords: ['webassembly', 'wasm', 'wasi', 'wasm-pack', 'emscripten', 'wasm memory'], agent: wasmAgent },
    { keywords: ['deno', 'fresh framework', 'deno deploy', 'deno kv', 'jsr registry'], agent: denoAgent },
    { keywords: ['mongodb', 'mongoose', 'aggregation pipeline mongo', 'atlas search', 'change stream'], agent: mongodbAgent },
    { keywords: ['grpc', 'protobuf', 'proto file', 'rpc', 'grpc interceptor', 'connect-rpc'], agent: grpcAgent },
    { keywords: ['tailwind', 'tailwindcss', 'tw merge', 'cva', 'tailwind variant', 'utility class'], agent: tailwindAgent },
    { keywords: ['i18n', 'internationalization', 'localization', 'rtl', 'next-intl', 'icu format', 'translation'], agent: i18nAgent },
    { keywords: ['websocket', 'socket.io', 'socketio', 'real-time', 'ws connection', 'redis adapter socket'], agent: websocketAgent },

    // ── Tier 16: Extended Cloud Providers ─────────────────────────────────────
    { keywords: ['cloudflare', 'workers', 'durable objects', 'd1 database', 'cloudflare r2', 'cloudflare kv', 'wrangler'], agent: cloudflareAgent },
    { keywords: ['vercel', 'vercel deploy', 'vercel edge', 'isr', 'vercel kv', 'vercel postgres', 'next.js deploy'], agent: vercelAgent },
    { keywords: ['netlify', 'netlify functions', 'netlify edge', 'netlify forms', 'jamstack', 'netlify blobs'], agent: netlifyAgent },
    { keywords: ['digitalocean', 'droplet', 'do spaces', 'app platform', 'doks', 'digital ocean', 'doctl'], agent: digitaloceanAgent },
    { keywords: ['oracle cloud', 'oci', 'autonomous database', 'oke oracle', 'oracle compute', 'oci iam'], agent: oracleAgent },
    { keywords: ['ibm cloud', 'watson', 'code engine ibm', 'iks', 'ibm db2', 'ibm toolchain', 'ibmcloud'], agent: ibmcloudAgent },
    { keywords: ['alibaba cloud', 'aliyun', 'ecs alibaba', 'oss alibaba', 'function compute', 'pai ml', 'alicloud'], agent: alibabaAgent },
    { keywords: ['hetzner', 'hcloud', 'hetzner vps', 'hetzner k3s', 'hetzner volume', 'hetzner robot'], agent: hetznerAgent },
    { keywords: ['fly.io', 'flyio', 'fly.toml', 'fly machines', 'tigris storage', 'fly volumes', 'fly deploy'], agent: flyioAgent },
    { keywords: ['railway', 'railway.toml', 'nixpacks', 'railway deploy', 'railway cron', 'railway service'], agent: railwayAgent },
    // Tier 16b: Wave 2 Cloud Providers (21 total)
    { keywords: ['render', 'render.com', 'render.yaml', 'render deploy', 'render worker', 'render cron'], agent: renderAgent },
    { keywords: ['linode', 'akamai cloud', 'linode instance', 'lke', 'stackscript', 'nodebalancer', 'linode object storage'], agent: linodeAgent },
    { keywords: ['vultr', 'vultr vps', 'vke', 'vultr kubernetes', 'vultr object storage', 'vultr bare metal'], agent: vultrAgent },
    { keywords: ['scaleway', 'kapsule', 'scaleway serverless', 'scaleway managed kubernetes', 'scaleway object storage', 'scaleway gdpr'], agent: scalewayAgent },
    { keywords: ['ovhcloud', 'ovh', 'ovh dedicated server', 'ovh managed kubernetes', 'ovh public cloud', 'openstack ovh'], agent: ovhcloudAgent },
    { keywords: ['neon', 'neon postgres', 'neon branch', 'serverless postgres', 'neon database', 'neon connection pool'], agent: neonAgent },
    { keywords: ['fastly', 'vcl', 'varnish', 'fastly compute', 'fastly edge', 'origin shielding', 'fastly cdn', 'fastly waf'], agent: fastlyAgent },
    { keywords: ['backblaze', 'backblaze b2', 'b2 storage', 'b2 bucket', 'backblaze s3', 'bandwidth alliance backblaze'], agent: backblazeAgent },

    // ── Tier 6/7: Original Cloud & Language Experts ───────────────────────────
    { keywords: ['aws', 'amazon web services', 'ec2', 's3', 'lambda', 'cloudformation', 'iam aws', 'eks', 'cdk'], agent: awsAgent },
    { keywords: ['gcp', 'google cloud', 'cloud run', 'bigquery', 'gke', 'pub/sub gcp', 'firebase', 'gcs'], agent: gcpAgent },
    { keywords: ['azure', 'microsoft azure', 'aks', 'azure devops', 'arm template', 'azure ad', 'bicep'], agent: azureAgent },
    { keywords: ['typescript', 'ts strict', 'type error', 'generic typescript', 'interface typescript', 'next.js'], agent: typescriptAgent },
    { keywords: ['python', 'asyncio', 'fastapi', 'django', 'pydantic', 'pip package', 'pep8', 'poetry'], agent: pythonAgent },
    { keywords: ['rust', 'borrow checker', 'lifetime rust', 'cargo', 'tokio', 'rust async', 'ownership rust'], agent: rustAgent },
    { keywords: ['golang', 'go lang', 'goroutine', 'channel go', 'grpc go', 'go mod', 'go routines'], agent: golangAgent },

    // ── Tier 17: Systems Languages ────────────────────────────────────────────
    { keywords: ['c language', 'c code', 'malloc', 'free memory', 'pointer arithmetic', 'c11', 'gcc clang', 'valgrind', 'posix c'], agent: cAgent },
    { keywords: ['c++', 'cpp', 'raii', 'smart pointer', 'unique_ptr', 'shared_ptr', 'stl', 'move semantics', 'template cpp', 'std::'], agent: cppAgent },
    { keywords: ['c#', 'csharp', 'dotnet', '.net', 'asp.net', 'entity framework', 'linq', 'blazor', 'nullable', 'nuget'], agent: csharpAgent },
    { keywords: ['java', 'jvm', 'spring boot', 'spring framework', 'maven', 'gradle java', 'hibernate', 'virtual threads', 'record java'], agent: javaAgent },
    { keywords: ['kotlin', 'coroutine', 'flow kotlin', 'kotlin multiplatform', 'kmp', 'ktor', 'android kotlin', 'compose'], agent: kotlinAgent },
    { keywords: ['swift', 'swiftui', 'xcode', 'ios development', 'macos app', 'actor swift', 'spm', 'vapor swift'], agent: swiftAgent },
    { keywords: ['zig', 'zig lang', 'comptime', 'zig allocator', 'zig error union', 'build.zig', 'zig cross compile'], agent: zigAgent },
    { keywords: ['nim', 'nim lang', 'nimble', 'nim macro', 'arc memory nim', 'nim compile', 'nim backend'], agent: nimAgent },

    // ── Tier 18: Dynamic / Scripting Languages ────────────────────────────────
    { keywords: ['ruby', 'rails', 'gem', 'rspec', 'activerecord', 'sidekiq', 'erb', 'rake', 'bundler', 'ruby metaprogramming'], agent: rubyAgent },
    { keywords: ['php', 'laravel', 'composer', 'symfony', 'psr', 'php8', 'eloquent', 'artisan', 'fiber php'], agent: phpAgent },
    { keywords: ['perl', 'moose perl', 'cpan', 'perl regex', 'bioperl', 'perl script', 'perl module'], agent: perlAgent },
    { keywords: ['r language', 'tidyverse', 'ggplot', 'dplyr', 'shiny', 'cran', 'r studio', 'data.table', 'purrr'], agent: rAgent },
    { keywords: ['julia', 'julia lang', 'flux.jl', 'juliahub', 'dataframes.jl', 'multiple dispatch julia', 'pluto.jl'], agent: juliaAgent },
    { keywords: ['matlab', 'simulink', 'octave', 'matlab toolbox', 'signal processing matlab', 'control systems matlab', 'fft matlab'], agent: matlabAgent },
    { keywords: ['powershell', 'pwsh', 'cmdlet', 'powershell module', 'dsc', 'pester', 'az powershell', 'ps1 script'], agent: powershellAgent },
    { keywords: ['groovy', 'gradle groovy', 'jenkinsfile', 'grails', 'gorm', 'groovy closure', 'spock test'], agent: groovyAgent },

    // ── Tier 19: Functional Languages ─────────────────────────────────────────
    { keywords: ['haskell', 'ghc', 'monad', 'type class haskell', 'lens haskell', 'servant haskell', 'cabal', 'functor haskell'], agent: haskellAgent },
    { keywords: ['elixir', 'phoenix', 'liveview', 'gen_server', 'supervisor elixir', 'ecto', 'otp elixir', 'mix elixir'], agent: elixirAgent },
    { keywords: ['erlang', 'otp erlang', 'beam', 'gen_server erlang', 'rebar3', 'mnesia', 'erlang actor', 'exit signal'], agent: erlangAgent },
    { keywords: ['scala', 'akka', 'cats effect', 'zio', 'spark scala', 'typelevel', 'sbt', 'implicit scala', 'scala 3'], agent: scalaAgent },
    { keywords: ['f#', 'fsharp', 'computation expression', 'discriminated union', 'fable', 'giraffe fsharp', 'elmish'], agent: fsharpAgent },
    { keywords: ['ocaml', 'dune ocaml', 'lwt', 'eio', 'ocaml module', 'functor ocaml', 'opam', 'dream ocaml'], agent: ocamlAgent },
    { keywords: ['clojure', 'clojurescript', 're-frame', 'datomic', 'core.async', 'reagent', 'leiningen', 'ring clojure'], agent: clojureAgent },
    { keywords: ['racket', 'scheme', 'racket macro', 'continuation', 'call/cc', 'typed racket', 'plt scheme', 'drracket'], agent: racketAgent },

    // ── Tier 20: Legacy, Specialized & Esoteric Languages ─────────────────────
    { keywords: ['cobol', 'mainframe', 'cics', 'vsam', 'jcl', 'cobol program', 'z/os', 'packed decimal', 'gnucobol'], agent: cobolAgent },
    { keywords: ['fortran', 'fortran 90', 'fortran hpc', 'openmp', 'mpi fortran', 'lapack', 'blas', 'do concurrent'], agent: fortranAgent },
    { keywords: ['ada', 'spark ada', 'ravenscar', 'gnat', 'protected object', 'ada tasking', 'do-178', 'iec 61508'], agent: adaAgent },
    { keywords: ['assembly', 'assembler', 'x86', 'x86-64', 'arm64', 'aarch64', 'nasm', 'sse simd', 'avx', 'risc-v asm'], agent: assemblyAgent },
    { keywords: ['objective-c', 'objc', 'cocoa', 'uikit foundation', 'ns prefix', 'arc objective', 'ios legacy', 'xcode objc'], agent: objcAgent },
    { keywords: ['crystal', 'crystal lang', 'lucky framework', 'shards crystal', 'crystal macro', 'fiber crystal'], agent: crystalAgent },
    { keywords: ['lua', 'luajit', 'openresty lua', 'love2d', 'roblox lua', 'metatable', 'luarocks', 'nginx lua'], agent: luaAgent },
    { keywords: ['apl', 'j language', 'k language', 'kdb', 'array language', 'dyalog', 'tacit programming'], agent: aplAgent },
    { keywords: ['vhdl', 'verilog', 'systemverilog', 'fpga', 'rtl design', 'hdl', 'vivado', 'quartus', 'uvm testbench'], agent: vhdlAgent },
    { keywords: ['apex', 'salesforce', 'soql', 'sosl', 'trigger apex', 'lwc lightning', 'flow salesforce', 'visualforce'], agent: apexAgent },
    { keywords: ['abap', 'sap', 'abap oo', 'cds view', 'rap abap', 'bapi', 'rfc abap', 's/4hana', 'alv grid'], agent: abapAgent },
    { keywords: ['prolog', 'swiprolog', 'logic programming', 'clpfd', 'backtracking', 'unification', 'dcg prolog', 'horn clause'], agent: prologAgent },
    { keywords: ['dart', 'dart lang', 'isolate dart', 'dart ffi', 'dart record', 'dart pattern', 'pub.dev', 'dart stream'], agent: dartAgent },
    { keywords: ['wolfram', 'mathematica', 'wolfram language', 'symbolic math', 'wolfram alpha', 'mathematica notebook', 'wolfram cloud'], agent: wolframAgent },
    { keywords: ['pl/sql', 'plsql', 't-sql', 'tsql', 'stored procedure', 'oracle package', 'cursor plsql', 'bulk collect', 'sql server proc'], agent: plsqlAgent },

    // ── Phases 7-10: Industry Vertical Specialists ────────────────────────────
    // Real Estate & PropTech (Phase 7)
    { keywords: ['zillow', 'mls listing', 'bridge interactive', 'zestimate', 'walk score', 'greatschools', 'real estate api'], agent: zillowAgent },
    { keywords: ['buildium', 'property management', 'rental property', 'tenant management', 'lease management', 'rent collection', 'maintenance request', 'property accounting'], agent: buildiumAgent },
    { keywords: ['procore', 'construction management', 'rfi construction', 'submittal', 'daily log construction', 'punch list', 'change order', 'construction budget'], agent: procoreAgent },
    { keywords: ['guesty', 'short term rental', 'airbnb management', 'str reservation', 'channel manager', 'vacation rental', 'dynamic pricing rental', 'cleaning task'], agent: guestyAgent },
    { keywords: ['attom', 'property data', 'property avm', 'automated valuation', 'comparable sales', 'cma real estate', 'hazard risk', 'flood risk property', 'property demographics'], agent: attomAgent },

    // EdTech & Education (Phase 8)
    { keywords: ['canvas lms', 'canvas api', 'instructure', 'lti', 'grade passback', 'canvas assignment', 'canvas course', 'canvas quiz'], agent: canvasLmsAgent },
    { keywords: ['google classroom', 'classroom api', 'coursework', 'google education', 'pub/sub classroom', 'classroom submission'], agent: googleClassroomAgent },
    { keywords: ['zoom sdk', 'zoom meeting sdk', 'zoom video sdk', 'zoom oauth', 'zoom webhook', 'zoom webinar', 'zoom recording'], agent: zoomSdkAgent },
    { keywords: ['brightspace', 'd2l', 'desire2learn', 'brightspace api', 'le api', 'lp api', 'scorm brightspace', 'bdp analytics'], agent: brightspaceAgent },

    // FinTech depth (Phases 8+10)
    { keywords: ['alpha vantage', 'technical indicator', 'rsi macd', 'bbands', 'fundamental analysis', 'forex api', 'stock indicator', 'news sentiment financial'], agent: alphaVantageAgent },
    { keywords: ['stripe treasury', 'financial account', 'inbound transfer', 'outbound payment', 'stripe issuing', 'virtual card issuing', 'baas stripe', 'embedded finance', 'card spending limit'], agent: stripeTreasuryAgent },

    // Gaming depth (Phase 10)
    { keywords: ['agora', 'real-time voice gaming', 'in-game voice chat', 'agora rtc', 'spatial audio', 'agora token', 'cloud recording agora', 'rtmp gaming'], agent: agoraAgent },

    // Cybersecurity (Phase 9)
    { keywords: ['virustotal', 'virus total', 'malware scan', 'yara rule', 'threat intelligence', 'ioc scan', 'behavioral analysis malware', 'livehunt'], agent: virusTotalAgent },
    { keywords: ['shodan', 'attack surface', 'shodan search', 'host lookup port', 'asm scanning', 'internet exposure', 'shodan alert', 'exploit database osint'], agent: shodanAgent },
    { keywords: ['crowdstrike', 'falcon edr', 'crowdstrike detection', 'rtr command', 'host containment', 'crowdstrike ioc', 'edr agent', 'threat intel crowdstrike'], agent: crowdStrikeAgent },
    { keywords: ['splunk', 'spl query', 'splunk hec', 'splunk alert', 'siem splunk', 'kv store splunk', 'splunk soar', 'log analytics siem'], agent: splunkAgent },
    { keywords: ['haveibeenpwned', 'hibp', 'pwned passwords', 'breach check', 'email breach', 'k-anonymity password', 'domain breach monitoring'], agent: hibpAgent },

    // Marketing & Analytics (Phase 9 / Existing)
    { keywords: ['hubspot', 'hubspot crm', 'hubspot deal', 'hubspot contact', 'hubspot workflow', 'hubspot form', 'hapi hubspot'], agent: hubspotAgent },
    { keywords: ['klaviyo', 'klaviyo flow', 'klaviyo campaign', 'klaviyo profile', 'email marketing automation', 'abandoned cart email', 'sms marketing klaviyo'], agent: klaviyoAgent },
    { keywords: ['anthropic', 'claude', 'claude-3', 'claude-3.5', 'claude sonnet', 'claude haiku', 'claude opus', 'tool use claude', 'messages api anthropic', 'constitutional ai'], agent: anthropicAgent },
    // DevSecOps vertical (v4.1.0)
    { keywords: ['snyk', 'snyk test', 'dependency vulnerability', 'sca scan', 'snyk open source', 'cve npm', 'snyk code', 'snyk container', 'snyk iac', 'vulnerability remediation'], agent: snykAgent },
    { keywords: ['semgrep', 'sast', 'static analysis', 'semgrep rule', 'code scanning sast', 'taint analysis', 'semgrep ci', 'owasp top ten sast', 'custom semgrep'], agent: semgrepAgent },
    { keywords: ['sonarqube', 'sonarcloud', 'code quality', 'quality gate', 'code smell', 'sonar scanner', 'sonar project', 'technical debt sonar', 'coverage sonarcloud'], agent: sonarqubeAgent },
    { keywords: ['owasp zap', 'zap scan', 'dast', 'dynamic analysis', 'web app penetration', 'zaproxy', 'active scan zap', 'passive scan zap', 'zap api scan', 'zap baseline'], agent: owaspZapAgent },
    { keywords: ['veracode', 'application security veracode', 'appsec scan', 'veracode pipeline', 'veracode sast', 'veracode sca', 'pipeline scan veracode', 'veracode findings api'], agent: veracodeAgent },
    // Supply Chain & Logistics vertical (v4.1.0)
    { keywords: ['fedex', 'fedex api', 'shipping label', 'fedex rate quote', 'fedex tracking', 'fedex shipment', 'fedex pickup', 'fedex ground', 'fedex overnight'], agent: fedexAgent },
    { keywords: ['shipbob', 'fulfillment api', 'ecommerce fulfillment', 'warehouse api', 'shipbob order', 'shipbob inventory', '3pl api', 'fulfillment center api'], agent: shipbobAgent },
    { keywords: ['flexport', 'freight forwarding', 'ocean freight api', 'bill of lading api', 'flexport shipment', 'air freight api', 'incoterms api', 'flexport booking', 'container tracking api'], agent: flexportAgent },
    { keywords: ['sap ariba', 'ariba', 'procurement api', 'purchase order api', 'ariba network', 'ariba invoice', 'ariba supplier', 'ariba requisition', 'ariba discovery', 'sap procurement'], agent: sapAribaAgent },
    // AgriTech vertical (v4.2.0)
    { keywords: ['john deere', 'john deere api', 'deere operations center', 'field boundary api', 'machine telemetry agriculture', 'prescription map', 'as-applied map', 'isoxml agriculture'], agent: johnDeereAgent },
    { keywords: ['trimble ag', 'trimble agriculture', 'trimble farm', 'trimble gnss', 'rtk agriculture', 'farm works', 'precision agriculture trimble', 'trimble field data'], agent: trimbleAgAgent },
    { keywords: ['climate corporation', 'fieldview api', 'climate fieldview', 'ndvi imagery', 'yield prediction api', 'gdd growing degree days', 'field weather api', 'satellite crop imagery'], agent: climateCorpAgent },
    // Energy & Utilities vertical (v4.2.0)
    { keywords: ['siemens mindsphere', 'mindsphere', 'iiot platform siemens', 'industrial iot api', 'asset management iiot', 'time series iiot', 'anomaly detection iiot', 'mindconnect'], agent: siemensMindSphereAgent },
    { keywords: ['osdu', 'open subsurface data universe', 'subsurface data', 'witsml', 'segy seismic', 'wellbore api', 'oil gas data platform', 'energy data platform azure'], agent: osduAgent },
    { keywords: ['ocpp', 'ev charging api', 'electric vehicle charging', 'ocpi roaming', 'openadr demand response', 'v2g vehicle to grid', 'charge point management', 'ev grid integration', 'eia api energy'], agent: evGridAgent },
    // Auto & Manufacturing vertical (v4.2.0)
    { keywords: ['connected vehicle api', 'volkswagen api', 'weconnect api', 'mercedes api', 'bmw api', 'obd-ii', 'j1939 can bus', 'vehicle telematics', 'automotive digital services', 'opc-ua manufacturing'], agent: automotiveDigitalAgent },
    // Agent Quality (v4.3.0)
    { keywords: ['promptfoo', 'llm evaluation', 'agent quality scoring', 'prompt testing', 'ab test preamble', 'llm red team', 'prompt assertion', 'model comparison eval', 'ai regression testing'], agent: promptfooAgent },
    // Enterprise Governance (v5.0.0)
    { keywords: ['policy as code', 'opa', 'rego policy', 'open policy agent', 'soc2 audit', 'audit trail llm', 'sso saml', 'oidc enterprise', 'rbac policy', 'gdpr compliance api', 'data residency', 'immutable audit log'], agent: enterpriseGovernanceAgent },
    // Vision-to-UI (v6.0.0)
    { keywords: ['screenshot to code', 'wireframe to react', 'figma to code', 'vision to ui', 'ui from image', 'design to component', 'swiftui from screenshot', 'compose from wireframe', 'wcag accessibility audit component'], agent: visionToUIAgent },
    // Phase 25 — The Omniscient FinOps
    { keywords: ['finops', 'cost arbitrage', 'cloud migration cost', 'carbon intensity', 'green software', 'spot instance pricing', 'multi-cloud cost'], agent: finopsAgent },
    // Phase 26 — The Synthetic Demographics
    { keywords: ['synthetic user', 'ux research', 'playwright persona', 'simulated human', 'dark pattern', 'accessibility audit', 'headless browser validation'], agent: syntheticUserAgent },
    // Phase 27 — The Cryptographic Vanguard
    { keywords: ['quantumsec', 'post-quantum cryptography', 'pqc', 'legacy crypto', 'md5', 'sha1', 'des', 'weak cipher', 'cryptographic auditor'], agent: quantumSecAgent },
    // Phase 28 — The Physical Bridge
    { keywords: ['hardware', 'firmware', 'esp32', 'arduino', 'ota deploy', 'mqtt iot', 'raspberry pi', 'embedded c++', 'freertos', 'platformio'], agent: hardwareAgent },
    // Phase 31 — The Legal Oracle
    { keywords: ['legal', 'eula', 'ip protection', 'software patent', 'gpl contamination', 'open source license', 'copyleft', 'legal terms'], agent: legalAgent },
    // Open-Inspect Background Agent
    { keywords: ['background agent', 'open-inspect', 'open inspect', 'multiplayer session', 'background task', 'long-running agent'], agent: backgroundAgent },
    // PentAGI Deep Security Pentesting
    { keywords: ['pentagi', 'deep penetration testing', 'autonomous security', 'red team container', 'sandbox pentest', 'vulnerability scan full'], agent: pentagiAgent },
    // FossFLOW Isometric Architecture Designer
    { keywords: ['fossflow', 'architecture diagram', 'isometric map', 'system design visualization', 'diagram tool', 'isoflow'], agent: fossflowAgent },
    // Phase 46 — Extreme Vertical Expansion
    { keywords: ['ncbi', 'pubmed', 'genbank', 'dbsnp', 'bioinformatics', 'entrez'], agent: ncbiAgent },
    { keywords: ['ensembl', 'ebi', 'variant effect predictor', 'vep', 'orthologs', 'gene tree'], agent: ensemblAgent },
    { keywords: ['illumina', 'basespace', 'fastq analysis', 'clinical sequencing', 'genomic dataset'], agent: illuminaAgent },
    { keywords: ['seven bridges', 'velsera', 'cwl pipeline', 'tcga data', 'cancer genomics cloud', 'cloud compute genomics'], agent: sevenbridgesAgent },
    { keywords: ['nasa api', 'apod', 'neows', 'earth observatory', 'tle satellite', 'satellite tracking'], agent: nasaAgent },
    { keywords: ['maxar', 'securewatch', 'ard', 'geospatial imagery', 'eo satellite', 'electro-optical', 'satellite tasking'], agent: maxarAgent },
    { keywords: ['spire global', 'satellite ais', 'ads-b maritime', 'radio occultation', 'weather tracking spire'], agent: spireAgent },
    { keywords: ['spacex', 'starlink enterprise', 'starlink latency', 'starlink telemetry', 'satellite bandwidth management'], agent: starlinkAgent },
    { keywords: ['data.gov', 'ckan api', 'open data portal', 'municipal metadata', 'federal dataset', 'federal open data'], agent: datagovAgent },
    { keywords: ['openfema', 'fema disaster', 'nfip policy', 'hazard mitigation', 'civic technology', 'national flood insurance'], agent: openfemaAgent },
    { keywords: ['irs api', 'ein verification', 'form 990', 'teos', 'tax exempt organization search', 'non-profit financial'], agent: irsAgent },
    { keywords: ['ticketmaster api', 'discovery api', 'event seating chart', 'concert venue', 'ticket availability map'], agent: ticketmasterAgent },
    { keywords: ['eventbrite api', 'event organizer management', 'ticketing eventbrite', 'attendee webhook', 'check-in eventbrite'], agent: eventbriteAgent },
    { keywords: ['seatgeek platform', 'secondary market ticket', 'ticket aggregation', 'performer popularity metric'], agent: seatgeekAgent },
    // Phase 47 — Unprecedented Vertical Expansion
    { keywords: ['shippo', 'shipping rates api', 'shipping label', 'multi-carrier', 'tracking webhook'], agent: shippoAgent },
    { keywords: ['samsara', 'fleet management', 'dashcam telematics', 'eld compliance', 'vehicle tracking'], agent: samsaraAgent },
    { keywords: ['amadeus', 'gds', 'flight booking', 'hotel search', 'travel pricing', 'flight offers'], agent: amadeusAgent },
    { keywords: ['uber api', 'uber direct', 'uber rides', 'ride hailing', 'delivery dispatch'], agent: uberAgent },
    { keywords: ['skyscanner', 'flight live pricing', 'travel affiliate', 'indicative pricing'], agent: skyscannerAgent },
    { keywords: ['smartcar', 'connected car', 'odometer api', 'ev battery status', 'vehicle lock unlock'], agent: smartcarAgent },
    { keywords: ['chargepoint', 'ev charging api', 'ocpi', 'evse', 'charging session'], agent: chargepointAgent },
    { keywords: ['tesla fleet api', 'tesla telemetry', 'vehicle sleep state', 'powerwall api'], agent: teslaAgent },
    { keywords: ['myjohndeere', 'john deere api', 'agronomic data', 'tractor telemetry'], agent: myjohndeereAgent },
    { keywords: ['climate fieldview', 'yield mapping', 'digital agriculture', 'agronomy api'], agent: climatefieldviewAgent },
    { keywords: ['planet labs', 'planetscope', 'ndvi', 'satellite imagery agriculture'], agent: planetlabsAgent },
    { keywords: ['watttime', 'moer', 'grid emissions', 'load shifting', 'carbon intensity'], agent: watttimeAgent },
    { keywords: ['enphase', 'microinverter', 'solar generation telemetry', 'encharge battery'], agent: enphaseAgent },
    { keywords: ['persefoni', 'carbon footprint', 'esg reporting', 'scope 3 emissions'], agent: persefoniAgent },
    // Phase 48 — Hyper-Vertical Deepening
    { keywords: ['onfleet', 'last-mile delivery', 'driver routing', 'eta calculations'], agent: onfleetAgent },
    { keywords: ['sabre', 'sabre gds', 'pnr creation', 'flight search algorithm'], agent: sabreAgent },
    { keywords: ['geotab', 'commercial fleet telematics', 'obd-ii logging', 'mygeotab'], agent: geotabAgent },
    { keywords: ['cropin', 'predictive crop intelligence', 'yield estimation', 'farm operations'], agent: cropinAgent },
    { keywords: ['nrel api', 'pvwatts', 'alternative fuel stations', 'solar irradiance'], agent: nrelAgent },
    { keywords: ['yodlee', 'envestnet yodlee', 'fastlink', 'account aggregation', 'pfm'], agent: yodleeAgent },
    { keywords: ['epic interconnect', 'mychart sync', 'soarian scheduling', 'fhir r4 clinical notes'], agent: epicMychartAgent },
    { keywords: ['epic online services', 'eos auth', 'peer-to-peer matchmaking', 'gamefi lobby'], agent: epicOnlineServicesAgent },
    { keywords: ['magento', 'adobe commerce', 'msi inventory', 'magento 2 rest', 'magento graphql'], agent: magentoAgent },
    { keywords: ['tuya', 'tuya smart home', 'tuya iot', 'pulsar message queue'], agent: tuyaAgent },
    { keywords: ['costar', 'commercial real estate data', 'rent comps', 'loopnet', 'cre database'], agent: costarAgent },
    // scorm missing anomaly fixed
    { keywords: ['moodle lms', 'moodle web services', 'moodle course creation', 'sis enrollment'], agent: moodleAgent },
    { keywords: ['ironclad', 'contract lifecycle management', 'clm', 'ironclad workflow'], agent: ironcladAgent },
    { keywords: ['mux', 'video transcoding', 'live streaming', 'hls playback telemetry'], agent: muxAgent },
    { keywords: ['workday', 'workday hcm', 'workday report', 'isu integration'], agent: workdayAgent },
    { keywords: ['tenable', 'nessus vulnerability', 'vulnerability management', 'tenable io'], agent: tenableAgent },
    { keywords: ['marketo', 'marketo engage', 'marketing automation lead', 'munchkin id'], agent: marketoAgent },
    { keywords: ['rcsb pdb', 'protein data bank', 'macromolecular structure', 'bioinformatics'], agent: rcsbPdbAgent },
    { keywords: ['copernicus', 'esa sentinel', 'open access hub', 'sentinel imagery'], agent: esaCopernicusAgent },
    { keywords: ['census', 'us census bureau', 'american community survey', 'fips geography'], agent: censusGovAgent },
    { keywords: ['stubhub', 'secondary ticket market', 'stubhub inventory', 'sales reporting'], agent: stubhubAgent },
    // Phase 49 — Strategic VIP Integrations
    { keywords: ['brex api', 'corporate card', 'expense management', 'brex virtual card', 'vendor payment'], agent: brexAgent },
    { keywords: ['cerner millennium', 'cerner ignite', 'smart on fhir cerner', 'patient roster cerner'], agent: cernerAgent },
    { keywords: ['roblox open cloud', 'roblox api', 'roblox datastore', 'roblox messagingservice'], agent: robloxCloudAgent },
    { keywords: ['shopify hydrogen', 'shopify headless', 'oxygen deployment', 'storefront graphql'], agent: shopifyHydrogenAgent },
    { keywords: ['balenacloud', 'balena api', 'edge container deployment', 'fleet management'], agent: balenaAgent },
    { keywords: ['yardi voyager', 'yardi elevate', 'property management standard interfaces', 'commercial rent roll'], agent: yardiAgent },
    { keywords: ['blackboard learn api', 'blackboard rest', 'blackboard lti advantage', 'higher ed sis'], agent: blackboardAgent },
    { keywords: ['everlaw', 'everlaw api', 'ediscovery cloud', 'litigation software'], agent: everlawAgent },
    { keywords: ['frame.io', 'frameio api', 'video collaboration', 'timestamped comment video'], agent: frameioAgent },
    { keywords: ['lattice hr', 'lattice api', 'okr tracking', 'performance review cycle'], agent: latticeAgent },
    { keywords: ['auth0 management api', 'auth0 actions', 'enterprise ciam', 'auth0 identity'], agent: auth0Agent },
    { keywords: ['iterable api', 'iterable webhook', 'cross-channel engagement', 'iterable custom event'], agent: iterableAgent },
    { keywords: ['benchling api', 'benchling r&d', 'dna sequence registry', 'digital lab notebook', 'eln integration'], agent: benchlingAgent },
    { keywords: ['capella space', 'synthetic aperture radar', 'sar satellite tasking', 'stac catalog radar'], agent: capellaAgent },
    { keywords: ['usaspending', 'usaspending api', 'federal contract transparency', 'grant tracking usaspending'], agent: usaspendingAgent },
    { keywords: ['live nation api', 'ticketmaster enterprise', 'festival scalability map', 'dynamic ticket pricing'], agent: liveNationAgent },
    { keywords: ['project44', 'project44 api', 'advanced visibility platform', 'ocean freight tracking', 'truckload eta'], agent: project44Agent },
    { keywords: ['hopper cloud', 'hopper api', 'fintech travel', 'price freeze hopper', 'predictive travel volatile'], agent: hopperAgent },
    { keywords: ['rivian fleet api', 'rivian edv', 'electric commercial van', 'ev state of charge', 'rivian telematics'], agent: rivianAgent },
    { keywords: ['trimble ag', 'trimble agriculture api', 'tractor path planning', 'field boundary rtk'], agent: trimbleAgent },
    { keywords: ['octopus energy api', 'kraken energy api', 'smart meter half-hourly', 'agile tariff pricing'], agent: octopusEnergyAgent },
    // Phase 53 — Vertical Immersion
    { keywords: ['chainalysis', 'kyt', 'blockchain forensics', 'illicit crypto', 'aml transaction', 'utxo tracing', 'ofac wallet'], agent: chainalysisAgent_i },
    { keywords: ['dicom', 'dicomweb', 'pacs', 'wado-rs', 'qido-rs', 'stow-rs', 'medical imaging', 'dicom de-identification'], agent: dicomImagingAgent_i },
    { keywords: ['open match', 'mmf matchmaking', 'match function', 'director agones', 'multiplayer matchmaking', 'player ticket'], agent: openMatchAgent_i },
    { keywords: ['sap ariba api', 'supplier risk', 'duns number d&b', 'dun and bradstreet', 'esg supplier', 'supply chain resilience'], agent: supplierRiskAgent_i },
    { keywords: ['twinmaker', 'aws iot twinmaker', 'digital twin', 'sitewise twinmaker', '3d overlay iot', 'knowledge graph iot'], agent: twinMakerAgent_i },
    { keywords: ['zoneomics', 'municipal zoning', 'far floor area ratio', 'setback restriction', 'proptech mapping', 'gridics'], agent: zoneOmicsAgent_i },
    { keywords: ['proctorio', 'honorlock', 'ai proctoring', 'gaze tracking lms', 'lockdown browser', 'lti 1.3 proctoring'], agent: proctorAiAgent_i },
    { keywords: ['uspto api', 'prior art search', 'trademark tsdr', 'peds patent', 'office action patent', 'trademark collision'], agent: usptoIpAgent_i },
    { keywords: ['songtrust', 'ascap bmi', 'isrc iswc', 'mechanical split royalty', 'performance royalty', 'fractional publishing'], agent: songtrustAgent_i },
    { keywords: ['check hq payroll', 'gusto embedded', 'multi-state tax withholding', 'w2 1099 compliance', 'wage garnishment api'], agent: checkHqPayrollAgent_i },
    { keywords: ['okta api', 'zero trust', 'okta saml', 'scim 2.0 provisioning', 'okta inline hook', 'okta conditional access'], agent: oktaIdentityAgent_i },
    { keywords: ['brandwatch', 'meltwater api', 'social listening', 'sentiment analysis pr', 'brand crisis alert', 'nlp tweet'], agent: brandwatchAgent_i },
    { keywords: ['schrodinger', 'ligand docking', 'molecular dynamics trajectory', 'rdkit smiles', 'protein data bank docking', 'htvs screening'], agent: schrodingerAgent_i },
    { keywords: ['dronedeploy', 'dji sdk', 'orthomosaic drone', 'photogrammetry mapping', 'geotiff elevation model', 'drone flight path'], agent: droneDeployAgent_i },
    { keywords: ['netafim', 'precision fertigation', 'drip irrigation api', 'evapotranspiration algorithm', 'soil moisture sensor'], agent: netafimAgent_i },

    // Phase 54 — The Final Frontier
    { keywords: ['fedramp', 'disa stig', 'oscal', 'fisma', 'cisa zero trust', 'govcloud'], agent: federalRampAgent_i },
    { keywords: ['blackrock aladdin', 'fix protocol', 'algorithmic trading', 'portfolio risk api', 'institutional wealth'], agent: blackrockAladdinAgent_i },
    { keywords: ['unreal engine server', 'metahuman sdk', 'ugc gaming api', 'spatial computing backend', 'pixel streaming'], agent: epicGamesMetaverseAgent_i },
    { keywords: ['mindbody api', 'classpass integration', 'boutique fitness crm', 'wellness scheduling', 'franchise pos'], agent: mindbodyAgent_i },
    { keywords: ['clear biometric', 'tsa precheck api', 'digital boarding pass', 'verifiable credential travel', 'decentralized identity wallet'], agent: clearIdentityAgent_i },
    { keywords: ['guidewire api', 'property casualty claim', 'insurtech underwriting', 'first notice of loss', 'actuarial api'], agent: guidewireAgent_i },
    { keywords: ['blackbaud api', 'raisers edge nxt', 'ngo fundraising', 'donor management crm', 'philanthropy api'], agent: blackbaudAgent_i },
    { keywords: ['electronic bill of lading', 'maersk api', 'terminal operating system', 'maritime vessel tracking', 'container drayage'], agent: maerskAgent_i },
    { keywords: ['veeva vault', 'ctms clinical trial', 'fda 21 cfr part 11', 'pharmaceutical crm', 'edc electronic data capture'], agent: veevaSystemsAgent_i },
    { keywords: ['plaid identity', 'kyc aml verification', 'open banking api', 'micro-deposit verification', 'bank oauth'], agent: plaidIdentityAgent_i },

    // Phase 55 — The Capstone Expansion
    { keywords: ['sap s4hana', 'abap code', 'odata v4 api sap', 'bapi integration', 'sap fiori'], agent: sapS4HanaAgent_i },
    { keywords: ['nvidia omniverse', 'usd protocol', 'physics simulation ai', 'rtx rendering node', 'isaac sim'], agent: nvidiaOmniverseAgent_i },
    { keywords: ['solana anchor', 'rust smart contract', 'pda derivation', 'spl token', 'solana rpc'], agent: solanaRustAgent_i },
    { keywords: ['ffmpeg transcode', 'hls stream', 'mpeg dash bitrate', 'cuda video scaling', 'srt protocol'], agent: ffmpegMediaAgent_i },
    { keywords: ['hl7v2 fhir r4', 'smart on fhir', 'epic app orchard', 'cerner ignite api', 'patient phi'], agent: hl7FhirAgent_i },
    { keywords: ['ros2 dds', 'gazebo simulation', 'robot kinematics', 'ros2 publisher subscriber', 'nav2 stack'], agent: ros2RoboticsAgent_i },
    { keywords: ['autodesk forge', 'revit api', 'bim 360', 'cad viewer webgl', 'ifc format'], agent: autodeskForgeAgent_i },
    { keywords: ['stripe treasury', 'stripe issuing', 'embedded finance api', 'baas banking', 'payment reconciliation'], agent: stripeTreasuryAgent_i },
    { keywords: ['salesforce apex', 'soql limit', 'lightning web component', 'salesforce batchable', 'sfdx cli'], agent: salesforceApexAgent_i },
    { keywords: ['webrtc sfu', 'mediasoup node', 'stun turn server', 'spatial audio voip', 'sdp negotiation'], agent: webrtcSfuAgent_i },
    { keywords: ['gdpr right to be forgotten', 'pii encryption', 'cross border data transfer', 'data localization', 'ccpa compliance'], agent: gdprComplianceAgent_i },
    { keywords: ['huggingface inference', 'lora fine tuning', 'vllm deploy', 'gguf quantization', 'transformer model'], agent: huggingfaceHubAgent_i },

    // Phase 56 — The Hyper-Specialization Expansion
    { keywords: ['qiskit circuit', 'bloch sphere', 'quantum entanglement gate', 'shor algorithm', 'qasm compiler'], agent: qiskitQuantumAgent_i },
    { keywords: ['planet labs api', 'gdal raster', 'synthetic aperture radar sar', 'geotiff bounding box', 'ndvi calculation'], agent: planetGeospatialAgent_i },
    { keywords: ['openadr protocol', 'virtual power plant vpp', 'load shedding smart grid', 'der dispatch', 'grid frequency regulation'], agent: openAdrSmartGridAgent_i },
    { keywords: ['fpga high frequency trading', 'verilog limit order book', 'vhdl nanosecond latency', 'pcap network parsing', 'market data feed handler'], agent: fpgaHftTradingAgent_i },
    { keywords: ['nextflow pipeline', 'bwa mem genome', 'fastq variant call format', 'snpeff annotation', 'bioinformatics dag'], agent: nextflowGenomicsAgent_i },
    { keywords: ['rust wasm32-wasi', 'webassembly component model', 'wasmedge runtime', 'wasi-preview2', 'wasm bindgen'], agent: wasmWasiAgent_i },
    { keywords: ['ghidra script python', 'x86 decompilation', 'arm assembly reverse engineer', 'elf binary unpacking', 'ida pro flair'], agent: ghidraReversingAgent_i },
    { keywords: ['ccsds space packet', 'nasa ammos', 'satellite telemetry decoding', 'deep space network dsn', 'flight software frames'], agent: ccsdsTelemetryAgent_i },
    { keywords: ['ocpp 2.0.1', 'evse charge point', 'v2g vehicle to grid', 'iso 15118 plug and charge', 'smart charging profile'], agent: ocppEvChargingAgent_i },
    { keywords: ['zephyr rtos device tree', 'freertos mutex', 'arm cortex-m bare metal', 'hal abstraction', 'i2c spi driver'], agent: zephyrRtosAgent_i },
    { keywords: ['pdal pipeline', 'las laz point cloud', 'colmap photogrammetry', 'lidar ground decimation', 'pcl registration'], agent: pdalPointcloudAgent_i },
    { keywords: ['quantlib python', 'black scholes merton', 'monte carlo option pricing', 'yield curve bootstrapping', 'stochastic volatility volterra'], agent: quantlibPricingAgent_i },
    { keywords: ['sbol synthetic biology', 'crispr cas9 plasmid', 'biocad design', 'dna sequence compilation', 'genetic circuit'], agent: sbolSyntheticBioAgent_i },
    { keywords: ['opc ua server', 'modbus tcp rtu', 'scada plc logic', 'siemens s7 protocol', 'industrial iot gateway'], agent: opcuaScadaAgent_i },
    { keywords: ['fully homomorphic encryption', 'fhe microsoft seal', 'tfhe scheme', 'ckks bfv bgv', 'ciphertext computation'], agent: homomorphicEncryptionAgent_i },

    // Phase 57 — The 200-Agent Ascendancy (Final Milestone)
    { keywords: ['qnx neutrino rtos', 'autosar classic adaptive', 'misra-c safety', 'can fd bus', 'adas infotainment microkernel'], agent: qnxAutosarAgent_i },
    { keywords: ['vasp density functional theory', 'dft poscar', 'projector augmented wave paw', 'materials science lattice', 'phonon dispersion'], agent: vaspMaterialsAgent_i },
    { keywords: ['cesm climate model', 'fortran 90 atmospheric', 'navier stokes netcdf', 'cpl7 coupler', 'thermodynamic ocean albedo'], agent: cesmClimateAgent_i },
    { keywords: ['epics control system', 'tokamak plasma fusion', 'channel access pvs', 'magnetic confinement', 'particle accelerator ioc'], agent: epicsFusionAgent_i },
    { keywords: ['obspy miniseed', 'seismology waveform', 'tectonic p-wave s-wave', 'earthquake hypocenter', 'moment magnitude mw'], agent: obspySeismologyAgent_i },
    { keywords: ['openfoam cfd', 'computational fluid dynamics', 'blockmesh navierstokes', 'rans des turbulence', 'aerodynamic drag solver'], agent: openfoamCfdAgent_i },
    { keywords: ['intel loihi', 'spiking neural network snn', 'neuromorphic lava nengo', 'leaky integrate fire lif', 'stdp biological synapse'], agent: loihiNeuromorphicAgent_i },
    { keywords: ['gaussian .com', 'hartree fock dft', 'computational chemistry orbital', 'transition state irc', 'molecular basis set'], agent: gaussianChemistryAgent_i },
    { keywords: ['cern root c++', 'particle physics ttree', 'lhc higgs boson', 'monte carlo collision', 'invariant mass lorentz vector'], agent: rootCernAgent_i },
    { keywords: ['monai pytorch', 'medical imaging dicom', 'mri ct segmentation', 'unet vision transformer', 'nifti voxel hounsfield'], agent: monaiDicomAgent_i },
    { keywords: ['qiime2 16s rrna', 'metagenomics microbiome', 'dada2 asv', 'unifrac diversity', 'operational taxonomic unit otu'], agent: qiime2MetagenomicsAgent_i },
    { keywords: ['epimodel network', 'sir seir compartmental', 'epidemiology r0', 'disease transmission vector', 'stochastic outbreak'], agent: epimodelDiseaseAgent_i },
    { keywords: ['openbci eeg', 'brain computer interface', 'motor imagery cybernetics', 'independent component analysis ica', 'alpha wave notch filter'], agent: openbciEegAgent_i },
    { keywords: ['lorawan ttn gateway', 'agricultural iot', 'precision farming telemetry', 'fcc duty cycle ism', 'css spreading factor'], agent: lorawanAgtechAgent_i },
    { keywords: ['underwater rov auv', 'doppler velocity log dvl', 'hydroacoustic modem telemetry', 'deep sea robotics', 'sonar inertial measurement unit'], agent: acousticRovAgent_i },
    { keywords: ['openroad eda', 'vlsi rtl to gdsii', 'yosys logic synthesis', 'spice static timing analysis', 'semiconductor physical design'], agent: openroadEdaAgent_i },
    { keywords: ['dwdm optical transponder', 'raman edfa amplifier', 'layer 0 photonics', 'coherent 400g 16-qam', 'roadm sdn netconf'], agent: dwdmOpticalAgent_i },
    { keywords: ['arinc 429 avionics', 'do-178c dal-a certification', 'flight management computer', 'modified condition decision coverage', 'afdx strict multiplexing'], agent: arinc429AvionicsAgent_i },
    { keywords: ['stratum v2 protocol', 'antminer asic orchestration', 'sha-256 hashrate pool', 'proof of work nonce', 'merkle root block template'], agent: stratumMiningAgent_i },
    { keywords: ['iec 61850 protocol', 'goose sv messaging', 'power grid substation', 'protective relay digital twin', 'electrical phase angle scada'], agent: iec61850SubstationAgent_i },
    { keywords: ['slic3r g-code', 'fdm sla additive manufacturing', '3d printing kinematics', 'corexy non-planar toolpath', 'gyroid infill bridging'], agent: slic3r3dprintAgent_i },
    { keywords: ['gurobi solver', 'mixed integer linear programming milp', 'vehicle routing problem vrp', 'simplex operations research', 'capacitated network flow'], agent: gurobiOptimizationAgent_i },
    { keywords: ['volatility 3 forensics', 'malware rootkit memory dump', 'dfir unlinked process', 'vad physical pool tag', 'fileless powershell threat'], agent: volatilityForensicsAgent_i },
    { keywords: ['prophet actuarial model', 'stochastic cash flow liability', 'mortality decrement table', 'life insurance solvency ii', 'asset liability management alm'], agent: prophetActuarialAgent_i },
    { keywords: ['essentia dsp c++', 'music informatics mfcc', 'audio signal processing spectrogram', 'onset detection bpm', 'constant-q transform cqt'], agent: essentiaAudioAgent_i },
    { keywords: ['sumo traffic micro-simulation', 'urban gridlock traci', 'intelligent driver model idm', 'osm road graph trajectory', 'dynamic intersection routing'], agent: sumoTrafficAgent_i },
    { keywords: ['nltk python syntax', 'computational linguistics grammar', 'chomsky recursive descent parsing', 'part of speech pos lemma', 'context free dependency tree'], agent: nltkLinguisticsAgent_i },
    { keywords: ['hawk-eye cv', 'sports analytics kinematics', 'magnus effect deflection trajectory', 'openpose skeletal joint', 'high-speed camera calibration triangulaton'], agent: hawkeyeSportsAgent_i },
    { keywords: ['orekit java', 'astrodynamics ephemeris', 'two-line element tle', 'orbital mechanics perturbation', 'j2000 coordinate ecef satellite propagation'], agent: orekitAstrodynamicsAgent_i },
    { keywords: ['bb84 protocol', 'quantum key distribution qkd', 'photonic polarization rectilinear diagonal', 'cascade privacy amplification parity', 'photon number splitting pns decoy state'], agent: bb84QkdAgent_i },

    // Phase 34 — OSS Agent Armada Expansion II
    { keywords: ['vllm', 'pagedattention', 'continuous batching', 'tensor-parallel-size', 'gpu-memory-utilization'], agent: vllmAgent_i },
    { keywords: ['ollama', 'modelfile', 'local llm', 'ollama ps', 'ollama_origins', 'ollama_host'], agent: ollamaAgent_i },
    { keywords: ['huggingface transformers', 'automodelforcausallm', 'autotokenizer', 'bitsandbytes', 'device_map'], agent: hfTransformersAgent_i },
    { keywords: ['gguf', 'llama.cpp', 'quantization', 'lora merge', 'q4_k_m', 'q5_k_m', 'llama-server'], agent: ggufAgent_i },
    { keywords: ['dbt', 'data build tool', 'jinja macro', 'schema.yml', 'dbt test', 'incremental materialization'], agent: dbtAgent_i },
    { keywords: ['apache airflow', 'airflow dag', 'taskflow', 'xcoms', 'airflow operator'], agent: airflowAgent_i },
    { keywords: ['snowflake sql', 'snowpark', 'virtual warehouse', 'micro-partitions', 'auto_suspend', 'snowflake rbac'], agent: snowflakeAgent_i },
    { keywords: ['databricks', 'delta lake', 'pyspark', 'spark sql', 'unity catalog', 'auto loader'], agent: databricksAgent_i },
    { keywords: ['solidity', 'smart contract', 'evm', 'erc20', 'erc721', 'reentrancyguard', 'openzeppelin'], agent: solidityAgentV2_i },
    { keywords: ['hardhat', 'hardhat-deploy', 'hardhat config', 'chai matchers', 'hardhat-verify', 'hardhat tests'], agent: hardhatAgent_i },
    { keywords: ['ethers.js', 'ethers v6', 'ethereum provider', 'json-rpc provider', 'ethers wallet', 'contract abi'], agent: ethersAgent_i },
    { keywords: ['anchor framework', 'solana program', 'pda derivation', 'cpi wrapper', 'solana macro', 'anchor_spl'], agent: anchorAgent_i },

    // ── Deep Integration: Context Engineering, Deep Research, Vectorless RAG, Nano Agent ──
    { keywords: ['context engineering', 'context window', 'scratchpad pattern', 'selector agent', 'compressor agent', 'token budget', 'context distillery', 'agent skill', 'context optimization', 'multi-agent context', 'retrieval augmentation pattern'], agent: agentSkillsContextAgent },
    { keywords: ['deer-flow', 'deerflow', 'deep research', 'superagent harness', 'research harness', 'research agent', 'langgraph research', 'bytedance agent', 'long-running research', 'podcast script', 'multi-step research', 'research report generation'], agent: deerFlowAgent },
    { keywords: ['pageindex', 'page index', 'vectorless rag', 'vectorless retrieval', 'page-level rag', 'reasoning rag', 'no vector database', 'document index', 'rag without embeddings', 'page citation', 'document reasoning', 'reasoning based retrieval'], agent: pageIndexAgent },
    { keywords: ['nano agent', 'learn claude code', 'nano code agent', 'bash tool loop', 'tool call loop', 'bash agent', 'autonomous code execution', 'minimal agent', 'read write bash', 'iterative code agent', 'self-correcting agent', 'code agent pattern'], agent: learnClaudeCodeAgent },

    // ── Tier OS: Open Source Department (v7.7.0) ─────────────────────────────────
    // Frontend Frameworks
    { keywords: ['react hooks', 'usestate', 'usereducer', 'react context', 'react suspense', 'react server component', 'react query', 'tanstack query', 'jotai', 'zustand store', 'react memo', 'forwardref'], agent: reactOssAgent },
    { keywords: ['next.js', 'nextjs', 'app router nextjs', 'server action', 'next/image', 'next/font', 'next middleware', 'getserversideprops', 'next route handler', 'incremental static regeneration'], agent: nextjsOssAgent },
    { keywords: ['vue 3', 'vue composition api', 'script setup', 'defineprops', 'defineemits', 'pinia store', 'vue router v4', 'vue composable', 'nuxt 3', 'vueuse'], agent: vueOssAgent },
    { keywords: ['svelte 5', 'sveltekit', 'svelte runes', '$state svelte', '$derived', '$effect svelte', 'svelte form actions', 'svelte load', 'sveltekit routing'], agent: svelteOssAgent },
    { keywords: ['vite config', 'vite plugin', 'import.meta.env', 'vite hmr', 'vite build', 'rollup options manual chunks', 'vite library mode', 'vite bundler', 'vite resolve alias'], agent: viteOssAgent },

    // Backend Frameworks
    { keywords: ['fastapi', 'pydantic model', 'python async api', 'fastapi depends', 'fastapi router', 'fastapi middleware', 'fastapi background task', 'uvicorn asgi'], agent: fastapiOssAgent },
    { keywords: ['django orm', 'django rest framework', 'drf viewset', 'django model', 'django migration', 'django signal', 'django admin', 'celery django', 'django middleware'], agent: djangoOssAgent },
    { keywords: ['flask blueprint', 'flask route', 'flask sqlalchemy', 'flask jwt', 'flask migrate', 'flask errorhandler', 'flask before request', 'flask extension', 'gunicorn flask'], agent: flaskOssAgent },
    { keywords: ['express middleware', 'express router', 'express error handler', 'express session', 'multer upload', 'helmet express', 'cors express', 'express rate limit'], agent: expressOssAgent },
    { keywords: ['nestjs module', 'nestjs controller', 'nestjs provider', 'nestjs guard', 'nestjs pipe', 'nestjs interceptor', 'nestjs decorator', 'nestjs microservice', 'nestjs typeorm'], agent: nestjsOssAgent },
    { keywords: ['hono framework', 'hono context', 'hono middleware', 'hono cloudflare workers', 'hono bun server', 'hono zod validator', 'hono rpc', 'honojs'], agent: honoOssAgent },

    // AI / ML
    { keywords: ['pytorch tensor', 'torch.nn', 'pytorch dataset', 'pytorch dataloader', 'backward pass', 'gradient descent pytorch', 'pytorch lightning', 'cuda pytorch'], agent: pytorchOssAgent },
    { keywords: ['huggingface transformers', 'from_pretrained', 'lora fine tuning', 'peft training', 'huggingface pipeline', 'text generation model', 'bitsandbytes quantization', 'huggingface hub'], agent: huggingfaceOssAgent },
    { keywords: ['langchain chain', 'lcel pipe', 'langchain rag', 'runnable passthrough', 'langchain agent', 'langchain tool', 'langgraph', 'langchain memory', 'langchain retriever'], agent: langchainOssAgent },
    { keywords: ['ollama run', 'ollama api', 'ollama serve', 'local llm', 'modelfile ollama', 'ollama pull', 'llama local', 'ollama chat endpoint'], agent: ollamaOssAgent },

    // Databases & ORMs
    { keywords: ['prisma schema', 'prisma migrate dev', 'prisma client generate', 'prisma relation', '@relation prisma', 'prisma seeding'], agent: prismaOssAgent },
    { keywords: ['drizzle schema', 'drizzle-orm', 'drizzle query', 'drizzle migrate', 'drizzle-kit', 'drizzle transaction', 'drizzle infer', 'drizzle postgres'], agent: drizzleOssAgent },
    { keywords: ['supabase rpc', 'supabase.from', 'supabase auth signIn', 'supabase storage bucket', 'supabase realtime channel', 'supabase edge function', 'supabase rls policy'], agent: supabaseOssAgent },
    { keywords: ['redis set ex', 'redis hset', 'redis zadd', 'redis pipeline', 'redis streams xadd', 'redis pubsub', 'ioredis client', 'redlock distributed lock'], agent: redisOssAgent },
    { keywords: ['mongoose schema', 'mongoose model', 'mongodb aggregation', 'mongodb atlas', 'mongoose populate', 'mongodb change stream', 'mongodb index', 'mongoose middleware'], agent: mongodbOssAgent },

    // DevOps / Infrastructure
    { keywords: ['docker compose', 'docker build arg', 'multi stage docker', 'dockerfile entrypoint', 'docker volume', 'docker healthcheck', 'docker network', 'container registry'], agent: dockerOssAgent },
    { keywords: ['kubernetes deployment yaml', 'kubectl apply', 'pod disruption budget', 'horizontal pod autoscaler', 'kubernetes service', 'kubernetes ingress', 'kube secret', 'kube configmap'], agent: kubernetesOssAgent },
    { keywords: ['helm chart', 'helm values', 'helm template', 'helmfile', 'helm install', 'helm upgrade', 'helm rollback', 'chart.yaml', 'helm dependency'], agent: helmOssAgent },
    { keywords: ['terraform resource', 'terraform variable', 'terraform module', 'terraform backend s3', 'terraform plan apply', 'terraform locals', 'terraform data source', 'hcl config'], agent: terraformOssAgent },
    { keywords: ['github actions workflow', 'actions runner', 'matrix strategy', 'docker build push action', 'actions cache', 'actions secret', 'workflow dispatch', 'reusable workflow'], agent: githubActionsOssAgent },

    // Testing
    { keywords: ['playwright getbyrole', 'playwright locator', 'playwright test fixture', 'playwright screenshot', 'playwright api test', 'playwright codegen', 'playwright page object'], agent: playwrightOssAgent },
    { keywords: ['vitest describe', 'vi.fn mock', 'vi.spyOn', 'vitest coverage', 'vitest setup', 'vitest snapshot', 'testing library render', 'vitest globals'], agent: vitestOssAgent },

    // Developer Tooling
    { keywords: ['tailwind utility', 'tailwind responsive', 'tailwind dark mode', 'tailwind config', 'tailwind plugin', 'tw merge clsx', 'shadcn radix', 'tailwind v4'], agent: tailwindcssOssAgent },
    { keywords: ['trpc router', 'trpc procedure', 'trpc middleware', 'trpc react query', 'trpc createcaller', 'trpc invalidate', 'trpc mutation', 'trpc apptype'], agent: trpcOssAgent },
    { keywords: ['zod schema', 'z.object', 'z.string email', 'zod refine', 'zod superrefine', 'zod safeParse', 'zod infer', 'zod discriminated union', 'zodresolver hookform'], agent: zodOssAgent },

    // Languages / Runtimes
    { keywords: ['golang goroutine', 'go channel', 'go interface', 'go error wrap', 'go context cancel', 'go struct method', 'gin framework go', 'pgx postgres go', 'go modules'], agent: golangOssAgent },
    { keywords: ['rust ownership', 'rust borrow checker', 'rust trait impl', 'rust async tokio', 'axum web rust', 'rust enum match', 'cargo build', 'rust lifetime', 'rustc'], agent: rustOssAgent },
    { keywords: ['bun serve', 'bun install', 'bun sqlite', 'bun.file', 'bun.write', 'bun.password', 'bun runtime', 'bun bundler', 'bun test'], agent: bunOssAgent },
    { keywords: ['graphql schema sdl', 'graphql mutation', 'graphql subscription', 'dataloader n+1', 'apollo server 4', 'graphql context', 'graphql codegen', 'graphql fragment'], agent: graphqlOssAgent },

    // ── Tier OS Batch 2: Additional Frameworks, Desktop, AI, Testing ──────────────
    { keywords: ['angular signals', 'angular standalone', 'script setup angular', 'inject angular', 'ngrx signals', 'angular router', 'angular reactive forms', 'angular httpClient', 'angular zoneless'], agent: angularOssAgent },
    { keywords: ['astro islands', 'astro component', 'content collection', 'client:load', 'client:idle', 'astro view transitions', 'astro integration', 'getstaticpaths astro', 'astro actions'], agent: astroOssAgent },
    { keywords: ['remix loader', 'remix action', 'remix form', 'route config remix', 'usefetcher', 'useloaderdata', 'remix session', 'remix error boundary', 'remix nested route'], agent: remixOssAgent },
    { keywords: ['tensorflow keras', 'model.fit', 'tf.data pipeline', 'keras layers', 'transfer learning keras', 'tflite', 'model compile', 'keras callback', 'tensorflow serving'], agent: tensorflowOssAgent },
    { keywords: ['jest mock', 'jest.fn', 'jest.spyOn', 'jest config', 'jest snapshot', 'jest coverage', 'testing library react', 'jest.useFakeTimers', 'jest module mock'], agent: jestOssAgent },
    { keywords: ['electron main process', 'electron renderer', 'electron preload', 'contextisolation', 'ipcmain', 'ipcrenderer', 'contextbridge', 'electron builder', 'electron ipc'], agent: electronOssAgent },
    { keywords: ['tauri command', 'tauri invoke', 'tauri ipc', 'tauri plugin', 'tauri permissions', 'tauri capabilities', 'tauri builder', 'tauriapp rust', 'contextbridge tauri'], agent: tauriOssAgent },
    { keywords: ['llamaindex rag', 'llamaindex query engine', 'llamaindex agent', 'vector store index', 'llamaindex retriever', 'node parser llama', 'llamaindex workflow', 'llama hub'], agent: llamaIndexOssAgent },

    // ── Tier OS Batch 3: Data Science, Tooling ─────────────────────────────────
    { keywords: ['pandas dataframe', 'df.groupby', 'df.merge', 'df.fillna', 'df.dropna', 'pandas read_csv', 'pd.concat', 'pandas time series', 'polars'], agent: pandasOssAgent },
    { keywords: ['pydantic model', 'basesettings', 'field_validator', 'model_dump', 'pydantic settings', 'pydantic v2', 'pydantic schema', 'model_validate'], agent: pydanticOssAgent },
    { keywords: ['celery task', 'shared_task', 'celery beat', 'celery worker', 'celery chord', 'celery chain', 'celery group', 'apply_async', 'celery broker'], agent: celeryOssAgent },
    { keywords: ['shadcn ui', 'shadcn add', 'shadcn init', 'radix ui', 'shadcn form', 'shadcn dialog', 'shadcn button', 'shadcn table', 'cn() tailwind'], agent: shadcnOssAgent },
    { keywords: ['turborepo', 'turbo run', 'turbo.json', 'remote cache turbo', 'turbo pipeline', 'monorepo packages', 'turbo filter', 'nx turbo'], agent: turborepoOssAgent },
    { keywords: ['rxjs observable', 'rxjs operator', 'switchmap', 'mergemap', 'concatmap', 'exhaustmap', 'rxjs subject', 'behaviorsubject', 'rxjs pipe debounce'], agent: rxjsOssAgent },
    { keywords: ['deno serve', 'deno kv', 'deno deploy', 'deno permissions', 'deno.json', 'jsr registry', 'deno runtime', 'deno task', 'denoland'], agent: denoOssAgent },

    // ── Tier OS Batch 4: Database, Infra, AI APIs, Auth ───────────────────────
    { keywords: ['postgresql schema', 'postgres cte', 'pg window function', 'jsonb postgres', 'postgres partition', 'pgbouncer', 'postgres index', 'explain analyze'], agent: postgresqlOssAgent },
    { keywords: ['nginx config', 'nginx server block', 'nginx upstream', 'nginx proxy_pass', 'nginx rate limit', 'nginx ssl', 'nginx location block', 'certbot nginx'], agent: nginxOssAgent },
    { keywords: ['prometheus metrics', 'promql query', 'prometheus alert rules', 'prom-client', 'histogram_quantile', 'prometheus scrape', 'grafana dashboard', 'prometheus exporter'], agent: prometheusOssAgent },
    { keywords: ['openai api', 'chat completions', 'gpt-4o', 'openai tool calling', 'openai streaming', 'openai embeddings', 'openai vision', 'openai assistants', 'structured output openai'], agent: openaiSdkOssAgent },
    { keywords: ['socket.io rooms', 'socket.io events', 'socket.io namespace', 'socketio redis adapter', 'socket.io auth', 'socket.io client', 'io.to() emit'], agent: socketioOssAgent },
    { keywords: ['passport local', 'passport jwt strategy', 'passport google oauth', 'passport github', 'passport.authenticate', 'passport.use', 'passport serialize', 'oauth2 passport'], agent: passportOssAgent },

    // ── Tier OS Batch 5: Cloud IaC, ORMs, Languages ────────────────────────────
    { keywords: ['aws cdk', 'cdk stack', 'aws construct', 'fargate cdk', 'cdk synth deploy', 'aws cdk lambda', 'cdk diff', 'cdk pipeline'], agent: awsCdkOssAgent },
    { keywords: ['typeorm entity', 'typeorm repository', 'typeorm migration', 'typeorm query builder', 'createquerybuilder', '@entity decorator', 'datasource typeorm', 'typeorm nestjs'], agent: typeormOssAgent },
    { keywords: ['sqlalchemy model', 'sqlalchemy session', 'sqlalchemy async', 'mapped_column', 'alembic migration', 'sqlalchemy select', 'sqlalchemy relationship', 'fastapi sqlalchemy'], agent: sqlalchemyOssAgent },
    { keywords: ['kotlin coroutines', 'kotlin flow', 'ktor server', 'kotlin data class', 'kotlin sealed class', 'kotlin suspend', 'kotlin android', 'kotlin spring boot'], agent: kotlinOssAgent },
    { keywords: ['swift swiftui', 'swift async await', 'swift actor', 'swift vapor', 'swiftui view', 'swift codable', 'swift structured concurrency', 'swift observable'], agent: swiftOssAgent },

    // ── Tier OS Batch 6: Enterprise Backend, Mobile ───────────────────────────
    { keywords: ['spring boot 3', 'spring data jpa', 'spring security', 'spring @restcontroller', 'spring bean', 'spring @transactional', 'spring actuator', 'spring dependency injection'], agent: springBootOssAgent },
    { keywords: ['laravel 11', 'laravel eloquent', 'laravel blade', 'laravel artisan', 'laravel routing', 'laravel migration', 'laravel controller', 'laravel middleware'], agent: laravelOssAgent },
    { keywords: ['ruby on rails 7', 'rails active record', 'rails hotwire', 'turbo frame', 'stimulus controller', 'rails action controller', 'rails migration', 'rails active job'], agent: railsOssAgent },
    { keywords: ['asp.net core 8', 'entity framework core', 'ef core', 'dotnet web api', 'dotnet minimal api', 'dotnet dependency injection', 'dotnet linq', 'dotnet dbset'], agent: dotnetOssAgent },
    { keywords: ['react native', 'expo router', 'react native flatlist', 'react native reanimated', 'react native stylesheet', 'react navigation', 'eas build', 'react native view'], agent: reactNativeOssAgent },
    { keywords: ['flutter widget', 'flutter layout', 'flutter column', 'flutter riverpod', 'flutter statefulwidget', 'flutter gorouter', 'flutter provider', 'dart async'], agent: flutterOssAgent },

    // ── Tier OS Batch 15: Hypermedia, Lightweight Reactivity, Frameworks ──────
    { keywords: ['htmx', 'hx-get', 'hx-post', 'hypermedia', 'hx-target', 'hx-swap', 'hx-trigger'], agent: htmxOssAgent },
    { keywords: ['alpine.js', 'alpinejs', 'x-data', 'x-init', 'x-show', 'x-on', 'x-bind', 'alpine store'], agent: alpinejsOssAgent },
    { keywords: ['solidjs', 'solid.js', 'createsignal', 'createeffect', 'solid start', 'solid memo', 'fine grained reactivity'], agent: solidjsOssAgent },
    { keywords: ['fastify', 'fastify plugin', 'fastify schema', 'reply.send', 'fastify hook', 'fastify decorate'], agent: fastifyOssAgent },

    // ── Tier OS Batch 16: TypeScript/Edge Frameworks & Tooling ────────────────
    { keywords: ['elysiajs', 'elysia', 'bun server context', 'eden rpc', 'elysia decorator', 'elysia plugin'], agent: elysiaOssAgent },
    { keywords: ['qwik', 'useSignal', 'useTask$', 'resumability', 'qwik city', 'component$', 'routeLoader$'], agent: qwikOssAgent },
    { keywords: ['xstate', 'state machine', 'xstate actor', 'xstate context', 'createMachine', 'statechart'], agent: xstateOssAgent },
    { keywords: ['meilisearch', 'faceted search', 'typo tolerance', 'meilisearch index', 'searchableAttributes'], agent: meilisearchOssAgent },

    // ── Tier OS Batch 17: Modern Fullstack & BaaS Ecosystems ──────────────────
    { keywords: ['nuxtjs', 'nuxt', 'nitro', 'nuxt3', 'useFetch', 'useAsyncData'], agent: nuxtjsOssAgent },
    { keywords: ['deno', 'deno.json', 'deno deploy', 'https imports', 'deno.serve'], agent: denoOssAgent },
    { keywords: ['appwrite', 'appwrite cloud', 'appwrite databases', 'appwrite storage', 'appwrite functions'], agent: appwriteOssAgent },
    { keywords: ['adonisjs', 'adonis', 'lucid orm', 'edge templates', 'adonis controller'], agent: adonisjsOssAgent },

    // ── Tier OS Batch 18: 3D, Automation, CMS & High-Perf Go ──────────────────
    { keywords: ['three.js', 'threejs', 'webglrenderer', 'perspectivecamera', 'requestanimationframe', 'three mesh'], agent: threejsOssAgent },
    { keywords: ['puppeteer', 'headless chrome', 'page.evaluate', 'page.goto', 'puppeteer launch'], agent: puppeteerOssAgent },
    { keywords: ['strapi', 'strapi cms', 'headless cms', 'entity service API', 'strapi lifecycle'], agent: strapiOssAgent },
    { keywords: ['gin', 'gin-gonic', 'gin framework', 'c.JSON', 'gin context', 'go gin'], agent: ginOssAgent },

    // ── Tier OS Batch 19: Foundational & Ubiquitous Tooling ───────────────────────
    { keywords: ['vite', 'vitejs', 'vite.config.js', 'import.meta.env', 'vite plugin'], agent: viteOssAgent },

    // ── Tier OS Batch 20: Frontend UI & Data Visualization ────────────────────────
    { keywords: ['bootstrap', 'bootstrap 5', 'container-fluid', 'col-md-', 'bs-toggle'], agent: bootstrapOssAgent },
    { keywords: ['d3', 'd3.js', 'd3.select', 'd3.scalelinear', 'svg chart'], agent: d3OssAgent },
    { keywords: ['mui', '@mui/material', 'material-ui', 'sx prop', 'themeprovider mui'], agent: muiOssAgent },
    { keywords: ['antd', 'ant design', 'antd table', 'antd form', 'configprovider'], agent: antdOssAgent },

    // ── Tier OS Batch 21: Vector Databases & Real-Time Analytics ──────────────────
    { keywords: ['chroma', 'chromadb', 'embedding database', 'chroma collection'], agent: chromaOssAgent },
    { keywords: ['milvus', 'pymilvus', 'vector database milvus', 'hnsw'], agent: milvusOssAgent },
    { keywords: ['qdrant', 'qdrant client', 'vector search engine qdrant'], agent: qdrantOssAgent },
    { keywords: ['clickhouse', 'columnar database', 'mergetree', 'clickhouse analytics'], agent: clickhouseOssAgent },

    // ── Tier OS Batch 22: Database ORMs & Tooling ─────────────────────────────────
    { keywords: ['prisma orm', 'prisma schema', 'prisma migrate', 'findmany'], agent: prismaOssAgent },
    { keywords: ['drizzle orm', 'drizzle schema', 'drizzle kit'], agent: drizzleOssAgent },
    { keywords: ['typeorm entity', 'typeorm migration', 'createquerybuilder'], agent: typeormOssAgent },
    { keywords: ['sqlalchemy model', 'sqlalchemy async', 'alembic'], agent: sqlalchemyOssAgent },

    // ── Tier OS Batch 23: Testing & State Management (Final 100) ──────────────────
    { keywords: ['zustand', 'react store', 'zustand slice', 'bearbones state'], agent: zustandOssAgent },
    { keywords: ['cypress', 'e2e testing', 'cy.visit', 'cypress intercept'], agent: cypressOssAgent },

    // ── Tier OS Batch 24: Static Sites & Headless CMS ─────────────────────────────
    { keywords: ['docusaurus', 'mdx docs', 'docusaurus swizzle', 'docusaurus sidebar'], agent: docusaurusOssAgent },
    { keywords: ['gatsby', 'gatsby graphql', 'gatsby-node', 'gatsby plugin'], agent: gatsbyOssAgent },
    { keywords: ['hugo theme', 'hugo shortcode', 'hugo frontmatter', 'go html template'], agent: hugoOssAgent },
    { keywords: ['ghost cms', 'ghost headless', 'ghost handlebars', 'ghost content api'], agent: ghostOssAgent },

    // ── Tier OS Batch 25: Data Engineering & AI Scaling ───────────────────────────
    { keywords: ['opencv', 'cv2', 'computer vision', 'haarcascade'], agent: opencvOssAgent },
    { keywords: ['ray core', 'ray serve', 'ray tune', 'distributed python'], agent: rayOssAgent },
    { keywords: ['apache spark', 'pyspark', 'spark sql', 'spark rdd'], agent: sparkOssAgent },
    { keywords: ['apache airflow', 'airflow dag', 'airflow operator', 'xcom'], agent: airflowOssAgent },

    // ── Tier OS Batch 26: Cloud Native & IaC ──────────────────────────────────────
    { keywords: ['terraform', 'hashicorp hcl', 'tf state', 'terraform module'], agent: terraformOssAgent },
    { keywords: ['pulumi', 'pulumi stack', 'infrastructure as code typescript'], agent: pulumiOssAgent },
    { keywords: ['crossplane', 'crossplane provider', 'composite resource definition', 'xrd'], agent: crossplaneOssAgent },
    { keywords: ['helm chart', 'helm values', 'kubernetes package manager', 'helm upgrade'], agent: helmOssAgent },

    // ── Tier OS Batch 27: Messaging, Event Streaming & RPC ────────────────────────
    { keywords: ['apache kafka', 'kafka stream', 'event streaming', 'consumer group'], agent: kafkaOssAgent },
    { keywords: ['rabbitmq', 'amqp', 'message broker', 'rabbitmq queue'], agent: rabbitmqOssAgent },
    { keywords: ['grpc', 'protocol buffers', 'protobuf', 'rpc streaming'], agent: grpcOssAgent },
    { keywords: ['nats server', 'nats jetstream', 'pub sub nats'], agent: natsOssAgent },

    // ── Phase 35: OSS Agent Armada Expansion III ───────────────────────────────────
    { keywords: ['gitlab-ci.yml', 'gitlab runner', 'gitlab pipeline', 'dind gitlab', 'gitlab trigger'], agent: gitlabCiAgent },
    { keywords: ['jenkinsfile', 'jenkins pipeline', 'groovy shared library', 'jenkins node'], agent: jenkinsAgent },
    { keywords: ['argocd application', 'argocd appproject', 'applicationset', 'out of sync argocd'], agent: argocdAgent },
    { keywords: ['fluxcd', 'flux v2', 'gitrepository', 'kustomization flux', 'helmrelease flux', 'image update automation'], agent: fluxcdAgent },
    { keywords: ['godot engine', 'gdscript', 'scene tree', 'godot signal', 'godot _process', 'godot node2d', 'godot collision'], agent: godotAgent },
    { keywords: ['bevy engine', 'rust ecs', 'bevy system', 'bevy component', 'bevy entity', 'bevy plugin'], agent: bevyAgent },
    { keywords: ['phaser 3', 'phaser scene', 'arcade physics', 'phaser sprite', 'phaser atlas', 'html5 game canvas'], agent: phaserAgent },
    { keywords: ['webgpu', 'wgsl', 'navigator.gpu', 'compute shader webgpu', 'webgpu render pipeline', 'bindgroup'], agent: webgpuAgent },
    { keywords: ['serverless stack', 'sst.config.ts', 'sst ion', 'sst dev', 'opennext sst'], agent: sstAgent },
    { keywords: ['serverless framework', 'serverless.yml', 'sls deploy', 'serverless-offline', 'serverless domain manager'], agent: serverlessFwAgent },
    { keywords: ['localstack', 'awslocal', 'localstack docker', 'endpoint_url localstack'], agent: localstackAgent },
    { keywords: ['aws sam', 'template.yaml serverless', 'sam local invoke', 'sam build', 'aws::serverless-2016-10-31'], agent: awsSamAgent },

    // ── Phase 36: OSS Agent Armada Expansion IV ────────────────────────────────────
    { keywords: ['streamlit', 'st.session_state', 'st.dataframe', 'st.cache_data', 'streamlit rerun'], agent: streamlitAgent },
    { keywords: ['gradio', 'gr.blocks', 'gr.interface', 'hugging face space gradio', 'gr.chatbot'], agent: gradioAgent },
    { keywords: ['scikit-learn', 'sklearn pipeline', 'columntransformer', 'gridsearchcv', 'fit_transform'], agent: scikitLearnAgent },
    { keywords: ['xgboost', 'xgb.dmatrix', 'xgbclassifier', 'early_stopping_rounds xgboost', 'xgboost hyperparameters'], agent: xgboostAgent },
    { keywords: ['quarkus', 'panache orm', 'resteasy reactive', 'mutiny uni multi', 'graalvm native-image quarkus'], agent: quarkusAgent },
    { keywords: ['micronaut', 'micronaut data', '@client micronaut', 'aot compilation java micronaut'], agent: micronautAgent },
    { keywords: ['eclipse vert.x', 'verticle', 'vert.x eventbus', 'executeblocking', 'reactive sql client'], agent: vertXAgent },
    { keywords: ['akka typed', 'apache pekko', 'cluster sharding akka', 'actor model java', 'akka streams'], agent: akkaAgent },
    { keywords: ['keycloak realm', 'keycloak spi', 'keycloak theme', 'oidc keycloak', 'saml keycloak idp'], agent: keycloakAgent },
    { keywords: ['sentry dsn', 'sentry before_send', 'sentry distributed tracing', 'upload source maps sentry'], agent: sentryAgent },
    { keywords: ['posthog', 'posthog.identify', 'posthog feature flags', 'session replay posthog'], agent: posthogAgent },
    { keywords: ['metabase', 'metabase sql question', 'field filters metabase', 'metabase embedding', 'metabase jwt'], agent: metabaseAgent },

    // ── Phase 9.0: The Sovereign Delivery Pipeline ─────────────────────────────────
    { keywords: ['pull request review', 'pr scrutiny', 'architectural drift', 'automated pr review', 'code review bot', 'review-pr'], agent: reviewAgent },
    { keywords: ['prepare pr', 'ephemeral environment', 'branch deployment', 'pr staging', 'prepare-pr', 'pr compliance'], agent: prepareAgent },
    { keywords: ['merge pr', 'deterministic squash', 'git merge squash', 'main branch gate', 'merge-pr', 'head sha pin'], agent: mergeAgent },
    { keywords: ['argo rollout', 'canary rollout', 'autocanary', 'deployment sentinel', 'rollout rollback', 'zero downtime deploy'], agent: releaseOpsAgent },
    { keywords: ['mintlify', 'semantic version bump', 'update changelog', 'keep a changelog', 'docs agent', 'api reference docs'], agent: docsAgent },

    // ── Phase 10.0: The Enterprise Genesis Kernel ──────────────────────────────────
    { keywords: ['omni refactor', 'omni-refactor', 'multi-file generation', 'architecture wide refactoring', 'bounded context execution', 'cross layer commit'], agent: omniRefactorAgent },
    { keywords: ['soc2 validation', 'soc2', 'hipAA compliance', 'data loss prevention', 'dlp scan', 'pii redaction', 'compliance guard', 'ciso'], agent: complianceGuardAgent },

    // ── Phase 11.0: The Zero-Downtime Migration Engine ──────────────────────────────
    { keywords: ['database migration', 'schema change', 'ddl modification', 'expand and contract', 'zero downtime deploy db', 'prisma migrate production'], agent: migrationArchitectAgent },
    { keywords: ['database shadowing', 'dark launching db', 'shadow traffic', 'schema validation clone', 'traffic duplication'], agent: dbShadowAgent },

    // ── Phase 12.0: The Omnipresent Threat Intel Matrix ─────────────────────────────
    { keywords: ['cve alert', 'zero day patch', 'nvd vulnerability', 'github advisory', 'hotfix orchestrator', 'defcon 1 alert', 'dependency bump'], agent: cveSentinelAgent },
    { keywords: ['supply chain defense', 'malicious npm package', 'wasm sandbox', 'postinstall tracking', 'dependency audit', 'veto installation'], agent: wasmSandboxAgent },

    // ── Phase 13.0: The Omnilayer Integration Nexus ─────────────────────────────────
    { keywords: ['jira epic', 'jira ticket', 'agile architect', 'linear issue', 'requirements mapping', 'epic translation'], agent: jiraArchitectAgent },
    { keywords: ['figma compiler', 'figma node', 'vector constraints', 'ui generation', 'figma to code', 'pixel translation'], agent: figmaCompilerAgent },
    { keywords: ['datadog apm', 'sentry trace', 'telemetry correlator', 'flame graph mapping', 'runtime panic analysis', 'ast hotfix'], agent: datadogSentryCorrelatorAgent },

    // ── Phase 14.0: The Multimodal Synthetic User & QA Matrix ────────────────AAAAAAA
    { keywords: ['visual qa', 'dom screenshot', 'figma diff', 'pixel perfect', 'ui regression', 'contrast check', 'z-index overflow'], agent: visionQaAgent },
    { keywords: ['synthetic user', 'chaos monkey', 'playwright automation', 'ephemeral staging click', 'behavioral test', 'break ui state'], agent: syntheticUserAgent },
    { keywords: ['a11y enforce', 'wcag compliance', 'aria tag', 'screen reader sim', 'keyboard trap', 'accessibility auditor'], agent: a11yEnforcerAgent },

    // ── Phase 15.0: The Global Governance & Compliance Engine ───────────────────────
    { keywords: ['hipaa audit', 'fhir compliance', 'epic mrn tracking', 'phi logging intercept', 'healthcare datamask'], agent: hipaaFhirAuditorAgent },
    { keywords: ['pci dss enforcement', 'gcp kms cmek', 'stripe tokenization', 'financial transaction ledger', 'fintech compliance'], agent: fintechPciAuditorAgent },
    { keywords: ['gdpr erasure', 'gcp data sovereignty', 'ccpa compliance', 'right to erasure', 'pii retention', 'cookie consent banner'], agent: gdprPrivacyAuditorAgent },

    // ── Phase 16.0: The Sovereign Cloud Automata (GCP Native) ───────────────────────
    { keywords: ['gcp terraform', 'gke autopilot', 'vpc service control', 'vpc-sc perimeter', 'cloud infrastructure', 'gcp iac module'], agent: gcpIacArchitectAgent },
    { keywords: ['cloud spanner', 'multi-region database', 'truetime paxso', 'interleave in parent', 'distributed sql scale', '99.999% sla db'], agent: cloudSpannerOrchestratorAgent },
    { keywords: ['beyondcorp enterprise', 'iap configuration', 'google identity aware proxy', 'zero-trust edge', 'load balancer auth'], agent: beyondcorpZeroTrustAgent },

    // ── Phase 17.0: The Sovereign Resilience & Confidential Compute Core ────────────
    { keywords: ['confidential space', 'amd sev memory encryption', 'intel tdx', 'confidential gke node', 'data in use encryption'], agent: confidentialComputeAgent },
    { keywords: ['active-active dr', 'multi region failover', 'continental load balancing', 'near zero rto', 'global load balancer'], agent: multiRegionDrAgent },
    { keywords: ['worm vault lock', 'immutable backup', 'gcp backup and dr', 'ransomware protection', 'gcs retention policy', 'write once read many'], agent: ransomwareVaultGuardianAgent },

    // ── Phase 18.0: The Cryptographic Supply Chain & Forensic Audit Engine ──────────
    { keywords: ['binary authorization', 'slsa l4', 'gcp cloud build provenance', 'cryptographic signed image', 'cve gate'], agent: slsaBuildEnforcerAgent },
    { keywords: ['cloud dlp redaction', 'ssn hashing', 'data access audit', 'pii log masking', 'immutable telemetry'], agent: forensicTelemetryAuditorAgent },
    { keywords: ['scc anomaly remediation', 'security command center', 'autonomous terraform fix', 'cloud armor waf blocking', 'pubsub soc level 3'], agent: sovereignIncidentResponderAgent },

    // ── Phase 19.0: The Anthropic Data Warehouse & AI Analytics Core ────────────────
    { keywords: ['bigquery schema', 'olap data warehouse', 'column level security', 'gcp policy tag', 'denormalized array struct', 'petabyte analysis'], agent: bigqueryArchitectAgent },
    { keywords: ['vertex ai automl', 'bigquery data training', 'predictive ml modeler', 'fraud detection endpoint', 'forecasting regression'], agent: vertexAiModelerAgent },
    { keywords: ['generative business intelligence', 'natural language to sql', 'bigquery ml standard sql', 'arima clustering', 'synthesize telemetry chart'], agent: generativeBiAnalystAgent },

    // ── Phase 20.0: The Planetary Edge & Sovereign Distributed Cloud ────────────────
    { keywords: ['google cloud cdn', 'media cdn', 'edge cloud armor waf', 'service worker point of presence', 'static asset edge cache'], agent: edgeComputeArchitectAgent },
    { keywords: ['distributed cloud edge', 'anthos bare metal', 'air gapped kubernetes', 'on-premise hospital gdc', 'sovereign intranet ai inference'], agent: distributedCloudOrchestratorAgent },
    { keywords: ['cloud run migration', 'serverless auto scaling', 'scale to zero knative', 'bursty gke traffic', 'v8 concurrency maximize container limit'], agent: serverlessV8MutatorAgent },
    { keywords: ['gcp trace analysis', 'cognitive sre optimization', 'reduce gcp billing statement', 'autonomous algorithm rewrite', 'n+1 query cache refactor'], agent: cognitiveSreNavigatorAgent },

    // ── Phase 21.0: The Gemini Multimodal Workspace & Copilot Integration ───────────
    { keywords: ['gemini api cli', 'bash terminal local execute', 'stdout stderr debug', 'terminal copilot', 'local gcloud kubectl command'], agent: geminiCliCopilotAgent },
    { keywords: ['google workspace drive index', 'read google doc prd', 'gmail devops context', 'google space chat', 'autonomous architecture document'], agent: workspaceIntelligenceRouterAgent },
    { keywords: ['multimodal vision processing', 'photograph whiteboard architecture', 'lucidchart diagram to terraform', 'png ui mockup to react nextjs component', 'visual computer reasoning'], agent: multimodalContextSynthesizerAgent },

    // ── Phase 22.0: The Quantum AI Gateway & API Monetization Engine ────────────────
    { keywords: ['google cloud apigee x', 'b2b saas billing', 'stripe revenue integration', 'external public api keys', 'oauth2 client credential proxy'], agent: apigeeMonetizationArchitectAgent },
    { keywords: ['google api gateway vertex ai', 'llm semantic cache prompt', 'predictive vertex inference endpoint', 'public semantic url abstraction', 'ai microservice load balancing'], agent: aiGatewayRouterAgent },
    { keywords: ['apollo graphql federation', 'supergraph schema stitch', 'microservice graph resolver', 'one public endoint', 'declarative typed graph generation'], agent: graphqlFederationBuilderAgent },

    // ── Phase 23.0: Seamless Coworker Handoff & Omnipresent Context ─────────────────
    { keywords: ['shift handoff', 'serialize ide context', 'resume human ide state', 'coworker context transfer', 'overnight async commit'], agent: coworkerHandoffOrchestratorAgent },
    { keywords: ['multi agent debate', 'swarm architectural consensus', 'hallucination reduction committee', 'democratic swarm governance', 'adr consensus generation'], agent: multiAgentConsensusEngineAgent },
    { keywords: ['escalate to human expert', 'slack incident approval', 'critical human in loop', 'identify git blame owner', 'halt autonomous deployment missing confidence'], agent: humanInLoopEscalatorAgent },

    // ── Phase 24.0: The Omniscient Incident Commander & RCA Synthesizer ─────────────
    { keywords: ['declare p0 incident', 'slack sev1 war room', 'datadog alert trigger', 'google cloud monitoring pagerduty', 'jit access oncall engineer'], agent: incidentCommanderAgent },
    { keywords: ['generate rca post mortem', 'git bisect root cause', 'correlate gcp trace logs', 'incident postmortem document', 'create jira action items'], agent: rootCauseSynthesizerAgent },
    { keywords: ['chaos monkey terminate pod', 'chaos engineering fault injection', 'truncate cloud sql testing', 'validate multi region dr', 'preprod resilience verification'], agent: chaosEngineeringChaosMonkeyAgent },
    { keywords: ['blameless culture review', 'sre psychological safety', 'sanitize post mortem blame', 'semantic coach slack intervention', 'blame system not person'], agent: blamelessCultureEnforcerAgent },

    // ── Phase 25.0: The Cognitive FinOps & Cloud Cost Eradicator ────────────────────
    { keywords: ['gcp billing anomaly', 'cloud cost spike track', 'bigquery finops dashboard', 'identify database spend regression', 'generate cost to serve proof'], agent: finopsBillingAnalyzerAgent },
    { keywords: ['gke spot instance migrate', 'preemptible vm arbitrage', 'kubernetes dynamic scaling drain', 'stateless cheap compute switch', 'exploit excess cloud region capacity'], agent: spotInstanceArbitrageAgent },
    { keywords: ['refactor o n2 loop to o1 hashmap', 'google cloud profiler compute reduction', 'cpu time optimization rewrite', 'algorithmic code complexity scaling', 'save compute money pr'], agent: algorithmicEfficiencyRefactorerAgent },
    { keywords: ['grid carbon intensity routing', 'esg environment optimization', 'delay vertex training overnight wind power', 'halt batch job solar hydro', 'shift compute workload away from fossil fuels'], agent: carbonFootprintOptimizerAgent },

    // ── Phase 26.0: The Global ERP Integration & Legacy Migration Fabric ────────────
    { keywords: ['sap s4hana integrate', 'abap rfc connector', 'odata financials api ledger', 'enterprise resource planning map transaction', 'corporate balance sheet stripe'], agent: sapHanaFinancialsBridgeAgent },
    { keywords: ['salesforce soql bulkify', 'apex trigger generator', 'crm bigquery sync data', 'enterprise saas customer provision', 'sales cloud mapping webhook'], agent: salesforceApexArchitectAgent },
    { keywords: ['workday hcm worker lifecycle', 'hr terminate iam revoke', 'jit access revoke employee', 'gcp zero trust internal identity binding', 'hr synchronize github permissions'], agent: workdayHcmSynchronizerAgent },
    { keywords: ['cobol ibm mainframe translate', 'transpile legacy monolith to go', 'parse java 6 ejb microservice', 'abandon as400 procedural', 'semantic business logic architectural extraction'], agent: legacyCobolModernizerAgent },

    // ── Phase 27.0: The Industry-Specific ERP & Core Systems Expansion ─────────────
    { keywords: ['oracle netsuite suitetalk', 'b2b e-commerce erp sync', 'restlet xml soap connector', 'order to cash automate fulfillment', 'cloud ledger impact validation'], agent: netsuiteErpOrchestratorAgent },
    { keywords: ['guidewire claimcenter api', 'property casualty insurance telemetry', 'fnol automated claim generation', 'iot smart home vehicle sensor anomoly', 'dynamic premium risk engine policycenter'], agent: guidewireInsuranceBridgeAgent },
    { keywords: ['epic ehr system health data', 'hipaa fhir r4 hl7 standard', 'clinical patient telemetry ingestion', 'pii phi cryptographic compliance hashing', 'medical device edge iot hospital router'], agent: epicFhirHealthRouterAgent },
    { keywords: ['plaid open banking api', 'fintech institution ledger statement sync', 'oauth bank account transaction ingestion', 'levenshtein distance invoice payment reconcile', 'multi institutional deposit verification cross reference'], agent: plaidOpenBankingSyncAgent },

    // ── Phase 28.0: The Autonomous Semantic RPA & GUI Singularity ───────────────
    { keywords: ['desktop semantic tree accessibility', 'windows uiautomation wpf mapped', 'macos axapi read desktop layout', 'graphical user interface coordinate determination intent'], agent: semanticGuiExtractorAgent },
    { keywords: ['playwright puppeteer headless browser', 'web automation dom traversal scriptless', 'evaluate selenium xhr table extraction xpath', 'enterprise portal download staging data fetch'], agent: playwrightDomPuppeteerAgent },
    { keywords: ['citrix rdp legacy flash pixel ingestion', 'ocr optical character recognition bounding box math', 'gemini 1 5 pro multimodal video frame coordinate', 'read graphical prompt coordinate button submit screen'], agent: computerVisionOcrArbiterAgent },
    { keywords: ['robotjs mouse macro physical control', 'desktop pointer move coordinate click os layer', 'hardware keystroke generation human simulate physics', 'delay ms drag window active execute'], agent: osLevelMacroOrchestratorAgent },

    // ── Phase 29.0: The Autonomous Edge & IoT Firmware Fabric ──────────────────
    { keywords: ['transpile cloud ai logic bare metal', 'c99 nostd rust embedded memory constrained microcontroller', 'arm cortex m esp32 sram register gpio array', 'algorithm allocation dynamic strip footprint rewrite hex'], agent: embeddedCRustTranspilerAgent },
    { keywords: ['freertos zephyr kernel latency stack size priority', 'inversion deadlock inheritance trace semaphore robotic', 'automotive isr interrupt context hard real time tick', 'math bounding depth safety exception memory overflow'], agent: rtosKernelOptimizerAgent },
    { keywords: ['lorawan hex decimal bitmask compression bytes struct', 'endian unpack base64 payload 11 bytes field gateway', 'network server agricultural temperature telemetry snr json'], agent: lorawanTelemetryDecoderAgent },
    { keywords: ['ota firmware air update cryptographic sign ecdsa', 'swap linux partition bootloader hardware flash rollout', 'fleet dead letter queue payload a b boot memory bin', 'reboot rollback logic physical brick swarm micro'], agent: overTheAirOtaDeployerAgent },

    // ── Phase 30.0: The Web3 & DeFi Autonomous Nexus ───────────────────────────
    { keywords: ['solidity evm smart contract ethereum l2 rollup', 'hardhat foundry framework openzeppelin protocol gas optimize', 'sstore struct pack generation immutable trustless compile deploy bytecode abi'], agent: solidityEvmArchitectAgent },
    { keywords: ['formal verification halmos certora multi hop execution safety proof', 'reentrancy vector attack overflow delegatecall oracle vulnerability security audit invariant state math logic bug drain fix', 'symbolic test fuzzing contract malicious hack proof secure'], agent: smartContractFormalVerifierAgent },
    { keywords: ['defi arbitrage mev maximum extractable value mempool snipe transaction execution DEX unconfirmed flashloan alchemy flashbots bundler profit funding math dex swap algorithm high frequency uniswap'], agent: defiArbitrageOrchestratorAgent },
    { keywords: ['decentralized identity did wallet metamask eip session signature auth oidc web3 web2 corporate iam rbac token governance nft revoke gcp aws permission control connect access limit'], agent: decentralizedIdentityBridgeAgent },

    // ── Phase 31.0: The Autonomous Manufacturing & Industrial Systems Nexus ────
    { keywords: ['siemens teamcenter plm engineering cad 3d model', 'ebom mbom manufacturing bill materials assembly line mapping', 'odata soap sap s/4hana erp mdm mrp procurement trigger sync'], agent: siemensTeamcenterPlmBridgeAgent },
    { keywords: ['scada industrial control factory floor opc-ua modbus profinet mqtt', 'plc telemetry vibration spindle temperature cnc anomaly robotics', 'ibm maximo sap plant maintenance work order prediction preventive downtime'], agent: scadaIndustrialControlRouterAgent },
    { keywords: ['sap ibp integrated business planning supply chain logistics re-route', 'factory throughput global deficit node freight marine terminal container', 'shift volume capacity salesforce eta recalculate shipment tracker anomaly'], agent: sapIbpSupplyChainOptimizerAgent },
    { keywords: ['rockwell mes manufacturing execution system factorytalk ignition shop floor', 'cloud erp order mapping production batch sequence recipe plc ethernet', 'traceability genealogy aluminum serial torque log recall thread physical build'], agent: rockwellMesOrchestratorAgent },

    // ── Phase 32.0: The Enterprise Legacy System & Industry SDK Synthesizer ────
    { keywords: ['autosar c++ misra safety critical iso 26262 automotive', 'can bus payload binary decoder arxml parser ecu firmware db', 'some/ip diagnostic uds service oriented middleware vehicle flash'], agent: automotiveAutosarCppArchitectAgent },
    { keywords: ['guidewire insurance suite gosu language pcf page configuration form ui', 'entity xml modify typelist add edit db upgrade script generator', 'policycenter claimcenter fnol developer code generation builder'], agent: insuranceGuidewireGosuGeneratorAgent },
    { keywords: ['fiserv jack henry core banking cobol z/os mainframe procedure data division', 'iso 8583 network message byte pack parser unpack generator settlement ledger', 'transpile refactor ibm batch script modern microservice jvm ddl'], agent: bankingIso8583CobolRefactorAgent },
    { keywords: ['ice encompass mortgage los sdk c# .net plugin rest client api', 'fannie mae freddie mac bre business rule automation dti ltv', '1003 xml loan payload smartclient ui winform desktop generate code'], agent: mortgageEncompassSdkBuilderAgent },

    // ── Phase 33.0: The Sovereign Defense & Aerospace Systems Integrator ──────
    { keywords: ['aerospace avionics do-178c ada flight control safety critical mc/dc', 'provable static analysis dynamic memory spark faa easa certification', 'branch logic coverage deterministic requirement trace matrix rtos green hills vxworks'], agent: aerospaceDo178cAvionicsCertifierAgent },
    { keywords: ['defense ros2 robotics dds middleware qos drone swarm ugv uav', 'rclcpp node publisher subscriber reliable volatile transient local electronic warfare jam', 'tf2 transform robot_localization sensor fusion lidar odometry nav2 autonomous navigate'], agent: defenseRos2RoboticsOrchestratorAgent },
    { keywords: ['satellite space ccsds telemetry ground station command control telecommand tc', 'rf binary packet little big endian swap header sequence count apid payload unpack', 's-band x-band downlink uplink json decrypt translate mask bit shift'], agent: satelliteC2TelemetryDecoderAgent },
    { keywords: ['tactical datalink link 16 j-series nato military parser tadil j uhf', 'mil-std-6016 bit mask unpack 32-bit register fixed format air track', 'c++ c struct interoperability cloud c2 jadc2 payload decode bitwise'], agent: tacticalDatalinkLink16ParserAgent },

    // ── Phase 34.0: The Quantum Computing & Applied Cryptography Integrator ────
    { keywords: ['quantum qiskit q# qubit superposition entanglement circuit vqe', 'ansatz cobyla hadamard cnot unitary matrix pauli rotation gate', 'nisq decoherence depth physical hardware optimize ibm noise'], agent: quantumQiskitAlgorithmSynthesizerAgent },
    { keywords: ['post quantum cryptography pqc lattice kyber dilithium shor rsa', 'ml-kem ml-dsa nist standardize encapsulate digital signature ecc', 'lwe mlwe hardness module err side channel timing attack protect'], agent: cryptoPostQuantumLatticeGeneratorAgent },
    { keywords: ['annealing d-wave qubo ising dimod combinatoric optimization np-hard', 'traveling salesman logistics route bqm binary quadratic model matrix', 'leap hybrid solver capacity schedule objective function minimum energy'], agent: quantumAnnealingDwaveOptimizerAgent },
    { keywords: ['homomorphic encryption fhe ciphertext seal tfhe privacy noise budget', 'ckks bfv polynomial mlaas machine learning zero trust decrypt', 'relinearization key switch bootstrap evaluation exact integer network'], agent: homomorphicEncryptionFheCompilerAgent },

    // ── Phase 35.0: The Precision Medicine & Bioinformatics Geneticist ────────
    { keywords: ['bioinformatics genomic sequencing ngs fastq nextflow snakemake gatk variant vcf dna', 'bwa bowite2 samtools pipeline dag qc illumina cluster hpc slurm batch', 'tumor normal mutation predict call scale raw base-pair align read'], agent: bioinformaticsGenomicPipelineOrchestratorAgent },
    { keywords: ['crispr cas9 sgrna guide rna off-target mutation gene edit grch38 allele', 'pam ngg protospacer score cfd doench thermodynamic mismatch penalty bulge', 'human genome sequence cut rank efficiency safety therapy geneticist'], agent: crisprCas9OfftargetPredictorAgent },
    { keywords: ['proteomics alphafold protein fold structure 3d amino acid fasta docking ligand', 'pytorch gpu cuda model pdb mmcif distance distogram invariant attention', 'small molecule autodock vina schrodinger glide thermodynamics energy complex'], agent: proteomicsAlphafoldModelerAgent },
    { keywords: ['medical ehr epic cerner hl7 fhir interoperability clinical trial patient bundle', 'v2 adt oru obx pid map pipe delimit healthcare app orchard sign json', 'oauth jwk snomed loinc icd-10 code smart machine learning data convert'], agent: medicalHl7FhirInteroperabilityAgent },

    // ── Phase 36.0: The Climate Modeling & Geospatial Meteorologist ────────────
    { keywords: ['climate model cesm fortran mpi supercomputer ocean atmosphere namelist warming degree', 'simulation ncar cheyenne tensor array netcdf mpirun core memory ncl', 'predict parameterization earth weather grid cell sbatch lazy load'], agent: climateCesmSimulationArchitectAgent },
    { keywords: ['geospatial gis sentinel satellite sar synthetic aperture radar xarray rasterio pixel deforestation', 'insar microwave phase shift cog cloud optimized geotiff dask aws radar', 'subsidence earthquake surface deformation tank capacity calculate image backscatter'], agent: geospatialSentinelSarAnalystAgent },
    { keywords: ['esg carbon ghg scope 1 2 3 emission compliance ledger csrd epa equivalency', 'climatiq logstic net zero reporting dashboard footprint track equivalent tonnage', 'invoice supply chain verfiy green corporate accounting math calculate'], agent: esgCarbonLedgerAuditorAgent },
    { keywords: ['precision agriculture iot drone ndvi soil moisture crop yield farm fertilizer tractor runoff', 'john deere iso-xml smart variable rate prescription map ground nitrogen plant health', 'multispectral imagery calculate pixel index mqtt sensor table water combine'], agent: precisionAgricultureIotAgronomistAgent },

    // ── Phase 52: The FIX Protocol & Market Data Arbiter (Finance) ───────────
    { keywords: ['fix protocol financial information exchange hft high frequency trading bloomberg refinitiv market data tick data', 'order routing algorithmic trading cme globex ice nasdaq itc low latency quantitative', 'c++ rust node.js zero allocation parsers lock free queues ring buffers'], agent: fixProtocolAgent },

    // ── Phase 53: The Institutional Ledger & Mortgage Architect (FinTech) ────
    { keywords: ['stripe treasury plaid jack henry fis fiserv core banking integration oauth webhook signature', 'idempotent transaction ledger mortgage origination double spend protection select for update', 'kyc aml alloy persona identity verification bignumber.js floating point precise cents'], agent: fintechLedgerAgent },

    // ── Phase 54: The SCADA & IIoT Integrator (Manufacturing) ────────────────
    { keywords: ['scada iiot industrial internet of things manufacturing telemetry factory floor opc ua modbus tcp rtu', 'mqtt broker eclipse mosquitto emqx qos 0 1 2 retained messages lwt last will testament pipeline edge computing', 'influxdb timescaledb aws timestream predictive maintenance plcs plc network big endian little endian byte swap buffer'], agent: industrialIotAgent },

    // ── Phase 55: The Automotive AUTOSAR & Embedded Systems Auditor ──────────
    { keywords: ['automotive firmware ecu electronic control unit can bus network can fd dbc file signal bit packing unpacking', 'autosar rte basic software bsw swc classic adaptive iso 26262 functional safety asil state machine', 'misra c c++ watchdog timer assertion crc verification e2e end to end protection wrapper dynamic memory allocation malloc'], agent: automotiveFirmwareAgent },

    // ── Phase 56: The SAP ABAP & Oracle NetSuite Translator (ERP) ────────────
    { keywords: ['sap abap bapi idoc gateway rfc bdi object oriented business add in middleware netweaver scm', 'oracle netsuite suitescript 2.0 2.1 map reduce user event client script restlet governance limit suiteql', 'workday studio hris xml xslt transformation web service raas report as a service sync payroll'], agent: enterpriseErpAgent },

    // ── Phase 57: The Salesforce / CRM Automation Architect (CRM) ────────────
    { keywords: ['salesforce crm soql sosl apex class trigger batch governor limit lightning web component lwc', 'mulesoft dataweave 2.0 integration middleware custom object standard object profile permission sfdx'], agent: domainSalesforceApexAgent },

    // ── Phase 58: The FHIR / HL7 Interoperability Weaver (Healthcare) ────────
    { keywords: ['fhir r4 hl7 v2 adt oru interoperability healthcare ehr epic app orchard cerner mllp pipe hat delimiter', 'safe harbor de-identification hipaa compliance smart on fhir oauth data routing pipeline patient observation encounter condition medication request'], agent: healthcareFhirAgent },

    // ── Phase 59: The Actuarial Risk & Claims Processor (Insurance) ──────────
    { keywords: ['insurance insurtech actuarial risk assessment engine claim adjudication state machine policycenter guidewire', 'billingcenter claimcenter gosu soap precision math life expectancy demographic mortality table probability matrix first notice of loss'], agent: insuranceGuidewireAgent },

    // ── Phase 61: The Avionics & Flight Control Architect (Aerospace) ────────
    { keywords: ['aerospace avionics flight control state machine do-178c do 178c arinc 429 mil-std-1553 mil std 1553 bus parser bit mask bcd bnr', 'vxworks 653 deterministic zero allocation embedded kalman filter sensor fusion absolute algorithmic determinism o(1) telemetry'], agent: aerospaceAvionicsAgent },

    // ── Phase 62: The Satellite Telemetry & Orbital Dynamics Specialist (Space)
    { keywords: ['space satellite telemetry ccsds packet decoding aos link protocol vcid asm crc', 'sgp4 orbital dynamics elements geodetic eci coordinate c2 command control payload aes 256 gcm encryption monotonic counter', 'ground station aws orbital aos los acquisition loss signal catastrophic cancellation astrophysics'], agent: spaceTelemetryAgent },

    // ── Phase 63: The Smart Grid & Substation Automation Engineer (Energy) ───
    { keywords: ['energy smart grid substation automation renewable microgrid iec 61850 goose mms client server scada relay tripping', 'dnp3 polling distributed network protocol class 1 2 3 event data buffering der load balancing peak shaving predict inverter', 'ot operation technology threat modeling diode communication island mode fault tolerant failover'], agent: energySmartGridAgent },

    // ── Phase 64: The 5G Core & Network Slicing Architect (Telecom) ──────────
    { keywords: ['telecom telecommunications 5g core 5gc sba amf smf upf packet inspection ebpf xdp express data path kernel bypass', 'diameter radius aaa authentication billing subscriber open ran o-ran ecpri 3gpp bpg route hijack tower cellular'], agent: telecom5GAgent },

    // ── Phase 65: The Legacy EDI & Warehouse Automation Translator (Logistics)
    { keywords: ['logistics supply chain warehouse automation wcs mhe material handling equipment conveyor divert plc modbus tcp ip socket', 'edi electronic data interchange edifact ansi x12 850 856 997 asn purchase order parser delimiter', 'as2 applicability statement 2 transport mdn receipt verification crypto payload event sourcing kafka ais telematics gps shock'], agent: logisticsEdiAgent },

    // ── Phase 66: The Digital Forensics & Chain-of-Custody Auditor (Legal) ───
    { keywords: ['legal compliance forensic audit chain of custody coc immutable ledger e-discovery metadata extract', 'pii redaction ssn iban health soc2 ccpa gdpr regex sharding sovereignty resident data', 'cryptographic tamper evident sha 384 zero trust ecdsa ed25519 signature asymmetric pipe stream'], agent: legalForensicsAgent },

    // ── Phase 67: The Defense & GovTech Security Architect (Security) ────────
    { keywords: ['defense govtech cybersecurity federal fips 140-3 cryptography open ssl boringcrypto aes 256 gcm kdf', 'nist sp 800-53 control assertion opa open policy agent terraform dod il5 fedramp high zero trust default deny', 'kubernetes istio service mesh mtls selinux apparmor air gapped classified cgi pki dns offline infrastructure code'], agent: govtechSecurityAgent },

    // ── Phase 69: The Zero-Knowledge (ZK) Protocol Architect (Cryptography) ──
    { keywords: ['zero knowledge zk snark stark groth16 plonk halo2 circom circuit constraint r1cs rank 1', 'polynomial commitment fri kzg poseidon hash merkle tree proof verifiable computation privacy preserving', 'under constrained zk evm proof system trusted setup snarkjs circomlib boolean check bit range'], agent: cryptoZkAgent },

    // ── Phase 70: The Post-Quantum (PQC) Migration Specialist (Cryptography) ─
    { keywords: ['post quantum pqc shor algorithm quantum computer crqc nist lattice based cryptography', 'crystals kyber ml kem encapsulation key exchange dilithium dsa falcon sphincs+ hash signature', 'liboqs open quantum safe x25519kyber768draft00 hybrid tls 1.3 constant time side channel'], agent: cryptoPqcAgent },

    // ── Phase 71: The Consensus Protocol Engineer (Distributed Systems) ──────
    { keywords: ['distributed consensus state machine replication smr raft paxos leader election appendentries commit index', 'byzantine fault tolerance pbft tendermint pre prepare 2f+1 quorum intersection epoch view change', 'vector clock lamport timestamp hybrid logical clock hlc split brain partition cap theorem cft bft'], agent: distributedConsensusAgent },

    // ── Phase 72: The Gossip & DHT Networking Architect (Distributed Systems) 
    { keywords: ['peer to peer p2p distributed hash table dht kademlia chord xor distance metric k bucket routing', 'gossip protocol epidemic routing anti entropy rumor mongering merkle tree sync eventual consistency', 'crdt conflict free replicated data type lww or set libp2p udp stun turn ice nat traverse hole punch'], agent: distributedNetworkingAgent },

    // ── Phase 73: The Storage Engine & LSM Tree Architect (Database) ─────────
    { keywords: ['database storage engine log structured merge tree lsm sstable memtable skiplist compaction leveldb', 'b+tree page split buffer pool manager lru clock sweep eviction fsync fdatasync o_direct nvme', 'write ahead log wal aries crash recovery durablity acid txid log sequence number lsn append only'], agent: databaseStorageAgent },

    // ── Phase 74: The Query Optimizer & Vector DB Specialist (Database) ──────
    { keywords: ['query optimizer cost based cbo abstract syntax tree ast join ordering hash sort merge dynamic programming', 'vector database similarity search hnsw hierarchical navigable small world index approximate nearest neighbor ann l2 cosine', 'simd avx 512 vectorized execution columnar apache arrow predicate pushdown constant folding unnest rel'], agent: databaseQueryAgent },

    // ── Phase 75: The TinyML & Edge Inference Optimizer (Edge AI) ────────────
    { keywords: ['tinyml edge ai microcontroller mcu inference cortex m bare metal cmsis nn dsp intrinsics', 'model quantization int8 int4 flatbuffer tensorflow lite micro tflite post training qat pruning sparsity', 'knowledge distillation coreml edge tpu tensor arena static allocation dequantization zero point scale'], agent: edgeTinymlAgent }
];

// ── CapabilityRouter ──────────────────────────────────────────────────────────

class CapabilityRouter {
    constructor() {
        this.table = CAPABILITY_TABLE;

        // V37.0 - O(1) Pre-tokenized indexing for 571+ agents
        this.agentTokens = this.table.map(entry => {
            const tokens = new Set(
                entry.keywords
                    .join(' ')
                    .toLowerCase()
                    .replace(/[^a-z0-9]/g, ' ')
                    .split(/\s+/)
                    .filter(t => t.length > 2)
            );
            if (!entry.agent) {
                console.error("UNDEFINED AGENT DETECTED for keywords:", entry.keywords);
                throw new Error("Initialization failed due to undefined agent");
            }
            return {
                agent: entry.agent,
                name: entry.agent.name,
                tokenSet: tokens
            };
        });

        logger.info(`🗺️ CapabilityRouter: Initialized — ${this.table.length} routes covering ${this.table.length} specialist agents.`);
    }

    /**
     * Register a new agent into the route table at runtime.
     * @param {object} agent 
     * @param {string[]} keywords 
     */
    registerAgent(agent, keywords) {
        this.table.push({ agent, keywords, name: agent.name });
        const tokens = new Set(
            keywords.join(' ').toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(t => t.length > 2)
        );
        this.agentTokens.push({ agent, name: agent.name, tokenSet: tokens });
    }

    /**
     * Score all agents against the query using token intersection and fuzzy prefix NLP.
     * @param {string} query
     * @returns {{ agent: object, score: number, name: string }[]}
     */
    score(query) {
        if (!query || typeof query !== 'string') return [];

        const queryTokens = new Set(
            query.toLowerCase()
                .replace(/[^a-z0-9]/g, ' ')
                .split(/\s+/)
                .filter(t => t.length > 2)
        );

        if (queryTokens.size === 0) return [];

        return this.agentTokens
            .map(entry => {
                let score = 0;
                for (const qt of queryTokens) {
                    if (entry.tokenSet.has(qt)) {
                        score += 5; // Exact high-confidence match
                    } else {
                        // Fuzzy substring fallback
                        for (const agentToken of entry.tokenSet) {
                            if (agentToken.includes(qt) || qt.includes(agentToken)) {
                                score += 1;
                                break;
                            }
                        }
                    }
                }
                return { agent: entry.agent, score, name: entry.name };
            })
            .filter(s => s.score > 0)
            .sort((a, b) => b.score - a.score);
    }

    /**
     * Route to single best agent.
     * @param {string} query
     * @returns {{ agent: object, score: number, name: string } | null}
     */
    route(query) {
        const matches = this.score(query);
        if (!matches.length) {
            logger.warn(`🗺️ CapabilityRouter: No match for: "${String(query).substring(0, 60)}"`);
            return null;
        }
        const best = matches[0];
        logger.info(`🗺️  → ${best.name} (score: ${best.score})`);
        return best;
    }

    /**
     * Route to top-N agents.
     * @param {string} query
     * @param {number} n
     */
    routeTop(query, n = 3) {
        return this.score(query).slice(0, n);
    }

    /**
     * Route + auto-consult the best agent.
     * v6.5.0: profiler-weighted selection (RouteOptimizer) + outcome recording.
     * Surged agents are skipped; explore/exploit balance maintained.
     *
     * @param {string} query
     * @param {Array<object>} contextData
     * @param {object} [opts]
     * @param {boolean} [opts.testPassed]  - pass through sprint test result for this step
     * @param {number}  [opts.costUsd]     - estimated cost for profiling
     * @returns {Promise<string | null>}
     */
    async dispatch(query, contextData = [], opts = {}) {
        const candidates = this.score(query);
        if (!candidates.length) {
            logger.warn(`🗺️ CapabilityRouter: No match for: "${String(query).substring(0, 60)}"`);
            return null;
        }

        // v6.5.0: use AgentProfiler to select best non-surged candidate
        const best = agentProfiler.selectBest(candidates) ?? candidates[0];
        logger.info(`🗺️  → ${best.name} (keyword-score: ${best.score})`);

        // Phase 41: Zero-Trust Voice Biometrics check for Destructive/Hardware intents
        const qLower = query.toLowerCase();
        const highRiskTokens = ['drop table', 'delete from', 'deploy to prod', 'format disk', 'shut down', 'reboot', 'rm -rf'];

        if (highRiskTokens.some(token => qLower.includes(token))) {
            logger.warn(`[Phase 41] 🛑 High-Risk Intent Detected: "${query}"`);

            // Require voice payload to be passed via opts
            if (!opts.voicePayload) {
                throw new Error(`[Phase 41] Zero-Trust Violation: High-risk action requires Voice Biometric authorization payload.`);
            }

            const isAuthorized = await voiceBiometricsService.verifyIntent(opts.voicePayload);
            if (!isAuthorized) {
                throw new Error(`[Phase 41] Zero-Trust Violation: Voice Biometric authorization failed! Unauthorized operator.`);
            }
        }

        const startMs = Date.now();
        let success = false;
        let result = null;

        try {
            result = await best.agent.consult(query, contextData);
            success = true;
        } catch (err) {
            logger.error(`🗺️ CapabilityRouter: ${best.name} threw — ${err.message}`);
            success = false;
        }

        // Record outcome in profiler
        agentProfiler.record(best.name, success, Date.now() - startMs, {
            testPassed: opts.testPassed,
            costUsd: opts.costUsd,
        });

        if (!success) throw new Error(`Agent ${best.name} failed to handle query: ${query.substring(0, 80)}`);
        return result;
    }

    /**
     * Fan-out to top-N agents in parallel.
     * @param {string} query
     * @param {Array<object>} contextData
     * @param {number} n
     * @returns {Promise<{ name: string, result: string }[]>}
     */
    async fanOut(query, contextData = [], n = 3) {
        const matches = this.routeTop(query, Math.min(n, 5));
        const results = await Promise.allSettled(
            matches.map(m => m.agent.consult(query, contextData).then(r => ({ name: m.name, result: r })))
        );
        return results.filter(r => r.status === 'fulfilled').map(r => r.value);
    }

    /** Diagnostic manifest. */
    getManifest() {
        return this.table.map(e => `  ${e.agent.name}: [${e.keywords.slice(0, 4).join(', ')}...]`).join('\n');
    }
}

export const capabilityRouter = new CapabilityRouter();

import { swarmBus } from './self_expanding_swarm.service.js';

swarmBus.on('swarm:agent_hotload', ({ agentInstance, keywords }) => {
    capabilityRouter.registerAgent(agentInstance, keywords);
});
