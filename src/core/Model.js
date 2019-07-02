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

    // Allow you to define properties with scope
    Object.defineProperty(this, 'defineProperties', {
      value: (props, options = {}) => {
        const { writable = false, enumerable = false } = options;

        Object.entries(props).forEach(([key, value]) => {
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

    // Define a property that acts as both an object and a function
    Object.defineProperty(this, 'definePolymorphicFunctions', {
      value: (hash, options = {}) => {
        const { writable = false, enumerable = false } = options;

        Object.entries(hash).forEach(([prop, [fn, obj]]) => {
          Object.defineProperty(this, prop, {
            value: new Proxy(() => obj, {
              get: (target, p, receiver) => {
                if (Object.prototype.hasOwnProperty.call(obj, p)) return obj[p];
                return target;
              },
              apply: (target, thisArg, argumentsList) => {
                return obj[fn].apply(thisArg, argumentsList);
              },
            }),
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
