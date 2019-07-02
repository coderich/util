import { map } from 'rxjs/operators';
import Action from '../../src/core/Action';

describe('Action Class', () => {
  test('Simple action', (done) => {
    const action = new Action('simple');

    action.subscribe({
      request: ({ payload, meta }) => {
        expect(payload).toBe(1);
        expect(meta).toEqual({});
      },
      success: ({ payload, meta }) => {
        expect(payload).toBe(1);
        expect(meta).toEqual({});
        done();
      },
    });

    action.dispatch(1);
  });

  test('Mapped action', (done) => {
    const action = new Action('simple');

    action.subscribe({
      request: ({ payload, meta }) => {
        expect(payload).toBe(1);
        expect(meta).toEqual({});
      },
      success: ({ payload, meta }) => {
        expect(payload).toBe(20);
        expect(meta).toEqual({});
        done();
      },
    });

    action.pipe(map(value => 10));
    action.pipe(map(value => value * 2));
    action.dispatch(1);
  });

  test('Mapped (and remove) action', (done) => {
    const action = new Action('simple');

    action.subscribe({
      request: ({ payload, meta }) => {
        expect(payload).toBe(1);
        expect(meta).toEqual({});
      },
      success: ({ payload, meta }) => {
        expect(payload).toBe(1);
        expect(meta).toEqual({});
        done();
      },
    });

    action.pipe(map(value => 10))();
    action.dispatch(1);
  });

  test('Pipe force error', (done) => {
    const action = new Action('simple');

    action.subscribe({
      request: ({ payload, meta }) => {
        expect(payload).toBe(1);
        expect(meta).toEqual({});
      },
      error: ({ payload, meta }) => {
        expect(payload).toEqual(new Error('no can do'));
        expect(meta).toEqual({});
        done();
      },
    });

    action.pipe(map((value) => {
      throw new Error('no can do');
    }));

    action.dispatch(1);
  });

  test('Worker force error', (done) => {
    const action = new Action('simple', async (payload) => {
      throw new Error('be gone');
    });

    action.subscribe({
      request: ({ payload, meta }) => {
        expect(payload).toBe(1);
        expect(meta).toEqual({});
      },
      error: ({ payload, meta }) => {
        expect(payload).toEqual(new Error('be gone'));
        expect(meta).toEqual({});
        done();
      },
    });

    action.dispatch(1);
  });

  test('Combined actions', (done) => {
    const action1 = new Action('five', async () => 5);
    const action2 = new Action('multi4', async val => val * 4);
    const action3 = new Action('multi3', async val => val * 3);

    action1.subscribe({
      request: ({ payload, meta }) => {
        expect(payload).toBe(1);
        expect(meta).toEqual({});
      },
      success: ({ payload, meta }) => {
        expect(payload).toBe(60);
        expect(meta).toEqual({});
        done();
      },
    });

    action1.chain(action2);
    action1.chain(action3);
    action1.dispatch(1);
  });

  test('Combined actions (remove 1)', (done) => {
    const action1 = new Action('five', async () => 5);
    const action2 = new Action('multi4', async val => val * 4);
    const action3 = new Action('multi3', async val => val * 3);

    action1.subscribe({
      request: ({ payload, meta }) => {
        expect(payload).toBe(1);
        expect(meta).toEqual({});
      },
      success: ({ payload, meta }) => {
        expect(payload).toBe(15);
        expect(meta).toEqual({});
        done();
      },
    });

    action1.chain(action2)();
    action1.chain(action3);
    action1.dispatch(1);
  });

  test('Combined actions (remove 2)', (done) => {
    const action1 = new Action('five', async () => 5);
    const action2 = new Action('multi4', async val => val * 4);
    const action3 = new Action('multi3', async val => val * 3);

    action1.subscribe({
      request: ({ payload, meta }) => {
        expect(payload).toBe(1);
        expect(meta).toEqual({});
      },
      success: ({ payload, meta }) => {
        expect(payload).toBe(20);
        expect(meta).toEqual({});
        done();
      },
    });

    action1.chain(action2);
    action1.chain(action3)();
    action1.dispatch(1);
  });

  test('Combined actions (remove all)', (done) => {
    const action1 = new Action('five', async () => 5);
    const action2 = new Action('multi4', async val => val * 4);
    const action3 = new Action('multi3', async val => val * 3);

    action1.subscribe({
      request: ({ payload, meta }) => {
        expect(payload).toBe(1);
        expect(meta).toEqual({});
      },
      success: ({ payload, meta }) => {
        expect(payload).toBe(5);
        expect(meta).toEqual({});
        done();
      },
    });

    action1.chain(action2)();
    action1.chain(action3)();
    action1.dispatch(1);
  });
});
