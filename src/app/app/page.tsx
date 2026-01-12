'use client';

import React, { useState, useEffect } from 'react';
import {
    DndContext,
    DragOverlay,
    useDraggable,
    useDroppable,
    DragEndEvent,
    DragStartEvent,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    closestCenter
} from '@dnd-kit/core';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import {
    Calendar as CalendarIcon,
    Settings,
    BookOpen,
    Search,
    Bell,
    Menu,
    Plus,
    MoreVertical,
    Clock,
    AlertCircle,
    CheckCircle2,
    Trash2,
    X,
    User,
    Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri';
const DAYS: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const HOURS = Array.from({ length: 13 }, (_, i) => 8 + i); // 8 AM to 8 PM

interface Course {
    id: string;
    code: string;
    name: string;
    color: string;
    borderColor: string;
    textColor: string;
    professor: string;
    credits: number;
    duration: number; // Default duration
    description?: string;
}

interface SchedulerEvent {
    id: string;
    courseId: string;
    day: DayOfWeek;
    startHour: number; // 24h format
    duration: number;
    title?: string; // Optional override
}

interface Notification {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

// --- Data ---
const COURSES: Course[] = [
    { id: 'c1', code: 'CS-101', name: 'Intro to Comp Sci', color: 'bg-indigo-50', borderColor: 'border-indigo-200', textColor: 'text-indigo-700', professor: 'Dr. Smith', credits: 3, duration: 1.5, description: 'Fundamentals of programming and algorithms.' },
    { id: 'c2', code: 'MATH-201', name: 'Calculus II', color: 'bg-sky-50', borderColor: 'border-sky-200', textColor: 'text-sky-700', professor: 'Dr. Johnson', credits: 4, duration: 1, description: 'Integrals, series, and differential equations.' },
    { id: 'c3', code: 'PHYS-101', name: 'Physics I', color: 'bg-emerald-50', borderColor: 'border-emerald-200', textColor: 'text-emerald-700', professor: 'Dr. Brown', credits: 4, duration: 2, description: 'Mechanics, heat, and sound.' },
    { id: 'c4', code: 'ENG-102', name: 'Creative Writing', color: 'bg-rose-50', borderColor: 'border-rose-200', textColor: 'text-rose-700', professor: 'Prof. Davis', credits: 2, duration: 1.5, description: 'Workshop-based writing course.' },
    { id: 'c5', code: 'ART-105', name: 'Digital Design', color: 'bg-amber-50', borderColor: 'border-amber-200', textColor: 'text-amber-700', professor: 'Ms. Lee', credits: 3, duration: 2, description: 'Introduction to digital tools.' },
    { id: 'c6', code: 'STUDY', name: 'Study Session', color: 'bg-slate-100', borderColor: 'border-slate-300', textColor: 'text-slate-700', professor: 'Self', credits: 0, duration: 1, description: 'Personal focus time.' },
];

const INITIAL_EVENTS: SchedulerEvent[] = [
    { id: 'e1', courseId: 'c1', day: 'Mon', startHour: 9, duration: 1.5 },
    { id: 'e2', courseId: 'c2', day: 'Mon', startHour: 11, duration: 1 },
];

export default function SchedulerApp() {
    // --- State ---
    const [events, setEvents] = useState<SchedulerEvent[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentView, setCurrentView] = useState<'schedule' | 'courses' | 'settings'>('schedule');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showNotificationList, setShowNotificationList] = useState(false);
    const [isClient, setIsClient] = useState(false);

    // --- Persistence ---
    useEffect(() => {
        setIsClient(true);
        setMounted(true); // For current time effect
        const saved = localStorage.getItem('uniflow-events');
        if (saved) {
            try {
                setEvents(JSON.parse(saved));
            } catch (e) {
                setEvents(INITIAL_EVENTS);
            }
        } else {
            setEvents(INITIAL_EVENTS);
        }

        // Timer for current time line
        const interval = setInterval(() => {
            setNow(new Date());
        }, 60000); // Every minute

        return () => clearInterval(interval);
    }, []);

    const [now, setNow] = useState(new Date());
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        if (isClient && events.length > 0) {
            localStorage.setItem('uniflow-events', JSON.stringify(events));
        }
    }, [events, isClient]);

    // --- Sensors ---
    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
    );

    // --- Actions ---
    const addNotification = (message: string, type: 'success' | 'error' | 'info') => {
        const id = Date.now().toString();
        setNotifications(prev => [{ id, message, type }, ...prev].slice(0, 5));
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 3000);
    };

    const getCourse = (id: string) => COURSES.find(c => c.id === id);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const [dayStr, hourStr] = (over.id as string).split('-');
        const day = dayStr as DayOfWeek;
        const hour = parseFloat(hourStr);

        const courseId = active.id as string;
        const course = getCourse(courseId);
        if (!course) return;

        // Validation: Overlap Check
        // We allow overlaps now (Tetris style), so NO conflict error.
        // But we still enforce Business Hours (8am - 9pm)
        if (hour + course.duration > 21) {
            addNotification("Too late! Classes must end by 9 PM.", "error");
            return;
        }

        // Add Event
        // Check if we are moving an existing event or adding a new one
        const currentEventId = active.data?.current?.eventId;

        if (currentEventId) {
            // Update Existing
            const updatedEvents = events.map(e =>
                e.id === currentEventId ? { ...e, day, startHour: hour } : e
            );
            setEvents(updatedEvents);
            addNotification("Rescheduled successfully.", "info");
        } else {
            // Create New
            const newEvent: SchedulerEvent = {
                id: `e-${Date.now()}`,
                courseId: course.id,
                day,
                startHour: hour,
                duration: course.duration,
            };
            setEvents(prev => [...prev, newEvent]);
            addNotification(`Added ${course.code} to ${day}`, "success");
        }
    };

    const deleteEvent = (eventId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setEvents(prev => prev.filter(ev => ev.id !== eventId));
        addNotification("Event removed", "info");
    };

    const clearAllEvents = () => {
        if (confirm("Are you sure you want to clear your entire schedule?")) {
            setEvents([]);
            addNotification("Schedule cleared", "info");
        }
    };

    const addStudySession = () => {
        // Smartly find the first available slot
        const course = getCourse('c6');
        if (!course) return;

        // Simple heuristic: 9am - 5pm preferred
        const preferredHours = [9, 10, 11, 13, 14, 15, 16];
        let foundSlot: { day: DayOfWeek, hour: number } | null = null;

        for (const day of DAYS) {
            if (foundSlot) break;
            for (const hour of preferredHours) {
                // Check if slot is totally empty (prefer empty slots for auto-add)
                const isConflict = events.some(e => {
                    const eEnd = e.startHour + e.duration;
                    const newEnd = hour + course.duration;
                    return e.day === day && (
                        (hour >= e.startHour && hour < eEnd) ||
                        (newEnd > e.startHour && newEnd <= eEnd) ||
                        (hour <= e.startHour && newEnd >= eEnd)
                    );
                });

                if (!isConflict) {
                    foundSlot = { day, hour };
                    break;
                }
            }
        }

        if (foundSlot) {
            const newEvent: SchedulerEvent = {
                id: `e-${Date.now()}`,
                courseId: course.id,
                day: foundSlot.day,
                startHour: foundSlot.hour,
                duration: course.duration,
            };
            setEvents(prev => [...prev, newEvent]);
            addNotification(`Added Study Session to ${foundSlot.day} at ${foundSlot.hour}:00`, "success");
        } else {
            addNotification("No completely free slots found. Try manual placement.", "error");
        }
    };

    const filteredCourses = COURSES.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalCredits = events.reduce((acc, curr) => {
        const c = getCourse(curr.courseId);
        // Deduplicate credits? Usually you get credit once per course.
        // But for simplicity in this visualizer, we sum them.
        return acc + (c ? c.credits : 0);
    }, 0);

    // --- Tetris Logic ---
    const getEventStyle = (event: SchedulerEvent, allEventsInDay: SchedulerEvent[]) => {
        // Find overlaps
        const overlaps = allEventsInDay.filter(e =>
            e.id !== event.id &&
            Math.max(event.startHour, e.startHour) < Math.min(event.startHour + event.duration, e.startHour + e.duration)
        );

        const totalOverlaps = overlaps.length;
        if (totalOverlaps === 0) return { width: '96%', left: '2%' }; // Default with margin

        // Include self in group to calculate indices
        const group = [event, ...overlaps].sort((a, b) => a.id.localeCompare(b.id)); // Deterministic sort
        const myIndex = group.findIndex(e => e.id === event.id);

        const width = 96 / group.length;
        const left = (width * myIndex) + 2; // +2 for margin

        return {
            width: `${width}%`,
            left: `${left}%`
        };
    };

    if (!isClient) return null;

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            modifiers={[snapCenterToCursor]}
            collisionDetection={closestCenter}
        >
            <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">

                {/* Floating Notifications */}
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-auto pointer-events-none">
                    <AnimatePresence>
                        {notifications.slice(0, 3).map(n => (
                            <motion.div
                                key={n.id}
                                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                                className={`px-6 py-3 rounded-full shadow-2xl border flex items-center gap-3 pointer-events-auto backdrop-blur-md ${n.type === 'error' ? 'bg-white/90 border-red-100 text-red-600' :
                                    n.type === 'success' ? 'bg-white/90 border-green-100 text-green-600' :
                                        'bg-white/90 border-slate-100 text-slate-600'
                                    }`}
                            >
                                {n.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                                <span className="font-semibold text-sm">{n.message}</span>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* --- Sidebar Navigation --- */}
                <aside className={`fixed inset-y-0 left-0 z-40 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:relative lg:translate-x-0 w-64 shadow-xl lg:shadow-none flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="h-16 flex items-center px-6 border-b border-slate-100 justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-indigo-200 shadow-md">
                                <CalendarIcon className="text-white w-5 h-5" />
                            </div>
                            <span className="font-bold text-lg tracking-tight text-slate-800">UniFlow</span>
                        </div>
                        <button className="lg:hidden text-slate-400" onClick={() => setIsSidebarOpen(false)}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-4 space-y-1">
                        <NavItem
                            icon={<CalendarIcon size={20} />}
                            label="My Schedule"
                            active={currentView === 'schedule'}
                            onClick={() => setCurrentView('schedule')}
                        />
                        <NavItem
                            icon={<BookOpen size={20} />}
                            label="Course Catalog"
                            active={currentView === 'courses'}
                            onClick={() => setCurrentView('courses')}
                        />
                        <NavItem
                            icon={<Settings size={20} />}
                            label="Settings"
                            active={currentView === 'settings'}
                            onClick={() => setCurrentView('settings')}
                        />
                    </div>

                    <div className="mt-auto p-6 border-t border-slate-100">
                        {/* Weekly Credit Goal */}
                        <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-xl p-4 mb-6 shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-xs font-bold text-indigo-800 uppercase">Weekly Credits</p>
                                <span className="text-xs font-bold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">{totalCredits} / 18</span>
                            </div>
                            <div className="w-full bg-indigo-100 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-indigo-600 h-full rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${Math.min((totalCredits / 18) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>

                        <button className="flex items-center gap-3 w-full hover:bg-slate-50 p-2 rounded-lg transition-colors group">
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                                <User size={20} className="text-slate-500" />
                            </div>
                            <div className="overflow-hidden text-left">
                                <p className="text-sm font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">Student Account</p>
                                <p className="text-xs text-slate-500 truncate">Generic University</p>
                            </div>
                        </button>
                    </div>
                </aside>

                {/* --- Main Content Area --- */}
                <main className="flex-1 flex flex-col min-w-0 bg-slate-50/50 relative">

                    {/* Header */}
                    <header className="h-16 px-4 md:px-8 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30">
                        <div className="flex items-center gap-4">
                            <button className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors" onClick={() => setIsSidebarOpen(true)}>
                                <Menu size={20} />
                            </button>
                            <h1 className="text-xl font-bold text-slate-800 animate-fade-in-up">
                                {currentView === 'schedule' ? 'Weekly Schedule' : currentView === 'courses' ? 'Course Catalog' : 'Preferences'}
                            </h1>
                        </div>

                        <div className="flex items-center gap-3 md:gap-6">
                            <div className="relative hidden md:block group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search courses..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2 bg-slate-100 border border-transparent focus:bg-white focus:border-indigo-200 focus:ring-4 focus:ring-indigo-500/10 rounded-full text-sm w-64 transition-all outline-none"
                                />
                            </div>

                            <div className="relative">
                                <button
                                    onClick={() => setShowNotificationList(!showNotificationList)}
                                    className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
                                >
                                    <Bell size={20} />
                                    {notifications.length > 0 && (
                                        <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
                                    )}
                                </button>
                                {/* Notification Dropdown */}
                                {showNotificationList && (
                                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-50">
                                        <h4 className="text-xs font-bold text-slate-400 px-3 py-2 uppercase">Recent Activity</h4>
                                        {notifications.map(n => (
                                            <div key={n.id} className="text-sm px-3 py-2 hover:bg-slate-50 rounded-lg flex gap-2 border-b border-slate-50 last:border-0">
                                                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${n.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                                <span className="text-slate-700">{n.message}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="h-8 w-[1px] bg-slate-200 hidden md:block"></div>

                            <button
                                onClick={addStudySession}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-indigo-700 transition flex items-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95"
                            >
                                <Plus size={16} />
                                <span className="hidden sm:inline">Add Study Block</span>
                            </button>
                        </div>
                    </header>

                    {/* View Routing */}
                    <div className="flex-1 overflow-hidden relative">
                        <AnimatePresence mode='wait'>
                            {currentView === 'schedule' && (
                                <motion.div
                                    key="schedule"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute inset-0 flex"
                                >
                                    {/* --- Calendar Grid --- */}
                                    <div className="flex-1 overflow-auto p-4 md:p-6 custom-scrollbar">
                                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 min-w-[800px] flex flex-col">
                                            {/* Days Header */}
                                            <div className="grid grid-cols-[60px_1fr] border-b border-slate-100">
                                                <div className="bg-slate-50/50 p-4 border-r border-slate-100"></div>
                                                <div className="grid grid-cols-5">
                                                    {DAYS.map((day, idx) => (
                                                        <div key={day} className="py-4 text-center border-r border-slate-100 last:border-r-0 hover:bg-slate-50/50 transition-colors">
                                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{day}</span>
                                                            <div className={`text-xl font-bold mt-1 w-8 h-8 rounded-full flex items-center justify-center mx-auto ${idx === 1 ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-800'}`}>
                                                                {12 + idx}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Grid Body */}
                                            <div className="grid grid-cols-[60px_1fr] flex-1">
                                                {/* Times */}
                                                <div className="border-r border-slate-100 bg-slate-50/30">
                                                    {HOURS.map(hour => (
                                                        <div key={hour} className="h-24 relative border-b border-slate-100/50 last:border-b-0">
                                                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-medium text-slate-400 bg-slate-50 px-1">
                                                                {hour > 12 ? hour - 12 : hour} {hour >= 12 ? 'pm' : 'am'}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Columns */}
                                                <div className="grid grid-cols-5 relative bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5">
                                                    {/* Horizontal Lines */}
                                                    <div className="absolute inset-0 grid grid-rows-[repeat(13,6rem)] pointer-events-none z-0">
                                                        {HOURS.map((_, i) => (
                                                            <div key={i} className="border-b border-slate-100/60 w-full group"></div>
                                                        ))}
                                                    </div>

                                                    {DAYS.map((day, dayIdx) => (
                                                        <div key={day} className="relative border-r border-slate-100 last:border-r-0 z-10 group">

                                                            {/* Red Current Time Line */}
                                                            {mounted && (() => {
                                                                const currentDayIdx = now.getDay();
                                                                const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                                                                if (dayMap[currentDayIdx] === day) {
                                                                    const currentHour = now.getHours() + now.getMinutes() / 60;
                                                                    if (currentHour >= 8 && currentHour <= 21) {
                                                                        const topRem = (currentHour - 8) * 6;
                                                                        return (
                                                                            <div
                                                                                className="absolute left-0 right-0 h-[2px] bg-red-400 z-50 pointer-events-none flex items-center shadow-[0_0_8px_rgba(248,113,113,0.6)]"
                                                                                style={{ top: `${topRem}rem` }}
                                                                            >
                                                                                <div className="w-2 h-2 bg-red-500 rounded-full -ml-1 shadow-sm"></div>
                                                                            </div>
                                                                        );
                                                                    }
                                                                }
                                                                return null;
                                                            })()}

                                                            {HOURS.map(hour => (
                                                                <DroppableSlot key={`${day}-${hour}`} id={`${day}-${hour}`} />
                                                            ))}

                                                            {/* Events */}
                                                            {events.filter(e => e.day === day).map(event => {
                                                                const course = getCourse(event.courseId);
                                                                if (!course) return null;
                                                                const { width, left } = getEventStyle(event, events.filter(e => e.day === day));

                                                                return (
                                                                    <DraggableGridEvent
                                                                        key={event.id}
                                                                        event={event}
                                                                        course={course}
                                                                        style={{ width, left }}
                                                                        onDelete={(e) => deleteEvent(event.id, e)}
                                                                    />
                                                                );
                                                            })}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* --- Right Sidebar (Course List) --- */}
                                    <div className="w-80 bg-white border-l border-slate-200 flex flex-col z-20 shadow-xl lg:shadow-none hidden xl:flex">
                                        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                                            <h2 className="font-bold text-slate-800 flex items-center gap-2">
                                                <BookOpen size={18} className="text-indigo-600" />
                                                Class Bench
                                            </h2>
                                            <p className="text-xs text-slate-500 mt-1">Drag these onto your schedule.</p>
                                        </div>
                                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                            {filteredCourses.length === 0 && (
                                                <div className="text-center py-10 text-slate-400 text-sm">No courses found.</div>
                                            )}
                                            {filteredCourses.map(course => (
                                                <DraggableCourse key={course.id} course={course} />
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* ... Courses and Settings Views ... */}
                            {currentView === 'courses' && (
                                <motion.div
                                    key="courses"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="absolute inset-0 overflow-auto p-8"
                                >
                                    <div className="max-w-4xl mx-auto">
                                        <h2 className="text-3xl font-bold text-slate-900 mb-6">Full Course Catalog</h2>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            {COURSES.map(course => (
                                                <div key={course.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${course.color} ${course.textColor} border ${course.borderColor}`}>
                                                            {course.code}
                                                        </span>
                                                        <span className="text-slate-500 text-sm font-medium">{course.credits} Credits</span>
                                                    </div>
                                                    <h3 className="text-xl font-bold text-slate-900 mb-2">{course.name}</h3>
                                                    <p className="text-slate-600 mb-4">{course.description}</p>
                                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                                            {course.professor.charAt(0)}
                                                        </div>
                                                        {course.professor}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {currentView === 'settings' && (
                                <motion.div
                                    key="settings"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.05 }}
                                    className="absolute inset-0 flex items-center justify-center p-4"
                                >
                                    <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                                        <div className="p-8 border-b border-slate-50 text-center">
                                            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                                                <Settings size={32} />
                                            </div>
                                            <h2 className="text-2xl font-bold text-slate-900">Preferences</h2>
                                            <div className="p-6 space-y-4 text-left">
                                                <button onClick={clearAllEvents} className="w-full flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">
                                                    <div>
                                                        <p className="font-bold text-red-900">Clear Schedule</p>
                                                        <p className="text-xs text-red-600">Remove all classes</p>
                                                    </div>
                                                    <Trash2 size={20} className="text-red-500" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>

                </main>
            </div>

            <DragOverlay>
                {activeId ? (
                    <div className="opacity-90 scale-105 rotate-2 cursor-grabbing pointer-events-none">
                        {(() => {
                            const course = getCourse(activeId);
                            if (course) return <CourseCard course={course} isOverlay />;

                            // Check if it's an event ID being dragged
                            const event = events.find(e => e.id === activeId);
                            if (event) {
                                const c = getCourse(event.courseId);
                                if (c) return <CourseCard course={c} isOverlay />;
                            }
                            return null;
                        })()}
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

// --- Components ---

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
    return (
        <button onClick={onClick} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer group text-left ${active ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
            <div className={`transition-transform duration-200 ${active ? '' : 'group-hover:scale-110'}`}>{icon}</div>
            <span className="text-sm hidden lg:block">{label}</span>
            {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600 hidden lg:block animate-pulse"></div>}
        </button>
    );
}

function DraggableCourse({ course }: { course: Course }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: course.id,
        data: { course }
    });

    return (
        <div ref={setNodeRef} {...listeners} {...attributes} className={`touch-none ${isDragging ? 'opacity-30' : ''}`}>
            <CourseCard course={course} />
        </div>
    );
}

function DraggableGridEvent({ event, course, style, onDelete }: { event: SchedulerEvent, course: Course, style: any, onDelete: (e: any) => void }) {
    // Unique ID for the draggable instance on the grid
    // We attach data so we know we are moving an existing event
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: event.id,
        data: { current: { eventId: event.id } }
    });

    return (
        <motion.div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`absolute pt-2 pl-2 pr-1 pb-1 rounded-xl border shadow-sm group overflow-hidden cursor-grab active:cursor-grabbing hover:shadow-lg hover:index-50 transition-all ${course.color} ${course.borderColor} ${isDragging ? 'opacity-30' : ''}`}
            style={{
                top: `${(event.startHour - 8) * 6}rem`,
                height: `${event.duration * 6}rem`,
                ...style,
                zIndex: isDragging ? 100 : 10
            }}
        >
            <div className="flex justify-between items-start h-full flex-col">
                <div className="w-full flex justify-between items-start">
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-white/60 backdrop-blur-sm ${course.textColor}`}>
                        {course.code}
                    </span>
                    <button
                        onClick={onDelete}
                        onPointerDown={(e) => e.stopPropagation()} // Prevent drag start on delete
                        className="w-5 h-5 flex items-center justify-center rounded-full bg-white/50 hover:bg-red-100 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                    >
                        <Trash2 size={12} />
                    </button>
                </div>
                <div>
                    <p className={`text-xs font-bold leading-tight ${course.textColor} line-clamp-2`}>{course.name}</p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500/80 mt-1 font-medium">
                        <Clock size={10} />
                        <span>{event.startHour}:00 - {event.startHour + event.duration}:00</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function CourseCard({ course, isOverlay }: { course: Course, isOverlay?: boolean }) {
    return (
        <div className={`p-4 rounded-xl border transition-all cursor-grab active:cursor-grabbing bg-white relative overflow-hidden ${isOverlay ? 'shadow-2xl border-indigo-300 ring-4 ring-indigo-500/10' : 'shadow-sm border-slate-200 hover:border-indigo-300 hover:shadow-md group'}`}>
            <div className={`absolute top-0 left-0 w-1 h-full ${course.color.replace('bg-', 'bg-').replace('-50', '-400')}`}></div>
            <div className="pl-3">
                <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${course.color} ${course.textColor} border ${course.borderColor}`}>
                        {course.code}
                    </span>
                    {!isOverlay && <MoreVertical size={14} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />}
                </div>
                <h4 className="font-bold text-sm text-slate-800 leading-tight mb-1">{course.name}</h4>
                <div className="flex items-center justify-between mt-3 border-t border-slate-50 pt-2">
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                        {course.professor}
                    </p>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">{course.duration}h</span>
                </div>
            </div>
        </div>
    );
}

function DroppableSlot({ id }: { id: string }) {
    const { isOver, setNodeRef } = useDroppable({ id });

    return (
        <div
            ref={setNodeRef}
            className={`h-24 w-full transition-all duration-300 border-b border-transparent ${isOver ? 'bg-indigo-100/40 shadow-inner' : 'hover:bg-slate-50/40'}`}
        >
            {isOver && (
                <div className="w-full h-full flex items-center justify-center text-indigo-400 font-bold text-xs animate-pulse">
                    Drop Here
                </div>
            )}
        </div>
    );
}
