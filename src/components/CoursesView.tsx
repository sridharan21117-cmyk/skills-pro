import React, { useState, useEffect } from 'react';
import {
  BookOpen, Search, Filter, PlayCircle, CheckCircle2, Clock, Award, Star,
  User as UserIcon, X, ArrowRight, ShieldCheck
} from 'lucide-react';
import { Course, Lesson, Enrollment, User } from '../types';
import { courseService } from '../services/api';
import { BackButton } from './BackButton';
import { Breadcrumbs } from './Breadcrumbs';

interface CoursesViewProps {
  user: User;
  onRefreshCourses: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const CoursesView: React.FC<CoursesViewProps> = ({ user, onRefreshCourses, onNavigateTab }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<(Course & { lessons: Lesson[] }) | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [myEnrollments, setMyEnrollments] = useState<Record<string, Enrollment>>({});

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCoursesData();
  }, []);

  const loadCoursesData = async () => {
    setLoading(true);
    try {
      const [allCourses, myEnrolled] = await Promise.all([
        courseService.getCourses(),
        courseService.getMyCourses()
      ]);

      setCourses(allCourses);

      const map: Record<string, Enrollment> = {};
      myEnrolled.forEach(e => {
        map[e.courseId] = e;
      });
      setMyEnrollments(map);
    } catch (e) {
      console.error('Failed to load courses', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCourse = async (courseId: string) => {
    try {
      const details = await courseService.getCourseDetails(courseId);
      setSelectedCourse(details);
      if (details.lessons && details.lessons.length > 0) {
        setActiveLesson(details.lessons[0]);
      }
    } catch (e) {
      console.error('Failed to fetch course details', e);
    }
  };

  const handleEnroll = async (courseId: string) => {
    try {
      const enrollment = await courseService.enrollCourse(courseId);
      setMyEnrollments(prev => ({ ...prev, [courseId]: enrollment }));
      onRefreshCourses();
    } catch (e) {
      console.error('Failed to enroll', e);
    }
  };

  const handleCompleteLesson = async (lessonId: string) => {
    try {
      const updatedEnrollment = await courseService.completeLesson(lessonId);
      if (selectedCourse) {
        setMyEnrollments(prev => ({ ...prev, [selectedCourse.id]: updatedEnrollment }));
      }
      onRefreshCourses();
    } catch (e) {
      console.error('Failed to mark lesson complete', e);
    }
  };

  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
                          c.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesLevel = selectedLevel === 'All' || c.level === selectedLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const categories = ['All', 'Computer Science', 'Web Development', 'Placement Prep', 'Artificial Intelligence'];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Back & Breadcrumb Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/5 border border-white/10 px-5 py-3 rounded-2xl backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <BackButton
            label="Back to Dashboard"
            onClick={() => {
              if (onNavigateTab) onNavigateTab('dashboard');
              else {
                window.history.pushState({}, '', '/student/dashboard');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }
            }}
          />
          <Breadcrumbs
            items={[
              { label: 'Dashboard', onClick: () => onNavigateTab ? onNavigateTab('dashboard') : null },
              { label: 'Courses Catalog', isCurrent: !selectedCourse }
            ]}
          />
        </div>
        <span className="text-xs text-slate-400 font-mono">
          Showing {filteredCourses.length} Courses
        </span>
      </div>

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            <span>Interactive Courseware Catalog</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1">Master key concepts with structured video lessons, assignments, and verified certificates.</p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search courses..."
              aria-label="Search courses"
              className="w-full pl-9 pr-3 py-2 bg-slate-800/50 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-md placeholder:text-slate-500 min-h-[40px]"
            />
          </div>

          <label htmlFor="category-filter-select" className="sr-only">Filter by Category</label>
          <select
            id="category-filter-select"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-800/50 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-md min-h-[40px]"
            aria-label="Filter by Category"
          >
            {categories.map(cat => (
              <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Courses Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading courseware...</div>
      ) : filteredCourses.length === 0 ? (
        <div className="p-12 bg-white/5 border border-white/10 rounded-3xl text-center space-y-3 backdrop-blur-md">
          <BookOpen className="w-8 h-8 text-indigo-400 mx-auto opacity-70" />
          <h3 className="text-sm font-bold text-white">No Courses Found</h3>
          <p className="text-xs text-slate-400">Try changing your search term or category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => {
            const enrollment = myEnrollments[course.id];
            const isEnrolled = Boolean(enrollment);

            return (
              <div
                key={course.id}
                className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:border-white/20 transition-all flex flex-col justify-between group backdrop-blur-md shadow-xl"
              >
                <div>
                  <div className="relative h-44 overflow-hidden bg-slate-800">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                    <div className="absolute top-3 left-3 flex items-center space-x-2">
                      <span className="text-[10px] font-bold px-2.5 py-1 bg-slate-950/80 backdrop-blur-md text-indigo-300 rounded-full border border-white/10">
                        {course.level}
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-1 bg-slate-950/80 backdrop-blur-md text-amber-300 rounded-full border border-white/10 flex items-center space-x-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>{course.rating || 4.9}</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">{course.category}</span>
                    <h3 className="text-sm font-bold text-white line-clamp-1">{course.title}</h3>
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{course.description}</p>
                    <p className="text-xs text-slate-400 font-medium">Instructor: {course.instructor}</p>
                  </div>
                </div>

                <div className="p-5 pt-0 space-y-3 border-t border-white/10 mt-2">
                  <div className="flex items-center justify-between text-xs text-slate-300 pt-3">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{course.duration}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <UserIcon className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{course.enrolledCount || 1000}+ Enrolled</span>
                    </span>
                  </div>

                  {isEnrolled ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-emerald-300 font-semibold flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Enrolled ({enrollment.progress}%)</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenCourse(course.id)}
                          className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border border-white/20 text-white rounded-xl text-xs font-bold transition shadow-md backdrop-blur-md min-h-[36px]"
                        >
                          Continue
                        </button>
                      </div>
                      <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden border border-white/5">
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all" style={{ width: `${enrollment.progress}%` }} />
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleEnroll(course.id)}
                      className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-2xl transition shadow-lg border border-white/20 backdrop-blur-md flex items-center justify-center space-x-1 min-h-[40px]"
                    >
                      <span>Enroll in Course</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Video Player & Lesson Player Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-slate-900/90 border border-white/15 rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col backdrop-blur-2xl">
            
            {/* Modal Header */}
            <div className="p-4 bg-white/5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 backdrop-blur-md">
              <div className="flex items-center space-x-3">
                <BackButton
                  label="Back to Courses"
                  onClick={() => setSelectedCourse(null)}
                />
                <div>
                  <Breadcrumbs
                    items={[
                      { label: 'Courses', onClick: () => setSelectedCourse(null) },
                      { label: selectedCourse.title, onClick: () => setActiveLesson(selectedCourse.lessons[0] || null) },
                      { label: activeLesson?.title || 'Lessons', isCurrent: true }
                    ]}
                  />
                  <div className="text-sm font-bold text-white mt-0.5">{selectedCourse.title}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedCourse(null)}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition backdrop-blur-md self-end sm:self-center"
                title="Close Course Viewer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Left Video Player, Right Lesson List */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-y-auto">
              
              {/* Video Player & Content */}
              <div className="lg:col-span-2 p-6 space-y-4 border-r border-white/10">
                {activeLesson ? (
                  <div className="space-y-4">
                    <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-xl">
                      <iframe
                        src={activeLesson.videoUrl}
                        title={activeLesson.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-base font-bold text-white">{activeLesson.title}</h4>
                        <p className="text-xs text-slate-300">{activeLesson.duration}</p>
                      </div>

                      <button
                        onClick={() => handleCompleteLesson(activeLesson.id)}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-lg border border-white/20"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Mark Lesson Completed</span>
                      </button>
                    </div>

                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2 backdrop-blur-md">
                      <h5 className="text-xs font-bold text-slate-200">Lesson Overview</h5>
                      <p className="text-xs text-slate-300 leading-relaxed">{activeLesson.description}</p>
                      <div className="pt-2 text-xs text-slate-200 font-mono bg-slate-950/60 p-3 rounded-xl border border-white/10">
                        {activeLesson.content}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center text-xs text-slate-400">Select a lesson to begin learning</div>
                )}
              </div>

              {/* Lesson Playlist */}
              <div className="p-4 space-y-3 bg-white/5 backdrop-blur-md">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Course Lessons</h4>
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {selectedCourse.lessons.map((lesson, idx) => {
                    const isCompleted = myEnrollments[selectedCourse.id]?.completedLessonIds?.includes(lesson.id);
                    const isActive = activeLesson?.id === lesson.id;

                    return (
                      <div
                        key={lesson.id}
                        onClick={() => setActiveLesson(lesson)}
                        className={`p-3 rounded-2xl border text-xs cursor-pointer transition flex items-center justify-between backdrop-blur-md ${
                          isActive
                            ? 'bg-indigo-600/30 border-indigo-400 text-white font-bold shadow-lg'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <span className="w-6 h-6 rounded-full bg-white/10 text-slate-300 flex items-center justify-center font-mono text-[10px]">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="font-semibold line-clamp-1">{lesson.title}</p>
                            <span className="text-[10px] text-slate-400">{lesson.duration}</span>
                          </div>
                        </div>

                        {isCompleted && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
