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
            <button 
              class="btn-submission-history" 
              @click="goToSubmissionHistory"
              title="查看我的提交记录"
            >
              📋 提交记录
            </button>
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
              <div v-if="problem.content" v-html="renderContent(problem.content)"></div>
              <p v-else class="placeholder-text">题目描述内容待完善...</p>
            </div>
          </div>

          <div class="content-section">
            <h2 class="section-title">输入描述</h2>
            <div class="section-content">
              <div v-if="problem.input_description" v-html="renderContent(problem.input_description)"></div>
              <p v-else class="placeholder-text">输入描述内容待完善...</p>
            </div>
          </div>

          <div class="content-section">
            <h2 class="section-title">输出描述</h2>
            <div class="section-content">
              <div v-if="problem.output_description" v-html="renderContent(problem.output_description)"></div>
              <p v-else class="placeholder-text">输出描述内容待完善...</p>
            </div>
          </div>

          <div class="content-section" v-if="sampleList.length > 0">
            <h2 class="section-title">样例</h2>
            <div class="sample-container">
              <div 
                v-for="(sample, index) in sampleList" 
                :key="index"
                class="sample-group"
              >
                <div class="sample-group-header">
                  <h3 class="sample-group-title">样例 {{ index + 1 }}</h3>
                </div>
                <div class="sample-group-content">
                  <div class="sample-item" v-if="sample.input">
                    <div class="sample-header">
                      <h4 class="sample-label">输入：</h4>
                      <button 
                        class="btn-copy" 
                        @click="copyToClipboard(sample.input)"
                        title="复制输入样例"
                      >
                        📋
                      </button>
                    </div>
                    <pre class="sample-code">{{ sample.input }}</pre>
                  </div>
                  <div class="sample-item" v-if="sample.output">
                    <div class="sample-header">
                      <h4 class="sample-label">输出：</h4>
                      <button 
                        class="btn-copy" 
                        @click="copyToClipboard(sample.output)"
                        title="复制输出样例"
                      >
                        📋
                      </button>
                    </div>
                    <pre class="sample-code">{{ sample.output }}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="content-section" v-if="problem.hint">
            <h2 class="section-title">提示</h2>
            <div class="section-content">
              <div v-html="renderContent(problem.hint)"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 代码编辑和提交区域 -->
      <div class="code-section">
        <div class="code-header">
          <div class="language-selector">
            <label for="language">语言：</label>
            <select id="language" v-model="selectedLanguage" class="language-select">
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
            </select>
          </div>
          <!-- 提交状态显示区域 -->
          <div 
            v-if="submissionStatus !== null" 
            class="submission-status"
            :class="getSubmissionStatusClass()"
            @click="goToSubmissionDetail"
            :title="submissionStatus === 'Judging' ? '判题中...' : '点击查看详情'"
          >
            <span v-if="submissionStatus === 'Judging'" class="status-spinner">⟳</span>
            <span class="status-text">{{ submissionStatus }}</span>
          </div>
          <div class="code-actions">
            <div class="editor-settings">
              <div class="font-size-selector">
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
            <button class="btn-reset" @click="resetCode">⟲</button>
            <button 
              class="btn-test" 
              :class="{ active: showTestPanel }"
              @click="toggleTestPanel"
            >
              {{ showTestPanel ? '收起自测' : '在线自测' }}
            </button>
            <button class="btn-submit" @click="submitCode">
              提交代码
            </button>
          </div>
        </div>
        <div class="editor-container">
          <div ref="editorContainer" class="codemirror-editor"></div>
        </div>
        
        <!-- 在线自测面板 -->
        <transition name="slide-up">
          <div v-if="showTestPanel" class="test-panel" :style="{ height: testPanelHeight + 'px' }">
            <div class="test-panel-resizer" @mousedown="startResize"></div>
            <div class="test-panel-content">
            <div class="test-input-section">
              <div class="test-section-header">
                <label class="test-section-label">测试用例输入</label>
                <div class="test-section-actions">
                  <button 
                    v-for="(sample, index) in sampleList" 
                    :key="index"
                    class="btn-fill-sample"
                    @click="fillTestInput(sample.input)"
                    :title="`填充样例 ${index + 1} 的输入`"
                  >
                    样例 {{ index + 1 }}
                  </button>
                  <button class="btn-clear" @click="testInput = ''">清空</button>
                </div>
              </div>
              <textarea 
                v-model="testInput" 
                class="test-input-area"
                placeholder="请输入测试用例，或点击上方按钮填充样例输入..."
                rows="6"
              ></textarea>
            </div>
            <div class="test-output-section">
              <div class="test-section-header">
                <label class="test-section-label">运行结果</label>
                <button 
                  class="btn-run-test" 
                  @click="runTest"
                  :disabled="!testInput.trim() || testRunning"
                >
                  {{ testRunning ? '运行中...' : '▶ 运行自测' }}
                </button>
              </div>
              <div class="test-output-area">
                <div v-if="testRunning" class="test-output-loading">
                  <div class="loading-spinner-small"></div>
                  <span>正在运行...</span>
                </div>
                <div v-else-if="testResult" class="test-result-container">
                  <div class="test-result-header">
                    <div class="test-result-status" :class="getResultStatusClass(testResult.result)">
                      {{ getResultStatusText(testResult.result) }}
                    </div>
                    <div class="test-result-info">
                      <span class="info-item">运行时间: {{ testResult.cpu_time || 0 }}ms</span>
                      <span class="info-item">内存使用: {{ formatMemory(testResult.memory) }}KB</span>
                    </div>
                  </div>
                  <div class="test-output-content-wrapper">
                    <pre class="test-output-content">{{ testResult.output || '(无输出)' }}</pre>
                  </div>
                </div>
                <div v-else class="test-output-placeholder">
                  运行结果将显示在这里...
                </div>
              </div>
            </div>
          </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, crosshairCursor } from '@codemirror/view'
import { EditorState, Compartment } from '@codemirror/state'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { foldGutter, foldKeymap, syntaxHighlighting, defaultHighlightStyle, bracketMatching } from '@codemirror/language'
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'
import { oneDark } from '@codemirror/theme-one-dark'
import { cpp } from '@codemirror/lang-cpp'
import { java } from '@codemirror/lang-java'
import { python } from '@codemirror/lang-python'
import { javascript } from '@codemirror/lang-javascript'
import { getProblemDetail, runTest, submitCode } from '@/api/problem'
import { useAuth } from '@/composbles/useAuth'
import MarkdownIt from 'markdown-it'
import katex from 'katex'
import 'katex/dist/katex.min.css'

export default {
  name: 'ProblemDetail',
  setup() {
    const { userId, isLoggedIn } = useAuth()
    return { userId, isLoggedIn }
  },
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
      sampleList: [], // 解析后的样例列表
      selectedLanguage: 'cpp',
      fontSize: 14,
      isDarkTheme: true,
      editor: null,
      languageCompartment: null,
      fontSizeCompartment: null,
      themeCompartment: null,
      resizeHandler: null,
      resizeTimer: null,
      showTestPanel: false, // 是否显示自测面板
      testInput: '', // 测试用例输入
      testOutput: '', // 运行结果输出
      testResult: null, // 运行结果数据对象
      testRunning: false, // 是否正在运行
      testPanelHeight: 400, // 测试面板高度（像素）
      isResizing: false, // 是否正在调整大小
      saveCodeTimer: null, // 保存代码的防抖定时器
      submissionStatus: null, // 提交状态: null, 'Judging', 'Accepted', 'Wrong Answer', etc.
      submissionId: null, // 当前提交ID
      defaultCode: {
        cpp: ``,
        java: ``,
        python: ``,
        javascript: ``
      },
      md: null // Markdown 渲染器实例
    }
  },
  created() {
    // 初始化 Markdown 渲染器
    this.md = new MarkdownIt({
      html: true, // 允许 HTML 标签
      linkify: true, // 自动识别链接
      breaks: true // 将换行符转换为 <br>
    })
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
      // 切换题目时，保存当前题目的代码到缓存
      this.saveCodeToCache()
      this.disposeEditor()
      this.loadProblem()
      this.$nextTick(() => {
        this.initEditor()
      })
    }
  },
  methods: {
    // 渲染 Markdown 和 LaTeX 内容
    renderContent(text) {
      if (!text) return ''
      
      // 先处理换行符（将 \n 转换为实际的换行）
      let processed = text.replace(/\\n/g, '\n')
      
      // 保留行首空格：使用占位符临时标记行首空格
      const spacePlaceholders = new Map()
      let spaceIndex = 0
      processed = processed.split('\n').map(line => {
        // 匹配行首的空格
        const match = line.match(/^(\s+)/)
        if (match) {
          const spaces = match[1]
          const placeholder = `<span data-space-placeholder="${spaceIndex}"></span>`
          spacePlaceholders.set(spaceIndex, spaces.replace(/ /g, '&nbsp;'))
          spaceIndex++
          return line.replace(/^(\s+)/, placeholder)
        }
        return line
      }).join('\n')
      
      // 使用占位符临时替换 LaTeX 公式，避免与 Markdown 处理冲突
      // 使用 span 标签作为占位符，这样 Markdown 不会处理它
      const placeholders = new Map()
      let placeholderIndex = 0
      
      // 处理块级公式：$$...$$ 或 \[...\]
      processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
        try {
          const rendered = katex.renderToString(formula.trim(), { displayMode: true, throwOnError: false })
          const placeholder = `<span data-latex-placeholder="${placeholderIndex}"></span>`
          placeholders.set(placeholderIndex, rendered)
          placeholderIndex++
          return placeholder
        } catch (e) {
          return match
        }
      })
      processed = processed.replace(/\\\[([\s\S]*?)\\\]/g, (match, formula) => {
        try {
          const rendered = katex.renderToString(formula.trim(), { displayMode: true, throwOnError: false })
          const placeholder = `<span data-latex-placeholder="${placeholderIndex}"></span>`
          placeholders.set(placeholderIndex, rendered)
          placeholderIndex++
          return placeholder
        } catch (e) {
          return match
        }
      })
      
      // 处理行内公式：$...$ 或 \(...\)
      // 使用更严格的匹配，要求公式中包含至少一个字母或常见数学符号
      processed = processed.replace(/\$([^$\n]+?)\$/g, (match, formula) => {
        // 检查是否包含数学符号或字母（避免匹配普通文本中的 $）
        if (/[a-zA-Zα-ωΑ-Ω_^\\{}[\]]/.test(formula)) {
          try {
            const rendered = katex.renderToString(formula.trim(), { displayMode: false, throwOnError: false })
            const placeholder = `<span data-latex-placeholder="${placeholderIndex}"></span>`
            placeholders.set(placeholderIndex, rendered)
            placeholderIndex++
            return placeholder
          } catch (e) {
            return match
          }
        }
        return match
      })
      processed = processed.replace(/\\\(([^\\]+?)\\\)/g, (match, formula) => {
        try {
          const rendered = katex.renderToString(formula.trim(), { displayMode: false, throwOnError: false })
          const placeholder = `<span data-latex-placeholder="${placeholderIndex}"></span>`
          placeholders.set(placeholderIndex, rendered)
          placeholderIndex++
          return placeholder
        } catch (e) {
          return match
        }
      })
      
      // 使用 Markdown 渲染
      let html = this.md.render(processed)
      
      // 将占位符替换回渲染后的 LaTeX（按索引从大到小替换，避免索引冲突）
      const sortedIndices = Array.from(placeholders.keys()).sort((a, b) => b - a)
      sortedIndices.forEach(index => {
        const rendered = placeholders.get(index)
        const placeholderRegex = new RegExp(`<span data-latex-placeholder="${index}"></span>`, 'g')
        html = html.replace(placeholderRegex, rendered)
      })
      
      // 将行首空格占位符替换为 &nbsp;
      spacePlaceholders.forEach((spaces, index) => {
        const placeholderRegex = new RegExp(`<span data-space-placeholder="${index}"></span>`, 'g')
        html = html.replace(placeholderRegex, spaces)
      })
      
      return html
    },
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
          
          // 解析样例数据（优先使用后端解析的数组，如果没有则前端解析）
          if (data.samples && Array.isArray(data.samples) && data.samples.length > 0) {
            this.sampleList = data.samples
          } else {
            this.parseSamples(data.input_demo, data.output_demo)
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
    parseSamples(inputDemo, outputDemo) {
      // 解析样例数据，支持多组样例（用 | 分隔）
      this.sampleList = []
      
      if (!inputDemo && !outputDemo) {
        return
      }
      
      // 分割输入样例
      const inputList = inputDemo ? inputDemo.split('|').map(s => s.trim()).filter(s => s) : []
      // 分割输出样例
      const outputList = outputDemo ? outputDemo.split('|').map(s => s.trim()).filter(s => s) : []
      
      // 确定样例组数（取输入和输出的最大长度）
      const maxLength = Math.max(inputList.length, outputList.length)
      
      // 构建样例列表
      for (let i = 0; i < maxLength; i++) {
        this.sampleList.push({
          input: inputList[i] || '',
          output: outputList[i] || ''
        })
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
          EditorView.lineWrapping, // 启用自动换行
          bracketMatching(), // 括号匹配高亮
          closeBrackets(), // 自动补全右括号
          keymap.of([
            ...defaultKeymap,
            ...historyKeymap,
            ...foldKeymap,
            ...closeBracketsKeymap // 括号补全快捷键
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
        
        // 从缓存读取代码，如果没有缓存则使用默认代码
        const cachedCode = this.getCachedCode()
        const initialCode = cachedCode || this.defaultCode[this.selectedLanguage] || ''
        
        // 添加代码变化监听，自动保存到缓存
        // 使用 EditorView.updateListener extension
        const updateListener = EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            // 使用防抖，避免频繁保存
            if (this.saveCodeTimer) {
              clearTimeout(this.saveCodeTimer)
            }
            this.saveCodeTimer = setTimeout(() => {
              this.saveCodeToCache()
            }, 500) // 500ms 防抖
          }
        })
        
        // 创建编辑器状态，将 updateListener 添加到扩展中
        const state = EditorState.create({
          doc: initialCode,
          extensions: [
            ...basicExtensions,
            updateListener
          ]
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
      // 保存当前代码到缓存
      this.saveCodeToCache()
      
      // 清除防抖定时器
      if (this.resizeTimer) {
        clearTimeout(this.resizeTimer)
        this.resizeTimer = null
      }
      
      // 清除保存代码的防抖定时器
      if (this.saveCodeTimer) {
        clearTimeout(this.saveCodeTimer)
        this.saveCodeTimer = null
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
        // 保存当前语言的代码到缓存
        this.saveCodeToCache()
        
        const currentValue = this.editor.state.doc.toString()
        const newDefaultCode = this.defaultCode[this.selectedLanguage]
        
        // 从缓存读取新语言的代码，如果没有缓存则使用默认代码
        const cachedCode = this.getCachedCode()
        const codeToUse = cachedCode || (this.isDefaultCode(currentValue) ? newDefaultCode : currentValue)
        
        // 更新代码内容
        this.editor.dispatch({
          changes: {
            from: 0,
            to: this.editor.state.doc.length,
            insert: codeToUse
          }
        })
        
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
    // 获取缓存键（基于题目ID和语言）
    getCacheKey() {
      const problemId = this.problem?.id || this.$route.params.id || 'unknown'
      return `code_editor_${problemId}_${this.selectedLanguage}`
    },
    // 从缓存读取代码
    getCachedCode() {
      try {
        const key = this.getCacheKey()
        const cached = localStorage.getItem(key)
        if (cached) {
          return cached
        }
      } catch (error) {
        console.warn('读取代码缓存失败:', error)
      }
      return null
    },
    // 保存代码到缓存
    saveCodeToCache() {
      if (!this.editor) {
        return
      }
      try {
        const code = this.editor.state.doc.toString()
        const key = this.getCacheKey()
        // 如果代码是默认代码，则不保存（节省空间）
        if (!this.isDefaultCode(code)) {
          localStorage.setItem(key, code)
        } else {
          // 如果是默认代码，删除缓存
          localStorage.removeItem(key)
        }
      } catch (error) {
        console.warn('保存代码缓存失败:', error)
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
    toggleTestPanel() {
      this.showTestPanel = !this.showTestPanel
      if (this.showTestPanel) {
        // 展开面板时，如果没有输入且有待填充的样例，自动填充第一个样例
        if (!this.testInput && this.sampleList.length > 0 && this.sampleList[0].input) {
          this.testInput = this.sampleList[0].input
        }
      }
    },
    fillTestInput(input) {
      this.testInput = input || ''
    },
    async runTest() {
      if (!this.testInput.trim()) {
        this.$message?.warning('请输入测试用例')
        return
      }

      if (!this.editor) {
        this.$message?.warning('代码编辑器未初始化')
        return
      }

      const code = this.editor.state.doc.toString()
      if (!code.trim()) {
        this.$message?.warning('代码不能为空')
        return
      }

      if (!this.problem.id) {
        this.$message?.warning('题目信息不完整')
        return
      }

      this.testRunning = true
      this.testOutput = ''
      this.testResult = null

      try {
        const response = await runTest(this.problem.id, {
          code: code,
          language: this.selectedLanguage,
          test_input: this.testInput
        })

        if (response.code === 'success' && response.data) {
          // 存储运行结果数据
          this.testResult = response.data
        } else {
          // 错误情况，显示错误信息
          this.testResult = {
            result: 5, // System Error
            output: `运行失败: ${response.message || '未知错误'}`,
            cpu_time: 0,
            memory: 0
          }
        }
      } catch (error) {
        console.error('运行自测失败:', error)
        this.testResult = {
          result: 5, // System Error
          output: `运行失败: ${error.message || '请稍后重试'}`,
          cpu_time: 0,
          memory: 0
        }
      } finally {
        this.testRunning = false
      }
    },
    async submitCode() {
      if (!this.editor) {
        return
      }

      const code = this.editor.state.doc.toString()
      if (!code.trim()) {
        this.$message?.warning('代码不能为空')
        return
      }

      try {
        // 设置提交状态为Judging
        this.submissionStatus = 'Judging'
        this.submissionId = null

        // 调用后端API提交代码
        const response = await submitCode(this.problem.id, {
          code: code,
          language: this.selectedLanguage
        })

        if (response.code === 'success' && response.data) {
          const data = response.data
          this.submissionId = data.submission_id
          
          // 根据状态码设置状态文本
          const statusCode = data.status
          const statusMap = {
            0: 'Accepted',
            '-1': 'Wrong Answer',
            1: 'Time Limit Exceeded',
            2: 'Time Limit Exceeded',
            3: 'Memory Limit Exceeded',
            4: 'Runtime Error',
            5: 'Compile Error',
            6: 'System Error',
            7: 'Judging'
          }
          
          // 优先使用 status_text，如果没有则使用状态码映射
          // 确保正确处理 -1 状态码（需要转换为字符串）
          this.submissionStatus = data.status_text || statusMap[String(statusCode)] || 'Unknown'
          
          // 调试日志
          console.log('提交结果:', {
            status: statusCode,
            status_text: data.status_text,
            submissionStatus: this.submissionStatus
          })
          
          // 显示成功消息
          if (data.status === 0) {
            this.$message?.success('提交成功！所有测试用例通过')
          } else {
            this.$message?.warning(`提交完成：${this.submissionStatus}`)
          }
        } else {
          this.submissionStatus = 'System Error'
          this.$message?.error(response.message || '提交失败')
        }
      } catch (error) {
        console.error('提交代码失败:', error)
        this.submissionStatus = 'System Error'
        const errorMessage = error.response?.data?.message || error.message || '提交失败，请稍后重试'
        this.$message?.error(errorMessage)
      }
    },
    getSubmissionStatusClass() {
      if (!this.submissionStatus) return ''
      
      const status = this.submissionStatus.toLowerCase()
      if (status === 'judging') {
        return 'status-judging'
      } else if (status === 'accepted') {
        return 'status-accepted'
      } else if (status.includes('wrong answer')) {
        return 'status-wrong-answer'
      } else if (status.includes('time limit')) {
        return 'status-time-limit'
      } else if (status.includes('memory limit')) {
        return 'status-memory-limit'
      } else if (status.includes('runtime error')) {
        return 'status-runtime-error'
      } else if (status.includes('compile error')) {
        return 'status-compile-error'
      } else {
        return 'status-system-error'
      }
    },
    goToSubmissionDetail() {
      if (this.submissionId) {
        // 跳转到提交详情页面
        this.$router.push({
          name: 'SubmissionDetail',
          params: { id: this.submissionId }
        })
      }
    },
    goToSubmissionHistory() {
      // 跳转到当前用户在当前题目的提交记录页面
      if (!this.isLoggedIn) {
        this.$message?.warning('请先登录')
        this.$router.push('/login')
        return
      }
      this.$router.push({
        name: 'ProblemSubmissionHistory',
        params: { id: this.problem.id }
      })
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
    getResultStatusText(result) {
      // 确保 result 是数字类型
      const resultNum = Number(result)
      const statusMap = {
        0: 'Accepted',
        '-1': 'Wrong Answer',
        1: 'Time Limit Exceeded',
        2: 'Time Limit Exceeded',
        3: 'Memory Limit Exceeded',
        4: 'Runtime Error',
        5: 'System Error'
      }
      return statusMap[resultNum] || statusMap[String(resultNum)] || 'Unknown'
    },
    getResultStatusClass(result) {
      // 确保 result 是数字类型
      const resultNum = Number(result)
      const classMap = {
        0: 'status-accepted',
        '-1': 'status-wrong-answer',
        1: 'status-time-limit',
        2: 'status-time-limit',
        3: 'status-memory-limit',
        4: 'status-runtime-error',
        5: 'status-system-error'
      }
      return classMap[resultNum] || classMap[String(resultNum)] || 'status-unknown'
    },
    formatMemory(memoryBytes) {
      if (!memoryBytes) return '0'
      // 将字节转换为KB
      return Math.round(memoryBytes / 1024)
    },
    startResize(e) {
      this.isResizing = true
      const startY = e.clientY
      const startHeight = this.testPanelHeight
      
      const doResize = (moveEvent) => {
        const deltaY = startY - moveEvent.clientY // 向上拖动是正数
        const newHeight = Math.max(200, Math.min(800, startHeight + deltaY))
        this.testPanelHeight = newHeight
      }
      
      const stopResize = () => {
        this.isResizing = false
        document.removeEventListener('mousemove', doResize)
        document.removeEventListener('mouseup', stopResize)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
      
      document.addEventListener('mousemove', doResize)
      document.addEventListener('mouseup', stopResize)
      document.body.style.cursor = 'row-resize'
      document.body.style.userSelect = 'none'
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
  flex-wrap: wrap;
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

.btn-submission-history {
  padding: 6px 16px;
  border: 1px solid #1890ff;
  border-radius: 6px;
  background-color: #ffffff;
  color: #1890ff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.btn-submission-history:hover {
  background-color: #e6f7ff;
  border-color: #40a9ff;
  color: #40a9ff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
}

.btn-submission-history:active {
  transform: translateY(0);
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
  color: #333333;
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
  color: #333333;
  line-height: 1.8;
  font-size: 15px;
}

.section-content p {
  margin: 0 0 12px 0;
}

/* Markdown 样式 */
.section-content :deep(h1),
.section-content :deep(h2),
.section-content :deep(h3),
.section-content :deep(h4),
.section-content :deep(h5),
.section-content :deep(h6) {
  margin: 16px 0 12px 0;
  font-weight: 600;
  color: #333333;
  line-height: 1.4;
}

.section-content :deep(h1) {
  font-size: 24px;
  border-bottom: 2px solid #e8e8e8;
  padding-bottom: 8px;
}

.section-content :deep(h2) {
  font-size: 20px;
  border-bottom: 1px solid #e8e8e8;
  padding-bottom: 6px;
}

.section-content :deep(h3) {
  font-size: 18px;
}

.section-content :deep(h4) {
  font-size: 16px;
}

.section-content :deep(h5),
.section-content :deep(h6) {
  font-size: 15px;
}

.section-content :deep(p) {
  margin: 0 0 12px 0;
  line-height: 1.8;
}

.section-content :deep(ul),
.section-content :deep(ol) {
  margin: 12px 0;
  padding-left: 24px;
}

.section-content :deep(li) {
  margin: 6px 0;
  line-height: 1.8;
}

.section-content :deep(blockquote) {
  margin: 12px 0;
  padding: 12px 16px;
  border-left: 4px solid #1890ff;
  background-color: #f0f7ff;
  color: #111111;
}

.section-content :deep(code) {
  padding: 2px 6px;
  background-color: #f5f5f5;
  border: 1px solid #e8e8e8;
  border-radius: 3px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  color: #e83e8c;
}

.section-content :deep(pre) {
  margin: 12px 0;
  padding: 12px;
  background-color: #f5f5f5;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  overflow-x: auto;
}

.section-content :deep(pre code) {
  padding: 0;
  background-color: transparent;
  border: none;
  color: #333333;
  font-size: 14px;
}

.section-content :deep(a) {
  color: #1890ff;
  text-decoration: none;
}

.section-content :deep(a:hover) {
  text-decoration: underline;
}

.section-content :deep(table) {
  width: 100%;
  margin: 12px 0;
  border-collapse: collapse;
}

.section-content :deep(th),
.section-content :deep(td) {
  padding: 8px 12px;
  border: 1px solid #e8e8e8;
  text-align: left;
}

.section-content :deep(th) {
  background-color: #fafafa;
  font-weight: 600;
}

.section-content :deep(hr) {
  margin: 16px 0;
  border: none;
  border-top: 1px solid #e8e8e8;
}

.section-content :deep(img) {
  max-width: 100%;
  height: auto;
  margin: 12px 0;
  border-radius: 4px;
}

/* LaTeX 数学公式样式 */
.section-content :deep(.katex) {
  font-size: 1.1em;
}

.section-content :deep(.katex-display) {
  margin: 16px 0;
  overflow-x: auto;
  overflow-y: hidden;
}

.section-content :deep(.katex-display > .katex) {
  display: inline-block;
  text-align: left;
}

.placeholder-text {
  color: #999999;
  font-style: italic;
}

.sample-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.sample-group {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 16px;
  background-color: #fafafa;
}

.sample-group-header {
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e8e8e8;
}

.sample-group-title {
  font-size: 16px;
  color: #333333;
  margin: 0;
  font-weight: 600;
}

.sample-group-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sample-item {
  margin-bottom: 0;
}

.sample-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.sample-label {
  font-size: 14px;
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
  padding: 10px 16px;
  border-bottom: 1px solid #f0f0f0;
  background-color: #fafafa;
  gap: 16px;
}

.submission-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
}

.submission-status:hover {
  opacity: 0.9;
  transform: scale(1.02);
}

.status-spinner {
  display: inline-block;
  animation: spin 1s linear infinite;
  font-size: 16px;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.status-judging {
  background-color: #1890ff;
  color: #ffffff;
}

.status-accepted {
  background-color: #52c41a;
  color: #ffffff;
}

.status-wrong-answer {
  background-color: #ff4d4f;
  color: #ffffff;
}

.status-time-limit {
  background-color: #faad14;
  color: #ffffff;
}

.status-memory-limit {
  background-color: #fa8c16;
  color: #ffffff;
}

.status-runtime-error {
  background-color: #eb2f96;
  color: #ffffff;
}

.status-compile-error {
  background-color: #722ed1;
  color: #ffffff;
}

.status-system-error {
  background-color: #8c8c8c;
  color: #ffffff;
}

.language-selector {
  display: flex;
  align-items: center;
  gap: 6px;
}

.language-selector label {
  font-size: 13px;
  color: #666666;
  font-weight: 500;
}

.language-select {
  padding: 4px 10px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 13px;
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
  gap: 8px;
}

.editor-settings {
  display: flex;
  align-items: center;
  gap: 8px;
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
  padding: 4px 10px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: #ffffff;
  color: #333333;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 28px;
}

.btn-theme-toggle:hover {
  border-color: #1890ff;
  background-color: #f0f7ff;
}

.btn-reset,
.btn-test,
.btn-submit {
  padding: 6px 16px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
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

.btn-test {
  background-color: #52c41a;
  color: #ffffff;
  border: 1px solid #52c41a;
}

.btn-test:hover {
  background-color: #73d13d;
  border-color: #73d13d;
}

.btn-test.active {
  background-color: #faad14;
  border-color: #faad14;
}

.btn-test.active:hover {
  background-color: #ffc53d;
  border-color: #ffc53d;
}

.btn-submit {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  color: #ffffff;
  border: 1px solid #1890ff;
  box-shadow: 0 2px 6px rgba(24, 144, 255, 0.3);
}

.btn-submit:hover {
  background: linear-gradient(135deg, #40a9ff 0%, #1890ff 100%);
  border-color: #40a9ff;
  box-shadow: 0 4px 10px rgba(24, 144, 255, 0.4);
  transform: translateY(-1px);
}

.btn-submit:active {
  transform: translateY(0);
}

.editor-container {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* 向上弹出过渡动画 */
.slide-up-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(100%);
}

.slide-up-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.slide-up-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

.test-panel {
  border-top: 2px solid #e8e8e8;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  min-height: 200px;
  max-height: 800px;
}

.test-panel-resizer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  cursor: row-resize;
  background-color: transparent;
  z-index: 10;
  transition: background-color 0.2s;
}

.test-panel-resizer:hover {
  background-color: #1890ff;
}

.test-panel-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 16px 20px;
  overflow: hidden;
  flex: 1;
  min-height: 0;
}

.test-input-section,
.test-output-section {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.test-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.test-section-label {
  font-size: 14px;
  color: #333333;
  font-weight: 500;
}

.test-section-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.btn-fill-sample {
  padding: 4px 10px;
  border: 1px solid #1890ff;
  border-radius: 4px;
  background-color: #ffffff;
  color: #1890ff;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
}

.btn-fill-sample:hover {
  background-color: #e6f7ff;
  border-color: #40a9ff;
}

.btn-clear {
  padding: 4px 10px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: #ffffff;
  color: #666666;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
}

.btn-clear:hover {
  border-color: #ff4d4f;
  color: #ff4d4f;
  background-color: #fff1f0;
}

.test-input-area {
  flex: 1;
  padding: 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: none;
  outline: none;
  transition: border-color 0.3s ease;
  min-height: 150px;
}

.test-input-area:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.test-output-area {
  flex: 1;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background-color: #fafafa;
  padding: 0;
  overflow-y: auto;
  min-height: 150px;
  /* 移除 max-height，让运行结果区域能够随着测试面板的高度变化而自适应 */
}

.test-result-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.test-result-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #e8e8e8;
  background-color: #ffffff;
  flex-shrink: 0;
}

.test-result-status {
  padding: 6px 16px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 14px;
  color: #ffffff;
}

.test-result-status.status-accepted {
  background-color: #52c41a;
}

.test-result-status.status-wrong-answer {
  background-color: #ff4d4f;
}

.test-result-status.status-time-limit {
  background-color: #faad14;
}

.test-result-status.status-memory-limit {
  background-color: #fa8c16;
}

.test-result-status.status-runtime-error {
  background-color: #eb2f96;
}

.test-result-status.status-system-error {
  background-color: #722ed1;
}

.test-result-status.status-unknown {
  background-color: #8c8c8c;
}

.test-result-info {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #666666;
  align-items: center;
}

.test-result-info .info-item {
  white-space: nowrap;
}

.test-output-content-wrapper {
  flex: 1;
  padding: 12px 16px;
  overflow-y: auto;
}

.test-output-content {
  margin: 0;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  color: #333333;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.test-output-placeholder {
  color: #999999;
  font-style: italic;
  font-size: 14px;
  text-align: center;
  padding: 20px 0;
}

.test-output-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #666666;
  font-size: 14px;
  gap: 12px;
}

.loading-spinner-small {
  width: 24px;
  height: 24px;
  border: 3px solid #f0f0f0;
  border-top-color: #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.btn-run-test {
  padding: 6px 16px;
  border: none;
  border-radius: 6px;
  background-color: #1890ff;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
}

.btn-run-test:hover:not(:disabled) {
  background-color: #40a9ff;
}

.btn-run-test:disabled {
  background-color: #d9d9d9;
  color: #999999;
  cursor: not-allowed;
}

.submit-button-fixed {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 1000;
}

.btn-submit-fixed {
  padding: 14px 28px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-submit-fixed:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(24, 144, 255, 0.5);
  background: linear-gradient(135deg, #40a9ff 0%, #1890ff 100%);
}

.btn-submit-fixed:active {
  transform: translateY(0);
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
  overflow-y: auto;
  overflow-x: hidden;
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
  .btn-test {
    flex: 1;
  }

  .test-panel-content {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .code-actions {
    flex-wrap: wrap;
  }

  .btn-reset,
  .btn-test,
  .btn-submit {
    flex: 1;
    min-width: 100px;
  }
}
</style>

