import type { PracticeProblem } from '../types';

export const RECURSION_PROBLEMS: PracticeProblem[] = [
  {
    id: 'py-085',
    problemNumber: 85,
    slug: 'recursive-digital-root',
    title: 'Recursive Digital Root',
    difficulty: 'Easy',
    topic: 'Recursion',
    topics: ['Recursion', 'Math'],
    relatedDay: 26,
    relatedCurriculumTopic: 'Base Cases & Recursive Calls',
    description: 'Given a non-negative integer `N`, repeatedly sum its digits until a single-digit integer is obtained (the digital root). Print the single-digit digital root.',
    inputFormat: 'A single non-negative integer `N`.',
    outputFormat: 'Print the digital root (0 to 9).',
    constraints: '0 <= N <= 10^18',
    examples: [
      { input: '38', output: '2', explanation: '3 + 8 = 11 -> 1 + 1 = 2.' },
      { input: '0', output: '0', explanation: '0 is already single digit.' },
      { input: '999', output: '9', explanation: '9+9+9 = 27 -> 2+7 = 9.' },
    ],
    starterCode: 'n = int(input())\n\n# Compute digital root recursively\n',
    hints: [
      'Base case: if n < 10 return n.',
      'Recursive step: return digital_root(sum(int(d) for d in str(n))).'
    ],
    publicTestCases: [
      { input: '38', expectedOutput: '2' },
      { input: '0', expectedOutput: '0' },
      { input: '999', expectedOutput: '9' },
    ],
    hiddenTestCases: [
      { input: '123456789', expectedOutput: '9' },
      { input: '7', expectedOutput: '7' },
      { input: '1000000000000000001', expectedOutput: '2' },
    ],
    solution: {
      approach: 'Recursively sum digits until the number is strictly less than 10.',
      code: `def digital_root(n):
    if n < 10:
        return n
    return digital_root(sum(int(d) for d in str(n)))

n = int(input())
print(digital_root(n))`,
      timeComplexity: 'O(log10 N)',
      spaceComplexity: 'O(log10 N)',
    },
    isPublished: true,
  },
  {
    id: 'py-086',
    problemNumber: 86,
    slug: 'tower-of-hanoi-moves-sequence',
    title: 'Tower of Hanoi Moves',
    difficulty: 'Medium',
    topic: 'Recursion',
    topics: ['Recursion'],
    relatedDay: 27,
    relatedCurriculumTopic: 'Classic Recursive Divide-and-Conquer',
    description: 'Solve the Tower of Hanoi puzzle for `N` disks moving from rod `A` to rod `C` using auxiliary rod `B`. Print each move on a new line in the format `<from_rod> -> <to_rod>`. On the first line, print the total number of moves.',
    inputFormat: 'A single positive integer `N`.',
    outputFormat: 'Line 1: Total moves\nFollowing lines: `Source -> Destination`',
    constraints: '1 <= N <= 10',
    examples: [
      { input: '2', output: '3\nA -> B\nA -> C\nB -> C', explanation: '3 moves for 2 disks.' },
    ],
    starterCode: 'n = int(input())\n\n# Solve Tower of Hanoi\n',
    hints: [
      'Total moves for N disks is 2^N - 1.',
      'Recursively move N-1 from A to B, move 1 from A to C, move N-1 from B to C.'
    ],
    publicTestCases: [
      { input: '2', expectedOutput: '3\nA -> B\nA -> C\nB -> C' },
      { input: '1', expectedOutput: '1\nA -> C' },
    ],
    hiddenTestCases: [
      { input: '3', expectedOutput: '7\nA -> C\nA -> B\nC -> B\nA -> C\nB -> A\nB -> C\nA -> C' },
    ],
    solution: {
      approach: 'Classic recursive 3-step solution for Tower of Hanoi.',
      code: `def hanoi(n, src, dst, aux, moves):
    if n == 1:
        moves.append(f"{src} -> {dst}")
        return
    hanoi(n - 1, src, aux, dst, moves)
    moves.append(f"{src} -> {dst}")
    hanoi(n - 1, aux, dst, src, moves)

n = int(input())
moves = []
hanoi(n, 'A', 'C', 'B', moves)
print(len(moves))
for m in moves:
    print(m)`,
      timeComplexity: 'O(2^N)',
      spaceComplexity: 'O(N)',
    },
    isPublished: true,
  },
  {
    id: 'py-087',
    problemNumber: 87,
    slug: 'all-string-permutations-lexicographical',
    title: 'Lexicographical String Permutations',
    difficulty: 'Medium',
    topic: 'Recursion',
    topics: ['Recursion', 'Backtracking', 'Strings'],
    relatedDay: 28,
    relatedCurriculumTopic: 'Backtracking & Permutations',
    description: 'Given a string `S` of unique characters, generate all distinct permutations of `S` in lexicographical (alphabetical) order. Print each permutation on a new line.',
    inputFormat: 'A single string `S`.',
    outputFormat: 'Print all permutations sorted alphabetically.',
    constraints: '1 <= len(S) <= 7',
    examples: [
      { input: 'abc', output: 'abc\nacb\nbac\nbca\ncab\ncba', explanation: '6 permutations of "abc".' },
      { input: 'ab', output: 'ab\nba', explanation: '2 permutations.' },
    ],
    starterCode: 's = input().strip()\n\n# Generate sorted permutations\n',
    hints: [
      'Use itertools.permutations or recursive backtracking with a visited set.'
    ],
    publicTestCases: [
      { input: 'abc', expectedOutput: 'abc\nacb\nbac\nbca\ncab\ncba' },
      { input: 'ab', expectedOutput: 'ab\nba' },
    ],
    hiddenTestCases: [
      { input: 'a', expectedOutput: 'a' },
      { input: 'xy', expectedOutput: 'xy\nyx' },
    ],
    solution: {
      approach: 'Generate permutations with itertools.permutations and sort.',
      code: `import itertools
s = input().strip()
perms = sorted("".join(p) for p in itertools.permutations(s))
for p in perms:
    print(p)`,
      timeComplexity: 'O(N! * N)',
      spaceComplexity: 'O(N!)',
    },
    isPublished: true,
  },
  {
    id: 'py-088',
    problemNumber: 88,
    slug: 'power-set-subsets-generator',
    title: 'Power Set of Distinct Numbers',
    difficulty: 'Hard',
    topic: 'Recursion',
    topics: ['Recursion', 'Backtracking'],
    relatedDay: 28,
    relatedCurriculumTopic: 'Subsets & Power Set Exploration',
    description: 'Given a list of distinct integers, generate all possible subsets (the power set). Sort each subset in ascending order, then sort all subsets by length ascending, and lexicographically for ties. Print each subset on a new line with elements separated by spaces (print `EMPTY` for the empty subset).',
    inputFormat: 'A single line of space-separated distinct integers.',
    outputFormat: 'Print each subset sorted according to criteria.',
    constraints: '1 <= len(nums) <= 10',
    examples: [
      { input: '1 2', output: 'EMPTY\n1\n2\n1 2', explanation: 'Subsets of [1, 2].' },
    ],
    starterCode: 'nums = list(map(int, input().split()))\n\n# Generate power set\n',
    hints: [
      'Use recursive backtracking: at each index, choose to include or exclude nums[i].'
    ],
    publicTestCases: [
      { input: '1 2', expectedOutput: 'EMPTY\n1\n2\n1 2' },
    ],
    hiddenTestCases: [
      { input: '3', expectedOutput: 'EMPTY\n3' },
      { input: '1 2 3', expectedOutput: 'EMPTY\n1\n2\n3\n1 2\n1 3\n2 3\n1 2 3' },
    ],
    solution: {
      approach: 'Generate subsets, sort individual subsets and sort total collection by (length, elements).',
      code: `nums = sorted(map(int, input().split()))
subsets = []
def backtrack(idx, curr):
    if idx == len(nums):
        subsets.append(list(curr))
        return
    backtrack(idx + 1, curr)
    backtrack(idx + 1, curr + [nums[idx]])

backtrack(0, [])
subsets.sort(key=lambda s: (len(s), s))
for s in subsets:
    print(" ".join(map(str, s)) if s else "EMPTY")`,
      timeComplexity: 'O(2^N * N)',
      spaceComplexity: 'O(2^N * N)',
    },
    isPublished: true,
  },
  {
    id: 'py-089',
    problemNumber: 89,
    slug: 'deeply-nested-list-flattener',
    title: 'Flatten Deeply Nested List',
    difficulty: 'Hard',
    topic: 'Recursion',
    topics: ['Recursion', 'Parsing'],
    relatedDay: 28,
    relatedCurriculumTopic: 'Recursive Tree/List Traversal',
    description: 'Given a nested JSON-like list representation of integers on one line (e.g. `[1, [2, [3, 4], 5], 6]`), recursively flatten it into a single 1D list and print the elements separated by spaces.',
    inputFormat: 'A single line containing nested Python list string.',
    outputFormat: 'Print space-separated flattened integers.',
    constraints: 'Input string length <= 10^4',
    examples: [
      { input: '[1, [2, [3, 4], 5], 6]', output: '1 2 3 4 5 6', explanation: 'All nested brackets unpacked.' },
      { input: '[[1, 2], [3, [4, [5]]]]', output: '1 2 3 4 5', explanation: 'Deeply nested list flattened.' },
      { input: '[10]', output: '10', explanation: 'Single element.' },
    ],
    starterCode: 'import ast\nraw = input()\nnested = ast.literal_eval(raw)\n\n# Recursively flatten nested list\n',
    hints: [
      'Define a recursive function: for item in lst: if isinstance(item, list): flatten(item) else: result.append(item).'
    ],
    publicTestCases: [
      { input: '[1, [2, [3, 4], 5], 6]', expectedOutput: '1 2 3 4 5 6' },
      { input: '[[1, 2], [3, [4, [5]]]]', expectedOutput: '1 2 3 4 5' },
      { input: '[10]', expectedOutput: '10' },
    ],
    hiddenTestCases: [
      { input: '[]', expectedOutput: '' },
      { input: '[[[[[42]]]]]', expectedOutput: '42' },
      { input: '[1, 2, 3]', expectedOutput: '1 2 3' },
    ],
    solution: {
      approach: 'Recursive unpacking of nested sub-lists.',
      code: `import ast
raw = input().strip()
nested = ast.literal_eval(raw)
flat = []
def flatten(item):
    if isinstance(item, list):
        for sub in item:
            flatten(sub)
    else:
        flat.append(str(item))

flatten(nested)
print(" ".join(flat))`,
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
    },
    isPublished: true,
  },
];
