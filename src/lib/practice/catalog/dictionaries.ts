import type { PracticeProblem } from '../types';

export const DICTIONARIES_PROBLEMS: PracticeProblem[] = [
  {
    id: 'py-067',
    problemNumber: 67,
    slug: 'character-frequency-table',
    title: 'Character Frequency Table',
    difficulty: 'Easy',
    topic: 'Dictionaries',
    topics: ['Dictionaries', 'Strings'],
    relatedDay: 19,
    relatedCurriculumTopic: 'Dictionary Insertion & Value Counting',
    description: 'Read an input string `S`. Count the frequency of each character in `S`. Print each character and its count in the format `char: count` sorted alphabetically by character (one per line).',
    inputFormat: 'A single string `S`.',
    outputFormat: 'Print sorted character frequencies.',
    constraints: '1 <= len(S) <= 10^5',
    examples: [
      { input: 'banana', output: 'a: 3\nb: 1\nn: 2', explanation: 'Alphabetical breakdown.' },
      { input: 'kriora', output: 'a: 1\ni: 1\nk: 1\no: 1\nr: 2', explanation: 'Character frequencies.' },
    ],
    starterCode: 's = input()\n\n# Count character frequencies and print sorted by character\n',
    hints: [
      'Use collections.Counter(s) or a standard dictionary.',
      'Iterate over sorted(counts.items()).'
    ],
    publicTestCases: [
      { input: 'banana', expectedOutput: 'a: 3\nb: 1\nn: 2' },
      { input: 'kriora', expectedOutput: 'a: 1\ni: 1\nk: 1\no: 1\nr: 2' },
    ],
    hiddenTestCases: [
      { input: 'aaaa', expectedOutput: 'a: 4' },
      { input: 'abc', expectedOutput: 'a: 1\nb: 1\nc: 1' },
      { input: 'hello world', expectedOutput: ' : 1\nd: 1\ne: 1\nh: 1\nl: 3\no: 2\nr: 1\nw: 1' },
    ],
    solution: {
      approach: 'Count character frequencies with collections.Counter and sort by character key.',
      code: `import collections
s = input()
counts = collections.Counter(s)
for char in sorted(counts):
    print(f"{char}: {counts[char]}")`,
      timeComplexity: 'O(N + K log K)',
      spaceComplexity: 'O(K)',
    },
    isPublished: true,
  },
  {
    id: 'py-068',
    problemNumber: 68,
    slug: 'invert-dictionary-mapping',
    title: 'Invert Dictionary Mapping',
    difficulty: 'Easy',
    topic: 'Dictionaries',
    topics: ['Dictionaries'],
    relatedDay: 19,
    relatedCurriculumTopic: 'Key-Value Transformations',
    description: 'Read `N` lines of `Key Value` pairs where values are unique. Invert the dictionary so that values become keys and keys become values. Print the inverted dictionary sorted alphabetically by the new keys in the format `NewKey -> NewValue`.',
    inputFormat: 'First line integer `N`. Next `N` lines contain `Key Value`.',
    outputFormat: 'Print inverted key-value pairs sorted alphabetically by new key.',
    constraints: '1 <= N <= 1000',
    examples: [
      { input: '3\nA 1\nB 2\nC 3', output: '1 -> A\n2 -> B\n3 -> C', explanation: 'Values become keys.' },
      { input: '2\nApple Red\nBanana Yellow', output: 'Red -> Apple\nYellow -> Banana', explanation: 'Inverted mapping.' },
    ],
    starterCode: 'n = int(input())\n\n# Read dictionary, invert, and print sorted\n',
    hints: [
      'Read k, v = input().split() and store d[v] = k.',
      'Sort by k in sorted(d).'
    ],
    publicTestCases: [
      { input: '3\nA 1\nB 2\nC 3', expectedOutput: '1 -> A\n2 -> B\n3 -> C' },
      { input: '2\nApple Red\nBanana Yellow', expectedOutput: 'Red -> Apple\nYellow -> Banana' },
    ],
    hiddenTestCases: [
      { input: '1\nUser1 ID99', expectedOutput: 'ID99 -> User1' },
      { input: '4\nz 4\ny 3\nx 2\nw 1', expectedOutput: '1 -> w\n2 -> x\n3 -> y\n4 -> z' },
    ],
    solution: {
      approach: 'Invert mappings into a dictionary and iterate over sorted keys.',
      code: `n = int(input())
inv = {}
for _ in range(n):
    k, v = input().split()
    inv[v] = k
for k in sorted(inv):
    print(f"{k} -> {inv[k]}")`,
      timeComplexity: 'O(N log N)',
      spaceComplexity: 'O(N)',
    },
    isPublished: true,
  },
  {
    id: 'py-069',
    problemNumber: 69,
    slug: 'merge-two-inventory-dictionaries',
    title: 'Merge Inventories with Value Sums',
    difficulty: 'Medium',
    topic: 'Dictionaries',
    topics: ['Dictionaries'],
    relatedDay: 19,
    relatedCurriculumTopic: 'Dictionary Merging & DefaultDict',
    description: 'Line 1 contains an integer `N1`. The next `N1` lines contain inventory pairs `Item Quantity` for Warehouse 1. Next comes integer `N2`, followed by `N2` lines of `Item Quantity` for Warehouse 2. Merge both warehouses by adding quantities for identical items. Print the combined inventory sorted alphabetically by item name in the format `Item: TotalQuantity`.',
    inputFormat: 'Lines detailing Warehouse 1 and Warehouse 2.',
    outputFormat: 'Print merged items with summed quantities sorted alphabetically.',
    constraints: '1 <= N1, N2 <= 1000, 1 <= Quantity <= 10^6',
    examples: [
      { input: '2\nApple 10\nBanana 5\n2\nBanana 15\nOrange 8', output: 'Apple: 10\nBanana: 20\nOrange: 8', explanation: 'Banana quantity 5+15=20.' },
    ],
    starterCode: 'import collections\n# Merge inventories\n',
    hints: [
      'Use collections.defaultdict(int).',
      'Add quantities for items from both warehouses.'
    ],
    publicTestCases: [
      { input: '2\nApple 10\nBanana 5\n2\nBanana 15\nOrange 8', expectedOutput: 'Apple: 10\nBanana: 20\nOrange: 8' },
    ],
    hiddenTestCases: [
      { input: '1\nWidget 50\n1\nWidget 50', expectedOutput: 'Widget: 100' },
      { input: '2\nA 1\nB 2\n2\nC 3\nD 4', expectedOutput: 'A: 1\nB: 2\nC: 3\nD: 4' },
    ],
    solution: {
      approach: 'Use defaultdict to sum item quantities and print in sorted alphabetical order.',
      code: `import collections
inv = collections.defaultdict(int)
n1 = int(input())
for _ in range(n1):
    item, qty = input().split()
    inv[item] += int(qty)
n2 = int(input())
for _ in range(n2):
    item, qty = input().split()
    inv[item] += int(qty)
for item in sorted(inv):
    print(f"{item}: {inv[item]}")`,
      timeComplexity: 'O((N1+N2) log K)',
      spaceComplexity: 'O(K)',
    },
    isPublished: true,
  },
  {
    id: 'py-070',
    problemNumber: 70,
    slug: 'top-k-frequent-words-ranker',
    title: 'Top K Frequent Words',
    difficulty: 'Hard',
    topic: 'Dictionaries',
    topics: ['Dictionaries', 'Sorting', 'Strings'],
    relatedDay: 20,
    relatedCurriculumTopic: 'Custom Multi-Key Sorting',
    description: 'Line 1 contains a paragraph of text `S`. Line 2 contains an integer `K`. Find the top `K` most frequent lowercase words. Sort them primarily by frequency in descending order, and secondarily alphabetically in ascending order for words with equal frequency. Print each on a new line as `word: count`.',
    inputFormat: 'Line 1: Text `S`\nLine 2: Integer `K`',
    outputFormat: 'Print top `K` words.',
    constraints: '1 <= word count <= 10^5, 1 <= K <= unique word count',
    examples: [
      { input: 'the day is sunny the the the sunny is is\n2', output: 'the: 4\nis: 3', explanation: '"the" appears 4 times, "is" appears 3 times.' },
      { input: 'i love kriora i love coding\n2', output: 'i: 2\nlove: 2', explanation: '"i" and "love" both have count 2, "i" comes first alphabetically.' },
    ],
    starterCode: 'import collections\ns = input()\nk = int(input())\n\n# Find top k frequent words with tie-break\n',
    hints: [
      'Count frequencies using collections.Counter(words).',
      'Sort items with key=lambda x: (-x[1], x[0]).',
      'Take the first k elements.'
    ],
    publicTestCases: [
      { input: 'the day is sunny the the the sunny is is\n2', expectedOutput: 'the: 4\nis: 3' },
      { input: 'i love kriora i love coding\n2', expectedOutput: 'i: 2\nlove: 2' },
    ],
    hiddenTestCases: [
      { input: 'apple banana apple orange banana\n3', expectedOutput: 'apple: 2\nbanana: 2\norange: 1' },
      { input: 'single\n1', expectedOutput: 'single: 1' },
    ],
    solution: {
      approach: 'Use collections.Counter and multi-criteria sort key (-count, word).',
      code: `import collections
words = [w.lower() for w in input().split()]
k = int(input())
counts = collections.Counter(words)
sorted_words = sorted(counts.items(), key=lambda item: (-item[1], item[0]))
for word, count in sorted_words[:k]:
    print(f"{word}: {count}")`,
      timeComplexity: 'O(N log N)',
      spaceComplexity: 'O(N)',
    },
    isPublished: true,
  },
  {
    id: 'py-071',
    problemNumber: 71,
    slug: 'group-anagrams-together',
    title: 'Group Anagrams',
    difficulty: 'Hard',
    topic: 'Dictionaries',
    topics: ['Dictionaries', 'Strings', 'Hash Map'],
    relatedDay: 20,
    relatedCurriculumTopic: 'Hash Map Grouping Patterns',
    description: 'The first line contains an integer `N`, followed by `N` space-separated words on the second line. Group anagrams together. For each anagram group, sort the words within the group alphabetically. Print each group on a separate line sorted by the first word of the group.',
    inputFormat: 'Line 1: `N`\nLine 2: `N` words',
    outputFormat: 'Print each anagram group on a new line with words separated by spaces.',
    constraints: '1 <= N <= 10^4',
    examples: [
      { input: '6\neat tea tan ate nat bat', output: 'ate eat tea\nbat\nnat tan', explanation: 'Groups: [ate, eat, tea], [bat], [nat, tan].' },
      { input: '1\na', output: 'a', explanation: 'Single element group.' },
    ],
    starterCode: 'n = int(input())\nwords = input().split()\n\n# Group anagrams together\n',
    hints: [
      'Use sorted word string as hash key: key = "".join(sorted(w)).',
      'Store in collections.defaultdict(list).'
    ],
    publicTestCases: [
      { input: '6\neat tea tan ate nat bat', expectedOutput: 'ate eat tea\nbat\nnat tan' },
      { input: '1\na', expectedOutput: 'a' },
    ],
    hiddenTestCases: [
      { input: '4\nabc bca cab cba', expectedOutput: 'abc bca cab cba' },
      { input: '3\na b c', expectedOutput: 'a\nb\nc' },
    ],
    solution: {
      approach: 'Group words by sorted-tuple key, sort each group, then sort groups by their leading element.',
      code: `import collections
n = int(input())
words = input().split()
groups = collections.defaultdict(list)
for w in words:
    key = "".join(sorted(w))
    groups[key].append(w)
result_groups = [sorted(g) for g in groups.values()]
result_groups.sort(key=lambda g: g[0])
for g in result_groups:
    print(" ".join(g))`,
      timeComplexity: 'O(N * K log K)',
      spaceComplexity: 'O(N * K)',
    },
    isPublished: true,
  },
  {
    id: 'py-072',
    problemNumber: 72,
    slug: 'phonebook-contact-lookup-system',
    title: 'Phonebook Contact Lookup',
    difficulty: 'Easy',
    topic: 'Dictionaries',
    topics: ['Dictionaries'],
    relatedDay: 20,
    relatedCurriculumTopic: 'Fast Hash Map Lookups',
    description: 'Line 1 contains an integer `N` (number of entries). The next `N` lines contain `Name PhoneNumber`. Line `N+2` contains integer `Q` (queries), followed by `Q` lines each containing a name to look up. For each query, print `<Name>=<PhoneNumber>` if found, or `NOT FOUND`.',
    inputFormat: 'Contacts list followed by queries count and query names.',
    outputFormat: 'Print result for each query.',
    constraints: '1 <= N, Q <= 10^4',
    examples: [
      { input: '3\nsam 99912222\ntom 11122222\nharry 12299933\n2\nsam\nedward', output: 'sam=99912222\nNOT FOUND', explanation: 'sam is present, edward is not.' },
    ],
    starterCode: 'n = int(input())\n\n# Build phonebook and handle queries\n',
    hints: [
      'Store contacts in a dictionary: phonebook[name] = number.',
      'Check if query in phonebook: print f"{query}={phonebook[query]}" else "NOT FOUND".'
    ],
    publicTestCases: [
      { input: '3\nsam 99912222\ntom 11122222\nharry 12299933\n2\nsam\nedward', expectedOutput: 'sam=99912222\nNOT FOUND' },
    ],
    hiddenTestCases: [
      { input: '1\nalice 123456\n1\nalice', expectedOutput: 'alice=123456' },
      { input: '2\nbob 555\ncharlie 777\n2\ndave\nbob', expectedOutput: 'NOT FOUND\nbob=555' },
    ],
    solution: {
      approach: 'Read phonebook into dictionary, answer each query in O(1) time.',
      code: `n = int(input())
phonebook = {}
for _ in range(n):
    name, phone = input().split()
    phonebook[name] = phone
q = int(input())
for _ in range(q):
    query = input().strip()
    if query in phonebook:
        print(f"{query}={phonebook[query]}")
    else:
        print("NOT FOUND")`,
      timeComplexity: 'O(N + Q)',
      spaceComplexity: 'O(N)',
    },
    isPublished: true,
  },
  {
    id: 'py-073',
    problemNumber: 73,
    slug: 'first-non-repeating-character-index',
    title: 'First Non-Repeating Character',
    difficulty: 'Easy',
    topic: 'Dictionaries',
    topics: ['Dictionaries', 'Strings'],
    relatedDay: 20,
    relatedCurriculumTopic: 'Frequency Map Two-Pass Algorithm',
    description: 'Given a string `S`, find the first non-repeating character and print its 0-based index. If no unique character exists, print `-1`.',
    inputFormat: 'A single string `S`.',
    outputFormat: 'Print index of first non-repeating character or `-1`.',
    constraints: '1 <= len(S) <= 10^5',
    examples: [
      { input: 'leetcode', output: '0', explanation: '"l" is the first non-repeating character at index 0.' },
      { input: 'loveleetcode', output: '2', explanation: '"v" is the first unique character at index 2.' },
      { input: 'aabb', output: '-1', explanation: 'All characters repeat.' },
    ],
    starterCode: 's = input().strip()\n\n# Find first non-repeating character index\n',
    hints: [
      'Pass 1: Count frequency of each character in collections.Counter(s).',
      'Pass 2: Iterate enumerate(s) and return index of first char with count == 1.'
    ],
    publicTestCases: [
      { input: 'leetcode', expectedOutput: '0' },
      { input: 'loveleetcode', expectedOutput: '2' },
      { input: 'aabb', expectedOutput: '-1' },
    ],
    hiddenTestCases: [
      { input: 'z', expectedOutput: '0' },
      { input: 'kriorakriora', expectedOutput: '-1' },
      { input: 'abacabad', expectedOutput: '7' },
    ],
    solution: {
      approach: 'Two-pass frequency scan in O(N) time.',
      code: `import collections
s = input().strip()
counts = collections.Counter(s)
ans = -1
for idx, c in enumerate(s):
    if counts[c] == 1:
        ans = idx
        break
print(ans)`,
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(Alphabet Size)',
    },
    isPublished: true,
  },
  {
    id: 'py-074',
    problemNumber: 74,
    slug: 'roman-to-integer-numeral-decoder',
    title: 'Roman to Integer Converter',
    difficulty: 'Medium',
    topic: 'Dictionaries',
    topics: ['Dictionaries', 'Math', 'Strings'],
    relatedDay: 21,
    relatedCurriculumTopic: 'Subtractive Combinations in Dictionaries',
    description: 'Convert a given Roman numeral string `S` (`I=1, V=5, X=10, L=50, C=100, D=500, M=1000`) into its integer equivalent.',
    inputFormat: 'A single string `S` representing a valid Roman numeral.',
    outputFormat: 'Print the integer value.',
    constraints: '1 <= len(S) <= 15',
    examples: [
      { input: 'III', output: '3', explanation: 'III = 3.' },
      { input: 'LVIII', output: '58', explanation: 'L = 50, V = 5, III = 3 -> 58.' },
      { input: 'MCMXCIV', output: '1994', explanation: 'M = 1000, CM = 900, XC = 90, IV = 4.' },
    ],
    starterCode: 's = input().strip()\n\n# Convert Roman numeral to integer\n',
    hints: [
      'Map Roman symbols to values in a dictionary.',
      'If current value is less than the next value, subtract it (e.g. IV: 5 - 1 = 4).'
    ],
    publicTestCases: [
      { input: 'III', expectedOutput: '3' },
      { input: 'LVIII', expectedOutput: '58' },
      { input: 'MCMXCIV', expectedOutput: '1994' },
    ],
    hiddenTestCases: [
      { input: 'IX', expectedOutput: '9' },
      { input: 'XL', expectedOutput: '40' },
      { input: 'CD', expectedOutput: '400' },
      { input: 'MMXXIV', expectedOutput: '2024' },
    ],
    solution: {
      approach: 'Iterate through string, subtracting when current < next, otherwise adding.',
      code: `roman_map = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000}
s = input().strip()
total = 0
n = len(s)
for i in range(n):
    val = roman_map[s[i]]
    if i + 1 < n and val < roman_map[s[i + 1]]:
        total -= val
    else:
        total += val
print(total)`,
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)',
    },
    isPublished: true,
  },
  {
    id: 'py-075',
    problemNumber: 75,
    slug: 'integer-to-roman-numeral-encoder',
    title: 'Integer to Roman Numeral',
    difficulty: 'Medium',
    topic: 'Dictionaries',
    topics: ['Dictionaries', 'Math', 'Strings'],
    relatedDay: 21,
    relatedCurriculumTopic: 'Greedy Mapping with Ordered Pairs',
    description: 'Given an integer `N` (1 to 3999), convert it into a Roman numeral string.',
    inputFormat: 'A single integer `N`.',
    outputFormat: 'Print the Roman numeral string.',
    constraints: '1 <= N <= 3999',
    examples: [
      { input: '3749', output: 'MMMDCCXLIX', explanation: '3000 (MMM) + 700 (DCC) + 40 (XL) + 9 (IX).' },
      { input: '58', output: 'LVIII', explanation: '50 (L) + 8 (VIII).' },
      { input: '1994', output: 'MCMXCIV', explanation: '1000 (M) + 900 (CM) + 90 (XC) + 4 (IV).' },
    ],
    starterCode: 'num = int(input())\n\n# Convert integer to Roman numeral\n',
    hints: [
      'Store list of (value, symbol) tuples in descending order: [(1000, "M"), (900, "CM"), (500, "D"), ...].',
      'Repeatedly divide and subtract.'
    ],
    publicTestCases: [
      { input: '3749', expectedOutput: 'MMMDCCXLIX' },
      { input: '58', expectedOutput: 'LVIII' },
      { input: '1994', expectedOutput: 'MCMXCIV' },
    ],
    hiddenTestCases: [
      { input: '1', expectedOutput: 'I' },
      { input: '4', expectedOutput: 'IV' },
      { input: '9', expectedOutput: 'IX' },
      { input: '3999', expectedOutput: 'MMMCMXCIX' },
    ],
    solution: {
      approach: 'Greedy subtraction using standard symbol value pairs.',
      code: `num = int(input())
val_map = [
    (1000, "M"), (900, "CM"), (500, "D"), (400, "CD"),
    (100, "C"), (90, "XC"), (50, "L"), (40, "XL"),
    (10, "X"), (9, "IX"), (5, "V"), (4, "IV"), (1, "I")
]
res = []
for val, sym in val_map:
    while num >= val:
        res.append(sym)
        num -= val
print("".join(res))`,
      timeComplexity: 'O(1)',
      spaceComplexity: 'O(1)',
    },
    isPublished: true,
  },
  {
    id: 'py-076',
    problemNumber: 76,
    slug: 'lru-cache-simulator',
    title: 'LRU Cache Simulation',
    difficulty: 'Hard',
    topic: 'Dictionaries',
    topics: ['Dictionaries', 'OrderedDict', 'Data Structures'],
    relatedDay: 22,
    relatedCurriculumTopic: 'OrderedDict & LRU Eviction',
    description: 'Line 1 contains integers `Capacity` and `OperationsCount Q`. The next `Q` lines contain operations: `PUT key value` or `GET key`. For `GET key`, print the value if found (and mark as recently used), or `-1` if not found. For `PUT key value`, insert or update the key-value pair; if the cache exceeds capacity, evict the Least Recently Used (LRU) key.',
    inputFormat: 'Line 1: `Capacity Q`\nNext `Q` lines: operations.',
    outputFormat: 'Print the output for each `GET` operation on a new line.',
    constraints: '1 <= Capacity <= 1000, 1 <= Q <= 10^4',
    examples: [
      { input: '2 6\nPUT 1 1\nPUT 2 2\nGET 1\nPUT 3 3\nGET 2\nGET 3', output: '1\n-1\n3', explanation: 'GET 1 returns 1. PUT 3 evicts key 2 (LRU). GET 2 returns -1. GET 3 returns 3.' },
    ],
    starterCode: 'import collections\n# Implement LRU cache simulation\n',
    hints: [
      'Use collections.OrderedDict.',
      'On GET: move_to_end(key).',
      'On PUT: if key exists move_to_end, else if len >= capacity popitem(last=False).'
    ],
    publicTestCases: [
      { input: '2 6\nPUT 1 1\nPUT 2 2\nGET 1\nPUT 3 3\nGET 2\nGET 3', expectedOutput: '1\n-1\n3' },
    ],
    hiddenTestCases: [
      { input: '1 4\nPUT 10 100\nGET 10\nPUT 20 200\nGET 10', expectedOutput: '100\n-1' },
      { input: '2 3\nGET 5\nPUT 5 50\nGET 5', expectedOutput: '-1\n50' },
    ],
    solution: {
      approach: 'Implement LRU cache using collections.OrderedDict with move_to_end and popitem(last=False).',
      code: `import collections
import sys

lines = sys.stdin.read().splitlines()
if not lines:
    sys.exit(0)
cap, q = map(int, lines[0].split())
cache = collections.OrderedDict()

for line in lines[1:q+1]:
    parts = line.split()
    if not parts:
        continue
    op = parts[0]
    if op == "GET":
        key = parts[1]
        if key in cache:
            cache.move_to_end(key)
            print(cache[key])
        else:
            print("-1")
    elif op == "PUT":
        key, val = parts[1], parts[2]
        if key in cache:
            cache.move_to_end(key)
        elif len(cache) >= cap:
            cache.popitem(last=False)
        cache[key] = val`,
      timeComplexity: 'O(1) per operation',
      spaceComplexity: 'O(Capacity)',
    },
    isPublished: true,
  },
];
