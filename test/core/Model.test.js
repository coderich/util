import Model from '../../src/core/Model';

describe('Model Class', () => {
  test('Default class behavior', () => {
    const M = class extends Model {
      constructor() {
        super();
        this.name = 'richard';
      }

      getName() {
        return this.name;
      }
    };

    const m = new M();
    expect(m.name).toBe('richard');
    expect(m.getName()).toBe('richard');

    // Override
    expect(() => (m.name = 'paul')).not.toThrow();
    expect(m.name).toBe('paul');
    expect(m.getName()).toBe('paul');
  });

  test('Protected properties', () => {
    const M = class extends Model {
      constructor() {
        super();
        this.defineProperties({
          name: 'richard',
        });
      }

      getName() {
        return this.name;
      }
    };

    const m = new M();
    expect(m.name).toBe('richard');
    expect(m.getName()).toBe('richard');

    // Override
    expect(() => (m.name = 'paul')).toThrow();
    expect(m.name).toBe('richard');
    expect(m.getName()).toBe('richard');
  });

  test('Identity functions', () => {
    const obj = {
      dispatch: val => val,
      name: 'name',
    };

    const M = class extends Model {
      constructor() {
        super();

        this.defineProperties({
          name: 'richard',
        });

        this.definePolymorphicFunctions({
          get: ['dispatch', obj],
        });
      }

      getName() {
        return this.name;
      }
    };

    const m = new M();
    expect(m.name).toBe('richard');
    expect(m.getName()).toBe('richard');

    // Override
    expect(() => (m.name = 'paul')).toThrow();
    expect(m.name).toBe('richard');
    expect(m.getName()).toBe('richard');

    //
    expect(m.get('hi')).toEqual('hi');
    expect(m.get.name).toBe('name');
  });
});
