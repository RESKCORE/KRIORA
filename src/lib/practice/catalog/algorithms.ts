import type { PracticeProblem } from '../types';

export const ALGORITHMS_PROBLEMS: PracticeProblem[] = [
  {
    id: 'py-096',
    problemNumber: 96,
    slug: 'climbing-stairs-distinct-ways',
    title: 'Climbing Stairs Combinations',
    difficulty: 'Easy',
    topic: 'Algorithms',
    topics: ['Algorithms', 'Dynamic Programming'],
    relatedDay: 36,
    relatedCurriculumTopic: 'Dynamic Programming Foundations',
    description: 'You are climbing a staircase with `N` steps. Each time you can either climb `1` or `2` steps. In how many distinct ways can you climb to the top? Given `N`, print the total number of distinct ways.',
    inputFormat: 'A single positive integer `N`.',
    outputFormat: 'Print the number of distinct ways.',
    constraints: '1 <= N <= 45',
    examples: [
      { input: '2', output: '2', explanation: 'Ways: (1+1) and (2).' },
      { input: '3', output: '3', explanation: 'Ways: (1+1+1), (1+2), (2+1).' },
      { input: '4', output: '5', explanation: '5 distinct ways.' },
    ],
    starterCode: 'n = int(input())\n\n# Compute distinct ways to climb n stairs\n',
    hints: [
      'ways[i] = ways[i - 1] + ways[i - 2].',
      'This follows the Fibonacci relation with base cases ways[1] = 1, ways[2] = 2.'
    ],
    publicTestCases: [
      { input: '2', expectedOutput: '2' },
      { input: '3', expectedOutput: '3' },
      { input: '4', expectedOutput: '5' },
    ],
    hiddenTestCases: [
      { input: '1', expectedOutput: '1' },
      { input: '10', expectedOutput: '89' },
      { input: '35', expectedOutput: '14930352' },
    ],
    solution: {
      approach: 'Compute Fibonacci sequence with O(N) time and O(1) space.',
      code: `n = int(input())
if n <= 2:
    print(n)
else:
    a, b = 1, 2
    for _ in range(3, n + 1):
        a, b = b, a + b
    print(b)`,
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)',
    },
    isPublished: true,
  },
  {
    id: 'py-097',
    problemNumber: 97,
    slug: 'coin-change-minimum-coins-needed',
    title: 'Minimum Coin Change',
    difficulty: 'Medium',
    topic: 'Algorithms',
    topics: ['Algorithms', 'Dynamic Programming'],
    relatedDay: 37,
    relatedCurriculumTopic: 'Bottom-Up Dynamic Programming',
    description: 'Line 1 contains the available coin denominations separated by spaces. Line 2 contains the target amount `A`. Compute the minimum number of coins needed to make up that amount. If that amount cannot be made up by any combination of the coins, print `-1`. You may assume you have an infinite number of each coin.',
    inputFormat: 'Line 1: space-separated integers (coins)\nLine 2: target integer amount `A`',
    outputFormat: 'Print minimum coins needed or `-1`.',
    constraints: '1 <= len(coins) <= 100, 1 <= coin value <= 10^4, 0 <= A <= 10^4',
    examples: [
      { input: '1 2 5\n11', output: '3', explanation: '11 = 5 + 5 + 1 (3 coins).' },
      { input: '2\n3', output: '-1', explanation: '3 cannot be formed using 2s.' },
      { input: '1\n0', output: '0', explanation: '0 coins needed for amount 0.' },
    ],
    starterCode: 'coins = list(map(int, input().split()))\namount = int(input())\n\n# Compute minimum coins using DP\n',
    hints: [
      'Initialize dp = [float("inf")] * (amount + 1) with dp[0] = 0.',
      'For each coin and for each x from coin to amount: dp[x] = min(dp[x], dp[x - coin] + 1).'
    ],
    publicTestCases: [
      { input: '1 2 5\n11', expectedOutput: '3' },
      { input: '2\n3', expectedOutput: '-1' },
      { input: '1\n0', expectedOutput: '0' },
    ],
    hiddenTestCases: [
      { input: '2 5 10 1\n27', expectedOutput: '4' },
      { input: '186 419 83 408\n6249', expectedOutput: '20' },
    ],
    solution: {
      approach: 'Bottom-up DP table for unbounded knapsack / minimum coins problem in O(A * len(coins)).',
      code: `coins = list(map(int, input().split()))
amount = int(input())
dp = [float('inf')] * (amount + 1)
dp[0] = 0
for coin in coins:
    for x in range(coin, amount + 1):
        if dp[x - coin] + 1 < dp[x]:
            dp[x] = dp[x - coin] + 1
print(dp[amount] if dp[amount] != float('inf') else -1)`,
      timeComplexity: 'O(Amount * len(Coins))',
      spaceComplexity: 'O(Amount)',
    },
    isPublished: true,
  },
  {
    id: 'py-098',
    problemNumber: 98,
    slug: 'longest-increasing-subsequence-length',
    title: 'Longest Increasing Subsequence',
    difficulty: 'Hard',
    topic: 'Algorithms',
    topics: ['Algorithms', 'Dynamic Programming', 'Binary Search'],
    relatedDay: 38,
    relatedCurriculumTopic: 'Patience Sorting / LIS in O(N log N)',
    description: 'Given an integer array `nums`, return the length of the longest strictly increasing subsequence in `O(N log N)` time.',
    inputFormat: 'A single line of space-separated integers.',
    outputFormat: 'Print the length of the LIS.',
    constraints: '1 <= len(nums) <= 10^5, -10^4 <= nums[i] <= 10^4',
    examples: [
      { input: '10 9 2 5 3 7 101 18', output: '4', explanation: 'The longest increasing subsequence is [2, 3, 7, 101] of length 4.' },
      { input: '0 1 0 3 2 3', output: '4', explanation: 'LIS is [0, 1, 2, 3] of length 4.' },
      { input: '7 7 7 7 7', output: '1', explanation: 'Strictly increasing LIS is length 1.' },
    ],
    starterCode: 'nums = list(map(int, input().split()))\n\n# Compute LIS length in O(N log N)\n',
    hints: [
      'Maintain an active tails list with bisect_left replacement.'
    ],
    publicTestCases: [
      { input: '10 9 2 5 3 7 101 18', expectedOutput: '4' },
      { input: '0 1 0 3 2 3', expectedOutput: '4' },
      { input: '7 7 7 7 7', expectedOutput: '1' },
    ],
    hiddenTestCases: [
      { input: '1 3 6 7 9 4 10 5 6', expectedOutput: '6' },
      { input: '100', expectedOutput: '1' },
      { input: '5 4 3 2 1', expectedOutput: '1' },
    ],
    solution: {
      approach: 'Patience sorting using bisect_left in O(N log N) time.',
      code: `import bisect
nums = list(map(int, input().split()))
tails = []
for x in nums:
    idx = bisect.bisect_left(tails, x)
    if idx == len(tails):
        tails.append(x)
    else:
        tails[idx] = x
print(len(tails))`,
      timeComplexity: 'O(N log N)',
      spaceComplexity: 'O(N)',
    },
    isPublished: true,
  },
  {
    id: 'py-099',
    problemNumber: 99,
    slug: 'container-with-most-water-area',
    title: 'Container with Most Water',
    difficulty: 'Medium',
    topic: 'Algorithms',
    topics: ['Algorithms', 'Two Pointers'],
    relatedDay: 38,
    relatedCurriculumTopic: 'Greedy Two-Pointer Shrinking Window',
    description: 'You are given an integer array `height` where each element represents the vertical line at coordinate `i`. Find two lines that together with the x-axis form a container that holds the most water, and print the maximum area of water.',
    inputFormat: 'A single line of space-separated integers representing heights.',
    outputFormat: 'Print the maximum area.',
    constraints: '2 <= len(height) <= 10^5, 0 <= height[i] <= 10^4',
    examples: [
      { input: '1 8 6 2 5 4 8 3 7', output: '49', explanation: 'Max area between index 1 (height 8) and index 8 (height 7): min(8, 7) * (8 - 1) = 7 * 7 = 49.' },
      { input: '1 1', output: '1', explanation: 'min(1, 1) * 1 = 1.' },
    ],
    starterCode: 'heights = list(map(int, input().split()))\n\n# Compute max water container area using two pointers\n',
    hints: [
      'Start left = 0, right = len(heights) - 1.',
      'area = min(heights[left], heights[right]) * (right - left).',
      'Move the pointer with the smaller height inward.'
    ],
    publicTestCases: [
      { input: '1 8 6 2 5 4 8 3 7', expectedOutput: '49' },
      { input: '1 1', expectedOutput: '1' },
    ],
    hiddenTestCases: [
      { input: '4 3 2 1 4', expectedOutput: '16' },
      { input: '1 2 1', expectedOutput: '2' },
      { input: '10 1 1 1 10', expectedOutput: '40' },
    ],
    solution: {
      approach: 'Two pointers converging inward in linear O(N) time.',
      code: `heights = list(map(int, input().split()))
left, right = 0, len(heights) - 1
max_area = 0
while left < right:
    w = right - left
    h = min(heights[left], heights[right])
    area = w * h
    if area > max_area:
        max_area = area
    if heights[left] < heights[right]:
        left += 1
    else:
        right -= 1
print(max_area)`,
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)',
    },
    isPublished: true,
  },
  {
    id: 'py-100',
    problemNumber: 100,
    slug: 'trapping-rain-water-volume',
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    topic: 'Algorithms',
    topics: ['Algorithms', 'Two Pointers', 'Array'],
    relatedDay: 39,
    relatedCurriculumTopic: 'Two-Pointer Elevation Integration',
    description: 'Given `N` non-negative integers representing an elevation map where the width of each bar is `1`, compute how much water it can trap after raining.',
    inputFormat: 'A single line of space-separated non-negative integers.',
    outputFormat: 'Print total trapped rainwater units.',
    constraints: '1 <= len(heights) <= 10^5, 0 <= height[i] <= 10^5',
    examples: [
      { input: '0 1 0 2 1 0 1 3 2 1 2 1', output: '6', explanation: 'Total 6 units of rain water trapped.' },
      { input: '4 2 0 3 2 5', output: '9', explanation: 'Total 9 units trapped.' },
    ],
    starterCode: 'heights = list(map(int, input().split()))\n\n# Compute trapped rainwater\n',
    hints: [
      'Two pointers left, right with left_max, right_max.',
      'If left_max < right_max: water += left_max - height[left], left += 1. Else right counterpart.'
    ],
    publicTestCases: [
      { input: '0 1 0 2 1 0 1 3 2 1 2 1', expectedOutput: '6' },
      { input: '4 2 0 3 2 5', expectedOutput: '9' },
    ],
    hiddenTestCases: [
      { input: '3 0 2 0 4', expectedOutput: '7' },
      { input: '1 2 3 4 5', expectedOutput: '0' },
      { input: '5 4 3 2 1', expectedOutput: '0' },
    ],
    solution: {
      approach: 'Two-pointer linear sweep tracking left and right bounds.',
      code: `heights = list(map(int, input().split()))
if not heights:
    print(0)
else:
    left, right = 0, len(heights) - 1
    left_max, right_max = heights[left], heights[right]
    water = 0
    while left < right:
        if heights[left] < heights[right]:
            if heights[left] >= left_max:
                left_max = heights[left]
            else:
                water += left_max - heights[left]
            left += 1
        else:
            if heights[right] >= right_max:
                right_max = heights[right]
            else:
                water += right_max - heights[right]
            right -= 1
    print(water)`,
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)',
    },
    isPublished: true,
  },
  {
    id: 'py-101',
    problemNumber: 101,
    slug: 'minimum-window-substring-search',
    title: 'Minimum Window Substring',
    difficulty: 'Hard',
    topic: 'Algorithms',
    topics: ['Algorithms', 'Sliding Window', 'Hash Map'],
    relatedDay: 39,
    relatedCurriculumTopic: 'Sliding Window with Hash Map Tracking',
    description: 'Given two strings `S` and `T` on two separate lines, return the minimum window substring of `S` such that every character in `T` (including duplicates) is included in the window. If there is no such substring, print `NO WINDOW`.',
    inputFormat: 'Line 1: string `S`\nLine 2: string `T`',
    outputFormat: 'Print the smallest window substring or `NO WINDOW`.',
    constraints: '1 <= len(S), len(T) <= 10^5',
    examples: [
      { input: 'ADOBECODEBANC\nABC', output: 'BANC', explanation: '"BANC" is the shortest substring containing A, B, and C.' },
      { input: 'a\na', output: 'a', explanation: 'Exact match.' },
      { input: 'a\naa', output: 'NO WINDOW', explanation: 'Not enough "a"s.' },
    ],
    starterCode: 's = input().strip()\nt = input().strip()\n\n# Find minimum window substring\n',
    hints: [
      'Use the sliding window pattern with left and right pointers.',
      'Maintain counts of characters in T and current window.'
    ],
    publicTestCases: [
      { input: 'ADOBECODEBANC\nABC', expectedOutput: 'BANC' },
      { input: 'a\na', expectedOutput: 'a' },
      { input: 'a\naa', expectedOutput: 'NO WINDOW' },
    ],
    hiddenTestCases: [
      { input: 'ab\nb', expectedOutput: 'b' },
      { input: 'DONKEYS\nKEY', expectedOutput: 'KEY' },
      { input: 'AAABBBCCC\nABC', expectedOutput: 'ABBBC' },
    ],
    solution: {
      approach: 'Sliding window technique with character count requirement dictionary.',
      code: `import collections
s = input().strip()
t = input().strip()
if not s or not t:
    print("NO WINDOW")
else:
    target_counts = collections.Counter(t)
    required = len(target_counts)
    window_counts = collections.defaultdict(int)
    formed = 0
    left = 0
    ans = float("inf"), None, None

    for right in range(len(s)):
        char = s[right]
        window_counts[char] += 1
        if char in target_counts and window_counts[char] == target_counts[char]:
            formed += 1
        while left <= right and formed == required:
            c = s[left]
            if right - left + 1 < ans[0]:
                ans = (right - left + 1, left, right)
            window_counts[c] -= 1
            if c in target_counts and window_counts[c] < target_counts[c]:
                formed -= 1
            left += 1
    if ans[0] == float("inf"):
        print("NO WINDOW")
    else:
        print(s[ans[1]:ans[2] + 1])`,
      timeComplexity: 'O(len(S) + len(T))',
      spaceComplexity: 'O(len(S) + len(T))',
    },
    isPublished: true,
  },
  {
    id: 'py-102',
    problemNumber: 102,
    slug: 'jump-game-reachability-checker',
    title: 'Jump Game Reachability',
    difficulty: 'Medium',
    topic: 'Algorithms',
    topics: ['Algorithms', 'Greedy'],
    relatedDay: 40,
    relatedCurriculumTopic: 'Greedy Farthest Reach Exploration',
    description: 'You are given an integer array `nums` where each element represents your maximum jump length at that position. Starting at index 0, determine if you can reach the last index. Print `REACHABLE` or `UNREACHABLE`.',
    inputFormat: 'A single line of space-separated integers.',
    outputFormat: 'Print `REACHABLE` or `UNREACHABLE`.',
    constraints: '1 <= len(nums) <= 10^5, 0 <= nums[i] <= 10^5',
    examples: [
      { input: '2 3 1 1 4', output: 'REACHABLE', explanation: 'Jump 1 step from index 0 to 1, then 3 steps to the last index.' },
      { input: '3 2 1 0 4', output: 'UNREACHABLE', explanation: 'All paths get stuck at index 3 where jump length is 0.' },
    ],
    starterCode: 'nums = list(map(int, input().split()))\n\n# Check if last index is reachable\n',
    hints: [
      'Keep track of max_reach.',
      'For each index i: if i > max_reach return UNREACHABLE. Update max_reach = max(max_reach, i + nums[i]).'
    ],
    publicTestCases: [
      { input: '2 3 1 1 4', expectedOutput: 'REACHABLE' },
      { input: '3 2 1 0 4', expectedOutput: 'UNREACHABLE' },
    ],
    hiddenTestCases: [
      { input: '0', expectedOutput: 'REACHABLE' },
      { input: '2 0 0', expectedOutput: 'REACHABLE' },
      { input: '1 0 1 0', expectedOutput: 'UNREACHABLE' },
    ],
    solution: {
      approach: 'Greedy farthest reach tracking in O(N) time.',
      code: `nums = list(map(int, input().split()))
max_reach = 0
n = len(nums)
reachable = True
for i in range(n):
    if i > max_reach:
        reachable = False
        break
    max_reach = max(max_reach, i + nums[i])
    if max_reach >= n - 1:
        break
print("REACHABLE" if reachable else "UNREACHABLE")`,
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)',
    },
    isPublished: true,
  },
];
