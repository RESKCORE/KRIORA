import type { PracticeProblem } from '../types';

export const VARIABLES_IO_PROBLEMS: PracticeProblem[] = [
  {
    id: 'py-011',
    problemNumber: 11,
    slug: 'type-identification-and-casting',
    title: 'Type Identification and Casting',
    difficulty: 'Medium',
    topic: 'Variables',
    topics: ['Variables', 'Data Types'],
    relatedDay: 2,
    relatedCurriculumTopic: 'Data Types & Type Casting',
    description: 'Read a single string token. If it can be parsed as an integer, print `INT: <value>`. Otherwise if it can be parsed as a float, print `FLOAT: <value formatted to 2 decimals>`. Otherwise print `STRING: <value>`.',
    inputFormat: 'A single token on one line.',
    outputFormat: 'Print the classified type and formatted value.',
    constraints: 'Input string length <= 50.',
    examples: [
      { input: '42', output: 'INT: 42', explanation: '42 is an integer.' },
      { input: '3.1415', output: 'FLOAT: 3.14', explanation: '3.1415 is a float.' },
      { input: 'Python', output: 'STRING: Python', explanation: 'Python is a string.' },
    ],
    starterCode: 'val = input().strip()\n\n# Classify type and print output\n',
    hints: [
      'Try parsing with int(val) first inside a try/except block.',
      'If int fails, try float(val).',
      'If both fail, treat it as a string.'
    ],
    publicTestCases: [
      { input: '42', expectedOutput: 'INT: 42' },
      { input: '3.1415', expectedOutput: 'FLOAT: 3.14' },
      { input: 'Python', expectedOutput: 'STRING: Python' },
    ],
    hiddenTestCases: [
      { input: '-100', expectedOutput: 'INT: -100' },
      { input: '0.0', expectedOutput: 'FLOAT: 0.00' },
      { input: 'hello world', expectedOutput: 'STRING: hello world' },
    ],
    solution: {
      approach: 'Use try/except blocks to attempt int() conversion first, then float(), falling back to string.',
      code: `val = input().strip()
try:
    i = int(val)
    print(f"INT: {i}")
except ValueError:
    try:
        f = float(val)
        print(f"FLOAT: {f:.2f}")
    except ValueError:
        print(f"STRING: {val}")`,
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)',
    },
    isPublished: true,
  },
  {
    id: 'py-012',
    problemNumber: 12,
    slug: 'truthy-and-falsy-evaluator',
    title: 'Truthy and Falsy Evaluator',
    difficulty: 'Easy',
    topic: 'Variables',
    topics: ['Variables', 'Booleans'],
    relatedDay: 2,
    relatedCurriculumTopic: 'Boolean Logic & Truthiness',
    description: 'Read an input string. If the string is `"0"`, `""` (empty), `"false"` (case-insensitive), or `"none"`, print `FALSY`. Otherwise print `TRUTHY`.',
    inputFormat: 'A single line of text (may be empty).',
    outputFormat: 'Print `TRUTHY` or `FALSY`.',
    constraints: 'Input length <= 100.',
    examples: [
      { input: 'hello', output: 'TRUTHY', explanation: 'Non-empty string is truthy.' },
      { input: '0', output: 'FALSY', explanation: '"0" is evaluated as falsy.' },
      { input: 'False', output: 'FALSY', explanation: '"False" is falsy.' },
    ],
    starterCode: 'import sys\nraw = sys.stdin.read().rstrip("\\n\\r")\n\n# Evaluate truthiness\n',
    hints: [
      'Check if raw.strip().lower() is in ["0", "", "false", "none"].'
    ],
    publicTestCases: [
      { input: 'hello', expectedOutput: 'TRUTHY' },
      { input: '0', expectedOutput: 'FALSY' },
      { input: 'False', expectedOutput: 'FALSY' },
    ],
    hiddenTestCases: [
      { input: '', expectedOutput: 'FALSY' },
      { input: 'None', expectedOutput: 'FALSY' },
      { input: '123', expectedOutput: 'TRUTHY' },
    ],
    solution: {
      approach: 'Normalize input string and check against predefined falsy literals.',
      code: `import sys
raw = sys.stdin.read().rstrip("\\n\\r").strip()
if raw.lower() in ("0", "", "false", "none"):
    print("FALSY")
else:
    print("TRUTHY")`,
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)',
    },
    isPublished: true,
  },
  {
    id: 'py-013',
    problemNumber: 13,
    slug: 'string-repetition-and-separator',
    title: 'Repeated String with Separator',
    difficulty: 'Easy',
    topic: 'Variables',
    topics: ['Variables', 'Strings'],
    relatedDay: 4,
    relatedCurriculumTopic: 'String Operations & Multipliers',
    description: 'Read a word `W`, an integer `N`, and a separator string `S` on 3 separate lines. Print the word `W` repeated `N` times, joined by the separator `S`.',
    inputFormat: 'Line 1: Word `W`\nLine 2: Integer `N`\nLine 3: Separator `S`',
    outputFormat: 'Print the joined string.',
    constraints: '1 <= N <= 100, length of W and S <= 20.',
    examples: [
      { input: 'Kriora\n3\n-', output: 'Kriora-Kriora-Kriora', explanation: 'Kriora repeated 3 times separated by "-".' },
      { input: 'Star\n4\n***', output: 'Star***Star***Star***Star', explanation: 'Star repeated 4 times with "***".' },
    ],
    starterCode: 'w = input()\nn = int(input())\ns = input()\n\n# Print repeated word joined by separator\n',
    hints: [
      'Create a list of N copies of w: [w] * n.',
      'Join them with separator s using s.join(...).'
    ],
    publicTestCases: [
      { input: 'Kriora\n3\n-', expectedOutput: 'Kriora-Kriora-Kriora' },
      { input: 'Star\n4\n***', expectedOutput: 'Star***Star***Star***Star' },
    ],
    hiddenTestCases: [
      { input: 'Solo\n1\n#', expectedOutput: 'Solo' },
      { input: 'A\n5\n, ', expectedOutput: 'A, A, A, A, A' },
      { input: 'X\n2\n', expectedOutput: 'XX' },
    ],
    solution: {
      approach: 'Use [w] * n and s.join().',
      code: `w = input()
n = int(input())
s = input()
print(s.join([w] * n))`,
      timeComplexity: 'O(N * len(W))',
      spaceComplexity: 'O(N * len(W))',
    },
    isPublished: true,
  },
  {
    id: 'py-014',
    problemNumber: 14,
    slug: 'ascii-and-character-converter',
    title: 'ASCII and Character Converter',
    difficulty: 'Medium',
    topic: 'Variables',
    topics: ['Variables', 'Strings'],
    relatedDay: 4,
    relatedCurriculumTopic: 'ord() and chr() Functions',
    description: 'Read a single character `C` on the first line and an integer `A` on the second line. Print the ASCII code of `C`, followed by a space, followed by the character corresponding to ASCII code `A`.',
    inputFormat: 'Line 1: Character `C`\nLine 2: Integer `A` (32 <= A <= 126)',
    outputFormat: 'Print `ord(C) chr(A)`.',
    constraints: 'C is an ASCII printable character, 32 <= A <= 126.',
    examples: [
      { input: 'A\n97', output: '65 a', explanation: 'ord("A") = 65, chr(97) = "a".' },
      { input: 'z\n48', output: '122 0', explanation: 'ord("z") = 122, chr(48) = "0".' },
    ],
    starterCode: 'c = input()\na = int(input())\n\n# Print ASCII of c and character of a\n',
    hints: [
      'Use ord(c) to get ASCII integer value.',
      'Use chr(a) to get character from ASCII integer.'
    ],
    publicTestCases: [
      { input: 'A\n97', expectedOutput: '65 a' },
      { input: 'z\n48', expectedOutput: '122 0' },
    ],
    hiddenTestCases: [
      { input: '!\n33', expectedOutput: '33 !' },
      { input: ' \n32', expectedOutput: '32  ' },
      { input: 'Z\n65', expectedOutput: '90 A' },
    ],
    solution: {
      approach: 'Use built-in ord() and chr() functions.',
      code: `c = input()
a = int(input())
print(ord(c), chr(a))`,
      timeComplexity: 'O(1)',
      spaceComplexity: 'O(1)',
    },
    isPublished: true,
  },
  {
    id: 'py-015',
    problemNumber: 15,
    slug: 'bitwise-operations-suite',
    title: 'Bitwise Operations Suite',
    difficulty: 'Medium',
    topic: 'Variables',
    topics: ['Variables', 'Bitwise', 'Math'],
    relatedDay: 4,
    relatedCurriculumTopic: 'Bitwise Operators (&, |, ^, ~)',
    description: 'Given two integers `a` and `b`, print the results of bitwise AND (`a & b`), bitwise OR (`a | b`), and bitwise XOR (`a ^ b`) separated by spaces.',
    inputFormat: 'Two space-separated integers `a b`.',
    outputFormat: 'Print `AND OR XOR`.',
    constraints: '0 <= a, b <= 10^9',
    examples: [
      { input: '12 25', output: '8 29 21', explanation: '12 & 25 = 8, 12 | 25 = 29, 12 ^ 25 = 21' },
      { input: '7 7', output: '7 7 0', explanation: '7 & 7 = 7, 7 | 7 = 7, 7 ^ 7 = 0' },
    ],
    starterCode: 'a, b = map(int, input().split())\n\n# Compute bitwise AND, OR, XOR\n',
    hints: [
      'Use Python operators: a & b, a | b, a ^ b.'
    ],
    publicTestCases: [
      { input: '12 25', expectedOutput: '8 29 21' },
      { input: '7 7', expectedOutput: '7 7 0' },
    ],
    hiddenTestCases: [
      { input: '0 0', expectedOutput: '0 0 0' },
      { input: '1024 1', expectedOutput: '0 1025 1025' },
      { input: '255 15', expectedOutput: '15 255 240' },
    ],
    solution: {
      approach: 'Apply bitwise operators directly.',
      code: `a, b = map(int, input().split())
print(a & b, a | b, a ^ b)`,
      timeComplexity: 'O(1)',
      spaceComplexity: 'O(1)',
    },
    isPublished: true,
  },
  {
    id: 'py-016',
    problemNumber: 16,
    slug: 'multiline-input-accumulator',
    title: 'Multi-line Input Sum',
    difficulty: 'Easy',
    topic: 'Input/Output',
    topics: ['Input/Output', 'Loops'],
    relatedDay: 5,
    relatedCurriculumTopic: 'Reading Multiple Input Lines',
    description: 'The first line contains an integer `N`, the number of following lines. Each of the next `N` lines contains a single integer. Read all integers and print their total sum.',
    inputFormat: 'First line integer `N`. Next `N` lines each contain an integer.',
    outputFormat: 'Print the sum of the `N` integers.',
    constraints: '1 <= N <= 10^4, -10^6 <= each integer <= 10^6',
    examples: [
      { input: '3\n10\n20\n30', output: '60', explanation: '10 + 20 + 30 = 60.' },
      { input: '4\n-5\n15\n-10\n0', output: '0', explanation: '-5 + 15 - 10 + 0 = 0.' },
    ],
    starterCode: 'n = int(input())\n\n# Read n numbers and print total sum\n',
    hints: [
      'Use a for loop: for _ in range(n): total += int(input()).'
    ],
    publicTestCases: [
      { input: '3\n10\n20\n30', expectedOutput: '60' },
      { input: '4\n-5\n15\n-10\n0', expectedOutput: '0' },
    ],
    hiddenTestCases: [
      { input: '1\n999', expectedOutput: '999' },
      { input: '5\n1\n2\n3\n4\n5', expectedOutput: '15' },
      { input: '2\n-1000\n-2000', expectedOutput: '-3000' },
    ],
    solution: {
      approach: 'Iterate N times, parsing each line to integer and adding to accumulator.',
      code: `n = int(input())
total = sum(int(input()) for _ in range(n))
print(total)`,
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)',
    },
    isPublished: true,
  },
  {
    id: 'py-017',
    problemNumber: 17,
    slug: 'csv-parser-and-formatter',
    title: 'CSV Name Sorter',
    difficulty: 'Medium',
    topic: 'Input/Output',
    topics: ['Input/Output', 'Strings', 'Sorting'],
    relatedDay: 5,
    relatedCurriculumTopic: 'String Splitting & Delimiters',
    description: 'Read a single line containing comma-separated names. Strip any surrounding whitespace from each name, sort the names alphabetically in ascending order, and print them joined by `" -> "`.',
    inputFormat: 'A single line of comma-separated names.',
    outputFormat: 'Print sorted names separated by `" -> "`.',
    constraints: '1 <= count of names <= 100.',
    examples: [
      { input: 'Charlie, Alice, Bob', output: 'Alice -> Bob -> Charlie', explanation: 'Sorted alphabetically.' },
      { input: 'Zebra, Apple', output: 'Apple -> Zebra', explanation: 'Apple comes before Zebra.' },
    ],
    starterCode: 'raw = input()\n\n# Parse, strip, sort, and print names joined by " -> "\n',
    hints: [
      'Split by comma: raw.split(",").',
      'Strip each name: [s.strip() for s in ...].',
      'Sort using sorted() and join with " -> ".join(...).'
    ],
    publicTestCases: [
      { input: 'Charlie, Alice, Bob', expectedOutput: 'Alice -> Bob -> Charlie' },
      { input: 'Zebra, Apple', expectedOutput: 'Apple -> Zebra' },
    ],
    hiddenTestCases: [
      { input: 'Kriora', expectedOutput: 'Kriora' },
      { input: '  David  ,   Adam  ,   Chris ', expectedOutput: 'Adam -> Chris -> David' },
      { input: 'B, A, B', expectedOutput: 'A -> B -> B' },
    ],
    solution: {
      approach: 'Split on commas, strip whitespace, sort alphabetically, join with arrow separator.',
      code: `names = [n.strip() for n in input().split(",") if n.strip()]
print(" -> ".join(sorted(names)))`,
      timeComplexity: 'O(M log M) where M is number of names',
      spaceComplexity: 'O(M)',
    },
    isPublished: true,
  },
  {
    id: 'py-018',
    problemNumber: 18,
    slug: 'receipt-line-item-formatter',
    title: 'Receipt Line Item Formatter',
    difficulty: 'Medium',
    topic: 'Input/Output',
    topics: ['Input/Output', 'String Formatting'],
    relatedDay: 5,
    relatedCurriculumTopic: 'Formatted I/O (ljust, rjust, f-strings)',
    description: 'You are generating an invoice table line. Read an item name `Item` (string), quantity `Qty` (integer), and unit price `Price` (float). Format and print a line of total length exactly 30 characters: the item name left-aligned in a 15-character field, quantity centered in a 5-character field, and total price (`Qty * Price`) right-aligned in a 10-character field formatted with 2 decimal places.',
    inputFormat: 'Three space-separated values: `Item Qty Price`.',
    outputFormat: 'Print the formatted receipt line of exactly 30 characters.',
    constraints: 'Item length <= 15, 1 <= Qty <= 1000, 0.01 <= Price <= 10000.0',
    examples: [
      { input: 'Notebook 3 45.50', output: 'Notebook         3      136.50', explanation: '15 chars left + 5 chars center + 10 chars right = 30 chars.' },
      { input: 'Pen 10 5.00', output: 'Pen             10       50.00', explanation: 'Formatted properly into column widths.' },
    ],
    starterCode: 'item, qty, price = input().split()\nqty = int(qty)\nprice = float(price)\n\n# Format 15 left, 5 center, 10 right\n',
    hints: [
      'Use f-string alignment: f"{item:<15}{qty:^5}{total:>10.2f}".'
    ],
    publicTestCases: [
      { input: 'Notebook 3 45.50', expectedOutput: 'Notebook         3      136.50' },
      { input: 'Pen 10 5.00', expectedOutput: 'Pen             10       50.00' },
    ],
    hiddenTestCases: [
      { input: 'Desk 1 1250.75', expectedOutput: 'Desk             1     1250.75' },
      { input: 'Eraser 25 0.50', expectedOutput: 'Eraser          25       12.50' },
      { input: 'A 1 1.00', expectedOutput: 'A                1        1.00' },
    ],
    solution: {
      approach: 'Use f-string alignment specifiers <15, ^5, >10.2f.',
      code: `item, qty, price = input().split()
q = int(qty)
p = float(price)
total = q * p
print(f"{item:<15}{q:^5}{total:>10.2f}")`,
      timeComplexity: 'O(1)',
      spaceComplexity: 'O(1)',
    },
    isPublished: true,
  },
  {
    id: 'py-019',
    problemNumber: 19,
    slug: 'flatten-and-sum-grid-input',
    title: 'Flatten and Sum Grid',
    difficulty: 'Medium',
    topic: 'Input/Output',
    topics: ['Input/Output', 'Lists', 'Loops'],
    relatedDay: 5,
    relatedCurriculumTopic: '2D Grid Input Parsing',
    description: 'The first line contains two integers `R` (rows) and `C` (columns). The next `R` lines each contain `C` space-separated integers. Print two values: the total sum of all numbers in the grid, followed by the maximum value in the grid.',
    inputFormat: 'First line: `R C`. Next `R` lines: `C` integers each.',
    outputFormat: 'Print `total_sum max_value`.',
    constraints: '1 <= R, C <= 100, -10^6 <= value <= 10^6',
    examples: [
      { input: '2 3\n1 2 3\n4 5 6', output: '21 6', explanation: 'Sum = 21, Max = 6.' },
      { input: '3 2\n-1 -2\n-5 0\n10 4', output: '6 10', explanation: 'Sum = 6, Max = 10.' },
    ],
    starterCode: 'r, c = map(int, input().split())\n\n# Read 2D grid, compute sum and max\n',
    hints: [
      'Read each row in a loop: [list(map(int, input().split())) for _ in range(r)].',
      'Flatten the list or accumulate sum and max directly.'
    ],
    publicTestCases: [
      { input: '2 3\n1 2 3\n4 5 6', expectedOutput: '21 6' },
      { input: '3 2\n-1 -2\n-5 0\n10 4', expectedOutput: '6 10' },
    ],
    hiddenTestCases: [
      { input: '1 1\n42', expectedOutput: '42 42' },
      { input: '2 2\n-10 -20\n-30 -40', expectedOutput: '-100 -10' },
      { input: '3 3\n1 0 0\n0 1 0\n0 0 1', expectedOutput: '3 1' },
    ],
    solution: {
      approach: 'Iterate over R lines, collect all integers into a list, and compute sum() and max().',
      code: `r, c = map(int, input().split())
all_vals = []
for _ in range(r):
    all_vals.extend(map(int, input().split()))
print(sum(all_vals), max(all_vals))`,
      timeComplexity: 'O(R * C)',
      spaceComplexity: 'O(R * C)',
    },
    isPublished: true,
  },
  {
    id: 'py-020',
    problemNumber: 20,
    slug: 'radix-base-converter',
    title: 'Binary, Octal, and Hex Formatter',
    difficulty: 'Medium',
    topic: 'Input/Output',
    topics: ['Input/Output', 'Number Systems'],
    relatedDay: 5,
    relatedCurriculumTopic: 'Built-in Base Conversions (bin, oct, hex)',
    description: 'Given a non-negative integer `N`, print its binary representation (without `"0b"` prefix), octal representation (without `"0o"` prefix), and uppercase hexadecimal representation (without `"0x"` prefix) separated by single spaces.',
    inputFormat: 'A single integer `N`.',
    outputFormat: 'Print `BIN OCT HEX`.',
    constraints: '0 <= N <= 10^9',
    examples: [
      { input: '255', output: '11111111 377 FF', explanation: '255 in bin is 11111111, oct is 377, hex is FF.' },
      { input: '16', output: '10000 20 10', explanation: '16 in bin is 10000, oct is 20, hex is 10.' },
      { input: '0', output: '0 0 0', explanation: '0 in all bases is 0.' },
    ],
    starterCode: 'n = int(input())\n\n# Convert to binary, octal, hex (uppercase) without prefixes\n',
    hints: [
      'Use format specifiers: f"{n:b} {n:o} {n:X}".'
    ],
    publicTestCases: [
      { input: '255', expectedOutput: '11111111 377 FF' },
      { input: '16', expectedOutput: '10000 20 10' },
      { input: '0', expectedOutput: '0 0 0' },
    ],
    hiddenTestCases: [
      { input: '1', expectedOutput: '1 1 1' },
      { input: '1024', expectedOutput: '10000000000 2000 400' },
      { input: '999999', expectedOutput: '11110100001000111111 3641077 F423F' },
    ],
    solution: {
      approach: 'Use f-string formatting with :b, :o, and :X.',
      code: `n = int(input())
print(f"{n:b} {n:o} {n:X}")`,
      timeComplexity: 'O(log N)',
      spaceComplexity: 'O(log N)',
    },
    isPublished: true,
  },
];
