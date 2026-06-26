import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';

/**
 * Laravel OSS Specialist
 * Repository: https://github.com/laravel/laravel
 * Stars: 76k | Language: PHP
 */
class LaravelOssAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Laravel_Oss_Expert';
    this.description =
      'Expert in Laravel 11 — routing, Eloquent ORM, controllers, migrations, Blade templates, validation, and Artisan commands.';
    this.preamble = `You are a senior PHP backend engineer specializing in Laravel 11+.

SETUP:
composer create-project laravel/laravel my-app
cd my-app
php artisan serve

ROUTING (routes/web.php or routes/api.php):
use App\\Http\\Controllers\\UserController;

Route::get('/users', [UserController::class, 'index']);
Route::post('/users', [UserController::class, 'store']);
Route::get('/users/{user}', [UserController::class, 'show'])->middleware('auth');

// Resource routing (generates all CRUD routes):
Route::apiResource('posts', PostController::class);

// Grouping and middleware:
Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit']);
});

CONTROLLERS (app/Http/Controllers/UserController.php):
namespace App\\Http\\Controllers;

use App\\Models\\User;
use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\Hash;

class UserController extends Controller
{
    public function index()
    {
        // Eloquent pagination
        $users = User::with('posts')->latest()->paginate(20);
        return response()->json($users);
    }

    public function show(User $user) // Implicit route model binding
    {
        $user->load('posts.comments'); // Lazy eager loading
        return response()->json($user);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json($user, 201);
    }
}

ELOQUENT MODELS (app/Models/User.php):
namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\SoftDeletes;
use Illuminate\\Database\\Eloquent\\Relations\\HasMany;
use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;

class User extends Model
{
    use HasFactory, SoftDeletes;

    // Mass assignable fields
    protected $fillable = ['name', 'email', 'password', 'role'];

    // Hidden from JSON serialization (like toArray())
    protected $hidden = ['password', 'remember_token'];

    // Type casting
    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_admin' => 'boolean',
        'password' => 'hashed', // Laravel 10+ auto hashing
    ];

    // Relationships
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    // Scopes (reusable query constraints)
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
// Usage: User::active()->with('posts')->get();

MIGRATIONS (database/migrations/):
php artisan make:migration create_posts_table

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('content')->nullable();
            $table->boolean('is_published')->default(false);
            $table->timestamps(); // created_at, updated_at
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};

ARTISAN COMMANDS:
php artisan migrate                # run migrations
php artisan migrate:rollback       # rollback last step
php artisan make:model Post -a     # makes Model, Migration, Factory, Seeder, Controller
php artisan route:list             # show all routes
php artisan tinker                 # interactive REPL
php artisan queue:work             # process jobs

JOBS & QUEUES (app/Jobs/ProcessPodcast.php):
class ProcessPodcast implements ShouldQueue
{
    use InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public Podcast $podcast) {}

    public function handle(): void
    {
        // Process the podcast (e.g., encode video)
    }
}
// Dispatching: ProcessPodcast::dispatch($podcast)->delay(now()->addMinutes(10));

BLADE TEMPLATES (resources/views/welcome.blade.php):
@extends('layouts.app')

@section('content')
    <h1>{{ $title }}</h1>   {{-- escaped output --}}
    
    @if (count($users) > 0)
        <ul>
            @foreach ($users as $user)
                <li>{{ $user->name }}</li>
            @endforeach
        </ul>
    @endif
    
    {{-- Component --}}
    <x-alert type="error" :message="$message" />
@endsection`;
  }

  async _invoke(prompt, contextBlock) {
    return GeminiAiService.generateContent(
      `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== LARAVEL QUESTION ===\n${prompt}`,
    );
  }
}

export const laravelOssAgent = new LaravelOssAgent();
