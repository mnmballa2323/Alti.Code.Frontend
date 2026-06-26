import {
  vi,
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
} from 'vitest';
import child_process from 'child_process';
import fs from 'fs';

// Mocks must be hoisted before module import
vi.mock('fs');
vi.mock('child_process');
vi.mock('uuid', () => ({ v4: () => 'mock-uuid-1234' }));
vi.mock('../../../shared/logger.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

describe('Director (Borg Mission Orchestrator)', () => {
  let director;
  let maestro;

  beforeAll(async () => {
    // Default exec mock — success
    child_process.exec.mockImplementation((cmd, options, cb) => {
      if (typeof options === 'function') cb = options;
      cb(null, { stdout: 'ok', stderr: '' });
    });

    fs.existsSync.mockReturnValue(false);
    fs.mkdirSync.mockImplementation(() => {});

    const maestroMod = await import('../Maestro.js');
    const directorMod = await import('../Director.js');
    maestro = maestroMod.maestro;
    director = directorMod.director;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    maestro.activeSwarms.clear();
    director.activeMissions.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should start a mission and return a mission ID', async () => {
    const missionId = await director.startMission('Write a REST API', 'user-1');
    expect(missionId).toBeTruthy();
    expect(typeof missionId).toBe('string');
  });

  it('should register the mission state immediately after start', async () => {
    const missionId = await director.startMission(
      'Refactor auth module',
      'user-2',
    );
    const status = director.getMissionStatus(missionId);
    expect(status).toBeDefined();
    expect(status.goal).toBe('Refactor auth module');
    expect(['provisioning', 'planning', 'executing', 'completed']).toContain(
      status.status,
    );
  });

  it('should log messages to the mission log', async () => {
    const missionId = await director.startMission('Log test', 'user-3');
    director.log(missionId, 'Test log entry');
    const status = director.getMissionStatus(missionId);
    const found = status.logs.some(l => l.message === 'Test log entry');
    expect(found).toBe(true);
  });

  it('should update mission status via updateMissionStatus', async () => {
    const missionId = await director.startMission(
      'Status update test',
      'user-4',
    );
    director.updateMissionStatus(missionId, 'failed', 'Simulated failure');
    const status = director.getMissionStatus(missionId);
    expect(status.status).toBe('failed');
    expect(status.error).toBe('Simulated failure');
  });

  it('should handle an unknown missionId for getMissionStatus gracefully', () => {
    const status = director.getMissionStatus('nonexistent-id');
    expect(status).toBeUndefined();
  });

  it('should handle an unknown missionId for log gracefully without throwing', () => {
    expect(() =>
      director.log('nonexistent-id', 'This should not throw'),
    ).not.toThrow();
  });

  it('should handle an unknown missionId for updateMissionStatus without throwing', () => {
    expect(() =>
      director.updateMissionStatus('nonexistent-id', 'failed'),
    ).not.toThrow();
  });
});
