import type { PracticeProblem } from '../types';

export const STRINGS_PROBLEMS: PracticeProblem[] = [
  {
    id: 'py-039',
    problemNumber: 39,
    slug: 'reverse-a-string',
    title: 'Reverse a String',
    difficulty: 'Easy',
    topic: 'Strings',
    topics: ['Strings', 'Slicing'],
    relatedDay: 11,
    relatedCurriculumTopic: 'String Slicing & Indexing',
    description: 'Given a string `S`, print the reversed string.',
    inputFormat: 'A single line containing string `S`.',
    outputFormat: 'Print the reversed string.',
    constraints: '1 <= len(S) <= 10^5',
    examples: [
      { input: 'hello', output: 'olleh', explanation: 'Reverse of hello is olleh.' },
      { input: 'Kriora', output: 'aroirK', explanation: 'Reverse of Kriora is aroirK.' },
    ],
    starterCode: 's = input()\n\n# Reverse string\n',
    hints: [
      'Use Python slice notation: s[::-1].'
    ],
    publicTestCases: [
      { input: 'hello', expectedOutput: 'olleh' },
      { input: 'Kriora', expectedOutput: 'aroirK' },
    ],
    hiddenTestCases: [
      { input: 'a', expectedOutput: 'a' },
      { input: '12345', expectedOutput: '54321' },
      { input: 'racecar', expectedOutput: 'racecar' },
    ],
    solution: {
      approach: 'Use the extended slice s[::-1].',
      code: `s = input()
print(s[::-1])`,
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
    },
    isPublished: true,
  },
  {
    id: 'py-040',
    problemNumber: 40,
    slug: 'palindrome-string-checker',
    title: 'Palindrome String Checker',
    difficulty: 'Medium',
    topic: 'Strings',
    topics: ['Strings', 'Two Pointers'],
    relatedDay: 11,
    relatedCurriculumTopic: 'Palindromes & Case Normalization',
    description: 'Given a string `S`, determine if it is a palindrome ignoring case and non-alphanumeric characters (letters and digits only). Print `PALINDROME` or `NOT PALINDROME`.',
    inputFormat: 'A single line of text `S`.',
    outputFormat: 'Print `PALINDROME` or `NOT PALINDROME`.',
    constraints: '1 <= len(S) <= 10^5',
    examples: [
      { input: 'A man, a plan, a canal: Panama', output: 'PALINDROME', explanation: 'Filtered alphanumeric: "amanaplanacanalpanama" is a palindrome.' },
      { input: 'race a car', output: 'NOT PALINDROME', explanation: '"raceacar" is not a palindrome.' },
      { input: 'No lemon, no melon', output: 'PALINDROME', explanation: 'Filtered alphanumeric is symmetric.' },
    ],
    starterCode: 's = input()\n\n# Check if palindrome ignoring case and punctuation\n',
    hints: [
      'Filter characters: cleaned = "".join(c.lower() for c in s if c.isalnum()).',
      'Check if cleaned == cleaned[::-1].'
    ],
    publicTestCases: [
      { input: 'A man, a plan, a canal: Panama', expectedOutput: 'PALINDROME' },
      { input: 'race a car', expectedOutput: 'NOT PALINDROME' },
      { input: 'No lemon, no melon', expectedOutput: 'PALINDROME' },
    ],
    hiddenTestCases: [
      { input: 'Was it a car or a cat I saw?', expectedOutput: 'PALINDROME' },
      { input: 'Madam, I\'m Adam.', expectedOutput: 'PALINDROME' },
      { input: 'Kriora LMS', expectedOutput: 'NOT PALINDROME' },
    ],
    solution: {
      approach: 'Filter alphanumeric characters into lowercase, compare with reversed string.',
      code: `s = input()
cleaned = "".join(c.lower() for c in s if c.isalnum())
if cleaned == cleaned[::-1]:
    print("PALINDROME")
else:
    print("NOT PALINDROME")`,
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
    },
    isPublished: true,
  },
  {
    id: 'py-041',
    problemNumber: 41,
    slug: 'count-vowels-and-consonants',
    title: 'Count Vowels and Consonants',
    difficulty: 'Medium',
    topic: 'Strings',
    topics: ['Strings'],
    relatedDay: 11,
    relatedCurriculumTopic: 'Character Classification',
    description: 'Given an input string `S`, count the number of vowels (`a, e, i, o, u`, case-insensitive) and consonants (alphabetic characters that are not vowels). Ignore spaces, digits, and punctuation. Print `vowels consonants` separated by a space.',
    inputFormat: 'A single line of text `S`.',
    outputFormat: 'Print `vowels consonants`.',
    constraints: '1 <= len(S) <= 10^5',
    examples: [
      { input: 'Hello World', output: '3 7', explanation: 'Vowels: e, o, o (3). Consonants: H, l, l, W, r, l, d (7).' },
      { input: 'Python 3.11', output: '1 5', explanation: 'Vowel: o (1). Consonants: P, y, t, h, n (5).' },
    ],
    starterCode: 's = input()\n\n# Count vowels and consonants\n',
    hints: [
      'Define vowels = set("aeiou").',
      'For each character c in s: if c.isalpha(), check if c.lower() in vowels.'
    ],
    publicTestCases: [
      { input: 'Hello World', expectedOutput: '3 7' },
      { input: 'Python 3.11', expectedOutput: '1 5' },
    ],
    hiddenTestCases: [
      { input: 'AEIOU aeiou', expectedOutput: '10 0' },
      { input: '12345!@#$', expectedOutput: '0 0' },
      { input: 'Kriora Academy', expectedOutput: '6 7' },
    ],
    solution: {
      approach: 'Iterate characters, test isalpha() and membership in vowels set.',
      code: `s = input()
vowels_set = set("aeiouAEIOU")
v_count = sum(1 for c in s if c in vowels_set)
c_count = sum(1 for c in s if c.isalpha() and c not in vowels_set)
print(v_count, c_count)`,
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)',
    },
    isPublished: true,
  },
  {
    id: 'py-042',
    problemNumber: 42,
    slug: 'custom-title-case-formatter',
    title: 'Custom Title Case Capitalizer',
    difficulty: 'Easy',
    topic: 'Strings',
    topics: ['Strings'],
    relatedDay: 12,
    relatedCurriculumTopic: 'String Methods (split, capitalize, join)',
    description: 'Read a sentence `S`. Capitalize the first letter of each word and convert all other letters in that word to lowercase. Preserve single space between words.',
    inputFormat: 'A single line of text `S`.',
    outputFormat: 'Print the title-cased sentence.',
    constraints: '1 <= len(S) <= 10^4',
    examples: [
      { input: 'kRIORA lMS pROGRAMMING', output: 'Kriora Lms Programming', explanation: 'First letter capital, rest lowercase.' },
      { input: 'hello world', output: 'Hello World', explanation: 'Standard title case.' },
    ],
    starterCode: 's = input()\n\n# Convert to custom title case\n',
    hints: [
      'Split words by space: words = s.split().',
      'For each word w: w.capitalize().',
      'Join with " ".join(...).'
    ],
    publicTestCases: [
      { input: 'kRIORA lMS pROGRAMMING', expectedOutput: 'Kriora Lms Programming' },
      { input: 'hello world', expectedOutput: 'Hello World' },
    ],
    hiddenTestCases: [
      { input: 'PYTHON', expectedOutput: 'Python' },
      { input: 'a b c', expectedOutput: 'A B C' },
      { input: 'data STRUCTURES AND algorithms', expectedOutput: 'Data Structures And Algorithms' },
    ],
    solution: {
      approach: 'Split string into words, apply .capitalize() to each word, and join.',
      code: `words = input().split()
print(" ".join(w.capitalize() for w in words))`,
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
    },
    isPublished: true,
  },
  {
    id: 'py-043',
    problemNumber: 43,
    slug: 'valid-anagram-detector',
    title: 'Valid Anagram Detector',
    difficulty: 'Medium',
    topic: 'Strings',
    topics: ['Strings', 'Hash Map', 'Sorting'],
    relatedDay: 12,
    relatedCurriculumTopic: 'Character Frequency & Anagrams',
    description: 'Given two strings `s1` and `s2` on two separate lines, determine if `s2` is an anagram of `s1` (same characters with the same frequencies, case-insensitive, ignoring whitespace). Print `ANAGRAM` or `NOT ANAGRAM`.',
    inputFormat: 'Line 1: string `s1`\nLine 2: string `s2`',
    outputFormat: 'Print `ANAGRAM` or `NOT ANAGRAM`.',
    constraints: '1 <= len(s1), len(s2) <= 10^5',
    examples: [
      { input: 'listen\nsilent', output: 'ANAGRAM', explanation: '"listen" and "silent" contain identical letters.' },
      { input: 'triangle\nintegral', output: 'ANAGRAM', explanation: 'Same letters.' },
      { input: 'rat\ncar', output: 'NOT ANAGRAM', explanation: 'Different letters.' },
    ],
    starterCode: 's1 = input()\ns2 = input()\n\n# Check if anagram\n',
    hints: [
      'Clean strings: remove spaces, convert to lowercase.',
      'Compare sorted(s1_clean) == sorted(s2_clean) or use collections.Counter.'
    ],
    publicTestCases: [
      { input: 'listen\nsilent', expectedOutput: 'ANAGRAM' },
      { input: 'triangle\nintegral', expectedOutput: 'ANAGRAM' },
      { input: 'rat\ncar', expectedOutput: 'NOT ANAGRAM' },
    ],
    hiddenTestCases: [
      { input: 'Debit Card\nBad Credit', expectedOutput: 'ANAGRAM' },
      { input: 'Astronomer\nMoon starer', expectedOutput: 'ANAGRAM' },
      { input: 'hello\nworld', expectedOutput: 'NOT ANAGRAM' },
    ],
    solution: {
      approach: 'Clean strings to lowercase letters only and compare character count frequencies.',
      code: `import collections
s1 = [c.lower() for c in input() if c.isalnum()]
s2 = [c.lower() for c in input() if c.isalnum()]
if collections.Counter(s1) == collections.Counter(s2):
    print("ANAGRAM")
else:
    print("NOT ANAGRAM")`,
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
    },
    isPublished: true,
  },
  {
    id: 'py-044',
    problemNumber: 44,
    slug: 'run-length-encoding-string-compression',
    title: 'Run-Length String Encoding',
    difficulty: 'Medium',
    topic: 'Strings',
    topics: ['Strings', 'Compression'],
    relatedDay: 12,
    relatedCurriculumTopic: 'Consecutive Character Counting',
    description: 'Implement basic Run-Length Encoding. For consecutive identical characters in string `S`, output the character followed by its consecutive run count (e.g. `"aaabbc"` -> `"a3b2c1"`). If the input is empty, output empty.',
    inputFormat: 'A single string `S`.',
    outputFormat: 'Print the compressed string.',
    constraints: '0 <= len(S) <= 10^5',
    examples: [
      { input: 'aaabbc', output: 'a3b2c1', explanation: '3 a\'s, 2 b\'s, 1 c.' },
      { input: 'wwwwaaadexxxxxx', output: 'w4a3d1e1x6', explanation: 'Run-length encoded format.' },
      { input: 'A', output: 'A1', explanation: 'Single character.' },
    ],
    starterCode: 'import sys\ns = sys.stdin.read().rstrip("\\n\\r")\n\n# Perform run length encoding\n',
    hints: [
      'Track current_char and current_count.',
      'Iterate through the string, appending to result when the character changes.'
    ],
    publicTestCases: [
      { input: 'aaabbc', expectedOutput: 'a3b2c1' },
      { input: 'wwwwaaadexxxxxx', expectedOutput: 'w4a3d1e1x6' },
      { input: 'A', expectedOutput: 'A1' },
    ],
    hiddenTestCases: [
      { input: 'abcdef', expectedOutput: 'a1b1c1d1e1f1' },
      { input: 'aaaaaa', expectedOutput: 'a6' },
      { input: 'aabbccaa', expectedOutput: 'a2b2c2a2' },
    ],
    solution: {
      approach: 'Iterate through string with two pointers or run counter, build compressed string.',
      code: `import sys
s = sys.stdin.read().rstrip("\\n\\r")
if not s:
    print("")
else:
    res = []
    curr_char = s[0]
    count = 1
    for c in s[1:]:
        if c == curr_char:
            count += 1
        else:
            res.append(f"{curr_char}{count}")
            curr_char = c
            count = 1
    res.append(f"{curr_char}{count}")
    print("".join(res))`,
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
    },
    isPublished: true,
  },
  {
    id: 'py-045',
    problemNumber: 45,
    slug: 'run-length-string-decoder',
    title: 'Run-Length String Decoder',
    difficulty: 'Medium',
    topic: 'Strings',
    topics: ['Strings', 'Parsing'],
    relatedDay: 12,
    relatedCurriculumTopic: 'String Parsing & Expansion',
    description: 'Given a run-length encoded string consisting of pairs of a character followed by an integer count (e.g. `"a3b2c1"` or `"x12y2"`), decode and print the expanded original string.',
    inputFormat: 'A single encoded string `S`.',
    outputFormat: 'Print the decoded string.',
    constraints: '1 <= len(S) <= 1000, 1 <= each count <= 1000',
    examples: [
      { input: 'a3b2c1', output: 'aaabbc', explanation: '3 a\'s, 2 b\'s, 1 c.' },
      { input: 'w4x2', output: 'wwwwxx', explanation: '4 w\'s and 2 x\'s.' },
      { input: 'A10', output: 'AAAAAAAAAA', explanation: '10 A\'s.' },
    ],
    starterCode: 's = input()\n\n# Decode run-length string\n',
    hints: [
      'Iterate through characters. When you see a non-digit, save it.',
      'Accumulate the following digits to form the number, then multiply char * count.'
    ],
    publicTestCases: [
      { input: 'a3b2c1', expectedOutput: 'aaabbc' },
      { input: 'w4x2', expectedOutput: 'wwwwxx' },
      { input: 'A10', expectedOutput: 'AAAAAAAAAA' },
    ],
    hiddenTestCases: [
      { input: 'k1r1i1o1r1a1', expectedOutput: 'kriora' },
      { input: 'Z5', expectedOutput: 'ZZZZZ' },
      { input: 'a1b1c1d1', expectedOutput: 'abcd' },
    ],
    solution: {
      approach: 'Parse character and digit spans using regex or character iteration.',
      code: `import re
s = input()
matches = re.findall(r'([a-zA-Z])(\d+)', s)
res = [char * int(count) for char, count in matches]
print("".join(res))`,
      timeComplexity: 'O(Total Output Length)',
      spaceComplexity: 'O(Total Output Length)',
    },
    isPublished: true,
  },
  {
    id: 'py-046',
    problemNumber: 46,
    slug: 'longest-common-prefix-array',
    title: 'Longest Common Prefix',
    difficulty: 'Medium',
    topic: 'Strings',
    topics: ['Strings', 'Algorithms'],
    relatedDay: 12,
    relatedCurriculumTopic: 'Prefix Matching & Character Comparison',
    description: 'The first line contains an integer `N`, followed by `N` words on the second line separated by spaces. Find and print the longest common prefix shared by all `N` words. If there is no common prefix, print `NO COMMON PREFIX`.',
    inputFormat: 'Line 1: Integer `N`\nLine 2: `N` space-separated words',
    outputFormat: 'Print the longest common prefix or `NO COMMON PREFIX`.',
    constraints: '1 <= N <= 1000, 1 <= word length <= 1000',
    examples: [
      { input: '3\nflower flow flight', output: 'fl', explanation: '"fl" is the common prefix.' },
      { input: '3\ndog racecar car', output: 'NO COMMON PREFIX', explanation: 'No shared prefix.' },
      { input: '2\ninterview intermediate', output: 'inter', explanation: '"inter" is the common prefix.' },
    ],
    starterCode: 'n = int(input())\nwords = input().split()\n\n# Find longest common prefix\n',
    hints: [
      'Take the first word as initial prefix.',
      'For every other word, shrink the prefix while not word.startswith(prefix).'
    ],
    publicTestCases: [
      { input: '3\nflower flow flight', expectedOutput: 'fl' },
      { input: '3\ndog racecar car', expectedOutput: 'NO COMMON PREFIX' },
      { input: '2\ninterview intermediate', expectedOutput: 'inter' },
    ],
    hiddenTestCases: [
      { input: '1\nalone', expectedOutput: 'alone' },
      { input: '3\nthunder thunderous thunderbolt', expectedOutput: 'thunder' },
      { input: '4\na b c d', expectedOutput: 'NO COMMON PREFIX' },
    ],
    solution: {
      approach: 'Compare characters index by index across all strings until a mismatch occurs.',
      code: `n = int(input())
words = input().split()
if not words:
    print("NO COMMON PREFIX")
else:
    prefix = words[0]
    for w in words[1:]:
        while not w.startswith(prefix):
            prefix = prefix[:-1]
            if not prefix:
                break
    print(prefix if prefix else "NO COMMON PREFIX")`,
      timeComplexity: 'O(N * M)',
      spaceComplexity: 'O(M)',
    },
    isPublished: true,
  },
  {
    id: 'py-047',
    problemNumber: 47,
    slug: 'balanced-parentheses-and-brackets',
    title: 'Valid Parentheses and Brackets',
    difficulty: 'Hard',
    topic: 'Strings',
    topics: ['Strings', 'Stack'],
    relatedDay: 13,
    relatedCurriculumTopic: 'Stack Data Structure with Lists',
    description: 'Given a string containing only bracket characters `(`, `)`, `{`, `}`, `[`, `]`, determine if the input string is valid. A string is valid if open brackets are closed by the same type of brackets in the correct order. Print `BALANCED` or `UNBALANCED`.',
    inputFormat: 'A single string `S`.',
    outputFormat: 'Print `BALANCED` or `UNBALANCED`.',
    constraints: '1 <= len(S) <= 10^5',
    examples: [
      { input: '()[]{}', output: 'BALANCED', explanation: 'All brackets match correctly.' },
      { input: '([{}])', output: 'BALANCED', explanation: 'Properly nested brackets.' },
      { input: '(]', output: 'UNBALANCED', explanation: 'Mismatched closing bracket.' },
      { input: '([)]', output: 'UNBALANCED', explanation: 'Improperly interleaved brackets.' },
    ],
    starterCode: 's = input().strip()\n\n# Check if brackets are balanced using a stack\n',
    hints: [
      'Use a list as a stack.',
      'Push opening brackets: "(", "{", "[".',
      'For closing brackets, pop and verify matching pair.'
    ],
    publicTestCases: [
      { input: '()[]{}', expectedOutput: 'BALANCED' },
      { input: '([{}])', expectedOutput: 'BALANCED' },
      { input: '(]', expectedOutput: 'UNBALANCED' },
      { input: '([)]', expectedOutput: 'UNBALANCED' },
    ],
    hiddenTestCases: [
      { input: '((()))', expectedOutput: 'BALANCED' },
      { input: '(', expectedOutput: 'UNBALANCED' },
      { input: '}', expectedOutput: 'UNBALANCED' },
      { input: '{[()]}()[]{}', expectedOutput: 'BALANCED' },
    ],
    solution: {
      approach: 'Use a stack to match opening brackets with corresponding closing brackets.',
      code: `s = input().strip()
mapping = {')': '(', '}': '{', ']': '['}
stack = []
balanced = True
for char in s:
    if char in mapping.values():
        stack.append(char)
    elif char in mapping:
        if not stack or stack[-1] != mapping[char]:
            balanced = False
            break
        stack.pop()
if balanced and not stack:
    print("BALANCED")
else:
    print("UNBALANCED")`,
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
    },
    isPublished: true,
  },
  {
    id: 'py-048',
    problemNumber: 48,
    slug: 'longest-palindromic-substring-finder',
    title: 'Longest Palindromic Substring',
    difficulty: 'Hard',
    topic: 'Strings',
    topics: ['Strings', 'Algorithms', 'Two Pointers'],
    relatedDay: 13,
    relatedCurriculumTopic: 'Expand Around Center Algorithm',
    description: 'Given a string `S`, find and print the longest palindromic substring in `S`. If there are multiple palindromic substrings of the same maximum length, print the one that appears earliest in `S`.',
    inputFormat: 'A single string `S`.',
    outputFormat: 'Print the longest palindromic substring.',
    constraints: '1 <= len(S) <= 1000',
    examples: [
      { input: 'babad', output: 'bab', explanation: '"bab" is the earliest longest palindrome (length 3).' },
      { input: 'cbbd', output: 'bb', explanation: '"bb" is the longest palindrome (length 2).' },
      { input: 'racecar', output: 'racecar', explanation: 'The entire string is a palindrome.' },
    ],
    starterCode: 's = input().strip()\n\n# Find longest palindromic substring\n',
    hints: [
      'Expand around each center i (odd length) and i, i+1 (even length).',
      'Keep track of the max length and start index.'
    ],
    publicTestCases: [
      { input: 'babad', expectedOutput: 'bab' },
      { input: 'cbbd', expectedOutput: 'bb' },
      { input: 'racecar', expectedOutput: 'racecar' },
    ],
    hiddenTestCases: [
      { input: 'a', expectedOutput: 'a' },
      { input: 'forgeeksskeegfor', expectedOutput: 'geeksskeeg' },
      { input: 'aacabdkakaa', expectedOutput: 'aka' },
    ],
    solution: {
      approach: 'Expand around each center (2N-1 centers) to find maximum palindrome boundaries.',
      code: `s = input().strip()
if len(s) <= 1:
    print(s)
else:
    def expand(left, right):
        while left >= 0 and right < len(s) and s[left] == s[right]:
            left -= 1
            right += 1
        return s[left + 1:right]

    longest = s[0]
    for i in range(len(s)):
        p1 = expand(i, i)
        p2 = expand(i, i + 1)
        if len(p1) > len(longest):
            longest = p1
        if len(p2) > len(longest):
            longest = p2
    print(longest)`,
      timeComplexity: 'O(N^2)',
      spaceComplexity: 'O(1)',
    },
    isPublished: true,
  },
];
