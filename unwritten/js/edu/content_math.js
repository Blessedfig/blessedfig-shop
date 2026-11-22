"use strict";
// =====================================================================
//  MATH: Wisconsin Standards for Mathematics (2021; built on the Common Core). Problems come from the makers in gen.js,
//  so every test is new. Standard codes: grade.domain.cluster, e.g. 3.OA = grade 3, Operations and Algebraic Thinking.
// =====================================================================
const MATH_SRC = ['Wisconsin Standards for Mathematics (DPI, 2021): dpi.wi.gov/math/standards'];
// ---------- K-2 ----------
eduNode('m_count', { n: 'Counting and comparing', s: 'COUNT', lane: 'math', band: 'K2', g: 'K', std: 'K.CC', gen: 'count_k', src: MATH_SRC,
  L: [{ t: 'words', w: [['count on', 'start at a number and keep going: 47, 48, 49…'], ['greater', 'more; the bigger number'], ['tens', 'groups of ten things']] },
    { t: 'idea', h: 'Counting goes up by one', p: ['Every number has a number right after it that is **one more**. After 47 comes 48.', 'On a number line, one more is one step to the right.'], fig: ['numline', 44, 50, 1, { 48: 'one more' }] },
    { t: 'idea', h: 'Compare the tens first', p: ['To see which number is **greater**, look at the tens: the left digit. 52 has 5 tens; 25 has only 2. So 52 is greater.', 'If the tens match, compare the ones.'], fig: ['blocks', 0, 5, 2] },
    { t: 'idea', h: 'Counting by tens', p: ['10, 20, 30, 40… Each step adds a group of ten. It is a fast way to count a big pile: make groups of ten, then count the groups.'] }] });
eduNode('m_add20', { n: 'Adding and subtracting to 20', s: '+−20', lane: 'math', band: 'K2', g: '1', req: ['m_count'], std: '1.OA.6', gen: 'addsub20', src: MATH_SRC,
  L: [{ t: 'words', w: [['sum', 'the answer to an addition'], ['difference', 'the answer to a subtraction'], ['make a ten', 'split a number so one part fills a ten']] },
    { t: 'idea', h: 'Make a ten', p: ['8 + 5 is easier as **10 + 3**. 8 needs 2 more to make 10, so take 2 from the 5. What is left is 3: 10 + 3 = 13.'], fig: ['numline', 0, 14, 1, { 8: 'start', 10: '', 13: '' }] },
    { t: 'idea', h: 'Subtraction is the other side of addition', p: ['To solve 14 − 6, ask: **6 + what = 14?** 6 + 8 = 14, so 14 − 6 = 8.', 'Every addition fact gives you two subtraction facts for free.'] }] });
eduNode('m_place', { n: 'Place value', s: 'PLACE', lane: 'math', band: 'K2', g: '1-2', req: ['m_count'], std: '2.NBT.1', gen: 'place', src: MATH_SRC,
  L: [{ t: 'words', w: [['digit', 'one of the symbols 0-9'], ['place', 'where a digit sits: ones, tens, hundreds'], ['value', 'what a digit is worth in its place']] },
    { t: 'idea', h: 'Where a digit sits decides what it is worth', p: ['In **347**, the 3 is in the hundreds place, so it is worth **300**. The 4 is worth **40**. The 7 is worth **7**.', '347 = 300 + 40 + 7.'], fig: ['blocks', 3, 4, 7] },
    { t: 'idea', h: 'Ten makes the next place', p: ['Ten ones make one ten. Ten tens make one hundred. That is why we only need ten digits to write any number.'] }] });
eduNode('m_add1000', { n: 'Adding and subtracting to 1,000', s: '+−1K', lane: 'math', band: 'K2', g: '2-3', req: ['m_add20', 'm_place'], std: '3.NBT.2', gen: 'addsub1000', src: MATH_SRC,
  L: [{ t: 'words', w: [['regroup', 'trade ten of one place for one of the next: 10 ones = 1 ten'], ['carry', 'regrouping when adding'], ['borrow', 'regrouping when subtracting']] },
    { t: 'idea', h: 'One place at a time', p: ['Line the numbers up by place. Start with the **ones**, then tens, then hundreds.', 'If a place adds up to 10 or more, **carry** the ten to the next place.'] },
    { t: 'ex', q: '465 + 278', steps: ['Ones: 5 + 8 = 13. Write 3, carry 1 ten.', 'Tens: 6 + 7 + 1 = 14. Write 4, carry 1 hundred.', 'Hundreds: 4 + 2 + 1 = 7.'], a: '743' },
    { t: 'idea', h: 'Check by working backward', p: ['If 743 − 278 = 465, the addition was right. Adding checks subtraction and subtraction checks adding.'] }] });
eduNode('m_coins', { n: 'Counting money', s: 'COINS', lane: 'math', band: 'K2', g: '2', req: ['m_add20'], std: '2.MD.8', gen: 'coins', src: MATH_SRC,
  L: [{ t: 'words', w: [['penny', '1 cent (1¢)'], ['nickel', '5 cents'], ['dime', '10 cents'], ['quarter', '25 cents'], ['dollar', '100 cents']] },
    { t: 'idea', h: 'Biggest coins first', p: ['Sort the coins. Count the **quarters** first by 25s, then dimes by 10s, nickels by 5s and pennies by 1s.', 'Two quarters, a dime and three pennies: 25, 50, 60, 61, 62, 63. That is 63¢.'], fig: ['coins', ['q', 'q', 'd', 'p', 'p', 'p']] },
    { t: 'real', p: 'At the Fig Tree counter, change is counted back the same way: start at the price and count up to what you paid.' }] });
eduNode('m_clock', { n: 'Telling time', s: 'CLOCK', lane: 'math', band: 'K2', g: '1-2', req: ['m_count'], std: '2.MD.7', gen: 'clock', src: MATH_SRC,
  L: [{ t: 'idea', h: 'Two hands', p: ['The **short hand** points to the hour. The **long hand** points to the minutes.', 'The long hand goes around once every hour. Each number it passes is **5 minutes**.'], fig: ['clock', 3, 30] },
    { t: 'idea', h: 'Count by fives', p: ['If the long hand is on the 4, count 5, 10, 15, 20: it is 20 minutes past the hour.', 'At half past, the short hand sits halfway between two numbers.'] }] });
// ---------- 3-5 ----------
eduNode('m_mult', { n: 'Multiplication', s: 'TIMES', lane: 'math', band: '35', g: '3', req: ['m_add1000'], std: '3.OA.7', gen: 'multfacts', src: MATH_SRC,
  L: [{ t: 'words', w: [['factor', 'a number being multiplied'], ['product', 'the answer to a multiplication'], ['array', 'rows and columns of things']] },
    { t: 'idea', h: 'Equal groups', p: ['**4 × 6** means 4 groups of 6. You can add 6 + 6 + 6 + 6 = 24, or skip count: 6, 12, 18, 24.'], fig: ['rect', 6, 4, ''] },
    { t: 'idea', h: 'Break a hard fact into easy ones', p: ['7 × 8 = (7 × 5) + (7 × 3) = 35 + 21 = **56**.', 'Order does not matter: 7 × 8 = 8 × 7.'] }] });
eduNode('m_div', { n: 'Division', s: 'DIVIDE', lane: 'math', band: '35', g: '3', req: ['m_mult'], std: '3.OA.6', gen: 'divfacts', src: MATH_SRC,
  L: [{ t: 'idea', h: 'Sharing equally', p: ['**24 ÷ 6** asks: if 24 things are shared into 6 equal groups, how many in each? Or: how many 6s fit in 24?', 'Think of the multiplication: 6 × **4** = 24, so 24 ÷ 6 = 4.'] },
    { t: 'idea', h: 'Fact families', p: ['3, 7 and 21 go together: 3 × 7 = 21, 7 × 3 = 21, 21 ÷ 3 = 7, 21 ÷ 7 = 3.'] }] });
eduNode('m_frac', { n: 'Fractions', s: 'FRAC', lane: 'math', band: '35', g: '3', req: ['m_div'], std: '3.NF.3', gen: 'frac1', src: MATH_SRC,
  L: [{ t: 'words', w: [['numerator', 'the top number: how many pieces you have'], ['denominator', 'the bottom number: how many equal pieces make a whole']] },
    { t: 'idea', h: 'Equal pieces', p: ['**3/4** means a whole cut into 4 equal pieces, and you have 3 of them.'], fig: ['fracbars', [[3, 4]]] },
    { t: 'idea', h: 'More pieces, smaller pieces', p: ['1/2 is bigger than 1/8. Cut a pie into 8 and every slice is smaller than if you cut it into 2.', 'With the same bottom number, more pieces is more: 5/8 > 3/8.'], fig: ['fracbars', [[1, 2], [1, 8]]] }] });
eduNode('m_area', { n: 'Area and perimeter', s: 'AREA', lane: 'math', band: '35', g: '3-4', req: ['m_mult'], std: '3.MD.7, 3.MD.8', gen: 'area', src: MATH_SRC,
  L: [{ t: 'words', w: [['area', 'how many squares cover a shape (square feet, square meters)'], ['perimeter', 'the distance around a shape (feet, meters)']] },
    { t: 'idea', h: 'Area: rows times columns', p: ['A rectangle 6 feet by 4 feet is covered by **24 square feet**: 4 rows of 6.'], fig: ['rect', 6, 4, 'ft'] },
    { t: 'idea', h: 'Perimeter: walk the edge', p: ['Add all four sides: 6 + 4 + 6 + 4 = **20 feet**. A fence goes around the perimeter; carpet covers the area.'] }] });
eduNode('m_multi', { n: 'Multi-digit multiplication', s: '×××', lane: 'math', band: '35', g: '4-5', req: ['m_mult', 'm_place'], std: '4.NBT.5, 5.NBT.5', gen: 'multidig', src: MATH_SRC,
  L: [{ t: 'idea', h: 'Split by place value', p: ['**34 × 26**: split 34 into 30 and 4.', '30 × 26 = 780 and 4 × 26 = 104. Add the parts: **884**.'] },
    { t: 'ex', q: '47 × 23', steps: ['40 × 23 = 920', '7 × 23 = 161', '920 + 161 = 1,081'], a: '1,081' }] });
eduNode('m_longdiv', { n: 'Long division', s: 'LONG÷', lane: 'math', band: '35', g: '4-5', req: ['m_div', 'm_multi'], std: '4.NBT.6', gen: 'longdiv', src: MATH_SRC,
  L: [{ t: 'idea', h: 'Divide, multiply, subtract, bring down', p: ['Long division repeats four moves, one place at a time, from the left.', 'What does not divide evenly is the **remainder** (R).'] },
    { t: 'ex', q: '157 ÷ 6', steps: ['15 ÷ 6 = 2 (6 × 2 = 12). 15 − 12 = 3.', 'Bring down the 7: 37.', '37 ÷ 6 = 6 (6 × 6 = 36). 37 − 36 = 1.'], a: '26 R1' }] });
eduNode('m_fracops', { n: 'Adding and multiplying fractions', s: 'FR+×', lane: 'math', band: '35', g: '4-5', req: ['m_frac', 'm_longdiv'], std: '5.NF.1, 5.NF.4', gen: 'fracops', src: MATH_SRC,
  L: [{ t: 'idea', h: 'Same-size pieces before you add', p: ['1/2 + 1/3: halves and thirds are different sizes. Cut both into **sixths**: 3/6 + 2/6 = **5/6**.', 'The common denominator is a number both bottoms divide into.'], fig: ['fracbars', [[3, 6, '1/2 = 3/6'], [2, 6, '1/3 = 2/6'], [5, 6, 'sum 5/6']]] },
    { t: 'idea', h: 'Multiplying is easier', p: ['Multiply tops, multiply bottoms: 2/3 × 3/4 = 6/12 = **1/2**. "Of" means times: half of a third is 1/2 × 1/3 = 1/6.'] }] });
eduNode('m_dec', { n: 'Decimals', s: 'DECIM', lane: 'math', band: '35', g: '4-5', req: ['m_frac'], std: '5.NBT.3, 5.NBT.7', gen: 'decimals', src: MATH_SRC,
  L: [{ t: 'words', w: [['tenths', 'the first place after the point: 0.1 = 1/10'], ['hundredths', 'the second place: 0.01 = 1/100']] },
    { t: 'idea', h: 'Decimals are fractions of ten', p: ['0.7 is 7 tenths. 0.25 is 25 hundredths, a quarter. Money works this way: $0.25.', 'To compare 0.7 and 0.65, write 0.70: 70 hundredths beats 65.'] },
    { t: 'idea', h: 'Line up the points', p: ['To add or subtract decimals, line up the decimal points so tenths sit over tenths.'] }] });
eduNode('m_vol', { n: 'Volume', s: 'VOLUM', lane: 'math', band: '35', g: '5', req: ['m_area'], std: '5.MD.5', gen: 'volume', src: MATH_SRC,
  L: [{ t: 'idea', h: 'Layers of cubes', p: ['Volume is how many unit cubes fill a box. A layer is length × width cubes; stack height layers.', '**V = length × width × height**.'], fig: ['box3', 5, 3, 4] }] });
eduNode('m_coord', { n: 'The coordinate plane', s: 'GRID', lane: 'math', band: '35', g: '5', req: ['m_dec'], std: '5.G.1', gen: 'coordpts', src: MATH_SRC,
  L: [{ t: 'idea', h: 'Across, then up', p: ['A point is named by two numbers (x, y). **x** is how far across; **y** is how far up. (3, 5) is 3 across, 5 up.', 'Order matters: (5, 3) is a different point.'], fig: ['coord', [[3, 5, '(3, 5)'], [5, 3, '(5, 3)']], 8] }] });
eduNode('m_elapsed', { n: 'Elapsed time', s: 'TIME+', lane: 'math', band: '35', g: '3', req: ['m_clock'], std: '3.MD.1', gen: 'elapsed', src: MATH_SRC,
  L: [{ t: 'idea', h: 'Add hours, then minutes', p: ['Leave at 10:45 for 1 hour 30 minutes: 10:45 + 1 hour = 11:45, + 30 minutes = **12:15 PM**.', 'Crossing 12 changes AM to PM.'] }] });
// ---------- 6-8 ----------
eduNode('m_ratio', { n: 'Ratios, rates and percents', s: 'RATIO', lane: 'math', band: '68', g: '6-7', req: ['m_fracops', 'm_dec'], std: '6.RP.3', gen: 'ratio', src: MATH_SRC,
  L: [{ t: 'words', w: [['ratio', 'a comparison of two amounts: 3 to 2'], ['unit rate', 'how much for one: $3 per notebook'], ['percent', 'out of 100: 40% = 40/100']] },
    { t: 'idea', h: 'Per one', p: ['If 5 pounds of potatoes cost $4, one pound costs $4 ÷ 5 = **$0.80**. Unit rates make prices comparable.'] },
    { t: 'idea', h: 'Percent of a number', p: ['25% of 80 = 25/100 × 80 = **20**. Ten percent is easy: move the decimal one place (10% of 80 is 8).'] }] });
eduNode('m_int', { n: 'Negative numbers', s: '±INT', lane: 'math', band: '68', g: '6-7', req: ['m_coord'], std: '7.NS.1, 7.NS.2', gen: 'integers', src: MATH_SRC,
  L: [{ t: 'idea', h: 'Below zero', p: ['A January morning in Antigo can be **−15°F**. Numbers less than zero sit left of zero on the number line.'], fig: ['numline', -20, 20, 5, { '-15': '−15°F' }] },
    { t: 'idea', h: 'The sign rules', p: ['Adding a negative moves left. Subtracting a negative is adding: 3 − (−4) = 7.', 'Multiply or divide: same signs → positive; different signs → negative.'] }] });
eduNode('m_expr', { n: 'Expressions and one-step equations', s: 'EXPR', lane: 'math', band: '68', g: '6', req: ['m_int'], std: '6.EE.2, 6.EE.7', gen: 'expr', src: MATH_SRC,
  L: [{ t: 'words', w: [['variable', 'a letter standing for a number'], ['expression', 'numbers and letters with operations: 3x + 2'], ['equation', 'two expressions set equal: x + 5 = 12']] },
    { t: 'idea', h: 'Keep it balanced', p: ['An equation is a balance. Whatever you do to one side, do to the other.', 'x + 5 = 12 → subtract 5 from both sides → **x = 7**.'] },
    { t: 'idea', h: 'Order of operations', p: ['Parentheses, exponents, multiply and divide (left to right), add and subtract (left to right). 3 + 4 × 2 = 3 + 8 = **11**, not 14.'] }] });
eduNode('m_eq', { n: 'Two-step equations', s: 'SOLVE', lane: 'math', band: '68', g: '7-8', req: ['m_expr'], std: '7.EE.4, 8.EE.7', gen: 'equations', src: MATH_SRC,
  L: [{ t: 'idea', h: 'Undo in reverse order', p: ['3x − 5 = 16. The x was multiplied by 3, then 5 was subtracted. Undo backward: **add 5** (3x = 21), then **divide by 3** (x = 7).', 'Always check: 3(7) − 5 = 16. ✓'] }] });
eduNode('m_stats', { n: 'Mean, median, mode, range', s: 'STATS', lane: 'math', band: '68', g: '6', req: ['m_dec'], std: '6.SP.5', gen: 'stats', src: MATH_SRC,
  L: [{ t: 'words', w: [['mean', 'the average: add them all, divide by how many'], ['median', 'the middle value when they are in order'], ['mode', 'the most common value'], ['range', 'biggest minus smallest']] },
    { t: 'idea', h: 'Why two kinds of middle?', p: ['Five house prices: four near $150,000 and one at $900,000. The **mean** jumps up; the **median** stays near $150,000. When one number is far from the rest, the median tells the truer story.'] }] });
eduNode('m_geom', { n: 'Angles, circles, Pythagoras', s: 'GEOM', lane: 'math', band: '68', g: '7-8', req: ['m_vol', 'm_eq'], std: '7.G.4, 8.G.7', gen: 'geom78', src: MATH_SRC,
  L: [{ t: 'idea', h: 'Triangles add to 180°', p: ['The three angles of any triangle add to **180°**. Know two, and you know the third.'] },
    { t: 'idea', h: 'Circles and π', p: ['Around a circle is about 3.14 diameters. That number is **π**. Circumference = 2πr. Area = πr².'], fig: ['circle', 5, 'cm'] },
    { t: 'idea', h: 'The Pythagorean theorem', p: ['In a right triangle, **a² + b² = c²**: the two short sides squared add up to the long side squared. 3, 4, 5: 9 + 16 = 25.', 'Builders check a square corner this way: 3 feet one way, 4 the other, and the diagonal should be 5.'], fig: ['rtri', 3, 4, 5] }] });
eduNode('m_slope', { n: 'Slope and linear functions', s: 'SLOPE', lane: 'math', band: '68', g: '8', req: ['m_eq', 'm_coord'], std: '8.EE.6, 8.F.3', gen: 'slope', src: MATH_SRC,
  L: [{ t: 'idea', h: 'Rise over run', p: ['Slope is how steep a line is: **rise ÷ run**. From (1, 2) to (3, 6) the line rises 4 while it runs 2: slope 2.'], fig: ['coord', [[1, 2, '(1, 2)'], [3, 6, '(3, 6)']], 8] },
    { t: 'idea', h: 'y = mx + b', p: ['**m** is the slope; **b** is where the line crosses the y-axis. A phone plan of $20 plus $5 a gigabyte is y = 5x + 20.'] }] });
eduNode('m_expo', { n: 'Exponents and scientific notation', s: 'POWER', lane: 'math', band: '68', g: '8', req: ['m_int'], std: '8.EE.1, 8.EE.3', gen: 'expo', src: MATH_SRC,
  L: [{ t: 'idea', h: 'Repeated multiplying', p: ['2⁵ = 2 × 2 × 2 × 2 × 2 = **32**. The small number says how many times.'] },
    { t: 'idea', h: 'Very big and very small', p: ['Earth is about **1.5 × 10⁸** km from the sun: 150,000,000. Scientific notation is one digit, a point, and a power of ten.'] }] });
// ---------- high school: each course is a credit ----------
eduNode('m_alg1', { n: 'Algebra I', s: 'ALG I', lane: 'math', band: 'HS', g: '9', req: ['m_eq', 'm_slope', 'm_expo'], std: 'HSA-REI, HSA-SSE, HSF-IF', gen: 'alg1', cr: ['math', 1], src: MATH_SRC,
  L: [{ t: 'idea', h: 'Systems of equations', p: ['Two equations, two unknowns. Solve one for a letter, put it into the other (**substitution**), or add the equations to cancel a letter (**elimination**).', 'Where two lines cross is the one point that fits both.'] },
    { t: 'idea', h: 'Factoring', p: ['x² + 5x + 6 = **(x + 2)(x + 3)**: find two numbers that multiply to 6 and add to 5.', 'If (x + 2)(x + 3) = 0, then x = −2 or x = −3: a product is zero only if a factor is.'] },
    { t: 'idea', h: 'Exponent rules', p: ['x³ · x⁴ = x⁷ (add exponents). (x³)² = x⁶ (multiply). x⁰ = 1.'] }] });
eduNode('m_geomhs', { n: 'Geometry', s: 'GEO', lane: 'math', band: 'HS', g: '10', req: ['m_alg1', 'm_geom'], std: 'HSG-SRT, HSG-GMD, HSG-GPE', gen: 'geomhs', cr: ['math', 1], src: MATH_SRC,
  L: [{ t: 'idea', h: 'Proof and similarity', p: ['Geometry is the first place many students write **proofs**: each step justified by a definition, a postulate or a theorem already proven.', 'Similar figures have the same shape; matching sides grow by one **scale factor**.'] },
    { t: 'idea', h: 'Distance on a grid', p: ['The distance between two points is the Pythagorean theorem in disguise: √((x₂−x₁)² + (y₂−y₁)²).'] },
    { t: 'idea', h: 'Solids', p: ['Prism or cylinder: base area × height. Cone or pyramid: one third of that. Sphere: 4/3 π r³.'] }] });
eduNode('m_alg2', { n: 'Algebra II', s: 'ALG II', lane: 'math', band: 'HS', g: '11', req: ['m_alg1'], std: 'HSF-LE, HSF-BF, HSN-CN', gen: 'alg2', cr: ['math', 1], src: MATH_SRC,
  L: [{ t: 'idea', h: 'Exponential growth', p: ['Doubling every hour: 100, 200, 400, 800. Growth by a **factor** each step, not by a fixed amount. Savings, populations and rumors all do it.'] },
    { t: 'idea', h: 'Logarithms undo exponents', p: ['log₂ 32 asks: 2 to what power is 32? **5**. Logs turn multiplying into adding; that is why slide rules worked.'] },
    { t: 'idea', h: 'Imaginary numbers', p: ['No real number squares to −1, so mathematicians named one: **i**. i² = −1. With it, every polynomial equation has solutions.'] }] });
eduNode('m_statshs', { n: 'Probability and statistics', s: 'PROB', lane: 'math', band: 'HS', g: '11-12', req: ['m_stats', 'm_alg1'], std: 'HSS-CP, HSS-MD', gen: 'statshs', cr: ['math', 0.5], src: MATH_SRC,
  L: [{ t: 'idea', h: 'Chance as a fraction', p: ['Probability = favorable outcomes ÷ all outcomes, from 0 (never) to 1 (always).'] },
    { t: 'idea', h: 'Expected value', p: ['Average result per try over many tries: (chance × payoff) summed, minus the cost. A game that costs more than its expected payoff loses money over time, however lucky one night feels.'] },
    { t: 'idea', h: 'Sampling', p: ['A survey only speaks for the people it could reach. A **random sample** gives everyone the same chance to be picked; a self-selected one (whoever answers an online poll) does not.'] }] });
eduNode('m_precalc', { n: 'Precalculus', s: 'PRECAL', lane: 'math', band: 'HS', g: '12', req: ['m_alg2', 'm_geomhs'], std: 'HSF-TF', gen: 'precalc', cr: ['math', 1], src: MATH_SRC,
  L: [{ t: 'idea', h: 'Trigonometry', p: ['In a right triangle, **sine** = opposite ÷ hypotenuse, **cosine** = adjacent ÷ hypotenuse, **tangent** = opposite ÷ adjacent. SOH-CAH-TOA.'] },
    { t: 'idea', h: 'Radians', p: ['A radian is the angle that wraps one radius of arc around a circle. 180° = **π** radians.'] }] });
eduNode('m_calc', { n: 'Calculus', s: 'CALC', lane: 'math', band: 'HS', g: '12+', req: ['m_precalc'], std: 'AP Calculus AB topics', gen: 'calc', cr: ['math', 1], src: MATH_SRC.concat(['College Board, AP Calculus AB course framework']),
  L: [{ t: 'idea', h: 'The derivative: rate of change', p: ['How fast is something changing right now? The derivative of x² is **2x**: at x = 3 the curve climbs 6 for each step.', 'Power rule: the derivative of xⁿ is n·xⁿ⁻¹.'] },
    { t: 'idea', h: 'The integral: adding up', p: ['The integral adds up tiny pieces, like distance from speed. It runs the derivative backward: ∫x² dx = x³/3 + C.'] }] });
