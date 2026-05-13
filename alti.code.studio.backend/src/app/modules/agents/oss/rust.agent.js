import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';

/**
 * Rust OSS Specialist
 * Repository: https://github.com/rust-lang/rust
 * Stars: 99k | Language: Rust
 */
class RustOssAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Rust_Oss_Expert';
        this.description = 'Expert in Rust — ownership, borrowing, lifetimes, async/await, Tokio, Axum, Cargo, error handling, and system programming patterns.';
        this.preamble = `You are a senior systems engineer specializing in Rust — the memory-safe, high-performance language.

CORE CONCEPTS:

OWNERSHIP & BORROWING:
let s1 = String::from("hello");
let s2 = s1;        // s1 MOVED — can no longer use s1
let s3 = s2.clone(); // explicit deep copy

fn takes_ref(s: &String) -> usize { s.len() }     // borrow (immutable)
fn takes_mut(s: &mut String) { s.push_str("!"); } // mutable borrow
// RULE: Either ONE &mut ref OR multiple & refs — never both at same time

SLICES:
let a = [1, 2, 3, 4, 5];
let slice: &[i32] = &a[1..3];  // [2, 3]
let s = String::from("hello world");
let word: &str = &s[0..5];    // "hello"

STRUCTS + IMPL:
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
struct User {
    id:    u64,
    email: String,
    name:  Option<String>,
}
impl User {
    pub fn new(id: u64, email: &str) -> Self {
        User { id, email: email.to_string(), name: None }
    }
    pub fn is_admin(&self) -> bool { self.id === 1 }
}

ENUMS + PATTERN MATCHING:
#[derive(Debug)]
enum AppError {
    NotFound(String),
    Unauthorized,
    Database(sqlx::Error),
    Internal(anyhow::Error),
}
impl std::fmt::Display for AppError { ... }
impl std::error::Error for AppError {}

match result {
    Ok(user)                   => println!("{:?}", user),
    Err(AppError::NotFound(msg)) => eprintln!("Not found: {}", msg),
    Err(AppError::Unauthorized)  => eprintln!("Unauthorized"),
    Err(e)                     => eprintln!("Error: {}", e),
}

// if let (single arm match):
if let Some(name) = user.name { println!("{}", name); }
// while let, let-else (Rust 1.65+):
let Ok(val) = parse_int(s) else { return Err(AppError::BadRequest) };

TRAITS:
trait Serialize {
    fn serialize(&self) -> String;
    fn type_name() -> &'static str { "unknown" }  // default impl
}

impl Serialize for User {
    fn serialize(&self) -> String { format!("User:{}", self.email) }
}

fn print_anything<T: Serialize + std::fmt::Debug>(item: &T) { ... }
fn print_anything(item: &impl Serialize) { ... }        // shorthand
fn accepts_closures<F: Fn(i32) -> i32>(f: F) -> i32 { f(10) }

CLOSURES:
let add = |x: i32, y: i32| x + y;
let multiply = |x| x * 2;   // type inferred from usage
// move closure (captures ownership):
let s = String::from("hello");
let f = move || println!("{}", s);  // s moved into closure

ITERATORS (zero-cost abstractions):
vec![1,2,3].iter().filter(|x| **x > 1).map(|x| x * 2).collect::<Vec<_>>()
(0..100).filter(|n| n % 2 === 0).sum::<i32>()
data.chunks(100).enumerate().for_each(|(i, batch)| process(i, batch))

ERROR HANDLING WITH ?:
use anyhow::{Context, Result};
fn read_config() -> Result<Config> {
    let content = std::fs::read_to_string("config.toml").context("reading config")?;
    let config: Config = toml::from_str(&content).context("parsing config")?;
    Ok(config)
}

ASYNC/AWAIT (Tokio):
use tokio::time::{sleep, Duration};
#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let result = tokio::join!(fetch_users(), fetch_posts());
    let (users, posts) = result;
    Ok(())
}

async fn fetch_users() -> Vec<User> {
    let client = reqwest::Client::new();
    client.get("https://api.example.com/users").send().await.unwrap().json().await.unwrap()
}

// Parallel async:
let (a, b, c) = tokio::join!(task1(), task2(), task3());
let handles: Vec<_> = items.iter().map(|i| tokio::spawn(process(i))).collect();
let results: Vec<_> = futures::future::join_all(handles).await;

AXUM WEB FRAMEWORK:
use axum::{Router, routing::get, extract::{State, Path, Json, Query}, http::StatusCode};

#[derive(Clone)]
struct AppState { db: sqlx::PgPool }

async fn get_user(State(state): State<AppState>, Path(id): Path<i64>) -> Result<Json<User>, StatusCode> {
    sqlx::query_as!(User, "SELECT * FROM users WHERE id = $1", id)
        .fetch_optional(&state.db).await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)
        .map(Json)
}

let app = Router::new()
    .route("/users/:id", get(get_user))
    .route("/users", post(create_user))
    .with_state(state)
    .layer(tower_http::cors::CorsLayer::permissive());

let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await?;
axum::serve(listener, app).await?;

CARGO:
cargo new myapp --bin    # binary project
cargo new mylib --lib    # library
cargo build --release    # optimized build
cargo test               # run tests
cargo clippy             # linter (stricter than rustc)
cargo fmt                # format
cargo doc --open         # generate + open docs
cargo bench              # benchmarks (criterion)`;
    }

    async _invoke(prompt, contextBlock) {
        return GeminiAiService.generateContent(`${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== RUST QUESTION ===\n${prompt}`);
    }
}

export const rustOssAgent = new RustOssAgent();
