/**
 * 无限精度小数类
 * 用于精确的财务计算，避免 JavaScript 浮点数精度问题
 *
 * 存储格式：字符串形式，如 "123.456" 或 "-123.456"
 * 不包含前导0（除了0本身）
 */
export class PreciseNumber {
  private value: string;

  constructor(value: string | number = '0') {
    if (typeof value === 'number') {
      this.value = this.fromNumber(value);
    } else {
      this.value = this.normalize(value);
    }
  }

  /**
   * 标准化数字字符串
   * - 移除前导0
   * - 处理符号
   * - 规范化小数点
   * - 去除小数末尾的零
   */
  private normalize(str: string): string {
    const trimmed = str.trim();
    if (!trimmed) return '0';

    let sign = '';
    let num = trimmed;

    if (num.startsWith('-')) {
      sign = '-';
      num = num.slice(1);
    } else if (num.startsWith('+')) {
      num = num.slice(1);
    }

    // 移除前导0
    num = num.replace(/^0+(\d)/, '$1');

    // 处理空的情况（比如只有0）
    if (!num || num === '.') return '0';

    // 分割整数和小数部分
    const parts = num.split('.');
    if (parts.length === 1) {
      return sign + parts[0];
    }

    const integer = parts[0] || '0';
    const decimal = parts[1] || '';

    // 移除整数部分的前导0
    const normalizedInteger = integer.replace(/^0+/, '') || '0';

    if (decimal === '') {
      return sign + normalizedInteger;
    }

    // 去除小数末尾的零
    const trimmedDecimal = decimal.replace(/0+$/, '');

    // 如果小数部分全为零，只返回整数部分
    if (trimmedDecimal === '') {
      return sign + normalizedInteger;
    }

    return sign + normalizedInteger + '.' + trimmedDecimal;
  }

  /**
   * 从数字转换为字符串
   */
  private fromNumber(num: number): string {
    if (!isFinite(num)) return '0';

    const str = num.toString();
    // 科学计数法处理
    if (str.includes('e')) {
      // 简单处理：使用足够精度的字符串
      return num.toFixed(50).replace(/^0+/, '').replace(/\.?0+$/, '');
    }
    return this.normalize(str);
  }

  /**
   * 比较两个数的大小
   * @returns 1 表示大于，-1 表示小于，0 表示相等
   */
  compareTo(other: PreciseNumber): number {
    // 比较符号
    const thisSign = this.value.startsWith('-') ? -1 : 1;
    const otherSign = other.value.startsWith('-') ? -1 : 1;
    if (thisSign !== otherSign) {
      return thisSign;
    }

    const thisAbs = this.value.startsWith('-') ? this.value.slice(1) : this.value;
    const otherAbs = other.value.startsWith('-') ? other.value.slice(1) : other.value;

    return this.compareAbsolute(thisAbs, otherAbs) * thisSign;
  }

  /**
   * 比较两个正数的绝对值
   */
  private compareAbsolute(a: string, b: string): number {
    const aParts = a.split('.');
    const bParts = b.split('.');
    const aInt = aParts[0] || '0';
    const bInt = bParts[0] || '0';

    // 比较整数部分长度
    if (aInt.length !== bInt.length) {
      return aInt.length > bInt.length ? 1 : -1;
    }

    // 长度相同，逐位比较
    if (aInt !== bInt) {
      return aInt > bInt ? 1 : -1;
    }

    // 整数部分相同，比较小数部分
    const aDec = aParts.length > 1 ? (aParts[1] ?? '') : '';
    const bDec = bParts.length > 1 ? (bParts[1] ?? '') : '';

    const maxLen = Math.max(aDec.length, bDec.length);
    for (let i = 0; i < maxLen; i++) {
      const aDigit = i < aDec.length ? parseInt((aDec[i] ?? '0'), 10) : 0;
      const bDigit = i < bDec.length ? parseInt((bDec[i] ?? '0'), 10) : 0;
      if (aDigit !== bDigit) {
        return aDigit > bDigit ? 1 : -1;
      }
    }

    return 0;
  }

  /**
   * 加法运算
   */
  add(other: PreciseNumber): PreciseNumber {
    const result = this.addAbsolute(this.value, other.value);
    return new PreciseNumber(result);
  }

  private addAbsolute(a: string, b: string): string {
    const aSign = a.startsWith('-') ? -1 : 1;
    const bSign = b.startsWith('-') ? -1 : 1;
    const aAbs = a.startsWith('-') ? a.slice(1) : a;
    const bAbs = b.startsWith('-') ? b.slice(1) : b;

    if (aSign === bSign) {
      const sum = this.addDecimals(aAbs, bAbs);
      return (aSign < 0 ? '-' : '') + sum;
    } else {
      // 相减，绝对值大的作为符号
      const cmp = this.compareAbsolute(aAbs, bAbs);
      if (cmp === 0) return '0';
      const diff = cmp > 0 ? this.subtractDecimals(aAbs, bAbs) : this.subtractDecimals(bAbs, aAbs);
      return (cmp < 0 ? '-' : '') + diff;
    }
  }

  private addDecimals(a: string, b: string): string {
    const aParts = a.split('.');
    const bParts = b.split('.');
    const aInt = aParts[0] || '0';
    let aDec = aParts.length > 1 ? (aParts[1] ?? '') : '';
    const bInt = bParts[0] || '0';
    let bDec = bParts.length > 1 ? (bParts[1] ?? '') : '';

    // 补齐小数位
    const maxDec = Math.max(aDec.length, bDec.length);
    while (aDec.length < maxDec) aDec += '0';
    while (bDec.length < maxDec) bDec += '0';

    // 加法（从右到左）
    let resultDec = '';
    let carry = 0;
    for (let i = maxDec - 1; i >= 0; i--) {
      const sum = (parseInt((aDec[i] ?? '0'), 10) || 0) + (parseInt((bDec[i] ?? '0'), 10) || 0) + carry;
      resultDec = (sum % 10).toString() + resultDec;
      carry = Math.floor(sum / 10);
    }

    // 整数部分加法
    const sumInt = (parseInt(aInt, 10) || 0) + (parseInt(bInt, 10) || 0) + carry;

    // 去除整数部分前导0
    let resultInt = sumInt.toString();
    if (resultDec !== '') {
      resultInt = resultInt.replace(/^0+/, '') || '0';
    } else {
      resultInt = resultInt.replace(/^0+/, '') || '0';
    }

    return resultDec ? resultInt + '.' + resultDec : resultInt;
  }

  private subtractDecimals(a: string, b: string): string {
    const aParts = a.split('.');
    const bParts = b.split('.');
    const aInt = aParts[0] || '0';
    let aDec = aParts.length > 1 ? (aParts[1] ?? '') : '';
    const bInt = bParts[0] || '0';
    let bDec = bParts.length > 1 ? (bParts[1] ?? '') : '';

    // 补齐小数位
    const maxDec = Math.max(aDec.length, bDec.length);
    while (aDec.length < maxDec) aDec += '0';
    while (bDec.length < maxDec) bDec += '0';

    // 减法（从右到左）
    let resultDec = '';
    let borrow = 0;
    for (let i = maxDec - 1; i >= 0; i--) {
      const aDigit = parseInt((aDec[i] ?? '0'), 10) || 0;
      const bDigit = parseInt((bDec[i] ?? '0'), 10) || 0;
      let diff = aDigit - bDigit - borrow;
      if (diff < 0) {
        diff += 10;
        borrow = 1;
      } else {
        borrow = 0;
      }
      resultDec = diff.toString() + resultDec;
    }

    // 整数部分减法
    const diffInt = (parseInt(aInt, 10) || 0) - borrow - (parseInt(bInt, 10) || 0);

    // 去除前导0
    let resultInt = diffInt.toString();
    if (resultDec !== '') {
      resultInt = resultInt.replace(/^0+/, '') || '0';
    } else {
      resultInt = resultInt.replace(/^0+/, '') || '0';
    }

    return resultDec ? resultInt + '.' + resultDec : resultInt;
  }

  /**
   * 减法运算
   */
  subtract(other: PreciseNumber): PreciseNumber {
    const result = this.subtractAbsolute(this.value, other.value);
    return new PreciseNumber(result);
  }

  private subtractAbsolute(a: string, b: string): string {
    const aSign = a.startsWith('-') ? -1 : 1;
    const bSign = b.startsWith('-') ? -1 : 1;
    const aAbs = a.startsWith('-') ? a.slice(1) : a;
    const bAbs = b.startsWith('-') ? b.slice(1) : b;

    if (aSign === bSign) {
      const cmp = this.compareAbsolute(aAbs, bAbs);
      if (cmp === 0) return '0';
      const diff = cmp > 0 ? this.subtractDecimals(aAbs, bAbs) : this.subtractDecimals(bAbs, aAbs);
      // 符号由被减数的符号决定
      // 如果两个都是正数，结果是大的减小的，符号不变
      // 如果两个都是负数，实际上也是 |a| - |b|，但因为都是负数，结果的符号与被减数相同
      const resultSign = aSign * cmp;
      return resultSign < 0 ? '-' + diff : diff;
    } else {
      // 相加，异号相加等于异号减
      if (aSign < 0) {
        // -a - b = -(a + b)
        return '-' + this.addAbsolute(bAbs, aAbs);
      } else {
        // a - (-b) = a + b
        return this.addAbsolute(aAbs, bAbs);
      }
    }
  }

  /**
   * 乘法运算
   */
  multiply(other: PreciseNumber): PreciseNumber {
    const result = this.multiplyAbsolute(this.value, other.value);
    return new PreciseNumber(result);
  }

  private multiplyAbsolute(a: string, b: string): string {
    const aSign = a.startsWith('-') ? -1 : 1;
    const bSign = b.startsWith('-') ? -1 : 1;
    const aAbs = a.startsWith('-') ? a.slice(1) : a;
    const bAbs = b.startsWith('-') ? b.slice(1) : b;

    const aParts = aAbs.split('.');
    const bParts = bAbs.split('.');
    const aInt = aParts[0] || '0';
    const aDec = aParts.length > 1 ? (aParts[1] ?? '') : '';
    const bInt = bParts[0] || '0';
    const bDec = bParts.length > 1 ? (bParts[1] ?? '') : '';

    // 乘法：aDec 和 bDec 的位数之和作为小数位数
    const aDecLen = aDec.length;
    const bDecLen = bDec.length;
    const resultDecLen = aDecLen + bDecLen;

    // 将两个数合并为整数进行计算
    // 例如: 123.456 * 78.9 = (123456 * 789) / 10^6
    const aCombined = aInt + aDec.padEnd(aDecLen, '0');
    const bCombined = bInt + bDec.padEnd(bDecLen, '0');

    // 使用 BigInt 进行精确计算
    const aNum = aCombined === '0' ? 0n : BigInt(aCombined);
    const bNum = bCombined === '0' ? 0n : BigInt(bCombined);
    const product = aNum * bNum;

    // 转换为字符串
    let productStr = product.toString();

    // 在适当位置插入小数点
    // 如果结果长度小于等于小数位数，需要在前面补0
    if (productStr.length <= resultDecLen) {
      // 例如: 0.1 * 0.2 = 0.02，productStr = "2"，resultDecLen = 2
      // 需要变成 "0.02"
      const padding = '0'.repeat(resultDecLen - productStr.length + 1);
      productStr = padding + productStr;
    }

    // 插入小数点
    const decimalPos = productStr.length - resultDecLen;
    let result: string;
    if (decimalPos <= 0) {
      result = '0.' + '0'.repeat(-decimalPos) + productStr;
    } else {
      result = productStr.slice(0, decimalPos) + '.' + productStr.slice(decimalPos);
    }

    // 去除前导0
    const normalizedResult = this.normalize(result);

    return aSign * bSign < 0 ? '-' + normalizedResult : normalizedResult;
  }

  /**
   * 转换为字符串
   */
  toString(): string {
    return this.value;
  }

  /**
   * 判断是否相等
   */
  equals(other: PreciseNumber): boolean {
    return this.value === other.value;
  }

  /**
   * 判断是否为负数
   */
  isNegative(): boolean {
    return this.value.startsWith('-');
  }

  /**
   * 获取绝对值
   */
  abs(): PreciseNumber {
    return new PreciseNumber(this.value.startsWith('-') ? this.value.slice(1) : this.value);
  }

  /**
   * 判断是否为零
   */
  isZero(): boolean {
    return this.value === '0' || this.value === '-0' || this.value === '0.0' || this.value === '-0.0';
  }

  /**
   * 获取整数部分
   */
  getIntegerPart(): string {
    const parts = this.value.split('.');
    const intPart = parts[0] || '0';
    return this.value.startsWith('-') && intPart !== '0' ? '-' + intPart.replace(/^-/, '') : intPart;
  }

  /**
   * 获取小数部分（不包含小数点）
   */
  getDecimalPart(): string {
    const parts = this.value.split('.');
    return parts.length > 1 ? (parts[1] ?? '') : '';
  }

  /**
   * 格式化为带千位分隔符的字符串
   */
  toFormatted(grouping: '3' | '4' = '3'): string {
    const sign = this.value.startsWith('-') ? '-' : '';
    const unsigned = sign ? this.value.slice(1) : this.value;

    const [integerPartRaw, decimalPartRaw] = unsigned.split('.');
    const integerPart = integerPartRaw ?? '0';

    // 添加千位分隔符
    const groupingRegex = grouping === '4' ? /\B(?=(\d{4})+(?!\d))/g : /\B(?=(\d{3})+(?!\d))/g;
    const formattedInt = integerPart.replace(groupingRegex, ',');

    // 处理小数部分：去掉末尾的0，如果全为0则不显示小数部分
    if (decimalPartRaw !== undefined) {
      const trimmedDecimal = decimalPartRaw.replace(/0+$/, '');
      if (trimmedDecimal) {
        return `${sign}${formattedInt}.${trimmedDecimal}`;
      }
    }

    return `${sign}${formattedInt}`;
  }
}
