import type { PracticeProblem } from '../types';

export const LISTS_PROBLEMS: PracticeProblem[] = [
  {
    id: 'py-049',
    problemNumber: 49,
    slug: 'second-largest-in-list',
    title: 'Second Largest Element',
    difficulty: 'Easy',
    topic: 'Lists',
    topics: ['Lists', 'Sorting'],
    relatedDay: 14,
    relatedCurriculumTopic: 'List Operations & Set Deduplication',
    description: 'Given a list of integers, find and print the second largest distinct value. If no second distinct largest exists (all elements are equal), print `NONE`.',
    inputFormat: 'A single line of space-separated integers.',
    outputFormat: 'Print the second largest distinct integer or `NONE`.',
    constraints: '1 <= count of integers <= 10^5, -10^9 <= value <= 10^9',
    examples: [
      { input: '2 3 6 6 5', output: '5', explanation: 'Distinct values: 2, 3, 5, 6. Second largest is 5.' },
      { input: '10 10 10', output: 'NONE', explanation: 'No second distinct value.' },
      { input: '-5 -2 -1 -2', output: '-2', explanation: 'Distinct: -5, -2, -1. Second largest is -2.' },
    ],
    starterCode: 'nums = list(map(int, input().split()))\n\n# Find second largest distinct element\n',
    hints: [
      'Convert the list to a set to remove duplicates: unique = sorted(set(nums)).',
      'If len(unique) >= 2: print unique[-2], else print "NONE".'
    ],
    publicTestCases: [
      { input: '2 3 6 6 5', expectedOutput: '5' },
      { input: '10 10 10', expectedOutput: 'NONE' },
      { input: '-5 -2 -1 -2', expectedOutput: '-2' },
    ],
    hiddenTestCases: [
      { input: '42', expectedOutput: 'NONE' },
      { input: '1 2', expectedOutput: '1' },
      { input: '100 200 300 400 500', expectedOutput: '400' },
    ],
    solution: {
      approach: 'Extract distinct values via set, sort in ascending order, and return the second from last.',
      code: `nums = list(map(int, input().split()))
unique = sorted(set(nums))
if len(unique) >= 2:
    print(unique[-2])
else:
    print("NONE")`,
      timeComplexity: 'O(N log N)',
      spaceComplexity: 'O(N)',
    },
    isPublished: true,
  },
  {
    id: 'py-050',
    problemNumber: 50,
    slug: 'remove-duplicates-from-sorted-list',
    title: 'Remove Duplicates from List',
    difficulty: 'Easy',
    topic: 'Lists',
    topics: ['Lists', 'Two Pointers'],
    relatedDay: 14,
    relatedCurriculumTopic: 'List Deduplication Preserving Order',
    description: 'Given a list of integers, remove all duplicate elements while preserving the original order of first appearance. Print the deduplicated integers separated by spaces.',
    inputFormat: 'A single line of space-separated integers.',
    outputFormat: 'Print the deduplicated list.',
    constraints: '1 <= count of integers <= 10^5',
    examples: [
      { input: '1 2 2 3 4 4 1 5', output: '1 2 3 4 5', explanation: 'First occurrences preserved in order.' },
      { input: '9 8 7 8 9', output: '9 8 7', explanation: 'Duplicates removed.' },
    ],
    starterCode: 'nums = list(map(int, input().split()))\n\n# Remove duplicates while preserving order\n',
    hints: [
      'Maintain a seen set: seen = set().',
      'Iterate through nums and keep elements not yet in seen.'
    ],
    publicTestCases: [
      { input: '1 2 2 3 4 4 1 5', expectedOutput: '1 2 3 4 5' },
      { input: '9 8 7 8 9', expectedOutput: '9 8 7' },
    ],
    hiddenTestCases: [
      { input: '5 5 5 5', expectedOutput: '5' },
      { input: '1 2 3 4', expectedOutput: '1 2 3 4' },
      { input: '0 -1 0 -1 2', expectedOutput: '0 -1 2' },
    ],
    solution: {
      approach: 'Use a seen set while appending first-seen elements to result list.',
      code: `nums = list(map(int, input().split()))
seen = set()
res = []
for x in nums:
    if x not in seen:
        seen.add(x)
        res.append(str(x))
print(" ".join(res))`,
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
    },
    isPublished: true,
  },
  {
    id: 'py-051',
    problemNumber: 51,
    slug: 'rotate-array-right-by-k',
    title: 'Rotate Array by K Steps',
    difficulty: 'Medium',
    topic: 'Lists',
    topics: ['Lists', 'Array Manipulation'],
    relatedDay: 14,
    relatedCurriculumTopic: 'Array Slicing & Rotation',
    description: 'Line 1 contains the array elements separated by spaces. Line 2 contains an integer `K`. Rotate the array to the right by `K` steps and print the resulting array separated by spaces.',
    inputFormat: 'Line 1: space-separated integers\nLine 2: integer `K`',
    outputFormat: 'Print rotated array separated by spaces.',
    constraints: '1 <= len(nums) <= 10^5, 0 <= K <= 10^9',
    examples: [
      { input: '1 2 3 4 5 6 7\n3', output: '5 6 7 1 2 3 4', explanation: 'Rotated right by 3 steps.' },
      { input: '-1 -100 3 99\n2', output: '3 99 -1 -100', explanation: 'Rotated right by 2 steps.' },
    ],
    starterCode: 'nums = list(map(int, input().split()))\nk = int(input())\n\n# Rotate array right by k steps\n',
    hints: [
      'k = k % len(nums)',
      'The result is nums[-k:] + nums[:-k] (handle k == 0).'
    ],
    publicTestCases: [
      { input: '1 2 3 4 5 6 7\n3', expectedOutput: '5 6 7 1 2 3 4' },
      { input: '-1 -100 3 99\n2', expectedOutput: '3 99 -1 -100' },
    ],
    hiddenTestCases: [
      { input: '1 2\n3', expectedOutput: '2 1' },
      { input: '10 20 30\n0', expectedOutput: '10 20 30' },
      { input: '5\n100', expectedOutput: '5' },
    ],
    solution: {
      approach: 'Normalize k with modulo len(nums) and use list slicing.',
      code: `nums = list(map(int, input().split()))
k = int(input())
n = len(nums)
if n == 0 or k % n == 0:
    print(" ".join(map(str, nums)))
else:
    k = k % n
    rotated = nums[-k:] + nums[:-k]
    print(" ".join(map(str, rotated)))`,
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
    },
    isPublished: true,
  },
  {
    id: 'py-052',
    problemNumber: 52,
    slug: 'merge-two-sorted-arrays',
    title: 'Merge Two Sorted Lists',
    difficulty: 'Medium',
    topic: 'Lists',
    topics: ['Lists', 'Two Pointers'],
    relatedDay: 15,
    relatedCurriculumTopic: 'Two Pointer Technique',
    description: 'Given two sorted lists of integers on two separate lines, merge them into a single sorted list and print the result separated by spaces.',
    inputFormat: 'Line 1: space-separated sorted integers (List 1)\nLine 2: space-separated sorted integers (List 2)',
    outputFormat: 'Print merged sorted list.',
    constraints: '0 <= length of each list <= 10^5',
    examples: [
      { input: '1 3 5\n2 4 6', output: '1 2 3 4 5 6', explanation: 'Merged sorted output.' },
      { input: '1 2 8\n3 5 7 9', output: '1 2 3 5 7 8 9', explanation: 'Merged sorted.' },
    ],
    starterCode: 'l1 = list(map(int, input().split())) if input_line := input().strip() else []\n# Merge two sorted lists\n',
    hints: [
      'You can use the two-pointer technique: compare heads of both lists.',
      'Or combine and sort: sorted(l1 + l2).'
    ],
    publicTestCases: [
      { input: '1 3 5\n2 4 6', expectedOutput: '1 2 3 4 5 6' },
      { input: '1 2 8\n3 5 7 9', expectedOutput: '1 2 3 5 7 8 9' },
    ],
    hiddenTestCases: [
      { input: '10 20\n5 15 25 35', expectedOutput: '5 10 15 20 25 35' },
      { input: '1 1 1\n1 1', expectedOutput: '1 1 1 1 1' },
      { input: '-10 -5 0\n-7 -2 3', expectedOutput: '-10 -7 -5 -2 0 3' },
    ],
    solution: {
      approach: 'Two-pointer linear merge comparison.',
      code: `import sys
lines = [line.strip() for line in sys.stdin.read().splitlines() if line.strip()]
l1 = list(map(int, lines[0].split())) if len(lines) > 0 else []
l2 = list(map(int, lines[1].split())) if len(lines) > 1 else []
i, j = 0, 0
res = []
while i < len(l1) and j < len(l2):
    if l1[i] <= l2[j]:
        res.append(l1[i])
        i += 1
    else:
        res.append(l2[j])
        j += 1
res.extend(l1[i:])
res.extend(l2[j:])
print(" ".join(map(str, res)))`,
      timeComplexity: 'O(N + M)',
      spaceComplexity: 'O(N + M)',
    },
    isPublished: true,
  },
  {
    id: 'py-053',
    problemNumber: 53,
    slug: 'maximum-subarray-sum-kadanes-algorithm',
    title: 'Maximum Subarray Sum',
    difficulty: 'Hard',
    topic: 'Lists',
    topics: ['Lists', 'Dynamic Programming', 'Algorithms'],
    relatedDay: 15,
    relatedCurriculumTopic: "Kadane's Algorithm",
    description: 'Given an array of integers, find the contiguous subarray (containing at least one number) which has the largest sum and print that maximum sum.',
    inputFormat: 'A single line of space-separated integers.',
    outputFormat: 'Print the maximum subarray sum.',
    constraints: '1 <= len(nums) <= 10^5, -10^4 <= value <= 10^4',
    examples: [
      { input: '-2 1 -3 4 -1 2 1 -5 4', output: '6', explanation: 'Subarray [4, -1, 2, 1] has largest sum = 6.' },
      { input: '1', output: '1', explanation: 'Single element subarray sum is 1.' },
      { input: '5 4 -1 7 8', output: '23', explanation: 'Subarray [5, 4, -1, 7, 8] has sum = 23.' },
    ],
    starterCode: 'nums = list(map(int, input().split()))\n\n# Compute max subarray sum using Kadane\'s algorithm\n',
    hints: [
      'Use Kadane\'s algorithm: maintain max_ending_here and max_so_far.',
      'max_ending_here = max(x, max_ending_here + x).'
    ],
    publicTestCases: [
      { input: '-2 1 -3 4 -1 2 1 -5 4', expectedOutput: '6' },
      { input: '1', expectedOutput: '1' },
      { input: '5 4 -1 7 8', expectedOutput: '23' },
    ],
    hiddenTestCases: [
      { input: '-5 -2 -8 -1', expectedOutput: '-1' },
      { input: '10 -20 30 -10 50', expectedOutput: '70' },
      { input: '0 0 0', expectedOutput: '0' },
    ],
    solution: {
      approach: "Implement Kadane's algorithm in O(N) time and O(1) space.",
      code: `nums = list(map(int, input().split()))
max_so_far = nums[0]
curr_max = nums[0]
for x in nums[1:]:
    curr_max = max(x, curr_max + x)
    max_so_far = max(max_so_far, curr_max)
print(max_so_far)`,
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)',
    },
    isPublished: true,
  },
  {
    id: 'py-054',
    problemNumber: 54,
    slug: 'two-sum-target-pair-indices',
    title: 'Two Sum Target Pair',
    difficulty: 'Medium',
    topic: 'Lists',
    topics: ['Lists', 'Hash Map'],
    relatedDay: 15,
    relatedCurriculumTopic: 'Hash Map Lookup Optimization',
    description: 'Line 1 contains an array of integers. Line 2 contains a target integer `T`. Find the 1-based indices of the two distinct numbers such that they add up to `T`. Print `index1 index2` (`index1 < index2`). If no such pair exists, print `NO PAIR`.',
    inputFormat: 'Line 1: space-separated integers\nLine 2: target integer `T`',
    outputFormat: 'Print `index1 index2` (1-indexed) or `NO PAIR`.',
    constraints: '2 <= len(nums) <= 10^5, -10^9 <= nums[i], T <= 10^9',
    examples: [
      { input: '2 7 11 15\n9', output: '1 2', explanation: 'nums[0] + nums[1] = 2 + 7 = 9 (1-based indices 1 and 2).' },
      { input: '3 2 4\n6', output: '2 3', explanation: 'nums[1] + nums[2] = 2 + 4 = 6 (1-based indices 2 and 3).' },
      { input: '1 2 3\n10', output: 'NO PAIR', explanation: 'No two numbers add to 10.' },
    ],
    starterCode: 'nums = list(map(int, input().split()))\ntarget = int(input())\n\n# Find 1-based indices of two sum pair\n',
    hints: [
      'Store complement (target - num) -> 1-based index in a dictionary.',
      'Check if current number is already in the dictionary.'
    ],
    publicTestCases: [
      { input: '2 7 11 15\n9', expectedOutput: '1 2' },
      { input: '3 2 4\n6', expectedOutput: '2 3' },
      { input: '1 2 3\n10', expectedOutput: 'NO PAIR' },
    ],
    hiddenTestCases: [
      { input: '3 3\n6', expectedOutput: '1 2' },
      { input: '-1 -2 -3 -4 -5\n-8', expectedOutput: '3 5' },
      { input: '0 4 3 0\n0', expectedOutput: '1 4' },
    ],
    solution: {
      approach: 'Use a hash map to store seen values and their 1-based index.',
      code: `nums = list(map(int, input().split()))
target = int(input())
seen = {}
found = False
for idx, num in enumerate(nums, 1):
    diff = target - num
    if diff in seen:
        print(seen[diff], idx)
        found = True
        break
    seen[num] = idx
if not found:
    print("NO PAIR")`,
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
    },
    isPublished: true,
  },
  {
    id: 'py-055',
    problemNumber: 55,
    slug: 'matrix-transpose-operation',
    title: 'Matrix Transpose',
    difficulty: 'Easy',
    topic: 'Lists',
    topics: ['Lists', 'Matrices'],
    relatedDay: 16,
    relatedCurriculumTopic: 'Nested List Comprehensions & 2D Grids',
    description: 'Line 1 contains two integers `R` (rows) and `C` (columns). The next `R` lines contain `C` integers each. Compute and print the transposed matrix of dimension `C x R` (rows become columns).',
    inputFormat: 'Line 1: `R C`\nNext `R` lines: `C` integers each.',
    outputFormat: 'Print `C` lines with `R` space-separated integers each.',
    constraints: '1 <= R, C <= 100',
    examples: [
      { input: '2 3\n1 2 3\n4 5 6', output: '1 4\n2 5\n3 6', explanation: '2x3 becomes 3x2.' },
      { input: '2 2\n1 2\n3 4', output: '1 3\n2 4', explanation: '2x2 transpose.' },
    ],
    starterCode: 'r, c = map(int, input().split())\nmatrix = [list(map(int, input().split())) for _ in range(r)]\n\n# Print transposed matrix\n',
    hints: [
      'Use zip(*matrix) to transpose rows and columns in Python.'
    ],
    publicTestCases: [
      { input: '2 3\n1 2 3\n4 5 6', expectedOutput: '1 4\n2 5\n3 6' },
      { input: '2 2\n1 2\n3 4', expectedOutput: '1 3\n2 4' },
    ],
    hiddenTestCases: [
      { input: '1 1\n42', expectedOutput: '42' },
      { input: '3 1\n10\n20\n30', expectedOutput: '10 20 30' },
      { input: '1 3\n1 2 3', expectedOutput: '1\n2\n3' },
    ],
    solution: {
      approach: 'Use zip(*matrix) unpack trick.',
      code: `r, c = map(int, input().split())
matrix = [list(map(int, input().split())) for _ in range(r)]
for col in zip(*matrix):
    print(" ".join(map(str, col)))`,
      timeComplexity: 'O(R * C)',
      spaceComplexity: 'O(R * C)',
    },
    isPublished: true,
  },
  {
    id: 'py-056',
    problemNumber: 56,
    slug: 'square-matrix-diagonal-sum',
    title: 'Matrix Diagonal Sum',
    difficulty: 'Medium',
    topic: 'Lists',
    topics: ['Lists', 'Matrices'],
    relatedDay: 16,
    relatedCurriculumTopic: 'Matrix Diagonal Traversal',
    description: 'Line 1 contains an integer `N` (size of an `N x N` square matrix). The next `N` lines each contain `N` integers. Compute the sum of the elements on the primary diagonal and secondary diagonal. If `N` is odd, count the center element only once.',
    inputFormat: 'Line 1: `N`\nNext `N` lines: `N` space-separated integers each.',
    outputFormat: 'Print the diagonal sum.',
    constraints: '1 <= N <= 100',
    examples: [
      { input: '3\n1 2 3\n4 5 6\n7 8 9', output: '25', explanation: 'Primary: 1+5+9=15. Secondary: 3+5+7=15. Center 5 counted once: 15+15-5 = 25.' },
      { input: '2\n1 1\n1 1', output: '4', explanation: '1+1 + 1+1 = 4.' },
    ],
    starterCode: 'n = int(input())\nmat = [list(map(int, input().split())) for _ in range(n)]\n\n# Compute diagonal sum\n',
    hints: [
      'Primary diagonal: mat[i][i].',
      'Secondary diagonal: mat[i][n - 1 - i].',
      'If i == n - 1 - i, only add once.'
    ],
    publicTestCases: [
      { input: '3\n1 2 3\n4 5 6\n7 8 9', expectedOutput: '25' },
      { input: '2\n1 1\n1 1', expectedOutput: '4' },
    ],
    hiddenTestCases: [
      { input: '1\n5', expectedOutput: '5' },
      { input: '4\n1 0 0 1\n0 1 1 0\n0 1 1 0\n1 0 0 1', expectedOutput: '8' },
    ],
    solution: {
      approach: 'Iterate i from 0 to N-1, adding mat[i][i] and mat[i][N-1-i] without duplicate center.',
      code: `n = int(input())
mat = [list(map(int, input().split())) for _ in range(n)]
total = 0
for i in range(n):
    total += mat[i][i]
    if i != n - 1 - i:
        total += mat[i][n - 1 - i]
print(total)`,
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)',
    },
    isPublished: true,
  },
  {
    id: 'py-057',
    problemNumber: 57,
    slug: 'spiral-matrix-traversal-order',
    title: 'Spiral Matrix Traversal',
    difficulty: 'Hard',
    topic: 'Lists',
    topics: ['Lists', 'Matrices', 'Simulation'],
    relatedDay: 16,
    relatedCurriculumTopic: '2D Boundary Simulation',
    description: 'Line 1 contains two integers `R` (rows) and `C` (columns). The next `R` lines contain `C` space-separated integers each. Traverse the matrix in clockwise spiral order starting from top-left and print all elements on a single line separated by spaces.',
    inputFormat: 'Line 1: `R C`\nNext `R` lines: `C` integers each.',
    outputFormat: 'Print spiral traversal on one line.',
    constraints: '1 <= R, C <= 100',
    examples: [
      { input: '3 3\n1 2 3\n4 5 6\n7 8 9', output: '1 2 3 6 9 8 7 4 5', explanation: 'Spiral order traversal.' },
      { input: '3 4\n1 2 3 4\n5 6 7 8\n9 10 11 12', output: '1 2 3 4 8 12 11 10 9 5 6 7', explanation: 'Rectangular spiral.' },
    ],
    starterCode: 'r, c = map(int, input().split())\nmatrix = [list(map(int, input().split())) for _ in range(r)]\n\n# Print elements in spiral order\n',
    hints: [
      'Maintain 4 boundaries: top, bottom, left, right.',
      'Loop right across top, down right column, left across bottom, up left column, shrinking boundaries.'
    ],
    publicTestCases: [
      { input: '3 3\n1 2 3\n4 5 6\n7 8 9', expectedOutput: '1 2 3 6 9 8 7 4 5' },
      { input: '3 4\n1 2 3 4\n5 6 7 8\n9 10 11 12', expectedOutput: '1 2 3 4 8 12 11 10 9 5 6 7' },
    ],
    hiddenTestCases: [
      { input: '1 1\n99', expectedOutput: '99' },
      { input: '1 4\n1 2 3 4', expectedOutput: '1 2 3 4' },
      { input: '4 1\n1\n2\n3\n4', expectedOutput: '1 2 3 4' },
    ],
    solution: {
      approach: 'Adjust top, bottom, left, right pointers iteratively.',
      code: `r, c = map(int, input().split())
mat = [list(map(int, input().split())) for _ in range(r)]
top, bottom, left, right = 0, r - 1, 0, c - 1
res = []
while top <= bottom and left <= right:
    for j in range(left, right + 1):
        res.append(mat[top][j])
    top += 1
    for i in range(top, bottom + 1):
        res.append(mat[i][right])
    right -= 1
    if top <= bottom:
        for j in range(right, left - 1, -1):
            res.append(mat[bottom][j])
        bottom -= 1
    if left <= right:
        for i in range(bottom, top - 1, -1):
            res.append(mat[i][left])
        left += 1
print(" ".join(map(str, res)))`,
      timeComplexity: 'O(R * C)',
      spaceComplexity: 'O(R * C)',
    },
    isPublished: true,
  },
  {
    id: 'py-058',
    problemNumber: 58,
    slug: 'product-of-array-except-self',
    title: 'Product of Array Except Self',
    difficulty: 'Hard',
    topic: 'Lists',
    topics: ['Lists', 'Prefix Sums', 'Algorithms'],
    relatedDay: 16,
    relatedCurriculumTopic: 'Prefix and Suffix Accumulators',
    description: 'Given an array of integers `nums`, return an array `output` such that `output[i]` is equal to the product of all the elements of `nums` except `nums[i]`. Solve it in `O(N)` time complexity without using the division operator.',
    inputFormat: 'A single line of space-separated integers.',
    outputFormat: 'Print the resulting array separated by spaces.',
    constraints: '2 <= len(nums) <= 10^5, -30 <= nums[i] <= 30',
    examples: [
      { input: '1 2 3 4', output: '24 12 8 6', explanation: 'Output at index 0 is 2*3*4=24, index 1 is 1*3*4=12, etc.' },
      { input: '-1 1 0 -3 3', output: '0 0 9 0 0', explanation: 'Only index 2 (which had 0) has non-zero product.' },
    ],
    starterCode: 'nums = list(map(int, input().split()))\n\n# Compute product of array except self in O(N) without division\n',
    hints: [
      'Compute prefix products from left to right.',
      'Compute suffix products from right to left, multiplying with prefix products.'
    ],
    publicTestCases: [
      { input: '1 2 3 4', expectedOutput: '24 12 8 6' },
      { input: '-1 1 0 -3 3', expectedOutput: '0 0 9 0 0' },
    ],
    hiddenTestCases: [
      { input: '2 3', expectedOutput: '3 2' },
      { input: '0 0', expectedOutput: '0 0' },
      { input: '1 1 1 1', expectedOutput: '1 1 1 1' },
    ],
    solution: {
      approach: 'Prefix and suffix product passes in O(N) time and O(N) space.',
      code: `nums = list(map(int, input().split()))
n = len(nums)
res = [1] * n
prefix = 1
for i in range(n):
    res[i] = prefix
    prefix *= nums[i]
suffix = 1
for i in range(n - 1, -1, -1):
    res[i] *= suffix
    suffix *= nums[i]
print(" ".join(map(str, res)))`,
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
    },
    isPublished: true,
  },
  {
    id: 'py-059',
    problemNumber: 59,
    slug: 'count-zero-sum-subarrays',
    title: 'Zero Sum Subarrays Count',
    difficulty: 'Hard',
    topic: 'Lists',
    topics: ['Lists', 'Hash Map', 'Prefix Sums'],
    relatedDay: 16,
    relatedCurriculumTopic: 'Prefix Sum Hash Map Pattern',
    description: 'Given an array of integers, find the total number of non-empty contiguous subarrays whose sum of elements equals `0`.',
    inputFormat: 'A single line of space-separated integers.',
    outputFormat: 'Print the count of zero-sum subarrays.',
    constraints: '1 <= len(nums) <= 10^5, -10^4 <= value <= 10^4',
    examples: [
      { input: '1 -1 1 -1', output: '4', explanation: '[1, -1], [1, -1], [1, -1, 1, -1], [-1, 1] all sum to 0.' },
      { input: '0 0 0', output: '6', explanation: 'Every single and multi-element subarray sums to 0.' },
      { input: '1 2 3', output: '0', explanation: 'No zero sum subarray.' },
    ],
    starterCode: 'nums = list(map(int, input().split()))\n\n# Count subarrays with sum 0\n',
    hints: [
      'Maintain running prefix sum.',
      'Count occurrences of each prefix sum in a dictionary (initialize prefix_counts[0] = 1).'
    ],
    publicTestCases: [
      { input: '1 -1 1 -1', expectedOutput: '4' },
      { input: '0 0 0', expectedOutput: '6' },
      { input: '1 2 3', expectedOutput: '0' },
    ],
    hiddenTestCases: [
      { input: '6 -1 -3 4 -2 2 4 6 -12 -7', expectedOutput: '4' },
      { input: '10', expectedOutput: '0' },
      { input: '0', expectedOutput: '1' },
    ],
    solution: {
      approach: 'Use prefix sum frequency map in O(N) time.',
      code: `import collections
nums = list(map(int, input().split()))
prefix_map = collections.defaultdict(int)
prefix_map[0] = 1
curr_sum = 0
count = 0
for x in nums:
    curr_sum += x
    count += prefix_map[curr_sum]
    prefix_map[curr_sum] += 1
print(count)`,
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
    },
    isPublished: true,
  },
  {
    id: 'py-060',
    problemNumber: 60,
    slug: 'majority-element-boyer-moore-voting',
    title: 'Majority Element Finder',
    difficulty: 'Medium',
    topic: 'Lists',
    topics: ['Lists', 'Algorithms'],
    relatedDay: 16,
    relatedCurriculumTopic: "Boyer-Moore Voting Algorithm",
    description: 'Given an array of size `N`, find the majority element that appears strictly more than `N // 2` times. If no majority element exists, print `NO MAJORITY`.',
    inputFormat: 'A single line of space-separated integers.',
    outputFormat: 'Print the majority element or `NO MAJORITY`.',
    constraints: '1 <= N <= 10^5',
    examples: [
      { input: '3 2 3', output: '3', explanation: '3 appears 2 times (> 3//2).' },
      { input: '2 2 1 1 1 2 2', output: '2', explanation: '2 appears 4 times (> 7//2).' },
      { input: '1 2 3 4', output: 'NO MAJORITY', explanation: 'No element appears > 2 times.' },
    ],
    starterCode: 'nums = list(map(int, input().split()))\n\n# Find majority element\n',
    hints: [
      'Use collections.Counter or Boyer-Moore voting algorithm.',
      'Check if count > len(nums) // 2.'
    ],
    publicTestCases: [
      { input: '3 2 3', expectedOutput: '3' },
      { input: '2 2 1 1 1 2 2', expectedOutput: '2' },
      { input: '1 2 3 4', expectedOutput: 'NO MAJORITY' },
    ],
    hiddenTestCases: [
      { input: '10', expectedOutput: '10' },
      { input: '1 1 2 2', expectedOutput: 'NO MAJORITY' },
      { input: '-5 -5 -5 2 3', expectedOutput: '-5' },
    ],
    solution: {
      approach: 'Find candidate with frequency check.',
      code: `import collections
nums = list(map(int, input().split()))
counts = collections.Counter(nums)
n = len(nums)
majority = None
for val, count in counts.items():
    if count > n // 2:
        majority = val
        break
print(majority if majority is not None else "NO MAJORITY")`,
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
    },
    isPublished: true,
  },
];
