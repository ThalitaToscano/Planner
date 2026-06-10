const authShell = document.querySelector('.auth-shell');
const authForm = document.getElementById('auth-form');
const authUsername = document.getElementById('auth-username');
const authPassword = document.getElementById('auth-password');
const authSubmit = document.getElementById('auth-submit');
const authNote = document.querySelector('.auth-note');
const logoutBtn = document.getElementById('logout-btn');
const pageShell = document.querySelector('.page-shell');
const dailyForm = document.getElementById('daily-form');
const dailyInput = document.getElementById('daily-input');
const dailyCategory = document.getElementById('daily-category');
const dailyList = document.getElementById('daily-list');
const adhocForm = document.getElementById('adhoc-form');
const adhocInput = document.getElementById('adhoc-input');
const adhocList = document.getElementById('adhoc-list');
const pendingForm = document.getElementById('pending-form');
const pendingTitle = document.getElementById('pending-title');
const pendingTopic = document.getElementById('pending-topic');
const pendingList = document.getElementById('pending-list');
const progressText = document.getElementById('progress-text');
const progressChart = document.getElementById('progress-chart');
const ctx = progressChart.getContext('2d');
const tabButtons = document.querySelectorAll('.tab');
const views = document.querySelectorAll('.view');
const weekGrid = document.getElementById('week-grid');
const monthGrid = document.getElementById('month-grid');
const socialGrid = document.getElementById('social-grid');
const notesModal = document.getElementById('notes-modal');
const notesBackdrop = document.getElementById('notes-backdrop');
const notesText = document.getElementById('notes-text');
const notesSave = document.getElementById('notes-save');
const notesClose = document.getElementById('notes-close');
const notesCancel = document.getElementById('notes-cancel');
const monthlyMonth = document.getElementById('monthly-month');
const monthlyYear = document.getElementById('monthly-year');
const monthlyGo = document.getElementById('monthly-go');
const socialMonth = document.getElementById('social-month');
const socialYear = document.getElementById('social-year');
const socialGo = document.getElementById('social-go');

let dailyTasks = [];
let adhocTasks = [];
let pendingItems = [];
let weeklyTasks = {};
let monthlyTasks = {};
let socialTasks = {};
let selectedMonth = null; // 0-11
let selectedYear = null;
let socialSelectedMonth = null;
let socialSelectedYear = null;
let notesModalState = { key: null, index: null };

function saveAuthState() {
  localStorage.setItem('plannerUser', JSON.stringify({
    username: authUsername.dataset.storedName || authUsername.value.trim(),
    password: authPassword.dataset.storedPass || authPassword.value.trim(),
  }));
}

function loadAuthState() {
  return JSON.parse(localStorage.getItem('plannerUser')) || null;
}

function setAuthenticated(value) {
  localStorage.setItem('plannerAuthenticated', value ? 'true' : 'false');
}

function isAuthenticated() {
  return localStorage.getItem('plannerAuthenticated') === 'true';
}

function showApp() {
  authShell.classList.add('hidden');
  pageShell.classList.remove('hidden');
}

function showAuth() {
  authShell.classList.remove('hidden');
  pageShell.classList.add('hidden');
}

function initializeAuth() {
  const stored = loadAuthState();
  if (stored) {
    authNote.textContent = 'Digite sua senha para acessar seu plano diário.';
    authUsername.value = stored.username;
    authUsername.disabled = true;
    authPassword.focus();
  } else {
    authNote.textContent = 'Cadastre sua senha agora para proteger seu plano.';
  }
}

function validateAuth(username, password) {
  const stored = loadAuthState();
  if (!stored) {
    localStorage.setItem('plannerUser', JSON.stringify({ username, password }));
    return true;
  }
  return stored.username === username && stored.password === password;
}

function logout() {
  setAuthenticated(false);
  showAuth();
  authPassword.value = '';
  authPassword.focus();
}

function saveState() {
  localStorage.setItem('dailyTasks', JSON.stringify(dailyTasks));
  localStorage.setItem('adhocTasks', JSON.stringify(adhocTasks));
  localStorage.setItem('pendingItems', JSON.stringify(pendingItems));
  localStorage.setItem('weeklyTasks', JSON.stringify(weeklyTasks));
  localStorage.setItem('monthlyTasks', JSON.stringify(monthlyTasks));
  localStorage.setItem('socialTasks', JSON.stringify(socialTasks));
}

function loadState() {
  dailyTasks = JSON.parse(localStorage.getItem('dailyTasks') || '[]');
  adhocTasks = JSON.parse(localStorage.getItem('adhocTasks') || '[]');
  pendingItems = JSON.parse(localStorage.getItem('pendingItems') || '[]');
  weeklyTasks = JSON.parse(localStorage.getItem('weeklyTasks') || '{}');
  monthlyTasks = JSON.parse(localStorage.getItem('monthlyTasks') || '{}');
  socialTasks = JSON.parse(localStorage.getItem('socialTasks') || '{}');
}

function getCategoryClass(category) {
  if (!category) return '';
  return `category-${category.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '')}`;
}

function getMonthDates(year, month) {
  const y = Number(year);
  const m = Number(month);
  const dayCount = new Date(y, m + 1, 0).getDate();
  const dates = [];
  for (let day = 1; day <= dayCount; day += 1) {
    dates.push(new Date(y, m, day));
  }
  return dates;
}

function populateMonthYearControls() {
  const now = new Date();
  const curYear = now.getFullYear();
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

  // populate monthly selectors
  if (monthlyMonth && monthlyYear) {
    monthlyMonth.innerHTML = '';
    months.forEach((m, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = m;
      monthlyMonth.appendChild(opt);
    });
    monthlyYear.innerHTML = '';
    for (let y = curYear - 3; y <= curYear + 3; y += 1) {
      const opt = document.createElement('option');
      opt.value = y;
      opt.textContent = y;
      monthlyYear.appendChild(opt);
    }
    // load saved or default
    const saved = JSON.parse(localStorage.getItem('monthlyView') || 'null');
    if (saved) {
      selectedMonth = saved.month;
      selectedYear = saved.year;
    } else {
      selectedMonth = now.getMonth();
      selectedYear = now.getFullYear();
    }
    monthlyMonth.value = selectedMonth;
    monthlyYear.value = selectedYear;
  }

  // populate social selectors
  if (socialMonth && socialYear) {
    socialMonth.innerHTML = '';
    months.forEach((m, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = m;
      socialMonth.appendChild(opt);
    });
    socialYear.innerHTML = '';
    for (let y = curYear - 3; y <= curYear + 3; y += 1) {
      const opt = document.createElement('option');
      opt.value = y;
      opt.textContent = y;
      socialYear.appendChild(opt);
    }
    const savedS = JSON.parse(localStorage.getItem('socialView') || 'null');
    if (savedS) {
      socialSelectedMonth = savedS.month;
      socialSelectedYear = savedS.year;
    } else {
      socialSelectedMonth = now.getMonth();
      socialSelectedYear = now.getFullYear();
    }
    socialMonth.value = socialSelectedMonth;
    socialYear.value = socialSelectedYear;
  }
}

function saveViewSelection(key, month, year) {
  localStorage.setItem(key, JSON.stringify({ month, year }));
}

function createTaskItem(task, index, type, meta = {}) {
  const item = document.createElement('li');
  item.className = `task-item ${type === 'daily' ? 'macro-task' : type === 'weekly' ? 'weekly-task' : 'daily-task'}`;

  const label = document.createElement(type !== 'daily' ? 'label' : 'div');
  label.className = 'task-label';

  if (type !== 'daily') {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;
    checkbox.addEventListener('change', () => {
      if (type === 'adhoc') toggleTaskDone(type, index);
      else togglePlannedDone(meta);
    });
    label.appendChild(checkbox);
  }

  const textWrapper = document.createElement('div');
  textWrapper.className = 'task-text';

  const title = document.createElement('span');
  title.className = 'task-title';
  title.textContent = task.text;
  if (task.done) title.classList.add('completed');
  textWrapper.appendChild(title);

  if (task.source === 'pending') {
    const badge = document.createElement('span');
    badge.className = 'category-chip category-pending';
    badge.textContent = 'Pendência';
    textWrapper.appendChild(badge);
  } else if (type === 'weekly' && task.source === 'macro') {
    const badge = document.createElement('span');
    badge.className = 'category-chip category-macro';
    badge.textContent = 'Macro';
    textWrapper.appendChild(badge);
  }

  if (task.category) {
    const badge = document.createElement('span');
    badge.className = `category-chip ${getCategoryClass(task.category)}`;
    badge.textContent = task.category;
    textWrapper.appendChild(badge);
  }

  label.appendChild(textWrapper);

  const remove = document.createElement('button');
  remove.textContent = '✕';
  remove.title = 'Remover tarefa';
  remove.addEventListener('click', () => {
    if (type === 'adhoc') removeTask(type, index);
    else if (type === 'daily') removeTask(type, index);
    else removePlannedTask(meta);
  });

  item.appendChild(label);
  item.appendChild(remove);
  return item;
}

function getSubtopicClass(subtopic) {
  if (!subtopic) return 'pending-chip-default';
  const normalized = subtopic.toLowerCase();
  if (normalized.includes('urgente')) return 'pending-chip-urgent';
  if (normalized.includes('atenção') || normalized.includes('atencao')) return 'pending-chip-attention';
  if (normalized.includes('verde') || normalized.includes('com calma')) return 'pending-chip-green';
  return 'pending-chip-default';
}

function createPendingItem(item, index) {
  const card = document.createElement('div');
  card.className = 'pending-item';

  const content = document.createElement('div');
  content.className = 'pending-item-content';

  const title = document.createElement('div');
  title.className = 'pending-title';
  title.textContent = item.title;

  const meta = document.createElement('div');
  meta.className = 'pending-meta';

  const topicChip = document.createElement('span');
  topicChip.className = 'pending-chip pending-chip-topic';
  topicChip.textContent = item.topic || 'Sem tópico';

  const subtopicChip = document.createElement('span');
  subtopicChip.className = `pending-chip ${getSubtopicClass(item.subtopic)}`;
  subtopicChip.textContent = item.subtopic || 'Sem subtópico';

  meta.appendChild(topicChip);
  meta.appendChild(subtopicChip);
  content.appendChild(title);
  content.appendChild(meta);

  const remove = document.createElement('button');
  remove.textContent = 'Remover';
  remove.title = 'Remover pendência';
  remove.addEventListener('click', () => removePending(index));

  card.appendChild(content);
  card.appendChild(remove);
  return card;
}

function renderTasks() {
  dailyList.innerHTML = '';
  adhocList.innerHTML = '';

  dailyTasks.forEach((task, index) => {
    dailyList.appendChild(createTaskItem(task, index, 'daily'));
  });

  const todayKey = getTodayKey();
  const todayWeekly = weeklyTasks[todayKey] || [];
  const todayMonthly = monthlyTasks[todayKey] || [];

  todayWeekly.forEach((task, index) => {
    adhocList.appendChild(createTaskItem(task, index, 'weekly', { dateKey: todayKey, source: 'weekly' }));
  });

  todayMonthly.forEach((task, index) => {
    adhocList.appendChild(createTaskItem(task, index, 'weekly', { dateKey: todayKey, source: 'monthly' }));
  });

  adhocTasks.forEach((task, index) => {
    adhocList.appendChild(createTaskItem(task, index, 'adhoc'));
  });

  renderProgress();
  renderWeeklyPlanner();
  renderMonthlyPlanner();
  renderSocialCalendar();
}

function renderPending() {
  pendingList.innerHTML = '';
  if (pendingItems.length === 0) {
    const placeholder = document.createElement('p');
    placeholder.textContent = 'Nenhuma pendência cadastrada ainda. Adicione uma para organizar seus tópicos.';
    placeholder.style.color = 'var(--text-muted)';
    pendingList.appendChild(placeholder);
    renderWeeklyPlanner();
    renderMonthlyPlanner();
    return;
  }

  const topics = pendingItems.reduce((acc, item, index) => {
    const key = item.topic ? item.topic.trim() : 'Sem tópico';
    if (!acc[key]) acc[key] = [];
    acc[key].push({ item, index });
    return acc;
  }, {});

  Object.keys(topics).forEach((topic) => {
    const column = document.createElement('div');
    column.className = 'todo-topic-column';

    const header = document.createElement('h3');
    header.textContent = topic;
    column.appendChild(header);

    topics[topic].forEach(({ item, index }) => {
      column.appendChild(createPendingItem(item, index));
    });

    pendingList.appendChild(column);
  });

  renderWeeklyPlanner();
  renderMonthlyPlanner();
}

function getDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function getTodayKey() {
  return getDateKey(new Date());
}

function getTodayWeeklyTasks() {
  const todayKey = getTodayKey();
  return weeklyTasks[todayKey] || [];
}

function getTodayMonthlyTasks() {
  const todayKey = getTodayKey();
  return monthlyTasks[todayKey] || [];
}

function getWeekDates() {
  const base = new Date();
  const dates = [];
  for (let i = 0; i < 7; i += 1) {
    const date = new Date(base);
    date.setDate(base.getDate() + i);
    dates.push(date);
  }
  return dates;
}

function initWeeklyTasks() {
  const dates = getWeekDates();
  dates.forEach((date) => {
    const key = getDateKey(date);
    if (!weeklyTasks[key]) {
      weeklyTasks[key] = [];
    }
  });
  saveState();
}

function addWeeklyTask(dateKey, text, source = 'custom', category = '') {
  if (!text.trim()) return;
  if (!weeklyTasks[dateKey]) weeklyTasks[dateKey] = [];
  weeklyTasks[dateKey].push({ text: text.trim(), source, category, done: false });
  saveState();
  renderTasks();
}

function addMonthlyTask(dateKey, text) {
  if (!text.trim()) return;
  if (!monthlyTasks[dateKey]) monthlyTasks[dateKey] = [];
  monthlyTasks[dateKey].push({ text: text.trim(), source: 'monthly', done: false });
  saveState();
  renderTasks();
}

function removeWeeklyTask(dateKey, index) {
  weeklyTasks[dateKey].splice(index, 1);
  saveState();
  renderTasks();
}

function removeMonthlyTask(dateKey, index) {
  monthlyTasks[dateKey].splice(index, 1);
  saveState();
  renderTasks();
}

function addItemToDay(dateKey, itemType, itemIndex) {
  if (!weeklyTasks[dateKey]) weeklyTasks[dateKey] = [];
  if (itemType === 'macro') {
    const selected = dailyTasks[itemIndex];
    if (!selected) return;
    weeklyTasks[dateKey].push({ text: selected.text, source: 'macro', category: selected.category, done: false });
  }
  if (itemType === 'pending') {
    const selected = pendingItems[itemIndex];
    if (!selected) return;
    weeklyTasks[dateKey].push({ text: selected.title, source: 'pending', done: false });
  }
  saveState();
  renderTasks();
}

function toggleWeeklyDone(dateKey, index) {
  weeklyTasks[dateKey][index].done = !weeklyTasks[dateKey][index].done;
  saveState();
  renderTasks();
}

function toggleMonthlyDone(dateKey, index) {
  monthlyTasks[dateKey][index].done = !monthlyTasks[dateKey][index].done;
  saveState();
  renderTasks();
}

function togglePlannedDone(meta) {
  if (!meta || !meta.dateKey || !meta.source) return;
  if (meta.source === 'monthly') {
    toggleMonthlyDone(meta.dateKey, meta.index);
  } else {
    toggleWeeklyDone(meta.dateKey, meta.index);
  }
}

function removePlannedTask(meta) {
  if (!meta || !meta.dateKey || !meta.source) return;
  if (meta.source === 'monthly') {
    removeMonthlyTask(meta.dateKey, meta.index);
  } else {
    removeWeeklyTask(meta.dateKey, meta.index);
  }
}

function renderWeeklyPlanner() {
  weekGrid.innerHTML = '';
  const dates = getWeekDates();

  dates.forEach((date, index) => {
    const key = getDateKey(date);
    if (!weeklyTasks[key]) weeklyTasks[key] = [];

    const card = document.createElement('div');
    card.className = 'day-card';

    const header = document.createElement('div');
    header.className = 'day-card-header';
    const title = document.createElement('strong');
    title.textContent = date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
    const label = document.createElement('span');
    label.textContent = index === 0 ? 'Hoje' : date.toLocaleDateString('pt-BR', { weekday: 'long' });
    header.appendChild(title);
    header.appendChild(label);
    card.appendChild(header);

    const list = document.createElement('ul');
    list.className = 'week-list';

    const todayWeeklyTasks = weeklyTasks[key] || [];
    const todayMonthlyTasks = monthlyTasks[key] || [];

    todayWeeklyTasks.forEach((task, taskIndex) => {
      const taskItem = document.createElement('li');
      taskItem.className = `week-task ${task.source === 'pending' ? 'pending-card' : ''} ${task.done ? 'done' : ''}`;

      const taskLabel = document.createElement('label');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.done;
      checkbox.addEventListener('change', () => togglePlannedDone({ dateKey: key, source: 'weekly', index: taskIndex }));
      const taskName = document.createElement('span');
      taskName.textContent = task.text;
      if (task.done) taskName.classList.add('completed');
      taskLabel.appendChild(checkbox);
      taskLabel.appendChild(taskName);

      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.textContent = '✕';
      removeButton.title = 'Remover tarefa do dia';
      removeButton.addEventListener('click', () => removePlannedTask({ dateKey: key, source: 'weekly', index: taskIndex }));

      taskItem.appendChild(taskLabel);
      taskItem.appendChild(removeButton);
      list.appendChild(taskItem);
    });

    todayMonthlyTasks.forEach((task, taskIndex) => {
      const taskItem = document.createElement('li');
      taskItem.className = `week-task pending-card ${task.done ? 'done' : ''}`;

      const taskLabel = document.createElement('label');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.done;
      checkbox.addEventListener('change', () => togglePlannedDone({ dateKey: key, source: 'monthly', index: taskIndex }));
      const taskName = document.createElement('span');
      taskName.textContent = task.text;
      if (task.done) taskName.classList.add('completed');
      taskLabel.appendChild(checkbox);
      taskLabel.appendChild(taskName);

      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.textContent = '✕';
      removeButton.title = 'Remover tarefa do dia';
      removeButton.addEventListener('click', () => removePlannedTask({ dateKey: key, source: 'monthly', index: taskIndex }));

      taskItem.appendChild(taskLabel);
      taskItem.appendChild(removeButton);
      list.appendChild(taskItem);
    });
    card.appendChild(list);

    const form = document.createElement('form');
    form.className = 'day-form';
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Adicionar tarefa para o dia';
    const button = document.createElement('button');
    button.type = 'submit';
    button.textContent = 'Adicionar';
    form.appendChild(input);
    form.appendChild(button);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      addWeeklyTask(key, input.value);
      input.value = '';
    });
    card.appendChild(form);

    const addRow = document.createElement('div');
    addRow.className = 'day-pending-row';

    const macroSelect = document.createElement('select');
    const macroDefault = document.createElement('option');
    macroDefault.value = '';
    macroDefault.textContent = 'Selecionar item do macro diário';
    macroSelect.appendChild(macroDefault);
    if (dailyTasks.length > 0) {
      const macroGroup = document.createElement('optgroup');
      macroGroup.label = 'Macro diário';
      dailyTasks.forEach((task, macroIndex) => {
        const option = document.createElement('option');
        option.value = `macro-${macroIndex}`;
        option.textContent = task.text;
        macroGroup.appendChild(option);
      });
      macroSelect.appendChild(macroGroup);
    }

    const addMacroButton = document.createElement('button');
    addMacroButton.type = 'button';
    addMacroButton.textContent = 'Adicionar macro';
    addMacroButton.disabled = dailyTasks.length === 0;
    addMacroButton.addEventListener('click', () => {
      if (!macroSelect.value) return;
      const [itemType, itemIndex] = macroSelect.value.split('-');
      addItemToDay(key, itemType, Number(itemIndex));
      macroSelect.value = '';
    });
    addRow.appendChild(macroSelect);
    addRow.appendChild(addMacroButton);

    const pendingSelect = document.createElement('select');
    const pendingDefault = document.createElement('option');
    pendingDefault.value = '';
    pendingDefault.textContent = 'Selecionar pendência futura';
    pendingSelect.appendChild(pendingDefault);
    if (pendingItems.length > 0) {
      const pendingGroup = document.createElement('optgroup');
      pendingGroup.label = 'Pendências futuras';
      pendingItems.forEach((item, pendingIndex) => {
        const option = document.createElement('option');
        option.value = `pending-${pendingIndex}`;
        option.textContent = item.title;
        pendingGroup.appendChild(option);
      });
      pendingSelect.appendChild(pendingGroup);
    }

    const addPendingButton = document.createElement('button');
    addPendingButton.type = 'button';
    addPendingButton.textContent = 'Adicionar pendência';
    addPendingButton.disabled = pendingItems.length === 0;
    addPendingButton.addEventListener('click', () => {
      if (!pendingSelect.value) return;
      const [itemType, itemIndex] = pendingSelect.value.split('-');
      addItemToDay(key, itemType, Number(itemIndex));
      pendingSelect.value = '';
    });
    addRow.appendChild(pendingSelect);
    addRow.appendChild(addPendingButton);
    card.appendChild(addRow);

    weekGrid.appendChild(card);
  });
}

function addMonthlyTask(dateKey, text) {
  if (!text.trim()) return;
  if (!monthlyTasks[dateKey]) monthlyTasks[dateKey] = [];
  monthlyTasks[dateKey].push({ text: text.trim(), source: 'monthly', done: false });
  saveState();
  renderTasks();
}

function removeMonthlyTask(dateKey, index) {
  monthlyTasks[dateKey].splice(index, 1);
  saveState();
  renderTasks();
}

function toggleMonthlyDone(dateKey, index) {
  monthlyTasks[dateKey][index].done = !monthlyTasks[dateKey][index].done;
  saveState();
  renderTasks();
}

function removePlannedTask(meta) {
  if (!meta || !meta.dateKey || !meta.source) return;
  if (meta.source === 'monthly') {
    removeMonthlyTask(meta.dateKey, meta.index);
  } else {
    removeWeeklyTask(meta.dateKey, meta.index);
  }
}

function togglePlannedDone(meta) {
  if (!meta || !meta.dateKey || !meta.source) return;
  if (meta.source === 'monthly') {
    toggleMonthlyDone(meta.dateKey, meta.index);
  } else {
    toggleWeeklyDone(meta.dateKey, meta.index);
  }
}

function renderMonthlyPlanner() {
  monthGrid.innerHTML = '';
  const now = new Date();
  const year = (selectedYear !== null) ? selectedYear : now.getFullYear();
  const month = (selectedMonth !== null) ? selectedMonth : now.getMonth();
  const dates = getMonthDates(year, month);

  dates.forEach((date) => {
    const key = getDateKey(date);
    const card = document.createElement('div');
    card.className = 'month-card';

    const dayHeader = document.createElement('div');
    dayHeader.className = 'day-card-header';
    const dayTitle = document.createElement('strong');
    dayTitle.textContent = date.getDate();
    const dayLabel = document.createElement('span');
    dayLabel.textContent = date.toLocaleDateString('pt-BR', { weekday: 'short' });
    dayHeader.appendChild(dayTitle);
    dayHeader.appendChild(dayLabel);
    card.appendChild(dayHeader);

    const list = document.createElement('ul');
    list.className = 'month-day-list';
    const dayTasks = monthlyTasks[key] || [];
    dayTasks.forEach((task, taskIndex) => {
      const item = document.createElement('li');
      item.className = 'week-task';
      const label = document.createElement('label');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.done;
      checkbox.addEventListener('change', () => toggleMonthlyDone(key, taskIndex));
      const title = document.createElement('span');
      title.textContent = task.text;
      if (task.done) title.classList.add('completed');
      label.appendChild(checkbox);
      label.appendChild(title);

      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.textContent = '✕';
      removeButton.title = 'Remover tarefa mensal';
      removeButton.addEventListener('click', () => removeMonthlyTask(key, taskIndex));

      item.appendChild(label);
      item.appendChild(removeButton);
      list.appendChild(item);
    });
    card.appendChild(list);

    const form = document.createElement('form');
    form.className = 'day-form';
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Adicionar para o dia';
    const button = document.createElement('button');
    button.type = 'submit';
    button.textContent = 'Adicionar';
    form.appendChild(input);
    form.appendChild(button);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      addMonthlyTask(key, input.value);
      input.value = '';
    });
    card.appendChild(form);

    monthGrid.appendChild(card);
  });
}

function toggleTaskDone(type, index) {
  const tasks = type === 'daily' ? dailyTasks : adhocTasks;
  tasks[index].done = !tasks[index].done;
  saveState();
  renderTasks();
}

function removeTask(type, index) {
  const tasks = type === 'daily' ? dailyTasks : adhocTasks;
  tasks.splice(index, 1);
  saveState();
  renderTasks();
}

function removePending(index) {
  pendingItems.splice(index, 1);
  saveState();
  renderPending();
}

function renderProgress() {
  const todayWeekly = getTodayWeeklyTasks();
  const todayMonthly = getTodayMonthlyTasks();
  const total = adhocTasks.length + todayWeekly.length + todayMonthly.length;
  const doneCount = adhocTasks.filter((task) => task.done).length + todayWeekly.filter((task) => task.done).length + todayMonthly.filter((task) => task.done).length;
  progressText.textContent = `${doneCount}/${total} concluídas`;
  drawChart(doneCount, total);
}

function drawChart(done, total) {
  const width = progressChart.width;
  const height = progressChart.height;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 24;

  ctx.clearRect(0, 0, width, height);

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fillStyle = '#e8edf4';
  ctx.fill();

  if (total > 0) {
    const progress = done / total;
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + progress * Math.PI * 2;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = '#5c7695';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, endAngle, startAngle + Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = '#dfe7f0';
    ctx.fill();

    ctx.font = '700 28px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#24303f';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const percent = Math.round(progress * 100);
    ctx.fillText(`${percent}%`, centerX, centerY - 6);
    ctx.font = '500 14px Inter, system-ui, sans-serif';
    ctx.fillText('do dia', centerX, centerY + 22);
  } else {
    ctx.font = '600 18px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#5d6b7d';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Adicione tarefas', centerX, centerY - 6);
    ctx.font = '500 12px Inter, system-ui, sans-serif';
    ctx.fillText('para acompanhar', centerX, centerY + 18);
  }
}

function addDailyTask(text, category) {
  if (!text.trim()) return;
  dailyTasks.push({ text: text.trim(), category: category || 'ESTUDO', done: false });
  dailyInput.value = '';
  dailyCategory.value = 'ESTUDO';
  saveState();
  renderTasks();
}

function addAdhocTask(text) {
  if (!text.trim()) return;
  adhocTasks.push({ text: text.trim(), done: false });
  adhocInput.value = '';
  saveState();
  renderTasks();
}

function addPendingItem(title, topic) {
  if (!title.trim()) return;
  const selected = document.querySelector('input[name="pending-priority"]:checked');
  const subtopicVal = selected ? selected.value : '';
  pendingItems.push({ title: title.trim(), topic: topic.trim(), subtopic: subtopicVal });
  pendingTitle.value = '';
  pendingTopic.value = '';
  // clear radio selection
  const radios = document.querySelectorAll('input[name="pending-priority"]');
  radios.forEach((r) => { r.checked = false; });
  saveState();
  renderPending();
}

dailyForm.addEventListener('submit', (event) => {
  event.preventDefault();
  addDailyTask(dailyInput.value, dailyCategory.value);
});

adhocForm.addEventListener('submit', (event) => {
  event.preventDefault();
  addAdhocTask(adhocInput.value);
});

pendingForm.addEventListener('submit', (event) => {
  event.preventDefault();
  addPendingItem(pendingTitle.value, pendingTopic.value);
});

// Social (calendário editorial) functions
function addSocialTask(dateKey, text) {
  if (!text.trim()) return;
  if (!socialTasks[dateKey]) socialTasks[dateKey] = [];
  socialTasks[dateKey].push({ text: text.trim(), done: false, notes: '' });
  saveState();
  renderSocialCalendar();
}

function removeSocialTask(dateKey, index) {
  socialTasks[dateKey].splice(index, 1);
  saveState();
  renderSocialCalendar();
}

function toggleSocialDone(dateKey, index) {
  socialTasks[dateKey][index].done = !socialTasks[dateKey][index].done;
  saveState();
  renderSocialCalendar();
}

function renderSocialCalendar() {
  if (!socialGrid) return;
  socialGrid.innerHTML = '';
  const now = new Date();
  const year = (socialSelectedYear !== null) ? socialSelectedYear : now.getFullYear();
  const month = (socialSelectedMonth !== null) ? socialSelectedMonth : now.getMonth();
  const dates = getMonthDates(year, month);
  dates.forEach((date) => {
    const key = getDateKey(date);
    const card = document.createElement('div');
    card.className = 'social-card';

    const header = document.createElement('div');
    header.className = 'day-card-header';
    const title = document.createElement('strong');
    title.textContent = date.getDate();
    const label = document.createElement('span');
    label.textContent = date.toLocaleDateString('pt-BR', { weekday: 'short' });
    header.appendChild(title);
    header.appendChild(label);
    card.appendChild(header);

    const list = document.createElement('ul');
    list.className = 'month-day-list';
    const dayTasks = socialTasks[key] || [];
    dayTasks.forEach((task, taskIndex) => {
      const item = document.createElement('li');
      item.className = 'week-task';
      const labelEl = document.createElement('label');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.done;
      checkbox.addEventListener('change', () => toggleSocialDone(key, taskIndex));
      const titleEl = document.createElement('span');
      titleEl.textContent = task.text;
      if (task.done) titleEl.classList.add('completed');
      labelEl.appendChild(checkbox);
      labelEl.appendChild(titleEl);

      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.textContent = '✕';
      removeButton.title = 'Remover publicação';
      removeButton.addEventListener('click', () => removeSocialTask(key, taskIndex));

      const expandBtn = document.createElement('button');
      expandBtn.type = 'button';
      expandBtn.textContent = 'Notas';
      expandBtn.className = 'expand-notes-btn';
      expandBtn.addEventListener('click', () => {
        // open modal for this task
        openNotesModal(key, taskIndex);
      });

      item.appendChild(labelEl);
      item.appendChild(expandBtn);
      item.appendChild(removeButton);
      list.appendChild(item);
    });
    card.appendChild(list);

    const form = document.createElement('form');
    form.className = 'day-form';
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Adicionar postagem';
    const button = document.createElement('button');
    button.type = 'submit';
    button.textContent = 'Adicionar';
    form.appendChild(input);
    form.appendChild(button);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      addSocialTask(key, input.value);
      input.value = '';
    });
    card.appendChild(form);

    socialGrid.appendChild(card);
  });
}

  function openNotesModal(key, index) {
    notesModalState.key = key;
    notesModalState.index = index;
    const task = (socialTasks[key] && socialTasks[key][index]) ? socialTasks[key][index] : null;
    notesText.value = task && task.notes ? task.notes : '';
    notesModal.setAttribute('aria-hidden', 'false');
    notesModal.classList.add('open');
    notesText.focus();
  }

  function closeNotesModal() {
    notesModalState = { key: null, index: null };
    notesModal.setAttribute('aria-hidden', 'true');
    notesModal.classList.remove('open');
  }

  notesSave && notesSave.addEventListener('click', () => {
    const { key, index } = notesModalState;
    if (!key || index === null || index === undefined) return;
    if (!socialTasks[key]) socialTasks[key] = [];
    socialTasks[key][index].notes = notesText.value;
    saveState();
    closeNotesModal();
  });
  notesClose && notesClose.addEventListener('click', closeNotesModal);
  notesCancel && notesCancel.addEventListener('click', closeNotesModal);
  notesBackdrop && notesBackdrop.addEventListener('click', closeNotesModal);

  authForm && authForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const username = authUsername.value.trim();
    const password = authPassword.value.trim();
    if (!username || !password) {
      alert('Por favor, informe seu nome e senha.');
      return;
    }
    if (validateAuth(username, password)) {
      setAuthenticated(true);
      saveAuthState();
      showApp();
      loadState();
      initWeeklyTasks();
      populateMonthYearControls();
      renderTasks();
      renderPending();
      renderWeeklyPlanner();
      renderMonthlyPlanner();
      renderSocialCalendar();
    } else {
      alert('Usuário ou senha incorretos.');
      authPassword.value = '';
      authPassword.focus();
    }
  });

  logoutBtn && logoutBtn.addEventListener('click', () => {
    logout();
  });

tabButtons.forEach((button) => {
  button.addEventListener('click', () => {
    tabButtons.forEach((btn) => btn.classList.remove('active'));
    views.forEach((view) => view.classList.remove('active'));
    button.classList.add('active');
    document.getElementById(button.getAttribute('data-target')).classList.add('active');
  });
});

// month/year controls listeners
if (monthlyGo) {
  monthlyGo.addEventListener('click', () => {
    selectedMonth = Number(monthlyMonth.value);
    selectedYear = Number(monthlyYear.value);
    saveViewSelection('monthlyView', selectedMonth, selectedYear);
    renderMonthlyPlanner();
  });
}
if (socialGo) {
  socialGo.addEventListener('click', () => {
    socialSelectedMonth = Number(socialMonth.value);
    socialSelectedYear = Number(socialYear.value);
    saveViewSelection('socialView', socialSelectedMonth, socialSelectedYear);
    renderSocialCalendar();
  });
}

window.addEventListener('load', () => {
  initializeAuth();
  if (isAuthenticated()) {
    showApp();
    loadState();
    initWeeklyTasks();
    populateMonthYearControls();
    renderTasks();
    renderPending();
    renderWeeklyPlanner();
    renderMonthlyPlanner();
    renderSocialCalendar();
  } else {
    showAuth();
  }
});
