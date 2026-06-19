import { describe, it, expect } from 'vitest';
import { SpscRingBuffer } from './spsc_ring_buffer.js';

describe('SpscRingBuffer Tests', () => {
    it('should initialize with default parameters', () => {
        const ring = new SpscRingBuffer();
        expect(ring.capacity).toBe(2000);
        expect(ring.slotSize).toBe(1024);
        expect(ring.length).toBe(0);
    });

    it('should push and pop items in FIFO order', () => {
        const ring = new SpscRingBuffer(5, 256);
        const item1 = { id: 1, text: 'hello' };
        const item2 = { id: 2, text: 'world' };

        expect(ring.push(item1)).toBe(true);
        expect(ring.push(item2)).toBe(true);
        expect(ring.length).toBe(2);

        const pop1 = ring.pop();
        expect(pop1).toEqual(item1);
        expect(ring.length).toBe(1);

        const pop2 = ring.pop();
        expect(pop2).toEqual(item2);
        expect(ring.length).toBe(0);
    });

    it('should return null when popping from an empty buffer', () => {
        const ring = new SpscRingBuffer(5, 256);
        expect(ring.pop()).toBeNull();
    });

    it('should return false when pushing to a full buffer', () => {
        // With capacity N, SPSC ring buffer holds at most N-1 items due to circular logic (head/tail collision check)
        const ring = new SpscRingBuffer(3, 256);
        const item1 = { val: 'a' };
        const item2 = { val: 'b' };
        const item3 = { val: 'c' };

        expect(ring.push(item1)).toBe(true);
        expect(ring.push(item2)).toBe(true);
        expect(ring.push(item3)).toBe(false); // Should fail to push third item (full)
        expect(ring.length).toBe(2);
    });

    it('should handle large payloads and fail if they exceed slot size limit', () => {
        const ring = new SpscRingBuffer(5, 32); // very small slot size
        const hugeItem = { key: 'this_is_a_very_long_string_that_will_exceed_thirty_two_bytes' };
        expect(ring.push(hugeItem)).toBe(false);
    });
});
