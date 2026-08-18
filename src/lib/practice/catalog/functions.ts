import type { PracticeProblem } from '../types';

export const FUNCTIONS_PROBLEMS: PracticeProblem[] = [
  {
    id: 'py-077',
    problemNumber: 77,
    slug: 'custom-map-and-filter-pipeline',
    title: 'Custom Map and Filter Pipeline',
    difficulty: 'Easy',
    topic: 'Functions',
    topics: ['Functions', 'Higher Order Functions'],
    relatedDay: 23,
    relatedCurriculumTopic: 'First-Class Functions & map/filter',
    description: 'Read an array of integers on one line. Using functional paradigms, filter out all odd numbers, square the remaining even numbers, and print the resulting squared even numbers separated by spaces. If none exist, print `NONE`.',
    inputFormat: 'A single line of space-separated integers.',
    outputFormat: 'Print the transformed list or `NONE`.',
    constraints: '1 <= count of integers <= 10^5',
    examples: [
      { input: '1 2 3 4 5 6', output: '4 16 36', explanation: 'Even numbers: 2, 4, 6 -> Squared: 4, 16, 36.' },
      { input: '1 3 5', output: 'NONE', explanation: 'No even numbers.' },
    ],
    starterCode: 'nums = list(map(int, input().split()))\n\n# Filter even numbers and square them\n',
    hints: [
      'Use list comprehension or filter + map: [x**2 for x in nums if x % 2 == 0].'
    ],
    publicTestCases: [
      { input: '1 2 3 4 5 6', expectedOutput: '4 16 36' },
      { input: '1 3 5', expectedOutput: 'NONE' },
    ],
    hiddenTestCases: [
      { input: '0', expectedOutput: '0' },
      { input: '-2 -4 3', expectedOutput: '4 16' },
      { input: '10', expectedOutput: '100' },
    ],
    solution: {
      approach: 'Filter even numbers and square them using list comprehension.',
      code: `nums = list(map(int, input().split()))
evens_squared = [x**2 for x in nums if x % 2 == 0]
if evens_squared:
    print(" ".join(map(str, evens_squared)))
else:
    print("NONE")`,
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
    },
    isPublished: true,
  },
  {
    id: 'py-078',
    problemNumber: 78,
    slug: 'variable-keyword-arguments-processor',
    title: 'Arbitrary Positional & Keyword Arguments',
    difficulty: 'Easy',
    topic: 'Functions',
    topics: ['Functions', '*args', '**kwargs'],
    relatedDay: 23,
    relatedCurriculumTopic: '*args and **kwargs Unpacking',
    description: 'Line 1 contains a list of numbers representing positional `*args`. Line 2 contains `key=value` pairs representing `**kwargs` where values are integers. Compute and print the sum of all `*args`, followed by a space, followed by the sum of all `**kwargs` integer values.',
    inputFormat: 'Line 1: space-separated integers (*args)\nLine 2: space-separated key=value pairs (**kwargs)',
    outputFormat: 'Print `args_sum kwargs_sum`.',
    constraints: '1 <= count of args, kwargs <= 1000',
    examples: [
      { input: '10 20 30\na=5 b=15 c=25', output: '60 45', explanation: 'args sum = 60, kwargs values sum = 45.' },
      { input: '1 2\nx=100', output: '3 100', explanation: 'Sum of args is 3, sum of kwargs is 100.' },
    ],
    starterCode: '# Process *args and **kwargs sums\n',
    hints: [
      'Parse line 1 with map(int, line1.split()).',
      'Parse line 2 pairs by splitting on "=": [int(pair.split("=")[1]) for pair in line2.split()].'
    ],
    publicTestCases: [
      { input: '10 20 30\na=5 b=15 c=25', expectedOutput: '60 45' },
      { input: '1 2\nx=100', expectedOutput: '3 100' },
    ],
    hiddenTestCases: [
      { input: '0\nz=0', expectedOutput: '0 0' },
      { input: '-5 5\np=-10 q=10', expectedOutput: '0 0' },
    ],
    solution: {
      approach: 'Sum positional args and parse key=value kwargs to sum values.',
      code: `args = list(map(int, input().split()))
kwargs_pairs = input().split()
kwargs_sum = sum(int(pair.split("=")[1]) for pair in kwargs_pairs)
print(sum(args), kwargs_sum)`,
      timeComplexity: 'O(N + M)',
      spaceComplexity: 'O(1)',
    },
    isPublished: true,
  },
  {
    id: 'py-079',
    problemNumber: 79,
    slug: 'function-composition-pipeline',
    title: 'Function Composition Pipeline',
    difficulty: 'Medium',
    topic: 'Functions',
    topics: ['Functions', 'Composition'],
    relatedDay: 24,
    relatedCurriculumTopic: 'Function Decorators & Composition',
    description: 'Read an integer `X` on line 1 and a sequence of function names separated by spaces on line 2 (operations: `double` (x*2), `inc` (x+1), `square` (x^2), `half` (x//2)). Apply the functions sequentially from left to right on `X` and print the final integer result.',
    inputFormat: 'Line 1: integer `X`\nLine 2: space-separated function names',
    outputFormat: 'Print final integer.',
    constraints: '-10^4 <= X <= 10^4, 1 <= operations <= 20',
    examples: [
      { input: '5\ninc double square', output: '144', explanation: '5 -> inc(5)=6 -> double(6)=12 -> square(12)=144.' },
      { input: '10\nhalf inc', output: '6', explanation: '10 -> half(10)=5 -> inc(5)=6.' },
    ],
    starterCode: 'x = int(input())\nops = input().split()\n\n# Apply function pipeline\n',
    hints: [
      'Define a dictionary of operations: {"double": lambda n: n*2, "inc": lambda n: n+1, "square": lambda n: n**2, "half": lambda n: n//2}.',
      'Iterate through ops and update x.'
    ],
    publicTestCases: [
      { input: '5\ninc double square', expectedOutput: '144' },
      { input: '10\nhalf inc', expectedOutput: '6' },
    ],
    hiddenTestCases: [
      { input: '3\nsquare inc double', expectedOutput: '20' },
      { input: '0\ninc inc inc', expectedOutput: '3' },
    ],
    solution: {
      approach: 'Execute chained functions sequentially through a dispatch mapping.',
      code: `x = int(input())
ops = input().split()
dispatch = {
    'double': lambda v: v * 2,
    'inc': lambda v: v + 1,
    'square': lambda v: v ** 2,
    'half': lambda v: v // 2
}
for op in ops:
    if op in dispatch:
        x = dispatch[op](x)
print(x)`,
      timeComplexity: 'O(K)',
      spaceComplexity: 'O(1)',
    },
    isPublished: true,
  },
  {
    id: 'py-080',
    problemNumber: 80,
    slug: 'multi-key-lambda-sorter',
    title: 'Multi-Key Lambda Sorting',
    difficulty: 'Medium',
    topic: 'Functions',
    topics: ['Functions', 'Lambda', 'Sorting'],
    relatedDay: 24,
    relatedCurriculumTopic: 'Custom Lambda Sorting Keys',
    description: 'Read an integer `N`, followed by `N` lines of `Name Score Age`. Sort the records with the following priority: (1) Score in descending order, (2) Age in ascending order for ties in score, (3) Name alphabetically for ties in score and age. Print the sorted records in the format `Name Score Age` (one per line).',
    inputFormat: 'First line `N`. Next `N` lines: `Name Score Age`.',
    outputFormat: 'Print sorted records.',
    constraints: '1 <= N <= 1000, 0 <= Score <= 100, 1 <= Age <= 100',
    examples: [
      { input: '3\nAlice 90 20\nBob 90 19\nCharlie 85 22', output: 'Bob 90 19\nAlice 90 20\nCharlie 85 22', explanation: 'Bob and Alice have score 90, Bob is younger (19 < 20).' },
    ],
    starterCode: 'n = int(input())\n\n# Sort student records using multi-key lambda\n',
    hints: [
      'Store records as (name, int(score), int(age)).',
      'Sort using key=lambda r: (-r[1], r[2], r[0]).'
    ],
    publicTestCases: [
      { input: '3\nAlice 90 20\nBob 90 19\nCharlie 85 22', expectedOutput: 'Bob 90 19\nAlice 90 20\nCharlie 85 22' },
    ],
    hiddenTestCases: [
      { input: '2\nZara 80 25\nAdam 80 25', expectedOutput: 'Adam 80 25\nZara 80 25' },
      { input: '1\nSolo 100 18', expectedOutput: 'Solo 100 18' },
    ],
    solution: {
      approach: 'Sort tuples using custom multi-criteria lambda key.',
      code: `n = int(input())
records = []
for _ in range(n):
    name, score, age = input().split()
    records.append((name, int(score), int(age)))
records.sort(key=lambda r: (-r[1], r[2], r[0]))
for name, score, age in records:
    print(f"{name} {score} {age}")`,
      timeComplexity: 'O(N log N)',
      spaceComplexity: 'O(N)',
    },
    isPublished: true,
  },
  {
    id: 'py-081',
    problemNumber: 81,
    slug: 'memoization-decorator-simulator',
    title: 'Memoized Fibonacci Evaluation',
    difficulty: 'Medium',
    topic: 'Functions',
    topics: ['Functions', 'Decorators', 'Memoization'],
    relatedDay: 24,
    relatedCurriculumTopic: 'Function Decorators & Caching',
    description: 'Implement a memoization cache decorator `@memoize` for computing `Fib(N)` where `Fib(0)=0, Fib(1)=1, Fib(N)=Fib(N-1)+Fib(N-2)`. Read `N` and print `Fib(N)`.',
    inputFormat: 'A single integer `N`.',
    outputFormat: 'Print `Fib(N)`.',
    constraints: '0 <= N <= 100',
    examples: [
      { input: '10', output: '55', explanation: 'Fib(10) = 55.' },
      { input: '30', output: '832040', explanation: 'Fib(30) = 832040.' },
      { input: '0', output: '0', explanation: 'Fib(0) = 0.' },
    ],
    starterCode: 'n = int(input())\n\n# Compute Fib(n) using memoization\n',
    hints: [
      'Use functools.lru_cache(None) or a custom decorator dictionary cache.'
    ],
    publicTestCases: [
      { input: '10', expectedOutput: '55' },
      { input: '30', expectedOutput: '832040' },
      { input: '0', expectedOutput: '0' },
    ],
    hiddenTestCases: [
      { input: '50', expectedOutput: '12586269025' },
      { input: '1', expectedOutput: '1' },
      { input: '2', expectedOutput: '1' },
    ],
    solution: {
      approach: 'Memoized recursion or dynamic programming.',
      code: `import functools
import sys
sys.setrecursionlimit(2000)

@functools.lru_cache(maxsize=None)
def fib(n):
    if n <= 0:
        return 0
    if n == 1:
        return 1
    return fib(n - 1) + fib(n - 2)

n = int(input())
print(fib(n))`,
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
    },
    isPublished: true,
  },
  {
    id: 'py-082',
    problemNumber: 82,
    slug: 'prime-number-generator-stream',
    title: 'Generator Stream of Primes',
    difficulty: 'Medium',
    topic: 'Functions',
    topics: ['Functions', 'Generators'],
    relatedDay: 25,
    relatedCurriculumTopic: 'Generators & yield Keyword',
    description: 'Implement a Python generator function `prime_generator(limit)` that yields all prime numbers up to integer `limit`. Read `limit` and print all generated primes on a single line separated by spaces. If none exist, print `NONE`.',
    inputFormat: 'A single integer `limit`.',
    outputFormat: 'Print space-separated primes or `NONE`.',
    constraints: '1 <= limit <= 10^5',
    examples: [
      { input: '10', output: '2 3 5 7', explanation: 'Primes up to 10.' },
      { input: '1', output: 'NONE', explanation: 'No primes <= 1.' },
    ],
    starterCode: 'limit = int(input())\n\n# Generate primes using yield\n',
    hints: [
      'Use the Sieve of Eratosthenes inside the generator for fast generation.'
    ],
    publicTestCases: [
      { input: '10', expectedOutput: '2 3 5 7' },
      { input: '1', expectedOutput: 'NONE' },
    ],
    hiddenTestCases: [
      { input: '2', expectedOutput: '2' },
      { input: '30', expectedOutput: '2 3 5 7 11 13 17 19 23 29' },
    ],
    solution: {
      approach: 'Sieve of Eratosthenes generator yielding primes.',
      code: `def prime_generator(limit):
    if limit < 2:
        return
    sieve = [True] * (limit + 1)
    sieve[0] = sieve[1] = False
    for i in range(2, int(limit**0.5) + 1):
        if sieve[i]:
            for j in range(i*i, limit + 1, i):
                sieve[j] = False
    for i in range(2, limit + 1):
        if sieve[i]:
            yield i

limit = int(input())
primes = list(prime_generator(limit))
print(" ".join(map(str, primes)) if primes else "NONE")`,
      timeComplexity: 'O(N log log N)',
      spaceComplexity: 'O(N)',
    },
    isPublished: true,
  },
  {
    id: 'py-083',
    problemNumber: 83,
    slug: 'stateful-accumulator-closure',
    title: 'Stateful Accumulator Closure',
    difficulty: 'Medium',
    topic: 'Functions',
    topics: ['Functions', 'Closures'],
    relatedDay: 25,
    relatedCurriculumTopic: 'Closures & nonlocal Keyword',
    description: 'Create a closure `make_accumulator(initial_value)` that keeps a running sum. Read an initial integer `Init` on line 1 and integer operations on line 2 (e.g. `+10 -5 +20`). Apply each operation through the closure and print the running totals after each operation on a single line separated by spaces.',
    inputFormat: 'Line 1: `Init`\nLine 2: space-separated operations like `+5`, `-3`',
    outputFormat: 'Print sequence of running totals.',
    constraints: '-10^5 <= values <= 10^5',
    examples: [
      { input: '100\n+10 -20 +5', output: '110 90 95', explanation: '100+10=110, 110-20=90, 90+5=95.' },
      { input: '0\n+5 +5 +5', output: '5 10 15', explanation: 'Running totals 5, 10, 15.' },
    ],
    starterCode: 'init = int(input())\nops = input().split()\n\n# Simulate closure accumulator\n',
    hints: [
      'In Python closure, use nonlocal total to update state.'
    ],
    publicTestCases: [
      { input: '100\n+10 -20 +5', expectedOutput: '110 90 95' },
      { input: '0\n+5 +5 +5', expectedOutput: '5 10 15' },
    ],
    hiddenTestCases: [
      { input: '50\n-50', expectedOutput: '0' },
      { input: '10\n+1 -1 +1 -1', expectedOutput: '11 10 11 10' },
    ],
    solution: {
      approach: 'Create a stateful closure with nonlocal state variable.',
      code: `def make_accumulator(initial):
    total = initial
    def add(delta):
        nonlocal total
        total += delta
        return total
    return add

init = int(input())
acc = make_accumulator(init)
ops = input().split()
res = [str(acc(int(op))) for op in ops]
print(" ".join(res))`,
      timeComplexity: 'O(K)',
      spaceComplexity: 'O(K)',
    },
    isPublished: true,
  },
  {
    id: 'py-084',
    problemNumber: 84,
    slug: 'currying-and-partial-application-engine',
    title: 'Currying Arithmetic Functions',
    difficulty: 'Hard',
    topic: 'Functions',
    topics: ['Functions', 'Currying'],
    relatedDay: 25,
    relatedCurriculumTopic: 'Function Currying & Partial Functions',
    description: 'Implement a curried multiplication function `multiply(a)(b)(c)` that takes three arguments one at a time and returns their product `a * b * c`. Read three integers `a`, `b`, and `c` on one line and compute the result through the curried function.',
    inputFormat: 'Three space-separated integers `a b c`.',
    outputFormat: 'Print `a * b * c`.',
    constraints: '-1000 <= a, b, c <= 1000',
    examples: [
      { input: '2 3 4', output: '24', explanation: 'multiply(2)(3)(4) = 24.' },
      { input: '-5 2 10', output: '-100', explanation: '-5 * 2 * 10 = -100.' },
    ],
    starterCode: 'a, b, c = map(int, input().split())\n\n# Compute curried product\n',
    hints: [
      'def multiply(a):\n    return lambda b: lambda c: a * b * c'
    ],
    publicTestCases: [
      { input: '2 3 4', expectedOutput: '24' },
      { input: '-5 2 10', expectedOutput: '-100' },
    ],
    hiddenTestCases: [
      { input: '0 5 10', expectedOutput: '0' },
      { input: '10 10 10', expectedOutput: '1000' },
    ],
    solution: {
      approach: 'Define nested lambda functions for curried execution.',
      code: `def multiply(a):
    return lambda b: lambda c: a * b * c

a, b, c = map(int, input().split())
print(multiply(a)(b)(c))`,
      timeComplexity: 'O(1)',
      spaceComplexity: 'O(1)',
    },
    isPublished: true,
  },
];
