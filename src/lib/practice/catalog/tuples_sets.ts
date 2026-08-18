import type { PracticeProblem } from '../types';

export const TUPLES_SETS_PROBLEMS: PracticeProblem[] = [
  {
    id: 'py-061',
    problemNumber: 61,
    slug: 'tuple-min-max-and-sum',
    title: 'Tuple Statistics and Min-Max',
    difficulty: 'Easy',
    topic: 'Tuples/Sets',
    topics: ['Tuples', 'Math'],
    relatedDay: 17,
    relatedCurriculumTopic: 'Tuples & Immutability',
    description: 'Read a line of integers. Create an immutable tuple from these values. Print three space-separated values: the minimum value, the maximum value, and the sum of all elements in the tuple.',
    inputFormat: 'A single line of space-separated integers.',
    outputFormat: 'Print `min max sum`.',
    constraints: '1 <= count of integers <= 10^5, -10^6 <= value <= 10^6',
    examples: [
      { input: '4 8 2 10 6', output: '2 10 30', explanation: 'Min = 2, Max = 10, Sum = 30.' },
      { input: '-5 0 5', output: '-5 5 0', explanation: 'Min = -5, Max = 5, Sum = 0.' },
    ],
    starterCode: 't = tuple(map(int, input().split()))\n\n# Compute and print min, max, sum of tuple\n',
    hints: [
      'Use min(t), max(t), and sum(t).'
    ],
    publicTestCases: [
      { input: '4 8 2 10 6', expectedOutput: '2 10 30' },
      { input: '-5 0 5', expectedOutput: '-5 5 0' },
    ],
    hiddenTestCases: [
      { input: '42', expectedOutput: '42 42 42' },
      { input: '-10 -20 -30', expectedOutput: '-30 -10 -60' },
      { input: '1 1 1 1', expectedOutput: '1 1 4' },
    ],
    solution: {
      approach: 'Convert input into tuple and apply min, max, sum built-in functions.',
      code: `t = tuple(map(int, input().split()))
print(min(t), max(t), sum(t))`,
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
    },
    isPublished: true,
  },
  {
    id: 'py-062',
    problemNumber: 62,
    slug: 'set-operations-union-intersection-diff',
    title: 'Set Algebra Operations',
    difficulty: 'Easy',
    topic: 'Tuples/Sets',
    topics: ['Sets', 'Set Operations'],
    relatedDay: 17,
    relatedCurriculumTopic: 'Set Union, Intersection & Difference',
    description: 'Line 1 contains the elements of Set A. Line 2 contains the elements of Set B. Print three lines in sorted ascending order: (1) Union `A | B`, (2) Intersection `A & B` (or `EMPTY` if none), (3) Difference `A - B` (or `EMPTY` if none). Separate elements on each line by spaces.',
    inputFormat: 'Line 1: space-separated integers (Set A)\nLine 2: space-separated integers (Set B)',
    outputFormat: 'Line 1: Sorted Union\nLine 2: Sorted Intersection or `EMPTY`\nLine 3: Sorted Difference A-B or `EMPTY`',
    constraints: '1 <= size of sets <= 10^4',
    examples: [
      { input: '1 2 3 4\n3 4 5 6', output: '1 2 3 4 5 6\n3 4\n1 2', explanation: 'Union, intersection, and difference (A-B).' },
      { input: '1 2\n3 4', output: '1 2 3 4\nEMPTY\n1 2', explanation: 'Intersection is empty.' },
    ],
    starterCode: 'set_a = set(map(int, input().split()))\nset_b = set(map(int, input().split()))\n\n# Compute union, intersection, difference\n',
    hints: [
      'Union: set_a | set_b',
      'Intersection: set_a & set_b',
      'Difference: set_a - set_b',
      'Sort each result and print "EMPTY" if the set is empty.'
    ],
    publicTestCases: [
      { input: '1 2 3 4\n3 4 5 6', expectedOutput: '1 2 3 4 5 6\n3 4\n1 2' },
      { input: '1 2\n3 4', expectedOutput: '1 2 3 4\nEMPTY\n1 2' },
    ],
    hiddenTestCases: [
      { input: '5\n5', expectedOutput: '5\n5\nEMPTY' },
      { input: '10 20 30\n10 20 30', expectedOutput: '10 20 30\n10 20 30\nEMPTY' },
      { input: '1 2 3\n1 2 3 4 5', expectedOutput: '1 2 3 4 5\n1 2 3\nEMPTY' },
    ],
    solution: {
      approach: 'Compute standard set operations and format sorted output.',
      code: `set_a = set(map(int, input().split()))
set_b = set(map(int, input().split()))
u = sorted(set_a | set_b)
inter = sorted(set_a & set_b)
diff = sorted(set_a - set_b)

print(" ".join(map(str, u)) if u else "EMPTY")
print(" ".join(map(str, inter)) if inter else "EMPTY")
print(" ".join(map(str, diff)) if diff else "EMPTY")`,
      timeComplexity: 'O(N log N)',
      spaceComplexity: 'O(N)',
    },
    isPublished: true,
  },
  {
    id: 'py-063',
    problemNumber: 63,
    slug: 'unique-words-counter',
    title: 'Unique Words Counter',
    difficulty: 'Easy',
    topic: 'Tuples/Sets',
    topics: ['Sets', 'Strings'],
    relatedDay: 17,
    relatedCurriculumTopic: 'Set Hashing & Deduplication',
    description: 'Read an input string `S`. Split it into words, convert all words to lowercase, and print the total number of unique words.',
    inputFormat: 'A single line of text `S`.',
    outputFormat: 'Print the count of unique words.',
    constraints: '1 <= len(S) <= 10^5',
    examples: [
      { input: 'Kriora is great and Python is great', output: '5', explanation: 'Unique lowercase words: kriora, is, great, and, python (5).' },
      { input: 'apple Apple APPLE', output: '1', explanation: 'All normalize to "apple".' },
    ],
    starterCode: 's = input()\n\n# Count unique lowercase words\n',
    hints: [
      'words = set(w.lower() for w in s.split())',
      'print(len(words))'
    ],
    publicTestCases: [
      { input: 'Kriora is great and Python is great', expectedOutput: '5' },
      { input: 'apple Apple APPLE', expectedOutput: '1' },
    ],
    hiddenTestCases: [
      { input: 'the quick brown fox jumps over the lazy dog', expectedOutput: '8' },
      { input: 'one', expectedOutput: '1' },
      { input: 'hello world hello', expectedOutput: '2' },
    ],
    solution: {
      approach: 'Convert split words to lowercase in a set and print length.',
      code: `words = set(w.lower() for w in input().split())
print(len(words))`,
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
    },
    isPublished: true,
  },
  {
    id: 'py-064',
    problemNumber: 64,
    slug: 'symmetric-difference-elements',
    title: 'Sorted Symmetric Difference',
    difficulty: 'Medium',
    topic: 'Tuples/Sets',
    topics: ['Sets'],
    relatedDay: 18,
    relatedCurriculumTopic: 'Symmetric Difference (^)',
    description: 'Line 1 contains elements of Set A. Line 2 contains elements of Set B. Print the symmetric difference `A ^ B` (elements that are in A or B but not in both) sorted in ascending order on a single line separated by spaces. If empty, print `EMPTY`.',
    inputFormat: 'Line 1: space-separated integers\nLine 2: space-separated integers',
    outputFormat: 'Print sorted symmetric difference or `EMPTY`.',
    constraints: '1 <= size of sets <= 10^5',
    examples: [
      { input: '2 4 5 9\n2 4 11 12', output: '5 9 11 12', explanation: '2 and 4 are in both; 5, 9, 11, 12 are in only one.' },
      { input: '1 2 3\n1 2 3', output: 'EMPTY', explanation: 'All elements overlap.' },
    ],
    starterCode: 'a = set(map(int, input().split()))\nb = set(map(int, input().split()))\n\n# Compute symmetric difference\n',
    hints: [
      'Use the symmetric difference operator: a ^ b.',
      'Sort the result and handle the empty case.'
    ],
    publicTestCases: [
      { input: '2 4 5 9\n2 4 11 12', expectedOutput: '5 9 11 12' },
      { input: '1 2 3\n1 2 3', expectedOutput: 'EMPTY' },
    ],
    hiddenTestCases: [
      { input: '1 3 5\n2 4 6', expectedOutput: '1 2 3 4 5 6' },
      { input: '-10 10\n-10 20', expectedOutput: '10 20' },
      { input: '0\n0', expectedOutput: 'EMPTY' },
    ],
    solution: {
      approach: 'Apply symmetric difference a ^ b, sort elements, and print.',
      code: `a = set(map(int, input().split()))
b = set(map(int, input().split()))
sym = sorted(a ^ b)
print(" ".join(map(str, sym)) if sym else "EMPTY")`,
      timeComplexity: 'O(N log N)',
      spaceComplexity: 'O(N)',
    },
    isPublished: true,
  },
  {
    id: 'py-065',
    problemNumber: 65,
    slug: 'subset-and-disjoint-set-checker',
    title: 'Subset and Disjoint Set Checker',
    difficulty: 'Medium',
    topic: 'Tuples/Sets',
    topics: ['Sets'],
    relatedDay: 18,
    relatedCurriculumTopic: 'Set Methods (issubset, isdisjoint)',
    description: 'Line 1 contains Set A. Line 2 contains Set B. Determine the relational status: Print `SUBSET` if A is a subset of B (`A <= B`), `SUPERSET` if A is a superset of B (`A >= B`), `DISJOINT` if they share no common elements, or `OVERLAPPING` otherwise. (If A == B, print `EQUAL`).',
    inputFormat: 'Line 1: space-separated integers\nLine 2: space-separated integers',
    outputFormat: 'Print `EQUAL`, `SUBSET`, `SUPERSET`, `DISJOINT`, or `OVERLAPPING`.',
    constraints: '1 <= size of sets <= 10^4',
    examples: [
      { input: '1 2\n1 2 3 4', output: 'SUBSET', explanation: 'A is a proper subset of B.' },
      { input: '1 2 3\n1 2 3', output: 'EQUAL', explanation: 'A and B are identical.' },
      { input: '1 2\n3 4', output: 'DISJOINT', explanation: 'No shared elements.' },
      { input: '1 2 3\n2 3 4', output: 'OVERLAPPING', explanation: 'Partial overlap.' },
    ],
    starterCode: 'a = set(map(int, input().split()))\nb = set(map(int, input().split()))\n\n# Classify set relationship\n',
    hints: [
      'Check if a == b first.',
      'Then check a.issubset(b), a.issuperset(b), a.isdisjoint(b), else OVERLAPPING.'
    ],
    publicTestCases: [
      { input: '1 2\n1 2 3 4', expectedOutput: 'SUBSET' },
      { input: '1 2 3\n1 2 3', expectedOutput: 'EQUAL' },
      { input: '1 2\n3 4', expectedOutput: 'DISJOINT' },
      { input: '1 2 3\n2 3 4', expectedOutput: 'OVERLAPPING' },
    ],
    hiddenTestCases: [
      { input: '1 2 3 4\n1 2', expectedOutput: 'SUPERSET' },
      { input: '5\n5', expectedOutput: 'EQUAL' },
      { input: '10 20\n30 40 50', expectedOutput: 'DISJOINT' },
    ],
    solution: {
      approach: 'Use set relation methods issubset, issuperset, isdisjoint in priority order.',
      code: `a = set(map(int, input().split()))
b = set(map(int, input().split()))
if a == b:
    print("EQUAL")
elif a.issubset(b):
    print("SUBSET")
elif a.issuperset(b):
    print("SUPERSET")
elif a.isdisjoint(b):
    print("DISJOINT")
else:
    print("OVERLAPPING")`,
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
    },
    isPublished: true,
  },
  {
    id: 'py-066',
    problemNumber: 66,
    slug: 'longest-consecutive-subsequence-in-set',
    title: 'Longest Consecutive Sequence',
    difficulty: 'Hard',
    topic: 'Tuples/Sets',
    topics: ['Sets', 'Hash Map', 'Algorithms'],
    relatedDay: 18,
    relatedCurriculumTopic: 'Hash Set Lookup & Sequence Detection',
    description: 'Given an unsorted array of integers, find the length of the longest consecutive elements sequence in `O(N)` time complexity using a set.',
    inputFormat: 'A single line of space-separated integers.',
    outputFormat: 'Print the length of the longest consecutive sequence.',
    constraints: '0 <= len(nums) <= 10^5, -10^9 <= value <= 10^9',
    examples: [
      { input: '100 4 200 1 3 2', output: '4', explanation: 'The longest consecutive elements sequence is [1, 2, 3, 4] with length 4.' },
      { input: '0 3 7 2 5 8 4 6 0 1', output: '9', explanation: 'Sequence is 0, 1, 2, 3, 4, 5, 6, 7, 8 (length 9).' },
      { input: '10', output: '1', explanation: 'Single element sequence.' },
    ],
    starterCode: 'import sys\nraw = sys.stdin.read().strip()\n# Find longest consecutive sequence length\n',
    hints: [
      'Store all numbers in a set: num_set = set(nums).',
      'For each num: only start counting if (num - 1) is NOT in num_set (this ensures you only check sequence starts).'
    ],
    publicTestCases: [
      { input: '100 4 200 1 3 2', expectedOutput: '4' },
      { input: '0 3 7 2 5 8 4 6 0 1', expectedOutput: '9' },
      { input: '10', expectedOutput: '1' },
    ],
    hiddenTestCases: [
      { input: '5 4 3 2 1', expectedOutput: '5' },
      { input: '1 2 0 1', expectedOutput: '3' },
      { input: '9 1 4 7 3 -1 0 5 8 -1 6', expectedOutput: '7' },
    ],
    solution: {
      approach: 'Use a hash set to detect sequence start points (x - 1 not in set) in linear O(N) time.',
      code: `import sys
raw = sys.stdin.read().strip()
if not raw:
    print(0)
else:
    nums = list(map(int, raw.split()))
    num_set = set(nums)
    longest = 0
    for x in num_set:
        if x - 1 not in num_set:
            curr = x
            streak = 1
            while curr + 1 in num_set:
                curr += 1
                streak += 1
            longest = max(longest, streak)
    print(longest)`,
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
    },
    isPublished: true,
  },
];
