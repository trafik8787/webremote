<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import SiteHeader from './components/SiteHeader.vue'
import ThreeBackground from './components/ThreeBackground.vue'
import ProjectCard from './components/ProjectCard.vue'
import TurnstileWidget from './components/TurnstileWidget.vue'


const formStatus = ref('idle')
const turnstileToken = ref('')
const turnstileWidget = ref(null)
const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY
const activeStackIndex = ref(null)
const contactForm = ref({
  name: '',
  email: '',
  company: '',
  projectType: '',
  budget: '',
  message: '',
})
const savedLocale = localStorage.getItem('webremote-locale')
const browserLocale = navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'uk'
const locale = ref(savedLocale === 'uk' || savedLocale === 'en' ? savedLocale : browserLocale)

const translations = {
  uk: {
    nav: { home: 'Головна', about: 'Про WebRemote', stack: 'Експертиза', projects: 'Проєкти', contact: 'Контакти' },
    hero: {
      kicker: 'Software Engineering Studio',
      title: 'Створюємо цифрові',
      titleAccent: 'продукти, що рухають бізнес уперед.',
      lead: 'WebRemote проєктує та розробляє SaaS-платформи, REST API, AI-інтеграції, корпоративні вебсистеми й хмарні рішення на Laravel, Node.js, Vue.js та AWS.',
      projects: 'Переглянути роботи',
      discuss: 'Обговорити проєкт',
      scroll: 'Дізнайтеся більше',
    },
    about: {
      number: '01 / ПРО WEBREMOTE',
      title: 'Інженерний підхід до вебпродуктів — від ідеї до стабільного запуску.',
      large: 'WebRemote — software engineering studio. Ми створюємо сучасні вебпродукти, REST API, інтеграції та модернізуємо складні legacy-системи.',
      text: 'Кожен проєкт отримує пряме технічне лідерство, прозору комунікацію та фокус на бізнес-результаті. За потреби до роботи підключаються перевірені спеціалісти, а відповідальність за архітектуру та якість залишається в WebRemote.',
      years: 'років інженерного досвіду', earned: 'зароблено на Upwork', hours: 'годин клієнтської розробки',
          },
    stack: { number: '02 / ЕКСПЕРТИЗА', title: 'Від backend-архітектури та API', accent: 'до інтерфейсів, автоматизації й хмари.' },
    why: { number: '03 / ЧОМУ WEBREMOTE', title: 'Чому обирають WebRemote' },
    projects: { number: '04 / ВИБРАНІ РОБОТИ', title: 'Продукти та системи', eyebrow: 'Проєкт WebRemote', open: 'Детальніше' },
    contact: {
      number: '05 / ПОЧНІМО ПРОЄКТ', title: 'Потрібен вебпродукт, автоматизація або AI-інтеграція?',
      text: 'Опишіть задачу — WebRemote запропонує технічний підхід, етапи реалізації та зрозумілі наступні кроки.',
      formTitle: 'Розкажіть про ваш проєкт',
      name: 'Ваше ім’я', email: 'Email', company: 'Компанія (необов’язково)',
      projectType: 'Тип проєкту', projectPlaceholder: 'Оберіть напрям',
      projectOptions: ['Новий вебпродукт або SaaS', 'API та інтеграції', 'AI / LLM інтеграція', 'Модернізація legacy', 'Підтримка та розвиток'],
      budget: 'Орієнтовний бюджет', budgetPlaceholder: 'Оберіть діапазон',
      budgetOptions: ['До $2,000', '$2,000–$5,000', '$5,000–$10,000', 'Понад $10,000', 'Потрібна оцінка'],
      message: 'Коротко опишіть задачу',
      submit: 'Надіслати запит', sending: 'Надсилання…', sent: 'Повідомлення надіслано',
      error: 'Не вдалося надіслати. Спробуйте ще раз.',
      verificationRequired: 'Підтвердьте, що ви не робот.',
      verificationError: 'Не вдалося виконати перевірку. Оновіть її та спробуйте ще раз.',
      privacy: 'Натискаючи кнопку, ви погоджуєтесь на обробку даних для відповіді на запит.',
    },
  },
  en: {
    nav: { home: 'Home', about: 'About WebRemote', stack: 'Expertise', projects: 'Work', contact: 'Contact' },
    hero: {
      kicker: 'Software Engineering Studio',
      title: 'We build digital',
      titleAccent: 'products that move businesses forward.',
      lead: 'WebRemote designs and develops SaaS platforms, REST APIs, AI integrations, enterprise web systems and cloud solutions with Laravel, Node.js, Vue.js and AWS.',
      projects: 'View selected work',
      discuss: 'Discuss a project',
      scroll: 'Explore WebRemote',
    },
    about: {
      number: '01 / ABOUT WEBREMOTE',
      title: 'An engineering approach to web products — from idea to reliable launch.',
      large: 'WebRemote is a software engineering studio. We build modern web products, REST APIs, integrations and modernize complex legacy systems.',
      text: 'Every engagement receives direct technical leadership, transparent communication and a strong focus on business outcomes. Trusted specialists join when needed, while WebRemote remains accountable for architecture and quality.',
      years: 'years of engineering experience', earned: 'earned on Upwork', hours: 'hours of client development',
          },
    stack: { number: '02 / EXPERTISE', title: 'From backend architecture and APIs', accent: 'to interfaces, automation and cloud.' },
    why: { number: '03 / WHY WEBREMOTE', title: 'Why choose WebRemote' },
    projects: { number: '04 / SELECTED WORK', title: 'Products and systems', eyebrow: 'WebRemote project', open: 'View details' },
    contact: {
      number: '05 / START A PROJECT', title: 'Need a web product, automation or AI integration?',
      text: 'Describe your challenge and WebRemote will propose a technical approach, delivery stages and clear next steps.',
      formTitle: 'Tell us about your project',
      name: 'Your name', email: 'Email', company: 'Company (optional)',
      projectType: 'Project type', projectPlaceholder: 'Choose a direction',
      projectOptions: ['New web product or SaaS', 'API and integrations', 'AI / LLM integration', 'Legacy modernization', 'Ongoing support and development'],
      budget: 'Estimated budget', budgetPlaceholder: 'Choose a range',
      budgetOptions: ['Up to $2,000', '$2,000–$5,000', '$5,000–$10,000', 'Over $10,000', 'Need an estimate'],
      message: 'Briefly describe your challenge',
      submit: 'Send inquiry', sending: 'Sending…', sent: 'Message sent',
      error: 'Unable to send. Please try again.',
      verificationRequired: 'Please complete the security verification.',
      verificationError: 'Security verification failed. Refresh it and try again.',
      privacy: 'By submitting, you agree that your details may be used to reply to this request.',
    },
  },
}

const localizedProjects = computed(() => locale.value === 'uk' ? [
  {
    number: '01',
    title: 'DLispi Marketplace',
    description: 'Marketplace-платформа на Laravel 13 і Quasar/Vue 3: авторизація, карти, пошук, S3, realtime та PWA.',
    tags: ['Laravel 13', 'Vue 3', 'Quasar', 'AWS S3'],
  },
  {
    number: '02',
    title: 'Retail API Platform',
    description: 'API та інтеграції для роздрібних мереж: замовлення, товарні залишки, зовнішні сервіси та автоматизація процесів.',
    tags: ['Lumen', 'REST API', 'Redis', 'Integrations'],
  },
  {
    number: '03',
    title: 'Legacy Modernization',
    description: 'Поетапна міграція великого ecommerce-проєкту з Laravel 5 на Laravel 13 зі збереженням бізнес-логіки.',
    tags: ['Laravel', 'Refactoring', 'MySQL', 'Docker'],
  },
  {
    number: '04',
    title: 'AI Business Assistant',
    description: 'AI-помічник для роботи з документами, пошуку у базі знань, генерації відповідей та автоматизації внутрішніх процесів.',
    tags: ['OpenAI API', 'LLM', 'RAG', 'Vector Search', 'Node.js'],
  },
] : [
  {
    number: '01',
    title: 'DLispi Marketplace',
    description: 'A marketplace platform built with Laravel 13 and Quasar/Vue 3, including authentication, maps, search, S3, realtime features and PWA support.',
    tags: ['Laravel 13', 'Vue 3', 'Quasar', 'AWS S3'],
  },
  {
    number: '02',
    title: 'Retail API Platform',
    description: 'APIs and integrations for retail networks covering orders, inventory, external services and process automation.',
    tags: ['Lumen', 'REST API', 'Redis', 'Integrations'],
  },
  {
    number: '03',
    title: 'Legacy Modernization',
    description: 'A staged migration of a large ecommerce system from Laravel 5 to Laravel 13 while preserving critical business logic.',
    tags: ['Laravel', 'Refactoring', 'MySQL', 'Docker'],
  },
  {
    number: '04',
    title: 'AI Business Assistant',
    description: 'An AI-powered assistant for document processing, knowledge search, response generation and workflow automation.',
    tags: ['OpenAI API', 'LLM', 'RAG', 'Vector Search', 'Node.js'],
  },
])




const t = computed(() => translations[locale.value])

const whyItems = computed(() => locale.value === 'uk' ? [
  { number: '01', title: 'Clean Architecture', description: 'Добре структурований і підтримуваний код, розрахований на довгостроковий розвиток продукту.' },
  { number: '02', title: 'Performance First', description: 'Швидкі та оптимізовані застосунки, готові до зростання навантаження й бізнесу.' },
  { number: '03', title: 'Cloud Native', description: 'AWS, Docker, CI/CD і serverless-інфраструктура, підготовлена до стабільної роботи в production.' },
  { number: '04', title: 'AI Integration', description: 'OpenAI, Claude, Gemini, RAG-пошук та автоматизація інтелектуальних бізнес-процесів.' },
  { number: '05', title: 'Long-Term Partnership', description: 'Розвиток, підтримка та модернізація продукту — від MVP до складної корпоративної системи.' },
] : [
  { number: '01', title: 'Clean Architecture', description: 'Well-structured, maintainable software designed for long-term product growth.' },
  { number: '02', title: 'Performance First', description: 'Fast, optimized applications built for scalability, reliability and business growth.' },
  { number: '03', title: 'Cloud Native', description: 'AWS, Docker, CI/CD and serverless infrastructure prepared for stable production use.' },
  { number: '04', title: 'AI Integration', description: 'OpenAI, Claude, Gemini, RAG search and intelligent workflow automation integrated into products.' },
  { number: '05', title: 'Long-Term Partnership', description: 'Continuous development, support and modernization from MVP to enterprise systems.' },
])

const stackItems = computed(() => locale.value === 'uk' ? [
  {
    title: 'PHP / Laravel',
    description: 'Backend-основа для бізнес-логіки, особистих кабінетів, ecommerce, адміністративних систем і масштабованих вебзастосунків.',
  },
  {
    title: 'Node.js',
    description: 'Серверні застосунки, REST API, AWS Lambda, автоматизація, інтеграції, черги та realtime-рішення на сучасному JavaScript.',
  },
  {
    title: 'AI / LLM Integration',
    description: 'Інтеграція OpenAI, Claude, Gemini та інших LLM: AI-помічники, RAG-пошук, генерація контенту, аналіз даних і автоматизація бізнес-процесів.',
  },
  {
    title: 'Vue 3 / TypeScript',
    description: 'Швидкі інтерактивні інтерфейси з передбачуваною структурою коду, типізацією та зручним подальшим розвитком продукту.',
  },
  {
    title: 'REST API / SaaS',
    description: 'API з’єднує сайт, мобільний застосунок і зовнішні сервіси. SaaS дозволяє надавати продукт багатьом клієнтам через єдину платформу.',
  },
  {
    title: 'AWS / Docker',
    description: 'Хмарна інфраструктура, автоматизоване розгортання та ізольоване середовище, щоб застосунок однаково працював локально й на сервері.',
  },
  {
    title: 'PostgreSQL / MySQL',
    description: 'Надійне зберігання даних, продумана структура таблиць, оптимізація запитів і стабільна робота системи зі зростанням навантаження.',
  },
  {
    title: 'Redis / Queues',
    description: 'Прискорення відповідей за допомогою кешу та виконання важких задач у фоні: листи, імпорт, обробка файлів і синхронізація даних.',
  },
  {
    title: 'CI/CD / Testing',
    description: 'Автоматизовані перевірки, тестування та deployment pipelines для передбачуваних і безпечних релізів.',
  },
] : [
  {
    title: 'PHP / Laravel',
    description: 'A reliable backend foundation for business logic, customer portals, ecommerce, admin systems and scalable web applications.',
  },
  {
    title: 'Node.js',
    description: 'Server-side applications, REST APIs, AWS Lambda, automation, integrations, queues and realtime solutions with modern JavaScript.',
  },
  {
    title: 'AI / LLM Integration',
    description: 'Integration of OpenAI, Claude, Gemini and other LLMs for AI assistants, RAG search, content generation, data analysis and workflow automation.',
  },
  {
    title: 'Vue 3 / TypeScript',
    description: 'Fast interactive interfaces with a predictable code structure, type safety and a maintainable path for future product growth.',
  },
  {
    title: 'REST API / SaaS',
    description: 'APIs connect websites, mobile apps and external services. SaaS delivers one platform to multiple customers through a shared product.',
  },
  {
    title: 'AWS / Docker',
    description: 'Cloud infrastructure, repeatable deployments and isolated environments that keep applications consistent from development to production.',
  },
  {
    title: 'PostgreSQL / MySQL',
    description: 'Reliable data storage, well-designed schemas, optimized queries and stable performance as the system and workload grow.',
  },
  {
    title: 'Redis / Queues',
    description: 'Faster responses through caching and background processing for email, imports, file processing and data synchronization.',
  },
  {
    title: 'CI/CD / Testing',
    description: 'Automated checks, testing and deployment pipelines for predictable and safer releases.',
  },
])

function toggleStackItem(index) {
  activeStackIndex.value = activeStackIndex.value === index ? null : index
}

function setLocale(value) {
  locale.value = value
}

const resetContactForm = () => {
  contactForm.value = {
    name: '',
    email: '',
    company: '',
    projectType: '',
    budget: '',
    message: '',
  }

  turnstileToken.value = ''
  formStatus.value = 'idle'
  nextTick(() => turnstileWidget.value?.reset())
}

async function submitContactForm() {
  if (!turnstileToken.value) {
    formStatus.value = 'verification-required'
    return
  }

  formStatus.value = 'sending'

  try {
    const response = await fetch(
        'https://rff28ijdx7.execute-api.eu-central-1.amazonaws.com/contact',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...contactForm.value,
            language: locale.value,
            page: window.location.pathname,
            userAgent: navigator.userAgent,
            turnstileToken: turnstileToken.value,
          }),
        },
    )

    const result = await response.json()

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Unable to send request')
    }

    formStatus.value = 'sent'
  } catch (error) {
    console.error(error)
    turnstileToken.value = ''
    turnstileWidget.value?.reset()
    formStatus.value = 'error'
  }
}

function handleTurnstileVerified(token) {
  turnstileToken.value = token

  if (formStatus.value === 'verification-required' || formStatus.value === 'verification-error') {
    formStatus.value = 'idle'
  }
}

function handleTurnstileExpired() {
  turnstileToken.value = ''
}

function handleTurnstileError() {
  turnstileToken.value = ''
  formStatus.value = 'verification-error'
}

function scrollToSection(id) {
  const target = id === 'home'
    ? document.documentElement
    : document.getElementById(id)

  if (!target) {
    return
  }

  if (id === 'home') {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  } else {
    target.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  history.replaceState(
    null,
    '',
    id === 'home'
      ? `${window.location.pathname}${window.location.search}`
      : `#${id}`,
  )
}

watch(locale, async (value) => {
  localStorage.setItem('webremote-locale', value)
  document.documentElement.lang = value
  await nextTick()
}, { immediate: true })

</script>

<template>
  <div class="site-shell">
    <SiteHeader :locale="locale" :labels="t.nav" @navigate="scrollToSection" @change-locale="setLocale" />
    <main>
      <section id="home" class="panel hero-panel">
        <div class="panel-surface hero-surface">
          <ThreeBackground />
          <div class="hero-content page-width">
            <p class="hero-kicker">{{ t.hero.kicker }}</p>
            <h1>{{ t.hero.title }}<span>{{ t.hero.titleAccent }}</span></h1>
            <p class="hero-lead">{{ t.hero.lead }}</p>
            <div class="hero-actions">
              <a class="button primary" href="#contact" @click.prevent="scrollToSection('contact')">{{ t.hero.discuss }} <span>↘</span></a>
              <a class="text-link" href="#projects" @click.prevent="scrollToSection('projects')">{{ t.hero.projects }}</a>
            </div>
          </div>
          <div class="scroll-note"><span></span>{{ t.hero.scroll }}</div>
        </div>
      </section>

      <section id="about" class="panel light-panel about-panel"><div class="panel-surface"><div class="panel-inner page-width section-grid">
        <div><p class="section-number">{{ t.about.number }}</p><h2>{{ t.about.title }}</h2></div>
        <div class="about-copy"><p class="large-copy">{{ t.about.large }}</p><p>{{ t.about.text }}</p>
          <div class="stats">
          <div><strong>10+</strong><span>{{ t.about.years }}</span></div><div><strong>60K+</strong><span>{{ t.about.earned }}</span></div><div><strong>5K</strong><span>{{ t.about.hours }}</span></div>
        </div></div>
      </div></div></section>

      <section id="stack" class="panel dark-panel stack-panel"><div class="panel-surface"><div class="panel-inner page-width">
        <div class="section-heading"><p class="section-number">{{ t.stack.number }}</p><h2>{{ t.stack.title }}<br>{{ t.stack.accent }}</h2></div>
        <div class="stack-list">
          <article
            v-for="(item, index) in stackItems"
            :key="item.title"
            class="stack-item"
            :class="{ active: activeStackIndex === index }"
          >
            <button
              class="stack-row stack-trigger"
              type="button"
              :aria-expanded="activeStackIndex === index"
              :aria-controls="`stack-description-${index}`"
              @click="toggleStackItem(index)"
            >
              <span class="stack-index">0{{ index + 1 }}</span>
              <h3>{{ item.title }}</h3>
              <span class="stack-arrow" aria-hidden="true">+</span>
            </button>

            <div
              :id="`stack-description-${index}`"
              class="stack-description"
            >
              <div class="stack-description-inner">
                <p>{{ item.description }}</p>
              </div>
            </div>
          </article>
        </div>
      </div></div></section>


      <section id="why" class="panel why-panel">
        <div class="panel-surface">
          <div class="panel-inner page-width">
            <div class="section-heading why-heading">
              <p class="section-number">{{ t.why.number }}</p>
              <h2>{{ t.why.title }}</h2>
            </div>
            <div class="why-grid">
              <article v-for="(item, index) in whyItems" :key="item.number" class="why-card" :class="{ 'why-card-wide': index === whyItems.length - 1 }">
                <div class="why-card-top">
                  <span class="why-number">{{ item.number }}</span>
                  <span class="why-indicator" aria-hidden="true"></span>
                </div>
                <h3>{{ item.title }}</h3>
                <p>{{ item.description }}</p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section id="projects" class="panel projects-panel"><div class="panel-surface"><div class="panel-inner page-width">
        <div class="section-heading projects-heading"><p class="section-number">{{ t.projects.number }}</p><h2>{{ t.projects.title }}</h2></div>
        <div class="project-list"><ProjectCard v-for="project in localizedProjects" :key="project.number" v-bind="project" :eyebrow="t.projects.eyebrow" :open-label="t.projects.open" /></div>
      </div></div></section>

      <section id="contact" class="panel contact-panel"><div class="contact-orbit orbit-one"></div><div class="contact-orbit orbit-two"></div><div class="panel-surface"><div class="panel-inner page-width contact-content">
        <div class="contact-layout">
          <div class="contact-intro">
            <p class="section-number">{{ t.contact.number }}</p>
            <h2>{{ t.contact.title }}</h2>
            <p>{{ t.contact.text }}</p>
            <a class="contact-link" href="mailto:info@webremote.net">info@webremote.net <span>↗</span></a>
          </div>

          <Transition
              name="contact-swap"
              mode="out-in"
          >
            <form
                v-if="formStatus !== 'sent'"
                key="contact-form"
                class="contact-form"
                @submit.prevent="submitContactForm"
            >
              <h3>{{ t.contact.formTitle }}</h3>

              <div class="form-grid">
                <label>
                  <span>{{ t.contact.name }}</span>

                  <input
                      v-model.trim="contactForm.name"
                      type="text"
                      autocomplete="name"
                      required
                  >
                </label>

                <label>
                  <span>{{ t.contact.email }}</span>

                  <input
                      v-model.trim="contactForm.email"
                      type="email"
                      autocomplete="email"
                      required
                  >
                </label>

                <label class="form-wide">
                  <span>{{ t.contact.company }}</span>

                  <input
                      v-model.trim="contactForm.company"
                      type="text"
                      autocomplete="organization"
                  >
                </label>

                <label>
                  <span>{{ t.contact.projectType }}</span>

                  <select
                      v-model="contactForm.projectType"
                      required
                  >
                    <option
                        value=""
                        disabled
                    >
                      {{ t.contact.projectPlaceholder }}
                    </option>

                    <option
                        v-for="option in t.contact.projectOptions"
                        :key="option"
                        :value="option"
                    >
                      {{ option }}
                    </option>
                  </select>
                </label>

                <label>
                  <span>{{ t.contact.budget }}</span>

                  <select
                      v-model="contactForm.budget"
                      required
                  >
                    <option
                        value=""
                        disabled
                    >
                      {{ t.contact.budgetPlaceholder }}
                    </option>

                    <option
                        v-for="option in t.contact.budgetOptions"
                        :key="option"
                        :value="option"
                    >
                      {{ option }}
                    </option>
                  </select>
                </label>

                <label class="form-wide">
                  <span>{{ t.contact.message }}</span>

                  <textarea
                      v-model.trim="contactForm.message"
                      rows="5"
                      required
                  ></textarea>
                </label>
              </div>

              <TurnstileWidget
                  v-if="turnstileSiteKey"
                  ref="turnstileWidget"
                  class="form-wide"
                  :site-key="turnstileSiteKey"
                  :language="locale"
                  @verified="handleTurnstileVerified"
                  @expired="handleTurnstileExpired"
                  @error="handleTurnstileError"
              />

              <p v-else class="form-error form-wide">
                VITE_TURNSTILE_SITE_KEY is not configured.
              </p>

              <button
                  class="form-submit"
                  type="submit"
                  :disabled="formStatus === 'sending' || !turnstileSiteKey"
              >
                {{
                  formStatus === 'sending'
                      ? t.contact.sending
                      : t.contact.submit
                }}

                <span>↗</span>
              </button>

              <p v-if="formStatus === 'error'" class="form-error">
                {{ t.contact.error }}
              </p>

              <p v-else-if="formStatus === 'verification-required'" class="form-error">
                {{ t.contact.verificationRequired }}
              </p>

              <p v-else-if="formStatus === 'verification-error'" class="form-error">
                {{ t.contact.verificationError }}
              </p>

              <p class="form-privacy">
                {{ t.contact.privacy }}
              </p>
            </form>

            <div
                v-else
                key="contact-success"
                class="contact-success"
            >
              <div class="success-icon">
                <svg
                    viewBox="0 0 52 52"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                      cx="26"
                      cy="26"
                      r="25"
                      class="success-circle"
                  />

                  <path
                      d="M15 27L23 35L38 18"
                      class="success-check"
                  />
                </svg>
              </div>

              <p class="success-eyebrow">
                {{
                  locale === 'uk'
                      ? 'ПОВІДОМЛЕННЯ НАДІСЛАНО'
                      : 'MESSAGE SENT'
                }}
              </p>

              <h3>
                {{
                  locale === 'uk'
                      ? 'Дякую за звернення!'
                      : 'Thank you!'
                }}
              </h3>

              <p class="success-text">
                {{
                  locale === 'uk'
                      ? 'Ваш запит успішно отримано. WebRemote зв’яжеться з вами найближчим часом.'
                      : 'Your request has been received successfully. WebRemote will get back to you as soon as possible.'
                }}
              </p>

              <div class="success-info">
                <strong>
                  {{
                    locale === 'uk'
                        ? 'Зазвичай відповідаємо'
                        : 'Typical response time'
                  }}
                </strong>

                <span>
                  {{
                    locale === 'uk'
                        ? 'протягом одного робочого дня'
                        : 'within one business day'
                  }}
                </span>
              </div>

              <button
                  class="form-submit success-button"
                  type="button"
                  @click="resetContactForm"
              >
                {{
                  locale === 'uk'
                      ? 'Надіслати ще один запит'
                      : 'Send another request'
                }}

                <span>↗</span>
              </button>
            </div>
          </Transition>
        </div>
        <footer><span>© {{ new Date().getFullYear() }} WebRemote</span><span>Laravel · Node.js · Vue.js · AWS · AI / LLM</span></footer>
      </div></div></section>
    </main>
  </div>
</template>
