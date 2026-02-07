import { describe, expect, test } from 'vitest';
import { PreciseNumber } from '@/utils/PreciseNumber';
import { toChineseNumber } from '@/utils/ChineseNumberConverter';

describe('ChineseNumberConverter', () => {
  describe('大写金额转换 (numberCase = "upper")', () => {
    test('应该正确转换整数', () => {
      expect(toChineseNumber(new PreciseNumber('0'))).toBe('零元整');
      expect(toChineseNumber(new PreciseNumber('1'))).toBe('壹元整');
      expect(toChineseNumber(new PreciseNumber('10'))).toBe('壹拾元整');
      expect(toChineseNumber(new PreciseNumber('100'))).toBe('壹佰元整');
      expect(toChineseNumber(new PreciseNumber('1000'))).toBe('壹仟元整');
    });

    test('应该正确转换带小数的金额', () => {
      expect(toChineseNumber(new PreciseNumber('0.1'))).toBe('零元壹角');
      expect(toChineseNumber(new PreciseNumber('0.01'))).toBe('零元壹分');
      expect(toChineseNumber(new PreciseNumber('0.11'))).toBe('零元壹角壹分');
      expect(toChineseNumber(new PreciseNumber('1.23'))).toBe('壹元贰角叁分');
      expect(toChineseNumber(new PreciseNumber('10.50'))).toBe('壹拾元伍角');
    });

    test('应该正确转换大额金额', () => {
      expect(toChineseNumber(new PreciseNumber('10000'))).toBe('壹万元整');
      expect(toChineseNumber(new PreciseNumber('100000'))).toBe('壹拾万元整');
      expect(toChineseNumber(new PreciseNumber('100000000'))).toBe('壹亿元整');
      expect(toChineseNumber(new PreciseNumber('123456789'))).toBe('壹亿贰仟叁佰肆拾伍万陆仟柒佰捌拾玖元整');
    });

    test('应该正确处理零', () => {
      expect(toChineseNumber(new PreciseNumber('0'))).toBe('零元整');
      expect(toChineseNumber(new PreciseNumber('0.0'))).toBe('零元整');
      expect(toChineseNumber(new PreciseNumber('0.00'))).toBe('零元整');
    });

    test('应该正确处理中间的零', () => {
      expect(toChineseNumber(new PreciseNumber('101'))).toBe('壹佰零壹元整');
      expect(toChineseNumber(new PreciseNumber('1001'))).toBe('壹仟零壹元整');
      expect(toChineseNumber(new PreciseNumber('10101'))).toBe('壹万壹佰零壹元整');
      expect(toChineseNumber(new PreciseNumber('10000001'))).toBe('壹仟万零壹元整');
    });

    test('应该正确转换负数', () => {
      expect(toChineseNumber(new PreciseNumber('-1'))).toBe('负壹元整');
      expect(toChineseNumber(new PreciseNumber('-100.50'))).toBe('负壹佰元伍角');
      expect(toChineseNumber(new PreciseNumber('-1234567.89'))).toBe('负壹佰贰拾叁万肆仟伍佰陆拾柒元捌角玖分');
    });

    test('财务场景常见金额', () => {
      expect(toChineseNumber(new PreciseNumber('12.58'))).toBe('壹拾贰元伍角捌分');
      expect(toChineseNumber(new PreciseNumber('111.11'))).toBe('壹佰壹拾壹元壹角壹分');
      expect(toChineseNumber(new PreciseNumber('999.99'))).toBe('玖佰玖拾玖元玖角玖分');
      expect(toChineseNumber(new PreciseNumber('1000.00'))).toBe('壹仟元整');
      expect(toChineseNumber(new PreciseNumber('8888.88'))).toBe('捌仟捌佰捌拾捌元捌角捌分');
    });

    test('应该正确处理只有角或只有分的情况', () => {
      expect(toChineseNumber(new PreciseNumber('0.5'))).toBe('零元伍角');
      expect(toChineseNumber(new PreciseNumber('0.05'))).toBe('零元伍分');
      expect(toChineseNumber(new PreciseNumber('1.5'))).toBe('壹元伍角');
      expect(toChineseNumber(new PreciseNumber('1.05'))).toBe('壹元零伍分');
    });

    test('应该正确处理万位单位', () => {
      expect(toChineseNumber(new PreciseNumber('100000'))).toBe('壹拾万元整');
      expect(toChineseNumber(new PreciseNumber('12345678'))).toBe('壹仟贰佰叁拾肆万伍仟陆佰柒拾捌元整');
      expect(toChineseNumber(new PreciseNumber('100000000'))).toBe('壹亿元整');
    });
  });

  describe('小写金额转换 (numberCase = "lower")', () => {
    test('应该正确转换整数', () => {
      expect(toChineseNumber(new PreciseNumber('0'), 'lower')).toBe('零圆正');
      expect(toChineseNumber(new PreciseNumber('1'), 'lower')).toBe('一圆正');
      expect(toChineseNumber(new PreciseNumber('10'), 'lower')).toBe('一十圆正');
      expect(toChineseNumber(new PreciseNumber('100'), 'lower')).toBe('一百圆正');
      expect(toChineseNumber(new PreciseNumber('1000'), 'lower')).toBe('一千圆正');
    });

    test('应该正确转换带小数的金额', () => {
      expect(toChineseNumber(new PreciseNumber('0.1'), 'lower')).toBe('零圆一毛');
      expect(toChineseNumber(new PreciseNumber('0.01'), 'lower')).toBe('零圆一分');
      expect(toChineseNumber(new PreciseNumber('0.11'), 'lower')).toBe('零圆一毛一分');
      expect(toChineseNumber(new PreciseNumber('1.23'), 'lower')).toBe('一圆二毛三分');
      expect(toChineseNumber(new PreciseNumber('10.50'), 'lower')).toBe('一十圆五毛');
    });

    test('应该正确转换大额金额', () => {
      expect(toChineseNumber(new PreciseNumber('10000'), 'lower')).toBe('一万圆正');
      expect(toChineseNumber(new PreciseNumber('100000'), 'lower')).toBe('一十万圆正');
      expect(toChineseNumber(new PreciseNumber('100000000'), 'lower')).toBe('一亿圆正');
      expect(toChineseNumber(new PreciseNumber('123456789'), 'lower')).toBe('一亿二千三百四十五万六千七百八十九圆正');
    });

    test('应该正确处理中间的零', () => {
      expect(toChineseNumber(new PreciseNumber('101'), 'lower')).toBe('一百〇一圆正');
      expect(toChineseNumber(new PreciseNumber('1001'), 'lower')).toBe('一千〇一圆正');
      expect(toChineseNumber(new PreciseNumber('10101'), 'lower')).toBe('一万一百〇一圆正');
    });

    test('应该正确转换负数', () => {
      expect(toChineseNumber(new PreciseNumber('-1'), 'lower')).toBe('负一圆正');
      expect(toChineseNumber(new PreciseNumber('-100.50'), 'lower')).toBe('负一百圆五毛');
    });

    test('财务场景常见金额', () => {
      expect(toChineseNumber(new PreciseNumber('12.58'), 'lower')).toBe('一十二圆五毛八分');
      expect(toChineseNumber(new PreciseNumber('111.11'), 'lower')).toBe('一百一十一圆一毛一分');
      expect(toChineseNumber(new PreciseNumber('999.99'), 'lower')).toBe('九百九十九圆九毛九分');
    });
  });

  describe('边界情况', () => {
    test('非常大的数', () => {
      expect(toChineseNumber(new PreciseNumber('999999999999'))).toBe('玖仟玖佰玖拾玖亿玖仟玖佰玖拾玖万玖仟玖佰玖拾玖元整');
    });

    test('非常小的数', () => {
      expect(toChineseNumber(new PreciseNumber('0.01'))).toBe('零元壹分');
      expect(toChineseNumber(new PreciseNumber('0.001'))).toBe('零元整');
    });

    test('连续相同数字', () => {
      expect(toChineseNumber(new PreciseNumber('111'))).toBe('壹佰壹拾壹元整');
      expect(toChineseNumber(new PreciseNumber('2222'))).toBe('贰仟贰佰贰拾贰元整');
      expect(toChineseNumber(new PreciseNumber('888.88'))).toBe('捌佰捌拾捌元捌角捌分');
    });

    test('精确计算后的结果', () => {
      const qty = new PreciseNumber('1.1');
      const price = new PreciseNumber('1.1');
      const total = qty.multiply(price);
      expect(toChineseNumber(total)).toBe('壹元贰角壹分');
    });
  });
});
