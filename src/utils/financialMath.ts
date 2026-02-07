import Decimal from 'decimal.js';

// 配置 Decimal 精度
Decimal.set({ precision: 20, modulo: Decimal.ROUND_HALF_UP });

/**
 * 金融模式高精度计算器
 * 使用 decimal.js 提供精确的数值计算，避免浮点数精度丢失
 */

// 常量
export const PI = new Decimal(Math.PI);
export const E = new Decimal(Math.E);

// 三角函数（使用弧度）
function sinRadians(x: Decimal): Decimal {
  // 泰勒级数展开: sin(x) = x - x³/3! + x⁵/5! - x⁷/7! + ...
  let result = new Decimal(x);
  let term = new Decimal(x);
  const xSquared = x.times(x);

  for (let n = 1; n <= 20; n++) {
    term = term.times(xSquared).dividedBy((2 * n) * (2 * n + 1));
    if (n % 2 === 1) {
      result = result.minus(term);
    } else {
      result = result.plus(term);
    }
    if (term.abs().lt(new Decimal('1e-15'))) break;
  }

  return result;
}

function cosRadians(x: Decimal): Decimal {
  // 泰勒级数展开: cos(x) = 1 - x²/2! + x⁴/4! - x⁶/6! + ...
  let result = new Decimal(1);
  let term = new Decimal(1);
  const xSquared = x.times(x);

  for (let n = 1; n <= 20; n++) {
    term = term.times(xSquared).dividedBy((2 * n - 1) * (2 * n));
    if (n % 2 === 1) {
      result = result.minus(term);
    } else {
      result = result.plus(term);
    }
    if (term.abs().lt(new Decimal('1e-15'))) break;
  }

  return result;
}

function tanRadians(x: Decimal): Decimal {
  const cos = cosRadians(x);
  if (cos.abs().lt(new Decimal('1e-10'))) {
    throw new Error('tan undefined');
  }
  return sinRadians(x).dividedBy(cos);
}

// 反三角函数（牛顿迭代法）
function asinRadians(x: Decimal): Decimal {
  if (x.abs().gt(1)) {
    throw new Error('asin domain error');
  }
  // 初值
  let result = new Decimal(x);
  // 牛顿迭代: x_{n+1} = x_n - (sin(x_n) - a) / cos(x_n)
  for (let i = 0; i < 20; i++) {
    const sin = sinRadians(result);
    const cos = cosRadians(result);
    const delta = sin.minus(x).dividedBy(cos);
    result = result.minus(delta);
    if (delta.abs().lt(new Decimal('1e-15'))) break;
  }
  return result;
}

function acosRadians(x: Decimal): Decimal {
  if (x.abs().gt(1)) {
    throw new Error('acos domain error');
  }
  // acos(x) = π/2 - asin(x)
  return PI.dividedBy(2).minus(asinRadians(x));
}

function atanRadians(x: Decimal): Decimal {
  // 使用牛顿迭代法求解 tan(y) = x
  let result = new Decimal(x);
  if (x.abs().gt(1)) {
    result = new Decimal(x.gte(0) ? 1 : -1);
  }

  for (let i = 0; i < 30; i++) {
    const tan = tanRadians(result);
    const secSquared = new Decimal(1).plus(tan.times(tan));
    const delta = tan.minus(x).dividedBy(secSquared);
    result = result.minus(delta);
    if (delta.abs().lt(new Decimal('1e-15'))) break;
  }
  return result;
}

// 对数函数
function log10(x: Decimal): Decimal {
  if (x.lte(0)) {
    throw new Error('log domain error');
  }
  // 使用换底公式: log10(x) = ln(x) / ln(10)
  return ln(x).dividedBy(ln(new Decimal(10)));
}

function ln(x: Decimal): Decimal {
  if (x.lte(0)) {
    throw new Error('ln domain error');
  }
  // 使用牛顿迭代法求解 e^y = x
  // 初值选择
  let result = new Decimal(Math.log(x.toNumber()));

  for (let i = 0; i < 30; i++) {
    const expResult = exp(result);
    const delta = expResult.minus(x).dividedBy(expResult);
    result = result.minus(delta);
    if (delta.abs().lt(new Decimal('1e-15'))) break;
  }
  return result;
}

function exp(x: Decimal): Decimal {
  // e^x 使用泰勒级数: e^x = 1 + x + x²/2! + x³/3! + ...
  let result = new Decimal(1);
  let term = new Decimal(1);

  for (let n = 1; n <= 50; n++) {
    term = term.times(x).dividedBy(n);
    result = result.plus(term);
    if (term.abs().lt(new Decimal('1e-15'))) break;
  }

  return result;
}

// 幂运算
function pow(base: Decimal, exponent: Decimal): Decimal {
  if (exponent.isZero()) {
    return new Decimal(1);
  }

  // 整数指数
  if (exponent.isInteger()) {
    const n = exponent.toNumber();
    if (n >= 0) {
      let result = new Decimal(1);
      for (let i = 0; i < n; i++) {
        result = result.times(base);
      }
      return result;
    } else {
      return new Decimal(1).dividedBy(pow(base, exponent.negated()));
    }
  }

  // 非整数指数: a^b = e^(b * ln(a))
  if (base.lte(0)) {
    throw new Error('pow domain error');
  }
  return exp(exponent.times(ln(base)));
}

// 平方根
function sqrt(x: Decimal): Decimal {
  if (x.lt(0)) {
    throw new Error('sqrt domain error');
  }
  // 牛顿迭代法
  let result = new Decimal(Math.sqrt(x.toNumber()));
  for (let i = 0; i < 20; i++) {
    const next = result.plus(x.dividedBy(result)).dividedBy(2);
    if (next.minus(result).abs().lt(new Decimal('1e-15'))) break;
    result = next;
  }
  return result;
}

// 立方根
function cbrt(x: Decimal): Decimal {
  // 牛顿迭代法求解 y³ = x
  let result = new Decimal(Math.cbrt(x.toNumber()));
  for (let i = 0; i < 20; i++) {
    const resultSquared = result.times(result);
    const next = result.times(2).plus(x.dividedBy(resultSquared)).dividedBy(3);
    if (next.minus(result).abs().lt(new Decimal('1e-15'))) break;
    result = next;
  }
  return result;
}

// 阶乘
function factorial(n: Decimal): Decimal {
  const intN = n.toNumber();
  if (!Number.isInteger(intN) || intN < 0) {
    throw new Error('factorial domain error');
  }
  if (intN === 0 || intN === 1) {
    return new Decimal(1);
  }
  if (intN > 170) {
    throw new Error('factorial overflow');
  }

  let result = new Decimal(1);
  for (let i = 2; i <= intN; i++) {
    result = result.times(i);
  }
  return result;
}

// 角度转换
function degToRad(deg: Decimal): Decimal {
  return deg.times(PI).dividedBy(180);
}

function radToDeg(rad: Decimal): Decimal {
  return rad.times(180).dividedBy(PI);
}

// 词法分析
function tokenizeExpression(expr: string): (Decimal | string)[] {
  const tokens: (Decimal | string)[] = [];
  let i = 0;

  while (i < expr.length) {
    const char = expr[i]!; // 安全：i < expr.length 保证 char 存在

    // 跳过空格
    if (/\s/.test(char)) {
      i++;
      continue;
    }

    // 处理数字（包括科学计数法）
    if (/[\d.]/.test(char)) {
      let num = '';
      let dotCount = 0;
      while (i < expr.length) {
        const c = expr[i]!;
        if (/[\d]/.test(c) || (c === '.' && dotCount === 0)) {
          if (c === '.') dotCount++;
          num += c;
          i++;
        } else {
          break;
        }
      }
      // 检查科学计数法
      if (i < expr.length && (expr[i] === 'e' || expr[i] === 'E')) {
        num += expr[i]!;
        i++;
        if (i < expr.length && (expr[i] === '+' || expr[i] === '-')) {
          num += expr[i]!;
          i++;
        }
        while (i < expr.length && /\d/.test(expr[i]!)) {
          num += expr[i]!;
          i++;
        }
      }
      tokens.push(new Decimal(num));
      continue;
    }

    // 处理运算符
    if (/[+\-*/^()]/.test(char)) {
      tokens.push(char);
      i++;
      continue;
    }

    // 处理函数和常量
    if (/[a-zA-Z]/.test(char)) {
      let name = '';
      while (i < expr.length) {
        const c = expr[i]!;
        if (/[a-zA-Z0-9_]/.test(c)) {
          name += c;
          i++;
        } else {
          break;
        }
      }
      tokens.push(name);
      continue;
    }

    i++;
  }

  return tokens;
}

// 中缀转后缀（Shunting-yard 算法）
function infixToPostfix(tokens: (Decimal | string)[]): (Decimal | string)[] {
  const output: (Decimal | string)[] = [];
  const operators: string[] = [];

  const precedence: Record<string, number> = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
    '^': 3,
  };

  const isFunction = (token: string): boolean => {
    return ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'log', 'ln', 'exp', 'sqrt', 'cbrt', 'factorial', 'pi', 'e'].includes(token);
  };

  const getPrecedence = (op: string): number => {
    return precedence[op] ?? 0;
  };

  for (const token of tokens) {
    if (token instanceof Decimal) {
      output.push(token);
    } else if (/[+\-*/^]/.test(token)) {
      const tokenPrecedence = getPrecedence(token);
      while (
        operators.length > 0 &&
        operators[operators.length - 1] !== '('
      ) {
        const lastOp = operators[operators.length - 1];
        if (lastOp && getPrecedence(lastOp) >= tokenPrecedence) {
          output.push(operators.pop()!);
        } else {
          break;
        }
      }
      operators.push(token);
    } else if (token === '(') {
      operators.push(token);
    } else if (token === ')') {
      while (operators.length > 0 && operators[operators.length - 1] !== '(') {
        output.push(operators.pop()!);
      }
      operators.pop(); // 弹出 '('
    } else if (isFunction(token)) {
      operators.push(token);
    }
  }

  while (operators.length > 0) {
    output.push(operators.pop()!);
  }

  return output;
}

// 计算后缀表达式
function evaluatePostfix(tokens: (Decimal | string)[], angleMode: 'DEG' | 'RAD'): string {
  const stack: Decimal[] = [];

  for (const token of tokens) {
    if (token instanceof Decimal) {
      stack.push(token);
    } else if (typeof token === 'string') {
      // 运算符
      if (/[+\-*/^]/.test(token)) {
        if (stack.length < 2) throw new Error('表达式错误');
        const b = stack.pop()!;
        const a = stack.pop()!;
        let result: Decimal;

        switch (token) {
          case '+':
            result = a.plus(b);
            break;
          case '-':
            result = a.minus(b);
            break;
          case '*':
            result = a.times(b);
            break;
          case '/':
            result = a.div(b);
            break;
          case '^':
            result = pow(a, b);
            break;
          default:
            throw new Error('未知运算符');
        }
        stack.push(result);
      }
      // 一元函数
      else if (['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'log', 'ln', 'exp', 'sqrt', 'cbrt'].includes(token)) {
        if (stack.length < 1) throw new Error('表达式错误');
        const a = stack.pop()!;
        let result: Decimal;

        switch (token) {
          case 'sin':
            result = angleMode === 'DEG' ? sinRadians(degToRad(a)) : sinRadians(a);
            break;
          case 'cos':
            result = angleMode === 'DEG' ? cosRadians(degToRad(a)) : cosRadians(a);
            break;
          case 'tan':
            result = angleMode === 'DEG' ? tanRadians(degToRad(a)) : tanRadians(a);
            break;
          case 'asin':
            result = angleMode === 'DEG' ? radToDeg(asinRadians(a)) : asinRadians(a);
            break;
          case 'acos':
            result = angleMode === 'DEG' ? radToDeg(acosRadians(a)) : acosRadians(a);
            break;
          case 'atan':
            result = angleMode === 'DEG' ? radToDeg(atanRadians(a)) : atanRadians(a);
            break;
          case 'log':
            result = log10(a);
            break;
          case 'ln':
            result = ln(a);
            break;
          case 'exp':
            result = exp(a);
            break;
          case 'sqrt':
            result = sqrt(a);
            break;
          case 'cbrt':
            result = cbrt(a);
            break;
          default:
            throw new Error('未知函数');
        }
        stack.push(result);
      }
      // 常量
      else if (token === 'pi') {
        stack.push(PI);
      } else if (token === 'e') {
        stack.push(E);
      }
      // 阶乘函数
      else if (token === 'factorial') {
        if (stack.length < 1) throw new Error('表达式错误');
        const a = stack.pop()!;
        stack.push(factorial(a));
      }
    }
  }

  if (stack.length !== 1) {
    throw new Error('表达式错误');
  }

  const result = stack[0];
  if (!result) {
    throw new Error('表达式错误');
  }

  return result.toString();
}

/**
 * 计算表达式（金融模式高精度版本）
 * @param expression 数学表达式字符串
 * @param angleMode 角度模式 'DEG' 或 'RAD'
 * @returns 计算结果
 */
export function evaluateFinancial(expression: string, angleMode: 'DEG' | 'RAD' = 'DEG'): string {
  const tokens = tokenizeExpression(expression);
  const postfix = infixToPostfix(tokens);
  return evaluatePostfix(postfix, angleMode);
}

/**
 * 格式化显示结果
 * @param value 数值
 * @returns 格式化后的字符串
 */
export function formatFinancialResult(value: string): string {
  const decimal = new Decimal(value);

  // 如果是整数，直接返回
  if (decimal.isInteger()) {
    return decimal.toString();
  }

  // 否则返回原始字符串
  return decimal.toString();
}
