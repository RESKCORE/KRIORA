import type { PracticeProblem } from '../types';

export const LOOPS_PROBLEMS: PracticeProblem[] = [
  {
    id: 'py-029',
    problemNumber: 29,
    slug: 'multiplication-table-generator',
    title: 'Multiplication Table',
    difficulty: 'Easy',
    topic: 'Loops',
    topics: ['Loops', 'Math'],
    relatedDay: 9,
    relatedCurriculumTopic: 'for Loops & range()',
    description: 'Given an integer `N`, print its multiplication table from `1` to `10` in the format `N x i = result` (one line per multiplier).',
    inputFormat: 'A single integer `N`.',
    outputFormat: 'Print 10 lines: `N x 1 = ...` up to `N x 10 = ...`.',
    constraints: '-1000 <= N <= 1000',
    examples: [
      { input: '5', output: '5 x 1 = 5\n5 x 2 = 10\n5 x 3 = 15\n5 x 4 = 20\n5 x 5 = 25\n5 x 6 = 30\n5 x 7 = 35\n5 x 8 = 40\n5 x 9 = 45\n5 x 10 = 50', explanation: 'Table of 5.' },
    ],
    starterCode: 'n = int(input())\n\n# Print multiplication table for 1..10\n',
    hints: [
      'Use for i in range(1, 11): print(f"{n} x {i} = {n * i}").'
    ],
    publicTestCases: [
      { input: '5', expectedOutput: '5 x 1 = 5\n5 x 2 = 10\n5 x 3 = 15\n5 x 4 = 20\n5 x 5 = 25\n5 x 6 = 30\n5 x 7 = 35\n5 x 8 = 40\n5 x 9 = 45\n5 x 10 = 50' },
      { input: '1', expectedOutput: '1 x 1 = 1\n1 x 2 = 2\n1 x 3 = 3\n1 x 4 = 4\n1 x 5 = 5\n1 x 6 = 6\n1 x 7 = 7\n1 x 8 = 8\n1 x 9 = 9\n1 x 10 = 10' },
    ],
    hiddenTestCases: [
      { input: '0', expectedOutput: '0 x 1 = 0\n0 x 2 = 0\n0 x 3 = 0\n0 x 4 = 0\n0 x 5 = 0\n0 x 6 = 0\n0 x 7 = 0\n0 x 8 = 0\n0 x 9 = 0\n0 x 10 = 0' },
      { input: '-3', expectedOutput: '-3 x 1 = -3\n-3 x 2 = -6\n-3 x 3 = -9\n-3 x 4 = -12\n-3 x 5 = -15\n-3 x 6 = -18\n-3 x 7 = -21\n-3 x 8 = -24\n-3 x 9 = -27\n-3 x 10 = -30' },
    ],
    solution: {
      approach: 'Iterate from 1 to 10 with a for loop and print formatted product.',
      code: `n = int(input())
for i in range(1, 11):
    print(f"{n} x {i} = {n * i}")`,
      timeComplexity: 'O(1)',
      spaceComplexity: 'O(1)',
    },
    isPublished: true,
  },
  {
    id: 'py-030',
    problemNumber: 30,
    slug: 'sum-of-first-n-natural-numbers',
    title: 'Sum of First N Natural Numbers',
    difficulty: 'Easy',
    topic: 'Loops',
    topics: ['Loops', 'Math'],
    relatedDay: 9,
    relatedCurriculumTopic: 'Loop Accumulators',
    description: 'Given a positive integer `N`, compute and print the sum of all natural numbers from `1` to `N` (`1 + 2 + ... + N`).',
    inputFormat: 'A single positive integer `N`.',
    outputFormat: 'Print the sum.',
    constraints: '1 <= N <= 10^7',
    examples: [
      { input: '5', output: '15', explanation: '1 + 2 + 3 + 4 + 5 = 15' },
      { input: '10', output: '55', explanation: 'Sum from 1 to 10 is 55' },
    ],
    starterCode: 'n = int(input())\n\n# Compute sum of 1..n\n',
    hints: [
      'You can use a loop or the formula n * (n + 1) // 2.'
    ],
    publicTestCases: [
      { input: '5', expectedOutput: '15' },
      { input: '10', expectedOutput: '55' },
    ],
    hiddenTestCases: [
      { input: '1', expectedOutput: '1' },
      { input: '100', expectedOutput: '5050' },
      { input: '1000000', expectedOutput: '500000500000' },
    ],
    solution: {
      approach: 'Use arithmetic progression sum formula n * (n + 1) // 2 for O(1) performance.',
      code: `n = int(input())
print(n * (n + 1) // 2)`,
      timeComplexity: 'O(1)',
      spaceComplexity: 'O(1)',
    },
    isPublished: true,
  },
  {
    id: 'py-031',
    problemNumber: 31,
    slug: 'factorial-of-a-number',
    title: 'Factorial of a Number',
    difficulty: 'Medium',
    topic: 'Loops',
    topics: ['Loops', 'Math'],
    relatedDay: 9,
    relatedCurriculumTopic: 'Product Accumulator in Loops',
    description: 'Calculate the factorial of a non-negative integer `N` (`N!`). Recall that `0! = 1` and `N! = 1 * 2 * ... * N`.',
    inputFormat: 'A single integer `N`.',
    outputFormat: 'Print `N!`.',
    constraints: '0 <= N <= 100',
    examples: [
      { input: '5', output: '120', explanation: '5! = 5 * 4 * 3 * 2 * 1 = 120' },
      { input: '0', output: '1', explanation: '0! is defined as 1.' },
      { input: '6', output: '720', explanation: '6! = 720' },
    ],
    starterCode: 'n = int(input())\n\n# Compute n!\n',
    hints: [
      'Initialize fact = 1. Loop i from 1 to n: fact *= i.'
    ],
    publicTestCases: [
      { input: '5', expectedOutput: '120' },
      { input: '0', expectedOutput: '1' },
      { input: '6', expectedOutput: '720' },
    ],
    hiddenTestCases: [
      { input: '1', expectedOutput: '1' },
      { input: '10', expectedOutput: '3628800' },
      { input: '20', expectedOutput: '2432902008176640000' },
    ],
    solution: {
      approach: 'Iterative product accumulation with arbitrary precision integers in Python.',
      code: `import math
n = int(input())
print(math.factorial(n))`,
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)',
    },
    isPublished: true,
  },
  {
    id: 'py-032',
    problemNumber: 32,
    slug: 'fibonacci-series-first-n-terms',
    title: 'First N Fibonacci Numbers',
    difficulty: 'Medium',
    topic: 'Loops',
    topics: ['Loops', 'Sequences'],
    relatedDay: 10,
    relatedCurriculumTopic: 'State Variables in Iterations',
    description: 'Print the first `N` numbers of the Fibonacci sequence starting with `0, 1, 1, 2, 3, 5, 8, ...` on a single line separated by spaces.',
    inputFormat: 'A single positive integer `N`.',
    outputFormat: 'Print the first `N` terms separated by space.',
    constraints: '1 <= N <= 50',
    examples: [
      { input: '6', output: '0 1 1 2 3 5', explanation: 'First 6 terms of Fibonacci.' },
      { input: '1', output: '0', explanation: 'First 1 term is 0.' },
      { input: '2', output: '0 1', explanation: 'First 2 terms are 0 and 1.' },
    ],
    starterCode: 'n = int(input())\n\n# Generate and print first n Fibonacci numbers\n',
    hints: [
      'Maintain two variables a, b = 0, 1.',
      'Append a to results, then update a, b = b, a + b.'
    ],
    publicTestCases: [
      { input: '6', expectedOutput: '0 1 1 2 3 5' },
      { input: '1', expectedOutput: '0' },
      { input: '2', expectedOutput: '0 1' },
    ],
    hiddenTestCases: [
      { input: '8', expectedOutput: '0 1 1 2 3 5 8 13' },
      { input: '10', expectedOutput: '0 1 1 2 3 5 8 13 21 34' },
      { input: '3', expectedOutput: '0 1 1' },
    ],
    solution: {
      approach: 'Generate terms sequentially maintaining previous two values.',
      code: `n = int(input())
res = []
a, b = 0, 1
for _ in range(n):
    res.append(str(a))
    a, b = b, a + b
print(" ".join(res))`,
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
    },
    isPublished: true,
  },
  {
    id: 'py-033',
    problemNumber: 33,
    slug: 'prime-number-tester',
    title: 'Prime Number Checker',
    difficulty: 'Medium',
    topic: 'Loops',
    topics: ['Loops', 'Math'],
    relatedDay: 10,
    relatedCurriculumTopic: 'Loop Optimization & Early Exit',
    description: 'Given an integer `N`, determine if it is a prime number (an integer greater than 1 with no positive divisors other than 1 and itself). Print `PRIME` or `NOT PRIME`.',
    inputFormat: 'A single integer `N`.',
    outputFormat: 'Print `PRIME` or `NOT PRIME`.',
    constraints: '-10^9 <= N <= 10^9',
    examples: [
      { input: '17', output: 'PRIME', explanation: '17 has no divisors other than 1 and 17.' },
      { input: '4', output: 'NOT PRIME', explanation: '4 is divisible by 2.' },
      { input: '1', output: 'NOT PRIME', explanation: '1 is not prime by definition.' },
    ],
    starterCode: 'n = int(input())\n\n# Check primality\n',
    hints: [
      'Numbers <= 1 are NOT PRIME.',
      'Check divisors up to int(sqrt(n)).'
    ],
    publicTestCases: [
      { input: '17', expectedOutput: 'PRIME' },
      { input: '4', expectedOutput: 'NOT PRIME' },
      { input: '1', expectedOutput: 'NOT PRIME' },
    ],
    hiddenTestCases: [
      { input: '2', expectedOutput: 'PRIME' },
      { input: '97', expectedOutput: 'PRIME' },
      { input: '1000000', expectedOutput: 'NOT PRIME' },
      { input: '-7', expectedOutput: 'NOT PRIME' },
      { input: '999983', expectedOutput: 'PRIME' },
    ],
    solution: {
      approach: 'Check divisibility from 2 up to sqrt(N).',
      code: `import math
n = int(input())
if n <= 1:
    print("NOT PRIME")
elif n == 2:
    print("PRIME")
elif n % 2 == 0:
    print("NOT PRIME")
else:
    is_prime = True
    for i in range(3, int(math.isqrt(n)) + 1, 2):
        if n % i == 0:
            is_prime = False
            break
    print("PRIME" if is_prime else "NOT PRIME")`,
      timeComplexity: 'O(sqrt(N))',
      spaceComplexity: 'O(1)',
    },
    isPublished: true,
  },
  {
    id: 'py-034',
    problemNumber: 34,
    slug: 'count-and-sum-digits-of-integer',
    title: 'Count and Sum of Digits',
    difficulty: 'Medium',
    topic: 'Loops',
    topics: ['Loops', 'Math'],
    relatedDay: 10,
    relatedCurriculumTopic: 'while Loops & Digit Extraction',
    description: 'Given an integer `N`, count the total number of digits and compute the sum of all digits. Print `count sum` separated by a space. Ignore negative signs.',
    inputFormat: 'A single integer `N`.',
    outputFormat: 'Print `count sum`.',
    constraints: '-10^15 <= N <= 10^15',
    examples: [
      { input: '12345', output: '5 15', explanation: '5 digits, sum = 1+2+3+4+5 = 15.' },
      { input: '-908', output: '3 17', explanation: '3 digits (9, 0, 8), sum = 9+0+8 = 17.' },
      { input: '0', output: '1 0', explanation: '1 digit (0), sum = 0.' },
    ],
    starterCode: 'n = int(input())\n\n# Count and sum digits\n',
    hints: [
      'Convert abs(n) to string: s = str(abs(n)).',
      'Count is len(s), sum is sum(int(c) for c in s).'
    ],
    publicTestCases: [
      { input: '12345', expectedOutput: '5 15' },
      { input: '-908', expectedOutput: '3 17' },
      { input: '0', expectedOutput: '1 0' },
    ],
    hiddenTestCases: [
      { input: '9999999999', expectedOutput: '10 90' },
      { input: '-1', expectedOutput: '1 1' },
      { input: '1000000', expectedOutput: '7 1' },
    ],
    solution: {
      approach: 'Convert absolute value of integer to string, compute length and digit sum.',
      code: `s = str(abs(int(input())))
print(len(s), sum(int(c) for c in s))`,
      timeComplexity: 'O(log10(N))',
      spaceComplexity: 'O(log10(N))',
    },
    isPublished: true,
  },
  {
    id: 'py-035',
    problemNumber: 35,
    slug: 'nested-number-triangle-pattern',
    title: 'Number Pyramid Pattern',
    difficulty: 'Medium',
    topic: 'Loops',
    topics: ['Loops', 'Patterns'],
    relatedDay: 10,
    relatedCurriculumTopic: 'Nested Loops & Patterns',
    description: 'Given an integer `N`, print an `N`-row number pyramid. Row `i` (from `1` to `N`) should contain numbers from `1` to `i` separated by spaces.',
    inputFormat: 'A single positive integer `N`.',
    outputFormat: 'Print `N` lines forming the number triangle.',
    constraints: '1 <= N <= 20',
    examples: [
      { input: '4', output: '1\n1 2\n1 2 3\n1 2 3 4', explanation: '4-row number triangle.' },
      { input: '1', output: '1', explanation: 'Single row triangle.' },
    ],
    starterCode: 'n = int(input())\n\n# Print number pyramid pattern\n',
    hints: [
      'Use nested loops: outer loop i from 1 to n, inner numbers from 1 to i.'
    ],
    publicTestCases: [
      { input: '4', expectedOutput: '1\n1 2\n1 2 3\n1 2 3 4' },
      { input: '1', expectedOutput: '1' },
    ],
    hiddenTestCases: [
      { input: '2', expectedOutput: '1\n1 2' },
      { input: '5', expectedOutput: '1\n1 2\n1 2 3\n1 2 3 4\n1 2 3 4 5' },
    ],
    solution: {
      approach: 'For each row i from 1 to N, join numbers from 1 to i with spaces.',
      code: `n = int(input())
for i in range(1, n + 1):
    print(" ".join(str(x) for x in range(1, i + 1)))`,
      timeComplexity: 'O(N^2)',
      spaceComplexity: 'O(N)',
    },
    isPublished: true,
  },
  {
    id: 'py-036',
    problemNumber: 36,
    slug: 'greatest-common-divisor-and-lcm',
    title: 'GCD and LCM',
    difficulty: 'Medium',
    topic: 'Loops',
    topics: ['Loops', 'Math', 'Algorithms'],
    relatedDay: 10,
    relatedCurriculumTopic: 'Euclidean Algorithm',
    description: 'Given two positive integers `a` and `b`, calculate their Greatest Common Divisor (GCD) and Least Common Multiple (LCM). Print `GCD LCM` separated by a space.',
    inputFormat: 'Two space-separated integers `a b`.',
    outputFormat: 'Print `GCD LCM`.',
    constraints: '1 <= a, b <= 10^9',
    examples: [
      { input: '12 18', output: '6 36', explanation: 'GCD(12, 18) = 6, LCM(12, 18) = (12 * 18) / 6 = 36' },
      { input: '7 13', output: '1 91', explanation: 'Co-prime numbers have GCD 1.' },
    ],
    starterCode: 'a, b = map(int, input().split())\n\n# Compute GCD and LCM\n',
    hints: [
      'Use math.gcd(a, b).',
      'LCM is (a * b) // gcd(a, b).'
    ],
    publicTestCases: [
      { input: '12 18', expectedOutput: '6 36' },
      { input: '7 13', expectedOutput: '1 91' },
    ],
    hiddenTestCases: [
      { input: '100 25', expectedOutput: '25 100' },
      { input: '1000000 1000000', expectedOutput: '1000000 1000000' },
      { input: '14 35', expectedOutput: '7 70' },
    ],
    solution: {
      approach: 'Use math.gcd and relation lcm = (a * b) // gcd.',
      code: `import math
a, b = map(int, input().split())
g = math.gcd(a, b)
l = (a * b) // g
print(g, l)`,
      timeComplexity: 'O(log(min(a, b)))',
      spaceComplexity: 'O(1)',
    },
    isPublished: true,
  },
  {
    id: 'py-037',
    problemNumber: 37,
    slug: 'armstrong-narcissistic-number-checker',
    title: 'Armstrong Number Checker',
    difficulty: 'Medium',
    topic: 'Loops',
    topics: ['Loops', 'Math'],
    relatedDay: 10,
    relatedCurriculumTopic: 'Digits & Power Sums',
    description: 'An Armstrong number (narcissistic number) of `k` digits is an integer such that the sum of its digits raised to the power of `k` equals the number itself (e.g. `153 = 1^3 + 5^3 + 3^3 = 1 + 125 + 27 = 153`). Print `ARMSTRONG` or `NOT ARMSTRONG`.',
    inputFormat: 'A single positive integer `N`.',
    outputFormat: 'Print `ARMSTRONG` or `NOT ARMSTRONG`.',
    constraints: '1 <= N <= 10^9',
    examples: [
      { input: '153', output: 'ARMSTRONG', explanation: '1^3 + 5^3 + 3^3 = 153' },
      { input: '9474', output: 'ARMSTRONG', explanation: '9^4 + 4^4 + 7^4 + 4^4 = 9474' },
      { input: '123', output: 'NOT ARMSTRONG', explanation: '1^3 + 2^3 + 3^3 = 36 != 123' },
    ],
    starterCode: 'n = int(input())\n\n# Check if Armstrong number\n',
    hints: [
      'k = len(str(n))',
      'sum of d**k for each digit d in str(n) == n.'
    ],
    publicTestCases: [
      { input: '153', expectedOutput: 'ARMSTRONG' },
      { input: '9474', expectedOutput: 'ARMSTRONG' },
      { input: '123', expectedOutput: 'NOT ARMSTRONG' },
    ],
    hiddenTestCases: [
      { input: '370', expectedOutput: 'ARMSTRONG' },
      { input: '371', expectedOutput: 'ARMSTRONG' },
      { input: '407', expectedOutput: 'ARMSTRONG' },
      { input: '1', expectedOutput: 'ARMSTRONG' },
      { input: '500', expectedOutput: 'NOT ARMSTRONG' },
    ],
    solution: {
      approach: 'Convert number to string, count digits k, sum digit^k and compare to n.',
      code: `n = int(input())
s = str(n)
k = len(s)
if sum(int(c)**k for c in s) == n:
    print("ARMSTRONG")
else:
    print("NOT ARMSTRONG")`,
      timeComplexity: 'O(log10(N))',
      spaceComplexity: 'O(log10(N))',
    },
    isPublished: true,
  },
  {
    id: 'py-038',
    problemNumber: 38,
    slug: 'collatz-conjecture-sequence-length',
    title: 'Collatz Conjecture Steps',
    difficulty: 'Hard',
    topic: 'Loops',
    topics: ['Loops', 'Sequences', 'Math'],
    relatedDay: 10,
    relatedCurriculumTopic: 'while Loop Termination & Collatz',
    description: 'Starting with a positive integer `N`, apply the Collatz rules: if `N` is even, `N = N // 2`; if `N` is odd, `N = 3 * N + 1`. Repeat until `N` reaches `1`. Print the total number of steps taken, followed by a space, followed by the maximum value reached during the sequence.',
    inputFormat: 'A single positive integer `N`.',
    outputFormat: 'Print `steps max_value`.',
    constraints: '1 <= N <= 10^6',
    examples: [
      { input: '6', output: '8 16', explanation: '6 -> 3 -> 10 -> 5 -> 16 -> 8 -> 4 -> 2 -> 1 (8 steps, max 16).' },
      { input: '1', output: '0 1', explanation: '0 steps needed, max is 1.' },
    ],
    starterCode: 'n = int(input())\n\n# Compute Collatz steps and peak value\n',
    hints: [
      'Initialize steps = 0, peak = n.',
      'while n > 1: update peak, apply rule, increment steps.'
    ],
    publicTestCases: [
      { input: '6', expectedOutput: '8 16' },
      { input: '1', expectedOutput: '0 1' },
    ],
    hiddenTestCases: [
      { input: '7', expectedOutput: '16 52' },
      { input: '27', expectedOutput: '111 9232' },
      { input: '16', expectedOutput: '4 16' },
    ],
    solution: {
      approach: 'Track peak value and step counter in a while loop until n becomes 1.',
      code: `n = int(input())
steps = 0
peak = n
while n > 1:
    if n % 2 == 0:
        n //= 2
    else:
        n = 3 * n + 1
    if n > peak:
        peak = n
    steps += 1
print(steps, peak)`,
      timeComplexity: 'O(Steps)',
      spaceComplexity: 'O(1)',
    },
    isPublished: true,
  },
];
