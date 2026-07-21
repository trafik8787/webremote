<script setup lang="ts">
import { computed, ref } from 'vue'
import TurnstileWidget from './TurnstileWidget.vue'

type ContactStatus =
  | 'idle'
  | 'sending'
  | 'sent'
  | 'error'
  | 'verification-required'
  | 'verification-error'

interface ContactContent {
  number: string
  title: string
  text: string
  formTitle: string
  name: string
  email: string
  company: string
  projectType: string
  projectPlaceholder: string
  projectOptions: readonly string[]
  budget: string
  budgetPlaceholder: string
  budgetOptions: readonly string[]
  message: string
  sending: string
  submit: string
  error: string
  verificationRequired: string
  verificationError: string
  privacy: string
}

interface ContactForm {
  name: string
  email: string
  company: string
  projectType: string
  budget: string
  message: string
}

interface TurnstileWidgetExpose {
  reset: () => void
}

const props = withDefaults(defineProps<{
  content: ContactContent
  form: ContactForm
  status: ContactStatus
  locale: 'uk' | 'en'
  turnstileSiteKey?: string
}>(), {
  turnstileSiteKey: '',
})

const emit = defineEmits<{
  submit: []
  reset: []
  'turnstile-verified': [token: string]
  'turnstile-expired': []
  'turnstile-error': [error: string]
}>()

const turnstileWidget = ref<TurnstileWidgetExpose | null>(null)

const successContent = computed(() => props.locale === 'uk'
  ? {
      eyebrow: 'ПОВІДОМЛЕННЯ НАДІСЛАНО',
      title: 'Дякую за звернення!',
      text: 'Ваш запит успішно отримано. WebRemote зв’яжеться з вами найближчим часом.',
      responseLabel: 'Зазвичай відповідаємо',
      responseTime: 'протягом одного робочого дня',
      reset: 'Надіслати ще один запит',
    }
  : {
      eyebrow: 'MESSAGE SENT',
      title: 'Thank you!',
      text: 'Your request has been received successfully. WebRemote will get back to you as soon as possible.',
      responseLabel: 'Typical response time',
      responseTime: 'within one business day',
      reset: 'Send another request',
    })

function handleTurnstileVerified(token: string) {
  emit('turnstile-verified', token)
}

function handleTurnstileError(error: string) {
  emit('turnstile-error', error)
}

function resetTurnstile() {
  turnstileWidget.value?.reset()
}

defineExpose({ resetTurnstile })
</script>

<template>
  <section id="contact" class="panel contact-panel">
    <div class="contact-orbit orbit-one"></div>
    <div class="contact-orbit orbit-two"></div>

    <div class="panel-surface">
      <div class="panel-inner page-width contact-content">
        <div class="contact-layout">
          <div class="contact-intro">
            <p class="section-number">{{ content.number }}</p>
            <h2>{{ content.title }}</h2>
            <p>{{ content.text }}</p>
            <a class="contact-link" href="mailto:info@webremote.net">info@webremote.net <span>↗</span></a>
          </div>

          <Transition name="contact-swap" mode="out-in">
            <form
              v-if="status !== 'sent'"
              key="contact-form"
              class="contact-form"
              @submit.prevent="emit('submit')"
            >
              <h3>{{ content.formTitle }}</h3>

              <div class="form-grid">
                <label>
                  <span>{{ content.name }}</span>
                  <input v-model.trim="form.name" type="text" autocomplete="name" required>
                </label>

                <label>
                  <span>{{ content.email }}</span>
                  <input v-model.trim="form.email" type="email" autocomplete="email" required>
                </label>

                <label class="form-wide">
                  <span>{{ content.company }}</span>
                  <input v-model.trim="form.company" type="text" autocomplete="organization">
                </label>

                <label>
                  <span>{{ content.projectType }}</span>
                  <select v-model="form.projectType" required>
                    <option value="" disabled>{{ content.projectPlaceholder }}</option>
                    <option v-for="option in content.projectOptions" :key="option" :value="option">
                      {{ option }}
                    </option>
                  </select>
                </label>

                <label>
                  <span>{{ content.budget }}</span>
                  <select v-model="form.budget" required>
                    <option value="" disabled>{{ content.budgetPlaceholder }}</option>
                    <option v-for="option in content.budgetOptions" :key="option" :value="option">
                      {{ option }}
                    </option>
                  </select>
                </label>

                <label class="form-wide">
                  <span>{{ content.message }}</span>
                  <textarea v-model.trim="form.message" rows="5" required></textarea>
                </label>
              </div>

              <TurnstileWidget
                v-if="turnstileSiteKey"
                ref="turnstileWidget"
                class="form-wide"
                :site-key="turnstileSiteKey"
                :language="locale"
                @verified="handleTurnstileVerified"
                @expired="emit('turnstile-expired')"
                @error="handleTurnstileError"
              />

              <p v-else class="form-error form-wide">
                TURNSTILE_SITE_KEY is not configured.
              </p>

              <button
                class="form-submit"
                type="submit"
                :disabled="status === 'sending' || !turnstileSiteKey"
              >
                {{ status === 'sending' ? content.sending : content.submit }}
                <span>↗</span>
              </button>

              <p v-if="status === 'error'" class="form-error">{{ content.error }}</p>
              <p v-else-if="status === 'verification-required'" class="form-error">
                {{ content.verificationRequired }}
              </p>
              <p v-else-if="status === 'verification-error'" class="form-error">
                {{ content.verificationError }}
              </p>

              <p class="form-privacy">{{ content.privacy }}</p>
            </form>

            <div v-else key="contact-success" class="contact-success">
              <div class="success-icon">
                <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="26" cy="26" r="25" class="success-circle" />
                  <path d="M15 27L23 35L38 18" class="success-check" />
                </svg>
              </div>

              <p class="success-eyebrow">
                {{ successContent.eyebrow }}
              </p>

              <h3>{{ successContent.title }}</h3>

              <p class="success-text">
                {{ successContent.text }}
              </p>

              <div class="success-info">
                <strong>{{ successContent.responseLabel }}</strong>
                <span>{{ successContent.responseTime }}</span>
              </div>

              <button class="form-submit success-button" type="button" @click="emit('reset')">
                {{ successContent.reset }}
                <span>↗</span>
              </button>
            </div>
          </Transition>
        </div>

        <footer>
          <span>© {{ new Date().getFullYear() }} WebRemote</span>
          <span>Laravel · Node.js · Vue.js · AWS · AI / LLM</span>
        </footer>
      </div>
    </div>
  </section>
</template>
