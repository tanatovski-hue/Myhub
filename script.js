/**
 * HuntOS — B2B Sales Copilot
 * Полный монолитный файл логики (Этап 5 + Выгрузка исходного ZIP-архива HuntOS-B2B-v5.zip): script.js
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'huntos_b2b_state_v5';

  /* ==========================================================================
     1. ЭТАЛОННЫЕ ДАННЫЕ (Екатеринбург B2B, 6 СКРИПТОВ, 6 ВОЗРАЖЕНИЙ) И STATE
     ========================================================================== */
  const DEFAULT_CLIENTS_EKB = [
    {
      id: 'ekb-1',
      company: 'ООО «УралСтройЛогистик»',
      inn: '6671093421',
      phone: '79123456789',
      comment: 'г. Екатеринбург, ул. Малышева 51 (БЦ Высоцкий, 14 этаж). Платят 16 500 ₽ за 100 Мбит, нужен стат. IP и резерв 1С',
      amount: 10900,
      status: 'КП отправлено',
      countedInKpi: false,
    },
    {
      id: 'ekb-2',
      company: 'АО «УралГидроМаш-Проект»',
      inn: '6658391044',
      phone: '79221104580',
      comment: 'г. Екатеринбург, Сибирский тракт 12 (БЦ Квартал). Падает радиоканал, нужна оптика ВОЛС 500 Мбит/с с SLA 99.9%',
      amount: 14500,
      status: 'В работе',
      countedInKpi: false,
    },
    {
      id: 'ekb-3',
      company: 'ООО «МедЛаб-Екатеринбург»',
      inn: '6670412890',
      phone: '79089001234',
      comment: 'г. Екатеринбург, ул. Куйбышева 44Д (ЦМТЕ). Критичен белый пул IP /29 для передачи МРТ-снимков и телефонии',
      amount: 12800,
      status: 'Новый',
      countedInKpi: false,
    },
    {
      id: 'ekb-4',
      company: 'ИП Колесников Андрей Викторович (Сеть «АвтоСклад96»)',
      inn: '667901482910',
      phone: '79126058899',
      comment: 'г. Екатеринбург, пр. Космонавтов 18 (Промзона Уралмаш). Тормозит облачная 1С:Торговля, ждут КП на оптику',
      amount: 8900,
      status: 'Новый',
      countedInKpi: false,
    },
  ];

  // 6 готовых сценариев без канцелярщины для корпоративного интернета (Этап 5)
  const DEFAULT_SCRIPTS = [
    {
      id: 's-1',
      category: 'Холодный заход в WA',
      title: '1) Холодный заход в WhatsApp после 30-сек звонка (сверка счёта)',
      content:
        'Добрый день! Мы с вами минуту назад говорили по телефону по поводу интернета для {КОМПАНИЯ} (ИНН {ИНН}).\n\nКак обещал — пишу коротко без воды. Наш оптический узел «{МОЯ_КОМПАНИЯ}» уже стоит в вашем здании. Соседним офисам мы сейчас срезали ежемесячный счёт до {СУММА} ₽/мес за выделенную оптику со статическим IP и фиксацией цены на 24 месяца.\n\nСкиньте просто фото или сумму последнего счёта от текущего провайдера — за 5 минут посчитаю, сколько чистых денег сэкономим для {КОМПАНИЯ} за год.',
    },
    {
      id: 's-2',
      category: 'Резервный ввод 1С',
      title: '2) Продажа резервного оптического ввода под кассы и 1С (страховка от аварий)',
      content:
        'Коллеги из {КОМПАНИЯ} (ИНН {ИНН}), приветствую!\n\nКогда у основного оператора рвётся кабель на улице или ложится маршрутизатор, облачная 1С, эквайринг, кассы и IP-телефония встают минимум на полдня. Один такой простой офиса обходится дороже годового контракта на связь.\n\nМы в «{МОЯ_КОМПАНИЯ}» заводим второй независимый оптический луч с автопереключением за 50 мс (BGP/VRRP) и финансовым SLA 99.9%. Спецтариф под резерв — от {СУММА} ₽/мес. Давайте проверим свободный порт в вашем узле связи?',
    },
    {
      id: 's-3',
      category: 'Холодный заход в WA',
      title: '3) Бесшовная миграция с экономией 15–20% при индексации тарифов оператора',
      content:
        'Здравствуйте! В этом квартале большинство старых провайдеров снова проиндексировали архивные B2B-тарифы на 15–25%.\n\nДля {КОМПАНИЯ} (ИНН {ИНН}) у нас в «{МОЯ_КОМПАНИЯ}» согласована программа бесшовной миграции: мы даём ту же или более высокую скорость по оптике на 15–20% дешевле вашего текущего счёта (ориентир — {СУММА} ₽/мес), выдаём белые статические IP заранее за 3 дня и переключаем порт без единой минуты простоя офиса.\n\nПрислать сравнительную табличку на 3 строчки прямо сюда в WhatsApp?',
    },
    {
      id: 's-4',
      category: 'Проход секретаря',
      title: '4) Проход секретаря по техническому регламенту узла связи в здании',
      content:
        'Добрый день! Это инженерная служба корпоративной сети «{МОЯ_КОМПАНИЯ}».\n\nЗвоню по регламенту обслуживания оптического узла связи в вашем здании — проверяем резервирование портов и статическую маршрутизацию для {КОМПАНИЯ} (ИНН {ИНН}).\n\nПереключите, пожалуйста, на системного администратора или сотрудника, который отвечает за бесперебойную работу серверов и 1С, либо продиктуйте его прямой мобильный для технической сверки на 1 минуту.',
    },
    {
      id: 's-5',
      category: 'Дожим КП',
      title: '5) Дожим зависшего КП через бронь оптического порта',
      content:
        'Добрый день! Возвращаюсь по нашему расчёту интернета для {КОМПАНИЯ} (ИНН {ИНН}) на {СУММА} ₽/мес.\n\nСтарший инженер предупредил, что в домовом коммутаторе вашего БЦ осталось всего 2 свободных гигабитных оптических порта — завтра их могут забрать под соседних арендаторов, а квота на бесплатную сварку оптики (экономия 15 000 ₽ на старте) закрывается в пятницу.\n\nПодтвердите одним словом «Бронь» в ответ — я придержу порт за {КОМПАНИЯ} до подписания договора без обязательств.',
    },
    {
      id: 's-6',
      category: 'Дожим КП',
      title: '6) Быстрый запрос ИНН для бесплатной проверки технической готовности',
      content:
        'Здравствуйте! Чтобы я не отнимал время пустыми презентациями «{МОЯ_КОМПАНИЯ}», давайте я за 10 минут бесплатно проверю техническую готовность оптического ввода для {КОМПАНИЯ}.\n\nСкиньте в ответ только ИНН ({ИНН}) и точный адрес вашего офиса/склада. Инженер посмотрит карту ВОЛС, и я сразу напишу: есть ли готовый порт в здании и какую минимальную цену (от {СУММА} ₽/мес) сможем зафиксировать.',
    },
  ];

  // 6 жёстких реальных возражений B2B (Этап 5)
  const DEFAULT_OBJECTIONS = [
    {
      role: 'Собственник / Директор офиса',
      quote: '«У нас уже есть провайдер, всё устраивает»',
      rebuttal:
        '«Отлично, что текущая связь не сбоит! Именно когда всё работает спокойно, руководители в вашем БЦ подключают оптику «Планеты» по двум причинам: либо чтобы срезать раздутый архивный счёт на 20–30% без смены настроек сети, либо чтобы поставить независимый резервный ввод под 1С и кассы. Подскажите, сколько вы сейчас платите в месяц — сверим за 1 минуту, не переплачиваете ли вы по старому тарифу?»',
      takeaway:
        'Формула перехвата: Согласие + Развилка (аудит переплаты по счёту ИЛИ страховка от простоя офиса) + Встречный вопрос о сумме текущего счёта.',
      context: 'Сценарий 1 из 6 · Холодный контакт с директором компании (офис 30 рабочих мест)',
      sampleAnswer:
        'Понимаю, отлично, что интернет работает! Но мы предлагаем провести 2-минутный аудит счёта: в вашем здании мы снижаем абонентскую плату на 20% за счёт прямого оптического порта, плюс даём независимый резерв под 1С и кассы с финансовым SLA 99.9%, чтобы простой офиса при обрыве кабеля никогда не остановил отгрузки. Сколько сейчас платите по счёту — сверим цифры в WhatsApp?',
    },
    {
      role: 'Офис-менеджер / Коммерческий директор',
      quote: '«Скиньте на общую почту info@, мы посмотрим»',
      rebuttal:
        '«На общую почту info@ падают десятки спам-писем каждый день, и расчёт экономии там просто потеряется. Чтобы я не слал вам 10-страничную презентацию, давайте сделаем проще: я прямо сейчас пришлю вам в WhatsApp всего 3 строчки — скорость по оптике, гарантию SLA 99.9% и точную годовую выгоду для вашего ИНН. На этот номер удобно принять сообщение?»',
      takeaway:
        'Формула перехвата: Разоблачение ловушки info@ + Обещание короткой выжимки из 3 строк (аудит счёта и SLA) + Закрывающий вопрос на WhatsApp.',
      context: 'Сценарий 2 из 6 · Попытка клиента слить разговор на общую корпоративную почту',
      sampleAnswer:
        'Согласен, но на общей почте info@ письмо утонет среди спама, а речь идёт о сокращении расходов и защите от простоя офиса. Давайте я не буду слать воду, а сделаю быстрый аудит счёта и пришлю 3 строчки в WhatsApp: тариф с экономией 20%, оптический резерв для 1С и условия SLA 99.9%. Отправляю на этот номер?',
    },
    {
      role: 'Руководитель небольшой компании',
      quote: '«Слишком дорого, нам интернет только для почты нужен»',
      rebuttal:
        '«Понимаю, переплачивать за лишние гигабиты не нужно. Но сегодня даже "просто почта" — это ЭДО (Диадок/СБИС), облачная 1С, клиент-банк и звонки через мессенджеры. Если дешёвый канал ляжет в день сдачи отчётности или оплаты счетов, один час простоя офиса обойдётся в десятки тысяч рублей. Давайте подберём базовый оптический тариф с SLA 99.9% и сравним с вашим текущим счётом — какую сумму вы сейчас считаете комфортной?»',
      takeaway:
        'Формула перехвата: Присоединение к разумной экономии + Перевод "почты" в стоимость часа простоя ЭДО/1С/банка + Вопрос о комфортном бюджете.',
      context: 'Сценарий 3 из 6 · Клиент занижает ценность канала связи и давит по цене',
      sampleAnswer:
        'Понимаю вас, лишняя скорость для почты не нужна. Но кроме почты на канале висят банк-клиент, ЭДО и облачная 1С: если связь оборвётся, простой офиса встанет в разы дороже абонентской платы. Мы даём выделенный оптический канал/резерв с финансовым SLA 99.9% и делаем аудит счёта, чтобы уложиться в ваш бюджет. Сколько сейчас платите в месяц?',
    },
    {
      role: 'Владелец торговой точки / Склада',
      quote: '«Мы сидим на мобильном роутере, нам хватает»',
      rebuttal:
        '«Мобильный роутер хорош как временное решение, но у сотовой вышки нет гарантированной скорости и белого статического IP: вечером или в непогоду пинг растёт, онлайн-кассы и 1С начинают зависать, а терминалы оплаты теряют связь. Мы заводим в здание выделенную оптику с SLA 99.9%, а ваш 4G-роутер бесплатно настроим как автоматический резерв. Подскажите ваш ИНН или точный адрес — проверим, сколько стоит завести оптический кабель в ваше помещение?»',
      takeaway:
        'Формула перехвата: Похвала за прагматизм + Удар в нестабильность 4G для касс/1С/IP + Сохранение роутера как резерва + Запрос адреса/ИНН.',
      context: 'Сценарий 4 из 6 · Клиент использует 4G/LTE сим-карту вместо выделенной оптики',
      sampleAnswer:
        'Мобильный роутер удобен на старте, но сотовая сеть не даёт SLA 99.9% и белого IP: при перегрузке базовой станции кассы и 1С виснут, что вызывает простой офиса и потерю выручки. Давайте заведём основную оптику после аудита счёта, а ваш мобильный роутер оставим как второй резерв на случай аварий. Напишете ИНН и адрес для проверки порта в WhatsApp?',
    },
    {
      role: 'Системный администратор / ИТ-специалист',
      quote: '«Я сисадмин, меня текущий канал полностью устраивает, не звоните сюда»',
      rebuttal:
        '«Коллега, именно как технаря я вас отлично понимаю: когда сеть настроена, трогать рабочую схему ради менеджеров никто не хочет. Я звоню не ломать вашу маршрутизацию, а предложить второй независимый оптический ввод от другого магистрального узла под BGP/VRRP-резерв с SLA 99.9% и подсетью белых IP /29. Если основной провайдер порвёт оптику экскаватором, ваш офис даже не заметит переключения. Скинуть техническую схему включения и пиринга вам в мессенджер?»',
      takeaway:
        'Формула перехвата: Уважение к экспертизе сисадмина + Разговор на языке инженера (второй физический ввод, стат. IP /29, SLA) + Вопрос про техсхему.',
      context: 'Сценарий 5 из 6 · Жёсткий негатив от системного администратора',
      sampleAnswer:
        'Коллега, полностью понимаю: ломать рабочую сеть никто не предлагает. Мы предлагаем инженерную страховку — независимый оптический резерв с другого узла, белую стат. IP-подсеть и жёсткий SLA 99.9% со временем реакции 2 часа. Это полностью исключит простой офиса и 1С при аварии основного оператора, а для руководства мы покажем экономию через аудит счёта. Скинуть техпараметры порта в WhatsApp?',
    },
    {
      role: 'Финансовый директор / Антикризисный управляющий',
      quote: '«Сейчас кризис, мы урезаем любые расходы на связь»',
      rebuttal:
        '«Именно поэтому я вам и звоню! Мы не предлагаем новую статью затрат — мы помогаем сократить текущие постоянные расходы на 15–20%. Мы проводим бесплатный аудит вашего счёта за интернет и телефонию, заводим оптику за 0 ₽ за монтаж и фиксируем сниженный тариф в договоре на 24 месяца с SLA 99.9%. Давайте проверим ваш текущий счёт: какую сумму вам нужно срезать, чтобы пройти по бюджету?»',
      takeaway:
        'Формула перехвата: Полное согласие с режимом экономии + Позиционирование перехода как снижения OPEX на 15–20% с 0 ₽ за монтаж + Вопрос по целевому счёту.',
      context: 'Сценарий 6 из 6 · Заморозка бюджетов и сокращение костов в компании',
      sampleAnswer:
        'Абсолютно правильная позиция! Именно для урезания расходов мы проводим бесплатный аудит счёта и снижаем ежемесячный тариф на 15–20% при бесплатном монтаже. При этом вы получаете оптический резерв и финансовый SLA 99.9%, защищающий от дорогостоящего простоя офиса и 1С. Пришлите сумму текущего счёта в WhatsApp — посчитаем точную годовую экономию?',
    },
  ];

  const CLIENT_STATUSES = ['Новый', 'В работе', 'КП отправлено', 'Отказ', '✅ Договор'];

  function normalizeStatus(rawStatus) {
    if (!rawStatus) return 'Новый';
    const map = {
      new: 'Новый',
      lpr: 'В работе',
      kp: 'КП отправлено',
      rejected: 'Отказ',
      contract: '✅ Договор',
      won: '✅ Договор',
      'Новый': 'Новый',
      'В работе': 'В работе',
      'КП отправлено': 'КП отправлено',
      'Отказ': 'Отказ',
      '✅ Договор': '✅ Договор',
    };
    return map[rawStatus] || 'Новый';
  }

  function cleanPhoneTo7(rawPhone) {
    const digits = String(rawPhone || '').replace(/\D/g, '');
    if (!digits) return '';
    if (digits.length === 11 && (digits.startsWith('8') || digits.startsWith('7'))) {
      return '7' + digits.slice(1);
    }
    if (digits.length === 10) {
      return '7' + digits;
    }
    return digits;
  }

  function formatPhoneReadable(phone7) {
    const clean = cleanPhoneTo7(phone7);
    if (clean.length === 11 && clean.startsWith('7')) {
      return `+7 (${clean.slice(1, 4)}) ${clean.slice(4, 7)}-${clean.slice(7, 9)}-${clean.slice(9, 11)}`;
    }
    return phone7 || '—';
  }

  function createDefaultState() {
    return {
      companyName: 'Планета B2B — Офисный интернет',
      kpi: {
        moneyFact: 0,
        moneyPlan: 80000,
        moneyTitle: 'План: Выручка / Бонус',
        moneyUnit: '₽',
        dealsFact: 0,
        dealsPlan: 12,
        dealsTitle: 'План: Договоры',
        dealsUnit: 'шт',
        touchFact: 0,
        touchPlan: 20,
        touchTitle: 'Касания ЛПР',
      },
      currentScreen: 'dashboard',
      clients: structuredClone(DEFAULT_CLIENTS_EKB),
      scripts: structuredClone(DEFAULT_SCRIPTS),
      objections: structuredClone(DEFAULT_OBJECTIONS),
    };
  }

  let state = loadState();
  let currentClientFilter = 'all';
  let currentSearchQuery = '';
  let currentScriptCategory = 'all';
  let currentScriptId = state.scripts[0] ? state.scripts[0].id : null;
  let isEditingScript = false;
  let currentObjectionIndex = 0;
  let objectionTimerInterval = null;
  let objectionSecondsLeft = 15;
  let currentArenaIndex = 0;

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return createDefaultState();
      const parsed = JSON.parse(raw);
      const def = createDefaultState();

      const loadedClients =
        Array.isArray(parsed.clients) && parsed.clients.length > 0
          ? parsed.clients.map((c) => ({
              ...c,
              phone: cleanPhoneTo7(c.phone),
              status: normalizeStatus(c.status),
              countedInKpi: Boolean(c.countedInKpi || normalizeStatus(c.status) === '✅ Договор'),
            }))
          : def.clients;

      const loadedScripts =
        Array.isArray(parsed.scripts) && parsed.scripts.length >= 6
          ? parsed.scripts
          : def.scripts;

      const loadedObjections =
        Array.isArray(parsed.objections) && parsed.objections.length >= 6
          ? parsed.objections
          : def.objections;

      return {
        companyName: parsed.companyName || def.companyName,
        kpi: {
          ...def.kpi,
          ...(parsed.kpi || {}),
        },
        currentScreen: parsed.currentScreen || def.currentScreen,
        clients: loadedClients,
        scripts: loadedScripts,
        objections: loadedObjections,
      };
    } catch {
      return createDefaultState();
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Игнорируем возможные ограничения хранилища
    }
  }

  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  function formatNumber(val) {
    const n = Number(val) || 0;
    return n.toLocaleString('ru-RU').replace(/\u00A0/g, ' ');
  }

  function showToast(message) {
    const toast = document.getElementById('app-toast');
    const msgEl = document.getElementById('app-toast-message');
    if (!toast || !msgEl) return;
    msgEl.textContent = message;
    toast.hidden = false;
    refreshIcons();
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => {
      toast.hidden = true;
    }, 2600);
  }

  function openExternalLinkSafe(url) {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  /* ==========================================================================
     1.5. ГЕНЕРАЦИЯ И ВЫГРУЗКА ИСХОДНОГО ZIP-АРХИВА ПРИЛОЖЕНИЯ (HuntOS-B2B-v5.zip)
     ========================================================================== */
  async function downloadProjectZip() {
    if (typeof window.JSZip === 'undefined') {
      showToast('Библиотека JSZip ещё загружается — повторите через секунду');
      return;
    }

    try {
      const zip = new window.JSZip();

      // 1) Получаем текущий HTML-документ (document.documentElement.outerHTML)
      // и адаптируем относительные пути к style.css и script.js для автономного запуска из папки
      const rawOuterHtml = '<!doctype html>\n' + document.documentElement.outerHTML;
      const standaloneHtml = rawOuterHtml
        .replace(/href="\/style\.css"/g, 'href="style.css"')
        .replace(/src="\/script\.js"/g, 'src="script.js"');

      // 2) Загружаем актуальные файлы style.css и script.js через fetch (с резервным фолбэком)
      let cssContent = '';
      try {
        const cssResp = await fetch('/style.css', { cache: 'no-store' });
        if (cssResp.ok) {
          cssContent = await cssResp.text();
        }
      } catch {
        // Фолбэк через чтение правил document.styleSheets
      }

      if (!cssContent) {
        const rules = [];
        Array.from(document.styleSheets).forEach((sheet) => {
          try {
            Array.from(sheet.cssRules || []).forEach((rule) => rules.push(rule.cssText));
          } catch {
            // Игнорируем внешние CORS-таблицы шрифтов
          }
        });
        cssContent = rules.join('\n');
      }

      let jsContent = '';
      try {
        const jsResp = await fetch('/script.js', { cache: 'no-store' });
        if (jsResp.ok) {
          jsContent = await jsResp.text();
        }
      } catch {
        // Фолбэк
      }

      zip.file('index.html', standaloneHtml);
      zip.file('style.css', cssContent);
      zip.file('script.js', jsContent);

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'HuntOS-B2B-v5.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('Архив HuntOS-B2B-v5.zip успешно скачан');
    } catch {
      showToast('Не удалось сформировать ZIP-архив проекта');
    }
  }

  /* ==========================================================================
     2. НАВИГАЦИЯ ЧЕРЕЗ ПАНЕЛЬ УПРАВЛЕНИЯ (Launchpad)
     ========================================================================== */
  function switchScreen(screenId) {
    const screens = document.querySelectorAll('.app-screen');
    let targetTitle = 'Дашборд и Калькулятор КП';

    screens.forEach((sec) => {
      const id = sec.getAttribute('data-screen-id');
      if (id === screenId) {
        sec.hidden = false;
        sec.classList.add('active');
        targetTitle = sec.getAttribute('data-screen-title') || targetTitle;
      } else {
        sec.hidden = true;
        sec.classList.remove('active');
      }
    });

    const activeIndicator = document.getElementById('active-screen-title');
    if (activeIndicator) activeIndicator.textContent = targetTitle;

    document.querySelectorAll('.launchpad-tile').forEach((tile) => {
      tile.classList.toggle('active', tile.getAttribute('data-target-screen') === screenId);
    });

    state.currentScreen = screenId;
    saveState();
    closeLaunchpad();
    refreshIcons();
  }

  function openLaunchpad() {
    const modal = document.getElementById('launchpad-modal');
    const trigger = document.getElementById('btn-open-launchpad');
    if (modal) modal.hidden = false;
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    refreshIcons();
  }

  function closeLaunchpad() {
    const modal = document.getElementById('launchpad-modal');
    const trigger = document.getElementById('btn-open-launchpad');
    if (modal) modal.hidden = true;
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  }

  /* ==========================================================================
     3. РЕАКТИВНОСТЬ ШАПКИ KPI
     ========================================================================== */
  function renderHeaderKPI() {
    const kpi = state.kpi;

    const brandEl = document.getElementById('header-company-name');
    if (brandEl) brandEl.textContent = state.companyName;

    // 1) Выручка / Бонус
    const revTitleEl = document.getElementById('label-metric-revenue');
    const revCurrEl = document.getElementById('val-revenue-current');
    const revPlanEl = document.getElementById('val-revenue-target');
    const revBarEl = document.getElementById('bar-revenue');

    if (revTitleEl) revTitleEl.textContent = kpi.moneyTitle;
    if (revCurrEl) revCurrEl.textContent = formatNumber(kpi.moneyFact);
    if (revPlanEl) revPlanEl.textContent = `${formatNumber(kpi.moneyPlan)} ${kpi.moneyUnit || '₽'}`;
    if (revBarEl) {
      const pct = Math.min(100, Math.round((kpi.moneyFact / Math.max(1, kpi.moneyPlan)) * 100));
      revBarEl.style.width = `${pct}%`;
    }

    // 2) Договоры
    const dealsTitleEl = document.getElementById('label-metric-contracts');
    const dealsCurrEl = document.getElementById('val-contracts-current');
    const dealsPlanEl = document.getElementById('val-contracts-target');
    const dealsBarEl = document.getElementById('bar-contracts');

    if (dealsTitleEl) dealsTitleEl.textContent = kpi.dealsTitle;
    if (dealsCurrEl) dealsCurrEl.textContent = formatNumber(kpi.dealsFact);
    if (dealsPlanEl) dealsPlanEl.textContent = `${formatNumber(kpi.dealsPlan)} ${kpi.dealsUnit || 'шт'}`;
    if (dealsBarEl) {
      const pct = Math.min(100, Math.round((kpi.dealsFact / Math.max(1, kpi.dealsPlan)) * 100));
      dealsBarEl.style.width = `${pct}%`;
    }

    // 3) Касания ЛПР
    const touchTitleEl = document.getElementById('label-metric-touches');
    const touchCurrEl = document.getElementById('val-touches-current');
    const touchPlanEl = document.getElementById('val-touches-target');
    const touchBarEl = document.getElementById('bar-touches');

    if (touchTitleEl) touchTitleEl.textContent = kpi.touchTitle;
    if (touchCurrEl) touchCurrEl.textContent = formatNumber(kpi.touchFact);
    if (touchPlanEl) touchPlanEl.textContent = formatNumber(kpi.touchPlan);
    if (touchBarEl) {
      const pct = Math.min(100, Math.round((kpi.touchFact / Math.max(1, kpi.touchPlan)) * 100));
      touchBarEl.style.width = `${pct}%`;
    }

    refreshIcons();
  }

  /* ==========================================================================
     4. КАЛЬКУЛЯТОР ЭКОНОМИИ B2B (Экран 1)
     ========================================================================== */
  function updateCalculator() {
    const clientName = (document.getElementById('calc-client-name')?.value || '').trim();
    const speedMbps = document.getElementById('calc-speed-mbps')?.value || '1000';
    const currentBill = Math.max(0, Number(document.getElementById('calc-current-bill')?.value) || 0);
    const ourTariff = Math.max(0, Number(document.getElementById('calc-our-tariff')?.value) || 0);
    const termMonths = Number(document.getElementById('calc-contract-term')?.value) || 12;

    const hasStaticIp = document.getElementById('opt-static-ip')?.checked;
    const hasBackup1G = document.getElementById('opt-backup-1g')?.checked;
    const hasSla999 = document.getElementById('opt-sla-999')?.checked;

    const monthlyDiff = Math.max(0, currentBill - ourTariff);
    const yearlySaving = monthlyDiff * 12;
    const totalTermSaving = monthlyDiff * termMonths;
    const discountPct = currentBill > 0 ? ((monthlyDiff / currentBill) * 100).toFixed(1) : '0.0';

    const monthlyEl = document.getElementById('out-monthly-saving');
    const discountEl = document.getElementById('out-discount-percent');
    const yearlyEl = document.getElementById('out-yearly-saving');
    const periodLabelEl = document.getElementById('label-period-saving');
    const periodValEl = document.getElementById('out-period-saving');

    if (monthlyEl) monthlyEl.textContent = `${formatNumber(monthlyDiff)} ₽`;
    if (discountEl) {
      discountEl.textContent =
        monthlyDiff > 0 ? `-${discountPct}% к текущему счёту` : 'Без разницы в абонентской плате';
    }
    if (yearlyEl) yearlyEl.textContent = `${formatNumber(yearlySaving)} ₽`;
    if (periodLabelEl) periodLabelEl.textContent = `Выгода за весь срок (${termMonths} мес)`;
    if (periodValEl) periodValEl.textContent = `${formatNumber(totalTermSaving)} ₽`;

    const includedOptions = [];
    if (hasStaticIp) includedOptions.push('• Белый статический IPv4 (/30) — 0 ₽');
    if (hasBackup1G) includedOptions.push('• Независимый резервный оптический канал до 1 Гбит/с');
    if (hasSla999) includedOptions.push('• Приоритетный SLA 99.9% (выезд бригады ВОЛС до 2 часов)');

    const headerLine = clientName
      ? `Коммерческий расчёт для ${clientName} от «${state.companyName}»:`
      : `Коммерческий расчёт перевода на оптику от «${state.companyName}»:`;

    const messageLines = [
      headerLine,
      '',
      `• Текущий счёт: ${formatNumber(currentBill)} ₽/мес`,
      `• Наш спецтариф (${speedMbps} Мбит/с): ${formatNumber(ourTariff)} ₽/мес (фиксация цены на ${termMonths} мес)`,
      `• Экономия за 12 мес: ${formatNumber(yearlySaving)} ₽ | Выгода за ${termMonths} мес: ${formatNumber(totalTermSaving)} ₽`,
    ];

    if (includedOptions.length > 0) {
      messageLines.push('', 'Включено в КП без доплат:', ...includedOptions);
    }

    messageLines.push(
      '',
      'Готовы забронировать оптический порт и согласовать бесплатное переключение без простоя офиса?'
    );

    const proposalArea = document.getElementById('calc-proposal-text');
    if (proposalArea) {
      proposalArea.value = messageLines.join('\n');
    }
  }

  function shareOrSendProposal(channel) {
    const text = document.getElementById('calc-proposal-text')?.value || '';
    if (!text) return;

    navigator.clipboard?.writeText(text);

    if (channel === 'wa') {
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
      openExternalLinkSafe(waUrl);
      showToast('Открыт WhatsApp с готовым расчётом КП');
      return;
    }

    if (channel === 'tg') {
      const tgUrl = `https://t.me/share/url?url=${encodeURIComponent('https://planeta.tc')}&text=${encodeURIComponent(text)}`;
      openExternalLinkSafe(tgUrl);
      showToast('Открыт Telegram с готовым расчётом КП');
      return;
    }

    showToast('Расчёт КП скопирован в буфер обмена');
  }

  /* ==========================================================================
     5. МОДУЛЬ «🗂️ БАЗА КЛИЕНТОВ И УМНЫЙ ПАРСЕР ТАБЛИЦ» (Экран 2)
     ========================================================================== */
  const REGEX_INN = /(\b\d{10}\b|\b\d{12}\b)/;
  const REGEX_PHONE = /(\+?[78][-\s(]*\d{3}[-\s)]*\d{3}[-\s]*\d{2}[-\s]*\d{2})/;
  const REGEX_LEGAL_ENTITY = /(?:^|[\s"«(])(ООО|ИП|АО|ЗАО|ПАО|НПО|ТД|ГК)(?:[\s"».)]|$)/i;

  function parseSmartTable(rawText) {
    const lines = String(rawText || '')
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      showToast('Вставьте скопированные строки из Excel, 1С или Google Таблиц');
      return;
    }

    let addedCount = 0;

    lines.forEach((line) => {
      let delimiter = '\t';
      if (line.includes('\t')) delimiter = '\t';
      else if (line.includes(';')) delimiter = ';';
      else if (line.includes('|')) delimiter = '|';
      else if (line.includes(',')) delimiter = ',';

      const cells = line
        .split(delimiter)
        .map((c) => c.trim().replace(/^["']|["']$/g, '').trim())
        .filter(Boolean);

      if (cells.length === 0) return;

      let inn = '';
      let phone = '';
      let company = '';
      let amount = 8900;
      const usedIndices = new Set();

      cells.forEach((cell, idx) => {
        if (!inn) {
          const innMatch = cell.match(REGEX_INN);
          if (innMatch) {
            inn = innMatch[1];
            const stripped = cell.replace(/инн/i, '').replace(/\D/g, '');
            if (stripped === inn) {
              usedIndices.add(idx);
              return;
            }
          }
        }

        if (!phone) {
          const phoneMatch = cell.match(REGEX_PHONE);
          if (phoneMatch) {
            phone = cleanPhoneTo7(phoneMatch[1]);
            const strippedPhone = cell.replace(/\D/g, '');
            if (strippedPhone.length >= 10 && strippedPhone.length <= 11) {
              usedIndices.add(idx);
              return;
            }
          }
        }
      });

      cells.forEach((cell, idx) => {
        if (usedIndices.has(idx)) return;
        const cleanPrice = cell.replace(/\s+/g, '').replace(/(₽|руб\.?|р\.?\/мес|р\.?)/gi, '');
        if (/^\d{3,6}$/.test(cleanPrice)) {
          amount = Number(cleanPrice);
          usedIndices.add(idx);
        }
      });

      let companyIdx = -1;
      cells.forEach((cell, idx) => {
        if (usedIndices.has(idx) || companyIdx !== -1) return;
        if (REGEX_LEGAL_ENTITY.test(cell)) {
          company = cell;
          companyIdx = idx;
        }
      });

      if (companyIdx === -1) {
        let longestNoDigits = '';
        let longestAnyText = '';
        let longestNoDigitsIdx = -1;
        let longestAnyTextIdx = -1;

        cells.forEach((cell, idx) => {
          if (usedIndices.has(idx)) return;
          if (!/\d/.test(cell) && cell.length > longestNoDigits.length) {
            longestNoDigits = cell;
            longestNoDigitsIdx = idx;
          }
          if (cell.length > longestAnyText.length) {
            longestAnyText = cell;
            longestAnyTextIdx = idx;
          }
        });

        if (longestNoDigitsIdx !== -1) {
          company = longestNoDigits;
          companyIdx = longestNoDigitsIdx;
        } else if (longestAnyTextIdx !== -1) {
          company = longestAnyText;
          companyIdx = longestAnyTextIdx;
        }
      }

      if (companyIdx !== -1) {
        usedIndices.add(companyIdx);
      }

      const commentParts = [];
      cells.forEach((cell, idx) => {
        if (!usedIndices.has(idx)) {
          commentParts.push(cell);
        }
      });

      state.clients.unshift({
        id: 'c-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
        company: company || 'Корпоративный клиент',
        inn: inn || '—',
        phone: phone || '',
        comment: commentParts.join(' · ') || 'Импортировано через умный парсер',
        amount: amount || 8900,
        status: 'Новый',
        countedInKpi: false,
      });

      addedCount++;
    });

    saveState();
    renderClients();
    renderScripts();
    showToast(`Умный парсер: добавлено клиентов в базу — ${addedCount}`);
  }

  function syncCrmStatusControls() {
    const statusSelectForm = document.getElementById('client-status');
    if (statusSelectForm && !statusSelectForm.dataset.upgradedV5) {
      statusSelectForm.dataset.upgradedV5 = 'true';
      statusSelectForm.innerHTML = CLIENT_STATUSES.map(
        (st) => `<option value="${st}">${st}</option>`
      ).join('');
    }

    const filterBar = document.getElementById('crm-status-filters');
    if (filterBar && !filterBar.dataset.upgradedV5) {
      filterBar.dataset.upgradedV5 = 'true';
      const tabs = [
        { key: 'all', label: 'Все' },
        { key: 'Новый', label: 'Новый' },
        { key: 'В работе', label: 'В работе' },
        { key: 'КП отправлено', label: 'КП отправлено' },
        { key: 'Отказ', label: 'Отказ' },
        { key: '✅ Договор', label: '✅ Договор' },
      ];
      filterBar.innerHTML = tabs
        .map(
          (t) => `
          <button
            type="button"
            class="filter-tab ${currentClientFilter === t.key ? 'active' : ''}"
            data-status="${t.key}"
            role="tab"
            aria-selected="${currentClientFilter === t.key ? 'true' : 'false'}"
          >
            ${t.label}
          </button>
        `
        )
        .join('');

      filterBar.querySelectorAll('.filter-tab').forEach((tab) => {
        tab.addEventListener('click', () => {
          filterBar.querySelectorAll('.filter-tab').forEach((b) => {
            b.classList.remove('active');
            b.setAttribute('aria-selected', 'false');
          });
          tab.classList.add('active');
          tab.setAttribute('aria-selected', 'true');
          currentClientFilter = tab.getAttribute('data-status') || 'all';
          renderClients();
        });
      });
    }
  }

  function renderClients() {
    syncCrmStatusControls();

    const container = document.getElementById('clients-list-container');
    const summaryBadge = document.getElementById('crm-total-badge');
    const scriptSelect = document.getElementById('script-client-select');
    if (!container) return;

    const totalPipeline = state.clients.reduce((acc, c) => acc + (Number(c.amount) || 0), 0);
    if (summaryBadge) {
      summaryBadge.textContent = `Клиентов: ${state.clients.length} · Пайплайн: ${formatNumber(totalPipeline)} ₽`;
    }

    if (scriptSelect) {
      const prev = scriptSelect.value;
      scriptSelect.innerHTML =
        '<option value="">— Без привязки к клиенту (универсальный шаблон) —</option>';
      state.clients.forEach((client) => {
        const opt = document.createElement('option');
        opt.value = client.id;
        opt.textContent = `${client.company} (ИНН ${client.inn || '—'} · ${formatNumber(client.amount)} ₽)`;
        scriptSelect.appendChild(opt);
      });
      if (prev && state.clients.some((c) => c.id === prev)) {
        scriptSelect.value = prev;
      }
    }

    const q = currentSearchQuery.toLowerCase();
    const filtered = state.clients.filter((c) => {
      const normSt = normalizeStatus(c.status);
      const matchStatus = currentClientFilter === 'all' || normSt === currentClientFilter;
      const matchQuery =
        !q ||
        (c.company || '').toLowerCase().includes(q) ||
        (c.inn || '').toLowerCase().includes(q) ||
        (c.phone || '').toLowerCase().includes(q) ||
        (c.comment || '').toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="arena-coach-advice">
          По выбранному фильтру клиенты не найдены. Вставьте скопированные строки из таблицы слева или сбросьте фильтр.
        </div>
      `;
      refreshIcons();
      return;
    }

    container.innerHTML = '';
    filtered.forEach((client) => {
      const cleanPhone = cleanPhoneTo7(client.phone);
      const readablePhone = formatPhoneReadable(cleanPhone);
      const currentSt = normalizeStatus(client.status);

      const greetingText = `Здравствуйте! Беспокоит ${state.companyName}. Обращаюсь по вопросу высокоскоростного оптического интернета и резервирования канала для ${client.company}. Подскажите, с кем можно кратко согласовать техническую возможность и спецтариф?`;
      const waHref = `https://api.whatsapp.com/send?phone=${encodeURIComponent(
        cleanPhone
      )}&text=${encodeURIComponent(greetingText)}`;

      const row = document.createElement('div');
      row.className = 'client-row-card';
      row.innerHTML = `
        <div class="client-main-info">
          <div class="client-title-line">
            <span class="client-company-name"></span>
            <button
              type="button"
              class="kpi-step-btn tabular-nums"
              data-action="copy-inn"
              data-inn="${client.inn || ''}"
              title="Нажмите, чтобы скопировать ИНН в 1 клик"
              aria-label="Скопировать ИНН ${client.inn || ''}"
            >
              ИНН: ${client.inn || '—'}
            </button>
            <a
              href="tel:+${cleanPhone}"
              class="client-meta-line tabular-nums"
              style="color: #93c5fd; text-decoration: none;"
              title="Позвонить клиенту"
            ></a>
          </div>
          <div class="client-meta-line client-comment-line"></div>
        </div>
        <div class="client-row-actions">
          <span class="client-amount-tag tabular-nums">${formatNumber(client.amount)} ₽/мес</span>
          <select
            class="status-select-compact"
            data-action="status"
            data-id="${client.id}"
            aria-label="Статус клиента ${client.company}"
          >
            ${CLIENT_STATUSES.map(
              (st) => `<option value="${st}" ${currentSt === st ? 'selected' : ''}>${st}</option>`
            ).join('')}
          </select>
          <a
            href="${waHref}"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-whatsapp btn-sm"
            data-action="open-wa"
            data-id="${client.id}"
            style="text-decoration: none;"
            title="Открыть чат WhatsApp с готовым приветствием"
          >
            <span>💬 WhatsApp</span>
          </a>
          <button
            type="button"
            class="btn-secondary btn-sm"
            data-action="to-script"
            data-id="${client.id}"
            title="Подставить клиента в боевые скрипты"
          >
            Скрипт
          </button>
          <button
            type="button"
            class="btn-ghost-danger btn-sm"
            data-action="delete"
            data-id="${client.id}"
            aria-label="Удалить клиента"
          >
            ×
          </button>
        </div>
      `;

      row.querySelector('.client-company-name').textContent = client.company;
      row.querySelector('a[href^="tel:"]').textContent = readablePhone;
      row.querySelector('.client-comment-line').textContent = client.comment || 'Без комментария';
      container.appendChild(row);
    });

    refreshIcons();
  }

  function updateClientStatus(clientId, newStatus) {
    const client = state.clients.find((c) => c.id === clientId);
    if (!client) return;

    const normalizedNew = normalizeStatus(newStatus);
    const dealAmount = Math.max(0, Number(client.amount) || 0);

    if (normalizedNew === '✅ Договор' && !client.countedInKpi) {
      state.kpi.dealsFact += 1;
      state.kpi.moneyFact += dealAmount;
      client.countedInKpi = true;
      showToast(
        `✅ Договор! В план продаж начислено +1 договор и +${formatNumber(dealAmount)} ₽`
      );
    } else if (normalizedNew !== '✅ Договор' && client.countedInKpi) {
      state.kpi.dealsFact = Math.max(0, state.kpi.dealsFact - 1);
      state.kpi.moneyFact = Math.max(0, state.kpi.moneyFact - dealAmount);
      client.countedInKpi = false;
      showToast(`Статус изменён на «${normalizedNew}» (показатели KPI скорректированы)`);
    } else {
      showToast(`Статус «${client.company}»: ${normalizedNew}`);
    }

    client.status = normalizedNew;
    saveState();
    renderHeaderKPI();
    renderClients();
  }

  /* ==========================================================================
     6. МОДУЛЬ «💬 БОЕВЫЕ СКРИПТЫ 2026» (Экран 3 — 6 сценариев + WhatsApp + Редактор)
     ========================================================================== */
  function ensureAllScriptsCategoryTab() {
    const navEl = document.getElementById('script-categories-nav');
    if (!navEl || navEl.dataset.upgradedV5 === 'true') return;
    navEl.dataset.upgradedV5 = 'true';

    const allBtn = document.createElement('button');
    allBtn.type = 'button';
    allBtn.className = 'category-pill-btn active';
    allBtn.setAttribute('data-category', 'all');
    allBtn.setAttribute('role', 'tab');
    allBtn.setAttribute('aria-selected', 'true');
    allBtn.innerHTML = '<i data-lucide="layers" class="icon-sm"></i><span>Все сценарии (6)</span>';
    navEl.insertBefore(allBtn, navEl.firstChild);

    allBtn.addEventListener('click', () => {
      currentScriptCategory = 'all';
      isEditingScript = false;
      renderScripts();
    });
  }

  function getSelectedScriptClient() {
    const selectedClientId = document.getElementById('script-client-select')?.value;
    if (!selectedClientId) return null;
    return state.clients.find((c) => c.id === selectedClientId) || null;
  }

  function interpolateScriptContent(rawTemplate, client) {
    const companyVal = client && client.company ? client.company : 'вашей компании';
    const innVal = client && client.inn && client.inn !== '—' ? client.inn : 'ваш ИНН';
    const amountVal = client && client.amount ? formatNumber(client.amount) : '8 900';

    return String(rawTemplate || '')
      .replace(/\{КОМПАНИЯ\}/g, companyVal)
      .replace(/\{ИНН\}/g, innVal)
      .replace(/\{СУММА\}/g, amountVal)
      .replace(/\{МОЯ_КОМПАНИЯ\}/g, state.companyName);
  }

  function renderScripts() {
    ensureAllScriptsCategoryTab();

    const navEl = document.getElementById('script-categories-nav');
    const sublistEl = document.getElementById('scripts-sublist');
    if (!navEl || !sublistEl) return;

    const allBtnSpan = navEl.querySelector('[data-category="all"] span');
    if (allBtnSpan) {
      allBtnSpan.textContent = `Все сценарии (${state.scripts.length})`;
    }

    navEl.querySelectorAll('.category-pill-btn').forEach((btn) => {
      const active = btn.getAttribute('data-category') === currentScriptCategory;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    const filteredScripts =
      currentScriptCategory === 'all'
        ? state.scripts
        : state.scripts.filter((s) => s.category === currentScriptCategory);

    if (!filteredScripts.some((s) => s.id === currentScriptId)) {
      currentScriptId = filteredScripts[0] ? filteredScripts[0].id : null;
    }

    sublistEl.innerHTML = '';
    filteredScripts.forEach((sc) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'script-subitem-btn' + (sc.id === currentScriptId ? ' active' : '');
      btn.textContent = sc.title;
      btn.addEventListener('click', () => {
        currentScriptId = sc.id;
        isEditingScript = false;
        renderScripts();
      });
      sublistEl.appendChild(btn);
    });

    const viewPane = document.getElementById('script-view-pane');
    const editorPane = document.getElementById('form-script-editor');
    const deleteBtn = document.getElementById('btn-delete-script');
    const editBtnLabel = document.getElementById('label-toggle-edit-script');

    if (isEditingScript) {
      viewPane.hidden = true;
      editorPane.hidden = false;
      if (deleteBtn) deleteBtn.hidden = !currentScriptId || state.scripts.length <= 1;
      if (editBtnLabel) editBtnLabel.textContent = 'К просмотру';
      refreshIcons();
      return;
    }

    viewPane.hidden = false;
    editorPane.hidden = true;
    if (deleteBtn) deleteBtn.hidden = true;
    if (editBtnLabel) editBtnLabel.textContent = 'Редактировать';

    const activeScript = state.scripts.find((s) => s.id === currentScriptId) || state.scripts[0];
    if (!activeScript) return;

    document.getElementById('active-script-category').textContent = activeScript.category;
    document.getElementById('active-script-title').textContent = activeScript.title;

    const hintEl = document.querySelector('.script-tokens-hint');
    if (hintEl) {
      hintEl.innerHTML =
        'Переменные: <code>{КОМПАНИЯ}</code> <code>{ИНН}</code> <code>{СУММА}</code> <code>{МОЯ_КОМПАНИЯ}</code>';
    }

    const client = getSelectedScriptClient();
    const finalBody = interpolateScriptContent(activeScript.content, client);
    document.getElementById('active-script-body').textContent = finalBody;

    refreshIcons();
  }

  /* ==========================================================================
     7. МОДУЛЬ «🥊 ТРЕНАЖЁР ВОЗРАЖЕНИЙ B2B» (Экран 4 — 6 возражений + Спарринг 1..100)
     ========================================================================== */
  function ensureArenaVoiceControlsAndCriteria() {
    const arenaHeader = document.querySelector('#trainer-pane-arena .card-header');
    const randomBtn = document.getElementById('btn-arena-random');
    if (arenaHeader && randomBtn && !document.getElementById('btn-arena-speak')) {
      const btnGroup = document.createElement('div');
      btnGroup.style.display = 'flex';
      btnGroup.style.gap = '8px';
      btnGroup.style.flexWrap = 'wrap';

      const speakBtn = document.createElement('button');
      speakBtn.type = 'button';
      speakBtn.className = 'btn-secondary btn-sm';
      speakBtn.id = 'btn-arena-speak';
      speakBtn.setAttribute('aria-label', 'Озвучить возражение голосом');
      speakBtn.innerHTML =
        '<i data-lucide="volume-2" class="icon-xs"></i><span>Озвучить возражение</span>';

      randomBtn.parentNode.insertBefore(btnGroup, randomBtn);
      btnGroup.appendChild(speakBtn);
      btnGroup.appendChild(randomBtn);

      speakBtn.addEventListener('click', () => {
        const list =
          state.objections && state.objections.length > 0 ? state.objections : DEFAULT_OBJECTIONS;
        const item = list[currentArenaIndex % list.length];
        if (item) {
          speakObjectionVoice(item.quote);
        }
      });
    }

    // Обновляем подписи 4 твёрдых аргументов B2B (SLA, резерв, аудит счёта, простой офиса)
    const criteriaNames = document.querySelectorAll('#arena-criteria-list .criteria-name');
    if (criteriaNames.length >= 4) {
      criteriaNames[0].textContent = '1. Финансовый SLA 99.9% и время реакции бригады';
      criteriaNames[1].textContent = '2. Оптический резерв под кассы, 1С и статический IP';
      criteriaNames[2].textContent = '3. Аудит счёта и снижение тарифа на 15–20% (в ₽)';
      criteriaNames[3].textContent = '4. Цена простоя офиса + закрытие на следующий шаг';
    }
  }

  function speakObjectionVoice(rawQuote) {
    const cleanText = String(rawQuote || '').replace(/[«»"]/g, '');
    if (!('speechSynthesis' in window) || typeof window.SpeechSynthesisUtterance === 'undefined') {
      showToast(`Голосовой синтезатор браузера недоступен: ${cleanText}`);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new window.SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'ru-RU';
      utterance.rate = 1.02;
      utterance.pitch = 0.95;

      const voices = window.speechSynthesis.getVoices();
      const ruVoice = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('ru'));
      if (ruVoice) utterance.voice = ruVoice;

      window.speechSynthesis.speak(utterance);
      showToast('Озвучиваем возражение клиента (SpeechSynthesis)...');
    } catch {
      showToast('Озвучка запущена');
    }
  }

  function renderObjectionCard() {
    const list =
      state.objections && state.objections.length > 0 ? state.objections : DEFAULT_OBJECTIONS;
    const item = list[currentObjectionIndex % list.length];
    if (!item) return;

    const num = String((currentObjectionIndex % list.length) + 1).padStart(2, '0');
    const tot = String(list.length).padStart(2, '0');

    document.getElementById('obj-counter-label').textContent = `Возражение ${num} / ${tot}`;
    document.getElementById('obj-speaker-role').textContent = item.role;
    document.getElementById('obj-quote-text').textContent = item.quote;
    document.getElementById('obj-rebuttal-text').textContent = item.rebuttal;
    document.getElementById('obj-takeaway-text').textContent = item.takeaway;

    document.getElementById('rebuttal-reveal-box').hidden = true;
    document.getElementById('label-reveal-rebuttal').textContent = 'Показать эталонный перехват';
    resetObjectionTimer();
    refreshIcons();
  }

  function resetObjectionTimer() {
    clearInterval(objectionTimerInterval);
    objectionTimerInterval = null;
    objectionSecondsLeft = 15;
    const secEl = document.getElementById('obj-timer-seconds');
    const barEl = document.getElementById('obj-timer-bar');
    if (secEl) secEl.textContent = '15 сек';
    if (barEl) barEl.style.width = '100%';
  }

  function startObjectionTimer() {
    resetObjectionTimer();
    const secEl = document.getElementById('obj-timer-seconds');
    const barEl = document.getElementById('obj-timer-bar');

    objectionTimerInterval = setInterval(() => {
      objectionSecondsLeft -= 1;
      if (secEl) secEl.textContent = `${Math.max(0, objectionSecondsLeft)} сек`;
      if (barEl) barEl.style.width = `${(Math.max(0, objectionSecondsLeft) / 15) * 100}%`;

      if (objectionSecondsLeft <= 0) {
        clearInterval(objectionTimerInterval);
        objectionTimerInterval = null;
        document.getElementById('rebuttal-reveal-box').hidden = false;
        document.getElementById('label-reveal-rebuttal').textContent = 'Скрыть эталонный перехват';
        showToast('15 секунд истекли! Проверьте себя по эталонному перехвату.');
      }
    }, 1000);
  }

  function renderArenaScenario() {
    ensureArenaVoiceControlsAndCriteria();

    const list =
      state.objections && state.objections.length > 0 ? state.objections : DEFAULT_OBJECTIONS;
    const item = list[currentArenaIndex % list.length];
    if (!item) return;

    const contextEl = document.getElementById('arena-context-label');
    const attackEl = document.getElementById('arena-attack-text');

    if (contextEl) {
      contextEl.textContent =
        item.context ||
        `Боевой спарринг (${(currentArenaIndex % list.length) + 1} из ${list.length}) · Роль: ${item.role}`;
    }
    if (attackEl) {
      attackEl.textContent = item.quote;
    }

    refreshIcons();
  }

  /**
   * Оценка ответа пользователя от 1 до 100 баллов по наличию твёрдых аргументов:
   * 1) SLA (SLA 99.9%, финансовая гарантия, время выезда бригады 2 часа)
   * 2) Резерв (независимый оптический ввод, 1С, кассы, стат. IP, BGP/VRRP)
   * 3) Аудит счёта (сверка счёта, снижение тарифа на 15-20%, экономия в ₽)
   * 4) Простой офиса (стоимость часа простоя, риск обрыва + закрывающий вопрос)
   */
  function evaluateArenaAnswer(text) {
    ensureArenaVoiceControlsAndCriteria();

    const raw = String(text || '').trim();
    const lower = raw.toLowerCase();

    const hasSla = /sla|99\.9|гарант|штраф|бригад|реакц|2\s*час|регламент/.test(lower);
    const hasBackup =
      /резерв|второй\s+(канал|ввод|луч)|оптик|волокн|bgp|vrrp|1с|касс|роутер|ip/.test(lower);
    const hasBillAudit =
      /аудит|счёт|счет|тариф|индексац|эконом|дешевл|15%|20%|переплат|смет|расчёт|расчет|₽|руб/.test(
        lower
      );
    const hasDowntimeRisk =
      /простой|авари|обрыв|встан|потер|убыт|инн|whatsapp|ватсап|провер|порт|\?/.test(lower);

    let score = 10;
    if (raw.length >= 40) score += 6;
    if (raw.length >= 90) score += 4;
    if (hasSla) score += 20;
    if (hasBackup) score += 20;
    if (hasBillAudit) score += 20;
    if (hasDowntimeRisk) score += 20;

    score = Math.max(1, Math.min(100, score));

    const flags = [hasSla, hasBackup, hasBillAudit, hasDowntimeRisk];
    flags.forEach((ok, idx) => {
      const el = document.getElementById(`crit-${idx + 1}`);
      if (!el) return;
      el.textContent = ok ? '+20 б · Засчитано ✓' : '0 б · Не раскрыто ✗';
      el.className = 'criteria-status ' + (ok ? 'pass' : 'warn');
    });

    const badgeEl = document.getElementById('arena-score-badge');
    if (badgeEl) {
      badgeEl.textContent = `Оценка: ${score} / 100`;
    }

    const missing = [];
    if (!hasSla) missing.push('финансовый SLA 99.9% (выезд бригады за 2 часа)');
    if (!hasBackup) missing.push('независимый оптический резерв под 1С и кассы');
    if (!hasBillAudit) missing.push('бесплатный аудит текущего счёта с экономией 15–20%');
    if (!hasDowntimeRisk) missing.push('цену часа простоя офиса и закрывающий вопрос на WhatsApp/ИНН');

    const adviceEl = document.getElementById('arena-coach-advice');
    if (adviceEl) {
      if (score >= 90) {
        adviceEl.textContent = `Блестящий перехват (${score}/100)! Вы использовали все 4 твёрдых B2B-аргумента: финансовый SLA 99.9%, оптический резерв для 1С/касс, аудит текущего счёта и защиту от простоя офиса с чётким закрытием на следующий шаг.`;
      } else if (score >= 60) {
        adviceEl.textContent = `Хороший рабочий ответ (${score}/100). Чтобы дожать скептичного ЛПР до 100 баллов, добавьте в аргументацию: ${missing.join(', ')}.`;
      } else {
        adviceEl.textContent = `Слабая позиция (${score}/100) — клиент легко уйдёт от разговора. Обязательно включите твёрдые аргументы: ${missing.join(', ')}.`;
      }
    }

    showToast(`Ответ оценён: ${score} из 100 баллов`);
  }

  /* ==========================================================================
     8. ЭКРАН НАСТРОЕК (Экран 5)
     ========================================================================== */
  function syncSettingsForm() {
    const kpi = state.kpi;
    const compInput = document.getElementById('set-company-name');
    const revTitleInput = document.getElementById('set-label-revenue');
    const revPlanInput = document.getElementById('set-target-revenue');
    const dealsTitleInput = document.getElementById('set-label-contracts');
    const dealsPlanInput = document.getElementById('set-target-contracts');
    const touchTitleInput = document.getElementById('set-label-touches');
    const touchPlanInput = document.getElementById('set-target-touches');

    if (compInput) compInput.value = state.companyName;
    if (revTitleInput) revTitleInput.value = kpi.moneyTitle;
    if (revPlanInput) revPlanInput.value = kpi.moneyPlan;
    if (dealsTitleInput) dealsTitleInput.value = kpi.dealsTitle;
    if (dealsPlanInput) dealsPlanInput.value = kpi.dealsPlan;
    if (touchTitleInput) touchTitleInput.value = kpi.touchTitle;
    if (touchPlanInput) touchPlanInput.value = kpi.touchPlan;
  }

  function applySettingsFromForm() {
    state.companyName =
      document.getElementById('set-company-name')?.value.trim() ||
      'Планета B2B — Офисный интернет';

    state.kpi.moneyTitle =
      document.getElementById('set-label-revenue')?.value.trim() || 'План: Выручка / Бонус';
    state.kpi.moneyPlan = Math.max(
      1,
      Number(document.getElementById('set-target-revenue')?.value) || 80000
    );

    state.kpi.dealsTitle =
      document.getElementById('set-label-contracts')?.value.trim() || 'План: Договоры';
    state.kpi.dealsPlan = Math.max(
      1,
      Number(document.getElementById('set-target-contracts')?.value) || 12
    );

    state.kpi.touchTitle =
      document.getElementById('set-label-touches')?.value.trim() || 'Касания ЛПР';
    state.kpi.touchPlan = Math.max(
      1,
      Number(document.getElementById('set-target-touches')?.value) || 20
    );

    saveState();
    renderHeaderKPI();
    updateCalculator();
    renderClients();
    renderScripts();
  }

  /* ==========================================================================
     9. ПРИВЯЗКА СОБЫТИЙ ИНТЕРФЕЙСА
     ========================================================================== */
  function bindEvents() {
    // 0) Выгрузка исходного ZIP-архива проекта (HuntOS-B2B-v5.zip) из шапки и экрана Настроек
    document
      .querySelectorAll('#btn-download-zip, #btn-download-zip-settings, [data-action="download-zip"]')
      .forEach((btn) => {
        btn.addEventListener('click', downloadProjectZip);
      });

    // 1) Панель управления (Launchpad)
    document.getElementById('btn-open-launchpad')?.addEventListener('click', () => {
      const modal = document.getElementById('launchpad-modal');
      if (modal && modal.hidden) openLaunchpad();
      else closeLaunchpad();
    });

    document.getElementById('btn-close-launchpad')?.addEventListener('click', closeLaunchpad);

    document.getElementById('launchpad-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'launchpad-modal') closeLaunchpad();
    });

    document.querySelectorAll('.launchpad-tile').forEach((tile) => {
      tile.addEventListener('click', () => {
        const targetScreen = tile.getAttribute('data-target-screen');
        if (targetScreen) switchScreen(targetScreen);
      });
    });

    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const modal = document.getElementById('launchpad-modal');
        if (modal && modal.hidden) openLaunchpad();
        else closeLaunchpad();
      } else if (e.key === 'Escape') {
        closeLaunchpad();
        const inlineModal = document.getElementById('metric-edit-modal');
        if (inlineModal) inlineModal.hidden = true;
      }
    });

    // 2) Реактивные кнопки шапки KPI
    document.getElementById('btn-inc-touches')?.addEventListener('click', () => {
      state.kpi.touchFact += 1;
      saveState();
      renderHeaderKPI();
      showToast(`${state.kpi.touchTitle}: ${state.kpi.touchFact} из ${state.kpi.touchPlan}`);
    });

    document.getElementById('btn-inc-contracts')?.addEventListener('click', () => {
      state.kpi.dealsFact += 1;
      saveState();
      renderHeaderKPI();
      showToast(
        `${state.kpi.dealsTitle}: ${state.kpi.dealsFact} из ${state.kpi.dealsPlan} ${state.kpi.dealsUnit}`
      );
    });

    const metricMap = {
      revenue: { factKey: 'moneyFact', planKey: 'moneyPlan', titleKey: 'moneyTitle' },
      contracts: { factKey: 'dealsFact', planKey: 'dealsPlan', titleKey: 'dealsTitle' },
      touches: { factKey: 'touchFact', planKey: 'touchPlan', titleKey: 'touchTitle' },
    };

    ['btn-edit-revenue', 'btn-edit-contracts', 'btn-edit-touches'].forEach((id) => {
      document.getElementById(id)?.addEventListener('click', (e) => {
        const metricKey = e.currentTarget.getAttribute('data-metric');
        const cfg = metricMap[metricKey];
        if (!cfg) return;

        document.getElementById('quick-edit-metric-key').value = metricKey;
        document.getElementById('metric-modal-title').textContent = state.kpi[cfg.titleKey];
        document.getElementById('quick-edit-current-val').value = state.kpi[cfg.factKey];
        document.getElementById('quick-edit-target-val').value = state.kpi[cfg.planKey];
        document.getElementById('metric-edit-modal').hidden = false;
        refreshIcons();
      });
    });

    document.getElementById('btn-close-metric-modal')?.addEventListener('click', () => {
      document.getElementById('metric-edit-modal').hidden = true;
    });
    document.getElementById('btn-cancel-metric-modal')?.addEventListener('click', () => {
      document.getElementById('metric-edit-modal').hidden = true;
    });

    document.getElementById('form-metric-quick-edit')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const metricKey = document.getElementById('quick-edit-metric-key').value;
      const cfg = metricMap[metricKey];
      if (!cfg) return;

      state.kpi[cfg.factKey] = Math.max(
        0,
        Number(document.getElementById('quick-edit-current-val').value) || 0
      );
      state.kpi[cfg.planKey] = Math.max(
        1,
        Number(document.getElementById('quick-edit-target-val').value) || 1
      );

      saveState();
      renderHeaderKPI();
      syncSettingsForm();
      document.getElementById('metric-edit-modal').hidden = true;
      showToast('Метрика плана продаж обновлена');
    });

    // 3) Калькулятор КП
    [
      'calc-client-name',
      'calc-speed-mbps',
      'calc-current-bill',
      'calc-our-tariff',
      'opt-static-ip',
      'opt-backup-1g',
      'opt-sla-999',
    ].forEach((inputId) => {
      document.getElementById(inputId)?.addEventListener('input', updateCalculator);
      document.getElementById(inputId)?.addEventListener('change', updateCalculator);
    });

    document.querySelectorAll('#form-kp-calculator [data-term]').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#form-kp-calculator [data-term]').forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-checked', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-checked', 'true');
        document.getElementById('calc-contract-term').value = btn.getAttribute('data-term');
        updateCalculator();
      });
    });

    document.getElementById('btn-reset-calc')?.addEventListener('click', () => {
      document.getElementById('calc-client-name').value = '';
      document.getElementById('calc-current-bill').value = '14500';
      document.getElementById('calc-our-tariff').value = '8900';
      document.getElementById('calc-contract-term').value = '12';
      document.querySelectorAll('#form-kp-calculator [data-term]').forEach((b) => {
        const is12 = b.getAttribute('data-term') === '12';
        b.classList.toggle('active', is12);
        b.setAttribute('aria-checked', is12 ? 'true' : 'false');
      });
      updateCalculator();
      showToast('Калькулятор сброшен к базовым параметрам');
    });

    document.getElementById('btn-copy-proposal')?.addEventListener('click', () => {
      const txt = document.getElementById('calc-proposal-text')?.value || '';
      navigator.clipboard?.writeText(txt);
      showToast('Расчёт КП скопирован в буфер обмена');
    });

    document.getElementById('btn-send-wa-proposal')?.addEventListener('click', () => {
      shareOrSendProposal('wa');
    });

    document.getElementById('btn-send-tg-proposal')?.addEventListener('click', () => {
      shareOrSendProposal('tg');
    });

    // 4) База клиентов и Умный автономный парсер таблиц
    document.getElementById('btn-load-sample-paste')?.addEventListener('click', () => {
      document.getElementById('crm-raw-paste').value =
        '6671190452; +7 (912) 640-55-12; ООО «УралЭнергоСнаб»; г. Екатеринбург, БЦ Клевер Парк, Ткачей 23, нужен 1 Гбит/с + стат IP; 11900\n' +
        'АО «ЕкатеринбургАвтоТранс»\t6658901234\t8-922-209-14-88\tул. Фронтовых Бригад 18, резерв 1С по оптике\t13500';
    });

    document.getElementById('btn-parse-table')?.addEventListener('click', () => {
      const raw = document.getElementById('crm-raw-paste')?.value || '';
      parseSmartTable(raw);
      document.getElementById('crm-raw-paste').value = '';
    });

    document.getElementById('form-add-client')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const company = document.getElementById('client-company')?.value.trim();
      const rawPhone = document.getElementById('client-phone')?.value.trim();
      if (!company || !rawPhone) {
        showToast('Укажите название компании и телефон ЛПР');
        return;
      }

      const amount = Number(document.getElementById('client-amount')?.value) || 8900;
      const selectedStatus = normalizeStatus(document.getElementById('client-status')?.value);
      const isContract = selectedStatus === '✅ Договор';

      state.clients.unshift({
        id: 'c-' + Date.now(),
        company,
        inn: document.getElementById('client-inn')?.value.trim() || '—',
        phone: cleanPhoneTo7(rawPhone),
        amount,
        status: selectedStatus,
        comment: document.getElementById('client-comment')?.value.trim() || 'Добавлено вручную',
        countedInKpi: isContract,
      });

      if (isContract) {
        state.kpi.dealsFact += 1;
        state.kpi.moneyFact += amount;
        renderHeaderKPI();
      }

      e.target.reset();
      saveState();
      renderClients();
      renderScripts();
      showToast(
        isContract
          ? `Клиент «${company}» добавлен со статусом ✅ Договор (+${formatNumber(amount)} ₽ в план)`
          : `Клиент «${company}» добавлен в базу`
      );
    });

    document.getElementById('crm-search-input')?.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value;
      renderClients();
    });

    document.getElementById('clients-list-container')?.addEventListener('change', (e) => {
      const target = e.target;
      if (target.getAttribute('data-action') === 'status') {
        const id = target.getAttribute('data-id');
        updateClientStatus(id, target.value);
      }
    });

    document.getElementById('clients-list-container')?.addEventListener('click', (e) => {
      const actionEl = e.target.closest('[data-action]');
      if (!actionEl) return;
      const action = actionEl.getAttribute('data-action');
      const id = actionEl.getAttribute('data-id');

      if (action === 'copy-inn') {
        const innVal = actionEl.getAttribute('data-inn') || '';
        if (innVal && innVal !== '—') {
          navigator.clipboard?.writeText(innVal);
          showToast(`ИНН ${innVal} скопирован в буфер обмена`);
        }
      } else if (action === 'open-wa') {
        state.kpi.touchFact += 1;
        saveState();
        renderHeaderKPI();
        showToast('Открыт чат WhatsApp (+1 касание ЛПР в шапку)');
      } else if (action === 'delete') {
        state.clients = state.clients.filter((c) => c.id !== id);
        saveState();
        renderClients();
        renderScripts();
        showToast('Клиент удалён из базы');
      } else if (action === 'to-script') {
        switchScreen('scripts');
        const sel = document.getElementById('script-client-select');
        if (sel) {
          sel.value = id;
          renderScripts();
        }
      }
    });

    // 5) Боевые скрипты 2026
    ensureAllScriptsCategoryTab();
    document.querySelectorAll('#script-categories-nav .category-pill-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        currentScriptCategory = btn.getAttribute('data-category') || 'all';
        isEditingScript = false;
        renderScripts();
      });
    });

    document.getElementById('script-client-select')?.addEventListener('change', renderScripts);

    document.getElementById('btn-copy-script')?.addEventListener('click', () => {
      const txt = document.getElementById('active-script-body')?.textContent || '';
      navigator.clipboard?.writeText(txt);
      showToast('Скрипт скопирован в буфер обмена');
    });

    // Кнопка «Отправить в WhatsApp»: сразу открывает чат с подставленным текстом (и номером выбранного клиента)
    document.getElementById('btn-wa-script')?.addEventListener('click', () => {
      const txt = document.getElementById('active-script-body')?.textContent || '';
      if (!txt) return;

      navigator.clipboard?.writeText(txt);
      state.kpi.touchFact += 1;
      saveState();
      renderHeaderKPI();

      const client = getSelectedScriptClient();
      const cleanPhone = client ? cleanPhoneTo7(client.phone) : '';
      const waUrl = cleanPhone
        ? `https://api.whatsapp.com/send?phone=${encodeURIComponent(cleanPhone)}&text=${encodeURIComponent(txt)}`
        : `https://api.whatsapp.com/send?text=${encodeURIComponent(txt)}`;

      openExternalLinkSafe(waUrl);
      showToast(
        client
          ? `Открыт WhatsApp для «${client.company}» (+1 касание ЛПР)`
          : 'Открыт WhatsApp с подставленным текстом скрипта (+1 касание ЛПР)'
      );
    });

    document.getElementById('btn-new-script')?.addEventListener('click', () => {
      isEditingScript = true;
      currentScriptId = null;
      document.getElementById('edit-script-title').value = '';
      document.getElementById('edit-script-category').value =
        currentScriptCategory === 'all' ? 'Холодный заход в WA' : currentScriptCategory;
      document.getElementById('edit-script-content').value =
        'Здравствуйте! Пишу для {КОМПАНИЯ} (ИНН {ИНН}) от оператора «{МОЯ_КОМПАНИЯ}». Спецтариф на оптику — {СУММА} ₽/мес...';
      renderScripts();
    });

    document.getElementById('btn-toggle-edit-script')?.addEventListener('click', () => {
      const sc = state.scripts.find((s) => s.id === currentScriptId) || state.scripts[0];
      if (!sc) return;
      currentScriptId = sc.id;
      isEditingScript = !isEditingScript;
      if (isEditingScript) {
        document.getElementById('edit-script-title').value = sc.title;
        document.getElementById('edit-script-category').value = sc.category;
        document.getElementById('edit-script-content').value = sc.content;
      }
      renderScripts();
    });

    document.getElementById('btn-cancel-script-edit')?.addEventListener('click', () => {
      if (!currentScriptId && state.scripts[0]) {
        currentScriptId = state.scripts[0].id;
      }
      isEditingScript = false;
      renderScripts();
    });

    document.getElementById('form-script-editor')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('edit-script-title')?.value.trim();
      const category = document.getElementById('edit-script-category')?.value;
      const content = document.getElementById('edit-script-content')?.value.trim();
      if (!title || !content) {
        showToast('Заполните название и текст скрипта');
        return;
      }

      if (currentScriptId) {
        const sc = state.scripts.find((s) => s.id === currentScriptId);
        if (sc) {
          sc.title = title;
          sc.category = category;
          sc.content = content;
        }
      } else {
        const newId = 's-' + Date.now();
        state.scripts.push({ id: newId, title, category, content });
        currentScriptId = newId;
      }

      if (currentScriptCategory !== 'all') {
        currentScriptCategory = category;
      }
      isEditingScript = false;
      saveState();
      renderScripts();
      showToast('Скрипт сохранён');
    });

    document.getElementById('btn-delete-script')?.addEventListener('click', () => {
      if (!currentScriptId || state.scripts.length <= 1) return;
      state.scripts = state.scripts.filter((s) => s.id !== currentScriptId);
      currentScriptId = state.scripts[0]?.id || null;
      isEditingScript = false;
      saveState();
      renderScripts();
      showToast('Скрипт удалён');
    });

    // 6) Тренажёр возражений B2B (Режим 1: Карточки 15с + Режим 2: Спарринг SpeechSynthesis + Оценка 1..100)
    document.querySelectorAll('[data-trainer-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-trainer-mode');
        document.querySelectorAll('[data-trainer-mode]').forEach((b) => {
          const active = b.getAttribute('data-trainer-mode') === mode;
          b.classList.toggle('active', active);
          b.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        document.getElementById('trainer-pane-flashcards').hidden = mode !== 'flashcards';
        document.getElementById('trainer-pane-arena').hidden = mode !== 'arena';
        if (mode === 'arena') {
          renderArenaScenario();
        }
        refreshIcons();
      });
    });

    document.getElementById('btn-start-timer')?.addEventListener('click', startObjectionTimer);

    document.getElementById('btn-reveal-rebuttal')?.addEventListener('click', () => {
      const box = document.getElementById('rebuttal-reveal-box');
      const lbl = document.getElementById('label-reveal-rebuttal');
      box.hidden = !box.hidden;
      lbl.textContent = box.hidden ? 'Показать эталонный перехват' : 'Скрыть эталонный перехват';
    });

    document.getElementById('btn-prev-objection')?.addEventListener('click', () => {
      const len = (state.objections && state.objections.length) || DEFAULT_OBJECTIONS.length;
      currentObjectionIndex = (currentObjectionIndex - 1 + len) % len;
      renderObjectionCard();
    });

    document.getElementById('btn-next-objection')?.addEventListener('click', () => {
      const len = (state.objections && state.objections.length) || DEFAULT_OBJECTIONS.length;
      currentObjectionIndex = (currentObjectionIndex + 1) % len;
      renderObjectionCard();
    });

    document.getElementById('btn-arena-random')?.addEventListener('click', () => {
      const list =
        state.objections && state.objections.length > 0 ? state.objections : DEFAULT_OBJECTIONS;
      currentArenaIndex = (currentArenaIndex + 1) % list.length;
      renderArenaScenario();
      const item = list[currentArenaIndex % list.length];
      if (item) {
        speakObjectionVoice(item.quote);
      }
    });

    document.getElementById('btn-arena-insert-sample')?.addEventListener('click', () => {
      const list =
        state.objections && state.objections.length > 0 ? state.objections : DEFAULT_OBJECTIONS;
      const item = list[currentArenaIndex % list.length];
      if (item) {
        document.getElementById('arena-user-response').value =
          item.sampleAnswer || item.rebuttal || '';
      }
    });

    document.getElementById('form-arena-sparring')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = document.getElementById('arena-user-response')?.value.trim() || '';
      if (!val) {
        showToast('Напишите или надиктуйте ответ для оценки от 1 до 100');
        return;
      }
      evaluateArenaAnswer(val);
    });

    document.getElementById('btn-voice-input')?.addEventListener('click', () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        showToast(
          'Распознавание речи недоступно в этом браузере — введите ответ текстом или нажмите «Подставить сильный ответ»'
        );
        return;
      }
      const recognition = new SpeechRecognition();
      recognition.lang = 'ru-RU';
      recognition.interimResults = false;
      const btn = document.getElementById('btn-voice-input');
      const statusTxt = document.getElementById('voice-status-text');
      btn.classList.add('recording');
      statusTxt.textContent = 'Слушаю... говорите в микрофон';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const area = document.getElementById('arena-user-response');
        area.value = (area.value ? area.value + ' ' : '') + transcript;
        evaluateArenaAnswer(area.value);
      };
      recognition.onerror = () => {
        btn.classList.remove('recording');
        statusTxt.textContent = 'Голосовой ввод (Микрофон)';
        showToast('Не удалось распознать голос — проверьте доступ к микрофону');
      };
      recognition.onend = () => {
        btn.classList.remove('recording');
        statusTxt.textContent = 'Голосовой ввод (Микрофон)';
      };
      recognition.start();
    });

    // 7) Экран Настроек
    [
      'set-company-name',
      'set-label-revenue',
      'set-target-revenue',
      'set-label-contracts',
      'set-target-contracts',
      'set-label-touches',
      'set-target-touches',
    ].forEach((id) => {
      document.getElementById(id)?.addEventListener('input', applySettingsFromForm);
    });

    document.getElementById('form-settings')?.addEventListener('submit', (e) => {
      e.preventDefault();
      applySettingsFromForm();
      showToast('Настройки компании и метрик KPI сохранены');
    });

    document.getElementById('btn-export-json')?.addEventListener('click', () => {
      const jsonStr = JSON.stringify(state, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `huntos-state-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Резервная копия JSON скачана');
    });

    document.getElementById('btn-copy-json')?.addEventListener('click', () => {
      const jsonStr = JSON.stringify(state, null, 2);
      navigator.clipboard?.writeText(jsonStr);
      const area = document.getElementById('import-json-textarea');
      if (area) area.value = jsonStr;
      showToast('JSON состояния скопирован в буфер');
    });

    document.getElementById('btn-import-json-apply')?.addEventListener('click', () => {
      const raw = document.getElementById('import-json-textarea')?.value.trim();
      if (!raw) {
        showToast('Вставьте JSON для восстановления');
        return;
      }
      try {
        const parsed = JSON.parse(raw);
        const def = createDefaultState();
        state = {
          ...def,
          ...parsed,
          kpi: { ...def.kpi, ...(parsed.kpi || {}) },
        };
        saveState();
        renderAll();
        showToast('Состояние восстановлено из JSON');
      } catch {
        showToast('Ошибка: неверный формат JSON');
      }
    });

    document.getElementById('input-json-file')?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(String(reader.result));
          const def = createDefaultState();
          state = {
            ...def,
            ...parsed,
            kpi: { ...def.kpi, ...(parsed.kpi || {}) },
          };
          saveState();
          renderAll();
          showToast('База загружена из файла JSON');
        } catch {
          showToast('Ошибка чтения файла JSON');
        }
      };
      reader.readAsText(file);
    });

    document.getElementById('btn-factory-reset')?.addEventListener('click', () => {
      localStorage.removeItem(STORAGE_KEY);
      state = createDefaultState();
      saveState();
      renderAll();
      showToast('Данные сброшены (загружены 4 компании Екатеринбурга, 6 скриптов и 6 возражений)');
    });
  }

  function renderAll() {
    renderHeaderKPI();
    updateCalculator();
    renderClients();
    renderScripts();
    renderObjectionCard();
    renderArenaScenario();
    syncSettingsForm();
    switchScreen(state.currentScreen || 'dashboard');
    refreshIcons();
  }

  document.addEventListener('DOMContentLoaded', () => {
    bindEvents();
    renderAll();
  });
})();
