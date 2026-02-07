import { describe, expect, test } from 'vitest';
import { evaluateFinancial, formatFinancialResult } from '@/utils/financialMath';

describe('financialMath', () => {
  describe('基本运算', () => {
    test('加法', () => {
      expect(evaluateFinancial('1+1')).toBe('2');
      expect(evaluateFinancial('0.1+0.2')).toBe('0.3');
      expect(evaluateFinancial('123.456+789.123')).toBe('912.579');
    });

    test('减法', () => {
      expect(evaluateFinancial('5-3')).toBe('2');
      expect(evaluateFinancial('100-50.5')).toBe('49.5');
      expect(evaluateFinancial('1-0.9')).toBe('0.1');
    });

    test('乘法', () => {
      expect(evaluateFinancial('2*3')).toBe('6');
      expect(evaluateFinancial('0.1*0.2')).toBe('0.02');
      expect(evaluateFinancial('1.1*1.1')).toBe('1.21');
    });

    test('除法', () => {
      expect(evaluateFinancial('10/2')).toBe('5');
      expect(evaluateFinancial('1/3')).toMatch(/0\.33/);
    });

    test('幂运算', () => {
      expect(evaluateFinancial('2^3')).toBe('8');
      expect(evaluateFinancial('2^10')).toBe('1024');
      expect(evaluateFinancial('10^2')).toBe('100');
    });

    test('复杂表达式', () => {
      expect(evaluateFinancial('2+3*4')).toBe('14');
      expect(evaluateFinancial('(2+3)*4')).toBe('20');
      expect(evaluateFinancial('2*(3+4)')).toBe('14');
      expect(evaluateFinancial('2+3*4-5*0.5')).toBe('11.5');
    });
  });

  describe('三角函数（弧度模式）', () => {
    test('sin 函数', () => {
      expect(evaluateFinancial('sin(0)', 'RAD')).toBe('0');
      // sin(π/2) 应该接近 1，但可能有精度误差
      const result = evaluateFinancial('sin(1.5707963267948966)', 'RAD');
      expect(parseFloat(result)).toBeCloseTo(1, 10);
    });

    test('cos 函数', () => {
      expect(evaluateFinancial('cos(0)', 'RAD')).toBe('1');
      const result = evaluateFinancial('cos(3.141592653589793)', 'RAD');
      expect(parseFloat(result)).toBeCloseTo(-1, 10);
    });

    test('tan 函数', () => {
      expect(evaluateFinancial('tan(0)', 'RAD')).toBe('0');
      const result = evaluateFinancial('tan(0.7853981633974483)', 'RAD');
      expect(parseFloat(result)).toBeCloseTo(1, 10);
    });
  });

  describe('三角函数（角度模式）', () => {
    test('sin 函数', () => {
      expect(evaluateFinancial('sin(0)', 'DEG')).toBe('0');
      const result = evaluateFinancial('sin(90)', 'DEG');
      expect(parseFloat(result)).toBeCloseTo(1, 10);
    });

    test('cos 函数', () => {
      expect(evaluateFinancial('cos(0)', 'DEG')).toBe('1');
      const result = evaluateFinancial('cos(180)', 'DEG');
      expect(parseFloat(result)).toBeCloseTo(-1, 10);
    });

    test('tan 函数', () => {
      expect(evaluateFinancial('tan(0)', 'DEG')).toBe('0');
      const result = evaluateFinancial('tan(45)', 'DEG');
      expect(parseFloat(result)).toBeCloseTo(1, 10);
    });
  });

  describe('反三角函数', () => {
    test('asin 函数', () => {
      expect(evaluateFinancial('asin(0)', 'RAD')).toBe('0');
      const result = evaluateFinancial('asin(1)', 'RAD');
      expect(parseFloat(result)).toBeCloseTo(1.5707, 3);
    });

    test('acos 函数', () => {
      const result1 = evaluateFinancial('acos(1)', 'RAD');
      expect(parseFloat(result1)).toBeCloseTo(0, 3);
      const result0 = evaluateFinancial('acos(0)', 'RAD');
      expect(parseFloat(result0)).toBeCloseTo(1.5707, 3);
    });

    test('atan 函数', () => {
      expect(evaluateFinancial('atan(0)', 'RAD')).toBe('0');
      const result = evaluateFinancial('atan(1)', 'RAD');
      expect(parseFloat(result)).toBeCloseTo(0.7853, 3);
    });
  });

  describe('对数和指数函数', () => {
    test('log 函数（常用对数）', () => {
      expect(evaluateFinancial('log(10)')).toBe('1');
      const result = evaluateFinancial('log(100)');
      expect(parseFloat(result)).toBeCloseTo(2, 10);
      expect(evaluateFinancial('log(1)')).toBe('0');
    });

    test('ln 函数（自然对数）', () => {
      const result = evaluateFinancial('ln(2.718281828459045)');
      expect(parseFloat(result)).toBeCloseTo(1, 10);
      expect(evaluateFinancial('ln(1)')).toBe('0');
    });

    test('exp 函数（e的幂）', () => {
      expect(evaluateFinancial('exp(0)')).toBe('1');
      const result1 = evaluateFinancial('exp(1)');
      expect(parseFloat(result1)).toBeCloseTo(2.7182, 3);
      const result2 = evaluateFinancial('exp(2)');
      expect(parseFloat(result2)).toBeCloseTo(7.3890, 3);
    });
  });

  describe('根式函数', () => {
    test('sqrt 函数（平方根）', () => {
      expect(evaluateFinancial('sqrt(4)')).toBe('2');
      expect(evaluateFinancial('sqrt(9)')).toBe('3');
      const result = evaluateFinancial('sqrt(2)');
      expect(parseFloat(result)).toBeCloseTo(1.4142, 4);
    });

    test('cbrt 函数（立方根）', () => {
      expect(evaluateFinancial('cbrt(8)')).toBe('2');
      expect(evaluateFinancial('cbrt(27)')).toBe('3');
      expect(evaluateFinancial('cbrt(-8)')).toBe('-2');
    });
  });

  describe('阶乘函数', () => {
    test('factorial 函数', () => {
      expect(evaluateFinancial('factorial(0)')).toBe('1');
      expect(evaluateFinancial('factorial(1)')).toBe('1');
      expect(evaluateFinancial('factorial(5)')).toBe('120');
      expect(evaluateFinancial('factorial(10)')).toBe('3628800');
    });
  });

  describe('常量', () => {
    test('pi 常量', () => {
      expect(evaluateFinancial('pi')).toMatch(/3\.14159/);
    });

    test('e 常量', () => {
      expect(evaluateFinancial('e')).toMatch(/2\.71828/);
    });
  });

  describe('formatFinancialResult', () => {
    test('格式化整数结果', () => {
      expect(formatFinancialResult('123')).toBe('123');
      expect(formatFinancialResult('0')).toBe('0');
      expect(formatFinancialResult('-456')).toBe('-456');
    });

    test('格式化小数结果', () => {
      expect(formatFinancialResult('123.456')).toBe('123.456');
      expect(formatFinancialResult('0.1')).toBe('0.1');
      expect(formatFinancialResult('3.141592653589793238')).toBe('3.141592653589793238');
    });
  });

  describe('边界情况', () => {
    test('空表达式应抛出错误', () => {
      expect(() => evaluateFinancial('')).toThrow();
    });

    test('除以零应返回 Infinity', () => {
      const result = evaluateFinancial('1/0');
      expect(result === 'Infinity' || result === 'NaN').toBe(true);
    });

    test('负数平方根应抛出错误', () => {
      expect(() => evaluateFinancial('sqrt(-1)')).toThrow();
    });

    test('负数对数应抛出错误', () => {
      expect(() => evaluateFinancial('ln(-1)')).toThrow();
      expect(() => evaluateFinancial('log(0)')).toThrow();
    });

    test('超出定义域的反三角函数应抛出错误', () => {
      expect(() => evaluateFinancial('asin(2)')).toThrow();
      expect(() => evaluateFinancial('acos(2)')).toThrow();
    });

    test('大数阶乘应抛出错误', () => {
      expect(() => evaluateFinancial('factorial(200)')).toThrow();
    });
  });

  describe('财务场景计算', () => {
    test('金额计算 - 精确小数', () => {
      expect(evaluateFinancial('1.1*1.1')).toBe('1.21');
      expect(evaluateFinancial('12.58*100')).toBe('1258');
      expect(evaluateFinancial('0.01+0.02')).toBe('0.03');
    });

    test('财务场景 - 累加计算', () => {
      expect(evaluateFinancial('10.50+20.75+33.25+5.00')).toBe('69.5');
      expect(evaluateFinancial('1.23+4.56+7.89')).toBe('13.68');
    });

    test('财务场景 - 折扣计算', () => {
      expect(evaluateFinancial('100*0.85')).toBe('85');
      expect(evaluateFinancial('1000*0.9')).toBe('900');
      expect(evaluateFinancial('99.99*0.5')).toBe('49.995');
    });

    test('财务场景 - 税费计算', () => {
      expect(evaluateFinancial('100*1.13')).toBe('113');
      expect(evaluateFinancial('50*1.06')).toBe('53');
      expect(evaluateFinancial('199.99*1.08')).toBe('215.9892');
    });
  });

  describe('科学计数法', () => {
    test('科学计数法表示的数字', () => {
      expect(evaluateFinancial('1e10')).toBe('10000000000');
      expect(evaluateFinancial('1.5e2')).toBe('150');
      expect(evaluateFinancial('2e-2')).toBe('0.02');
    });

    test('科学计数法运算', () => {
      expect(evaluateFinancial('1e6+2e6')).toBe('3000000');
      expect(evaluateFinancial('1e3*2')).toBe('2000');
    });
  });
});
