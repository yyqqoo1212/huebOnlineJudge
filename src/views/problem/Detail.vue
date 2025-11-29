<template>
  <div class="problem-detail">
    <div class="problem-detail-container">
      <!-- 题目信息区域 -->
      <div class="problem-info-section">
        <div class="problem-header">
          <div class="problem-title-row">
            <h1 class="problem-title">{{ problem.title }}</h1>
            <span :class="['difficulty-badge', `difficulty-${getDifficultyClass(problem.difficulty)}`]">
              {{ getDifficultyText(problem.difficulty) }}
            </span>
          </div>
          <div class="problem-meta">
            <div class="meta-item">
              <span class="meta-label">题号：</span>
              <span class="meta-value">{{ problem.id }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">时间限制：</span>
              <span class="meta-value">{{ problem.time_limit }}ms</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">内存限制：</span>
              <span class="meta-value">{{ problem.memory_limit }}MB</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">提交数：</span>
              <span class="meta-value">{{ problem.submissions }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">通过数：</span>
              <span class="meta-value">{{ problem.accepted_count }}</span>
            </div>
            <div class="meta-item" v-if="problem.submissions > 0">
              <span class="meta-label">通过率：</span>
              <span class="meta-value">{{ getPassRate() }}%</span>
            </div>
          </div>
        </div>

        <div class="problem-content">
          <div class="content-section">
            <h2 class="section-title">题目描述</h2>
            <div class="section-content">
              <p v-if="problem.content">{{ problem.content }}</p>
              <p v-else class="placeholder-text">题目描述内容待完善...</p>
            </div>
          </div>

          <div class="content-section">
            <h2 class="section-title">输入描述</h2>
            <div class="section-content">
              <p v-if="problem.input_description">{{ problem.input_description }}</p>
              <p v-else class="placeholder-text">输入描述内容待完善...</p>
            </div>
          </div>

          <div class="content-section">
            <h2 class="section-title">输出描述</h2>
            <div class="section-content">
              <p v-if="problem.output_description">{{ problem.output_description }}</p>
              <p v-else class="placeholder-text">输出描述内容待完善...</p>
            </div>
          </div>

          <div class="content-section" v-if="problem.input_demo || problem.output_demo">
            <h2 class="section-title">样例</h2>
            <div class="sample-container">
              <div class="sample-item" v-if="problem.input_demo">
                <div class="sample-header">
                  <h3 class="sample-label">输入：</h3>
                  <button 
                    class="btn-copy" 
                    @click="copyToClipboard(problem.input_demo)"
                    title="复制输入样例"
                  >
                    📋 复制
                  </button>
                </div>
                <pre class="sample-code">{{ problem.input_demo }}</pre>
              </div>
              <div class="sample-item" v-if="problem.output_demo">
                <div class="sample-header">
                  <h3 class="sample-label">输出：</h3>
                  <button 
                    class="btn-copy" 
                    @click="copyToClipboard(problem.output_demo)"
                    title="复制输出样例"
                  >
                    📋 复制
                  </button>
                </div>
                <pre class="sample-code">{{ problem.output_demo }}</pre>
              </div>
            </div>
          </div>

          <div class="content-section" v-if="problem.hint">
            <h2 class="section-title">提示</h2>
            <div class="section-content">
              <p>{{ problem.hint }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 代码编辑和提交区域 -->
      <div class="code-section">
        <div class="code-header">
          <div class="language-selector">
            <label for="language">编程语言：</label>
            <select id="language" v-model="selectedLanguage" class="language-select">
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
            </select>
          </div>
          <div class="code-actions">
            <div class="editor-settings">
              <div class="font-size-selector">
                <label for="fontSize">字号：</label>
                <select id="fontSize" v-model="fontSize" @change="updateFontSize" class="font-size-select">
                  <option value="12">12px</option>
                  <option value="14">14px</option>
                  <option value="16">16px</option>
                  <option value="18">18px</option>
                  <option value="20">20px</option>
                </select>
              </div>
              <button 
                class="btn-theme-toggle" 
                @click="toggleTheme"
                :title="isDarkTheme ? '切换到亮色主题' : '切换到暗色主题'"
              >
                {{ isDarkTheme ? '☀️' : '🌙' }}
              </button>
            </div>
            <button class="btn-reset" @click="resetCode">重置代码</button>
            <button class="btn-submit" @click="submitCode">提交代码</button>
          </div>
        </div>
        <div class="editor-container">
          <div ref="editorContainer" class="codemirror-editor"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, crosshairCursor } from '@codemirror/view'
import { EditorState, Compartment } from '@codemirror/state'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { foldGutter, foldKeymap, syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language'
import { oneDark } from '@codemirror/theme-one-dark'
import { cpp } from '@codemirror/lang-cpp'
import { java } from '@codemirror/lang-java'
import { python } from '@codemirror/lang-python'
import { javascript } from '@codemirror/lang-javascript'
import { getProblemDetail } from '@/api/problem'

export default {
  name: 'ProblemDetail',
  data() {
    return {
      problem: {
        id: null,
        title: '',
        difficulty: 1, // 1-简单, 2-中等, 3-困难
        time_limit: 1000,
        memory_limit: 256,
        submissions: 0,
        accepted_count: 0,
        content: '',
        input_description: '',
        output_description: '',
        input_demo: '',
        output_demo: '',
        hint: '',
        create_time: ''
      },
      loading: false,
      selectedLanguage: 'cpp',
      fontSize: 14,
      isDarkTheme: true,
      editor: null,
      languageCompartment: null,
      fontSizeCompartment: null,
      themeCompartment: null,
      resizeHandler: null,
      resizeTimer: null,
      defaultCode: {
        cpp: ``,
        java: ``,
        python: ``,
        javascript: ``
      }
    }
  },
  mounted() {
    this.loadProblem()
    // 确保 DOM 完全渲染后再初始化编辑器
    this.$nextTick(() => {
      setTimeout(() => {
        this.initEditor()
      }, 50)
    })
  },
  beforeUnmount() {
    this.disposeEditor()
  },
  watch: {
    selectedLanguage() {
      if (this.editor) {
        this.updateEditorLanguage()
      }
    },
    '$route.params.id'() {
      this.disposeEditor()
      this.loadProblem()
      this.$nextTick(() => {
        this.initEditor()
      })
    }
  },
  methods: {
    async loadProblem() {
      const problemId = this.$route.params.id
      if (!problemId) {
        this.$router.push('/problems')
        return
      }

      this.loading = true
      try {
        const response = await getProblemDetail(problemId)
        
        if (response.code === 'success' && response.data) {
          const data = response.data
          this.problem = {
            id: data.id,
            title: data.title,
            difficulty: data.difficulty,
            time_limit: data.time_limit,
            memory_limit: data.memory_limit,
            submissions: data.submissions,
            accepted_count: data.accepted_count,
            content: data.content || '',
            input_description: data.input_description || '',
            output_description: data.output_description || '',
            input_demo: data.input_demo || '',
            output_demo: data.output_demo || '',
            hint: data.hint || '',
            create_time: data.create_time || ''
          }
        } else {
          this.$message?.error(response.message || '获取题目详情失败')
          this.$router.push('/problems')
        }
      } catch (error) {
        console.error('获取题目详情失败:', error)
        this.$message?.error(error.message || '获取题目详情失败，请稍后重试')
        this.$router.push('/problems')
      } finally {
        this.loading = false
      }
    },
    copyToClipboard(text) {
      if (!text) return
      
      navigator.clipboard.writeText(text).then(() => {
        this.$message?.success('已复制到剪贴板')
      }).catch(() => {
        // 降级方案
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        try {
          document.execCommand('copy')
          this.$message?.success('已复制到剪贴板')
        } catch (err) {
          this.$message?.error('复制失败，请手动复制')
        }
        document.body.removeChild(textarea)
      })
    },
    initEditor() {
      // 确保容器存在
      if (!this.$refs.editorContainer) {
        console.warn('编辑器容器不存在')
        return
      }

      // 如果编辑器已存在，先销毁
      if (this.editor) {
        this.disposeEditor()
      }

      try {
        // 确保容器有尺寸
        const container = this.$refs.editorContainer
        if (!container.offsetHeight && !container.offsetWidth) {
          console.warn('编辑器容器没有尺寸，延迟初始化')
          setTimeout(() => this.initEditor(), 100)
          return
        }
        // 创建语言配置 compartment（用于动态切换语言）
        this.languageCompartment = new Compartment()
        const languageSupport = this.getLanguageSupport(this.selectedLanguage)
        
        // 创建字号配置 compartment（用于动态切换字号）
        this.fontSizeCompartment = new Compartment()
        
        // 创建主题配置 compartment（用于动态切换主题）
        this.themeCompartment = new Compartment()
        
        // 创建基本编辑器扩展（移除自动补全和搜索功能）
        const basicExtensions = [
          lineNumbers(),
          highlightActiveLineGutter(),
          highlightSpecialChars(),
          history(),
          foldGutter(),
          drawSelection(),
          dropCursor(),
          EditorState.allowMultipleSelections.of(true),
          rectangularSelection(),
          crosshairCursor(),
          highlightActiveLine(),
          keymap.of([
            ...defaultKeymap,
            ...historyKeymap,
            ...foldKeymap
          ]),
          syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
          this.fontSizeCompartment.of(EditorView.theme({
            '&': {
              fontSize: this.fontSize + 'px'
            },
            '.cm-content': {
              fontSize: this.fontSize + 'px',
              lineHeight: '1.6'
            },
            '.cm-line': {
              fontSize: this.fontSize + 'px'
            },
            '.cm-lineNumbers .cm-gutterElement': {
              fontSize: this.fontSize + 'px'
            }
          })),
          this.themeCompartment.of(this.isDarkTheme ? oneDark : EditorView.theme({
            '&': {
              backgroundColor: '#ffffff',
              color: '#333333'
            },
            '.cm-gutters': {
              backgroundColor: '#f5f5f5',
              color: '#999999',
              borderRight: '1px solid #e8e8e8'
            },
            '.cm-lineNumbers .cm-gutterElement': {
              color: '#999999'
            },
            '.cm-activeLineGutter': {
              backgroundColor: '#f0f0f0'
            },
            '.cm-activeLine': {
              backgroundColor: '#f8f8f8'
            }
          })),
          this.languageCompartment.of(languageSupport)
        ]
        
        // 创建编辑器状态
        const state = EditorState.create({
          doc: this.defaultCode[this.selectedLanguage] || '',
          extensions: basicExtensions
        })

        // 创建编辑器视图
        this.editor = new EditorView({
          state,
          parent: this.$refs.editorContainer
        })

        // 处理窗口大小变化（使用防抖优化性能）
        this.resizeHandler = () => {
          if (this.resizeTimer) {
            clearTimeout(this.resizeTimer)
          }
          this.resizeTimer = setTimeout(() => {
            if (this.editor) {
              this.editor.requestMeasure()
            }
          }, 200)
        }
        window.addEventListener('resize', this.resizeHandler)
      } catch (error) {
        console.error('初始化编辑器失败:', error)
      }
    },
    disposeEditor() {
      // 清除防抖定时器
      if (this.resizeTimer) {
        clearTimeout(this.resizeTimer)
        this.resizeTimer = null
      }

      // 移除窗口大小监听
      if (this.resizeHandler) {
        window.removeEventListener('resize', this.resizeHandler)
        this.resizeHandler = null
      }

      // 销毁编辑器实例
      if (this.editor) {
        try {
          this.editor.destroy()
        } catch (error) {
          // 忽略销毁错误
        }
        this.editor = null
      }
    },
    updateEditorLanguage() {
      if (!this.editor || !this.languageCompartment) {
        return
      }

      try {
        const currentValue = this.editor.state.doc.toString()
        const newDefaultCode = this.defaultCode[this.selectedLanguage]
        
        // 如果当前代码是默认代码，则切换语言时使用新语言的默认代码
        if (this.isDefaultCode(currentValue)) {
          this.editor.dispatch({
            changes: {
              from: 0,
              to: this.editor.state.doc.length,
              insert: newDefaultCode
            }
          })
        }
        
        // 更新语言支持
        const languageSupport = this.getLanguageSupport(this.selectedLanguage)
        this.editor.dispatch({
          effects: this.languageCompartment.reconfigure(languageSupport)
        })
      } catch (error) {
        console.error('更新编辑器语言失败:', error)
      }
    },
    updateFontSize() {
      if (!this.editor || !this.fontSizeCompartment) {
        return
      }

      try {
        this.editor.dispatch({
          effects: this.fontSizeCompartment.reconfigure(EditorView.theme({
            '&': {
              fontSize: this.fontSize + 'px'
            },
            '.cm-content': {
              fontSize: this.fontSize + 'px',
              lineHeight: '1.6'
            },
            '.cm-line': {
              fontSize: this.fontSize + 'px'
            },
            '.cm-lineNumbers .cm-gutterElement': {
              fontSize: this.fontSize + 'px'
            }
          }))
        })
      } catch (error) {
        console.error('更新字号失败:', error)
      }
    },
    toggleTheme() {
      this.isDarkTheme = !this.isDarkTheme
      this.updateTheme()
    },
    updateTheme() {
      if (!this.editor || !this.themeCompartment) {
        return
      }

      try {
        const lightTheme = EditorView.theme({
          '&': {
            backgroundColor: '#ffffff',
            color: '#333333'
          },
          '.cm-gutters': {
            backgroundColor: '#f5f5f5',
            color: '#999999',
            borderRight: '1px solid #e8e8e8'
          },
          '.cm-lineNumbers .cm-gutterElement': {
            color: '#999999'
          },
          '.cm-activeLineGutter': {
            backgroundColor: '#f0f0f0'
          },
          '.cm-activeLine': {
            backgroundColor: '#f8f8f8'
          },
          '.cm-selectionBackground': {
            backgroundColor: '#b3d4fc'
          }
        })

        this.editor.dispatch({
          effects: this.themeCompartment.reconfigure(this.isDarkTheme ? oneDark : lightTheme)
        })
      } catch (error) {
        console.error('更新主题失败:', error)
      }
    },
    isDefaultCode(code) {
      const currentDefault = this.defaultCode[this.selectedLanguage]
      return code.trim() === currentDefault.trim()
    },
    getLanguageSupport(lang) {
      const map = {
        'cpp': cpp(),
        'java': java(),
        'python': python(),
        'javascript': javascript()
      }
      return map[lang] || cpp()
    },
    resetCode() {
      if (this.editor) {
        const defaultCode = this.defaultCode[this.selectedLanguage] || ''
        this.editor.dispatch({
          changes: {
            from: 0,
            to: this.editor.state.doc.length,
            insert: defaultCode
          }
        })
      }
    },
    async submitCode() {
      if (!this.editor) {
        return
      }

      const code = this.editor.state.doc.toString()
      if (!code.trim()) {
        alert('代码不能为空')
        return
      }

      // TODO: 提交代码到后端
      console.log('提交代码:', {
        problemId: this.problem.id,
        language: this.selectedLanguage,
        code: code
      })

      // 模拟提交
      alert('代码提交功能待后端开发完成后完善')
    },
    getDifficultyText(difficulty) {
      const map = {
        1: '简单',
        2: '中等',
        3: '困难'
      }
      return map[difficulty] || '未知'
    },
    getDifficultyClass(difficulty) {
      const map = {
        1: 'easy',
        2: 'medium',
        3: 'hard'
      }
      return map[difficulty] || 'easy'
    },
    getPassRate() {
      if (this.problem.submissions === 0) {
        return 0
      }
      return ((this.problem.accepted_count / this.problem.submissions) * 100).toFixed(1)
    }
  }
}
</script>

<style scoped>
.problem-detail {
  min-height: calc(100vh - 60px);
  background-color: #f5f5f5;
  padding: 20px;
}

.problem-detail-container {
  max-width: 1600px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  height: calc(100vh - 100px);
}

.problem-info-section {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
  overflow-y: auto;
}

.problem-header {
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 20px;
  margin-bottom: 24px;
}

.problem-title-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.problem-title {
  font-size: 28px;
  color: #333333;
  margin: 0;
  flex: 1;
}

.difficulty-badge {
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

.difficulty-easy {
  background-color: #f6ffed;
  color: #52c41a;
}

.difficulty-medium {
  background-color: #fff7e6;
  color: #fa8c16;
}

.difficulty-hard {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.problem-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.meta-label {
  color: #666666;
  margin-right: 4px;
}

.meta-value {
  color: #333333;
  font-weight: 500;
}

.problem-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.content-section {
  margin-bottom: 8px;
}

.section-title {
  font-size: 18px;
  color: #333333;
  margin: 0 0 12px 0;
  font-weight: 600;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.section-content {
  color: #555555;
  line-height: 1.8;
  font-size: 15px;
}

.section-content p {
  margin: 0 0 12px 0;
}

.placeholder-text {
  color: #999999;
  font-style: italic;
}

.sample-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sample-item {
  margin-bottom: 8px;
}

.sample-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.sample-label {
  font-size: 15px;
  color: #333333;
  margin: 0;
  font-weight: 500;
}

.btn-copy {
  padding: 4px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: #ffffff;
  color: #666666;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-copy:hover {
  border-color: #1890ff;
  color: #1890ff;
  background-color: #f0f7ff;
}

.btn-copy:active {
  transform: scale(0.95);
}

.sample-code {
  background-color: #f5f5f5;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  padding: 12px;
  margin: 0;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  color: #333333;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-x: auto;
}

.code-section {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  background-color: #fafafa;
}

.language-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.language-selector label {
  font-size: 14px;
  color: #666666;
  font-weight: 500;
}

.language-select {
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  color: #333333;
  background-color: #ffffff;
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;
}

.language-select:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.code-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.editor-settings {
  display: flex;
  align-items: center;
  gap: 12px;
}

.font-size-selector {
  display: flex;
  align-items: center;
  gap: 6px;
}

.font-size-selector label {
  font-size: 14px;
  color: #666666;
  font-weight: 500;
  white-space: nowrap;
}

.font-size-select {
  padding: 4px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 13px;
  color: #333333;
  background-color: #ffffff;
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;
}

.font-size-select:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.btn-theme-toggle {
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: #ffffff;
  color: #333333;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 32px;
}

.btn-theme-toggle:hover {
  border-color: #1890ff;
  background-color: #f0f7ff;
}

.btn-reset,
.btn-submit {
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
}

.btn-reset {
  background-color: #ffffff;
  color: #666666;
  border: 1px solid #d9d9d9;
}

.btn-reset:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.btn-submit {
  background-color: #1890ff;
  color: #ffffff;
}

.btn-submit:hover {
  background-color: #40a9ff;
}

.editor-container {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  position: relative;
}

.codemirror-editor {
  width: 100%;
  height: 100%;
  min-height: 400px;
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
}

.codemirror-editor :deep(.cm-editor) {
  height: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  font-size: 14px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

.codemirror-editor :deep(.cm-scroller) {
  flex: 1;
  overflow: auto;
  min-height: 0;
}

.codemirror-editor :deep(.cm-content) {
  padding: 12px;
  min-height: 100%;
  line-height: 1.6;
  font-size: 14px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

.codemirror-editor :deep(.cm-focused) {
  outline: none;
}

.codemirror-editor :deep(.cm-line) {
  padding: 0 4px;
}

/* 移除硬编码的行号样式，让主题系统控制 */

.editor-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 400px;
  color: #666666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f0f0f0;
  border-top-color: #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.editor-loading p {
  margin: 0;
  font-size: 14px;
}

@media (max-width: 1200px) {
  .problem-detail-container {
    grid-template-columns: 1fr;
    height: auto;
  }

  .code-section {
    min-height: 500px;
  }
}

@media (max-width: 768px) {
  .problem-detail {
    padding: 12px;
  }

  .problem-title {
    font-size: 22px;
  }

  .problem-meta {
    flex-direction: column;
    gap: 12px;
  }

  .code-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .editor-settings {
    width: 100%;
    justify-content: space-between;
  }

  .code-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .language-selector {
    width: 100%;
  }

  .language-select {
    flex: 1;
  }

  .code-actions {
    width: 100%;
  }

  .btn-reset,
  .btn-submit {
    flex: 1;
  }
}
</style>

