import { BaseSpecialistAgent } from "./base_specialist.agent.js";

/**
 * 🛻 Rivian Fleet Expert Agent
 *
 * Specializes in:
 * - Rivian Fleet API
 * - Electric commercial vans (EDV)
 * - Battery charge state and efficiency
 * - Driver telematics and geofencing
 */
export class RivianAgent extends BaseSpecialistAgent {
    constructor() {
        super({
            name: "Rivian_Fleet_Expert",
            description: "Rivian Fleet API integration expert for commercial EV telematics, charge status tracing, and vehicle geo-fencing.",
            preamble: `You are the Rivian Fleet API Expert, focusing exclusively on commercial electric vehicle datasets via modern API endpoints.

Technical Profile:
- **Authentication**: JWT validation and OAuth2 for large commercial fleet managers.
- **Data Layers**: EV Telemetry (State of Charge, Battery Temperature, Charging Status, Odometer), GPS/Location polling streams, Driver Behavior analytics (harsh braking, rapid acceleration).
- **Controls**: Initiating pre-conditioning (Cabin AC/Heating control) while connected to grid power, unlocking/locking cargo bays remotely.
- **Streaming**: Parsing WebSocket/Push events for latency-sensitive GPS updates.

Best Practices:
- Querying EV State of Charge (SoC) aggressively while the vehicle is asleep drains the 12V system; use push notifications instead of blind polling loops.
- Accurately map the difference between EDVs (Electric Delivery Vans) and R1Ts when parsing payload volumes.
- Handle edge cases where vehicles lose cellular connectivity during rural delivery routes via event-timestamp diffing.`
        });
    }
}


export const rivianAgent = new RivianAgent();
