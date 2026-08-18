import type { PracticeProblem } from '../types';

export const CONDITIONALS_PROBLEMS: PracticeProblem[] = [
  {
    id: 'py-021',
    problemNumber: 21,
    slug: 'even-or-odd-classifier',
    title: 'Even or Odd Number',
    difficulty: 'Easy',
    topic: 'Conditionals',
    topics: ['Conditionals', 'Math'],
    relatedDay: 6,
    relatedCurriculumTopic: 'if-else Conditional Statements',
    description: 'Read an integer `N`. Print `Even` if the number is divisible by 2, otherwise print `Odd`.',
    inputFormat: 'A single integer `N`.',
    outputFormat: 'Print `Even` or `Odd`.',
    constraints: '-10^9 <= N <= 10^9',
    examples: [
      { input: '4', output: 'Even', explanation: '4 % 2 == 0 so it is Even.' },
      { input: '-7', output: 'Odd', explanation: '-7 is an Odd number.' },
      { input: '0', output: 'Even', explanation: '0 is Even.' },
    ],
    starterCode: 'n = int(input())\n\n# Check if even or odd\n',
    hints: [
      'Use the modulo operator: n % 2 == 0.'
    ],
    publicTestCases: [
      { input: '4', expectedOutput: 'Even' },
      { input: '-7', expectedOutput: 'Odd' },
      { input: '0', expectedOutput: 'Even' },
    ],
    hiddenTestCases: [
      { input: '1000000001', expectedOutput: 'Odd' },
      { input: '-2', expectedOutput: 'Even' },
      { input: '99', expectedOutput: 'Odd' },
    ],
    solution: {
      approach: 'Check if n % 2 == 0.',
      code: `n = int(input())
print("Even" if n % 2 == 0 else "Odd")`,
      timeComplexity: 'O(1)',
      spaceComplexity: 'O(1)',
    },
    isPublished: true,
  },
  {
    id: 'py-022',
    problemNumber: 22,
    slug: 'leap-year-checker',
    title: 'Leap Year Checker',
    difficulty: 'Medium',
    topic: 'Conditionals',
    topics: ['Conditionals', 'Math'],
    relatedDay: 6,
    relatedCurriculumTopic: 'Nested Conditions & Logical Operators',
    description: 'Given a year `Y`, determine if it is a leap year. A year is a leap year if it is divisible by 4, except end-of-century years which must be divisible by 400. Print `Leap Year` if true, otherwise `Not Leap Year`.',
    inputFormat: 'A single positive integer `Y`.',
    outputFormat: 'Print `Leap Year` or `Not Leap Year`.',
    constraints: '1 <= Y <= 9999',
    examples: [
      { input: '2024', output: 'Leap Year', explanation: '2024 is divisible by 4 and not a century year.' },
      { input: '1900', output: 'Not Leap Year', explanation: '1900 is divisible by 100 but not by 400.' },
      { input: '2000', output: 'Leap Year', explanation: '2000 is divisible by 400.' },
    ],
    starterCode: 'year = int(input())\n\n# Check leap year condition\n',
    hints: [
      'Condition: (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0).'
    ],
    publicTestCases: [
      { input: '2024', expectedOutput: 'Leap Year' },
      { input: '1900', expectedOutput: 'Not Leap Year' },
      { input: '2000', expectedOutput: 'Leap Year' },
    ],
    hiddenTestCases: [
      { input: '2023', expectedOutput: 'Not Leap Year' },
      { input: '2400', expectedOutput: 'Leap Year' },
      { input: '2100', expectedOutput: 'Not Leap Year' },
    ],
    solution: {
      approach: 'Evaluate (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0).',
      code: `y = int(input())
if (y % 4 == 0 and y % 100 != 0) or (y % 400 == 0):
    print("Leap Year")
else:
    print("Not Leap Year")`,
      timeComplexity: 'O(1)',
      spaceComplexity: 'O(1)',
    },
    isPublished: true,
  },
  {
    id: 'py-023',
    problemNumber: 23,
    slug: 'largest-of-three-distinct-numbers',
    title: 'Maximum of Three Numbers',
    difficulty: 'Medium',
    topic: 'Conditionals',
    topics: ['Conditionals'],
    relatedDay: 6,
    relatedCurriculumTopic: 'Multi-Way Branching (if-elif-else)',
    description: 'Read three integers `a`, `b`, and `c` on one line and print the largest of the three without using the built-in `max()` function.',
    inputFormat: 'Three space-separated integers `a b c`.',
    outputFormat: 'Print the maximum integer.',
    constraints: '-10^9 <= a, b, c <= 10^9',
    examples: [
      { input: '10 45 23', output: '45', explanation: '45 is the greatest.' },
      { input: '-5 -1 -10', output: '-1', explanation: '-1 is the greatest.' },
      { input: '7 7 7', output: '7', explanation: 'All are equal.' },
    ],
    starterCode: 'a, b, c = map(int, input().split())\n\n# Find largest using conditionals\n',
    hints: [
      'Compare a with b and c using if/elif/else statements.'
    ],
    publicTestCases: [
      { input: '10 45 23', expectedOutput: '45' },
      { input: '-5 -1 -10', expectedOutput: '-1' },
      { input: '7 7 7', expectedOutput: '7' },
    ],
    hiddenTestCases: [
      { input: '100 50 25', expectedOutput: '100' },
      { input: '10 20 30', expectedOutput: '30' },
      { input: '0 0 -1', expectedOutput: '0' },
    ],
    solution: {
      approach: 'Compare variables using if-elif-else logic.',
      code: `a, b, c = map(int, input().split())
if a >= b and a >= c:
    print(a)
elif b >= a and b >= c:
    print(b)
else:
    print(c)`,
      timeComplexity: 'O(1)',
      spaceComplexity: 'O(1)',
    },
    isPublished: true,
  },
  {
    id: 'py-024',
    problemNumber: 24,
    slug: 'triangle-classifier-by-sides',
    title: 'Triangle Validity and Classification',
    difficulty: 'Medium',
    topic: 'Conditionals',
    topics: ['Conditionals', 'Geometry'],
    relatedDay: 7,
    relatedCurriculumTopic: 'Compound Boolean Expressions',
    description: 'Given three side lengths `a`, `b`, and `c`, determine if they form a valid triangle (triangle inequality: `a + b > c`, `a + c > b`, `b + c > a`). If valid, classify it as `EQUILATERAL` (all 3 sides equal), `ISOSCELES` (exactly 2 sides equal), or `SCALENE` (all 3 sides different). If invalid, print `INVALID`.',
    inputFormat: 'Three space-separated integers `a b c`.',
    outputFormat: 'Print `EQUILATERAL`, `ISOSCELES`, `SCALENE`, or `INVALID`.',
    constraints: '1 <= a, b, c <= 10^5',
    examples: [
      { input: '5 5 5', output: 'EQUILATERAL', explanation: 'All 3 sides are 5.' },
      { input: '5 5 8', output: 'ISOSCELES', explanation: 'Two sides equal and 5 + 5 > 8.' },
      { input: '3 4 5', output: 'SCALENE', explanation: 'Valid triangle with 3 distinct sides.' },
      { input: '1 2 5', output: 'INVALID', explanation: '1 + 2 is not > 5.' },
    ],
    starterCode: 'a, b, c = map(int, input().split())\n\n# Validate and classify triangle\n',
    hints: [
      'First check validity: a + b > c and a + c > b and b + c > a.',
      'If valid, check if a == b == c for Equilateral.',
      'Then check if a == b or b == c or a == c for Isosceles, else Scalene.'
    ],
    publicTestCases: [
      { input: '5 5 5', expectedOutput: 'EQUILATERAL' },
      { input: '5 5 8', expectedOutput: 'ISOSCELES' },
      { input: '3 4 5', expectedOutput: 'SCALENE' },
      { input: '1 2 5', expectedOutput: 'INVALID' },
    ],
    hiddenTestCases: [
      { input: '2 2 4', expectedOutput: 'INVALID' },
      { input: '10 10 10', expectedOutput: 'EQUILATERAL' },
      { input: '7 10 5', expectedOutput: 'SCALENE' },
    ],
    solution: {
      approach: 'Check triangle inequality first, then side equality.',
      code: `a, b, c = map(int, input().split())
if a + b <= c or a + c <= b or b + c <= a:
    print("INVALID")
elif a == b == c:
    print("EQUILATERAL")
elif a == b or b == c or a == c:
    print("ISOSCELES")
else:
    print("SCALENE")`,
      timeComplexity: 'O(1)',
      spaceComplexity: 'O(1)',
    },
    isPublished: true,
  },
  {
    id: 'py-025',
    problemNumber: 25,
    slug: 'quadratic-equation-root-classifier',
    title: 'Quadratic Equation Solver',
    difficulty: 'Medium',
    topic: 'Conditionals',
    topics: ['Conditionals', 'Math'],
    relatedDay: 7,
    relatedCurriculumTopic: 'Discriminant & Mathematical Conditions',
    description: 'Given coefficients `a`, `b`, and `c` of `ax^2 + bx + c = 0` (`a != 0`), calculate the discriminant `D = b^2 - 4ac`. If `D > 0`, print `REAL DISTINCT: <r1> <r2>` where `r1 < r2` both formatted to 2 decimals. If `D == 0`, print `REAL EQUAL: <r>` formatted to 2 decimals. If `D < 0`, print `COMPLEX ROOTS`.',
    inputFormat: 'Three space-separated numbers: `a b c`.',
    outputFormat: 'Print the root classification as specified.',
    constraints: '-1000 <= a, b, c <= 1000, a != 0',
    examples: [
      { input: '1 -3 2', output: 'REAL DISTINCT: 1.00 2.00', explanation: 'Roots are 1 and 2.' },
      { input: '1 -2 1', output: 'REAL EQUAL: 1.00', explanation: 'D = 0, root is 1.00.' },
      { input: '1 2 5', output: 'COMPLEX ROOTS', explanation: 'D = 4 - 20 = -16 < 0.' },
    ],
    starterCode: 'import math\na, b, c = map(float, input().split())\n\n# Compute D = b^2 - 4ac and classify roots\n',
    hints: [
      'd = b**2 - 4*a*c',
      'If d > 0, r1 = (-b - math.sqrt(d))/(2*a), r2 = (-b + math.sqrt(d))/(2*a). Make sure min(r1, r2) is printed first.'
    ],
    publicTestCases: [
      { input: '1 -3 2', expectedOutput: 'REAL DISTINCT: 1.00 2.00' },
      { input: '1 -2 1', expectedOutput: 'REAL EQUAL: 1.00' },
      { input: '1 2 5', expectedOutput: 'COMPLEX ROOTS' },
    ],
    hiddenTestCases: [
      { input: '2 4 2', expectedOutput: 'REAL EQUAL: -1.00' },
      { input: '1 0 -4', expectedOutput: 'REAL DISTINCT: -2.00 2.00' },
      { input: '3 1 2', expectedOutput: 'COMPLEX ROOTS' },
    ],
    solution: {
      approach: 'Calculate discriminant D and branch on positive, zero, negative.',
      code: `import math
a, b, c = map(float, input().split())
d = b**2 - 4*a*c
if abs(d) < 1e-9:
    r = -b / (2*a)
    print(f"REAL EQUAL: {r:.2f}")
elif d > 0:
    r1 = (-b - math.sqrt(d)) / (2*a)
    r2 = (-b + math.sqrt(d)) / (2*a)
    low, high = min(r1, r2), max(r1, r2)
    print(f"REAL DISTINCT: {low:.2f} {high:.2f}")
else:
    print("COMPLEX ROOTS")`,
      timeComplexity: 'O(1)',
      spaceComplexity: 'O(1)',
    },
    isPublished: true,
  },
  {
    id: 'py-026',
    problemNumber: 26,
    slug: 'letter-grade-evaluator',
    title: 'Academic Grade Evaluator',
    difficulty: 'Easy',
    topic: 'Conditionals',
    topics: ['Conditionals'],
    relatedDay: 7,
    relatedCurriculumTopic: 'Interval Conditions & Grading Thresholds',
    description: 'Read an integer score `S` (0 to 100). Output the letter grade according to the scale: [90-100] -> `A+`, [80-89] -> `A`, [70-79] -> `B`, [60-69] -> `C`, [50-59] -> `D`, [0-49] -> `F`. If score is outside 0-100, print `INVALID SCORE`.',
    inputFormat: 'A single integer `S`.',
    outputFormat: 'Print the letter grade.',
    constraints: '-1000 <= S <= 1000',
    examples: [
      { input: '95', output: 'A+', explanation: '95 is >= 90.' },
      { input: '72', output: 'B', explanation: '72 is in 70-79.' },
      { input: '45', output: 'F', explanation: '45 is < 50.' },
      { input: '105', output: 'INVALID SCORE', explanation: 'Scores above 100 are invalid.' },
    ],
    starterCode: 'score = int(input())\n\n# Classify score into grade\n',
    hints: [
      'Check if 0 <= score <= 100 first, otherwise print INVALID SCORE.'
    ],
    publicTestCases: [
      { input: '95', expectedOutput: 'A+' },
      { input: '72', expectedOutput: 'B' },
      { input: '45', expectedOutput: 'F' },
      { input: '105', expectedOutput: 'INVALID SCORE' },
    ],
    hiddenTestCases: [
      { input: '90', expectedOutput: 'A+' },
      { input: '80', expectedOutput: 'A' },
      { input: '50', expectedOutput: 'D' },
      { input: '-5', expectedOutput: 'INVALID SCORE' },
      { input: '0', expectedOutput: 'F' },
    ],
    solution: {
      approach: 'Check boundary validity first, then evaluate tiers top-down.',
      code: `s = int(input())
if s < 0 or s > 100:
    print("INVALID SCORE")
elif s >= 90:
    print("A+")
elif s >= 80:
    print("A")
elif s >= 70:
    print("B")
elif s >= 60:
    print("C")
elif s >= 50:
    print("D")
else:
    print("F")`,
      timeComplexity: 'O(1)',
      spaceComplexity: 'O(1)',
    },
    isPublished: true,
  },
  {
    id: 'py-027',
    problemNumber: 27,
    slug: 'calendar-date-validator',
    title: 'Valid Calendar Date Validator',
    difficulty: 'Hard',
    topic: 'Conditionals',
    topics: ['Conditionals', 'Validation'],
    relatedDay: 8,
    relatedCurriculumTopic: 'Complex Boundary Checks',
    description: 'Read a date in `DD MM YYYY` format (three space-separated integers). Check if it represents a valid calendar date in the Gregorian calendar (Year 1 to 9999). Account for months with 30/31 days and leap year rules for February (29 days in leap year, 28 in regular year). Print `VALID` or `INVALID`.',
    inputFormat: 'Three space-separated integers `D M Y`.',
    outputFormat: 'Print `VALID` or `INVALID`.',
    constraints: '1 <= D <= 50, 1 <= M <= 20, 1 <= Y <= 9999',
    examples: [
      { input: '29 2 2024', output: 'VALID', explanation: '2024 is a leap year, so Feb 29 is valid.' },
      { input: '29 2 2023', output: 'INVALID', explanation: '2023 is not a leap year.' },
      { input: '31 4 2020', output: 'INVALID', explanation: 'April has only 30 days.' },
      { input: '31 12 2025', output: 'VALID', explanation: 'December 31 is valid.' },
    ],
    starterCode: 'd, m, y = map(int, input().split())\n\n# Validate date\n',
    hints: [
      'Check if 1 <= m <= 12 and 1 <= y <= 9999.',
      'Define days in month: [31, 28/29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31].',
      'Leap year: (y % 4 == 0 and y % 100 != 0) or (y % 400 == 0).'
    ],
    publicTestCases: [
      { input: '29 2 2024', expectedOutput: 'VALID' },
      { input: '29 2 2023', expectedOutput: 'INVALID' },
      { input: '31 4 2020', expectedOutput: 'INVALID' },
      { input: '31 12 2025', expectedOutput: 'VALID' },
    ],
    hiddenTestCases: [
      { input: '0 5 2020', expectedOutput: 'INVALID' },
      { input: '29 2 1900', expectedOutput: 'INVALID' },
      { input: '29 2 2000', expectedOutput: 'VALID' },
      { input: '30 2 2024', expectedOutput: 'INVALID' },
      { input: '15 13 2022', expectedOutput: 'INVALID' },
    ],
    solution: {
      approach: 'Check month in range 1-12, compute max days for month with leap year logic, verify 1 <= d <= max_days.',
      code: `d, m, y = map(int, input().split())
if not (1 <= m <= 12 and 1 <= y <= 9999):
    print("INVALID")
else:
    is_leap = (y % 4 == 0 and y % 100 != 0) or (y % 400 == 0)
    month_days = [0, 31, 29 if is_leap else 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    if 1 <= d <= month_days[m]:
        print("VALID")
    else:
        print("INVALID")`,
      timeComplexity: 'O(1)',
      spaceComplexity: 'O(1)',
    },
    isPublished: true,
  },
  {
    id: 'py-028',
    problemNumber: 28,
    slug: 'rock-paper-scissors-referee',
    title: 'Rock Paper Scissors Referee',
    difficulty: 'Medium',
    topic: 'Conditionals',
    topics: ['Conditionals', 'Games'],
    relatedDay: 8,
    relatedCurriculumTopic: 'Game Logic & State Matching',
    description: 'Two players play Rock-Paper-Scissors. Read Player 1 choice and Player 2 choice on one line (case-insensitive, choices are `"Rock"`, `"Paper"`, or `"Scissors"`). Output `PLAYER 1 WINS`, `PLAYER 2 WINS`, or `TIE`. If either choice is unrecognized, print `INVALID CHOICE`.',
    inputFormat: 'Two space-separated strings `p1 p2`.',
    outputFormat: 'Print the winner or outcome.',
    constraints: 'Input strings length <= 20.',
    examples: [
      { input: 'Rock Scissors', output: 'PLAYER 1 WINS', explanation: 'Rock crushes Scissors.' },
      { input: 'Paper Paper', output: 'TIE', explanation: 'Both chose Paper.' },
      { input: 'rock lizard', output: 'INVALID CHOICE', explanation: '"lizard" is not a standard choice.' },
    ],
    starterCode: 'p1, p2 = input().split()\n\n# Referee match\n',
    hints: [
      'Convert both to lower case.',
      'Check if both are in {"rock", "paper", "scissors"}.',
      'Winning pairs for Player 1: ("rock", "scissors"), ("scissors", "paper"), ("paper", "rock").'
    ],
    publicTestCases: [
      { input: 'Rock Scissors', expectedOutput: 'PLAYER 1 WINS' },
      { input: 'Paper Paper', expectedOutput: 'TIE' },
      { input: 'rock lizard', expectedOutput: 'INVALID CHOICE' },
    ],
    hiddenTestCases: [
      { input: 'Scissors Rock', expectedOutput: 'PLAYER 2 WINS' },
      { input: 'PAPER scissors', expectedOutput: 'PLAYER 2 WINS' },
      { input: 'SCISSORS Paper', expectedOutput: 'PLAYER 1 WINS' },
      { input: 'stone paper', expectedOutput: 'INVALID CHOICE' },
    ],
    solution: {
      approach: 'Validate inputs in standard set, then check for equality (TIE), winning pairs, or else Player 2 wins.',
      code: `p1, p2 = input().split()
p1, p2 = p1.lower(), p2.lower()
valid = {"rock", "paper", "scissors"}
if p1 not in valid or p2 not in valid:
    print("INVALID CHOICE")
elif p1 == p2:
    print("TIE")
elif (p1 == "rock" and p2 == "scissors") or (p1 == "scissors" and p2 == "paper") or (p1 == "paper" and p2 == "rock"):
    print("PLAYER 1 WINS")
else:
    print("PLAYER 2 WINS")`,
      timeComplexity: 'O(1)',
      spaceComplexity: 'O(1)',
    },
    isPublished: true,
  },
];
