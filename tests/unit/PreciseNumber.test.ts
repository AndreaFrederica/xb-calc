import { describe, expect, test } from 'vitest';
import { PreciseNumber } from '@/utils/PreciseNumber';

describe('PreciseNumber', () => {
  describe('构造函数和基本功能', () => {
    test('应该正确构造整数', () => {
      const num = new PreciseNumber('123');
      expect(num.toString()).toBe('123');
    });

    test('应该正确构造小数', () => {
      const num = new PreciseNumber('123.456');
      expect(num.toString()).toBe('123.456');
    });

    test('应该正确构造负数', () => {
      const num = new PreciseNumber('-123.456');
      expect(num.toString()).toBe('-123.456');
    });

    test('应该正确构造零', () => {
      expect(new PreciseNumber('0').toString()).toBe('0');
      expect(new PreciseNumber('0.0').toString()).toBe('0');
      expect(new PreciseNumber().toString()).toBe('0');
    });

    test('应该去除前导零', () => {
      expect(new PreciseNumber('0123').toString()).toBe('123');
      expect(new PreciseNumber('000123.456').toString()).toBe('123.456');
    });

    test('应该从数字构造', () => {
      expect(new PreciseNumber(123.456).toString()).toBe('123.456');
      expect(new PreciseNumber(0).toString()).toBe('0');
    });
  });

  describe('加法运算', () => {
    test('整数加法', () => {
      const a = new PreciseNumber('123');
      const b = new PreciseNumber('456');
      expect(a.add(b).toString()).toBe('579');
    });

    test('小数加法', () => {
      const a = new PreciseNumber('123.456');
      const b = new PreciseNumber('789.123');
      expect(a.add(b).toString()).toBe('912.579');
    });

    test('不同小数位数加法', () => {
      const a = new PreciseNumber('123.4');
      const b = new PreciseNumber('456.789');
      expect(a.add(b).toString()).toBe('580.189');
    });

    test('负数加法', () => {
      const a = new PreciseNumber('100');
      const b = new PreciseNumber('-50');
      expect(a.add(b).toString()).toBe('50');
    });

    test('两个负数相加', () => {
      const a = new PreciseNumber('-100');
      const b = new PreciseNumber('-50');
      expect(a.add(b).toString()).toBe('-150');
    });

    test('小数精度加法 - 无舍入', () => {
      const a = new PreciseNumber('0.1');
      const b = new PreciseNumber('0.2');
      expect(a.add(b).toString()).toBe('0.3');
    });

    test('非常小的数相加', () => {
      const a = new PreciseNumber('0.0000001');
      const b = new PreciseNumber('0.0000002');
      expect(a.add(b).toString()).toBe('0.0000003');
    });
  });

  describe('减法运算', () => {
    test('整数减法', () => {
      const a = new PreciseNumber('456');
      const b = new PreciseNumber('123');
      expect(a.subtract(b).toString()).toBe('333');
    });

    test('小数减法', () => {
      const a = new PreciseNumber('789.123');
      const b = new PreciseNumber('123.456');
      expect(a.subtract(b).toString()).toBe('665.667');
    });

    test('结果为负数的减法', () => {
      const a = new PreciseNumber('100');
      const b = new PreciseNumber('200');
      expect(a.subtract(b).toString()).toBe('-100');
    });

    test('负数减法', () => {
      const a = new PreciseNumber('-100');
      const b = new PreciseNumber('50');
      expect(a.subtract(b).toString()).toBe('-150');
    });

    test('减去负数', () => {
      const a = new PreciseNumber('100');
      const b = new PreciseNumber('-50');
      expect(a.subtract(b).toString()).toBe('150');
    });
  });

  describe('乘法运算', () => {
    test('整数乘法', () => {
      const a = new PreciseNumber('12');
      const b = new PreciseNumber('34');
      expect(a.multiply(b).toString()).toBe('408');
    });

    test('小数乘法', () => {
      const a = new PreciseNumber('12.34');
      const b = new PreciseNumber('5.6');
      expect(a.multiply(b).toString()).toBe('69.104');
    });

    test('小数乘小数 - 无舍入', () => {
      const a = new PreciseNumber('0.1');
      const b = new PreciseNumber('0.2');
      expect(a.multiply(b).toString()).toBe('0.02');
    });

    test('更复杂的小数乘法', () => {
      const a = new PreciseNumber('0.01');
      const b = new PreciseNumber('0.03');
      expect(a.multiply(b).toString()).toBe('0.0003');
    });

    test('小数乘整数', () => {
      const a = new PreciseNumber('123.456');
      const b = new PreciseNumber('100');
      expect(a.multiply(b).toString()).toBe('12345.6');
    });

    test('负数乘法', () => {
      const a = new PreciseNumber('-12');
      const b = new PreciseNumber('34');
      expect(a.multiply(b).toString()).toBe('-408');
    });

    test('两个负数相乘', () => {
      const a = new PreciseNumber('-12');
      const b = new PreciseNumber('-34');
      expect(a.multiply(b).toString()).toBe('408');
    });

    test('零乘以任何数等于零', () => {
      const a = new PreciseNumber('0');
      const b = new PreciseNumber('123.456');
      expect(a.multiply(b).toString()).toBe('0');
    });

    test('非常大的小数位数乘法', () => {
      const a = new PreciseNumber('0.123456789');
      const b = new PreciseNumber('0.987654321');
      expect(a.multiply(b).toString()).toBe('0.121932631112635269');
    });
  });

  describe('比较功能', () => {
    test('compareTo - 大于', () => {
      const a = new PreciseNumber('100');
      const b = new PreciseNumber('50');
      expect(a.compareTo(b)).toBe(1);
    });

    test('compareTo - 小于', () => {
      const a = new PreciseNumber('50');
      const b = new PreciseNumber('100');
      expect(a.compareTo(b)).toBe(-1);
    });

    test('compareTo - 等于', () => {
      const a = new PreciseNumber('100');
      const b = new PreciseNumber('100');
      expect(a.compareTo(b)).toBe(0);
    });

    test('compareTo - 小数比较', () => {
      const a = new PreciseNumber('100.001');
      const b = new PreciseNumber('100.0009');
      expect(a.compareTo(b)).toBe(1);
    });

    test('compareTo - 负数比较', () => {
      const a = new PreciseNumber('-100');
      const b = new PreciseNumber('50');
      expect(a.compareTo(b)).toBe(-1);
    });

    test('equals', () => {
      const a = new PreciseNumber('123.456');
      const b = new PreciseNumber('123.456');
      const c = new PreciseNumber('123.457');
      expect(a.equals(b)).toBe(true);
      expect(a.equals(c)).toBe(false);
    });
  });

  describe('工具方法', () => {
    test('isNegative', () => {
      expect(new PreciseNumber('-123').isNegative()).toBe(true);
      expect(new PreciseNumber('123').isNegative()).toBe(false);
      expect(new PreciseNumber('0').isNegative()).toBe(false);
    });

    test('isZero', () => {
      expect(new PreciseNumber('0').isZero()).toBe(true);
      expect(new PreciseNumber('0.0').isZero()).toBe(true);
      expect(new PreciseNumber('123').isZero()).toBe(false);
    });

    test('abs', () => {
      const a = new PreciseNumber('-123.456');
      expect(a.abs().toString()).toBe('123.456');
      expect(new PreciseNumber('123.456').abs().toString()).toBe('123.456');
    });

    test('getIntegerPart', () => {
      expect(new PreciseNumber('123.456').getIntegerPart()).toBe('123');
      expect(new PreciseNumber('-123.456').getIntegerPart()).toBe('-123');
      expect(new PreciseNumber('0.5').getIntegerPart()).toBe('0');
    });

    test('getDecimalPart', () => {
      expect(new PreciseNumber('123.456').getDecimalPart()).toBe('456');
      expect(new PreciseNumber('123').getDecimalPart()).toBe('');
      expect(new PreciseNumber('-123.456').getDecimalPart()).toBe('456');
    });
  });

  describe('格式化输出', () => {
    test('toFormatted - 千位分隔符 (3位)', () => {
      expect(new PreciseNumber('1234567.89').toFormatted('3')).toBe('1,234,567.89');
      expect(new PreciseNumber('1234567890').toFormatted('3')).toBe('1,234,567,890');
    });

    test('toFormatted - 万位分隔符 (4位)', () => {
      expect(new PreciseNumber('123456789.1234').toFormatted('4')).toBe('1,2345,6789.1234');
    });

    test('toFormatted - 去除小数末尾的零', () => {
      expect(new PreciseNumber('123.4500').toFormatted('3')).toBe('123.45');
      expect(new PreciseNumber('123.000').toFormatted('3')).toBe('123');
    });

    test('toFormatted - 负数', () => {
      expect(new PreciseNumber('-1234567.89').toFormatted('3')).toBe('-1,234,567.89');
    });

    test('toFormatted - 小数精度保留', () => {
      expect(new PreciseNumber('123.0001000').toFormatted('3')).toBe('123.0001');
    });
  });

  describe('边界情况', () => {
    test('非常大的数', () => {
      const a = new PreciseNumber('99999999999999999999');
      const b = new PreciseNumber('1');
      expect(a.add(b).toString()).toBe('100000000000000000000');
    });

    test('非常小的数', () => {
      const a = new PreciseNumber('0.0000000001');
      const b = new PreciseNumber('0.0000000002');
      expect(a.add(b).toString()).toBe('0.0000000003');
    });

    test('连续运算', () => {
      let result = new PreciseNumber('0.1');
      result = result.add(new PreciseNumber('0.2'));
      result = result.multiply(new PreciseNumber('10'));
      expect(result.toString()).toBe('3');
    });

    test('财务计算场景 - 数量 × 单价', () => {
      const qty = new PreciseNumber('100');
      const price = new PreciseNumber('12.58');
      expect(qty.multiply(price).toString()).toBe('1258');
    });

    test('财务计算场景 - 带小数的数量', () => {
      const qty = new PreciseNumber('12.5');
      const price = new PreciseNumber('8.88');
      expect(qty.multiply(price).toString()).toBe('111');
    });

    test('财务计算场景 - 精确小数', () => {
      const qty = new PreciseNumber('1.1');
      const price = new PreciseNumber('1.1');
      expect(qty.multiply(price).toString()).toBe('1.21');
    });

    test('累加计算', () => {
      const prices = ['10.50', '20.75', '33.25', '5.00'];
      let sum = new PreciseNumber('0');
      for (const price of prices) {
        sum = sum.add(new PreciseNumber(price));
      }
      expect(sum.toString()).toBe('69.5');
    });
  });
});
