import type { PracticeProblem } from '../types';

export const SEARCHING_SORTING_PROBLEMS: PracticeProblem[] = [
  {
    id: 'py-090',
    problemNumber: 90,
    slug: 'binary-search-in-sorted-array',
    title: 'Binary Search Implementation',
    difficulty: 'Easy',
    topic: 'Searching/Sorting',
    topics: ['Searching', 'Binary Search'],
    relatedDay: 31,
    relatedCurriculumTopic: 'Binary Search Algorithm (O(log N))',
    description: 'Line 1 contains a sorted array of distinct integers in ascending order. Line 2 contains a target value `T`. Implement binary search to find `T`. If found, print its 0-based index. Otherwise, print `-1`.',
    inputFormat: 'Line 1: space-separated sorted integers\nLine 2: target integer `T`',
    outputFormat: 'Print 0-based index or `-1`.',
    constraints: '1 <= len(nums) <= 10^5, -10^9 <= nums[i], T <= 10^9',
    examples: [
      { input: '-1 0 3 5 9 12\n9', output: '4', explanation: '9 is at index 4.' },
      { input: '-1 0 3 5 9 12\n2', output: '-1', explanation: '2 does not exist in array.' },
    ],
    starterCode: 'nums = list(map(int, input().split()))\ntarget = int(input())\n\n# Binary search for target\n',
    hints: [
      'Maintain low = 0 and high = len(nums) - 1.',
      'mid = (low + high) // 2. If nums[mid] == target return mid, else adjust low or high.'
    ],
    publicTestCases: [
      { input: '-1 0 3 5 9 12\n9', expectedOutput: '4' },
      { input: '-1 0 3 5 9 12\n2', expectedOutput: '-1' },
    ],
    hiddenTestCases: [
      { input: '5\n5', expectedOutput: '0' },
      { input: '10 20 30 40 50\n10', expectedOutput: '0' },
      { input: '10 20 30 40 50\n50', expectedOutput: '4' },
      { input: '1 3 5 7 9\n8', expectedOutput: '-1' },
    ],
    solution: {
      approach: 'Iterative binary search maintaining low and high bounds in O(log N) time.',
      code: `nums = list(map(int, input().split()))
target = int(input())
low, high = 0, len(nums) - 1
ans = -1
while low <= high:
    mid = (low + high) // 2
    if nums[mid] == target:
        ans = mid
        break
    elif nums[mid] < target:
        low = mid + 1
    else:
        high = mid - 1
print(ans)`,
      timeComplexity: 'O(log N)',
      spaceComplexity: 'O(1)',
    },
    isPublished: true,
  },
  {
    id: 'py-091',
    problemNumber: 91,
    slug: 'search-insert-position-in-sorted-array',
    title: 'Search Insert Position',
    difficulty: 'Easy',
    topic: 'Searching/Sorting',
    topics: ['Searching', 'Binary Search'],
    relatedDay: 31,
    relatedCurriculumTopic: 'Lower Bound & Insertion Index',
    description: 'Line 1 contains a sorted array of distinct integers. Line 2 contains a target integer `T`. Return the 0-based index if the target is found. If not, return the index where it would be if it were inserted in order.',
    inputFormat: 'Line 1: space-separated sorted integers\nLine 2: target `T`',
    outputFormat: 'Print the insert position index.',
    constraints: '1 <= len(nums) <= 10^5',
    examples: [
      { input: '1 3 5 6\n5', output: '2', explanation: '5 is at index 2.' },
      { input: '1 3 5 6\n2', output: '1', explanation: '2 would be inserted at index 1.' },
      { input: '1 3 5 6\n7', output: '4', explanation: '7 would be inserted at index 4.' },
    ],
    starterCode: 'nums = list(map(int, input().split()))\ntarget = int(input())\n\n# Find insert position\n',
    hints: [
      'Use bisect.bisect_left(nums, target).'
    ],
    publicTestCases: [
      { input: '1 3 5 6\n5', expectedOutput: '2' },
      { input: '1 3 5 6\n2', expectedOutput: '1' },
      { input: '1 3 5 6\n7', expectedOutput: '4' },
    ],
    hiddenTestCases: [
      { input: '1 3 5 6\n0', expectedOutput: '0' },
      { input: '10\n5', expectedOutput: '0' },
      { input: '10\n15', expectedOutput: '1' },
    ],
    solution: {
      approach: 'Use bisect.bisect_left for lower bound search in O(log N) time.',
      code: `import bisect
nums = list(map(int, input().split()))
target = int(input())
print(bisect.bisect_left(nums, target))`,
      timeComplexity: 'O(log N)',
      spaceComplexity: 'O(1)',
    },
    isPublished: true,
  },
  {
    id: 'py-092',
    problemNumber: 92,
    slug: 'find-first-and-last-position-in-sorted-array',
    title: 'First and Last Position of Element',
    difficulty: 'Medium',
    topic: 'Searching/Sorting',
    topics: ['Searching', 'Binary Search'],
    relatedDay: 32,
    relatedCurriculumTopic: 'Lower and Upper Bound Search',
    description: 'Line 1 contains a sorted array of integers (with possible duplicates). Line 2 contains a target integer `T`. Find the starting and ending 0-based position of the target value. Print `start end`. If target is not found, print `-1 -1`.',
    inputFormat: 'Line 1: space-separated sorted integers\nLine 2: target integer `T`',
    outputFormat: 'Print `start end`.',
    constraints: '0 <= len(nums) <= 10^5',
    examples: [
      { input: '5 7 7 8 8 10\n8', output: '3 4', explanation: '8 starts at index 3 and ends at index 4.' },
      { input: '5 7 7 8 8 10\n6', output: '-1 -1', explanation: '6 is not in the array.' },
    ],
    starterCode: 'nums = list(map(int, input().split()))\ntarget = int(input())\n\n# Find first and last position\n',
    hints: [
      'Use bisect_left for first occurrence and bisect_right - 1 for last occurrence.'
    ],
    publicTestCases: [
      { input: '5 7 7 8 8 10\n8', expectedOutput: '3 4' },
      { input: '5 7 7 8 8 10\n6', expectedOutput: '-1 -1' },
    ],
    hiddenTestCases: [
      { input: '1 1 1 1 1\n1', expectedOutput: '0 4' },
      { input: '2 2\n2', expectedOutput: '0 1' },
      { input: '1\n1', expectedOutput: '0 0' },
    ],
    solution: {
      approach: 'Find lower and upper bounds using binary search.',
      code: `import bisect
nums = list(map(int, input().split()))
target = int(input())
left = bisect.bisect_left(nums, target)
right = bisect.bisect_right(nums, target) - 1
if left <= right and left < len(nums) and nums[left] == target:
    print(left, right)
else:
    print("-1 -1")`,
      timeComplexity: 'O(log N)',
      spaceComplexity: 'O(1)',
    },
    isPublished: true,
  },
  {
    id: 'py-093',
    problemNumber: 93,
    slug: 'kth-largest-element-in-array',
    title: 'Kth Largest Element in Array',
    difficulty: 'Medium',
    topic: 'Searching/Sorting',
    topics: ['Searching', 'Sorting', 'Heap'],
    relatedDay: 32,
    relatedCurriculumTopic: 'Selection Algorithms & Min-Heaps',
    description: 'Line 1 contains an array of integers. Line 2 contains an integer `K`. Find the `K`th largest element in the array (1-indexed).',
    inputFormat: 'Line 1: space-separated integers\nLine 2: integer `K`',
    outputFormat: 'Print the `K`th largest integer.',
    constraints: '1 <= K <= len(nums) <= 10^5, -10^4 <= nums[i] <= 10^4',
    examples: [
      { input: '3 2 1 5 6 4\n2', output: '5', explanation: 'Sorted descending: 6, 5, 4, 3, 2, 1. The 2nd largest is 5.' },
      { input: '3 2 3 1 2 4 5 5 6\n4', output: '4', explanation: '4th largest is 4.' },
    ],
    starterCode: 'nums = list(map(int, input().split()))\nk = int(input())\n\n# Find kth largest element\n',
    hints: [
      'Sort in descending order and select nums[k - 1].',
      'Or use heapq.nlargest(k, nums)[-1].'
    ],
    publicTestCases: [
      { input: '3 2 1 5 6 4\n2', expectedOutput: '5' },
      { input: '3 2 3 1 2 4 5 5 6\n4', expectedOutput: '4' },
    ],
    hiddenTestCases: [
      { input: '1\n1', expectedOutput: '1' },
      { input: '10 20 30 40 50\n1', expectedOutput: '50' },
      { input: '10 20 30 40 50\n5', expectedOutput: '10' },
    ],
    solution: {
      approach: 'Sort in descending order and take index k - 1.',
      code: `nums = list(map(int, input().split()))
k = int(input())
nums.sort(reverse=True)
print(nums[k - 1])`,
      timeComplexity: 'O(N log N)',
      spaceComplexity: 'O(N)',
    },
    isPublished: true,
  },
  {
    id: 'py-094',
    problemNumber: 94,
    slug: 'merge-overlapping-intervals-list',
    title: 'Merge Overlapping Intervals',
    difficulty: 'Hard',
    topic: 'Searching/Sorting',
    topics: ['Sorting', 'Intervals'],
    relatedDay: 33,
    relatedCurriculumTopic: 'Sorting Intervals by Start Time',
    description: 'Line 1 contains an integer `N` (number of intervals). The next `N` lines each contain two space-separated integers `start end` representing an interval. Merge all overlapping intervals and print the merged intervals sorted by start time (each formatted as `start end` on a new line).',
    inputFormat: 'First line `N`. Next `N` lines: `start end`.',
    outputFormat: 'Print merged intervals.',
    constraints: '1 <= N <= 10^4',
    examples: [
      { input: '4\n1 3\n2 6\n8 10\n15 18', output: '1 6\n8 10\n15 18', explanation: '[1, 3] and [2, 6] merge into [1, 6].' },
      { input: '2\n1 4\n4 5', output: '1 5', explanation: '[1, 4] and [4, 5] touch at 4 and merge into [1, 5].' },
    ],
    starterCode: 'n = int(input())\n\n# Merge overlapping intervals\n',
    hints: [
      'Sort intervals by their start time: intervals.sort(key=lambda x: x[0]).',
      'Iterate and merge if current start <= previous end.'
    ],
    publicTestCases: [
      { input: '4\n1 3\n2 6\n8 10\n15 18', expectedOutput: '1 6\n8 10\n15 18' },
      { input: '2\n1 4\n4 5', expectedOutput: '1 5' },
    ],
    hiddenTestCases: [
      { input: '1\n1 10', expectedOutput: '1 10' },
      { input: '3\n1 5\n2 3\n4 6', expectedOutput: '1 6' },
      { input: '2\n6 8\n1 9', expectedOutput: '1 9' },
    ],
    solution: {
      approach: 'Sort intervals by start time and greedily merge overlapping spans in O(N log N) time.',
      code: `n = int(input())
intervals = []
for _ in range(n):
    s, e = map(int, input().split())
    intervals.append([s, e])
intervals.sort(key=lambda x: x[0])
merged = [intervals[0]]
for curr in intervals[1:]:
    prev = merged[-1]
    if curr[0] <= prev[1]:
        prev[1] = max(prev[1], curr[1])
    else:
        merged.append(curr)
for m in merged:
    print(f"{m[0]} {m[1]}")`,
      timeComplexity: 'O(N log N)',
      spaceComplexity: 'O(N)',
    },
    isPublished: true,
  },
  {
    id: 'py-095',
    problemNumber: 95,
    slug: 'search-in-rotated-sorted-array',
    title: 'Search in Rotated Sorted Array',
    difficulty: 'Hard',
    topic: 'Searching/Sorting',
    topics: ['Searching', 'Binary Search', 'Algorithms'],
    relatedDay: 33,
    relatedCurriculumTopic: 'Modified Binary Search on Shifted Arrays',
    description: 'An integer array sorted in ascending order with distinct values was rotated at an unknown pivot (e.g. `[0,1,2,4,5,6,7]` might become `[4,5,6,7,0,1,2]`). Line 1 contains the rotated array. Line 2 contains target `T`. Find the 0-based index of `T` in `O(log N)` runtime complexity. If not present, print `-1`.',
    inputFormat: 'Line 1: space-separated rotated integers\nLine 2: target `T`',
    outputFormat: 'Print index or `-1`.',
    constraints: '1 <= len(nums) <= 10^5, all elements distinct.',
    examples: [
      { input: '4 5 6 7 0 1 2\n0', output: '4', explanation: '0 is at index 4.' },
      { input: '4 5 6 7 0 1 2\n3', output: '-1', explanation: '3 is not in array.' },
      { input: '1\n0', output: '-1', explanation: 'Not found.' },
    ],
    starterCode: 'nums = list(map(int, input().split()))\ntarget = int(input())\n\n# Search in rotated sorted array in O(log N)\n',
    hints: [
      'At least one half (left or right) of the array is always sorted.',
      'Check if target lies in the sorted half; if so search there, otherwise search the other half.'
    ],
    publicTestCases: [
      { input: '4 5 6 7 0 1 2\n0', expectedOutput: '4' },
      { input: '4 5 6 7 0 1 2\n3', expectedOutput: '-1' },
      { input: '1\n0', expectedOutput: '-1' },
    ],
    hiddenTestCases: [
      { input: '1 3\n3', expectedOutput: '1' },
      { input: '5 1 3\n5', expectedOutput: '0' },
      { input: '4 5 6 7 8 1 2 3\n8', expectedOutput: '4' },
    ],
    solution: {
      approach: 'Identify which subarray half is sorted and branch binary search accordingly in O(log N).',
      code: `nums = list(map(int, input().split()))
target = int(input())
low, high = 0, len(nums) - 1
ans = -1
while low <= high:
    mid = (low + high) // 2
    if nums[mid] == target:
        ans = mid
        break
    if nums[low] <= nums[mid]:
        if nums[low] <= target < nums[mid]:
            high = mid - 1
        else:
            low = mid + 1
    else:
        if nums[mid] < target <= nums[high]:
            low = mid + 1
        else:
            high = mid - 1
print(ans)`,
      timeComplexity: 'O(log N)',
      spaceComplexity: 'O(1)',
    },
    isPublished: true,
  },
];
