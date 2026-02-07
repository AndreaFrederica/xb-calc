# 专一计算器

一个简单实用的数量×单价计算器，支持多账单管理、暗色模式和离线使用。

## 功能特点

- 🧮 **简单计算** - 快速计算数量×单价的总额
- 📊 **多账单管理** - 支持创建多个账单，方便管理不同项目的计算
- 🌙 **暗色模式** - 支持亮色/暗色主题切换，保护眼睛
- 📱 **响应式设计** - 完美适配桌面和移动设备
- 💾 **自动保存** - 数据自动保存到浏览器本地存储
- 📥 **CSV 导入导出** - 支持将账单数据导出为 CSV 文件，或从 CSV 导入
- 🔄 **离线可用** - PWA 应用，支持离线使用
- ⌨️ **快捷键支持** - 支持键盘快捷操作，提高效率

## 安装和使用

### 在线使用

直接访问部署后的网站即可使用，无需安装。

### 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建 PWA 版本
pnpm build:pwa
```

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| `0-9` | 输入数字 |
| `.` 或 `,` | 输入小数点 |
| `Backspace` | 删除最后一个字符 |
| `Delete` | 清空当前单元格 |
| `Enter` | 移动到下一个单元格 |
| `Tab` | 移动到下一个单元格（按住 Shift 反向） |
| `←` `→` | 切换数量/单价字段 |
| `↑` `↓` | 切换行 |

## 技术栈

- [Quasar Framework](https://quasar.dev/) - Vue 3 UI 框架
- [TypeScript](https://www.typescriptlang.org/) - 类型安全
- [Decimal.js](https://github.com/MikeMcl/decimal.js/) - 精确的数字计算
- [Workbox](https://developers.google.com/web/tools/workbox) - PWA 离线缓存

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 许可证

[MPL-2.0](LICENSE)

## 贡献

欢迎提交 Issue 和 Pull Request！
