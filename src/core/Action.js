import { of, Subject, Subscription } from 'rxjs';
import { share, mergeMap } from 'rxjs/operators';
import Model from './Model';

const ensureWorker = (worker = a => a) => async (val) => {
  const v = await worker(val);
  return v === undefined ? val : v;
};

export default class Action extends Model {
  constructor(type, worker) {
    super();

    this.defineProperties({
      type,
      request: `${type}:request`,
      success: `${type}:success`,
      error: `${type}:error`,
      operators: [mergeMap(ensureWorker(worker))],
      subjects: { request: new Subject().pipe(share()), success: new Subject().pipe(share()), error: new Subject().pipe(share()) },
    });
  }

  dispatch(payload, meta = {}) {
    this.subjects.request.next({ type: `${this.type}:request`, payload, meta });

    const stream = of(payload).pipe(...this.operators, share());

    const promise = new Promise((resolve) => {
      stream.subscribe({
        next: (value) => {
          this.subjects.success.next({ type: `${this.type}:success`, payload: value, meta });
          resolve(value);
        },
        error: (err) => {
          this.subjects.error.next({ type: `${this.type}:error`, payload: err, meta, error: true });
          resolve(err);
        },
      });
    });

    stream.awaitResponse = () => promise;
    return stream;
  }

  pipe(operator) {
    const worker = operator instanceof Action ? mergeMap(val => operator.dispatch(val)) : operator;
    this.operators.push(worker);
    return () => this.operators.splice(this.operators.indexOf(worker), 1); // Unpipe
  }

  subscribe(fnOrObj) {
    const subscription = new Subscription();
    const obj = typeof fnOrObj === 'function' ? { request: fnOrObj, success: fnOrObj, error: fnOrObj } : fnOrObj;
    Object.entries(obj).forEach(([key, subscriber]) => subscription.add(this.subjects[key].subscribe(subscriber)));
    return () => subscription.unsubscribe();
  }

  weld(...operators) {
    operators.forEach(operator => this.pipe(operator));
    return this;
  }

  listen(fnOrObj) {
    this.subscribe(fnOrObj);
    return this;
  }

  toString() {
    return `${this.type}`;
  }
}
