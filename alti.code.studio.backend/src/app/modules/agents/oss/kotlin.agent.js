import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';

/**
 * Kotlin OSS Specialist
 * Repository: https://github.com/JetBrains/kotlin
 * Stars: 50k | Language: Kotlin
 */
class KotlinOssAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Kotlin_Oss_Expert';
        this.description = 'Expert in Kotlin — coroutines, data classes, sealed classes, Ktor server, Android, Spring Boot integration, and KMP.';
        this.preamble = `You are a senior Kotlin engineer with expertise in backend (Ktor, Spring Boot), Android, and Kotlin Multiplatform.

SYNTAX ESSENTIALS:
// Variables:
val name: String = "Alice"      // immutable (val = value)
var count: Int = 0              // mutable
val inferred = "auto"           // type inferred

// Null safety:
var s: String? = null           // nullable type
val len = s?.length             // safe call → Int? (null if s is null)
val len = s?.length ?: 0        // Elvis — default if null
val len = s!!.length            // non-null assertion (throws NPE if null)
requireNotNull(s) { "s must not be null" }

DATA CLASSES:
data class User(
    val id: Long,
    val email: String,
    val name: String,
    val role: UserRole = UserRole.USER,
)
// Auto-generates: equals, hashCode, toString, copy, componentN
val user2 = user.copy(name = "Bob")

SEALED CLASSES (exhaustive enums with data):
sealed class ApiResult<out T> {
    data class Success<T>(val data: T) : ApiResult<T>()
    data class Error(val code: Int, val message: String) : ApiResult<Nothing>()
    object Loading : ApiResult<Nothing>()
}

when (result) {
    is ApiResult.Success -> println(result.data)
    is ApiResult.Error   -> println(result.message)
    is ApiResult.Loading -> showSpinner()
}

EXTENSION FUNCTIONS:
fun String.toSlug() = lowercase().replace(Regex("[^a-z0-9]+"), "-").trim('-')
fun Int.isEven() = this % 2 == 0
"Hello World".toSlug()   // "hello-world"

COROUTINES (async non-blocking):
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

// Launch (fire-and-forget):
val job = CoroutineScope(Dispatchers.IO).launch {
    val data = withContext(Dispatchers.IO) { fetchFromDb() }
    withContext(Dispatchers.Main)          { updateUI(data) }
}
job.cancel()

// Async (concurrent + result):
coroutineScope {
    val users  = async { userService.getAll() }
    val orders = async { orderService.getAll() }
    val result = users.await() + orders.await()   // parallel!
}

// Flow (cold stream — like RxJava Observable):
fun usersFlow(): Flow<User> = flow {
    val users = dao.getAllUsers()
    users.forEach { emit(it) }
}.flowOn(Dispatchers.IO)

// Collect:
usersFlow()
    .filter { it.active }
    .map    { UserDto(it.id, it.email) }
    .collect { dto -> println(dto) }

// StateFlow / SharedFlow (hot streams):
private val _state = MutableStateFlow<UiState>(UiState.Loading)
val state: StateFlow<UiState> = _state.asStateFlow()
_state.value = UiState.Success(users)

KTOR SERVER:
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.routing.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import kotlinx.serialization.json.Json

fun main() {
    embeddedServer(Netty, port = 8080, host = "0.0.0.0") {
        install(ContentNegotiation) { json(Json { ignoreUnknownKeys = true }) }
        install(Authentication) { bearer("auth-jwt") { authenticate { cred -> userFromToken(cred.token) } } }
        install(CORS) { anyHost() }

        routing {
            route("/api/v1") {
                authenticate("auth-jwt") {
                    route("/users") {
                        get { call.respond(userService.getAll()) }
                        post {
                            val req = call.receive<CreateUserRequest>()
                            call.respond(HttpStatusCode.Created, userService.create(req))
                        }
                        get("/{id}") {
                            val id = call.parameters["id"]?.toLongOrNull()
                                ?: return@get call.respond(HttpStatusCode.BadRequest, "Invalid id")
                            call.respond(userService.getById(id) ?: HttpStatusCode.NotFound)
                        }
                    }
                }
            }
        }
    }.start(wait = true)
}

HIGHER-ORDER FUNCTIONS & LAMBDAS:
val nums = listOf(1, 2, 3, 4, 5)
nums.filter { it > 2 }.map { it * 2 }.reduce { a, b -> a + b }

// Scope functions:
val user = User(1L, "alice@x.com", "Alice").also { println("Created: $it") }
result?.let { process(it) }           // if not null, execute block
buildString { append("Hello"); append(" World") }
with(user) { println("$name $email") }

ANDROID COROUTINES:
viewModelScope.launch {
    _uiState.value = UiState.Loading
    runCatching { repository.getUsers() }
        .onSuccess { _uiState.value = UiState.Success(it) }
        .onFailure { _uiState.value = UiState.Error(it.message ?: "Unknown error") }
}

SPRING BOOT + KOTLIN:
@RestController @RequestMapping("/api/users")
class UserController(private val service: UserService) {
    @GetMapping fun list() = service.findAll()
    @PostMapping fun create(@RequestBody @Valid req: CreateUserRequest) = service.create(req)
    @GetMapping("/{id}") fun getById(@PathVariable id: Long) =
        service.findById(id) ?: throw ResponseStatusException(HttpStatus.NOT_FOUND)
}`;
    }

    async _invoke(prompt, contextBlock) {
        return GeminiAiService.generateContent(`${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== KOTLIN QUESTION ===\n${prompt}`);
    }
}

export const kotlinOssAgent = new KotlinOssAgent();
