/**
 * Simple To-Do List Application
 * Features:
 * - Floating Action Button (FAB) at bottom right corner with '+' to create tasks
 * - Single Butter Yellow Card for each date group, holding multiple tasks
 * - Interactive checklist checkboxes with mint green completion & strikethrough
 * - Status handling: Unfinished, Paused, Completed
 * - Calendar button with interactive Date Filter modal & specific date picker
 * - Burger menu (Side Drawer) in top right corner with date views & quick actions
 * - Real-time search and status filtering
 * - Edit task text, date, and status
 * - Delete tasks with confirmation
 * - LocalStorage persistence
 * - Mobile-responsive & accessible with Open Sans typography
 */

(function () {
  'use strict';

  // Storage key
  const STORAGE_KEY = 'todo_app_tasks';

  // App State
  let tasks = [];
  let statusFilter = 'all';     // 'all' | 'unfinished' | 'paused' | 'completed'
  let dateFilter = 'all';       // 'all' | 'today' | 'tomorrow' | 'upcoming' | 'overdue' | 'no-date' | specific 'YYYY-MM-DD'
  let searchQuery = '';
  let pendingAction = null;     // { type: 'delete' | 'clear-completed' | 'clear-all', id?: string }

  // DOM Elements - Main Layout
  const dateGroupsContainer = document.getElementById('date-groups-container');
  const emptyState = document.getElementById('empty-state');
  const emptyTitle = document.getElementById('empty-title');
  const emptySubtitle = document.getElementById('empty-subtitle');
  const emptyCreateBtn = document.getElementById('empty-create-btn');

  // Stats Elements
  const totalBadge = document.getElementById('total-badge');
  const countUnfinished = document.getElementById('count-unfinished');
  const countPaused = document.getElementById('count-paused');
  const countCompleted = document.getElementById('count-completed');

  // Search & Active Filter Elements
  const searchInput = document.getElementById('search-input');
  const clearSearchBtn = document.getElementById('clear-search-btn');
  const filterPillBtns = document.querySelectorAll('.pill-btn');
  const activeDateBanner = document.getElementById('active-date-banner');
  const activeDateText = document.getElementById('active-date-text');
  const clearDateFilterBtn = document.getElementById('clear-date-filter-btn');

  // Search Modal Elements
  const searchModal = document.getElementById('search-modal');
  const searchModalClose = document.getElementById('search-modal-close');
  const searchResetBtn = document.getElementById('search-reset-btn');
  const searchDoneBtn = document.getElementById('search-done-btn');

  // Bottom Navigation Bar Elements
  const navHomeBtn = document.getElementById('nav-home-btn');
  const navCalendarBtn = document.getElementById('nav-calendar-btn');
  const navCreateBtn = document.getElementById('nav-create-btn');
  const navSearchBtn = document.getElementById('nav-search-btn');
  const navMenuBtn = document.getElementById('nav-menu-btn');

  // Create Modal Elements
  const createModal = document.getElementById('create-modal');
  const createModalClose = document.getElementById('create-modal-close');
  const createTaskForm = document.getElementById('create-task-form');
  const createTaskText = document.getElementById('create-task-text');
  const createTaskDate = document.getElementById('create-task-date');
  const createTaskStatus = document.getElementById('create-task-status');
  const createCancelBtn = document.getElementById('create-cancel-btn');

  // Burger Menu & Side Drawer Elements
  const burgerBtn = document.getElementById('burger-btn');
  const sideDrawer = document.getElementById('side-drawer');
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  const drawerCloseBtn = document.getElementById('drawer-close-btn');
  const drawerMenuItems = document.querySelectorAll('.drawer-menu-item[data-date-filter]');
  const drawerClearCompleted = document.getElementById('drawer-clear-completed');
  const drawerClearAll = document.getElementById('drawer-clear-all');

  // Calendar Modal Elements
  const calendarBtn = document.getElementById('calendar-btn');
  const calendarModal = document.getElementById('calendar-modal');
  const calendarModalClose = document.getElementById('calendar-modal-close');
  const datePresetBtns = document.querySelectorAll('.date-preset-btn');
  const calendarPickerInput = document.getElementById('calendar-picker-input');
  const applySpecificDateBtn = document.getElementById('apply-specific-date-btn');

  // Edit Modal Elements
  const editModal = document.getElementById('edit-modal');
  const editModalClose = document.getElementById('edit-modal-close');
  const editTaskForm = document.getElementById('edit-task-form');
  const editTaskId = document.getElementById('edit-task-id');
  const editTaskText = document.getElementById('edit-task-text');
  const editTaskDate = document.getElementById('edit-task-date');
  const editTaskStatus = document.getElementById('edit-task-status');
  const editCancelBtn = document.getElementById('edit-cancel-btn');

  // Confirm Modal Elements
  const confirmModal = document.getElementById('confirm-modal');
  const confirmModalTitle = document.getElementById('confirm-modal-title');
  const confirmModalMessage = document.getElementById('confirm-modal-message');
  const confirmActionBtn = document.getElementById('confirm-action-btn');
  const confirmCancelBtn = document.getElementById('confirm-cancel-btn');

  /* ==========================================================================
     Date Utilities
     ========================================================================== */

  function toLocalYYYYMMDD(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function getTodayStr() {
    return toLocalYYYYMMDD(new Date());
  }

  function getTomorrowStr() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return toLocalYYYYMMDD(d);
  }

  function formatHumanDate(dateStr) {
    if (!dateStr) return 'No Date';
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  function formatShortDate(dateStr) {
    if (!dateStr) return 'No Date';
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }

  /* ==========================================================================
     Storage & Data Handling
     ========================================================================== */

  function loadTasks() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      tasks = data ? JSON.parse(data) : [];
      if (!Array.isArray(tasks)) {
        tasks = [];
      }
      // Migration: ensure every task has a valid dueDate
      tasks.forEach((task) => {
        if (!task.dueDate) {
          task.dueDate = task.createdAt ? task.createdAt.substring(0, 10) : getTodayStr();
        }
      });
    } catch (err) {
      console.error('Failed to parse tasks from localStorage:', err);
      tasks = [];
    }
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (err) {
      console.error('Failed to save tasks to localStorage:', err);
    }
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* ==========================================================================
     Stats & Filtering
     ========================================================================== */

  function updateStats() {
    const total = tasks.length;
    let unfinished = 0;
    let paused = 0;
    let completed = 0;

    tasks.forEach((task) => {
      if (task.status === 'completed') completed++;
      else if (task.status === 'paused') paused++;
      else unfinished++;
    });

    if (totalBadge) totalBadge.textContent = `Total Tasks: ${total}`;
    if (countUnfinished) countUnfinished.textContent = unfinished;
    if (countPaused) countPaused.textContent = paused;
    if (countCompleted) countCompleted.textContent = completed;
  }

  function matchesDateFilter(task) {
    if (dateFilter === 'all') return true;

    const todayStr = getTodayStr();
    const tomorrowStr = getTomorrowStr();

    if (dateFilter === 'today') {
      return task.dueDate === todayStr;
    }
    if (dateFilter === 'tomorrow') {
      return task.dueDate === tomorrowStr;
    }
    if (dateFilter === 'upcoming') {
      return Boolean(task.dueDate && task.dueDate > todayStr);
    }
    if (dateFilter === 'overdue') {
      return Boolean(task.dueDate && task.dueDate < todayStr && task.status !== 'completed');
    }
    if (dateFilter === 'no-date') {
      return !task.dueDate;
    }

    return task.dueDate === dateFilter;
  }

  function updateDateBanner() {
    const hasDateFilter = dateFilter !== 'all';
    const hasSearch = searchQuery.trim().length > 0;

    if (!hasDateFilter && !hasSearch) {
      activeDateBanner.setAttribute('hidden', '');
    } else {
      activeDateBanner.removeAttribute('hidden');
      const todayStr = getTodayStr();
      const tomorrowStr = getTomorrowStr();

      const parts = [];
      if (hasDateFilter) {
        if (dateFilter === 'today') parts.push(`Date: Today (${formatShortDate(todayStr)})`);
        else if (dateFilter === 'tomorrow') parts.push(`Date: Tomorrow (${formatShortDate(tomorrowStr)})`);
        else if (dateFilter === 'upcoming') parts.push('Date: Upcoming');
        else if (dateFilter === 'overdue') parts.push('Date: ⚠️ Overdue');
        else if (dateFilter === 'no-date') parts.push('Date: Without Date');
        else parts.push(`Date: ${formatHumanDate(dateFilter)}`);
      }
      if (hasSearch) {
        parts.push(`Search: "${searchQuery.trim()}"`);
      }

      activeDateText.textContent = parts.join(' • ');
    }

    drawerMenuItems.forEach((item) => {
      const itemFilter = item.dataset.dateFilter;
      if (itemFilter === dateFilter) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  /* ==========================================================================
     Dividing Tasks into ONE Single Butter Yellow Card per Group
     ========================================================================== */

  function renderTasks() {
    updateStats();
    updateDateBanner();

    const todayStr = getTodayStr();
    const tomorrowStr = getTomorrowStr();
    const query = searchQuery.trim().toLowerCase();

    // 1. Filter tasks
    const filteredTasks = tasks.filter((task) => {
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesDate = matchesDateFilter(task);
      const matchesSearch =
        !query ||
        task.text.toLowerCase().includes(query) ||
        task.status.toLowerCase().includes(query) ||
        (task.dueDate && task.dueDate.includes(query)) ||
        (task.dueDate && formatHumanDate(task.dueDate).toLowerCase().includes(query));

      return matchesStatus && matchesDate && matchesSearch;
    });

    // 2. Empty State
    if (filteredTasks.length === 0) {
      dateGroupsContainer.innerHTML = '';
      emptyState.classList.add('visible');

      if (tasks.length === 0) {
        emptyTitle.textContent = 'No tasks yet!';
        emptySubtitle.textContent = 'Tap the + button at the bottom right to create your first task ✨';
      } else {
        emptyTitle.textContent = 'No matching tasks found';
        emptySubtitle.textContent = 'Try adjusting your search query, status, or date filter.';
      }
      return;
    }

    emptyState.classList.remove('visible');

    // 3. Partition tasks into date buckets
    const overdueTasks = [];
    const todayTasks = [];
    const tomorrowTasks = [];
    const dateBuckets = {};
    const noDateTasks = [];

    filteredTasks.forEach((task) => {
      if (!task.dueDate) {
        noDateTasks.push(task);
        return;
      }

      if (task.dueDate < todayStr && task.status !== 'completed') {
        overdueTasks.push(task);
      } else if (task.dueDate === todayStr) {
        todayTasks.push(task);
      } else if (task.dueDate === tomorrowStr) {
        tomorrowTasks.push(task);
      } else {
        if (!dateBuckets[task.dueDate]) {
          dateBuckets[task.dueDate] = [];
        }
        dateBuckets[task.dueDate].push(task);
      }
    });

    const sortedDates = Object.keys(dateBuckets).sort();
    const groups = [];

    if (overdueTasks.length > 0) {
      groups.push({
        id: 'group-overdue',
        title: 'Overdue',
        sub: 'Needs Attention',
        icon: '⚠️',
        isOverdue: true,
        tasks: overdueTasks,
      });
    }

    if (todayTasks.length > 0) {
      groups.push({
        id: 'group-today',
        title: 'Today',
        sub: formatHumanDate(todayStr),
        icon: '☀️',
        tasks: todayTasks,
      });
    }

    if (tomorrowTasks.length > 0) {
      groups.push({
        id: 'group-tomorrow',
        title: 'Tomorrow',
        sub: formatHumanDate(tomorrowStr),
        icon: '🌅',
        tasks: tomorrowTasks,
      });
    }

    sortedDates.forEach((dateStr) => {
      const isPast = dateStr < todayStr;
      groups.push({
        id: `group-${dateStr}`,
        title: formatHumanDate(dateStr),
        sub: isPast ? 'Earlier' : 'Upcoming',
        icon: '📆',
        tasks: dateBuckets[dateStr],
      });
    });

    if (noDateTasks.length > 0) {
      groups.push({
        id: 'group-no-date',
        title: 'Without Date',
        sub: 'General Tasks',
        icon: '📝',
        tasks: noDateTasks,
      });
    }

    // 4. Render HTML: Each group is ONE SINGLE butter yellow card containing multiple tasks
    dateGroupsContainer.innerHTML = groups
      .map((group) => {
        const completedCount = group.tasks.filter((t) => t.status === 'completed').length;
        const totalCount = group.tasks.length;
        const countLabel = `${completedCount} of ${totalCount} Tasks`;
        const overdueClass = group.isOverdue ? 'date-group-overdue' : '';

        return `
          <section class="date-group-card ${overdueClass}" id="${group.id}">
            <div class="date-group-header">
              <div class="date-group-title-row">
                <span class="date-group-icon" aria-hidden="true">${group.icon}</span>
                <div class="date-group-titles">
                  <h2 class="date-group-title">${escapeHTML(group.title)}</h2>
                  <span class="date-group-sub">${escapeHTML(group.sub)}</span>
                </div>
              </div>
              <span class="date-group-badge">${escapeHTML(countLabel)}</span>
            </div>
            <ul class="task-list">
              ${group.tasks.map((task) => renderTaskRow(task, todayStr)).join('')}
            </ul>
          </section>
        `;
      })
      .join('');
  }

  /**
   * Render individual task row inside the single card
   */
  function renderTaskRow(task, todayStr) {
    const isCompleted = task.status === 'completed';
    const badgeClass =
      task.status === 'completed'
        ? 'badge-completed'
        : task.status === 'paused'
        ? 'badge-paused'
        : 'badge-unfinished';

    const isOverdue = Boolean(task.dueDate && task.dueDate < todayStr && !isCompleted);

    let dateBadgeHTML = '';
    if (task.dueDate && isOverdue) {
      dateBadgeHTML = `<span class="date-pill date-pill-overdue" title="Due date: ${task.dueDate}">⚠️ Overdue</span>`;
    }

    return `
      <li class="task-row ${isCompleted ? 'is-completed' : ''}" data-id="${escapeHTML(task.id)}">
        <div class="task-row-left">
          <button type="button" class="task-checkbox-btn ${isCompleted ? 'checked' : ''}" data-id="${escapeHTML(task.id)}" title="${isCompleted ? 'Mark as unfinished' : 'Mark as completed'}" aria-label="Toggle task completion">
            <svg class="checkbox-check-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 8.5 6.5 12 13 4.5"></polyline>
            </svg>
          </button>
          <span class="task-text">${escapeHTML(task.text)}</span>
        </div>
        <div class="task-row-right">
          ${dateBadgeHTML}
          <span class="status-badge ${badgeClass}">${escapeHTML(task.status)}</span>
          <select class="status-quick-select" aria-label="Change task status" data-id="${escapeHTML(task.id)}">
            <option value="unfinished" ${task.status === 'unfinished' ? 'selected' : ''}>Unfinished</option>
            <option value="paused" ${task.status === 'paused' ? 'selected' : ''}>Paused</option>
            <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Completed</option>
          </select>
          <div class="task-actions">
            <button type="button" class="btn-action action-edit" data-id="${escapeHTML(task.id)}" title="Edit task" aria-label="Edit task">
              ✏️
            </button>
            <button type="button" class="btn-action action-delete" data-id="${escapeHTML(task.id)}" title="Delete task" aria-label="Delete task">
              🗑️
            </button>
          </div>
        </div>
      </li>
    `;
  }

  /* ==========================================================================
     Create Task Modal & FAB Handlers
     ========================================================================== */

  function openCreateModal() {
    createTaskText.value = '';
    createTaskDate.value = getTodayStr();
    createTaskStatus.value = 'unfinished';
    createModal.removeAttribute('hidden');
    setTimeout(() => {
      createTaskText.focus();
    }, 50);
  }

  function closeCreateModal() {
    createModal.setAttribute('hidden', '');
    createTaskForm.reset();
  }

  function handleCreateTask(e) {
    e.preventDefault();
    const text = createTaskText.value.trim();
    const dueDate = createTaskDate.value;
    const status = createTaskStatus.value;

    if (!text) {
      createTaskText.focus();
      return;
    }

    const newTask = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
      text,
      dueDate: dueDate || getTodayStr(),
      status: ['unfinished', 'paused', 'completed'].includes(status) ? status : 'unfinished',
      createdAt: new Date().toISOString(),
    };

    tasks.unshift(newTask);
    saveTasks();
    closeCreateModal();
    renderTasks();
  }

  /* ==========================================================================
     Quick Status, Edit, and Delete Handlers
     ========================================================================== */

  function handleQuickStatusChange(taskId, newStatus) {
    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status !== newStatus) {
      task.status = newStatus;
      saveTasks();
      renderTasks();
    }
  }

  function openEditModal(taskId) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    editTaskId.value = task.id;
    editTaskText.value = task.text;
    editTaskDate.value = task.dueDate || '';
    editTaskStatus.value = task.status;

    editModal.removeAttribute('hidden');
    setTimeout(() => editTaskText.focus(), 50);
  }

  function closeEditModal() {
    editModal.setAttribute('hidden', '');
    editTaskForm.reset();
  }

  function handleSaveEdit(e) {
    e.preventDefault();
    const id = editTaskId.value;
    const text = editTaskText.value.trim();
    const dueDate = editTaskDate.value;
    const status = editTaskStatus.value;

    if (!text) {
      editTaskText.focus();
      return;
    }

    const taskIndex = tasks.findIndex((t) => t.id === id);
    if (taskIndex !== -1) {
      tasks[taskIndex].text = text;
      tasks[taskIndex].dueDate = dueDate;
      tasks[taskIndex].status = status;
      saveTasks();
      renderTasks();
    }

    closeEditModal();
  }

  function openConfirmModal(type, taskId = null) {
    pendingAction = { type, id: taskId };

    if (type === 'delete') {
      confirmModalTitle.textContent = 'Delete Task?';
      confirmModalMessage.textContent = 'Are you sure you want to delete this task? This action cannot be undone.';
      confirmActionBtn.textContent = 'Delete';
      confirmActionBtn.className = 'btn btn-danger';
    } else if (type === 'clear-completed') {
      confirmModalTitle.textContent = 'Clear Completed Tasks?';
      confirmModalMessage.textContent = 'Are you sure you want to delete all completed tasks from the list?';
      confirmActionBtn.textContent = 'Clear Completed';
      confirmActionBtn.className = 'btn btn-danger';
    } else if (type === 'clear-all') {
      confirmModalTitle.textContent = 'Clear All Tasks?';
      confirmModalMessage.textContent = 'Are you sure you want to delete ALL tasks from your list? This cannot be undone.';
      confirmActionBtn.textContent = 'Delete Everything';
      confirmActionBtn.className = 'btn btn-danger';
    }

    confirmModal.removeAttribute('hidden');
    confirmActionBtn.focus();
  }

  function closeConfirmModal() {
    pendingAction = null;
    confirmModal.setAttribute('hidden', '');
  }

  function handleExecuteConfirmAction() {
    if (!pendingAction) return;

    if (pendingAction.type === 'delete' && pendingAction.id) {
      tasks = tasks.filter((t) => t.id !== pendingAction.id);
    } else if (pendingAction.type === 'clear-completed') {
      tasks = tasks.filter((t) => t.status !== 'completed');
    } else if (pendingAction.type === 'clear-all') {
      tasks = [];
    }

    saveTasks();
    renderTasks();
    closeConfirmModal();
  }

  /* ==========================================================================
     Side Drawer Controls
     ========================================================================== */

  function openDrawer() {
    sideDrawer.removeAttribute('hidden');
    drawerBackdrop.removeAttribute('hidden');
    burgerBtn.setAttribute('aria-expanded', 'true');
    drawerCloseBtn.focus();
  }

  function closeDrawer() {
    sideDrawer.setAttribute('hidden', '');
    drawerBackdrop.setAttribute('hidden', '');
    burgerBtn.setAttribute('aria-expanded', 'false');
  }

  /* ==========================================================================
     Calendar Modal & Filtering
     ========================================================================== */

  function openCalendarModal() {
    calendarModal.removeAttribute('hidden');
    calendarPickerInput.value = dateFilter.length === 10 ? dateFilter : getTodayStr();
  }

  function closeCalendarModal() {
    calendarModal.setAttribute('hidden', '');
  }

  function applyDateFilter(filterValue) {
    dateFilter = filterValue;
    renderTasks();
  }

  /* ==========================================================================
     Search Modal Controls
     ========================================================================== */

  function openSearchModal() {
    searchModal.removeAttribute('hidden');
    setTimeout(() => {
      searchInput.focus();
    }, 50);
  }

  function closeSearchModal() {
    searchModal.setAttribute('hidden', '');
  }

  /* ==========================================================================
     Event Listeners
     ========================================================================== */

  function initEvents() {
    // 1. Bottom Navigation Bar Actions
    if (navHomeBtn) {
      navHomeBtn.addEventListener('click', () => {
        statusFilter = 'all';
        filterPillBtns.forEach((b) => b.classList.toggle('active', b.dataset.filter === 'all'));
        applyDateFilter('all');
        searchInput.value = '';
        searchQuery = '';
        clearSearchBtn.classList.remove('visible');
        window.scrollTo({ top: 0, behavior: 'smooth' });

        document.querySelectorAll('.bottom-nav .nav-item').forEach((item) => item.classList.remove('active'));
        navHomeBtn.classList.add('active');
        renderTasks();
      });
    }

    if (navCalendarBtn) {
      navCalendarBtn.addEventListener('click', openCalendarModal);
    }

    if (navCreateBtn) {
      navCreateBtn.addEventListener('click', openCreateModal);
    }

    if (navSearchBtn) {
      navSearchBtn.addEventListener('click', openSearchModal);
    }

    if (searchModalClose) {
      searchModalClose.addEventListener('click', closeSearchModal);
    }

    if (searchDoneBtn) {
      searchDoneBtn.addEventListener('click', closeSearchModal);
    }

    if (searchResetBtn) {
      searchResetBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchQuery = '';
        clearSearchBtn.classList.remove('visible');
        renderTasks();
        searchInput.focus();
      });
    }

    if (navMenuBtn) {
      navMenuBtn.addEventListener('click', openDrawer);
    }

    // Create Modal form submission & cancellation
    createTaskForm.addEventListener('submit', handleCreateTask);
    createModalClose.addEventListener('click', closeCreateModal);
    createCancelBtn.addEventListener('click', closeCreateModal);

    // Empty state create button
    if (emptyCreateBtn) {
      emptyCreateBtn.addEventListener('click', openCreateModal);
    }

    // 2. Task List delegation (Checkbox, Edit, Delete, Status select)
    dateGroupsContainer.addEventListener('click', (e) => {
      // Toggle completion checkbox
      const checkboxBtn = e.target.closest('.task-checkbox-btn');
      if (checkboxBtn) {
        const id = checkboxBtn.dataset.id;
        const task = tasks.find((t) => t.id === id);
        if (task) {
          task.status = task.status === 'completed' ? 'unfinished' : 'completed';
          saveTasks();
          renderTasks();
        }
        return;
      }

      // Edit button
      const editBtn = e.target.closest('.action-edit');
      if (editBtn) {
        openEditModal(editBtn.dataset.id);
        return;
      }

      // Delete button
      const deleteBtn = e.target.closest('.action-delete');
      if (deleteBtn) {
        openConfirmModal('delete', deleteBtn.dataset.id);
      }
    });

    dateGroupsContainer.addEventListener('change', (e) => {
      if (e.target.classList.contains('status-quick-select')) {
        handleQuickStatusChange(e.target.dataset.id, e.target.value);
      }
    });

    // 3. Search Bar
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      if (searchQuery.trim().length > 0) {
        clearSearchBtn.classList.add('visible');
      } else {
        clearSearchBtn.classList.remove('visible');
      }
      renderTasks();
    });

    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      clearSearchBtn.classList.remove('visible');
      searchInput.focus();
      renderTasks();
    });

    // 4. Status Filter Pills
    filterPillBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterPillBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        statusFilter = btn.dataset.filter;
        renderTasks();
      });
    });

    // 5. Active Date Filter Reset Button
    clearDateFilterBtn.addEventListener('click', () => {
      applyDateFilter('all');
      searchQuery = '';
      searchInput.value = '';
      clearSearchBtn.classList.remove('visible');
      renderTasks();
    });

    // 6. Burger Menu Button & Drawer
    if (burgerBtn) {
      burgerBtn.addEventListener('click', openDrawer);
    }
    drawerCloseBtn.addEventListener('click', closeDrawer);
    drawerBackdrop.addEventListener('click', closeDrawer);

    drawerMenuItems.forEach((item) => {
      item.addEventListener('click', () => {
        applyDateFilter(item.dataset.dateFilter);
        closeDrawer();
      });
    });

    drawerClearCompleted.addEventListener('click', () => {
      closeDrawer();
      openConfirmModal('clear-completed');
    });

    drawerClearAll.addEventListener('click', () => {
      closeDrawer();
      openConfirmModal('clear-all');
    });

    // 7. Calendar Button & Modal
    if (calendarBtn) {
      calendarBtn.addEventListener('click', openCalendarModal);
    }
    calendarModalClose.addEventListener('click', closeCalendarModal);

    datePresetBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        applyDateFilter(btn.dataset.preset);
        closeCalendarModal();
      });
    });

    applySpecificDateBtn.addEventListener('click', () => {
      const selectedDate = calendarPickerInput.value;
      if (selectedDate) {
        applyDateFilter(selectedDate);
      }
      closeCalendarModal();
    });

    // 8. Edit Modal Form & Controls
    editTaskForm.addEventListener('submit', handleSaveEdit);
    editModalClose.addEventListener('click', closeEditModal);
    editCancelBtn.addEventListener('click', closeEditModal);

    // 9. Confirm Modal Actions
    confirmActionBtn.addEventListener('click', handleExecuteConfirmAction);
    confirmCancelBtn.addEventListener('click', closeConfirmModal);

    // 10. Modals Backdrop Clicks
    createModal.addEventListener('click', (e) => {
      if (e.target === createModal) closeCreateModal();
    });

    if (searchModal) {
      searchModal.addEventListener('click', (e) => {
        if (e.target === searchModal) closeSearchModal();
      });
    }

    editModal.addEventListener('click', (e) => {
      if (e.target === editModal) closeEditModal();
    });

    confirmModal.addEventListener('click', (e) => {
      if (e.target === confirmModal) closeConfirmModal();
    });

    calendarModal.addEventListener('click', (e) => {
      if (e.target === calendarModal) closeCalendarModal();
    });

    // 11. Escape key navigation
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (searchModal && !searchModal.hasAttribute('hidden')) closeSearchModal();
        if (!createModal.hasAttribute('hidden')) closeCreateModal();
        if (!sideDrawer.hasAttribute('hidden')) closeDrawer();
        if (!calendarModal.hasAttribute('hidden')) closeCalendarModal();
        if (!editModal.hasAttribute('hidden')) closeEditModal();
        if (!confirmModal.hasAttribute('hidden')) closeConfirmModal();
      }
    });
  }

  /* ==========================================================================
     Initialize Application
     ========================================================================== */
  loadTasks();
  initEvents();
  renderTasks();
})();
