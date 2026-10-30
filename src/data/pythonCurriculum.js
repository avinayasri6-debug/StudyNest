// Python Academy - 15 Comprehensive Beginner-to-Engineering Modules
// Every module includes: Simple explanation, Syntax, Examples, Expected output, Common mistakes, Practice questions, Short quiz, and Interactive Practice Code Challenges

export const PYTHON_MODULES = [
  {
    id: 'py-mod-1',
    number: '01',
    title: 'Introduction to Python',
    duration: '1.5 hrs',
    explanation:
      'Python is a high-level, interpreted, dynamically-typed programming language created by Guido van Rossum. It emphasizes code readability with clear, clean indentation and is the primary language used in engineering computation, scientific research, artificial intelligence, and machine learning.',
    syntax: `# Standard script structure
print("Message string")
# Comments start with a hash (#)`,
    exampleCode: `# Welcome to engineering computation
greeting = "Hello, StudyNest Engineer!"
print(greeting)

# Display Python version philosophy
print("Readability counts in engineering code.")`,
    expectedOutput: `Hello, StudyNest Engineer!
Readability counts in engineering code.`,
    commonMistakes: [
      'Using inconsistent indentation (mixing tabs and spaces produces IndentationError).',
      'Forgetting that Python identifiers are case-sensitive (Variable and variable are distinct).',
      'Missing parentheses around print arguments in Python 3.'
    ],
    practiceQuestions: [
      'Write a Python program that prints your name, branch, and current semester on three separate lines.',
      'Explain why Python is called an "interpreted" language compared to compiled languages like C or C++.'
    ],
    practiceChallenges: [
      {
        id: 'p-1-1',
        title: 'Challenge 1: Engineering Identity Card',
        difficulty: 'Beginner',
        description: 'Write a program to display an official engineering identity banner showing student name, department (CSE - AI & ML), and semester.',
        starterCode: `# Write a program to print your engineering credentials
name = "Engineering Student"
branch = "CSE - AI & ML"
semester = "Semester 1"

# TODO: Use print() to display each on a separate formatted line
print("STUDENT ID CARD")
print("Name:", name)
# Add branch and semester prints below:
`,
        expectedOutput: `STUDENT ID CARD
Name: Engineering Student
Branch: CSE - AI & ML
Semester: Semester 1`,
        hint: 'Use print("Branch:", branch) and print("Semester:", semester).',
        solutionCode: `name = "Engineering Student"
branch = "CSE - AI & ML"
semester = "Semester 1"

print("STUDENT ID CARD")
print("Name:", name)
print("Branch:", branch)
print("Semester:", semester)`
      },
      {
        id: 'p-1-2',
        title: 'Challenge 2: Vehicle Velocity Calculator',
        difficulty: 'Easy',
        description: 'Given distance = 150 km and time = 2.5 hours, compute and print the average velocity in km/h.',
        starterCode: `# Compute velocity: v = distance / time
distance_km = 150.0
time_hours = 2.5

# TODO: Compute velocity and print result
`,
        expectedOutput: `Distance: 150.0 km
Time: 2.5 hrs
Velocity: 60.0 km/h`,
        hint: 'velocity = distance_km / time_hours, then print using f-string or comma separation.',
        solutionCode: `distance_km = 150.0
time_hours = 2.5
velocity = distance_km / time_hours

print(f"Distance: {distance_km} km")
print(f"Time: {time_hours} hrs")
print(f"Velocity: {velocity} km/h")`
      }
    ],
    quiz: {
      question: 'Which of the following describes Python execution semantics correctly?',
      options: [
        'Python is strictly a compiled language generating machine code beforehand',
        'Python is interpreted line-by-line via bytecode executed on the Python Virtual Machine (PVM)',
        'Python requires manual memory deallocation using free()',
        'Python does not support dynamic typing'
      ],
      correctIndex: 1,
      explanation: 'Python code is compiled into intermediate bytecode (.pyc) and then executed line-by-line by the Python Virtual Machine (PVM).'
    }
  },
  {
    id: 'py-mod-2',
    number: '02',
    title: 'Variables and Data Types',
    duration: '2.0 hrs',
    explanation:
      'A variable is a named reference pointing to a memory location storing a value. Python is dynamically typed, meaning variable types are deduced at runtime without explicit type declarations. Fundamental scalar types include int, float, bool, and str.',
    syntax: `variable_name = value
# Python determines data type automatically
print(type(variable_name))`,
    exampleCode: `# Engineering measurements
core_temperature = 74.5       # float
core_frequency = 3200          # int (MHz)
is_cooling_active = True       # bool
processor_architecture = "ARM" # str

print("Temperature:", core_temperature, type(core_temperature))
print("Cooling Active:", is_cooling_active, type(is_cooling_active))`,
    expectedOutput: `Temperature: 74.5 <class 'float'>
Cooling Active: True <class 'bool'>`,
    commonMistakes: [
      'Naming variables with starting digits (e.g. 1st_voltage is illegal; use voltage_1).',
      'Using Python keywords as variable names (e.g. class = 10 or def = 5).',
      'Confusing equality comparison (==) with assignment (=).'
    ],
    practiceQuestions: [
      'Create variables to store the resistance (float), voltage (float), and calculate the current using Ohm’s Law (I = V / R).',
      'Verify the data type of the resulting current variable using type().'
    ],
    practiceChallenges: [
      {
        id: 'p-2-1',
        title: 'Challenge 1: Ohm’s Law Circuit Analysis',
        difficulty: 'Easy',
        description: 'Calculate the electrical current flowing through a circuit given voltage = 24.0 Volts and resistance = 8.0 Ohms (I = V / R).',
        starterCode: `# Ohm's Law: I = V / R
voltage = 24.0      # Volts (float)
resistance = 8.0    # Ohms (float)

# TODO: Compute current and print its value and data type
current = None
`,
        expectedOutput: `Voltage: 24.0 V
Resistance: 8.0 Ω
Current: 3.0 A
Current Type: <class 'float'>`,
        hint: 'current = voltage / resistance. Print type(current) to verify float.',
        solutionCode: `voltage = 24.0
resistance = 8.0
current = voltage / resistance

print(f"Voltage: {voltage} V")
print(f"Resistance: {resistance} Ω")
print(f"Current: {current} A")
print("Current Type:", type(current))`
      },
      {
        id: 'p-2-2',
        title: 'Challenge 2: Kinetic Energy Computation',
        difficulty: 'Medium',
        description: 'Calculate the kinetic energy of an electric drone of mass 2.5 kg flying at 12.0 m/s using KE = 0.5 * m * v².',
        starterCode: `# Kinetic Energy: KE = 0.5 * m * (v ** 2)
mass_kg = 2.5
velocity_mps = 12.0

# TODO: Calculate kinetic energy in Joules
`,
        expectedOutput: `Mass: 2.5 kg
Velocity: 12.0 m/s
Kinetic Energy: 180.0 Joules`,
        hint: 'Use the ** operator for exponentiation: velocity_mps ** 2.',
        solutionCode: `mass_kg = 2.5
velocity_mps = 12.0
kinetic_energy = 0.5 * mass_kg * (velocity_mps ** 2)

print(f"Mass: {mass_kg} kg")
print(f"Velocity: {velocity_mps} m/s")
print(f"Kinetic Energy: {kinetic_energy} Joules")`
      }
    ],
    quiz: {
      question: 'Which of the following is an invalid variable identifier in Python?',
      options: ['_sensor_reading', 'sensor_reading_2', '2nd_reading', 'sensorReading'],
      correctIndex: 2,
      explanation: 'Variable names in Python cannot begin with a numeric digit. They must start with an underscore or a letter.'
    }
  },
  {
    id: 'py-mod-3',
    number: '03',
    title: 'Input and Output',
    duration: '1.5 hrs',
    explanation:
      'User interaction is handled via input() for standard input and print() for formatted output. The input() function always captures input as a string (str). Formatted strings (f-strings) provide clean, readable expression evaluation.',
    syntax: `user_val = input("Enter prompt: ")
print(f"Formatted value: {user_val}")`,
    exampleCode: `# Simulated engineering console I/O
engineer_name = "Alex"
sensor_id = 42
voltage = 3.328

# Using Python f-string formatting with decimal precision
print(f"Operator: {engineer_name}")
print(f"Sensor #{sensor_id} Reading: {voltage:.2f} V")`,
    expectedOutput: `Operator: Alex
Sensor #42 Reading: 3.33 V`,
    commonMistakes: [
      'Assuming input() returns a number (it always returns a string; use int() or float() to parse).',
      'Attempting mathematical addition on string inputs ("5" + "5" = "55", not 10).'
    ],
    practiceQuestions: [
      'Write a program that takes two integer inputs from a user and prints their sum and product using an f-string.',
      'Format a floating-point number (e.g. 3.1415926) to exactly 3 decimal places.'
    ],
    practiceChallenges: [
      {
        id: 'p-3-1',
        title: 'Challenge 1: Telemetry Sensor Report with Precision Formatting',
        difficulty: 'Easy',
        description: 'Format sensor readings with specific decimal precision using Python f-strings.',
        starterCode: `sensor_name = "Thermocouple-A"
temp_celsius = 87.654321
pressure_kpa = 101.325678

# TODO: Print sensor_name, temp with 2 decimal places, and pressure with 1 decimal place
`,
        expectedOutput: `SENSOR TELEMETRY LOG
Device: Thermocouple-A
Temperature: 87.65 °C
Pressure: 101.3 kPa`,
        hint: 'Use {temp_celsius:.2f} for 2 decimals and {pressure_kpa:.1f} for 1 decimal.',
        solutionCode: `sensor_name = "Thermocouple-A"
temp_celsius = 87.654321
pressure_kpa = 101.325678

print("SENSOR TELEMETRY LOG")
print(f"Device: {sensor_name}")
print(f"Temperature: {temp_celsius:.2f} °C")
print(f"Pressure: {pressure_kpa:.1f} kPa")`
      }
    ],
    quiz: {
      question: 'What is the return type of the built-in input() function in Python 3?',
      options: ['int', 'str', 'float', 'Dependent on what the user types'],
      correctIndex: 1,
      explanation: 'input() always captures characters as a string (str). You must explicitly cast it if numerical calculations are required.'
    }
  },
  {
    id: 'py-mod-4',
    number: '04',
    title: 'Type Conversion',
    duration: '1.5 hrs',
    explanation:
      'Type conversion transforms a value from one data type to another. Implicit conversion is performed automatically by Python when no loss of precision occurs (e.g. adding int to float). Explicit type conversion (typecasting) uses functions like int(), float(), str(), and bool().',
    syntax: `target_float = float("3.14")
target_int = int(4.99)  # Truncates toward zero -> 4`,
    exampleCode: `# Explicit engineering typecasting
raw_sensor_string = "120"
mains_voltage = int(raw_sensor_string)

# Implicit conversion in arithmetic
total_reading = mains_voltage + 0.45

print("Parsed Voltage (int):", mains_voltage)
print("Total with Bias (float):", total_reading)
print("Truthiness of non-zero voltage:", bool(mains_voltage))`,
    expectedOutput: `Parsed Voltage (int): 120
Total with Bias (float): 120.45
Truthiness of non-zero voltage: True`,
    commonMistakes: [
      'Passing invalid numeric strings to int() like int("12.5") (use float("12.5") first).',
      'Expecting int() to round floating numbers (int(9.9) truncates to 9, it does not round up).'
    ],
    practiceQuestions: [
      'Convert the string "85.75" into a float, then into an integer, and observe the truncation.',
      'Test what bool(0), bool(""), bool(1), and bool("False") evaluate to in Python.'
    ],
    practiceChallenges: [
      {
        id: 'p-4-1',
        title: 'Challenge 1: Telemetry String to Numeric Cast',
        difficulty: 'Easy',
        description: 'Given raw string readings from an ADC converter, cast them to their appropriate numeric types and compute their product.',
        starterCode: `raw_count = "256"
raw_step = "0.0195"

# TODO: Convert raw_count to int, raw_step to float, and multiply to find analog voltage
`,
        expectedOutput: `Raw Count (int): 256
Step Size (float): 0.0195
Analog Output: 4.992 V`,
        hint: 'count = int(raw_count); step = float(raw_step); voltage = count * step.',
        solutionCode: `raw_count = "256"
raw_step = "0.0195"

count = int(raw_count)
step = float(raw_step)
voltage = count * step

print(f"Raw Count (int): {count}")
print(f"Step Size (float): {step}")
print(f"Analog Output: {voltage:.3f} V")`
      }
    ],
    quiz: {
      question: 'What is the value of int(7.85) in Python?',
      options: ['8', '7', '7.0', 'Raises ValueError'],
      correctIndex: 1,
      explanation: 'int() truncates floating-point numbers toward zero, discarding the fractional part, yielding 7.'
    }
  },
  {
    id: 'py-mod-5',
    number: '05',
    title: 'Operators',
    duration: '2.0 hrs',
    explanation:
      'Python supports Arithmetic (+, -, *, /, //, %, **), Comparison (==, !=, <, >, <=, >=), Logical (and, or, not), Bitwise (&, |, ^, ~, <<, >>), and Assignment operators. Floor division (//) computes integer quotient, and exponentiation (**) computes powers.',
    syntax: `# Floor division & Modulus
quotient = 17 // 5  # 3
remainder = 17 % 5  # 2
power = 2 ** 8      # 256`,
    exampleCode: `# Power calculation in electrical circuits (P = V^2 / R)
voltage = 12
resistance = 4

power = (voltage ** 2) / resistance
floor_power = (voltage ** 2) // resistance

print(f"Calculated Power: {power} W")
print(f"Floor Division Result: {floor_power}")
print("Is power > 20W and voltage == 12V?", (power > 20 and voltage == 12))`,
    expectedOutput: `Calculated Power: 36.0 W
Floor Division Result: 36
Is power > 20W and voltage == 12V? True`,
    commonMistakes: [
      'Using ^ for exponentiation (in Python, ^ is bitwise XOR, use ** for power).',
      'Confusing single slash (/) which always yields float, with floor division (//).'
    ],
    practiceQuestions: [
      'Given an angle in degrees, convert it to radians using arithmetic operators and math.pi.',
      'Check whether a given engineering tolerance test satisfies 4.9 <= voltage <= 5.1 in chained comparison.'
    ],
    practiceChallenges: [
      {
        id: 'p-5-1',
        title: 'Challenge 1: Voltage Tolerance Guard',
        difficulty: 'Easy',
        description: 'Verify if a measured 5V logic supply voltage falls within a ±5% tolerance band (4.75V to 5.25V).',
        starterCode: `measured_voltage = 5.08
nominal_voltage = 5.0
tolerance_pct = 5.0

# TODO: Compute lower and upper bounds and check if measured_voltage is within limits
`,
        expectedOutput: `Lower Bound: 4.75 V
Upper Bound: 5.25 V
Is Voltage Safe? True`,
        hint: 'lower = nominal * (1 - tolerance_pct/100); upper = nominal * (1 + tolerance_pct/100); is_safe = lower <= measured <= upper.',
        solutionCode: `measured_voltage = 5.08
nominal_voltage = 5.0
tolerance_pct = 5.0

lower = nominal_voltage * (1.0 - tolerance_pct / 100.0)
upper = nominal_voltage * (1.0 + tolerance_pct / 100.0)
is_safe = lower <= measured_voltage <= upper

print(f"Lower Bound: {lower:.2f} V")
print(f"Upper Bound: {upper:.2f} V")
print(f"Is Voltage Safe? {is_safe}")`
      }
    ],
    quiz: {
      question: 'What does the expression 19 // 4 evaluate to in Python?',
      options: ['4.75', '4', '3', '5'],
      correctIndex: 1,
      explanation: 'The floor division operator (//) divides and rounds down to the nearest integer. 19 / 4 is 4.75, which floors to 4.'
    }
  },
  {
    id: 'py-mod-6',
    number: '06',
    title: 'Conditional Statements',
    duration: '2.5 hrs',
    explanation:
      'Conditionals allow code execution paths to branch dynamically based on boolean conditions. Python utilizes if, elif (short for else if), and else blocks. Python relies on rigid indentation rather than curly braces to delineate block scope.',
    syntax: `if condition1:
    # executed if condition1 is True
elif condition2:
    # executed if condition2 is True
else:
    # fallback default`,
    exampleCode: `# Safety threshold monitoring in chemical reactor
pressure_psi = 104.5
safe_limit = 100.0

if pressure_psi > 120.0:
    status = "EMERGENCY: Venting required immediately!"
elif pressure_psi > safe_limit:
    status = "WARNING: Pressure exceeding nominal range."
else:
    status = "NOMINAL: Operating within safety specifications."

print(f"Sensor Reading: {pressure_psi} PSI")
print(f"System Action: {status}")`,
    expectedOutput: `Sensor Reading: 104.5 PSI
System Action: WARNING: Pressure exceeding nominal range.`,
    commonMistakes: [
      'Forgetting the colon (:) at the end of if/elif/else header lines.',
      'Mismatched indentation inside conditional code blocks.',
      'Using = instead of == inside boolean test expressions.'
    ],
    practiceQuestions: [
      'Write a program to classify an engineering student’s marks into grades (A: 90+, B: 80-89, C: 70-79, F: <70).',
      'Determine whether a given calendar year is a leap year using nested or compound boolean conditions.'
    ],
    practiceChallenges: [
      {
        id: 'p-6-1',
        title: 'Challenge 1: Chemical Reactor Cooling Controller',
        difficulty: 'Medium',
        description: 'Build an industrial temperature state controller that sets cooler pump duty cycle based on core temp: temp > 95°C -> 100%, temp > 80°C -> 60%, temp > 65°C -> 30%, else 0% (OFF).',
        starterCode: `temp_celsius = 84.5

# TODO: Implement if-elif-else ladder to determine pump_speed
pump_speed = "0%"
`,
        expectedOutput: `Reactor Temp: 84.5 °C
Pump Duty Cycle: 60%
Cooling Status: Moderate Cooling Active`,
        hint: 'Check highest temperature thresholds first (temp > 95, then temp > 80).',
        solutionCode: `temp_celsius = 84.5

if temp_celsius > 95.0:
    pump_speed = "100%"
    status = "Maximum Cooling Active"
elif temp_celsius > 80.0:
    pump_speed = "60%"
    status = "Moderate Cooling Active"
elif temp_celsius > 65.0:
    pump_speed = "30%"
    status = "Low Cooling Active"
else:
    pump_speed = "0%"
    status = "Pump OFF"

print(f"Reactor Temp: {temp_celsius} °C")
print(f"Pump Duty Cycle: {pump_speed}")
print(f"Cooling Status: {status}")`
      }
    ],
    quiz: {
      question: 'Which keyword is used in Python for "else if" branching?',
      options: ['else if', 'elseif', 'elif', 'elsif'],
      correctIndex: 2,
      explanation: 'Python uses the keyword "elif" for else-if branches.'
    }
  },
  {
    id: 'py-mod-7',
    number: '07',
    title: 'Loops',
    duration: '2.5 hrs',
    explanation:
      'Loops automate repetitive calculations. Python provides while loops (repeats while condition remains True) and for loops (iterates over an iterable sequence like range(), lists, or strings). break terminates the loop early, and continue skips to the next iteration.',
    syntax: `# For loop over numerical range
for i in range(start, stop, step):
    # code

# While loop
while condition:
    # code`,
    exampleCode: `# Harmonic series summation: S = 1 + 1/2 + 1/3 + ... + 1/n
n = 5
harmonic_sum = 0.0

for term in range(1, n + 1):
    harmonic_sum += 1.0 / term

print(f"Harmonic sum for n={n}: {harmonic_sum:.4f}")`,
    expectedOutput: `Harmonic sum for n=5: 2.2833`,
    commonMistakes: [
      'Forgetting that range(1, 5) stops at 4 (the stop boundary is non-inclusive).',
      'Creating infinite while loops by forgetting to increment the loop control variable.'
    ],
    practiceQuestions: [
      'Calculate the factorial of a number using a while loop.',
      'Print all prime numbers between 2 and 50 using a nested for-else loop construct.'
    ],
    practiceChallenges: [
      {
        id: 'p-7-1',
        title: 'Challenge 1: Factorial with While Loop',
        difficulty: 'Easy',
        description: 'Calculate the factorial of integer N = 6 using a while loop.',
        starterCode: `n = 6
factorial = 1
current = n

# TODO: Implement while loop to compute factorial
`,
        expectedOutput: `Factorial of 6 is 720`,
        hint: 'while current > 1: factorial *= current; current -= 1.',
        solutionCode: `n = 6
factorial = 1
current = n

while current > 1:
    factorial *= current
    current -= 1

print(f"Factorial of {n} is {factorial}")`
      },
      {
        id: 'p-7-2',
        title: 'Challenge 2: Sum of Squares of Odd Integers',
        difficulty: 'Medium',
        description: 'Iterate from 1 to 15. For every odd number, calculate its square and accumulate the total sum.',
        starterCode: `total_sum = 0

# TODO: Loop through range(1, 16) and add squares of odd numbers
`,
        expectedOutput: `Odd Squares Sum (1 to 15): 680`,
        hint: 'Use for num in range(1, 16, 2): total_sum += num ** 2.',
        solutionCode: `total_sum = 0

for num in range(1, 16, 2):
    total_sum += num ** 2

print(f"Odd Squares Sum (1 to 15): {total_sum}")`
      }
    ],
    quiz: {
      question: 'How many times will a loop with header "for i in range(1, 6):" execute?',
      options: ['6 times', '5 times', '4 times', 'Infinite times'],
      correctIndex: 1,
      explanation: 'range(1, 6) generates values 1, 2, 3, 4, 5. The loop runs exactly 5 times.'
    }
  },
  {
    id: 'py-mod-8',
    number: '08',
    title: 'Strings',
    duration: '2.0 hrs',
    explanation:
      'Strings are immutable sequences of Unicode characters. Python supports rich string operations: indexing, negative indexing, slicing ([start:stop:step]), string concatenation, and methods like .strip(), .lower(), .upper(), .split(), and .replace().',
    syntax: `sample_str = "StudyNest Engineering"
sub = sample_str[0:9]    # Slicing: 'StudyNest'
rev = sample_str[::-1]   # Reversing string`,
    exampleCode: `# Sensor serial frame decoding
data_packet = "  FRAME_START:TEMP=23.4:STATUS=OK:FRAME_END  "
clean_packet = data_packet.strip()
tokens = clean_packet.split(":")

print("Cleaned packet:", clean_packet)
print("Extracted fields:", tokens[1], "|", tokens[2])
print("Reversed code:", tokens[2][::-1])`,
    expectedOutput: `Cleaned packet: FRAME_START:TEMP=23.4:STATUS=OK:FRAME_END
Extracted fields: TEMP=23.4 | STATUS=OK
Reversed code: KO`,
    commonMistakes: [
      'Attempting item assignment on strings (e.g. s[0] = "A" raises TypeError because strings are immutable).',
      'Forgetting that string methods return a new string rather than modifying the original in-place.'
    ],
    practiceQuestions: [
      'Write a Python function to check whether a given string is a palindrome (e.g. "radar").',
      'Count the number of vowels and consonants in a technical sentence.'
    ],
    practiceChallenges: [
      {
        id: 'p-8-1',
        title: 'Challenge 1: Telemetry Data Packet Parser',
        difficulty: 'Medium',
        description: 'Parse a formatted telemetry string "DEVICE#102,VOLT=12.4,AMP=1.85" into clean values.',
        starterCode: `packet = "DEVICE#102,VOLT=12.4,AMP=1.85"

# TODO: Split the string by commas, extract device_id, voltage, and current
`,
        expectedOutput: `Parsed Device: DEVICE#102
Measured Voltage: 12.4 V
Measured Current: 1.85 A`,
        hint: 'parts = packet.split(","); voltage = parts[1].split("=")[1].',
        solutionCode: `packet = "DEVICE#102,VOLT=12.4,AMP=1.85"
parts = packet.split(",")

device = parts[0]
voltage = parts[1].split("=")[1]
current = parts[2].split("=")[1]

print(f"Parsed Device: {device}")
print(f"Measured Voltage: {voltage} V")
print(f"Measured Current: {current} A")`
      }
    ],
    quiz: {
      question: 'What is the output of "Python"[1:4] in Python?',
      options: ['"Pyt"', '"yth"', '"ytho"', '"Pyt"'],
      correctIndex: 1,
      explanation: 'Index 1 is "y", index 2 is "t", index 3 is "h", and stop index 4 is excluded, yielding "yth".'
    }
  },
  {
    id: 'py-mod-9',
    number: '09',
    title: 'Lists, Tuples, Sets and Dictionaries',
    duration: '3.0 hrs',
    explanation:
      'The four primary built-in collection types in Python: Lists (ordered, mutable), Tuples (ordered, immutable), Sets (unordered, unique elements), and Dictionaries (key-value mapping with constant-time average hash lookups).',
    syntax: `my_list = [1, 2, 3]        # Mutable list
my_tuple = (1, 2, 3)       # Immutable tuple
my_set = {1, 2, 3}         # Unique set
my_dict = {"key": "value"} # Key-value map`,
    exampleCode: `# Engineering materials database
alloy_densities = {
    "Aluminum": 2.70,
    "Titanium": 4.51,
    "Steel": 7.85
}

# Add new alloy
alloy_densities["Copper"] = 8.96

for alloy, density in alloy_densities.items():
    print(f"{alloy}: {density} g/cm³")`,
    expectedOutput: `Aluminum: 2.7 g/cm³
Titanium: 4.51 g/cm³
Steel: 7.85 g/cm³
Copper: 8.96 g/cm³`,
    commonMistakes: [
      'Using a mutable type (like a list) as a dictionary key or set element (keys must be hashable).',
      'Confusing list.append() which adds a single item, with list.extend() which unpacks an iterable.'
    ],
    practiceQuestions: [
      'Remove duplicate sensor readings from a list using set conversion while preserving unique counts.',
      'Create a dictionary mapping subject codes (e.g. MATH 101) to their respective credit weightage.'
    ],
    practiceChallenges: [
      {
        id: 'p-9-1',
        title: 'Challenge 1: Materials Density Search',
        difficulty: 'Medium',
        description: 'Find the highest density material from a dictionary of engineering metals.',
        starterCode: `densities = {
    "Magnesium": 1.74,
    "Aluminum": 2.70,
    "Cast Iron": 7.20,
    "Lead": 11.34
}

# TODO: Find the key with the maximum value in the dictionary
`,
        expectedOutput: `Densest Material: Lead
Density: 11.34 g/cm³`,
        hint: 'densest = max(densities, key=densities.get).',
        solutionCode: `densities = {
    "Magnesium": 1.74,
    "Aluminum": 2.70,
    "Cast Iron": 7.20,
    "Lead": 11.34
}

densest = max(densities, key=densities.get)
print(f"Densest Material: {densest}")
print(f"Density: {densities[densest]} g/cm³")`
      }
    ],
    quiz: {
      question: 'Which collection type is immutable in Python?',
      options: ['List', 'Dictionary', 'Set', 'Tuple'],
      correctIndex: 3,
      explanation: 'Tuples are immutable; once instantiated, their elements cannot be added, removed, or modified.'
    }
  },
  {
    id: 'py-mod-10',
    number: '10',
    title: 'Functions',
    duration: '2.5 hrs',
    explanation:
      'Functions encapsulate reusable units of computation. Defined with the def keyword, they can accept positional parameters, default arguments, *args (variable positional arguments), and **kwargs (variable keyword arguments). Functions return values using return (defaults to None).',
    syntax: `def calculate_area(radius: float) -> float:
    """Computes area of a circle."""
    import math
    return math.pi * (radius ** 2)`,
    exampleCode: `# Quadratic equation roots solver: ax^2 + bx + c = 0
def solve_quadratic(a: float, b: float, c: float):
    discriminant = (b ** 2) - (4 * a * c)
    if discriminant >= 0:
        root1 = (-b + (discriminant ** 0.5)) / (2 * a)
        root2 = (-b - (discriminant ** 0.5)) / (2 * a)
        return (root1, root2)
    else:
        return "Complex roots"

r1, r2 = solve_quadratic(1, -5, 6)
print(f"Roots of x^2 - 5x + 6: x = {r1}, x = {r2}")`,
    expectedOutput: `Roots of x^2 - 5x + 6: x = 3.0, x = 2.0`,
    commonMistakes: [
      'Using mutable default arguments (e.g. def add(x, lst=[]) causes shared state bugs; use lst=None).',
      'Forgetting the return keyword, which results in the function returning None.'
    ],
    practiceQuestions: [
      'Write a function to compute standard deviation of a sample list of sensor readings.',
      'Create a function with default arguments for calculating total resistor circuit resistance.'
    ],
    practiceChallenges: [
      {
        id: 'p-10-1',
        title: 'Challenge 1: Resistors in Parallel Calculator',
        difficulty: 'Medium',
        description: 'Define a function parallel_equivalent(r1, r2) that calculates 1 / (1/r1 + 1/r2) = (r1 * r2) / (r1 + r2).',
        starterCode: `# Define function parallel_equivalent(r1, r2)
def parallel_equivalent(r1: float, r2: float) -> float:
    # TODO: Calculate and return equivalent resistance
    pass

r_eq = parallel_equivalent(100.0, 220.0)
print(f"Equivalent Resistance: {r_eq:.2f} Ω")
`,
        expectedOutput: `Equivalent Resistance: 68.75 Ω`,
        hint: 'return (r1 * r2) / (r1 + r2).',
        solutionCode: `def parallel_equivalent(r1: float, r2: float) -> float:
    return (r1 * r2) / (r1 + r2)

r_eq = parallel_equivalent(100.0, 220.0)
print(f"Equivalent Resistance: {r_eq:.2f} Ω")`
      }
    ],
    quiz: {
      question: 'What does a Python function return if it executes without reaching a return statement?',
      options: ['0', 'False', 'None', 'Raises an exception'],
      correctIndex: 2,
      explanation: 'Functions in Python implicitly return the singleton object None if no explicit return value is provided.'
    }
  },
  {
    id: 'py-mod-11',
    number: '11',
    title: 'Modules and Libraries',
    duration: '2.0 hrs',
    explanation:
      'Modules are Python files (.py) containing functions, classes, and variables that can be imported into other scripts using import. Python includes a standard library (math, random, sys, os, json, datetime) and third-party packages for engineering.',
    syntax: `import math
from datetime import datetime
import json as js`,
    exampleCode: `# Math and statistics utilities
import math

hypotenuse = math.hypot(3.0, 4.0)
euler_constant = math.e
sin_45 = math.sin(math.radians(45))

print(f"Triangle Hypotenuse (3, 4): {hypotenuse}")
print(f"Euler's Constant (e): {euler_constant:.4f}")
print(f"sin(45°): {sin_45:.4f}")`,
    expectedOutput: `Triangle Hypotenuse (3, 4): 5.0
Euler's Constant (e): 2.7183
sin(45°): 0.7071`,
    commonMistakes: [
      'Naming a custom file math.py or random.py, which causes circular import collisions with standard modules.',
      'Overusing "from module import *" which pollutes namespace and causes silent symbol overwrites.'
    ],
    practiceQuestions: [
      'Use the math module to calculate the distance between two 3D Cartesian coordinates (x1, y1, z1) and (x2, y2, z2).',
      'Format the current timestamp using the datetime module.'
    ],
    practiceChallenges: [
      {
        id: 'p-11-1',
        title: 'Challenge 1: Euclidean 3D Distance Calculator',
        difficulty: 'Medium',
        description: 'Use Python’s math module to compute the Euclidean distance between 3D points P1(2, 3, 5) and P2(5, 7, 9).',
        starterCode: `import math

p1 = (2, 3, 5)
p2 = (5, 7, 9)

# TODO: Compute distance = sqrt((x2-x1)^2 + (y2-y1)^2 + (z2-z1)^2)
`,
        expectedOutput: `Point 1: (2, 3, 5)
Point 2: (5, 7, 9)
Euclidean Distance: 6.403`,
        hint: 'Use math.dist(p1, p2) or math.sqrt(sum((a-b)**2 for a, b in zip(p1, p2))).',
        solutionCode: `import math

p1 = (2, 3, 5)
p2 = (5, 7, 9)

distance = math.dist(p1, p2)
print(f"Point 1: {p1}")
print(f"Point 2: {p2}")
print(f"Euclidean Distance: {distance:.3f}")`
      }
    ],
    quiz: {
      question: 'Which Python standard module provides trigonometric and mathematical constants like pi and e?',
      options: ['cmath', 'calc', 'math', 'scipy'],
      correctIndex: 2,
      explanation: 'The built-in math module provides standard scalar mathematical functions and constants.'
    }
  },
  {
    id: 'py-mod-12',
    number: '12',
    title: 'Exception Handling',
    duration: '2.0 hrs',
    explanation:
      'Exceptions are runtime errors that disrupt normal control flow. Exception handling with try, except, else, and finally blocks ensures programs handle errors gracefully (e.g. division by zero, missing files, invalid type casts) without crashing.',
    syntax: `try:
    # risky operation
    result = 10 / divisor
except ZeroDivisionError as e:
    # handle error
    print("Cannot divide by zero")
finally:
    # always runs`,
    exampleCode: `# Robust sensor stream parser
def parse_sensor_reading(raw_str):
    try:
        val = float(raw_str)
        return val
    except ValueError:
        print(f"Warning: Corrupt telemetry '{raw_str}' received!")
        return 0.0
    finally:
        pass # Clean-up logic

val1 = parse_sensor_reading("48.6")
val2 = parse_sensor_reading("ERR_OFFLINE")
print("Processed Readings:", val1, "and", val2)`,
    expectedOutput: `Warning: Corrupt telemetry 'ERR_OFFLINE' received!
Processed Readings: 48.6 and 0.0`,
    commonMistakes: [
      'Using a bare "except:" statement without specifying the exception class (catches KeyboardInterrupt and hides bugs).',
      'Assuming finally only executes on success (finally ALWAYS runs, even after exceptions or return statements).'
    ],
    practiceQuestions: [
      'Write a function that safely divides two user numbers and handles both ZeroDivisionError and ValueError.',
      'Create a custom exception class NegativeMeasurementError for engineering readings.'
    ],
    practiceChallenges: [
      {
        id: 'p-12-1',
        title: 'Challenge 1: Safe Sensor Signal Normalizer',
        difficulty: 'Medium',
        description: 'Build a function safe_normalize(reading, baseline) that divides reading by baseline. Handle ZeroDivisionError by returning 0.0 and printing a warning.',
        starterCode: `def safe_normalize(reading, baseline):
    # TODO: Implement try/except block
    pass

res1 = safe_normalize(50.0, 10.0)
res2 = safe_normalize(50.0, 0.0)
print("Result 1:", res1)
print("Result 2:", res2)
`,
        expectedOutput: `Result 1: 5.0
Warning: Zero baseline encountered! Defaulting to 0.0
Result 2: 0.0`,
        hint: 'try: return reading / baseline except ZeroDivisionError: print("Warning: Zero baseline encountered! Defaulting to 0.0"); return 0.0',
        solutionCode: `def safe_normalize(reading, baseline):
    try:
        return reading / baseline
    except ZeroDivisionError:
        print("Warning: Zero baseline encountered! Defaulting to 0.0")
        return 0.0

res1 = safe_normalize(50.0, 10.0)
res2 = safe_normalize(50.0, 0.0)
print("Result 1:", res1)
print("Result 2:", res2)`
      }
    ],
    quiz: {
      question: 'Which block of code in a try-except structure is guaranteed to execute regardless of whether an error occurred?',
      options: ['try', 'except', 'else', 'finally'],
      correctIndex: 3,
      explanation: 'The "finally" block always executes before leaving the try statement, whether an exception was raised, handled, or not.'
    }
  },
  {
    id: 'py-mod-13',
    number: '13',
    title: 'File Handling',
    duration: '2.5 hrs',
    explanation:
      'File handling permits saving data persistently to disk and loading log files or datasets. Modes include read ("r"), write ("w" — truncates existing), append ("a"), and binary ("rb", "wb"). The with statement provides safe automatic closing.',
    syntax: `with open("log.txt", "w", encoding="utf-8") as f:
    f.write("Log entry\\n")`,
    exampleCode: `# Simulated engineering log generator (Conceptual demonstration)
sample_log_lines = [
    "2026-10-30 08:00:00 [INFO] System Initialized",
    "2026-10-30 08:00:05 [OK] Sensor 1 calibrated: 5.00V",
    "2026-10-30 08:00:10 [OK] Core temperature: 38.2 C"
]

print("Simulating structured telemetry log stream:")
for line in sample_log_lines:
    print(" >", line)`,
    expectedOutput: `Simulating structured telemetry log stream:
 > 2026-10-30 08:00:00 [INFO] System Initialized
 > 2026-10-30 08:00:05 [OK] Sensor 1 calibrated: 5.00V
 > 2026-10-30 08:00:10 [OK] Core temperature: 38.2 C`,
    commonMistakes: [
      'Opening a file in write mode ("w") when appending ("a") was intended, which overwrites and deletes previous data.',
      'Omitting explicit UTF-8 encoding when opening text files across different operating systems.'
    ],
    practiceQuestions: [
      'Write code to read a text file line-by-line and count the total number of lines and words.',
      'Demonstrate how to parse CSV records into Python dictionaries.'
    ],
    practiceChallenges: [
      {
        id: 'p-13-1',
        title: 'Challenge 1: Telemetry CSV Parser Logic',
        difficulty: 'Medium',
        description: 'Simulate reading a CSV log file format and compute the average sensor voltage across all entries.',
        starterCode: `csv_data = [
    "timestamp,sensor_id,voltage",
    "08:00,1,4.98",
    "08:01,1,5.02",
    "08:02,1,5.00"
]

# TODO: Parse lines, skip header, extract float voltages, and compute mean
`,
        expectedOutput: `Records processed: 3
Average Voltage: 5.000 V`,
        hint: 'Skip csv_data[0]. For line in csv_data[1:]: float(line.split(",")[2]).',
        solutionCode: `csv_data = [
    "timestamp,sensor_id,voltage",
    "08:00,1,4.98",
    "08:01,1,5.02",
    "08:02,1,5.00"
]

voltages = [float(row.split(",")[2]) for row in csv_data[1:]]
avg = sum(voltages) / len(voltages)

print(f"Records processed: {len(voltages)}")
print(f"Average Voltage: {avg:.3f} V")`
      }
    ],
    quiz: {
      question: 'Which open mode appends data to the end of a file without truncating it?',
      options: ['"w"', '"r+"', '"a"', '"x"'],
      correctIndex: 2,
      explanation: 'Mode "a" (append) positions the write pointer at the end of the file, preserving all existing contents.'
    }
  },
  {
    id: 'py-mod-14',
    number: '14',
    title: 'Object-Oriented Programming',
    duration: '3.0 hrs',
    explanation:
      'Object-Oriented Programming (OOP) models software around real-world objects combining data attributes and behavior methods. Core OOP pillars in Python: Classes & Objects, Encapsulation, Inheritance, and Polymorphism.',
    syntax: `class ClassName:
    def __init__(self, param):
        self.param = param
    
    def method(self):
        return self.param`,
    exampleCode: `# Modeling an electrical circuit component
class Resistor:
    def __init__(self, resistance_ohms: float, tolerance_pct: float = 5.0):
        self.resistance = resistance_ohms
        self.tolerance = tolerance_pct

    def max_resistance(self) -> float:
        return self.resistance * (1.0 + self.tolerance / 100.0)

    def __str__(self):
        return f"{self.resistance}Ω (±{self.tolerance}%)"

r1 = Resistor(100.0, 5.0)
print("Resistor Spec:", r1)
print(f"Max bound within tolerance: {r1.max_resistance()} Ω")`,
    expectedOutput: `Resistor Spec: 100.0Ω (±5.0%)
Max bound within tolerance: 105.0 Ω`,
    commonMistakes: [
      'Forgetting the self parameter as the first argument in class method definitions.',
      'Confusing class variables (shared across all instances) with instance variables (defined on self inside __init__).'
    ],
    practiceQuestions: [
      'Create a Sensor base class and inherit a TemperatureSensor subclass with custom unit conversion methods.',
      'Implement an ElectricMotor class with methods for start(), stop(), and set_rpm().'
    ],
    practiceChallenges: [
      {
        id: 'p-14-1',
        title: 'Challenge 1: Capacitor Energy Class Model',
        difficulty: 'Hard',
        description: 'Create a Capacitor class with attributes capacitance_farads and voltage_volts. Add a method stored_energy() that returns 0.5 * C * V².',
        starterCode: `class Capacitor:
    # TODO: Implement __init__ and stored_energy()
    pass

c = Capacitor(0.001, 12.0) # 1000 uF at 12V
print(f"Capacitance: {c.capacitance} F")
print(f"Stored Energy: {c.stored_energy():.3f} Joules")
`,
        expectedOutput: `Capacitance: 0.001 F
Stored Energy: 0.072 Joules`,
        hint: 'def stored_energy(self): return 0.5 * self.capacitance * (self.voltage ** 2)',
        solutionCode: `class Capacitor:
    def __init__(self, capacitance_farads: float, voltage_volts: float):
        self.capacitance = capacitance_farads
        self.voltage = voltage_volts

    def stored_energy(self) -> float:
        return 0.5 * self.capacitance * (self.voltage ** 2)

c = Capacitor(0.001, 12.0)
print(f"Capacitance: {c.capacitance} F")
print(f"Stored Energy: {c.stored_energy():.3f} Joules")`
      }
    ],
    quiz: {
      question: 'What is the role of the self parameter in Python class methods?',
      options: [
        'It is a special keyword that allocates memory for the object',
        'It refers to the current instance of the class',
        'It is used to import foreign modules',
        'It is an optional parameter used only for constructors'
      ],
      correctIndex: 1,
      explanation: 'self refers to the current instance of the class, allowing access to its instance variables and methods.'
    }
  },
  {
    id: 'py-mod-15',
    number: '15',
    title: 'Problem Solving and Coding Practice',
    duration: '3.5 hrs',
    explanation:
      'Applying all foundations to engineering problem solving: algorithmic complexity (Big-O notation), iterative vs recursive problem reduction, searching and sorting algorithms, and modular design patterns for CSE and AIML applications.',
    syntax: `# Standard logarithmic search pattern
def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    # algorithmic logic`,
    exampleCode: `# Binary search algorithm for sorted engineering datasets
def binary_search(arr: list[int], target: int) -> int:
    low, high = 0, len(arr) - 1
    iterations = 0
    while low <= high:
        iterations += 1
        mid = (low + high) // 2
        if arr[mid] == target:
            print(f"Found in {iterations} iteration(s)!")
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1

telemetry_timestamps = [102, 108, 115, 124, 137, 149, 162, 180]
index = binary_search(telemetry_timestamps, 137)
print(f"Target index in telemetry array: {index}")`,
    expectedOutput: `Found in 1 iteration(s)!
Target index in telemetry array: 4`,
    commonMistakes: [
      'Running binary search on an unsorted array (binary search strictly requires sorted data).',
      'Off-by-one errors in while low <= high boundary conditions.'
    ],
    practiceQuestions: [
      'Implement the Bubble Sort or Insertion Sort algorithm in Python and trace its time complexity.',
      'Write a function to find the two numbers in a list that sum to a given target number (Two-Sum).'
    ],
    practiceChallenges: [
      {
        id: 'p-15-1',
        title: 'Challenge 1: Binary Search with Step Trace',
        difficulty: 'Engineering Core',
        description: 'Complete binary search on a sorted dataset and return the 0-based index or -1 if missing.',
        starterCode: `def binary_search(arr, target):
    # TODO: Implement binary search logic
    pass

data = [10, 22, 35, 47, 59, 73, 88, 95]
target_val = 59
idx = binary_search(data, target_val)
print(f"Element {target_val} found at index: {idx}")
`,
        expectedOutput: `Element 59 found at index: 4`,
        hint: 'while low <= high: mid = (low + high)//2 ...',
        solutionCode: `def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1

data = [10, 22, 35, 47, 59, 73, 88, 95]
target_val = 59
idx = binary_search(data, target_val)
print(f"Element {target_val} found at index: {idx}")`
      }
    ],
    quiz: {
      question: 'What is the average time complexity of Binary Search on a sorted array of size n?',
      options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
      correctIndex: 2,
      explanation: 'Binary search halves the search space each step, achieving logarithmic O(log n) efficiency.'
    }
  }
];
