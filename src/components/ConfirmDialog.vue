<template>
  <transition name="fade">
    <div
      v-if="visible"
      class="modal-overlay"
      @click.self="handleCancel"
    >
      <div class="modal-card">
        <h3>{{ title }}</h3>
        <p v-if="message">{{ message }}</p>
        <p v-if="detail" class="modal-problem-title">
          {{ detail }}
        </p>
        <slot name="content"></slot>
        <div class="modal-actions">
          <button
            class="modal-cancel"
            @click="handleCancel"
            :disabled="loading"
          >
            {{ cancelText }}
          </button>
          <button
            class="modal-confirm"
            @click="handleConfirm"
            :disabled="loading"
          >
            {{ loading ? loadingText : confirmText }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'ConfirmDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '确认操作？'
    },
    message: {
      type: String,
      default: ''
    },
    detail: {
      type: String,
      default: ''
    },
    confirmText: {
      type: String,
      default: '确认'
    },
    cancelText: {
      type: String,
      default: '取消'
    },
    loading: {
      type: Boolean,
      default: false
    },
    loadingText: {
      type: String,
      default: '处理中...'
    }
  },
  emits: ['confirm', 'cancel', 'update:visible'],
  methods: {
    handleConfirm() {
      this.$emit('confirm')
    },
    handleCancel() {
      this.$emit('cancel')
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-card {
  width: min(420px, 90vw);
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.35);
}

.modal-card h3 {
  margin: 0 0 8px;
  font-size: 18px;
  color: #111827;
}

.modal-card p {
  margin: 4px 0 16px;
  color: #4b5563;
  line-height: 1.6;
  font-size: 14px;
}

.modal-problem-title {
  font-weight: 600;
  color: #111827;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.modal-cancel,
.modal-confirm {
  padding: 8px 18px;
  border-radius: 999px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-cancel {
  background: #f3f4f6;
  color: #374151;
}

.modal-cancel:hover:not(:disabled) {
  background: #e5e7eb;
}

.modal-confirm {
  background: #dc2626;
  color: #fff;
}

.modal-confirm:hover:not(:disabled) {
  background: #b91c1c;
}

.modal-confirm:disabled,
.modal-cancel:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

