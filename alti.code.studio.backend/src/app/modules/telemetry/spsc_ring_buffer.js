/**
 * Copyright (c) 2026 Inso Code
 *
 * Single Producer Single Consumer (SPSC) Lock-Free Ring Buffer
 * Utilizes SharedArrayBuffer and Atomics for pointer synchronization.
 */
export class SpscRingBuffer {
  constructor(capacity = 2000, slotSize = 1024, sharedBuffer = null) {
    this.capacity = capacity;
    this.slotSize = slotSize;
    const headerSize = 16; // 4 ints: head, tail, capacity, slotSize
    const totalSize = headerSize + capacity * slotSize;

    if (sharedBuffer) {
      this.sab = sharedBuffer;
      this.header = new Int32Array(this.sab, 0, 4);
      this.capacity = this.header[2];
      this.slotSize = this.header[3];
    } else {
      this.sab = new SharedArrayBuffer(totalSize);
      this.header = new Int32Array(this.sab, 0, 4);
      this.header[0] = 0; // head
      this.header[1] = 0; // tail
      this.header[2] = this.capacity;
      this.header[3] = this.slotSize;
    }

    // Slots starts at byte 16
    this.slotsData = new Uint8Array(this.sab, headerSize);
    this.encoder = new TextEncoder();
    this.decoder = new TextDecoder();
  }

  /**
   * Push an event to the tail of the buffer. Lock-free.
   * @param {Object} item
   * @returns {boolean} true if successful, false if full
   */
  push(item) {
    const head = Atomics.load(this.header, 0);
    const tail = Atomics.load(this.header, 1);

    // Full condition: (tail + 1) % capacity === head
    const nextTail = (tail + 1) % this.capacity;
    if (nextTail === head) {
      return false; // Buffer is full
    }

    try {
      const str = JSON.stringify(item);
      const encoded = this.encoder.encode(str);

      if (encoded.length > this.slotSize - 2) {
        // Event too large for slot size
        return false;
      }

      // Write length in first 2 bytes of the slot
      const offset = tail * this.slotSize;
      this.slotsData[offset] = encoded.length & 0xff;
      this.slotsData[offset + 1] = (encoded.length >> 8) & 0xff;

      // Write data
      this.slotsData.set(encoded, offset + 2);

      // Update tail atomically
      Atomics.store(this.header, 1, nextTail);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Pop an event from the head of the buffer. Lock-free.
   * @returns {Object|null} parsed event or null if empty
   */
  pop() {
    const head = Atomics.load(this.header, 0);
    const tail = Atomics.load(this.header, 1);

    if (head === tail) {
      return null; // Buffer is empty
    }

    const offset = head * this.slotSize;
    const length = this.slotsData[offset] | (this.slotsData[offset + 1] << 8);

    if (length === 0) {
      // Safety fallback, increment head
      const nextHead = (head + 1) % this.capacity;
      Atomics.store(this.header, 0, nextHead);
      return null;
    }

    const dataBytes = this.slotsData.subarray(offset + 2, offset + 2 + length);
    let parsed = null;
    try {
      const str = this.decoder.decode(dataBytes);
      parsed = JSON.parse(str);
    } catch (e) {
      // Invalid data / JSON error
    }

    // Update head atomically
    const nextHead = (head + 1) % this.capacity;
    Atomics.store(this.header, 0, nextHead);

    return parsed;
  }

  get length() {
    const head = Atomics.load(this.header, 0);
    const tail = Atomics.load(this.header, 1);
    if (tail >= head) {
      return tail - head;
    }
    return this.capacity - head + tail;
  }
}
