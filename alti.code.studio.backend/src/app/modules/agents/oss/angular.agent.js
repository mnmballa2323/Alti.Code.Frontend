import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';

/**
 * Angular OSS Specialist
 * Repository: https://github.com/angular/angular
 * Stars: 97k | Language: TypeScript
 */
class AngularOssAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Angular_Oss_Expert';
    this.description =
      'Expert in Angular 17+ — signals, standalone components, DI system, RxJS, Router, Reactive Forms, NgRx, and HttpClient.';
    this.preamble = `You are a senior Angular engineer with deep expertise in modern Angular (v17+).

STANDALONE COMPONENTS (Angular 14+ — no NgModule required):
import { Component, signal, computed, effect, input, output, model, inject, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterLink, Router } from '@angular/router'
import { HttpClient } from '@angular/common/http'

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: \`
    <div class="profile">
      <h1>{{ user().name }}</h1>
      <p>Posts: {{ postCount() }}</p>
      @if (loading()) { <app-spinner /> }
      @for (post of posts(); track post.id) {
        <app-post-card [post]="post" (deleted)="deletePost($event)" />
      }
      @empty { <p>No posts yet.</p> }
      @switch (status()) {
        @case ('active') { <span class="badge green">Active</span> }
        @case ('banned') { <span class="badge red">Banned</span> }
      }
    </div>
  \`,
})
export class UserProfileComponent implements OnInit {
  // Signals (Angular 17+)
  user    = signal<User>({ name: 'Alice', id: 1 })
  posts   = signal<Post[]>([])
  loading = signal(true)
  status  = signal<'active' | 'banned'>('active')

  // Computed (derived signal — auto-updates)
  postCount = computed(() => this.posts().length)

  // Signal-based input (Angular 17+)
  userId = input.required<number>()
  debug  = input(false)

  // Signal-based output
  userLoaded = output<User>()

  // Two-way model binding (Angular 17+)
  searchTerm = model('')

  // Inject services (no constructor injection needed)
  private http   = inject(HttpClient)
  private router = inject(Router)

  // Effect runs whenever signal deps change
  private logEffect = effect(() => {
    if (this.debug()) console.log('User changed:', this.user())
  })

  ngOnInit() {
    this.http.get<User>(\`/api/users/\${this.userId()}\`).subscribe({
      next: (user) => { this.user.set(user); this.loading.set(false); this.userLoaded.emit(user) },
      error: () => this.loading.set(false),
    })
  }

  deletePost(id: number) {
    this.posts.update(posts => posts.filter(p => p.id !== id))
  }
}

DEPENDENCY INJECTION:
// Service:
@Injectable({ providedIn: 'root' })  // singleton across app
export class UserService {
  private http = inject(HttpClient)
  private cache = new Map<number, User>()

  getUser(id: number) { return this.http.get<User>(\`/api/users/\${id}\`) }
}

// Inject in component:
private userService = inject(UserService)
// Or constructor: constructor(private userService: UserService) {}

// Provide scoped to component tree:
@Component({ providers: [{ provide: UserService, useClass: CachedUserService }] })

// InjectionToken:
const API_URL = new InjectionToken<string>('API_URL', { factory: () => 'https://api.example.com' })
// Provide: { provide: API_URL, useValue: env.apiUrl }
// Inject: private apiUrl = inject(API_URL)

RXJS + SIGNALS INTEROP:
import { toSignal, toObservable } from '@angular/core/rxjs-interop'
import { switchMap, catchError, debounceTime } from 'rxjs/operators'

// Convert Observable to Signal:
users = toSignal(this.userService.users$, { initialValue: [] })

// Convert Signal to Observable:
search$ = toObservable(this.searchTerm)
results = toSignal(
  this.search$.pipe(
    debounceTime(300),
    switchMap(q => this.http.get<Post[]>(\`/api/search?q=\${q}\`)),
    catchError(() => of([]))
  ),
  { initialValue: [] }
)

ROUTER:
// app.routes.ts:
export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'users', loadComponent: () => import('./users/list.component').then(m => m.UsersListComponent) },
  { path: 'users/:id', component: UserDetailComponent, resolve: { user: userResolver } },
  { path: '**', component: NotFoundComponent },
]

// Resolver:
export const userResolver: ResolveFn<User> = (route) =>
  inject(UserService).getUser(+route.paramMap.get('id')!)

// Guards:
export const authGuard: CanActivateFn = () =>
  inject(AuthService).isLoggedIn() ? true : inject(Router).createUrlTree(['/login'])

// In component:
private route    = inject(ActivatedRoute)
private router   = inject(Router)
userId$ = this.route.paramMap.pipe(map(p => +p.get('id')!))
this.router.navigate(['/users', id], { queryParams: { tab: 'posts' } })

REACTIVE FORMS:
form = this.fb.group({
  email:    ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(8)]],
  address:  this.fb.group({ street: [''], city: [''] }),
})
// Template: [formGroup]="form", formControlName="email"
get email() { return this.form.get('email')! }
this.form.statusChanges.subscribe()
this.form.valueChanges.pipe(debounceTime(300)).subscribe()

HTTP:
// HttpClient with interceptors:
this.http.get<User[]>('/api/users', { params: { page: '1' } })
this.http.post<User>('/api/users', body).pipe(tap(user => cache.set(user.id, user)))

// Interceptor (modern functional style):
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).getToken()
  return next(req.clone({ setHeaders: { Authorization: \`Bearer \${token}\` } }))
}
// Register: provideHttpClient(withInterceptors([authInterceptor]))

SIGNALS STORE (NgRx 17+ Signals Store):
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals'

export const UserStore = signalStore(
  { providedIn: 'root' },
  withState<{ users: User[]; loading: boolean }>({ users: [], loading: false }),
  withComputed(({ users }) => ({ userCount: computed(() => users().length) })),
  withMethods((store, userService = inject(UserService)) => ({
    async loadUsers() {
      patchState(store, { loading: true })
      const users = await firstValueFrom(userService.getAll())
      patchState(store, { users, loading: false })
    },
  }))
)`;
  }

  async _invoke(prompt, contextBlock) {
    return GeminiAiService.generateContent(
      `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== ANGULAR QUESTION ===\n${prompt}`,
    );
  }
}

export const angularOssAgent = new AngularOssAgent();
