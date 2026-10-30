// StudyNest Python Academy - 20 Core Practice Exercises
// Organized into 5 Levels: Basics, Conditions, Loops, Data Structures, Functions
// Each exercise includes problem statement, difficulty, example input/output, starter code, solution code, hints, and test cases.

export const PRACTICE_LEVELS = [
  { id: 1, name: 'Level 1: Basics', slug: 'basics', count: 5, difficulty: 'Beginner' },
  { id: 2, name: 'Level 2: Conditions', slug: 'conditions', count: 4, difficulty: 'Easy' },
  { id: 3, name: 'Level 3: Loops', slug: 'loops', count: 4, difficulty: 'Medium' },
  { id: 4, name: 'Level 4: Data Structures', slug: 'data-structures', count: 4, difficulty: 'Medium' },
  { id: 5, name: 'Level 5: Functions', slug: 'functions', count: 3, difficulty: 'Advanced' }
];

export const PRACTICE_EXERCISES = [
  // ==========================================
  // LEVEL 1: BASICS
  // ==========================================
  {
    id: 'ex-1',
    level: 1,
    levelName: 'Level 1: Basics',
    difficulty: 'Beginner',
    title: 'Print Hello World',
    category: 'Basics',
    statement: 'Write a Python program that prints the standard greeting "Hello, World!" to the console.',
    exampleInput: 'None (Direct execution)',
    expectedOutput: 'Hello, World!',
    defaultInput: '',
    starterCode: `# Level 1 - Exercise 1: Print Hello World
# Write your code below to display the greeting:

print("Hello, World!")
`,
    solutionCode: `print("Hello, World!")`,
    hint: 'Use the print() function with the string "Hello, World!". In Python, double quotes or single quotes can be used.',
    type: 'output',
    testCases: [
      {
        id: 'tc-1-1',
        name: 'Greeting Check',
        input: '',
        expected: 'Hello, World!',
        testFn: (stdout) => stdout.trim() === 'Hello, World!'
      }
    ]
  },
  {
    id: 'ex-2',
    level: 1,
    levelName: 'Level 1: Basics',
    difficulty: 'Beginner',
    title: 'Add Two Numbers',
    category: 'Basics',
    statement: 'Given two variables a = 15 and b = 27, calculate and print their sum.',
    exampleInput: 'a = 15, b = 27',
    expectedOutput: '42',
    defaultInput: '',
    starterCode: `# Level 1 - Exercise 2: Add Two Numbers
a = 15
b = 27

# TODO: Compute and print the sum of a and b:
`,
    solutionCode: `a = 15
b = 27
sum_result = a + b
print(sum_result)`,
    hint: 'Use the + operator: print(a + b) or store the sum in a variable first.',
    type: 'output',
    testCases: [
      {
        id: 'tc-2-1',
        name: 'Sum Evaluation (15 + 27)',
        input: '',
        expected: '42',
        testFn: (stdout) => stdout.includes('42')
      }
    ]
  },
  {
    id: 'ex-3',
    level: 1,
    levelName: 'Level 1: Basics',
    difficulty: 'Beginner',
    title: 'Calculate Average of Three Marks',
    category: 'Basics',
    statement: 'Given three subject test marks m1 = 85, m2 = 90, and m3 = 95, calculate and print their average.',
    exampleInput: 'm1 = 85, m2 = 90, m3 = 95',
    expectedOutput: '90.0',
    defaultInput: '',
    starterCode: `# Level 1 - Exercise 3: Average of Three Marks
m1 = 85
m2 = 90
m3 = 95

# TODO: Calculate and print the average:
`,
    solutionCode: `m1 = 85
m2 = 90
m3 = 95
avg = (m1 + m2 + m3) / 3
print(avg)`,
    hint: 'Wrap the addition in parentheses before dividing: (m1 + m2 + m3) / 3.',
    type: 'output',
    testCases: [
      {
        id: 'tc-3-1',
        name: 'Average Calculation Check',
        input: '',
        expected: '90.0',
        testFn: (stdout) => stdout.includes('90')
      }
    ]
  },
  {
    id: 'ex-4',
    level: 1,
    levelName: 'Level 1: Basics',
    difficulty: 'Beginner',
    title: 'Convert Celsius to Fahrenheit',
    category: 'Basics',
    statement: 'Convert temperature celsius = 37.0 to Fahrenheit using formula F = (C * 9/5) + 32 and print the result.',
    exampleInput: 'celsius = 37.0',
    expectedOutput: '98.6',
    defaultInput: '',
    starterCode: `# Level 1 - Exercise 4: Celsius to Fahrenheit
celsius = 37.0

# TODO: Convert to Fahrenheit and print:
`,
    solutionCode: `celsius = 37.0
fahrenheit = (celsius * 9 / 5) + 32
print(fahrenheit)`,
    hint: 'Formula: fahrenheit = (celsius * 9 / 5) + 32. In Python, / performs float division.',
    type: 'output',
    testCases: [
      {
        id: 'tc-4-1',
        name: 'Temperature Conversion Check',
        input: '',
        expected: '98.6',
        testFn: (stdout) => stdout.includes('98.6')
      }
    ]
  },
  {
    id: 'ex-5',
    level: 1,
    levelName: 'Level 1: Basics',
    difficulty: 'Beginner',
    title: 'Calculate Area of a Rectangle',
    category: 'Basics',
    statement: 'Given length = 12.5 and width = 8.0, calculate and print the area of the rectangle (length * width).',
    exampleInput: 'length = 12.5, width = 8.0',
    expectedOutput: '100.0',
    defaultInput: '',
    starterCode: `# Level 1 - Exercise 5: Area of a Rectangle
length = 12.5
width = 8.0

# TODO: Calculate area and print:
`,
    solutionCode: `length = 12.5
width = 8.0
area = length * width
print(area)`,
    hint: 'Multiply length by width using the * operator: area = length * width.',
    type: 'output',
    testCases: [
      {
        id: 'tc-5-1',
        name: 'Rectangle Area Check',
        input: '',
        expected: '100.0',
        testFn: (stdout) => stdout.includes('100')
      }
    ]
  },

  // ==========================================
  // LEVEL 2: CONDITIONS
  // ==========================================
  {
    id: 'ex-6',
    level: 2,
    levelName: 'Level 2: Conditions',
    difficulty: 'Easy',
    title: 'Check Even or Odd',
    category: 'Conditions',
    statement: 'Given num = 47, write an if-else statement to check if it is Even or Odd and print "Even" or "Odd".',
    exampleInput: 'num = 47',
    expectedOutput: 'Odd',
    defaultInput: '',
    starterCode: `# Level 2 - Exercise 6: Check Even or Odd
num = 47

# TODO: Write condition to check if num is Even or Odd and print result:
`,
    solutionCode: `num = 47
if num % 2 == 0:
    print("Even")
else:
    print("Odd")`,
    hint: 'Use the modulo operator %: if num % 2 == 0, the number is divisible by 2 and even.',
    type: 'output',
    testCases: [
      {
        id: 'tc-6-1',
        name: 'Even/Odd Condition Evaluation',
        input: '',
        expected: 'Odd',
        testFn: (stdout) => stdout.toLowerCase().includes('odd')
      }
    ]
  },
  {
    id: 'ex-7',
    level: 2,
    levelName: 'Level 2: Conditions',
    difficulty: 'Easy',
    title: 'Find Largest of Three Numbers',
    category: 'Conditions',
    statement: 'Given x = 42, y = 89, z = 56, use conditional statements (if/elif/else) to find and print the largest number.',
    exampleInput: 'x = 42, y = 89, z = 56',
    expectedOutput: '89',
    defaultInput: '',
    starterCode: `# Level 2 - Exercise 7: Find Largest of Three Numbers
x = 42
y = 89
z = 56

# TODO: Determine the largest of x, y, and z and print it:
`,
    solutionCode: `x = 42
y = 89
z = 56
if x >= y and x >= z:
    largest = x
elif y >= x and y >= z:
    largest = y
else:
    largest = z
print(largest)`,
    hint: 'Compare pairs using "and": if x >= y and x >= z, x is largest. Otherwise test y, or fallback to z.',
    type: 'output',
    testCases: [
      {
        id: 'tc-7-1',
        name: 'Largest Number Verification',
        input: '',
        expected: '89',
        testFn: (stdout) => stdout.includes('89')
      }
    ]
  },
  {
    id: 'ex-8',
    level: 2,
    levelName: 'Level 2: Conditions',
    difficulty: 'Easy',
    title: 'Check Pass or Fail',
    category: 'Conditions',
    statement: 'Given student score = 68 and passing mark 50, print "Pass" if score >= 50, otherwise print "Fail".',
    exampleInput: 'score = 68',
    expectedOutput: 'Pass',
    defaultInput: '',
    starterCode: `# Level 2 - Exercise 8: Check Pass or Fail
score = 68
passing_mark = 50

# TODO: Check if student passed or failed:
`,
    solutionCode: `score = 68
passing_mark = 50
if score >= passing_mark:
    print("Pass")
else:
    print("Fail")`,
    hint: 'Use if score >= passing_mark: print("Pass") else: print("Fail").',
    type: 'output',
    testCases: [
      {
        id: 'tc-8-1',
        name: 'Pass Threshold Evaluation',
        input: '',
        expected: 'Pass',
        testFn: (stdout) => stdout.toLowerCase().includes('pass')
      }
    ]
  },
  {
    id: 'ex-9',
    level: 2,
    levelName: 'Level 2: Conditions',
    difficulty: 'Easy',
    title: 'Create a Simple Calculator',
    category: 'Conditions',
    statement: 'Given num1 = 20, num2 = 5, and operator = "*", perform the arithmetic operation (+, -, *, /) using conditions and print the result.',
    exampleInput: 'num1 = 20, num2 = 5, operator = "*"',
    expectedOutput: '100',
    defaultInput: '',
    starterCode: `# Level 2 - Exercise 9: Simple Calculator
num1 = 20
num2 = 5
operator = "*"

# TODO: Check operator and print the calculated result:
`,
    solutionCode: `num1 = 20
num2 = 5
operator = "*"
if operator == "+":
    print(num1 + num2)
elif operator == "-":
    print(num1 - num2)
elif operator == "*":
    print(num1 * num2)
elif operator == "/":
    print(num1 / num2)
else:
    print("Invalid operator")`,
    hint: 'Use if operator == "+", elif operator == "*", etc. and perform the corresponding math.',
    type: 'output',
    testCases: [
      {
        id: 'tc-9-1',
        name: 'Multiplication Branch Check (20 * 5)',
        input: '',
        expected: '100',
        testFn: (stdout) => stdout.includes('100')
      }
    ]
  },

  // ==========================================
  // LEVEL 3: LOOPS
  // ==========================================
  {
    id: 'ex-10',
    level: 3,
    levelName: 'Level 3: Loops',
    difficulty: 'Medium',
    title: 'Print Numbers from 1 to 100',
    category: 'Loops',
    statement: 'Use a for loop with range(1, 101) to print all integers from 1 to 100.',
    exampleInput: 'range(1, 101)',
    expectedOutput: '1\\n2\\n...\\n100',
    defaultInput: '',
    starterCode: `# Level 3 - Exercise 10: Print 1 to 100
# TODO: Write a for loop with range(1, 101) to print each number:
`,
    solutionCode: `for i in range(1, 101):
    print(i)`,
    hint: 'range(1, 101) starts at 1 and stops just before 101.',
    type: 'output',
    testCases: [
      {
        id: 'tc-10-1',
        name: 'Loop Bounds Check',
        input: '',
        expected: '1 and 100 present',
        testFn: (stdout) => stdout.includes('1') && stdout.includes('50') && stdout.includes('100')
      }
    ]
  },
  {
    id: 'ex-11',
    level: 3,
    levelName: 'Level 3: Loops',
    difficulty: 'Medium',
    title: 'Print Multiplication Tables',
    category: 'Loops',
    statement: 'Given n = 7, write a loop to print its multiplication table from 1 to 10 in the format "7 x i = result".',
    exampleInput: 'n = 7',
    expectedOutput: '7 x 1 = 7\\n...\\n7 x 10 = 70',
    defaultInput: '',
    starterCode: `# Level 3 - Exercise 11: Multiplication Tables
n = 7

# TODO: Print multiplication table from 1 to 10:
`,
    solutionCode: `n = 7
for i in range(1, 11):
    print(f"{n} x {i} = {n * i}")`,
    hint: 'Loop with for i in range(1, 11): and use formatted strings f"{n} x {i} = {n * i}".',
    type: 'output',
    testCases: [
      {
        id: 'tc-11-1',
        name: 'Multiplication Table Final Row Check',
        input: '',
        expected: '70',
        testFn: (stdout) => stdout.includes('70')
      }
    ]
  },
  {
    id: 'ex-12',
    level: 3,
    levelName: 'Level 3: Loops',
    difficulty: 'Medium',
    title: 'Calculate Sum of Natural Numbers',
    category: 'Loops',
    statement: 'Given n = 50, calculate and print the sum of natural numbers from 1 to n (1 + 2 + ... + 50) using a loop.',
    exampleInput: 'n = 50',
    expectedOutput: '1275',
    defaultInput: '',
    starterCode: `# Level 3 - Exercise 12: Sum of Natural Numbers
n = 50

# TODO: Compute sum of 1 to n using a loop and print:
`,
    solutionCode: `n = 50
total = 0
for i in range(1, n + 1):
    total += i
print(total)`,
    hint: 'Initialize total = 0, loop for i in range(1, n + 1): total += i, then print(total).',
    type: 'output',
    testCases: [
      {
        id: 'tc-12-1',
        name: 'Sum of 1 to 50 Check',
        input: '',
        expected: '1275',
        testFn: (stdout) => stdout.includes('1275')
      }
    ]
  },
  {
    id: 'ex-13',
    level: 3,
    levelName: 'Level 3: Loops',
    difficulty: 'Medium',
    title: 'Find Factorial of a Number',
    category: 'Loops',
    statement: 'Given n = 6, compute and print its factorial (6! = 6 * 5 * 4 * 3 * 2 * 1 = 720) using a loop.',
    exampleInput: 'n = 6',
    expectedOutput: '720',
    defaultInput: '',
    starterCode: `# Level 3 - Exercise 13: Factorial of a Number
n = 6

# TODO: Compute factorial of n and print:
`,
    solutionCode: `n = 6
fact = 1
for i in range(1, n + 1):
    fact *= i
print(fact)`,
    hint: 'Initialize fact = 1, then multiply fact *= i in a loop over range(1, n + 1).',
    type: 'output',
    testCases: [
      {
        id: 'tc-13-1',
        name: 'Factorial (6!) Output Check',
        input: '',
        expected: '720',
        testFn: (stdout) => stdout.includes('720')
      }
    ]
  },

  // ==========================================
  // LEVEL 4: DATA STRUCTURES
  // ==========================================
  {
    id: 'ex-14',
    level: 4,
    levelName: 'Level 4: Data Structures',
    difficulty: 'Medium',
    title: 'Find Largest Number in a List',
    category: 'Data Structures',
    statement: 'Given numbers = [45, 12, 89, 34, 99, 23], find and print the maximum value using a loop (without calling max()).',
    exampleInput: 'numbers = [45, 12, 89, 34, 99, 23]',
    expectedOutput: '99',
    defaultInput: '',
    starterCode: `# Level 4 - Exercise 14: Largest in List
numbers = [45, 12, 89, 34, 99, 23]

# TODO: Find the largest value and print it:
`,
    solutionCode: `numbers = [45, 12, 89, 34, 99, 23]
largest = numbers[0]
for num in numbers:
    if num > largest:
        largest = num
print(largest)`,
    hint: 'Set largest = numbers[0], loop over numbers, and if num > largest update largest = num.',
    type: 'output',
    testCases: [
      {
        id: 'tc-14-1',
        name: 'List Maximum Search',
        input: '',
        expected: '99',
        testFn: (stdout) => stdout.includes('99')
      }
    ]
  },
  {
    id: 'ex-15',
    level: 4,
    levelName: 'Level 4: Data Structures',
    difficulty: 'Medium',
    title: 'Count Vowels in a String',
    category: 'Data Structures',
    statement: 'Given text = "StudyNest Engineering Platform", count and print the total number of vowels (a, e, i, o, u, case-insensitive).',
    exampleInput: 'text = "StudyNest Engineering Platform"',
    expectedOutput: '9',
    defaultInput: '',
    starterCode: `# Level 4 - Exercise 15: Count Vowels
text = "StudyNest Engineering Platform"
vowels = "aeiouAEIOU"

# TODO: Count vowels in text and print count:
`,
    solutionCode: `text = "StudyNest Engineering Platform"
vowels = "aeiouAEIOU"
count = 0
for ch in text:
    if ch in vowels:
        count += 1
print(count)`,
    hint: 'Define vowels = "aeiouAEIOU" and iterate through characters in text incrementing count when ch in vowels.',
    type: 'output',
    testCases: [
      {
        id: 'tc-15-1',
        name: 'Vowel Frequency Check',
        input: '',
        expected: '9',
        testFn: (stdout) => stdout.includes('9')
      }
    ]
  },
  {
    id: 'ex-16',
    level: 4,
    levelName: 'Level 4: Data Structures',
    difficulty: 'Medium',
    title: 'Remove Duplicates from a List',
    category: 'Data Structures',
    statement: 'Given items = [1, 2, 2, 3, 4, 4, 4, 5, 1, 6], remove duplicate values and print the sorted list of unique elements.',
    exampleInput: 'items = [1, 2, 2, 3, 4, 4, 4, 5, 1, 6]',
    expectedOutput: '[1, 2, 3, 4, 5, 6]',
    defaultInput: '',
    starterCode: `# Level 4 - Exercise 16: Remove Duplicates
items = [1, 2, 2, 3, 4, 4, 4, 5, 1, 6]

# TODO: Remove duplicates and print the sorted unique list:
`,
    solutionCode: `items = [1, 2, 2, 3, 4, 4, 4, 5, 1, 6]
unique_items = sorted(list(set(items)))
print(unique_items)`,
    hint: 'Converting a list to a set removes all duplicates: sorted(list(set(items))).',
    type: 'output',
    testCases: [
      {
        id: 'tc-16-1',
        name: 'Deduplication Result Check',
        input: '',
        expected: '[1, 2, 3, 4, 5, 6]',
        testFn: (stdout) => stdout.includes('1') && stdout.includes('6') && !stdout.includes('2, 2')
      }
    ]
  },
  {
    id: 'ex-17',
    level: 4,
    levelName: 'Level 4: Data Structures',
    difficulty: 'Medium',
    title: 'Count Word Frequency using a Dictionary',
    category: 'Data Structures',
    statement: 'Given sentence = "python is fun and python is powerful", count the frequency of each word using a dictionary and print the dictionary.',
    exampleInput: 'sentence = "python is fun and python is powerful"',
    expectedOutput: "{'python': 2, 'is': 2, 'fun': 1, 'and': 1, 'powerful': 1}",
    defaultInput: '',
    starterCode: `# Level 4 - Exercise 17: Word Frequency Dictionary
sentence = "python is fun and python is powerful"

# TODO: Split sentence into words, count frequencies in a dict, and print:
`,
    solutionCode: `sentence = "python is fun and python is powerful"
words = sentence.split()
freq = {}
for w in words:
    freq[w] = freq.get(w, 0) + 1
print(freq)`,
    hint: 'Use sentence.split() to get words. Use freq[w] = freq.get(w, 0) + 1 to increment counts.',
    type: 'output',
    testCases: [
      {
        id: 'tc-17-1',
        name: 'Word Counts in Dictionary',
        input: '',
        expected: "'python': 2 and 'is': 2",
        testFn: (stdout) => stdout.includes("'python': 2") || stdout.includes('"python": 2')
      }
    ]
  },

  // ==========================================
  // LEVEL 5: FUNCTIONS
  // ==========================================
  {
    id: 'ex-18',
    level: 5,
    levelName: 'Level 5: Functions',
    difficulty: 'Advanced',
    title: 'Function to Calculate Square',
    category: 'Functions',
    statement: 'Define a function calculate_square(n) that takes a number n and returns its square (n * n). Test it with n = 12 and print the result.',
    exampleInput: 'calculate_square(12)',
    expectedOutput: '144',
    defaultInput: '',
    starterCode: `# Level 5 - Exercise 18: Function to Calculate Square
def calculate_square(n):
    # TODO: return the square of n
    pass

# Test call:
print(calculate_square(12))
`,
    solutionCode: `def calculate_square(n):
    return n * n

print(calculate_square(12))`,
    hint: 'Use the return keyword: return n * n or return n ** 2.',
    type: 'function',
    functionName: 'calculate_square',
    testCases: [
      {
        id: 'tc-18-1',
        name: 'calculate_square(12) == 144',
        codeCall: 'calculate_square(12)',
        expected: '144',
        testFn: (res) => Number(res) === 144
      },
      {
        id: 'tc-18-2',
        name: 'calculate_square(5) == 25',
        codeCall: 'calculate_square(5)',
        expected: '25',
        testFn: (res) => Number(res) === 25
      },
      {
        id: 'tc-18-3',
        name: 'calculate_square(-4) == 16',
        codeCall: 'calculate_square(-4)',
        expected: '16',
        testFn: (res) => Number(res) === 16
      }
    ]
  },
  {
    id: 'ex-19',
    level: 5,
    levelName: 'Level 5: Functions',
    difficulty: 'Advanced',
    title: 'Function to Check Prime Numbers',
    category: 'Functions',
    statement: 'Define a function is_prime(n) that returns True if n is a prime number and False otherwise. Test it with n = 29 and print the result.',
    exampleInput: 'is_prime(29)',
    expectedOutput: 'True',
    defaultInput: '',
    starterCode: `# Level 5 - Exercise 19: Function to Check Prime
def is_prime(n):
    # TODO: return True if n is prime, False otherwise
    pass

# Test call:
print(is_prime(29))
`,
    solutionCode: `def is_prime(n):
    if n <= 1:
        return False
    for i in range(2, int(n ** 0.5) + 1):
        if n % i == 0:
            return False
    return True

print(is_prime(29))`,
    hint: 'Numbers <= 1 are not prime. Test divisors up to int(n ** 0.5) + 1. If any divide evenly, return False.',
    type: 'function',
    functionName: 'is_prime',
    testCases: [
      {
        id: 'tc-19-1',
        name: 'is_prime(29) -> True',
        codeCall: 'is_prime(29)',
        expected: 'True',
        testFn: (res) => String(res).toLowerCase() === 'true'
      },
      {
        id: 'tc-19-2',
        name: 'is_prime(15) -> False',
        codeCall: 'is_prime(15)',
        expected: 'False',
        testFn: (res) => String(res).toLowerCase() === 'false'
      },
      {
        id: 'tc-19-3',
        name: 'is_prime(2) -> True',
        codeCall: 'is_prime(2)',
        expected: 'True',
        testFn: (res) => String(res).toLowerCase() === 'true'
      }
    ]
  },
  {
    id: 'ex-20',
    level: 5,
    levelName: 'Level 5: Functions',
    difficulty: 'Advanced',
    title: 'Function to Calculate Factorial',
    category: 'Functions',
    statement: 'Define a function factorial(n) that returns the factorial of integer n (using recursion or a loop). Test with n = 5 and print the result.',
    exampleInput: 'factorial(5)',
    expectedOutput: '120',
    defaultInput: '',
    starterCode: `# Level 5 - Exercise 20: Function to Calculate Factorial
def factorial(n):
    # TODO: Return n! (factorial of n)
    pass

# Test call:
print(factorial(5))
`,
    solutionCode: `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print(factorial(5))`,
    hint: 'Recursive base case: if n <= 1: return 1. Recursive step: return n * factorial(n - 1).',
    type: 'function',
    functionName: 'factorial',
    testCases: [
      {
        id: 'tc-20-1',
        name: 'factorial(5) -> 120',
        codeCall: 'factorial(5)',
        expected: '120',
        testFn: (res) => Number(res) === 120
      },
      {
        id: 'tc-20-2',
        name: 'factorial(0) -> 1',
        codeCall: 'factorial(0)',
        expected: '1',
        testFn: (res) => Number(res) === 1
      },
      {
        id: 'tc-20-3',
        name: 'factorial(6) -> 720',
        codeCall: 'factorial(6)',
        expected: '720',
        testFn: (res) => Number(res) === 720
      }
    ]
  }
];

