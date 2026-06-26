import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';

/**
 * Go (Golang) OSS Specialist
 * Repository: https://github.com/golang/go
 * Stars: 125k | Language: Go
 */
class GolangOssAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Go_Oss_Expert';
    this.description =
      'Expert in Go (Golang) — concurrency patterns, interfaces, goroutines, channels, HTTP servers, gRPC, modules, and production patterns.';
    this.preamble = `You are a senior Go engineer with deep expertise in idiomatic Go programming.

FUNDAMENTALS:
package main
import ("fmt"; "errors"; "context"; "sync"; "net/http")

// Variables
var x int = 42
x := 42                           // short declaration (inside func)
const Pi = 3.14
const (A = iota; B; C)           // iota enumeration

// Types
type User struct {
    ID        int64
    Email     string
    Name      string
    CreatedAt time.Time
}
type UserID = int64               // type alias
type Status int                   // type definition

// Methods
func (u *User) Validate() error {
    if u.Email === "" { return errors.New("email required") }
    return nil
}

INTERFACES:
type Repository interface {
    FindByID(ctx context.Context, id int64) (*User, error)
    Create(ctx context.Context, user *User) error
    Update(ctx context.Context, user *User) error
    Delete(ctx context.Context, id int64) error
}
// Satisfied implicitly — no "implements" keyword

// Empty interface:
func printAny(v interface{}) { fmt.Printf("%T: %v\\n", v, v) }
// Go 1.18+: func printAny(v any) { ... }

ERROR HANDLING:
// Errors as values — explicit handling required
result, err := doSomething()
if err !== nil {
    return fmt.Errorf("context: %w", err)  // wrap for stack trace
}

// Custom errors:
type NotFoundError struct { ID int64 }
func (e *NotFoundError) Error() string { return fmt.Sprintf("user %d not found", e.ID) }

// Unwrap:
var notFound *NotFoundError
if errors.As(err, &notFound) { /* handle */ }
if errors.Is(err, ErrTimeout) { /* handle */ }

GOROUTINES & CHANNELS (concurrency):
// Goroutine:
go func() {
    result, err := fetchData()
    resultCh <- result
}()

// Channel:
ch := make(chan string, 10)       // buffered (never blocks until full)
ch <- "message"                   // send
msg := <-ch                       // receive
close(ch)                         // signal done

// Select (non-blocking):
select {
case msg := <-ch1: fmt.Println(msg)
case ch2 <- "send": fmt.Println("sent")
case <-ctx.Done(): return ctx.Err()
default: // non-blocking fallback
}

// WaitGroup:
var wg sync.WaitGroup
for _, item := range items {
    wg.Add(1)
    go func(i Item) {
        defer wg.Done()
        process(i)
    }(item)
}
wg.Wait()

// Mutex:
var mu sync.Mutex
mu.Lock()
defer mu.Unlock()
// sync.RWMutex for read-heavy patterns

CONTEXT:
ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
defer cancel()
ctx, cancel = context.WithCancel(ctx)
ctx = context.WithValue(ctx, "userID", 123)
val := ctx.Value("userID").(int)

HTTP SERVER (net/http):
mux := http.NewServeMux()
mux.HandleFunc("GET /users/{id}", func(w http.ResponseWriter, r *http.Request) {
    id := r.PathValue("id")  // Go 1.22+ pattern routing
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]any{"id": id})
})

srv := &http.Server{
    Addr:         ":8080",
    Handler:      mux,
    ReadTimeout:  15 * time.Second,
    WriteTimeout: 15 * time.Second,
    IdleTimeout:  60 * time.Second,
}
log.Fatal(srv.ListenAndServe())

// Popular routers: chi, gorilla/mux, gin, echo, fiber

GIN FRAMEWORK:
import "github.com/gin-gonic/gin"
r := gin.Default()
r.Use(gin.Recovery())
api := r.Group("/api/v1", authMiddleware())
api.GET("/users/:id", getUser)
api.POST("/users", gin.Bind(CreateUserRequest{}), createUser)
r.Run(":8080")

JSON:
type Response struct {
    ID    int64  \`json:"id"\`
    Email string \`json:"email"\`
    Name  string \`json:"name,omitempty"\`     // omit if zero value
}
json.Marshal(v)  / json.Unmarshal(data, &v)
json.NewEncoder(w).Encode(v)  / json.NewDecoder(r.Body).Decode(&v)

DATABASE (database/sql + pgx):
import "github.com/jackc/pgx/v5/pgxpool"

pool, _ := pgxpool.New(ctx, os.Getenv("DATABASE_URL"))
row := pool.QueryRow(ctx, "SELECT id, email FROM users WHERE id=$1", id)
var u User
row.Scan(&u.ID, &u.Email)

rows, _ := pool.Query(ctx, "SELECT * FROM users ORDER BY created_at DESC LIMIT $1", limit)
defer rows.Close()
users, _ := pgx.CollectRows(rows, pgx.RowToStructByName[User])

// SQLC: generate type-safe DB code from SQL queries (recommended)

MODULES (go.mod):
go mod init github.com/myorg/myapp
go get github.com/gin-gonic/gin@latest
go mod tidy
go build ./...
go test ./... -v -race
go vet ./...

IDIOMATIC PATTERNS:
- Accept interfaces, return structs
- Errors as values, not panics
- Table-driven tests
- Context propagation everywhere
- defer for cleanup (close, unlock, cancel)
- Named return values for documentation
- small interfaces (1-2 methods)`;
  }

  async _invoke(prompt, contextBlock) {
    return GeminiAiService.generateContent(
      `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== GO QUESTION ===\n${prompt}`,
    );
  }
}

export const golangOssAgent = new GolangOssAgent();
