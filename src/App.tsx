import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ChangeEvent, PointerEvent, ReactNode } from 'react';
import {
  AlertTriangle,
  Archive,
  Brain,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Flame,
  Focus,
  Heart,
  LayoutDashboard,
  Layers,
  Menu,
  NotebookPen,
  Palette,
  PanelLeft,
  Plus,
  RotateCcw,
  Sparkles,
  Target,
  TimerReset,
  Trash2,
  TrendingUp,
  Trophy,
  UserRound,
  X,
} from 'lucide-react';

type View = 'dashboard' | 'calendar' | 'goals' | 'journal' | 'ai';
type Theme = 'luminous' | 'night' | 'nature' | 'sunset' | 'custom';
type Modal = null | 'task' | 'goal' | 'template' | 'formWarning' | 'deleteForever' | 'clearArchive';
type Category = 'Study' | 'Fitness' | 'Build' | 'Recovery' | 'Personal';

type Task = {
  id: number;
  title: string;
  goal: string;
  time: string;
  date: string;
  duration: string;
  category: Category;
  notes: string;
  status: 'focus' | 'next' | 'later' | 'missed';
  done: boolean;
};

type Goal = {
  id: number;
  name: string;
  description: string;
  progressLabel: string;
  progress: number;
};

type Template = {
  id: number;
  name: string;
  description: string;
  tasks: string[];
};

type TimelineBlock = {
  id: number;
  time: string;
  label: string;
  kind: string;
};

type CustomTheme = {
  background: string;
  surface: string;
  accent: string;
};

const categories: Category[] = ['Study', 'Fitness', 'Build', 'Recovery', 'Personal'];

const initialTasks: Task[] = [
  { id: 1, title: 'Physics revision block', goal: 'Ace final exams', time: '05:30 PM', date: 'Today', duration: '45m', category: 'Study', notes: 'Focus on weak chapters first.', status: 'focus', done: false },
  { id: 2, title: 'Gym: lower body + walk', goal: 'Lose 20kg', time: '07:00 PM', date: 'Today', duration: '75m', category: 'Fitness', notes: 'Do not punish yourself. Just show up.', status: 'next', done: false },
  { id: 3, title: 'Tracksy design review', goal: 'Build Tracksy', time: '09:15 PM', date: 'Today', duration: '60m', category: 'Build', notes: 'Review dashboard direction and write feedback.', status: 'later', done: false },
  { id: 4, title: 'Sleep reset routine', goal: 'Fix daily rhythm', time: '11:30 PM', date: 'Today', duration: '30m', category: 'Recovery', notes: 'Small reset. No guilt.', status: 'later', done: false },
];

const initialGoals: Goal[] = [
  { id: 1, name: 'Lose 20kg', description: 'Health, confidence, discipline', progressLabel: '7 / 20kg', progress: 35 },
  { id: 2, name: 'Ace final exams', description: 'Study blocks and review rhythm', progressLabel: '18 / 30 sessions', progress: 60 },
  { id: 3, name: 'Build Tracksy', description: 'Turn the idea into a real product', progressLabel: 'Design phase', progress: 44 },
];

const initialTemplates: Template[] = [
  { id: 1, name: 'Deep Study Evening', description: 'A calm study routine with recovery built in.', tasks: ['Prepare desk and notes', '45-minute deep study block', '10-minute recap'] },
  { id: 2, name: 'Gym Day', description: 'Training without forgetting recovery.', tasks: ['Pack gym bag', 'Workout session', 'Protein + walk'] },
  { id: 3, name: 'Reset Night', description: 'A small routine for fixing tomorrow.', tasks: ['Plan tomorrow', 'Clear desk', 'Sleep wind-down'] },
];

const initialTimeline: TimelineBlock[] = [
  { id: 1, time: '17:30', label: 'Study', kind: 'Focus' },
  { id: 2, time: '19:00', label: 'Gym', kind: 'Training' },
  { id: 3, time: '20:30', label: 'Dinner', kind: 'Recovery' },
  { id: 4, time: '21:15', label: 'Tracksy', kind: 'Build' },
];

const initialArchive = ['Old duplicate routine', 'Draft task from last week', 'Abandoned test reminder'];

const themeLabels: Record<Theme, string> = {
  luminous: 'Luminous',
  night: 'Night',
  nature: 'Nature',
  sunset: 'Sunset',
  custom: 'Custom',
};

const navItems = [
  { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'calendar' as View, label: 'Calendar', icon: CalendarDays },
  { id: 'goals' as View, label: 'Goals', icon: Target },
  { id: 'journal' as View, label: 'Journal', icon: NotebookPen },
  { id: 'ai' as View, label: 'AI Coach', icon: Brain },
];

function nextId(items: Array<{ id: number }>) {
  return Math.max(0, ...items.map((item) => item.id)) + 1;
}

function App() {
  const [view, setView] = useState<View>('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState<Theme>('luminous');
  const [glassEnabled, setGlassEnabled] = useState(true);
  const [customTheme, setCustomTheme] = useState<CustomTheme>({ background: '#150f28', surface: '#211936', accent: '#c8bfff' });
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [timeline, setTimeline] = useState<TimelineBlock[]>(initialTimeline);
  const [archiveItems, setArchiveItems] = useState(initialArchive);
  const [selectedTimeline, setSelectedTimeline] = useState(1);
  const [selectedDay, setSelectedDay] = useState(6);
  const [calendarNote, setCalendarNote] = useState('Selected day: June 6');
  const [focusMode, setFocusMode] = useState(false);
  const [modal, setModal] = useState<Modal>(null);
  const [toast, setToast] = useState('');
  const [deleteCountdown, setDeleteCountdown] = useState(10);
  const [clearArchiveCountdown, setClearArchiveCountdown] = useState(10);
  const [taskDraft, setTaskDraft] = useState({ title: '', category: 'Study' as Category, date: 'Today', duration: '45m', notes: '' });
  const [goalDraft, setGoalDraft] = useState({ name: '', description: '', progress: '0' });
  const [templateDraft, setTemplateDraft] = useState({ name: '', description: '' });

  const completeCount = tasks.filter((task) => task.done).length;
  const completion = Math.round((completeCount / Math.max(1, tasks.length)) * 100);
  const activeTask = tasks.find((task) => !task.done) ?? tasks[0];
  const selectedBlock = timeline.find((block) => block.id === selectedTimeline) ?? timeline[0];
  const shellRef = useRef<HTMLDivElement | null>(null);
  const glowTrail = useRef({
    targetX: 0,
    targetY: 0,
    currentX: 0,
    currentY: 0,
    opacity: 0,
    targetOpacity: 0,
    frame: 0,
  });

  useEffect(() => {
    if (modal !== 'deleteForever') return;
    setDeleteCountdown(10);
    const timer = window.setInterval(() => {
      setDeleteCountdown((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [modal]);

  useEffect(() => {
    if (modal !== 'clearArchive') return;
    setClearArchiveCountdown(10);
    const timer = window.setInterval(() => {
      setClearArchiveCountdown((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [modal]);

  const rootStyle = theme === 'custom'
    ? ({
      '--custom-bg': customTheme.background,
      '--custom-surface': customTheme.surface,
      '--custom-accent': customTheme.accent,
    } as CSSProperties)
    : undefined;

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    const trail = glowTrail.current;
    const startX = window.innerWidth * 0.52;
    const startY = window.innerHeight * 0.42;
    trail.targetX = startX;
    trail.targetY = startY;
    trail.currentX = startX;
    trail.currentY = startY;

    shell.style.setProperty('--trail-x', `${startX}px`);
    shell.style.setProperty('--trail-y', `${startY}px`);
    shell.style.setProperty('--trail-opacity', '0');

    return () => {
      if (glowTrail.current.frame) {
        window.cancelAnimationFrame(glowTrail.current.frame);
      }
    };
  }, []);

  function scheduleGlowFrame() {
    const shell = shellRef.current;
    const trail = glowTrail.current;
    if (!shell || trail.frame) return;

    const tick = () => {
      const current = glowTrail.current;
      current.currentX += (current.targetX - current.currentX) * 0.22;
      current.currentY += (current.targetY - current.currentY) * 0.22;
      current.opacity += (current.targetOpacity - current.opacity) * 0.22;

      shell.style.setProperty('--trail-x', `${current.currentX.toFixed(1)}px`);
      shell.style.setProperty('--trail-y', `${current.currentY.toFixed(1)}px`);
      shell.style.setProperty('--trail-opacity', current.opacity.toFixed(3));

      const resting =
        Math.abs(current.targetX - current.currentX) < 0.35 &&
        Math.abs(current.targetY - current.currentY) < 0.35 &&
        Math.abs(current.targetOpacity - current.opacity) < 0.01;

      if (resting) {
        current.currentX = current.targetX;
        current.currentY = current.targetY;
        current.opacity = current.targetOpacity;
        shell.style.setProperty('--trail-x', `${current.currentX.toFixed(1)}px`);
        shell.style.setProperty('--trail-y', `${current.currentY.toFixed(1)}px`);
        shell.style.setProperty('--trail-opacity', current.opacity.toFixed(3));
        current.frame = 0;
        return;
      }

      current.frame = window.requestAnimationFrame(tick);
    };

    trail.frame = window.requestAnimationFrame(tick);
  }

  function showToast(message: string) {
    setToast(message);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (window.innerWidth <= 1023) return;

    const eventTarget = event.target as HTMLElement;
    if (eventTarget.closest('[data-no-glow="true"]')) {
      glowTrail.current.targetOpacity = 0.02;
      scheduleGlowFrame();
      return;
    }

    const interactiveTarget = eventTarget.closest('button, a, input, select, textarea, label, .surface, .surface-strong, .task-row, .calendar-day, .theme-button, .theme-dot, .mini-metric, .medal-card, .photo-upload-chip, .nav-active, .nav-idle, .sidebar-shell');
    glowTrail.current.targetX = event.clientX;
    glowTrail.current.targetY = event.clientY;
    glowTrail.current.targetOpacity = interactiveTarget ? 0.26 : 0.08;
    scheduleGlowFrame();
  }

  function updateCustomTheme(key: keyof CustomTheme, value: string) {
    setTheme('custom');
    setCustomTheme((current) => ({ ...current, [key]: value }));
  }

  function resetTaskDraft() {
    setTaskDraft({ title: '', category: 'Study', date: 'Today', duration: '45m', notes: '' });
  }

  function openTaskModal(prefill?: Partial<typeof taskDraft>) {
    setTaskDraft({ title: '', category: 'Study', date: 'Today', duration: '45m', notes: '', ...prefill });
    setModal('task');
  }

  function addTask() {
    const title = taskDraft.title.trim();
    if (!title) {
      setModal('formWarning');
      return;
    }

    const categoryToGoal: Record<Category, string> = {
      Study: 'Ace final exams',
      Fitness: 'Lose 20kg',
      Build: 'Build Tracksy',
      Recovery: 'Fix daily rhythm',
      Personal: 'Daily discipline',
    };

    const newTask: Task = {
      id: nextId(tasks),
      title,
      goal: categoryToGoal[taskDraft.category],
      time: taskDraft.date === 'Today' ? '06:00 PM' : 'Planned',
      date: taskDraft.date,
      duration: taskDraft.duration,
      category: taskDraft.category,
      notes: taskDraft.notes,
      status: tasks.length === 0 ? 'focus' : 'later',
      done: false,
    };

    setTasks((current) => [...current, newTask]);
    setTimeline((current) => [...current, { id: nextId(current), time: '18:00', label: title, kind: taskDraft.category }]);
    setModal(null);
    resetTaskDraft();
    showToast('Task added gently.');
  }

  function addGoal() {
    const name = goalDraft.name.trim();
    if (!name) {
      setModal('formWarning');
      return;
    }

    const numericProgress = Number(goalDraft.progress);
    const progress = Number.isFinite(numericProgress) ? Math.max(0, Math.min(100, numericProgress)) : 0;
    setGoals((current) => [...current, {
      id: nextId(current),
      name,
      description: goalDraft.description.trim() || 'New reason to stay consistent.',
      progressLabel: `${progress}%`,
      progress,
    }]);
    setGoalDraft({ name: '', description: '', progress: '0' });
    setModal(null);
    showToast('Goal added.');
  }

  function addTemplate() {
    const name = templateDraft.name.trim();
    if (!name) {
      setModal('formWarning');
      return;
    }

    setTemplates((current) => [...current, {
      id: nextId(current),
      name,
      description: templateDraft.description.trim() || 'Reusable routine for future days.',
      tasks: ['Start routine', 'Main block', 'Review and recover'],
    }]);
    setTemplateDraft({ name: '', description: '' });
    showToast('Template created.');
  }

  function applyTemplate(template: Template) {
    const baseId = nextId(tasks);
    const newTasks: Task[] = template.tasks.map((title, index) => ({
      id: baseId + index,
      title,
      goal: goals[0]?.name ?? 'Daily discipline',
      time: `${6 + index}:00 PM`,
      date: 'Today',
      duration: index === 1 ? '45m' : '15m',
      category: index === 1 ? 'Study' : 'Recovery',
      notes: 'Created from a Tracksy template.',
      status: index === 0 ? 'next' : 'later',
      done: false,
    }));

    setTasks((current) => [...current, ...newTasks]);
    setModal(null);
    showToast(`${template.name} applied to today.`);
  }

  function toggleTask(id: number) {
    setTasks((current) => current.map((task) => task.id === id ? { ...task, done: !task.done } : task));
  }

  function createBlockForSelectedDay() {
    openTaskModal({ title: `New block for June ${selectedDay}`, date: `June ${selectedDay}`, category: 'Build' });
    setCalendarNote(`Creating a block on June ${selectedDay}`);
  }

  function moveSelectedBlock() {
    setTimeline((current) => current.map((block) => block.id === selectedTimeline ? { ...block, time: '22:00', label: `${block.label} · moved` } : block));
    setCalendarNote(`Moved ${selectedBlock.label} to June ${selectedDay}`);
    showToast('Timeline block moved.');
  }

  function confirmDeleteForever() {
    if (archiveItems.length > 0) {
      setArchiveItems((current) => current.slice(1));
    }
    setModal(null);
    showToast('Archived item deleted forever.');
  }

  function confirmClearArchive() {
    setArchiveItems([]);
    setModal(null);
    showToast('Archive cleared.');
  }

  const pageTitle = useMemo(() => {
    if (view === 'dashboard') return 'Today is your luminous workspace.';
    if (view === 'calendar') return 'Move the day without losing the goal.';
    if (view === 'goals') return 'Your reasons, not just your tasks.';
    if (view === 'journal') return 'Reflect without judging yourself.';
    return 'Ask for clarity, not permission.';
  }, [view]);

  return (
    <div
      className={`tracksy-shell theme-${theme} ${glassEnabled ? 'glass-on' : 'glass-off'} h-screen overflow-hidden`}
      ref={shellRef}
      style={rootStyle}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => { glowTrail.current.targetOpacity = 0; scheduleGlowFrame(); }}
    >
      <div className="ambient-field" />
      <div className="noise-layer" />
      <div className="cursor-light" aria-hidden="true" />

      <div className="relative z-30 flex h-screen overflow-hidden p-4 sm:p-6 lg:p-8">
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          view={view}
          setView={setView}
          theme={theme}
          setTheme={setTheme}
          glassEnabled={glassEnabled}
          setGlassEnabled={setGlassEnabled}
          customTheme={customTheme}
          updateCustomTheme={updateCustomTheme}
        />

        <main className="flex h-full min-w-0 flex-1 flex-col overflow-hidden lg:pl-6">
          <header data-no-glow="true" className="nav-shield mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[24px] border px-5 py-4 lg:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button aria-label="Mobile menu" className="grid h-11 w-11 place-items-center rounded-[18px] bg-white/10 text-white lg:hidden">
                <Menu size={19} />
              </button>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/42">
                  Saturday · 5:00 PM · {themeLabels[theme]} · {glassEnabled ? 'Glass' : 'Solid'}
                </p>
                <h1 className="text-xl font-semibold tracking-[-0.04em] text-white sm:text-2xl">{pageTitle}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button onClick={() => setFocusMode(!focusMode)} className={`hidden items-center gap-2 rounded-[18px] px-4 py-3 text-sm font-semibold transition sm:flex ${focusMode ? 'primary-button' : 'secondary-button'}`}>
                <Focus size={17} /> {focusMode ? 'Focused' : 'Focus'}
              </button>
              <button onClick={() => openTaskModal()} className="primary-button flex items-center gap-2 rounded-[18px] px-4 py-3 text-sm font-semibold shadow-xl shadow-black/10 transition hover:scale-[1.02]">
                <Plus size={17} /> Add task
              </button>
            </div>
          </header>

          <section className="main-scroll min-h-0 flex-1 overflow-y-auto pr-0 lg:pr-1">
            {view === 'dashboard' && (
              <Dashboard
                tasks={tasks}
                goals={goals}
                templates={templates}
                timeline={timeline}
                archiveItems={archiveItems}
                activeTask={activeTask}
                completion={completion}
                completeCount={completeCount}
                selectedTimeline={selectedTimeline}
                setSelectedTimeline={setSelectedTimeline}
                onToggleTask={toggleTask}
                onOpenTask={() => openTaskModal()}
                onOpenTemplate={() => setModal('template')}
                onOpenGoal={() => setModal('goal')}
                onApplyTemplate={applyTemplate}
                onDeleteForever={() => setModal('deleteForever')}
                onClearArchive={() => setModal('clearArchive')}
              />
            )}
            {view === 'calendar' && (
              <CalendarView
                selectedDay={selectedDay}
                setSelectedDay={setSelectedDay}
                calendarNote={calendarNote}
                setCalendarNote={setCalendarNote}
                selectedBlock={selectedBlock}
                onCreateBlock={createBlockForSelectedDay}
                onMoveBlock={moveSelectedBlock}
              />
            )}
            {view === 'goals' && <GoalsView goals={goals} onOpenGoal={() => setModal('goal')} />}
            {view === 'journal' && <JournalView />}
            {view === 'ai' && <AiCoachView />}
          </section>
        </main>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast('')} />}

      {modal === 'task' && (
        <ModalShell title="Create New Task" subtitle="Add the next action calmly. No pressure, just direction." onClose={() => setModal(null)}>
          <form onSubmit={(event) => { event.preventDefault(); addTask(); }} className="space-y-5">
            <label className="field-label">
              Title
              <input value={taskDraft.title} onChange={(event) => setTaskDraft({ ...taskDraft, title: event.target.value })} className="form-input" placeholder="Example: Review physics chapter 4" />
            </label>

            <div>
              <p className="mb-3 text-sm font-semibold text-white/65">Category</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {categories.map((category) => (
                  <button key={category} type="button" onClick={() => setTaskDraft({ ...taskDraft, category })} className={`category-pill ${taskDraft.category === category ? 'is-active' : ''}`}>
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="field-label">
                Date
                <input value={taskDraft.date} onChange={(event) => setTaskDraft({ ...taskDraft, date: event.target.value })} className="form-input" placeholder="Today" />
              </label>
              <label className="field-label">
                Duration
                <select value={taskDraft.duration} onChange={(event) => setTaskDraft({ ...taskDraft, duration: event.target.value })} className="form-input">
                  <option>15m</option>
                  <option>30m</option>
                  <option>45m</option>
                  <option>60m</option>
                  <option>90m</option>
                </select>
              </label>
            </div>

            <label className="field-label">
              Notes optional
              <textarea value={taskDraft.notes} onChange={(event) => setTaskDraft({ ...taskDraft, notes: event.target.value })} className="form-input min-h-[112px] resize-none" placeholder="Small context, recovery note, or reason why this matters..." />
            </label>

            <button type="submit" className="primary-button w-full rounded-[20px] px-4 py-3.5 text-sm font-semibold">Add gently</button>
          </form>
        </ModalShell>
      )}

      {modal === 'goal' && (
        <ModalShell title="Add goal" subtitle="Goals give tasks meaning." onClose={() => setModal(null)}>
          <form onSubmit={(event) => { event.preventDefault(); addGoal(); }} className="space-y-4">
            <input value={goalDraft.name} onChange={(event) => setGoalDraft({ ...goalDraft, name: event.target.value })} className="form-input" placeholder="Goal name" />
            <input value={goalDraft.description} onChange={(event) => setGoalDraft({ ...goalDraft, description: event.target.value })} className="form-input" placeholder="Why this goal matters" />
            <input value={goalDraft.progress} onChange={(event) => setGoalDraft({ ...goalDraft, progress: event.target.value })} className="form-input" placeholder="Progress percent" />
            <button type="submit" className="primary-button w-full rounded-[20px] px-4 py-3.5 text-sm font-semibold">Add goal</button>
          </form>
        </ModalShell>
      )}

      {modal === 'template' && (
        <ModalShell title="Templates" subtitle="Apply a routine or create a new reusable one." onClose={() => setModal(null)}>
          <div className="space-y-3">
            {templates.map((template) => (
              <div key={template.id} className="surface rounded-[24px] border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-white">{template.name}</h3>
                    <p className="mt-1 text-sm text-white/45">{template.description}</p>
                    <p className="mt-2 text-xs text-white/35">{template.tasks.length} tasks</p>
                  </div>
                  <button onClick={() => applyTemplate(template)} className="primary-button rounded-[16px] px-3 py-2 text-xs font-semibold">Apply</button>
                </div>
              </div>
            ))}
          </div>
          <div className="surface mt-5 grid gap-3 rounded-[24px] border p-4">
            <input value={templateDraft.name} onChange={(event) => setTemplateDraft({ ...templateDraft, name: event.target.value })} className="form-input" placeholder="Template name" />
            <input value={templateDraft.description} onChange={(event) => setTemplateDraft({ ...templateDraft, description: event.target.value })} className="form-input" placeholder="Short description" />
            <button onClick={addTemplate} className="secondary-button rounded-[20px] px-4 py-3 text-sm font-semibold">Add template</button>
          </div>
        </ModalShell>
      )}

      {modal === 'formWarning' && (
        <WarningModal
          title="A small detail is missing"
          description="The form needs a title before Tracksy can add it. Nothing is wrong; just give this action a clear name and continue gently."
          actionLabel="Return to form"
          onAction={() => setModal('task')}
          onClose={() => setModal(null)}
        />
      )}

      {modal === 'deleteForever' && (
        <WarningModal
          title="Delete forever?"
          description="This cannot be undone, so Tracksy waits a few seconds before allowing the final action. Calm decisions protect your future self."
          actionLabel={deleteCountdown > 0 ? `Wait ${deleteCountdown}s` : '10s guard complete · Delete forever'}
          disabled={deleteCountdown > 0}
          destructive
          onAction={confirmDeleteForever}
          onClose={() => setModal(null)}
        />
      )}

      {modal === 'clearArchive' && (
        <WarningModal
          title="Clear entire Archive?"
          description="This clears every archived item in this prototype. Tracksy adds a short pause so destructive actions stay calm, deliberate, and recoverable."
          actionLabel={clearArchiveCountdown > 0 ? `Wait ${clearArchiveCountdown}s` : '10s guard complete · Clear archive'}
          disabled={clearArchiveCountdown > 0}
          destructive
          onAction={confirmClearArchive}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

function Sidebar({ collapsed, setCollapsed, view, setView, theme, setTheme, glassEnabled, setGlassEnabled, customTheme, updateCustomTheme }: {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  view: View;
  setView: (value: View) => void;
  theme: Theme;
  setTheme: (value: Theme) => void;
  glassEnabled: boolean;
  setGlassEnabled: (value: boolean) => void;
  customTheme: CustomTheme;
  updateCustomTheme: (key: keyof CustomTheme, value: string) => void;
}) {
  return (
    <aside className={`${collapsed ? 'w-[88px]' : 'w-[282px]'} sidebar-shell sticky top-4 hidden h-[calc(100vh-2rem)] shrink-0 flex-col overflow-y-auto rounded-[24px] border p-4 shadow-2xl shadow-black/20 transition-all duration-300 sm:top-6 sm:h-[calc(100vh-3rem)] lg:top-8 lg:flex lg:h-[calc(100vh-4rem)]`}>
      <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} gap-3 px-1 py-2`}>
        <button onClick={() => collapsed && setCollapsed(false)} aria-label="Tracksy home" className="flex items-center gap-3 overflow-hidden rounded-[20px] text-left">
          <div className="logo-box grid h-11 w-11 shrink-0 place-items-center rounded-[18px] text-[#150f28] shadow-lg shadow-white/10">
            <Sparkles size={20} />
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-semibold tracking-[0.24em] text-white/58">TRACKSY</p>
              <p className="text-xs text-white/40">Luminous discipline</p>
            </div>
          )}
        </button>
        {!collapsed && (
          <button aria-label="Collapse sidebar" onClick={() => setCollapsed(true)} className="rounded-[16px] p-2 text-white/50 transition hover:bg-white/10 hover:text-white">
            <PanelLeft size={18} />
          </button>
        )}
      </div>

      <nav className="mt-8 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = view === item.id;
          return (
            <button key={item.id} title={collapsed ? item.label : undefined} onClick={() => setView(item.id)} className={`group relative flex w-full items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'} rounded-[18px] py-3 text-left text-sm transition ${active ? 'nav-active' : 'nav-idle'}`}>
              <Icon size={19} className="shrink-0" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
              {collapsed && <span className="sidebar-tip">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4">
        {collapsed ? (
          <>
            <div className="surface flex flex-col items-center gap-2 rounded-[24px] border py-3">
              {(Object.keys(themeLabels) as Theme[]).map((key) => (
                <button key={key} title={themeLabels[key]} onClick={() => setTheme(key)} className={`theme-dot dot-${key} ${theme === key ? 'is-active' : ''}`} />
              ))}
            </div>
            <button aria-label="Toggle glass effect" onClick={() => setGlassEnabled(!glassEnabled)} className="grid w-full place-items-center rounded-[18px] bg-white/10 p-3 text-white/70 transition hover:bg-white/15 hover:text-white">
              <Layers size={18} />
            </button>
            <button aria-label="Expand sidebar" onClick={() => setCollapsed(false)} className="grid w-full place-items-center rounded-[18px] bg-white/10 p-3 text-white/70 transition hover:bg-white/15 hover:text-white">
              <Menu size={18} />
            </button>
          </>
        ) : (
          <>
            <div className="surface rounded-[24px] border p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-[18px] bg-white/10 text-white">
                  <UserRound size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Omar</p>
                  <p className="text-xs text-white/45">Building consistency</p>
                </div>
              </div>
            </div>

            <div className="surface rounded-[24px] border p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/38">Theme Studio</p>
                  <p className="text-xs text-white/35">Live workspace controls</p>
                </div>
                <Palette size={18} className="text-white/45" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(themeLabels) as Theme[]).map((key) => (
                  <button key={key} onClick={() => setTheme(key)} className={`theme-button ${theme === key ? 'is-selected' : ''}`}>
                    {themeLabels[key]}
                  </button>
                ))}
              </div>

              <button onClick={() => setGlassEnabled(!glassEnabled)} className={`mt-3 w-full rounded-[18px] px-3 py-2 text-xs font-semibold transition ${glassEnabled ? 'secondary-button' : 'primary-button'}`}>
                {glassEnabled ? 'Glass effect: On' : 'Solid widgets: On'}
              </button>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <ColorControl label="BG" value={customTheme.background} onChange={(value) => updateCustomTheme('background', value)} />
                <ColorControl label="Surface" value={customTheme.surface} onChange={(value) => updateCustomTheme('surface', value)} />
                <ColorControl label="Accent" value={customTheme.accent} onChange={(value) => updateCustomTheme('accent', value)} />
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

function ColorControl({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="custom-color-label">
      {label}
      <input type="color" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Dashboard({ tasks, goals, templates, timeline, archiveItems, activeTask, completion, completeCount, selectedTimeline, setSelectedTimeline, onToggleTask, onOpenTask, onOpenTemplate, onOpenGoal, onApplyTemplate, onDeleteForever, onClearArchive }: {
  tasks: Task[];
  goals: Goal[];
  templates: Template[];
  timeline: TimelineBlock[];
  archiveItems: string[];
  activeTask: Task;
  completion: number;
  completeCount: number;
  selectedTimeline: number;
  setSelectedTimeline: (id: number) => void;
  onToggleTask: (id: number) => void;
  onOpenTask: () => void;
  onOpenTemplate: () => void;
  onOpenGoal: () => void;
  onApplyTemplate: (template: Template) => void;
  onDeleteForever: () => void;
  onClearArchive: () => void;
}) {
  return (
    <div className="dashboard-grid grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.42fr)_minmax(380px,0.58fr)]">
      <div className="space-y-6">
        <section className="surface hero-card rounded-[24px] border p-6 shadow-2xl shadow-black/20 lg:p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/70">
                <Flame size={14} /> Luminous Workspace · Today first
              </div>
              <h2 className="max-w-3xl text-4xl font-semibold leading-[0.96] tracking-[-0.07em] text-white sm:text-5xl lg:text-6xl">
                {activeTask?.title ?? 'Plan your first task'}
              </h2>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/56 sm:text-base">
                Your next action should feel clear, personal, and recoverable. Tracksy keeps the day focused without turning failure into punishment.
              </p>
            </div>
            <div className="surface-strong rounded-[24px] border p-5 lg:w-72">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/48">Today progress</span>
                <span className="font-semibold text-white">{completeCount} / {tasks.length}</span>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                <div className="progress-fill h-full rounded-full transition-all duration-500" style={{ width: `${completion}%` }} />
              </div>
              <div className="mt-5 flex items-end justify-between">
                <p className="text-4xl font-semibold tracking-[-0.06em] text-white">{completion}%</p>
                <p className="rounded-full bg-emerald-soft px-3 py-1 text-xs font-semibold text-emerald-mint">Recovery alive</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className="surface rounded-[24px] border p-5 lg:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold tracking-[-0.04em] text-white">Today's Tasks</h3>
                <p className="text-sm text-white/42">Actions, not judgment.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={onOpenTemplate} className="secondary-button rounded-[18px] px-3 py-2 text-xs font-semibold">Templates</button>
                <button onClick={onOpenTask} className="primary-button rounded-[18px] px-3 py-2 text-xs font-semibold">Add</button>
              </div>
            </div>
            <div className="space-y-3">
              {tasks.map((task) => (
                <button key={task.id} onClick={() => onToggleTask(task.id)} className={`task-row group w-full rounded-[22px] border p-4 text-left transition ${task.done ? 'task-done' : 'task-idle'}`}>
                  <div className="flex items-start gap-3">
                    <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-[14px] border transition ${task.done ? 'border-emerald bg-emerald text-[#150f28]' : 'border-white/18 text-white/45 group-hover:text-white'}`}>
                      {task.done ? <Check size={15} /> : <Clock3 size={15} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block font-semibold tracking-[-0.02em] ${task.done ? 'text-white/55 line-through' : 'text-white'}`}>{task.title}</span>
                      <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/42">
                        <span>{task.date}</span><span>•</span><span>{task.duration}</span><span>•</span><span>{task.category}</span><span>•</span><span>{task.goal}</span>
                      </span>
                    </span>
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">{task.status}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <div className="space-y-6">
            <TimelineCard timeline={timeline} selectedTimeline={selectedTimeline} setSelectedTimeline={setSelectedTimeline} />
            <MotivationCard />
          </div>
        </section>
      </div>

      <aside className="space-y-6">
        <EmbeddedAiCard />
        <GoalProgressCard goals={goals} onOpenGoal={onOpenGoal} />
        <StreakCard />
        <TemplatesMiniCard templates={templates} onApplyTemplate={onApplyTemplate} />
        <ArchiveCard archiveItems={archiveItems} onDeleteForever={onDeleteForever} onClearArchive={onClearArchive} />
        <RecoveryCard />
        <NegativeHabitsCard />
      </aside>
    </div>
  );
}

function TimelineCard({ timeline, selectedTimeline, setSelectedTimeline }: { timeline: TimelineBlock[]; selectedTimeline: number; setSelectedTimeline: (id: number) => void }) {
  const selected = timeline.find((item) => item.id === selectedTimeline) ?? timeline[0];
  return (
    <section className="surface rounded-[24px] border p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold tracking-[-0.03em] text-white">Timeline</h3>
          <p className="text-sm text-white/42">Selected: {selected?.time} {selected?.label}</p>
        </div>
        <CalendarDays size={20} className="text-white/45" />
      </div>
      <div className="space-y-4">
        {timeline.map((item) => {
          const active = item.id === selectedTimeline;
          return (
            <button key={item.id} onClick={() => setSelectedTimeline(item.id)} className="flex w-full items-center gap-3 text-left">
              <div className={`h-2.5 w-2.5 rounded-full ${active ? 'accent-dot' : 'bg-white/40'}`} />
              <div className={`h-12 flex-1 rounded-[18px] border px-3 py-2 text-sm transition ${active ? 'timeline-active' : 'timeline-idle'}`}>
                <span className="font-semibold">{item.time}</span> · {item.label}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function EmbeddedAiCard() {
  return (
    <section className="surface rounded-[24px] border p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/60">
            <Brain size={14} /> Embedded AI Coach
          </div>
          <h3 className="text-xl font-semibold tracking-[-0.04em] text-white">Need a calmer plan?</h3>
        </div>
        <div className="logo-box grid h-11 w-11 place-items-center rounded-[18px] text-[#150f28]">
          <Sparkles size={19} />
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-white/52">
        You missed two sleep routines this week. The pattern looks like late design sessions, not lack of discipline.
      </p>
      <div className="mt-4 grid gap-2">
        <button className="primary-button rounded-[18px] px-4 py-3 text-left text-sm font-semibold transition hover:scale-[1.01]">Suggest a recovery plan</button>
        <button className="secondary-button rounded-[18px] px-4 py-3 text-left text-sm font-semibold">Explain today's priorities</button>
      </div>
    </section>
  );
}

function GoalProgressCard({ goals, onOpenGoal }: { goals: Goal[]; onOpenGoal: () => void }) {
  return (
    <section className="surface progress-card rounded-[24px] border p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold tracking-[-0.03em] text-white">Goal Progress</h3>
          <p className="mt-1 text-xs text-white/38">Fraction + percent view</p>
        </div>
        <button onClick={onOpenGoal} aria-label="Add goal" className="secondary-icon"><Plus size={16} /></button>
      </div>
      <div className="space-y-5">
        {goals.slice(0, 4).map((goal) => (
          <div key={goal.id} className="progress-item">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-white/78">{goal.name}</span>
              <span className="progress-fraction">{goal.progressLabel} · {goal.progress}%</span>
            </div>
            <div className="progress-track mt-2 h-3 overflow-hidden rounded-full">
              <div className="progress-fill h-full rounded-full" style={{ width: `${goal.progress}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function StreakCard() {
  const medals = [
    { rank: 'Gold', label: '21 day return', emoji: '🥇', className: 'gold' },
    { rank: 'Silver', label: '14 day repair', emoji: '🥈', className: 'silver' },
    { rank: 'Bronze', label: '7 day reset', emoji: '🥉', className: 'bronze' },
  ];

  return (
    <section className="surface streak-card rounded-[24px] border p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="fire-orb" aria-hidden="true">🔥</div>
          <div>
            <h3 className="text-lg font-semibold tracking-[-0.03em] text-white">Streak</h3>
            <p className="text-sm text-white/42">11 / 21 days · 52%</p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-soft px-3 py-1 text-xs font-semibold text-emerald-mint">Recovered twice</span>
      </div>
      <div className="progress-track h-3 overflow-hidden rounded-full">
        <div className="streak-fill h-full rounded-full" style={{ width: '52%' }} />
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2">
        {medals.map((medal) => (
          <div key={medal.rank} className={`medal-card ${medal.className}`}>
            <span className="text-2xl" aria-hidden="true">{medal.emoji}</span>
            <p className="mt-2 text-xs font-extrabold text-white">{medal.rank}</p>
            <p className="mt-1 text-[10px] leading-4 text-white/42">{medal.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function TemplatesMiniCard({ templates, onApplyTemplate }: { templates: Template[]; onApplyTemplate: (template: Template) => void }) {
  return (
    <section className="surface rounded-[24px] border p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-white">Quick Templates</h3>
        <TimerReset size={19} className="text-white/45" />
      </div>
      <div className="grid gap-2">
        {templates.slice(0, 2).map((template) => (
          <button key={template.id} onClick={() => onApplyTemplate(template)} className="surface-strong rounded-[18px] border px-3 py-3 text-left text-sm text-white/65 transition hover:border-white/22 hover:text-white">
            <span className="font-semibold text-white/75">{template.name}</span>
            <span className="mt-1 block text-xs text-white/38">{template.tasks.length} tasks</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function MotivationCard() {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const cardStyle = photoUrl ? ({ '--motivation-photo': `url(${photoUrl})` } as CSSProperties) : undefined;

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoUrl(URL.createObjectURL(file));
  }

  return (
    <section style={cardStyle} className={`motivation-card surface rounded-[24px] border p-6 ${photoUrl ? 'has-photo' : ''}`}>
      <div className="mb-14 flex items-center justify-between gap-3">
        <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/68">Personal why</span>
        <label className="photo-upload-chip">
          <Heart size={15} /> Photo background
          <input className="sr-only" type="file" accept="image/*" onChange={handlePhotoChange} />
        </label>
      </div>
      <div className="max-w-[92%]">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-white/42">Return to yourself</p>
        <h3 className="text-4xl font-semibold leading-[0.98] tracking-[-0.07em] text-white">Build the version of you that future Omar can trust.</h3>
        <p className="mt-5 text-sm leading-7 text-white/58">Not perfect. Not always motivated. Just someone who returns, repairs, and keeps moving when the day gets messy.</p>
      </div>
      <div className="mt-7 grid grid-cols-3 gap-2 text-center">
        <div className="mini-metric">Return</div>
        <div className="mini-metric">Repair</div>
        <div className="mini-metric emerald">Recover</div>
      </div>
    </section>
  );
}

function ArchiveCard({ archiveItems, onDeleteForever, onClearArchive }: { archiveItems: string[]; onDeleteForever: () => void; onClearArchive: () => void }) {
  return (
    <section className="surface warning-surface rounded-[24px] border p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-white">Archive Safety</h3>
          <p className="mt-1 text-sm text-white/42">Destructive actions stay calm and deliberate.</p>
        </div>
        <Archive size={20} className="text-amber-soft" />
      </div>
      <div className="surface-strong mb-3 rounded-[18px] border px-3 py-3 text-sm text-white/62">
        {archiveItems.length > 0 ? `${archiveItems.length} archived items waiting` : 'Archive is empty'}
      </div>
      <div className="grid gap-2">
        <button onClick={onDeleteForever} disabled={archiveItems.length === 0} className="warning-button rounded-[18px] px-4 py-3 text-left text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-45">
          Delete forever preview
        </button>
        <button onClick={onClearArchive} disabled={archiveItems.length === 0} className="secondary-button rounded-[18px] px-4 py-3 text-left text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-45">
          Clear entire Archive
        </button>
      </div>
    </section>
  );
}

function RecoveryCard() {
  return (
    <section className="surface rounded-[24px] border p-5">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-[18px] bg-emerald-soft text-emerald-mint">
          <RotateCcw size={19} />
        </div>
        <div>
          <h3 className="font-semibold text-white">Recovery Strength</h3>
          <p className="text-sm text-white/42">Average bounce-back: 1.4 days</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {['Missed', 'Reason', 'Recovered'].map((step, index) => (
          <div key={step} className={`rounded-[18px] border border-white/10 px-2 py-3 ${index === 2 ? 'recovered-step' : 'bg-white/[0.07] text-white/55'}`}>
            <p className="text-xs font-semibold">{step}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function NegativeHabitsCard() {
  return (
    <section className="surface rounded-[24px] border p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white">Negative Habits</h3>
          <p className="text-sm text-white/42">Awareness without shame.</p>
        </div>
        <AlertTriangle size={20} className="text-white/45" />
      </div>
      <HabitLine label="Social media" count="3 checks" trend="-18%" />
      <HabitLine label="Junk food" count="0 today" trend="steady" />
    </section>
  );
}

function HabitLine({ label, count, trend }: { label: string; count: string; trend: string }) {
  return (
    <div className="surface-strong mt-2 flex items-center justify-between rounded-[18px] border px-3 py-3 text-sm">
      <span className="text-white/70">{label}</span>
      <span className="text-white/38">{count} · {trend}</span>
    </div>
  );
}

function CalendarView({ selectedDay, setSelectedDay, calendarNote, setCalendarNote, selectedBlock, onCreateBlock, onMoveBlock }: {
  selectedDay: number;
  setSelectedDay: (day: number) => void;
  calendarNote: string;
  setCalendarNote: (note: string) => void;
  selectedBlock: TimelineBlock;
  onCreateBlock: () => void;
  onMoveBlock: () => void;
}) {
  const days = Array.from({ length: 30 }, (_, index) => index + 1);
  const trainingDays = [3, 6, 10, 15, 18, 22, 26];

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <section className="surface rounded-[24px] border p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-3xl font-semibold tracking-[-0.06em] text-white">Calendar</h2>
            <p className="text-white/45">Reschedule the action, not the ambition.</p>
          </div>
          <button onClick={onCreateBlock} className="primary-button rounded-[18px] px-4 py-3 text-sm font-semibold">Create block</button>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <div key={day} className="px-2 pb-2 text-xs font-semibold text-white/38">{day}</div>)}
          {days.map((day) => {
            const active = day === selectedDay;
            return (
              <button key={day} onClick={() => { setSelectedDay(day); setCalendarNote(`Selected day: June ${day}`); }} className={`calendar-day ${active ? 'is-active' : ''}`}>
                <p className="font-semibold">{day}</p>
                {trainingDays.includes(day) && <p className={`mt-5 rounded-[14px] px-2 py-1 text-xs ${active ? 'bg-[#150f28] text-white' : 'bg-white/10 text-white/58'}`}>Training</p>}
              </button>
            );
          })}
        </div>
      </section>
      <section className="surface rounded-[24px] border p-5">
        <h3 className="text-xl font-semibold tracking-[-0.04em] text-white">Smart reschedule</h3>
        <p className="mt-2 text-sm leading-6 text-white/50">{calendarNote}. Selected timeline block: {selectedBlock.time} {selectedBlock.label}.</p>
        <div className="mt-5 space-y-3">
          <button onClick={onCreateBlock} className="primary-button w-full rounded-[18px] px-4 py-3 text-left text-sm font-semibold">Create block on this day</button>
          <button onClick={onMoveBlock} className="secondary-button w-full rounded-[18px] px-4 py-3 text-left text-sm font-semibold">Move selected timeline block</button>
          <button onClick={() => setCalendarNote(`Found a free slot on June ${selectedDay} at 8:40 PM`)} className="secondary-button w-full rounded-[18px] px-4 py-3 text-left text-sm font-semibold">Find free slot</button>
        </div>
      </section>
    </div>
  );
}

function GoalsView({ goals, onOpenGoal }: { goals: Goal[]; onOpenGoal: () => void }) {
  const icons = [Trophy, TrendingUp, Sparkles, Target];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-semibold tracking-[-0.06em] text-white">Goals</h2>
          <p className="text-white/45">Goals are the reason. Tasks are the action.</p>
        </div>
        <button onClick={onOpenGoal} className="primary-button flex items-center gap-2 rounded-[18px] px-4 py-3 text-sm font-semibold"><Plus size={17} /> Add goal</button>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {goals.map((goal, index) => {
          const GoalIcon = icons[index % icons.length];
          return (
            <section key={goal.id} className="surface rounded-[24px] border p-6">
              <div className="mb-10 flex items-center justify-between">
                <div className="logo-box grid h-12 w-12 place-items-center rounded-[18px] text-[#150f28]"><GoalIcon size={21} /></div>
                <ChevronRight className="text-white/35" size={20} />
              </div>
              <h2 className="text-3xl font-semibold tracking-[-0.06em] text-white">{goal.name}</h2>
              <p className="mt-2 text-sm leading-6 text-white/48">{goal.description}</p>
              <div className="mt-8 flex items-center justify-between text-sm">
                <span className="text-white/45">Progress</span>
                <span className="font-semibold text-white">{goal.progressLabel}</span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
                <div className="progress-fill h-full rounded-full" style={{ width: `${goal.progress}%` }} />
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function JournalView() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <section className="surface rounded-[24px] border p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-[-0.06em] text-white">Journal</h2>
            <p className="text-white/45">Your thoughts become data only when you allow it.</p>
          </div>
          <NotebookPen className="text-white/45" />
        </div>
        <div className="surface-strong rounded-[24px] border p-5">
          <p className="text-sm font-semibold text-white/55">Today's reflection</p>
          <p className="mt-4 text-2xl font-medium leading-snug tracking-[-0.04em] text-white">I did not fail because the plan was impossible. I failed because I started too late and ignored sleep.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {['sleep pattern', 'late start', 'recovery'].map((tag) => <span key={tag} className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/55">{tag}</span>)}
          </div>
        </div>
      </section>
      <section className="surface rounded-[24px] border p-5">
        <h3 className="text-xl font-semibold tracking-[-0.04em] text-white">Quick notes</h3>
        <div className="mt-5 space-y-3">
          {['Buy protein bars', 'Ask dad about Spec Kit', 'Find references for Tracksy UI'].map((note) => <div key={note} className="surface-strong rounded-[18px] border px-4 py-3 text-sm text-white/62">{note}</div>)}
        </div>
      </section>
    </div>
  );
}

function AiCoachView() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
      <section className="surface rounded-[24px] border p-6">
        <div className="mb-6 flex items-center gap-4">
          <div className="logo-box grid h-14 w-14 place-items-center rounded-[18px] text-[#150f28]"><Brain size={24} /></div>
          <div>
            <h2 className="text-3xl font-semibold tracking-[-0.06em] text-white">AI Coach</h2>
            <p className="text-white/45">Present when needed. Never hovering. Never judging.</p>
          </div>
        </div>
        <div className="space-y-4">
          <CoachMessage who="Coach" text="You are not behind. You are overloaded. Your next useful move is one focused block, not rebuilding the whole week." />
          <CoachMessage who="You" text="What should I do first today?" user />
          <CoachMessage who="Coach" text="Start with Physics for 45 minutes. It supports your exam goal and has the highest cost if delayed. Then move gym to 7:30 PM." />
        </div>
        <div className="surface-strong mt-5 flex gap-3 rounded-[24px] border p-2">
          <input aria-label="Ask AI Coach" className="min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-white/32" placeholder="Ask for a plan, explanation, or recovery idea..." />
          <button className="primary-button rounded-[18px] px-4 py-3 text-sm font-semibold">Ask</button>
        </div>
      </section>
      <section className="surface rounded-[24px] border p-5">
        <h3 className="text-xl font-semibold tracking-[-0.04em] text-white">Coach boundaries</h3>
        <div className="mt-5 space-y-3">
          {[
            ['Suggests', 'Plans, patterns, explanations'],
            ['Asks first', 'Before changing tasks or goals'],
            ['Never judges', 'Failure becomes information'],
          ].map(([title, body]) => <div key={title} className="surface-strong rounded-[18px] border p-4"><p className="font-semibold text-white">{title}</p><p className="mt-1 text-sm text-white/45">{body}</p></div>)}
        </div>
      </section>
    </div>
  );
}

function CoachMessage({ who, text, user = false }: { who: string; text: string; user?: boolean }) {
  return (
    <div className={`flex ${user ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[78%] rounded-[24px] border px-4 py-3 ${user ? 'bg-white text-[#150f28]' : 'surface-strong text-white/70'}`}>
        <p className={`mb-1 text-xs font-semibold ${user ? 'text-slate-500' : 'text-white/38'}`}>{who}</p>
        <p className="text-sm leading-6">{text}</p>
      </div>
    </div>
  );
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-5 left-1/2 z-[90] flex -translate-x-1/2 items-center gap-3 rounded-[24px] border border-white/12 bg-[#150f28]/85 px-4 py-3 text-sm font-semibold text-white shadow-2xl backdrop-blur-2xl">
      <Sparkles size={16} />
      <span>{message}</span>
      <button aria-label="Dismiss notification" onClick={onClose} className="rounded-[12px] p-1 text-white/45 hover:bg-white/10 hover:text-white"><X size={14} /></button>
    </div>
  );
}

function ModalShell({ title, subtitle, children, onClose }: { title: string; subtitle: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="modal-backdrop fixed inset-0 z-[80] grid place-items-center bg-[#08050f]/64 p-4 backdrop-blur-xl">
      <section className="modal-panel surface w-full max-w-2xl rounded-[24px] border p-6 shadow-2xl shadow-black/40">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold tracking-[-0.06em] text-white">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-white/48">{subtitle}</p>
          </div>
          <button onClick={onClose} aria-label="Close modal" className="secondary-icon"><X size={18} /></button>
        </div>
        {children}
      </section>
    </div>
  );
}

function WarningModal({ title, description, actionLabel, onAction, onClose, disabled = false, destructive = false }: {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  onClose: () => void;
  disabled?: boolean;
  destructive?: boolean;
}) {
  return (
    <div className="modal-backdrop fixed inset-0 z-[80] grid place-items-center bg-[#08050f]/64 p-4 backdrop-blur-xl">
      <section className="modal-panel warning-modal surface w-full max-w-lg rounded-[24px] border p-6 shadow-2xl shadow-black/40">
        <div className="mb-5 flex items-start gap-4">
          <div className="warning-icon grid h-12 w-12 shrink-0 place-items-center rounded-[18px]">
            {destructive ? <Trash2 size={21} /> : <AlertTriangle size={21} />}
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.05em] text-white">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-white/52">{description}</p>
          </div>
        </div>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button onClick={onClose} className="secondary-button rounded-[18px] px-4 py-3 text-sm font-semibold">Cancel</button>
          <button onClick={onAction} disabled={disabled} className="warning-button rounded-[18px] px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-55">{actionLabel}</button>
        </div>
      </section>
    </div>
  );
}

export default App;
