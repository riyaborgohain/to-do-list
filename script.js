/**
 * Simple To-Do List Application
 * Features:
 * - Add tasks with status: Unfinished, Paused, Completed
 * - Edit task text and status
 * - Delete tasks with confirmation
 * - Real-time search and status filtering
 * - Total and status-based task counts
 * - LocalStorage persistence
 * - Friendly empty states
 */

(function () {
  'use strict';

  // Storage key
  const STORAGE_KEY = 'todo_app_tasks';

  // State
  let tasks = [];
  let currentFilter = 'all';
  let searchQuery = '';
  let pendingDeleteId = null;

  // DOM Elements
  const addTaskForm = document.getElementById('add-task-form');
  const taskInput = document.getElementById('task-input');
  const taskStatusInput = document.getElementById('task-status-input');
  const taskList = document.getElementById('task-list');
  const emptyState = document.getElementById('empty-state');
  const emptyTitle = document.getElementById('empty-title');
  const emptySubtitle = document.getElementById('empty-subtitle');

  // Stats Elements
  const totalBadge = document.getElementById('total-badge');
  const countUnfinished = document.getElementById('count-unfinished');
  const countPaused = document.getElementById('count-paused');
  const countCompleted = document.getElementById('count-completed');

  // Search & Filter Elements
  const searchInput = document.getElementById('search-input');
  const clearSearchBtn = document.getElementById('clear-search-btn');
  const filterPillBtns = document.querySelectorAll('.pill-btn');

  // Edit Modal Elements
  const editModal = document.getElementById('edit-modal');
  const editModalClose = document.getElementById('edit-modal-close');
  const editTaskForm = document.getElementById('edit-task-form');
  const editTaskId = document.getElementById('edit-task-id');
  const editTaskText = document.getElementById('edit-task-text');
  const editTaskStatus = document.getElementById('edit-task-status');
  const editCancelBtn = document.getElementById('edit-cancel-btn');

  // Confirm Modal Elements
  const confirmModal = document.getElementById('confirm-modal');
  const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
  const confirmCancelBtn = document.getElementById('confirm-cancel-btn');

  /**
   * Load tasks from localStorage
   */
  function loadTasks() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      tasks = data ? JSON.parse(data) : [];
      if (!Array.isArray(tasks)) {
        tasks = [];
      }
    } catch (err) {
      console.error('Failed to parse tasks from localStorage:', err);
      tasks = [];
    }
  }

  /**
   * Save tasks to localStorage
   */
  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (err) {
      console.error('Failed to save tasks to localStorage:', err);
    }
  }

  /**
   * Escape HTML to prevent XSS
   */
  function escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Update stats counters
   */
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

    totalBadge.textContent = `Total Tasks: ${total}`;
    countUnfinished.textContent = unfinished;
    countPaused.textContent = paused;
    countCompleted.textContent = completed;
  }

  /**
   * Render tasks list based on current filter & search query
   */
  function renderTasks() {
    updateStats();

    // Filter tasks
    const query = searchQuery.trim().toLowerCase();
    const filteredTasks = tasks.filter((task) => {
      const matchesFilter = currentFilter === 'all' || task.status === currentFilter;
      const matchesSearch =
        !query ||
        task.text.toLowerCase().includes(query) ||
        task.status.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });

    // Check empty state
    if (filteredTasks.length === 0) {
      taskList.innerHTML = '';
      emptyState.classList.add('visible');

      if (tasks.length === 0) {
        emptyTitle.textContent = 'No tasks yet!';
        emptySubtitle.textContent = 'Add your first task above to start organizing your day ✨';
      } else {
        emptyTitle.textContent = 'No matching tasks found';
        emptySubtitle.textContent = 'Try adjusting your search query or status filter.';
      }
      return;
    }

    emptyState.classList.remove('visible');

    // Build task items HTML
    taskList.innerHTML = filteredTasks
      .map((task) => {
        const isCompleted = task.status === 'completed';
        const badgeClass =
          task.status === 'completed'
            ? 'badge-completed'
            : task.status === 'paused'
            ? 'badge-paused'
            : 'badge-unfinished';

        return `
          <li class="task-item ${isCompleted ? 'is-completed' : ''}" data-id="${escapeHTML(task.id)}">
            <div class="task-main-row">
              <span class="task-text">${escapeHTML(task.text)}</span>
              <span class="status-badge ${badgeClass}">${escapeHTML(task.status)}</span>
            </div>
            <div class="task-footer">
              <label style="display:flex; align-items:center; gap:6px; font-size:0.8rem; color:var(--text-muted);">
                <span>Status:</span>
                <select class="status-quick-select" aria-label="Change task status" data-id="${escapeHTML(task.id)}">
                  <option value="unfinished" ${task.status === 'unfinished' ? 'selected' : ''}>Unfinished</option>
                  <option value="paused" ${task.status === 'paused' ? 'selected' : ''}>Paused</option>
                  <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Completed</option>
                </select>
              </label>
              <div class="task-actions">
                <button type="button" class="btn-action action-edit" data-id="${escapeHTML(task.id)}" title="Edit task">
                  ✏️ Edit
                </button>
                <button type="button" class="btn-action action-delete" data-id="${escapeHTML(task.id)}" title="Delete task">
                  🗑️ Delete
                </button>
              </div>
            </div>
          </li>
        `;
      })
      .join('');
  }

  /**
   * Add a new task
   */
  function handleAddTask(e) {
    e.preventDefault();
    const text = taskInput.value.trim();
    const status = taskStatusInput.value;

    if (!text) {
      taskInput.focus();
      return;
    }

    const newTask = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
      text,
      status: ['unfinished', 'paused', 'completed'].includes(status) ? status : 'unfinished',
      createdAt: new Date().toISOString(),
    };

    tasks.unshift(newTask);
    saveTasks();

    // Reset input
    taskInput.value = '';
    taskStatusInput.value = 'unfinished';
    taskInput.focus();

    renderTasks();
  }

  /**
   * Open Edit Modal
   */
  function openEditModal(taskId) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    editTaskId.value = task.id;
    editTaskText.value = task.text;
    editTaskStatus.value = task.status;

    editModal.removeAttribute('hidden');
    editTaskText.focus();
  }

  /**
   * Close Edit Modal
   */
  function closeEditModal() {
    editModal.setAttribute('hidden', '');
    editTaskForm.reset();
  }

  /**
   * Save Edited Task
   */
  function handleSaveEdit(e) {
    e.preventDefault();
    const id = editTaskId.value;
    const text = editTaskText.value.trim();
    const status = editTaskStatus.value;

    if (!text) {
      editTaskText.focus();
      return;
    }

    const taskIndex = tasks.findIndex((t) => t.id === id);
    if (taskIndex !== -1) {
      tasks[taskIndex].text = text;
      tasks[taskIndex].status = status;
      saveTasks();
      renderTasks();
    }

    closeEditModal();
  }

  /**
   * Open Confirm Delete Modal
   */
  function openConfirmModal(taskId) {
    pendingDeleteId = taskId;
    confirmModal.removeAttribute('hidden');
    confirmDeleteBtn.focus();
  }

  /**
   * Close Confirm Delete Modal
   */
  function closeConfirmModal() {
    pendingDeleteId = null;
    confirmModal.setAttribute('hidden', '');
  }

  /**
   * Execute Delete
   */
  function handleConfirmDelete() {
    if (pendingDeleteId) {
      tasks = tasks.filter((t) => t.id !== pendingDeleteId);
      saveTasks();
      renderTasks();
    }
    closeConfirmModal();
  }

  /**
   * Quick status change from card dropdown
   */
  function handleQuickStatusChange(taskId, newStatus) {
    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status !== newStatus) {
      task.status = newStatus;
      saveTasks();
      renderTasks();
    }
  }

  /**
   * Attach Event Listeners
   */
  function initEvents() {
    // Add task form
    addTaskForm.addEventListener('submit', handleAddTask);

    // Task list delegation (Edit, Delete, Status change)
    taskList.addEventListener('click', (e) => {
      const editBtn = e.target.closest('.action-edit');
      if (editBtn) {
        const id = editBtn.dataset.id;
        openEditModal(id);
        return;
      }

      const deleteBtn = e.target.closest('.action-delete');
      if (deleteBtn) {
        const id = deleteBtn.dataset.id;
        openConfirmModal(id);
      }
    });

    taskList.addEventListener('change', (e) => {
      if (e.target.classList.contains('status-quick-select')) {
        const id = e.target.dataset.id;
        const newStatus = e.target.value;
        handleQuickStatusChange(id, newStatus);
      }
    });

    // Search input
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      if (searchQuery.trim().length > 0) {
        clearSearchBtn.classList.add('visible');
      } else {
        clearSearchBtn.classList.remove('visible');
      }
      renderTasks();
    });

    // Clear search button
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      clearSearchBtn.classList.remove('visible');
      searchInput.focus();
      renderTasks();
    });

    // Filter pills
    filterPillBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterPillBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTasks();
      });
    });

    // Edit modal form & buttons
    editTaskForm.addEventListener('submit', handleSaveEdit);
    editModalClose.addEventListener('click', closeEditModal);
    editCancelBtn.addEventListener('click', closeEditModal);

    // Confirm modal buttons
    confirmDeleteBtn.addEventListener('click', handleConfirmDelete);
    confirmCancelBtn.addEventListener('click', closeConfirmModal);

    // Close modals on overlay backdrop click
    editModal.addEventListener('click', (e) => {
      if (e.target === editModal) closeEditModal();
    });

    confirmModal.addEventListener('click', (e) => {
      if (e.target === confirmModal) closeConfirmModal();
    });

    // Close modals on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (!editModal.hasAttribute('hidden')) closeEditModal();
        if (!confirmModal.hasAttribute('hidden')) closeConfirmModal();
      }
    });
  }

  // Initialize
  loadTasks();
  initEvents();
  renderTasks();
})();

