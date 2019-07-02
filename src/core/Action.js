import { of, Subject, Subscription } from 'rxjs';
import { share, mergeMap } from 'rxjs/operators';
import Model from './Model';

export default class Action extends Model {
  constructor(type, worker = async a => a) {
    super();

    this.defineProperties({
      type,
      operators: [mergeMap(worker)],
      subjects: {
        request: new Subject().pipe(share()),
        success: new Subject().pipe(share()),
        error: new Subject().pipe(share()),
      },
    });
  }

  dispatch(payload, meta = {}) {
    this.subjects.request.next({ type: `${this.type}:request`, payload, meta }); // Request

    const stream = of(payload).pipe(...this.operators);

    stream.subscribe({
      next: value => this.subjects.success.next({ type: `${this.type}:success`, payload: value, meta }), // Success
      error: err => this.subjects.error.next({ type: `${this.type}:error`, payload: err, meta, error: true }), // Error
    });

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

  weld(operator) {
    this.pipe(operator);
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
