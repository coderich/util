import { of, Subject, Subscription } from 'rxjs';
import { share, mergeMap } from 'rxjs/operators';

export default class Action {
  constructor(type, worker = async a => a) {
    this.type = type;
    this.operators = [mergeMap(worker)];
    this.toString = () => `${type}`;

    // Subjects
    this.subjects = {
      request: new Subject().pipe(share()),
      success: new Subject().pipe(share()),
      error: new Subject().pipe(share()),
    };
  }

  chain(action) {
    const worker = mergeMap(val => action.dispatch(val));
    this.operators.push(worker);
    return () => (this.operators.splice(this.operators.indexOf(worker), 1));
  }

  pipe(operator) {
    this.operators.push(operator);
    return () => (this.operators.splice(this.operators.indexOf(operator), 1));
  }

  dispatch(payload, meta = {}) {
    // Signal the start of the action
    this.subjects.request.next({ type: `${this.type}:request`, payload, meta });

    const stream = of(payload).pipe(...this.operators);

    stream.subscribe({
      next: value => this.subjects.success.next({ type: `${this.type}:success`, payload: value, meta }),
      error: err => this.subjects.error.next({ type: `${this.type}:error`, payload: err, meta, error: true }),
    });

    return stream;
  }

  subscribe(subscriberObj) {
    if (typeof subscriberObj === 'function') {
      subscriberObj = {
        request: subscriberObj,
        success: subscriberObj,
        error: subscriberObj,
      };
    }

    // Combined subscriptions
    const subscription = new Subscription();
    Object.entries(subscriberObj).forEach(([key, subscriber]) => { subscription.add(this.subjects[key].subscribe(subscriber)); });
    return subscription;
  }

  listen(subscriber) {
    this.subscribe(subscriber);
    return this;
  }
}
