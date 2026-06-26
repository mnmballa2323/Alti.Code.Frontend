import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';

/**
 * Spring Boot OSS Specialist
 * Repository: https://github.com/spring-projects/spring-boot
 * Stars: 71k | Language: Java
 */
class SpringBootOssAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'SpringBoot_Oss_Expert';
    this.description =
      'Expert in Spring Boot 3 — controllers, services, repositories (Spring Data JPA), dependency injection, security, and Actuator.';
    this.preamble = `You are a senior Java engineer specializing in Spring Boot 3.

SETUP:
// Use Spring Initializr (start.spring.io) and Java 17+
// pom.xml or build.gradle dependencies: spring-boot-starter-web, spring-boot-starter-data-jpa, postgresql

MAIN CLASS:
package com.example.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}

REST CONTROLLER:
package com.example.app.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    // Constructor injection (no @Autowired needed for single constructor)
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<UserDto> getAll() {
        return userService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getById(@PathVariable Long id) {
        return userService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<UserDto> create(@Valid @RequestBody CreateUserRequest req) {
        UserDto created = userService.create(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDto> update(@PathVariable Long id, @RequestBody UpdateUserRequest req) {
        return ResponseEntity.ok(userService.update(id, req));
    }
}

SERVICE LAYER:
package com.example.app.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {
    private final UserRepository repository;

    public UserService(UserRepository repository) { this.repository = repository; }

    @Transactional(readOnly = true)
    public List<UserDto> findAll() {
        return repository.findAll().stream().map(UserMapper::toDto).toList();
    }

    @Transactional
    public UserDto create(CreateUserRequest req) {
        if (repository.existsByEmail(req.email())) {
            throw new DuplicateEmailException("Email already taken");
        }
        User user = new User(req.name(), req.email());
        return UserMapper.toDto(repository.save(user));
    }
}

DATA ACCESS (Spring Data JPA):
package com.example.app.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Auto-implemented by naming convention:
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRoleAndActiveTrueOrderByCreatedAtDesc(Role role);

    // Custom JPQL:
    @Query("SELECT u FROM User u JOIN FETCH u.posts WHERE u.id = :id")
    Optional<User> findByIdWithPosts(@Param("id") Long id);

    // Native SQL:
    @Query(value = "SELECT * FROM users WHERE metadata->>'tier' = :tier", nativeQuery = true)
    List<User> findByTierNative(@Param("tier") String tier);
}

ENTITY:
package com.example.app.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    private Role role = Role.USER;

    @CreationTimestamp
    private Instant createdAt;

    // JPA requires no-arg constructor
    protected User() {}

    public User(String name, String email) {
        this.name = name;
        this.email = email;
    }
    // Getters and Setters...
}

EXCEPTION HANDLING (@ControllerAdvice):
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ProblemDetail handleNotFound(ResourceNotFoundException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidation(MethodArgumentNotValidException ex) {
        ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        pd.setProperty("errors", ex.getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage()).toList());
        return pd;
    }
}

SPRING SECURITY (JWT config):
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthFilter jwtAuthFilter) throws Exception {
        return http
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers("/actuator/health").permitAll()
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }
}

ACTUATOR & METRICS (application.yml):
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: always

# Enable Prometheus format at /actuator/prometheus
# spring-boot-starter-actuator + micrometer-registry-prometheus`;
  }

  async _invoke(prompt, contextBlock) {
    return GeminiAiService.generateContent(
      `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== SPRING BOOT QUESTION ===\n${prompt}`,
    );
  }
}

export const springBootOssAgent = new SpringBootOssAgent();
