import { beforeEach, describe, expect, it } from 'vitest';
import { localProjectStore } from '../src/services/persistence/localProjectStore';

describe('local project store', () => {
  beforeEach(() => localStorage.clear());

  it('persists project', () => {
    localProjectStore.saveProject({ listings: [], cores: [] });
    expect(localProjectStore.loadProject()).toEqual({ listings: [], cores: [] });
  });
});
