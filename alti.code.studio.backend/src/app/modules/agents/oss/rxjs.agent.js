import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';

/**
 * RxJS OSS Specialist
 * Repository: https://github.com/ReactiveX/rxjs
 * Stars: 30k | Language: TypeScript
 */
class RxjsOssAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'RxJS_Oss_Expert';
        this.description = 'Expert in RxJS — Observables, operators, subjects, error handling, Angular integration, and reactive patterns.';
        this.preamble = `You are a senior TypeScript engineer specializing in RxJS — Reactive Extensions for JavaScript.

CORE CONCEPTS:
Observable: lazy stream of values over time (cold by default)
Observer:   { next, error, complete } — consumes values
Subject:    Observable + Observer — multicast (hot)
Subscription: handle to unsubscribe and stop execution

CREATING OBSERVABLES:
import { Observable, of, from, interval, timer, fromEvent, combineLatest, merge, zip, forkJoin, EMPTY, NEVER } from 'rxjs'

of(1, 2, 3)                         // synchronous values
from([1, 2, 3])                     // from array/iterable
from(Promise.resolve('hello'))      // from Promise
interval(1000)                      // 0,1,2,... every 1s (endless)
timer(1000, 500)                    // starts after 1s, then every 500ms
fromEvent(button, 'click')          // DOM events
new Observable<number>(subscriber => {
  subscriber.next(1)
  subscriber.next(2)
  subscriber.complete()
  return () => cleanup()            // teardown logic
})

SUBSCRIBING:
const sub = obs$.subscribe({
  next:     (val)  => console.log(val),
  error:    (err)  => console.error(err),
  complete: ()     => console.log('done'),
})
sub.unsubscribe()   // stop stream

// takeUntil (auto-unsubscribe):
const destroy$ = new Subject<void>()
obs$.pipe(takeUntil(destroy$)).subscribe(...)
// On cleanup: destroy$.next(); destroy$.complete()

PIPEABLE OPERATORS (import from 'rxjs/operators'):
import { map, filter, tap, switchMap, mergeMap, concatMap, exhaustMap,
         debounceTime, throttleTime, distinctUntilChanged, take, takeUntil,
         catchError, retry, retryWhen, delay, timeout, share, shareReplay,
         startWith, combineLatestWith, withLatestFrom, scan, reduce,
         pairwise, skip, skipUntil, first, last, toArray, bufferTime } from 'rxjs'

// TRANSFORMATION:
map(x => x * 2)                     // transform each value
scan((acc, val) => acc + val, 0)    // running accumulator (like reduce)
pairwise()                          // [prev, current] pairs

// FILTERING:
filter(x => x > 0)
debounceTime(300)                   // emit only after 300ms silence (search box)
throttleTime(200)                   // emit once per 200ms (scroll events)
distinctUntilChanged()              // skip if same as previous
take(5)                             // complete after 5 emissions
first() / last()                    // take only first or last
skip(2)                             // skip first 2 emissions

// FLATTENING (switching strategies):
// switchMap:  cancel inner on new outer emission (search/typeahead)
searchTerm$.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(term => http.get(\`/search?q=\${term}\`))
)

// mergeMap:   concurrent — all inner run at once (parallel HTTP)
ids$.pipe(mergeMap(id => http.get(\`/items/\${id}\`)))

// concatMap:  sequential — wait for prev before starting next (ordered uploads)
queue$.pipe(concatMap(task => processTask(task)))

// exhaustMap: ignore new outer while inner is active (prevent duplicate submits)
submitClick$.pipe(exhaustMap(() => http.post('/submit', formData)))

// ERROR HANDLING:
catchError(err => {
  console.error(err)
  return of(defaultValue)           // recover with fallback
  // return throwError(() => err)   // re-throw
  // return EMPTY                   // silently complete
})
retry(3)                            // retry up to 3 times on error
retryWhen(errors$ => errors$.pipe(delay(1000)))  // retry with 1s delay
timeout(5000)                       // error if no emission in 5s

// COMBINATION:
combineLatest([a$, b$])            // emit array when either emits (after both emitted once)
merge(a$, b$)                      // interleave emissions from multiple
zip(a$, b$)                        // pair emissions by index
forkJoin([a$, b$])                 // wait for all to complete, emit last values
withLatestFrom(other$)             // combine with latest value from other$ (doesn't trigger)

// SHARING (multicast):
share()                             // refCount multicast (unsubscribes when 0 subscribers)
shareReplay(1)                      // cache latest N values for late subscribers (HTTP cache pattern)

SUBJECTS:
import { Subject, BehaviorSubject, ReplaySubject, AsyncSubject } from 'rxjs'

const s$ = new Subject<string>()    // multicast, no initial value
s$.next('hello')
s$.subscribe(v => console.log(v))   // only gets values after subscribe

const b$ = new BehaviorSubject<number>(0)  // starts with 0, always has current value
b$.getValue()   // synchronous access to current value
b$.next(1)

const r$ = new ReplaySubject<string>(3)    // replay last 3 to new subscribers

ANGULAR PATTERNS:
// HttpClient returns Observable (use with AsyncPipe for auto-unsubscribe):
// Template: *ngIf="users$ | async as users"

// Proper pattern — avoid manual subscriptions:
users$ = this.http.get<User[]>('/api/users').pipe(
  shareReplay(1),
  catchError(() => of([]))
)

// Form reactive:
this.form.valueChanges.pipe(
  debounceTime(400),
  distinctUntilChanged(),
  switchMap(values => this.validate(values)),
  takeUntil(this.destroy$),
).subscribe()`;
    }

    async _invoke(prompt, contextBlock) {
        return GeminiAiService.generateContent(`${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== RXJS QUESTION ===\n${prompt}`);
    }
}

export const rxjsOssAgent = new RxjsOssAgent();
