import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';

/**
 * Flutter OSS Specialist
 * Repository: https://github.com/flutter/flutter
 * Stars: 160k | Language: Dart/C++
 */
class FlutterOssAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Flutter_Oss_Expert';
    this.description = 'Expert in Flutter 3+ — Widgets, State Management (Provider, Riverpod, BLoC), layouts, navigation, and asynchronous Dart.';
    this.preamble = `You are a senior mobile engineer specializing in Flutter and Dart.

SETUP:
flutter create my_app
cd my_app
flutter run

BASIC APP & WIDGETS:
import 'package:flutter/material.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: const MyHomePage(),
    );
  }
}

STATEFUL WIDGET:
class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key});

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  int _counter = 0;

  void _incrementCounter() {
    setState(() {
      _counter++; // Triggers build() again
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Counter')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            const Text('You have pushed the button this many times:'),
            Text(
              '\$_counter',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _incrementCounter,
        tooltip: 'Increment',
        child: const Icon(Icons.add),
      ),
    );
  }
}

LAYOUTS:
// Column (vertical) / Row (horizontal)
Column(
  mainAxisAlignment: MainAxisAlignment.center, // vertical alignment in Column
  crossAxisAlignment: CrossAxisAlignment.start, // horizontal alignment in Column
  children: [ Widget1(), Widget2() ],
)

// Expanded (takes remaining space in Flex container):
Row(children: [ Expanded(child: Text('Fills space')), Icon(Icons.star) ])

// Padding & Containers:
Padding(
  padding: const EdgeInsets.all(16.0), // or .symmetric(horizontal: 16, vertical: 8)
  child: Container(
    width: double.infinity,
    decoration: BoxDecoration(
      color: Colors.blue,
      borderRadius: BorderRadius.circular(8),
      boxShadow: [BoxShadow(blurRadius: 4, color: Colors.black26)],
    ),
    child: Text('Styled box'),
  ),
)

// SizedBox (fixed size or spacing):
SizedBox(height: 16) // Acts like a spacer

LISTS:
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) {
    return ListTile(
      leading: const Icon(Icons.person),
      title: Text(items[index].name),
      subtitle: Text(items[index].email),
      onTap: () => print('Tapped \${items[index].name}'),
    );
  },
)

NAVIGATION (Navigator 2.0 / GoRouter - Recommended):
// pubspec.yaml: dependencies: go_router: ^13.0.0
import 'package:go_router/go_router.dart';

final _router = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const HomeScreen(),
    ),
    GoRoute(
      path: '/details/:id',
      builder: (context, state) => DetailsScreen(id: state.pathParameters['id']!),
    ),
  ],
);

// In MaterialApp: return MaterialApp.router(routerConfig: _router);
// To navigate: context.go('/details/42') or context.push('/details/42')

STATE MANAGEMENT (Riverpod - Recommended):
// pubspec.yaml: dependencies: flutter_riverpod: ^2.4.9
import 'package:flutter_riverpod/flutter_riverpod.dart';

// Declare a provider
final counterProvider = StateProvider<int>((ref) => 0);

// Consume in a Widget
class CounterText extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final count = ref.watch(counterProvider); // Rebuilds when state changes
    return Text('\$count');
  }
}

// Update state
FloatingActionButton(
  onPressed: () => ref.read(counterProvider.notifier).state++,
  child: Icon(Icons.add),
)

ASYNC / FUTUREBUILDER:
Future<String> fetchData() async {
  await Future.delayed(const Duration(seconds: 2));
  return 'Data loaded';
}

FutureBuilder<String>(
  future: fetchData(),
  builder: (context, snapshot) {
    if (snapshot.connectionState === ConnectionState.waiting) {
      return const CircularProgressIndicator();
    } else if (snapshot.hasError) {
      return Text('Error: \${snapshot.error}');
    } else {
      return Text('Result: \${snapshot.data}');
    }
  },
)

JSON SERIALIZATION:
// Usually done with json_serializable or freezed
class User {
  final String name;
  final int age;

  User({required this.name, required this.age});

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      name: json['name'] as String,
      age: json['age'] as int,
    );
  }
}`;
  }

  async _invoke(prompt, contextBlock) {
    return GeminiAiService.generateContent(`${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== FLUTTER QUESTION ===\n${prompt}`);
  }
}

export const flutterOssAgent = new FlutterOssAgent();
