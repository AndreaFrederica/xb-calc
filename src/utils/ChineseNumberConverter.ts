import type { PreciseNumber } from './PreciseNumber';

/**
 * 将数字转换为中文大写/小写金额
 * @param value 数字值
 * @param numberCase 大写(upper)或小写(lower)
 * @returns 中文金额字符串
 */
export function toChineseNumber(value: PreciseNumber, numberCase: 'upper' | 'lower' = 'upper'): string {
  const absValue = value.abs();
  const integerStr = absValue.getIntegerPart();
  const decimalStr = absValue.getDecimalPart();

  // 将整数部分转换为数字数组（从低位到高位）
  const integerDigits = integerStr.split('').reverse().map(Number);
  // 获取小数部分的前两位（角分）
  const decimalDigits = decimalStr.padEnd(2, '0').slice(0, 2).split('').map(Number);

  const chineseDigitsUpper = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  const chineseDigitsLower = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  const chineseDigits = numberCase === 'upper' ? chineseDigitsUpper : chineseDigitsLower;

  function convertInteger(digits: number[]): string {
    if (digits.length === 0 || digits.every((d) => d === 0)) return '零';

    // 按四位一组处理（万、亿分组）
    const groups: string[] = [];
    for (let groupIndex = 0; groupIndex < Math.ceil(digits.length / 4); groupIndex++) {
      const groupDigits = digits.slice(groupIndex * 4, Math.min((groupIndex + 1) * 4, digits.length));
      const groupResult = convertGroup(groupDigits);
      if (groupResult !== '') {
        // 添加万、亿单位
        if (groupIndex === 1) {
          groups.push(groupResult + '万');
        } else if (groupIndex === 2) {
          groups.push(groupResult + '亿');
        } else {
          groups.push(groupResult);
        }
      }
    }

    // 从高位到低位拼接
    let result = groups.reverse().join('');

    // 处理特殊情况：如果是"万万"则简化为"亿"
    result = result.replace(/万万+/g, (match) => {
      const count = match.length / 2;
      if (count >= 2) return '亿' + (count > 2 ? match.slice(4) : '');
      return match;
    });

    // 去除连续的零
    result = result.replace(/零+/g, '零');
    // 去除末尾的零
    result = result.replace(/零+$/, '');
    // 去除单位前的零（如"零万"->"万"，但保留"零元"）
    result = result.replace(/零([万亿])/g, '$1');
    // 如果结果为空，返回零
    if (result === '') return '零';

    return result;
  }

  function convertGroup(digits: number[]): string {
    const units = numberCase === 'upper' ? ['', '拾', '佰', '仟'] : ['', '十', '百', '千'];
    let result = '';
    let lastNonZero = false;

    for (let i = 0; i < digits.length; i++) {
      const digit = digits[i];
      if (digit !== 0) {
        const digitKey = digit as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
        const unitChar = units[i] ?? '';
        result = chineseDigits[digitKey] + unitChar + result;
        lastNonZero = true;
      } else if (lastNonZero && i < digits.length - 1) {
        // 在非零位之后且不是最后一位时添加零
        result = chineseDigits[0] + result;
        lastNonZero = false;
      }
    }

    return result;
  }

  let chineseInteger = convertInteger(integerDigits);
  if (chineseInteger === '' || chineseInteger === '零') {
    chineseInteger = '零';
  }

  // 元也需要大小写
  const yuanUnit = numberCase === 'upper' ? '元' : '圆';
  let result = chineseInteger + yuanUnit;

  const jiao = decimalDigits[0] ?? 0;
  const fen = decimalDigits[1] ?? 0;

  if (jiao > 0 || fen > 0) {
    // 角分也需要大小写
    const jiaoUnit = numberCase === 'upper' ? '角' : '毛';
    const fenUnit = '分'; // 分没有大小写区别

    // 如果整数部分不是零，且有分但没有角，需要加零
    if (jiao === 0 && fen > 0 && chineseInteger !== '零') {
      result += chineseDigits[0];
    }

    if (jiao > 0) {
      const jiaoKey = jiao as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
      result += chineseDigits[jiaoKey] + jiaoUnit;
    }
    if (fen > 0) {
      const fenKey = fen as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
      result += chineseDigits[fenKey] + fenUnit;
    }
  } else {
    result += numberCase === 'upper' ? '整' : '正';
  }

  if (value.isNegative()) {
    result = '负' + result;
  }

  return result;
}
