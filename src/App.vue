<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import SiteHeader from './components/SiteHeader.vue'
import ThreeBackground from './components/ThreeBackground.vue'
import ProjectCard from './components/ProjectCard.vue'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

const siteRoot = ref(null)
const formStatus = ref('idle')
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
let gsapContext
let scrollTween

const translations = {
  uk: {
    nav: { home: 'Головна', about: 'Про WebRemote', stack: 'Експертиза', projects: 'Проєкти', contact: 'Контакти' },
    hero: {
      kicker: 'Software Engineering Studio',
      title: 'Створюємо цифрові',
      titleAccent: 'продукти, що рухають бізнес уперед.',
      lead: 'WebRemote проєктує та розробляє SaaS-платформи, REST API, корпоративні вебсистеми й хмарні рішення на Laravel, Vue.js та AWS.',
      projects: 'Переглянути роботи',
      discuss: 'Обговорити проєкт',
      scroll: 'Дізнайтеся більше',
    },
    about: {
      number: '01 / ПРО WEBREMOTE',
      title: 'Інженерний підхід до вебпродуктів — від ідеї до стабільного запуску.',
      large: 'WebRemote — software engineering studio, заснована та очолювана Vitaliy Z. Ми створюємо нові продукти, API та інтеграції, а також модернізуємо складні legacy-системи.',
      text: 'Кожен проєкт отримує пряме технічне лідерство, прозору комунікацію та фокус на бізнес-результаті. За потреби до роботи підключаються перевірені спеціалісти, а відповідальність за архітектуру та якість залишається в WebRemote.',
      years: 'років інженерного досвіду', earned: 'зароблено на Upwork', hours: 'годин клієнтської розробки',
      founder: 'Засновник і Lead Developer — Vitaliy Z.',
    },
    stack: { number: '02 / ЕКСПЕРТИЗА', title: 'Від архітектури та API', accent: 'до інтерфейсу й хмари.' },
    projects: { number: '03 / ВИБРАНІ РОБОТИ', title: 'Продукти та системи', eyebrow: 'Проєкт WebRemote', open: 'Детальніше' },
    contact: {
      number: '04 / ПОЧНІМО ПРОЄКТ', title: 'Потрібен надійний технологічний партнер?',
      text: 'Опишіть задачу — WebRemote запропонує технічний підхід, етапи реалізації та наступні кроки.',
      formTitle: 'Розкажіть про ваш проєкт',
      name: 'Ваше ім’я', email: 'Email', company: 'Компанія (необов’язково)',
      projectType: 'Тип проєкту', projectPlaceholder: 'Оберіть напрям',
      projectOptions: ['Новий вебпродукт або SaaS', 'API та інтеграції', 'Модернізація legacy', 'Підтримка та розвиток'],
      budget: 'Орієнтовний бюджет', budgetPlaceholder: 'Оберіть діапазон',
      budgetOptions: ['До $2,000', '$2,000–$5,000', '$5,000–$10,000', 'Понад $10,000', 'Потрібна оцінка'],
      message: 'Коротко опишіть задачу',
      submit: 'Надіслати запит', sending: 'Надсилання…', sent: 'Повідомлення надіслано',
      error: 'Не вдалося надіслати. Спробуйте ще раз.',
      privacy: 'Натискаючи кнопку, ви погоджуєтесь на обробку даних для відповіді на запит.',
    },
  },
  en: {
    nav: { home: 'Home', about: 'About WebRemote', stack: 'Expertise', projects: 'Work', contact: 'Contact' },
    hero: {
      kicker: 'Software Engineering Studio',
      title: 'We build digital',
      titleAccent: 'products that move businesses forward.',
      lead: 'WebRemote designs and develops SaaS platforms, REST APIs, enterprise web systems and cloud solutions with Laravel, Vue.js and AWS.',
      projects: 'View selected work',
      discuss: 'Discuss a project',
      scroll: 'Explore WebRemote',
    },
    about: {
      number: '01 / ABOUT WEBREMOTE',
      title: 'An engineering approach to web products — from idea to reliable launch.',
      large: 'WebRemote is a software engineering studio founded and led by Vitaliy Z. We build new products, APIs and integrations, and modernize complex legacy systems.',
      text: 'Every engagement receives direct technical leadership, transparent communication and a strong focus on business outcomes. Trusted specialists join when needed, while WebRemote remains accountable for architecture and quality.',
      years: 'years of engineering experience', earned: 'earned on Upwork', hours: 'hours of client development',
      founder: 'Founder & Lead Developer — Vitaliy Z.',
    },
    stack: { number: '02 / EXPERTISE', title: 'From architecture and APIs', accent: 'to interfaces and cloud.' },
    projects: { number: '03 / SELECTED WORK', title: 'Products and systems', eyebrow: 'WebRemote project', open: 'View details' },
    contact: {
      number: '04 / START A PROJECT', title: 'Looking for a reliable technology partner?',
      text: 'Describe your challenge and WebRemote will propose a technical approach, delivery stages and clear next steps.',
      formTitle: 'Tell us about your project',
      name: 'Your name', email: 'Email', company: 'Company (optional)',
      projectType: 'Project type', projectPlaceholder: 'Choose a direction',
      projectOptions: ['New web product or SaaS', 'API and integrations', 'Legacy modernization', 'Ongoing support and development'],
      budget: 'Estimated budget', budgetPlaceholder: 'Choose a range',
      budgetOptions: ['Up to $2,000', '$2,000–$5,000', '$5,000–$10,000', 'Over $10,000', 'Need an estimate'],
      message: 'Briefly describe your challenge',
      submit: 'Send inquiry', sending: 'Sending…', sent: 'Message sent',
      error: 'Unable to send. Please try again.',
      privacy: 'By submitting, you agree that your details may be used to reply to this request.',
    },
  },
}

const localizedProjects = computed(() => locale.value === 'uk' ? [
  { number: '01', title: 'DLispi Marketplace', description: 'Marketplace-платформа на Laravel 13 і Quasar/Vue 3: авторизація, карти, пошук, S3, realtime та PWA.', tags: ['Laravel 13', 'Vue 3', 'Quasar', 'AWS S3'] },
  { number: '02', title: 'Retail API Platform', description: 'API та інтеграції для роздрібних мереж: замовлення, товарні залишки, зовнішні сервіси та автоматизація процесів.', tags: ['Lumen', 'REST API', 'Redis', 'Integrations'] },
  { number: '03', title: 'Legacy Modernization', description: 'Поетапна міграція великого ecommerce-проєкту з Laravel 5 на Laravel 13 зі збереженням бізнес-логіки.', tags: ['Laravel', 'Refactoring', 'MySQL', 'Docker'] },
] : [
  { number: '01', title: 'DLispi Marketplace', description: 'A marketplace platform built with Laravel 13 and Quasar/Vue 3, including authentication, maps, search, S3, realtime features and PWA support.', tags: ['Laravel 13', 'Vue 3', 'Quasar', 'AWS S3'] },
  { number: '02', title: 'Retail API Platform', description: 'APIs and integrations for retail networks covering orders, inventory, external services and process automation.', tags: ['Lumen', 'REST API', 'Redis', 'Integrations'] },
  { number: '03', title: 'Legacy Modernization', description: 'A staged migration of a large ecommerce system from Laravel 5 to Laravel 13 while preserving critical business logic.', tags: ['Laravel', 'Refactoring', 'MySQL', 'Docker'] },
])

const t = computed(() => translations[locale.value])
const stack = ['PHP / Laravel', 'Vue 3 / TypeScript', 'REST API / SaaS', 'AWS / Docker', 'PostgreSQL / MySQL', 'Redis / Queues']

function setLocale(value) {
  locale.value = value
}

function onContactLeave(element, done) {
  if (!element) {
    done()
    return
  }

  gsap.killTweensOf(element)

  gsap.to(element, {
    opacity: 0,
    scale: 0.97,
    y: -20,
    duration: 0.28,
    ease: 'power2.in',
    overwrite: true,
    onComplete: done,
  })
}

function onContactEnter(element, done) {
  if (!element) {
    done()
    return
  }

  const circle = element.querySelector('.success-circle')
  const check = element.querySelector('.success-check')
  const contentElements = element.querySelectorAll(
    '.success-eyebrow, .contact-success h3, .success-text, .success-info, .success-button',
  )

  gsap.killTweensOf(element)

  gsap.set(element, {
    opacity: 0,
    scale: 0.97,
    y: 30,
  })

  if (circle) {
    gsap.set(circle, {
      strokeDasharray: 160,
      strokeDashoffset: 160,
    })
  }

  if (check) {
    gsap.set(check, {
      strokeDasharray: 50,
      strokeDashoffset: 50,
    })
  }

  if (contentElements.length) {
    gsap.set(contentElements, {
      opacity: 0,
      y: 16,
    })
  }

  const timeline = gsap.timeline({ onComplete: done })

  timeline.to(element, {
    opacity: 1,
    scale: 1,
    y: 0,
    duration: 0.45,
    ease: 'power3.out',
  })

  if (circle) {
    timeline.to(circle, {
      strokeDashoffset: 0,
      duration: 0.55,
      ease: 'power2.out',
    }, '-=0.25')
  }

  if (check) {
    timeline.to(check, {
      strokeDashoffset: 0,
      duration: 0.35,
      ease: 'power2.out',
    }, '-=0.15')
  }

  if (contentElements.length) {
    timeline.to(contentElements, {
      opacity: 1,
      y: 0,
      duration: 0.35,
      stagger: 0.07,
      ease: 'power2.out',
    }, '-=0.2')
  }
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

  formStatus.value = 'idle'
}

async function submitContactForm() {
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
    formStatus.value = 'error'
  }
}

function scrollToSection(id) {
  if (scrollTween) {
    scrollTween.kill()
    scrollTween = null
  }

  gsap.killTweensOf(window)

  const targetY = id === 'home'
      ? 0
      : document.getElementById(id)?.offsetTop

  if (typeof targetY !== 'number') {
    return
  }

  scrollTween = gsap.to(window, {
    duration: 0.55,

    scrollTo: {
      y: targetY,
      autoKill: false,
    },

    ease: 'power2.out',
    overwrite: true,

    onUpdate: () => {
      ScrollTrigger.update()
    },

    onComplete: () => {
      if (id === 'home') {
        window.scrollTo(0, 0)
      }

      if (id === 'stack') {
        gsap.set('.stack-row', {
          opacity: 1,
          x: 0,
          clearProps: 'transform',
        })
      }

      history.replaceState(
          null,
          '',
          id === 'home'
              ? `${window.location.pathname}${window.location.search}`
              : `#${id}`,
      )

      ScrollTrigger.update()
      scrollTween = null
    },
  })
}

watch(locale, async (value) => {
  localStorage.setItem('webremote-locale', value)
  document.documentElement.lang = value
  await nextTick()
  ScrollTrigger.refresh()
}, { immediate: true })

onMounted(async () => {
  await nextTick()

  const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches

  if (reduceMotion) {
    gsap.set(
      '.panel-inner, .stack-row, .project-card, .hero-content, .three-background',
      {
        clearProps: 'all',
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
      },
    )
    return
  }

  gsapContext = gsap.context(() => {
    const media = gsap.matchMedia()

    media.add('(min-width: 901px)', () => {
      const panels = gsap.utils.toArray('.panel')

      panels.forEach((panel, index) => {
        const content = panel.querySelector('.panel-inner')

        if (content && index > 0) {
          gsap.fromTo(
            content,
            { y: 48 },
            {
              y: 0,
              ease: 'none',
              scrollTrigger: {
                trigger: panel,
                start: 'top 92%',
                end: 'top 38%',
                scrub: 0.7,
                invalidateOnRefresh: true,
              },
            },
          )
        }

        if (index < panels.length - 1) {
          gsap.to(panel, {
            scale: 0.985,
            y: -12,
            transformOrigin: 'center top',
            ease: 'none',
            scrollTrigger: {
              trigger: panels[index + 1],
              start: 'top 100%',
              end: 'top 22%',
              scrub: true,
              invalidateOnRefresh: true,
            },
          })
        }
      })

      gsap.to('.hero-content', {
        y: -48,
        ease: 'none',
        scrollTrigger: {
          trigger: '#home',
          start: 'top top',
          end: 'bottom 35%',
          scrub: true,
          invalidateOnRefresh: true,
        },
      })

      gsap.to('.three-background', {
        scale: 1.05,
        ease: 'none',
        scrollTrigger: {
          trigger: '#home',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          invalidateOnRefresh: true,
        },
      })

      const stackRows = gsap.utils.toArray('.stack-row')

      gsap.fromTo(
        stackRows,
        { opacity: 0, x: 28 },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          stagger: 0.05,
          ease: 'power2.out',
          overwrite: true,
          scrollTrigger: {
            trigger: '.stack-list',
            start: 'top 88%',
            once: true,
            invalidateOnRefresh: true,
          },
        },
      )

      gsap.from('.project-card', {
        y: 54,
        opacity: 0,
        scale: 0.985,
        duration: 0.65,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.project-list',
          start: 'top 85%',
          once: true,
          invalidateOnRefresh: true,
        },
      })
    })

    media.add('(max-width: 900px)', () => {
      gsap.set('.panel, .panel-inner, .stack-row, .project-card', {
        clearProps: 'transform,filter,opacity,visibility',
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
      })

      gsap.from('.about-panel .panel-inner', {
        y: 24,
        opacity: 0,
        duration: 0.55,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.about-panel',
          start: 'top 88%',
          once: true,
        },
      })

      gsap.from('.stack-row', {
        y: 18,
        opacity: 0,
        duration: 0.42,
        stagger: 0.04,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.stack-list',
          start: 'top 90%',
          once: true,
        },
      })

      gsap.from('.project-card', {
        y: 24,
        opacity: 0,
        duration: 0.5,
        stagger: 0.07,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.project-list',
          start: 'top 90%',
          once: true,
        },
      })

      gsap.from('.contact-layout', {
        y: 24,
        opacity: 0,
        duration: 0.55,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.contact-panel',
          start: 'top 88%',
          once: true,
        },
      })
    })

    return () => media.revert()
  }, siteRoot.value)

  window.setTimeout(() => {
    ScrollTrigger.refresh()
  }, 150)
})

onBeforeUnmount(() => {
  scrollTween?.kill()
  gsapContext?.revert()
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
})
</script>

<template>
  <div ref="siteRoot" class="site-shell">
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
              <button class="button primary" type="button" @click="scrollToSection('projects')">{{ t.hero.projects }} <span>↘</span></button>
              <button class="text-link" type="button" @click="scrollToSection('contact')">{{ t.hero.discuss }}</button>
            </div>
          </div>
          <div class="scroll-note"><span></span>{{ t.hero.scroll }}</div>
        </div>
      </section>

      <section id="about" class="panel light-panel about-panel"><div class="panel-surface"><div class="panel-inner page-width section-grid">
        <div><p class="section-number">{{ t.about.number }}</p><h2>{{ t.about.title }}</h2></div>
        <div class="about-copy"><p class="large-copy">{{ t.about.large }}</p><p>{{ t.about.text }}</p><p class="founder-line">{{ t.about.founder }}</p><div class="stats">
          <div><strong>10+</strong><span>{{ t.about.years }}</span></div><div><strong>60K+</strong><span>{{ t.about.earned }}</span></div><div><strong>5K</strong><span>{{ t.about.hours }}</span></div>
        </div></div>
      </div></div></section>

      <section id="stack" class="panel dark-panel stack-panel"><div class="panel-surface"><div class="panel-inner page-width">
        <div class="section-heading"><p class="section-number">{{ t.stack.number }}</p><h2>{{ t.stack.title }}<br>{{ t.stack.accent }}</h2></div>
        <div class="stack-list"><div v-for="(item,index) in stack" :key="item" class="stack-row"><span>0{{ index + 1 }}</span><h3>{{ item }}</h3><span class="stack-arrow">↗</span></div></div>
      </div></div></section>

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
            <a class="contact-link" href="mailto:hello@webremote.net">hello@webremote.net <span>↗</span></a>
          </div>

          <Transition
              mode="out-in"
              :css="false"
              @leave="onContactLeave"
              @enter="onContactEnter"
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

              <button
                  class="form-submit"
                  type="submit"
                  :disabled="formStatus === 'sending'"
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
        <footer><span>© {{ new Date().getFullYear() }} WebRemote</span><span>Founded by Vitaliy Z. · Laravel · Vue · AWS</span></footer>
      </div></div></section>
    </main>
  </div>
</template>