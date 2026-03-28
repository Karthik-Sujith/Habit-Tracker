import { useState, useMemo } from 'react';
import { 
  Plus, 
  Flame, 
  Check, 
  Trash2, 
  RotateCcw, 
  Dumbbell, 
  BookOpen, 
  Wind, 
  Droplets, 
  Moon, 
  PenTool, 
  Code, 
  GraduationCap, 
  Footprints, 
  Salad, 
  StretchHorizontal, 
  Music, 
  Palette, 
  Brush, 
  Target, 
  Star,
  Calendar
} from 'lucide-react';
import './Home.css';

const STORAGE_KEY = 'habits-tracker-data';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getToday() {
  return formatDateKey(new Date());
}

function loadData() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { habits: [], completions: {} };
  } catch {
    return { habits: [], completions: {} };
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function calculateStreak(habitId, completions) {
  const today = new Date();
  let streak = 0;
  let currentDate = new Date(today);
  const todayStr = getToday();
  const isTodayCompleted = completions[todayStr]?.includes(habitId);

  if (!isTodayCompleted) {
    currentDate.setDate(currentDate.getDate() - 1);
  }

  while (true) {
    const dateStr = currentDate.toISOString().split('T')[0];
    if (completions[dateStr]?.includes(habitId)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function calculateBestStreak(habitId, completions) {
  const dates = Object.keys(completions).sort();
  if (dates.length === 0) return 0;

  let bestStreak = 0;
  let currentStreak = 0;
  let prevDate = null;

  for (const dateStr of dates) {
    if (completions[dateStr]?.includes(habitId)) {
      if (prevDate) {
        const prev = new Date(prevDate);
        const curr = new Date(dateStr);
        const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
        currentStreak = diffDays === 1 ? currentStreak + 1 : 1;
      } else {
        currentStreak = 1;
      }
      prevDate = dateStr;
      bestStreak = Math.max(bestStreak, currentStreak);
    }
  }
  return bestStreak;
}

const HABIT_ICONS = [
  { id: 'exercise', icon: <Dumbbell size={18} />, label: 'Exercise' },
  { id: 'read', icon: <BookOpen size={18} />, label: 'Read' },
  { id: 'meditate', icon: <Wind size={18} />, label: 'Meditate' },
  { id: 'water', icon: <Droplets size={18} />, label: 'Drink Water' },
  { id: 'sleep', icon: <Moon size={18} />, label: 'Sleep Early' },
  { id: 'journal', icon: <PenTool size={18} />, label: 'Journal' },
  { id: 'code', icon: <Code size={18} />, label: 'Code' },
  { id: 'learn', icon: <GraduationCap size={18} />, label: 'Learn' },
  { id: 'walk', icon: <Footprints size={18} />, label: 'Walk' },
  { id: 'healthy', icon: <Salad size={18} />, label: 'Eat Healthy' },
  { id: 'stretch', icon: <StretchHorizontal size={18} />, label: 'Stretch' },
  { id: 'music', icon: <Music size={18} />, label: 'Practice Music' },
  { id: 'art', icon: <Palette size={18} />, label: 'Create Art' },
  { id: 'clean', icon: <Brush size={18} />, label: 'Clean' },
  { id: 'focus', icon: <Target size={18} />, label: 'Deep Focus' },
  { id: 'other', icon: <Star size={18} />, label: 'Other' },
];

function HeatmapCalendar({ habits, completions }) {
  const { weeks } = useMemo(() => {
    const today = new Date();
    const daysArray = [];
    const totalDays = 77;

    for (let i = totalDays - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = formatDateKey(date);
      const dayCompletions = completions[dateStr] || [];
      const totalHabits = habits.length;
      const completedCount = dayCompletions.filter(id => habits.some(h => h.id === id)).length;

      let level = 0;
      if (totalHabits > 0 && completedCount > 0) {
        const rate = completedCount / totalHabits;
        if (rate <= 0.25) level = 1;
        else if (rate <= 0.5) level = 2;
        else if (rate <= 0.75) level = 3;
        else level = 4;
      }

      daysArray.push({
        date: dateStr,
        level,
        completed: completedCount,
        total: totalHabits,
        dayOfWeek: date.getDay(),
        isToday: i === 0,
      });
    }

    const weeksArray = [];
    let currentWeek = [];
    const firstDayOfWeek = daysArray[0].dayOfWeek;
    for (let i = 0; i < firstDayOfWeek; i++) { currentWeek.push(null); }

    daysArray.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeksArray.push(currentWeek);
        currentWeek = [];
      }
    });

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) { currentWeek.push(null); }
      weeksArray.push(currentWeek);
    }
    return { weeks: weeksArray };
  }, [habits, completions]);

  return (
    <div className="heatmap">
      <div className="heatmapWeeks">
        {weeks.map((week, wi) => (
          <div key={wi} className="heatmapWeek">
            {week.map((day, di) => (
              <div
                key={di}
                className={`heatmapCell ${day ? `level-${day.level}` : ''} ${day?.isToday ? 'today' : ''}`}
                data-empty={!day}
                title={day ? `${day.date}: ${day.completed}/${day.total}` : ''}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="heatmapLegend">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map(l => <div key={l} className={`heatmapCell level-${l}`} />)}
        <span>More</span>
      </div>
    </div>
  );
}

export default function App() {
  const [data, setData] = useState(loadData);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [customName, setCustomName] = useState('');

  const today = getToday();
  const todayCompletions = data.completions[today] || [];

  const stats = useMemo(() => {
    const totalHabits = data.habits.length;
    const completedToday = todayCompletions.length;
    const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
    let totalCurrentStreak = 0;
    let bestOverallStreak = 0;

    data.habits.forEach((habit) => {
      totalCurrentStreak += calculateStreak(habit.id, data.completions);
      bestOverallStreak = Math.max(bestOverallStreak, calculateBestStreak(habit.id, data.completions));
    });

    return {
      totalHabits,
      completedToday,
      completionRate,
      avgStreak: totalHabits > 0 ? Math.round(totalCurrentStreak / totalHabits) : 0,
      bestStreak: bestOverallStreak,
    };
  }, [data, todayCompletions]);

  const updateData = (newData) => {
    setData(newData);
    saveData(newData);
  };

  const toggleHabit = (habitId) => {
    const newCompletions = { ...data.completions };
    const todayList = [...(newCompletions[today] || [])];
    newCompletions[today] = todayList.includes(habitId) 
      ? todayList.filter((id) => id !== habitId) 
      : [...todayList, habitId];
    updateData({ ...data, completions: newCompletions });
  };

  const addHabit = (e) => {
    e.preventDefault();
    if (!selectedIcon) return;
    const name = selectedIcon.id === 'other' ? customName.trim() : selectedIcon.label;
    if (!name) return;

    const newHabit = {
      id: generateId(),
      name,
      iconId: selectedIcon.id, // Store ID to look up icon component
      createdAt: new Date().toISOString(),
    };

    updateData({ ...data, habits: [...data.habits, newHabit] });
    resetForm();
  };

  const deleteHabit = (habitId) => {
    const newHabits = data.habits.filter((h) => h.id !== habitId);
    const newCompletions = { ...data.completions };
    Object.keys(newCompletions).forEach((date) => {
      newCompletions[date] = newCompletions[date].filter((id) => id !== habitId);
    });
    updateData({ habits: newHabits, completions: newCompletions });
  };

  const resetForm = () => {
    setSelectedIcon(null);
    setCustomName('');
    setIsAdding(false);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric',
    });
  };

  return (
    <div className="app">
      <header className="header">
        <h1 className="title">Habits</h1>
        <p className="subtitle">{formatDate(today)}</p>
      </header>

      <main className="main">
        <div className="card statsCard">
          <div className="statGrid">
            <div className="stat primary">
              <span className="statValue streakValue">
                <Flame size={20} className="fireIcon" />
                {stats.avgStreak}
              </span>
              <span className="statLabel">Day Streak</span>
            </div>
            <div className="stat">
              <span className="statValue">{stats.completedToday}/{stats.totalHabits}</span>
              <span className="statLabel">Today</span>
            </div>
            <div className="stat">
              <span className="statValue">{stats.completionRate}%</span>
              <span className="statLabel">Complete</span>
            </div>
            <div className="stat">
              <span className="statValue">{stats.bestStreak}</span>
              <span className="statLabel">Best</span>
            </div>
          </div>

          {stats.totalHabits > 0 && (
            <div className="progressContainer">
              <div className="progressBar">
                <div className="progressFill" style={{ width: `${stats.completionRate}%` }} />
              </div>
            </div>
          )}
        </div>

        {data.habits.length > 0 && (
          <div className="card heatmapCard">
            <h2 className="cardTitle">Activity</h2>
            <HeatmapCalendar habits={data.habits} completions={data.completions} />
          </div>
        )}

        <div className="card listCard">
          <div className="cardHeader">
            <h2 className="cardTitle">Daily Habits</h2>
            {!isAdding && (
              <button className="btn primary" onClick={() => setIsAdding(true)}>
                <Plus size={16} />
                Add
              </button>
            )}
          </div>

          {isAdding && (
            <form className="form" onSubmit={addHabit}>
              <div className="formSection">
                <label className="label">Choose Habit</label>
                <div className="iconGrid">
                  {HABIT_ICONS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`iconChip ${selectedIcon?.id === item.id ? 'selected' : ''}`}
                      onClick={() => setSelectedIcon(item)}
                    >
                      <span className="iconEmoji">{item.icon}</span>
                      <span className="iconLabel">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {selectedIcon?.id === 'other' && (
                <div className="formGroup">
                  <label className="label">Habit Name</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Enter habit name..."
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    autoFocus
                  />
                </div>
              )}

              <div className="formActions">
                <button type="button" className="btn ghost" onClick={resetForm}>Cancel</button>
                <button
                  type="submit"
                  className="btn primaryLight"
                  disabled={!selectedIcon || (selectedIcon.id === 'other' && !customName.trim())}
                >
                  Add Habit
                </button>
              </div>
            </form>
          )}

          {data.habits.length === 0 && !isAdding ? (
            <div className="empty">
              <Calendar size={48} strokeWidth={1} />
              <p>No habits yet</p>
              <span>Add your first habit to start tracking</span>
            </div>
          ) : (
            <ul className="habitList">
              {data.habits.map((habit) => {
                const isCompleted = todayCompletions.includes(habit.id);
                const streak = calculateStreak(habit.id, data.completions);
                const habitIcon = HABIT_ICONS.find(h => h.id === habit.iconId)?.icon || <Star size={18} />;

                return (
                  <li key={habit.id} className={`habitItem ${isCompleted ? 'completed' : ''}`}>
                    <button
                      className={`checkBtn ${isCompleted ? 'checked' : ''}`}
                      onClick={() => toggleHabit(habit.id)}
                    >
                      {isCompleted && <Check size={14} strokeWidth={3} />}
                    </button>
                    <span className="habitIcon">{habitIcon}</span>
                    <div className="habitInfo">
                      <span className="habitName">{habit.name}</span>
                      {streak > 0 && (
                        <span className="habitStreak">
                          <Flame size={12} fill="currentColor" /> {streak} day{streak !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <button className="iconBtn danger" onClick={() => deleteHabit(habit.id)}>
                      <Trash2 size={18} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}