export default class Model {
  constructor() {
    // Protect public methods from override
    Object.getOwnPropertyNames(Object.getPrototypeOf(this)).forEach((prop) => {
      if (prop !== 'constructor') {
        Object.defineProperty(this, prop, {
          value: this[prop],
          writable: false,
          enumerable: false,
        });
      }
    });

    Object.defineProperty(this, 'bind', {
      value: (attrs, options = {}) => {
        const { writable = false, enumerable = false } = options;

        Object.entries(attrs).forEach(([key, value]) => {
          Object.defineProperty(this, key, {
            value,
            writable,
            enumerable,
          });
        });
      },
      writable: false,
      enumerable: false,
    });
  }
}
