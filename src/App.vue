<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import SiteHeader from './components/SiteHeader.vue'
import HeroSection from './components/HeroSection.vue'
import AboutSection from './components/AboutSection.vue'
import StackSection from './components/StackSection.vue'
import WhySection from './components/WhySection.vue'
import ProjectsSection from './components/ProjectsSection.vue'
import ContactSection from './components/ContactSection.vue'


const formStatus = ref('idle')
const turnstileToken = ref('')
const contactSection = ref(null)
const turnstileSiteKey = import.meta.env.TURNSTILE_SITE_KEY
const contactApiUrl = import.meta.env.CONTACT_API_URL
  || 'https://rff28ijdx7.execute-api.eu-central-1.amazonaws.com/contact'
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
      years: 'років інженерного досвіду', expertise: 'напрямів технічної експертизи', hours: 'годин клієнтської розробки',
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
      years: 'years of engineering experience', expertise: 'areas of technical expertise', hours: 'hours of client development',
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
  nextTick(() => contactSection.value?.resetTurnstile())
}

async function submitContactForm() {
  if (!turnstileToken.value) {
    formStatus.value = 'verification-required'
    return
  }

  formStatus.value = 'sending'

  try {
    const response = await fetch(
        contactApiUrl,
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
    contactSection.value?.resetTurnstile()
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
      <HeroSection :content="t.hero" @navigate="scrollToSection" />
      <AboutSection :content="t.about" />
      <StackSection
        :content="t.stack"
        :items="stackItems"
        :active-index="activeStackIndex"
        @toggle="toggleStackItem"
      />
      <WhySection :content="t.why" :items="whyItems" />
      <ProjectsSection :content="t.projects" :projects="localizedProjects" />
      <ContactSection
        ref="contactSection"
        :content="t.contact"
        :form="contactForm"
        :status="formStatus"
        :locale="locale"
        :turnstile-site-key="turnstileSiteKey"
        @submit="submitContactForm"
        @reset="resetContactForm"
        @turnstile-verified="handleTurnstileVerified"
        @turnstile-expired="handleTurnstileExpired"
        @turnstile-error="handleTurnstileError"
      />
    </main>
  </div>
</template>
