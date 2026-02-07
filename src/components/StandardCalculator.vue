<template>
  <div class="standard-calculator-page">
    <div class="calculator-container" :class="{ 'desktop-mode': isDesktop }">
      <!-- PC 模式左侧历史记录区域 -->
      <div v-if="isDesktop" class="history-sidebar">
        <div class="history-sidebar-header">
          <div class="text-subtitle2">计算历史</div>
          <q-btn flat dense size="sm" icon="clear" @click="clearHistory">
            <q-tooltip>清空历史</q-tooltip>
          </q-btn>
        </div>
        <div class="history-sidebar-content" ref="historyDisplayRef">
          <div v-if="history.length === 0" class="history-sidebar-empty">暂无历史记录</div>
          <div v-else v-for="(item, index) in history" :key="index" class="history-sidebar-item">
            <div class="history-sidebar-expression">{{ item.expression }}</div>
            <div class="history-sidebar-result">{{ item.result }}</div>
          </div>
        </div>
      </div>

      <!-- 计算器主体（显示屏+键盘） -->
      <div class="calculator-body">
        <!-- 显示屏区域 -->
        <div class="display-area">
          <q-card bordered class="display-card">
            <q-card-section class="display-section">
              <!-- 模式指示器 -->
              <div class="display-indicators">
                <div class="indicators-left">
                  <span v-if="shiftMode" class="indicator-badge shift-badge">SHIFT</span>
                  <span class="indicator-badge">{{ angleMode }}</span>
                  <span v-if="financialMode" class="indicator-badge financial-badge">金融</span>
                  <span v-if="hasError" class="indicator-badge error-badge">ERROR</span>
                </div>
                <div class="indicators-right">
                  <q-btn
                    flat
                    dense
                    size="sm"
                    padding="none xs"
                    class="mode-toggle-btn"
                    @click="toggleFinancialMode"
                  >
                    {{ financialMode ? '普通' : '金融' }}
                  </q-btn>
                  <q-btn
                    v-if="history.length > 0"
                    flat
                    dense
                    size="sm"
                    padding="none xs"
                    class="history-clear-btn"
                    @click="clearHistory"
                  >
                    清除历史
                  </q-btn>
                </div>
              </div>

              <!-- 历史记录显示区（最多4条） -->
              <div class="history-display" ref="historyDisplayRefMobile">
                <div v-for="(item, index) in displayHistory" :key="index" class="history-item">
                  <div class="history-expression">{{ item.expression }}</div>
                  <div class="history-result">{{ item.result }}</div>
                </div>
              </div>

              <!-- 当前表达式显示 -->
              <div class="current-expression" ref="expressionRef" @click="handleExpressionClick">
                <template v-if="displayChars.length === 0">
                  <span class="cursor">|</span>
                  <span class="placeholder">0</span>
                </template>
                <template v-else>
                  <template v-for="(char, index) in displayChars" :key="index">
                    <span v-if="index === cursorPosition" class="cursor">|</span>
                    <span
                      :class="{
                        'char-before-cursor': index < cursorPosition,
                        'char-after-cursor': index >= cursorPosition,
                      }"
                      >{{ char }}</span
                    >
                  </template>
                  <span v-if="cursorPosition === displayChars.length" class="cursor">|</span>
                </template>
              </div>

              <!-- 当前结果显示 -->
              <div class="current-result" :class="{ 'is-hidden': displayResult === '0' }">
                {{ displayResult }}
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- 键盘区域 -->
        <div class="keypad-area">
          <q-card bordered class="full-height">
            <q-card-section class="keypad-section">
              <div class="calculator-keypad">
                <!-- 第一行: SHIFT, DEG/RAD, DEL, () -->
                <q-btn
                  class="calc-btn btn-shift"
                  :class="{ 'btn-shift-active': shiftMode }"
                  outline
                  @click="toggleShift"
                >
                  <div class="btn-label-main">SHIFT</div>
                </q-btn>
                <q-btn class="calc-btn" outline color="primary" @click="handleAngleMode">
                  <div class="btn-label-main">{{ shiftMode ? 'DRG►' : angleMode }}</div>
                </q-btn>
                <q-btn class="calc-btn btn-delete" outline color="orange" @click="handleDelete">
                  <div class="btn-label-main">{{ shiftMode ? 'AC' : 'DEL' }}</div>
                  <div class="btn-label-sub">{{ shiftMode ? 'DEL' : 'AC' }}</div>
                </q-btn>
                <q-btn class="calc-btn" outline color="grey-7" @click="handleInput('(')">
                  <div class="btn-label-main">(</div>
                  <div class="btn-label-sub">{</div>
                </q-btn>

                <!-- 第二行: ), sin, cos, tan -->
                <q-btn class="calc-btn" outline color="grey-7" @click="handleInput(')')">
                  <div class="btn-label-main">)</div>
                  <div class="btn-label-sub">}</div>
                </q-btn>
                <q-btn class="calc-btn" outline @click="handleSin">
                  <div class="btn-label-main">{{ shiftMode ? 'sin⁻¹' : 'sin' }}</div>
                  <div class="btn-label-sub">{{ shiftMode ? 'sin' : 'sin⁻¹' }}</div>
                </q-btn>
                <q-btn class="calc-btn" outline @click="handleCos">
                  <div class="btn-label-main">{{ shiftMode ? 'cos⁻¹' : 'cos' }}</div>
                  <div class="btn-label-sub">{{ shiftMode ? 'cos' : 'cos⁻¹' }}</div>
                </q-btn>
                <q-btn class="calc-btn" outline @click="handleTan">
                  <div class="btn-label-main">{{ shiftMode ? 'tan⁻¹' : 'tan' }}</div>
                  <div class="btn-label-sub">{{ shiftMode ? 'tan' : 'tan⁻¹' }}</div>
                </q-btn>

                <!-- 第三行: π, log, √, x² -->
                <q-btn class="calc-btn" outline @click="handlePiOrE">
                  <div class="btn-label-main">{{ shiftMode ? 'e' : 'π' }}</div>
                  <div class="btn-label-sub">{{ shiftMode ? 'π' : 'e' }}</div>
                </q-btn>
                <q-btn class="calc-btn" outline @click="handleLogOrExp">
                  <div class="btn-label-main">{{ shiftMode ? 'eˣ' : 'log' }}</div>
                  <div class="btn-label-sub">{{ shiftMode ? 'log' : 'eˣ' }}</div>
                </q-btn>
                <q-btn class="calc-btn" outline @click="handleSqrtOrCube">
                  <div class="btn-label-main">{{ shiftMode ? '³√' : '√' }}</div>
                  <div class="btn-label-sub">{{ shiftMode ? '√' : '³√' }}</div>
                </q-btn>
                <q-btn class="calc-btn" outline @click="handleSquareOrPower">
                  <div class="btn-label-main">{{ shiftMode ? 'x^' : 'x²' }}</div>
                  <div class="btn-label-sub">{{ shiftMode ? '∧' : '^' }}</div>
                </q-btn>

                <!-- 第四行: 7, 8, 9, ÷ -->
                <q-btn
                  class="calc-btn btn-digit"
                  color="grey-7"
                  label="7"
                  @click="handleInput('7')"
                />
                <q-btn
                  class="calc-btn btn-digit"
                  color="grey-7"
                  label="8"
                  @click="handleInput('8')"
                />
                <q-btn
                  class="calc-btn btn-digit"
                  color="grey-7"
                  label="9"
                  @click="handleInput('9')"
                />
                <q-btn
                  class="calc-btn"
                  outline
                  color="primary"
                  label="÷"
                  @click="handleInput('/')"
                />

                <!-- 第五行: 4, 5, 6, × -->
                <q-btn
                  class="calc-btn btn-digit"
                  color="grey-7"
                  label="4"
                  @click="handleInput('4')"
                />
                <q-btn
                  class="calc-btn btn-digit"
                  color="grey-7"
                  label="5"
                  @click="handleInput('5')"
                />
                <q-btn
                  class="calc-btn btn-digit"
                  color="grey-7"
                  label="6"
                  @click="handleInput('6')"
                />
                <q-btn
                  class="calc-btn"
                  outline
                  color="primary"
                  label="×"
                  @click="handleInput('*')"
                />

                <!-- 第六行: 1, 2, 3, - -->
                <q-btn
                  class="calc-btn btn-digit"
                  color="grey-7"
                  label="1"
                  @click="handleInput('1')"
                />
                <q-btn
                  class="calc-btn btn-digit"
                  color="grey-7"
                  label="2"
                  @click="handleInput('2')"
                />
                <q-btn
                  class="calc-btn btn-digit"
                  color="grey-7"
                  label="3"
                  @click="handleInput('3')"
                />
                <q-btn
                  class="calc-btn"
                  outline
                  color="primary"
                  label="-"
                  @click="handleInput('-')"
                />

                <!-- 第七行: 0, ., EXP, + -->
                <q-btn
                  class="calc-btn btn-digit"
                  color="grey-7"
                  label="0"
                  @click="handleInput('0')"
                />
                <q-btn
                  class="calc-btn"
                  outline
                  color="grey-7"
                  label="."
                  @click="handleInput('.')"
                />
                <q-btn class="calc-btn" outline @click="handleExp">
                  <div class="btn-label-main">EXP</div>
                </q-btn>
                <q-btn
                  class="calc-btn"
                  outline
                  color="primary"
                  label="+"
                  @click="handleInput('+')"
                />

                <!-- 第八行: ◀, ▶, ln, = -->
                <q-btn class="calc-btn" outline @click="moveCursor('left')">
                  <div class="btn-label-main">◀</div>
                </q-btn>
                <q-btn class="calc-btn" outline @click="moveCursor('right')">
                  <div class="btn-label-main">▶</div>
                </q-btn>
                <q-btn class="calc-btn" outline @click="handleLnOrFactorial">
                  <div class="btn-label-main">{{ shiftMode ? 'x!' : 'ln' }}</div>
                  <div class="btn-label-sub">{{ shiftMode ? 'ln' : 'x!' }}</div>
                </q-btn>
                <q-btn class="calc-btn btn-equals" color="primary" label="=" @click="calculate" />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { evaluate, format } from 'mathjs';
import { useQuasar } from 'quasar';
import { evaluateFinancial, formatFinancialResult } from 'utils/financialMath';
import { useStorageStore, type CalcState, type HistoryItem } from 'stores/storage-store';

const $q = useQuasar();
const storage = useStorageStore();
const MAX_HISTORY = 20;

// 状态管理
const expression = ref('');
const displayResult = ref('0');
const lastAnswer = ref(0);
const shiftMode = ref(false);
const angleMode = ref<'DEG' | 'RAD'>('DEG');
const hasError = ref(false);
const cursorPosition = ref(0);
const financialMode = ref(true); // 默认开启金融模式
const expressionRef = ref<HTMLElement | null>(null);
const history = ref<HistoryItem[]>([]);
const historyDisplayRef = ref<HTMLDivElement | null>(null);
const historyDisplayRefMobile = ref<HTMLDivElement | null>(null);

// 检测是否为桌面模式
const isDesktop = computed(() => $q.screen.gt.md);

// 显示字符数组（用于光标控制）
const displayChars = computed(() => {
  return expression.value.split('');
});

// 显示历史记录（最多显示4条）
const displayHistory = computed(() => {
  return history.value.slice(-4);
});

// 切换金融模式
function toggleFinancialMode() {
  financialMode.value = !financialMode.value;
  storage.setFinancialMode(financialMode.value);
}

// 清除历史记录
function clearHistory() {
  history.value = [];
}

function scrollHistoryToBottom() {
  void nextTick(() => {
    // PC 模式：滚动左侧历史记录区域
    if (isDesktop.value && historyDisplayRef.value) {
      historyDisplayRef.value.scrollTop = historyDisplayRef.value.scrollHeight;
    }
    // 移动模式：滚动显示屏内的历史记录区域
    if (!isDesktop.value && historyDisplayRefMobile.value) {
      historyDisplayRefMobile.value.scrollTop = historyDisplayRefMobile.value.scrollHeight;
    }
  });
}

// 格式化显示结果
function formatDisplayResult(value: number): string {
  if (hasError.value) return 'Syntax Error';
  if (!isFinite(value)) return 'Error';
  if (Number.isNaN(value)) return 'NaN';

  // 尝试格式化为可读格式
  try {
    const formatted = format(value, { precision: 10, notation: 'auto' });
    return formatted;
  } catch {
    return String(value);
  }
}

// 计算表达式
function calculate() {
  if (!expression.value.trim()) {
    return;
  }

  const originalExpression = expression.value;

  try {
    let result: number;

    if (financialMode.value) {
      // 金融模式：使用高精度计算模块
      const evalExpression = expression.value
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'pi')
        .replace(/ANS/g, String(lastAnswer.value))
        .replace(/ln\(/g, 'ln('); // 保持 ln 为 ln

      const resultStr = evaluateFinancial(evalExpression, angleMode.value);
      result = parseFloat(resultStr);
      displayResult.value = formatFinancialResult(resultStr);
      hasError.value = false;

      // 添加到历史记录（限制数量）
      history.value.push({
        expression: originalExpression,
        result: displayResult.value,
      });
      if (history.value.length > MAX_HISTORY) {
        history.value.shift();
      }
      scrollHistoryToBottom();

      // 清空表达式，准备下次计算
      expression.value = '';
      cursorPosition.value = 0;

      // SHIFT 模式自动关闭
      shiftMode.value = false;
      return;
    } else {
      // 普通模式：使用 mathjs（支持三角函数等高级功能）
      let evalExpression = expression.value
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'pi')
        .replace(/ANS/g, String(lastAnswer.value))
        .replace(/ln\(/g, 'log(');

      // 添加阶乘函数
      evalExpression = evalExpression.replace(/factorial\(([^)]+)\)/g, 'factorial($1)');

      // 处理角度模式 - 转换三角函数输入
      if (angleMode.value === 'DEG') {
        evalExpression = evalExpression.replace(/sin\(([^)]+)\)/g, 'sin(($1) * pi / 180)');
        evalExpression = evalExpression.replace(/cos\(([^)]+)\)/g, 'cos(($1) * pi / 180)');
        evalExpression = evalExpression.replace(/tan\(([^)]+)\)/g, 'tan(($1) * pi / 180)');
        evalExpression = evalExpression.replace(/asin\(([^)]+)\)/g, 'asin($1) * 180 / pi');
        evalExpression = evalExpression.replace(/acos\(([^)]+)\)/g, 'acos($1) * 180 / pi');
        evalExpression = evalExpression.replace(/atan\(([^)]+)\)/g, 'atan($1) * 180 / pi');
      }

      const factorial = (n: number) => {
        if (n < 0) return NaN;
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
          result *= i;
        }
        return result;
      };

      const cbrt = (n: number) => {
        if (n < 0) return -Math.pow(-n, 1 / 3);
        return Math.pow(n, 1 / 3);
      };

      const evalResult = evaluate(evalExpression, { factorial, cbrt });
      if (typeof evalResult === 'number') {
        result = evalResult;
      } else {
        throw new Error('计算错误');
      }
    }

    lastAnswer.value = result;
    const formattedResult = formatDisplayResult(result);
    displayResult.value = formattedResult;
    hasError.value = false;

    // 添加到历史记录（限制数量）
    history.value.push({
      expression: originalExpression,
      result: formattedResult,
    });
    if (history.value.length > MAX_HISTORY) {
      history.value.shift();
    }
    scrollHistoryToBottom();

    // 清空表达式，准备下次计算
    expression.value = '';
    cursorPosition.value = 0;
  } catch {
    displayResult.value = 'Syntax Error';
    hasError.value = true;
  }

  // SHIFT 模式自动关闭
  shiftMode.value = false;
}

// 处理输入
function handleInput(value: string) {
  hasError.value = false;

  // 如果当前显示结果，且输入的是数字或函数，则清空表达式
  if (expression.value === '' && displayResult.value !== '0' && !hasError.value) {
    if (/^\d$/.test(value) || value === '.' || value === '(' || value === 'π' || value === 'e') {
      expression.value = '';
      displayResult.value = '0';
      cursorPosition.value = 0;
    } else if (/[+\-×÷^]/.test(value)) {
      // 如果是运算符，使用上一次的结果
      expression.value = `ANS${value}`;
      cursorPosition.value = expression.value.length;
      shiftMode.value = false;
      return;
    }
  }

  // 在光标位置插入字符
  const chars = expression.value.split('');
  chars.splice(cursorPosition.value, 0, value);
  expression.value = chars.join('');
  cursorPosition.value = Math.min(cursorPosition.value + 1, expression.value.length);

  // SHIFT 模式下，输入后自动关闭
  if (shiftMode.value) {
    shiftMode.value = false;
  }
}

// 处理表达式点击（设置光标位置）
function handleExpressionClick(event: MouseEvent) {
  if (expressionRef.value) {
    const rect = expressionRef.value.getBoundingClientRect();
    const clickX = event.clientX - rect.left;

    // 估算点击位置对应的字符索引
    const charWidth = rect.width / Math.max(displayChars.value.length, 1);
    const estimatedIndex = Math.round(clickX / charWidth);

    cursorPosition.value = Math.max(0, Math.min(estimatedIndex, displayChars.value.length));
  }
}

// 处理删除
function handleDelete() {
  if (shiftMode.value) {
    // AC: 全部清除
    expression.value = '';
    displayResult.value = '0';
    lastAnswer.value = 0;
    hasError.value = false;
    shiftMode.value = false;
    cursorPosition.value = 0;
  } else {
    // DEL: 删除光标位置的字符
    if (expression.value.length > 0 && cursorPosition.value > 0) {
      const chars = expression.value.split('');
      chars.splice(cursorPosition.value - 1, 1);
      expression.value = chars.join('');
      cursorPosition.value--;
    } else {
      displayResult.value = '0';
      hasError.value = false;
    }
  }
}

// 光标移动控制
function moveCursor(direction: 'left' | 'right' | 'home' | 'end') {
  switch (direction) {
    case 'left':
      cursorPosition.value = Math.max(0, cursorPosition.value - 1);
      break;
    case 'right':
      cursorPosition.value = Math.min(displayChars.value.length, cursorPosition.value + 1);
      break;
    case 'home':
      cursorPosition.value = 0;
      break;
    case 'end':
      cursorPosition.value = displayChars.value.length;
      break;
  }
}

// 切换 SHIFT 模式
function toggleShift() {
  shiftMode.value = !shiftMode.value;
}

// 切换角度模式
function handleAngleMode() {
  if (shiftMode.value) {
    // DRG► 功能可以用来转换角度单位，这里简化为切换模式
    angleMode.value = angleMode.value === 'DEG' ? 'RAD' : 'DEG';
    shiftMode.value = false;
  } else {
    angleMode.value = angleMode.value === 'DEG' ? 'RAD' : 'DEG';
  }
}

// 处理平方根/立方根
function handleSqrtOrCube() {
  if (shiftMode.value) {
    handleInput('cbrt(');
  } else {
    handleInput('sqrt(');
  }
}

// 处理平方/幂
function handleSquareOrPower() {
  if (shiftMode.value) {
    handleInput('^');
  } else {
    handleInput('^2');
  }
}

// 处理正弦
function handleSin() {
  if (shiftMode.value) {
    handleInput('asin(');
  } else {
    handleInput('sin(');
  }
}

// 处理余弦
function handleCos() {
  if (shiftMode.value) {
    handleInput('acos(');
  } else {
    handleInput('cos(');
  }
}

// 处理正切
function handleTan() {
  if (shiftMode.value) {
    handleInput('atan(');
  } else {
    handleInput('tan(');
  }
}

// 处理π/e切换
function handlePiOrE() {
  if (shiftMode.value) {
    handleInput('e');
  } else {
    handleInput('π');
  }
}

// 处理log/e的幂
function handleLogOrExp() {
  if (shiftMode.value) {
    handleInput('e^');
  } else {
    handleInput('log(');
  }
}

// 处理科学计数法
function handleExp() {
  handleInput('E');
}

// 处理ln/阶乘
function handleLnOrFactorial() {
  if (shiftMode.value) {
    handleInput('factorial(');
  } else {
    handleInput('ln(');
  }
}

// 键盘事件处理
function handleKeyboard(event: KeyboardEvent) {
  const key = event.key;

  // 数字键
  if (/^\d$/.test(key)) {
    event.preventDefault();
    handleInput(key);
    return;
  }

  // 小数点
  if (key === '.' || key === ',') {
    event.preventDefault();
    handleInput('.');
    return;
  }

  // 运算符
  if (key === '+') {
    event.preventDefault();
    handleInput('+');
    return;
  }
  if (key === '-') {
    event.preventDefault();
    handleInput('-');
    return;
  }
  if (key === '*') {
    event.preventDefault();
    handleInput('*');
    return;
  }
  if (key === '/') {
    event.preventDefault();
    event.stopPropagation();
    handleInput('/');
    return;
  }

  // 括号
  if (key === '(') {
    event.preventDefault();
    handleInput('(');
    return;
  }
  if (key === ')') {
    event.preventDefault();
    handleInput(')');
    return;
  }

  // 等号
  if (key === 'Enter' || key === '=') {
    event.preventDefault();
    calculate();
    return;
  }

  // 删除
  if (key === 'Escape') {
    event.preventDefault();
    if (shiftMode.value) {
      handleDelete();
    } else {
      // ESC 做全清除
      expression.value = '';
      displayResult.value = '0';
      hasError.value = false;
    }
    return;
  }

  // 退格
  if (key === 'Backspace') {
    event.preventDefault();
    // 删除光标前的字符
    if (expression.value.length > 0 && cursorPosition.value > 0) {
      const chars = expression.value.split('');
      chars.splice(cursorPosition.value - 1, 1);
      expression.value = chars.join('');
      cursorPosition.value--;
    } else {
      displayResult.value = '0';
      hasError.value = false;
    }
    return;
  }

  // Delete键删除光标后的字符
  if (key === 'Delete') {
    event.preventDefault();
    if (expression.value.length > 0 && cursorPosition.value < expression.value.length) {
      const chars = expression.value.split('');
      chars.splice(cursorPosition.value, 1);
      expression.value = chars.join('');
    }
    return;
  }

  // 幂运算
  if (key === '^') {
    event.preventDefault();
    handleInput('^');
    return;
  }

  // 光标控制
  if (key === 'ArrowLeft') {
    event.preventDefault();
    moveCursor('left');
    return;
  }
  if (key === 'ArrowRight') {
    event.preventDefault();
    moveCursor('right');
    return;
  }
  if (key === 'Home') {
    event.preventDefault();
    moveCursor('home');
    return;
  }
  if (key === 'End') {
    event.preventDefault();
    moveCursor('end');
    return;
  }
}

// 保存状态
function saveState() {
  const state: CalcState = {
    expression: expression.value,
    displayResult: displayResult.value,
    lastAnswer: lastAnswer.value,
    angleMode: angleMode.value,
    cursorPosition: cursorPosition.value,
    history: history.value.slice(-10), // 只保存最近10条
  };
  storage.setCalcState(state);
}

// 恢复状态
function restoreState() {
  const state = storage.getCalcState();
  if (state) {
    expression.value = state.expression || '';
    displayResult.value = state.displayResult || '0';
    lastAnswer.value = state.lastAnswer || 0;
    angleMode.value = state.angleMode || 'DEG';
    cursorPosition.value = state.cursorPosition ?? 0;
    history.value = state.history || [];
  }

  const storedFinancial = storage.getFinancialMode();
  if (storedFinancial !== null) {
    financialMode.value = storedFinancial;
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyboard, true);
  restoreState();
  scrollHistoryToBottom();
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyboard, true);
  saveState();
});

// 监听状态变化并自动保存
watch(
  [expression, displayResult, lastAnswer, angleMode, cursorPosition, history],
  () => {
    saveState();
  },
  { deep: true },
);
</script>

<style scoped>
.standard-calculator-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 12px;
  box-sizing: border-box;
}

.calculator-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

/* PC 模式布局 */
.calculator-container.desktop-mode {
  max-width: 1100px;
  flex-direction: row;
  align-items: flex-start;
  gap: 16px;
}

/* 计算器主体（显示屏+键盘） - 移动端和PC端都使用 */
.calculator-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  /* 限制最大高度，用于PC模式历史记录区域对齐 */
  max-height: calc(260px + 12px + 400px);
}

/* PC 模式左侧历史记录区域 */
.history-sidebar {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  /* 高度与计算器主体一致 */
  max-height: calc(260px + 12px + 400px);
}

.history-sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px 8px 0 0;
  background: var(--q-background);
  border: 1px solid;
  border-color: rgba(255, 255, 255, 0.1);
  border-bottom: none;
}

.body--light .history-sidebar-header {
  border-color: rgba(0, 0, 0, 0.1);
}

.history-sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  background: var(--q-background);
  border: 1px solid;
  border-color: rgba(255, 255, 255, 0.1);
  border-radius: 0 0 8px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.body--light .history-sidebar-content {
  border-color: rgba(0, 0, 0, 0.1);
}

.history-sidebar-item {
  padding: 8px 12px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.body--light .history-sidebar-item {
  background: rgba(0, 0, 0, 0.03);
}

.history-sidebar-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.body--light .history-sidebar-item:hover {
  background: rgba(0, 0, 0, 0.06);
}

.history-sidebar-expression {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 4px;
}

.body--light .history-sidebar-expression {
  color: rgba(0, 0, 0, 0.5);
}

.history-sidebar-result {
  font-family: 'Courier New', monospace;
  font-size: 18px;
  font-weight: 600;
  color: var(--q-primary);
  text-align: right;
}

.history-sidebar-empty {
  padding: 24px;
  text-align: center;
  color: rgba(255, 255, 255, 0.4);
  font-size: 14px;
}

.body--light .history-sidebar-empty {
  color: rgba(0, 0, 0, 0.4);
}

.display-area {
  flex: 0 0 auto;
}

.keypad-area {
  flex: 1;
  min-height: 400px;
}

.display-card {
  height: 100%;
}

.display-section {
  height: 260px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  font-family: 'Courier New', monospace;
  padding: 16px;
  padding-top: 12px;
}

.display-indicators {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  height: 20px;
  flex-shrink: 0;
}

.indicators-left {
  display: flex;
  gap: 8px;
  align-items: center;
}

.indicators-right {
  display: flex;
  gap: 8px;
  align-items: center;
}

.history-clear-btn {
  margin-left: auto;
  font-size: 10px;
  min-height: auto;
}

.indicator-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
}

.body--light .indicator-badge {
  background: rgba(0, 0, 0, 0.05);
  color: rgba(0, 0, 0, 0.5);
}

.shift-badge {
  background: rgba(255, 152, 0, 0.3) !important;
  color: #ff9800 !important;
}

.error-badge {
  background: rgba(244, 67, 54, 0.3) !important;
  color: #f44336 !important;
}

.financial-badge {
  background: rgba(76, 175, 80, 0.3) !important;
  color: #4caf50 !important;
}

.mode-toggle-btn {
  font-size: 10px;
  min-height: auto;
  padding: 2px 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
}

.body--light .mode-toggle-btn {
  background: rgba(0, 0, 0, 0.05);
  color: rgba(0, 0, 0, 0.5);
}

/* 历史记录显示（移动端，在显示屏内） */
.history-display {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
  min-height: 0;
}

.history-display::-webkit-scrollbar {
  width: 4px;
}

.history-display::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.history-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.body--light .history-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.history-expression {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.5);
  font-family: 'Courier New', monospace;
}

.body--light .history-expression {
  color: rgba(0, 0, 0, 0.4);
}

.history-result {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.7);
  font-family: 'Courier New', monospace;
  font-weight: 500;
  text-align: right;
}

.body--light .history-result {
  color: rgba(0, 0, 0, 0.6);
}

/* 当前表达式 */
.current-expression {
  font-family: 'Courier New', monospace;
  min-height: 36px;
  font-size: 28px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  cursor: text;
  padding: 4px 0;
  color: rgba(255, 255, 255, 0.9);
  word-break: break-all;
}

.body--light .current-expression {
  color: rgba(0, 0, 0, 0.85);
}

.current-expression .placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.body--light .current-expression .placeholder {
  color: rgba(0, 0, 0, 0.3);
}

.cursor {
  color: var(--q-primary) !important;
  animation: blink 1s step-end infinite;
  font-weight: bold;
  margin: 0 -1px;
}

@keyframes blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}

.char-before-cursor {
  color: rgba(255, 255, 255, 0.9);
}

.body--light .char-before-cursor {
  color: rgba(0, 0, 0, 0.85);
}

.char-after-cursor {
  color: rgba(255, 255, 255, 0.6);
}

.body--light .char-after-cursor {
  color: rgba(0, 0, 0, 0.5);
}

/* 当前结果 */
.current-result {
  font-family: 'Courier New', monospace;
  font-size: 32px;
  font-weight: 600;
  color: var(--q-primary);
  text-align: right;
  padding: 4px 0;
  word-break: break-all;
  min-height: 40px;
}

.current-result.is-hidden {
  visibility: hidden;
}

.body--light .current-result {
  color: var(--q-primary);
}

.keypad-section {
  padding: 12px;
  height: 100%;
}

.calculator-keypad {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(8, 1fr);
  gap: 8px;
  height: 100%;
}

/* 按键标签样式 */
.calc-btn {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4px 8px !important;
  min-height: 0;
}

.btn-label-main {
  font-size: 16px;
  font-weight: 500;
  line-height: 1.2;
}

.btn-label-sub {
  font-size: 10px;
  color: var(--q-primary);
  opacity: 0.7;
  line-height: 1;
  margin-top: 2px;
}

.body--dark .btn-label-sub {
  color: rgba(255, 255, 255, 0.5);
}

.btn-equals {
  grid-column: span 1;
}

.calc-btn {
  font-size: 16px;
  border-radius: 6px;
  text-transform: none;
  font-family: 'Roboto', sans-serif;
  letter-spacing: 0.5px;
}

.btn-digit {
  font-size: 18px;
  font-weight: 500;
}

.btn-shift .btn-label-main {
  font-size: 14px;
  font-weight: 600;
}

.btn-shift-active {
  background-color: var(--q-warning) !important;
  color: white !important;
  border-color: var(--q-warning) !important;
}

.btn-delete .btn-label-main {
  font-size: 14px;
  font-weight: 600;
}

/* Dark mode 适配 */
.body--dark .calc-btn.color-grey-7 {
  background-color: #424242;
  color: white;
}

/* Casio 风格配色方案 */
.body--light .calc-btn {
  border-color: #d0d0d0;
}

.body--light .btn-digit {
  background-color: #f5f5f5;
  border-color: #e0e0e0;
}

.body--light .btn-digit:hover {
  background-color: #eeeeee;
}

/* 响应式调整 */
@media (max-width: 400px) {
  .calculator-container {
    padding: 8px;
    gap: 8px;
  }

  .display-section {
    height: 220px;
    padding: 12px;
    padding-top: 28px;
  }

  .calculator-keypad {
    gap: 6px;
  }

  .btn-digit {
    font-size: 16px;
  }

  .btn-label-main {
    font-size: 14px;
  }

  .btn-label-sub {
    font-size: 9px;
  }

  .history-expression {
    font-size: 14px;
  }

  .history-result {
    font-size: 16px;
  }

  .current-expression {
    font-size: 24px;
  }

  .current-result {
    font-size: 28px;
  }
}
</style>
