'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  User, 
  LayoutDashboard, 
  Loader2, 
  Plus, 
  Trash2, 
  GripVertical,
  Save,
  ArrowLeft,
  Settings,
  Layout,
  FileText,
  Briefcase,
  FolderOpen,
  Award,
  Code,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose
} from "lucide-react";
import { ParsedResume } from "@/constants/ResumeFormat";

interface Section {
  id: string;
  type: 'header' | 'about' | 'experience' | 'projects' | 'skills' | 'education' | 'contact';
  layout: 'default' | 'centered' | 'split' | 'cards';
  visible: boolean;
  data?: Record<string, unknown>;
  style?: {
    fontSize?: 'small' | 'medium' | 'large';
    fontWeight?: 'normal' | 'medium' | 'bold';
    spacing?: 'compact' | 'normal' | 'spacious';
  };
}

const sectionComponents = {
  header: { icon: User, label: 'Header', description: 'Name and title section' },
  about: { icon: FileText, label: 'About', description: 'Professional summary' },
  experience: { icon: Briefcase, label: 'Experience', description: 'Work history' },
  projects: { icon: FolderOpen, label: 'Projects', description: 'Portfolio projects' },
  skills: { icon: Code, label: 'Skills', description: 'Technical skills' },
  education: { icon: Award, label: 'Education', description: 'Academic background' },
  contact: { icon: User, label: 'Contact', description: 'Contact information' }
};

export default function CustomizePage() {
  const router = useRouter();
  const info = useUser();
  const session = createClient();
  const [resumeData, setResumeData] = useState<ParsedResume | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('#2563EB');
  const [displayMode, setDisplayMode] = useState<'light' | 'dark'>('light');
  const [isLoading, setIsLoading] = useState(true);
  const [draggedSection, setDraggedSection] = useState<string | null>(null);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

  useEffect(() => {
    const storedData = localStorage.getItem('resumeData');
    const storedColor = localStorage.getItem('selectedColor');
    const storedMode = localStorage.getItem('selectedMode') as ('light'|'dark') | null;
    
    if (storedData) {
      const parsed = JSON.parse(storedData) as ParsedResume;
      setResumeData(parsed);
      
      // Initialize sections from resume data
      const initialSections: Section[] = [
        { id: '1', type: 'header', layout: 'centered', visible: true },
        { id: '2', type: 'about', layout: 'default', visible: true },
        { id: '3', type: 'experience', layout: 'default', visible: true },
        { id: '4', type: 'projects', layout: 'cards', visible: true },
        { id: '5', type: 'skills', layout: 'default', visible: true },
        { id: '6', type: 'education', layout: 'default', visible: true },
        { id: '7', type: 'contact', layout: 'split', visible: true }
      ];
      setSections(initialSections);
    } else {
      router.push('/upload');
    }

    if (storedColor) setSelectedColor(storedColor);
    if (storedMode) setDisplayMode(storedMode);
    
    setIsLoading(false);
  }, [router]);

  // Sync selectedSection with sections array when sections change
  useEffect(() => {
    if (selectedSection) {
      const updatedSection = sections.find(s => s.id === selectedSection.id);
      if (updatedSection) {
        setSelectedSection(updatedSection);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections]);

  const handleSignOut = async () => {
    await session.auth.signOut();
    router.push('/signin');
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleAddSection = (type: Section['type']) => {
    const newSection: Section = {
      id: Date.now().toString(),
      type,
      layout: 'default',
      visible: true
    };
    setSections([...sections, newSection]);
  };

  const handleRemoveSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
    if (selectedSection?.id === id) {
      setSelectedSection(null);
    }
  };


  const handleDragStart = (e: React.DragEvent, sectionId: string) => {
    setDraggedSection(sectionId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedSection || draggedSection === targetId) return;

    const draggedIndex = sections.findIndex(s => s.id === draggedSection);
    const targetIndex = sections.findIndex(s => s.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newSections = [...sections];
    const [removed] = newSections.splice(draggedIndex, 1);
    newSections.splice(targetIndex, 0, removed);
    
    setSections(newSections);
    setDraggedSection(null);
  };

  const handleDragEnd = () => {
    setDraggedSection(null);
  };

  const handleLayoutChange = (id: string, layout: Section['layout']) => {
    setSections(sections.map(s => s.id === id ? { ...s, layout } : s));
  };

  const handleStyleChange = (id: string, styleKey: string, value: string) => {
    setSections(sections.map(s => 
      s.id === id 
        ? { ...s, style: { ...s.style, [styleKey]: value } } 
        : s
    ));
  };

  const handleTextEdit = (sectionId: string, field: string, value: string) => {
    if (!resumeData) return;
    
    const newData = { ...resumeData };
    // Update the resume data based on field path
    if (field === 'name') {
      newData.personal_information.full_name = value;
    } else if (field === 'title') {
      newData.overview.career_name = value;
    } else if (field === 'summary') {
      newData.overview.resume_summary = value;
    }
    
    setResumeData(newData);
    localStorage.setItem('resumeData', JSON.stringify(newData));
  };

  const handlePreview = () => {
    localStorage.setItem('customSections', JSON.stringify(sections));
    localStorage.setItem('selectedColor', selectedColor);
    localStorage.setItem('selectedMode', displayMode);
    router.push('/preview');
  };

  const colorOptions = [
    { id: 'blue', value: '#2563EB', label: 'Blue' },
    { id: 'teal', value: '#0F766E', label: 'Teal' },
    { id: 'purple', value: '#7C3AED', label: 'Purple' },
    { id: 'red', value: '#EF4444', label: 'Red' },
    { id: 'amber', value: '#F59E0B', label: 'Amber' },
  ];

  if (info.loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!info.user) {
    router.push('/signin');
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="container-base">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-8">
              <div>
                <h1 className="text-xl font-bold gradient-text">Foliage</h1>
              </div>
              
              <nav className="hidden md:flex items-center gap-1">
                <Button
                  variant="ghost"
                  className="gap-2"
                  onClick={() => handleNavigation('/dashboard')}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Button>
                <Button
                  variant="ghost"
                  className="gap-2"
                  onClick={() => handleNavigation('/profile')}
                >
                  <User className="w-4 h-4" />
                  Profile
                </Button>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                  <User className="w-3 h-3 text-emerald-700" />
                </div>
                <span className="text-sm font-medium">{info.user.email?.split('@')[0]}</span>
              </div>
              <Button onClick={handleSignOut} variant="outline" size="sm">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Editor Canvas - Full Screen */}
      <main className="h-[calc(100vh-73px)] overflow-hidden">
        <div className="h-full flex">
            {/* Left Sidebar - Component Library & Sections */}
            <div className={`transition-all duration-300 bg-background border-r ${leftSidebarOpen ? 'w-80' : 'w-0'} overflow-hidden flex flex-col`}>
              <div className="flex-1 overflow-y-auto">
                {/* Components Section */}
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Layout className="w-4 h-4" />
                    Components
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">Click to add sections</p>
                  <div className="space-y-1.5">
                    {Object.entries(sectionComponents).map(([type, config]) => {
                      const Icon = config.icon;
                      const alreadyAdded = sections.some(s => s.type === type);
                      return (
                        <Button
                          key={type}
                          variant="outline"
                          className="w-full justify-start gap-2 h-auto py-2 text-sm"
                          onClick={() => !alreadyAdded && handleAddSection(type as Section['type'])}
                          disabled={alreadyAdded}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="flex-1 text-left">{config.label}</span>
                          {alreadyAdded && <Badge variant="secondary" className="text-xs">✓</Badge>}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Sections List */}
                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <GripVertical className="w-4 h-4" />
                    Your Sections
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">Drag to reorder</p>
                  <div className="space-y-1.5">
                    {sections.length === 0 ? (
                      <div className="text-center py-4">
                        <Layout className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">
                          Add components above
                        </p>
                      </div>
                    ) : (
                      <>
                        {sections.map((section) => {
                          const config = sectionComponents[section.type];
                          const Icon = config.icon;
                          const isDragging = draggedSection === section.id;
                          return (
                            <div
                              key={section.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, section.id)}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, section.id)}
                              onDragEnd={handleDragEnd}
                              className={`p-2 rounded border transition-all cursor-move ${
                                isDragging ? 'opacity-50 scale-95' : ''
                              } ${
                                selectedSection?.id === section.id ? 'bg-emerald-50 border-emerald-500' : 'bg-background hover:bg-muted'
                              }`}
                              onClick={() => setSelectedSection(section)}
                            >
                              <div className="flex items-center gap-2">
                                <GripVertical className="w-3 h-3 text-muted-foreground cursor-grab active:cursor-grabbing" />
                                <Icon className="w-3 h-3" style={{ color: selectedColor }} />
                                <span className="flex-1 text-xs font-medium">{config.label}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveSection(section.id);
                                  }}
                                >
                                  <Trash2 className="w-3 h-3 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Toggle Left Sidebar Button */}
            {!leftSidebarOpen && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLeftSidebarOpen(true)}
                className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-md rounded-l-none h-16 w-8 p-0 z-10"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}

            {/* Main Canvas - Preview */}
            <div className="flex-1 overflow-hidden relative">
              {/* Top Toolbar */}
              <div className="absolute top-0 left-0 right-0 bg-background/95 backdrop-blur border-b px-4 py-2 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => router.push('/templates')}
                    className="gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                  {leftSidebarOpen && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLeftSidebarOpen(false)}
                    >
                      <PanelLeftClose className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Color and Display Options */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {colorOptions.map((c) => (
                      <button
                        key={c.id}
                        aria-label={`Choose ${c.label}`}
                        title={c.label}
                        onClick={() => setSelectedColor(c.value)}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${
                          selectedColor === c.value ? 'ring-2 ring-offset-1 ring-black scale-110' : 'border-muted hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.value }}
                      />
                    ))}
                  </div>
                  
                  <div className="inline-flex rounded-lg border bg-background p-0.5">
                    {(['light','dark'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setDisplayMode(mode)}
                        className={`px-2 py-1 text-xs rounded transition-colors ${
                          displayMode === mode ? 'bg-primary text-primary-foreground' : 'hover:bg-emerald-50'
                        }`}
                      >
                        {mode[0].toUpperCase() + mode.slice(1)}
                      </button>
                    ))}
                  </div>

                  {rightSidebarOpen && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setRightSidebarOpen(false)}
                    >
                      <PanelLeftClose className="w-4 h-4 rotate-180" />
                    </Button>
                  )}
                </div>

                <Button onClick={handlePreview} size="sm" className="gap-2">
                  <Save className="w-3 h-3" />
                  Save & Preview
                </Button>
              </div>

              {/* Canvas Preview */}
              <div className="h-full overflow-y-auto pt-14">
                <div 
                  className="min-h-full p-12" 
                  style={{ 
                    backgroundColor: displayMode === 'light' ? '#F8FAFC' : '#0B1220',
                    color: displayMode === 'light' ? '#1a202c' : '#fff'
                  }}
                >
                  {sections.length === 0 ? (
                    <div className="flex items-center justify-center min-h-[70vh]">
                      <div className="text-center">
                        <Layout className="w-20 h-20 mx-auto mb-4 opacity-30" />
                        <p className="text-lg text-muted-foreground mb-2">Start Building Your Portfolio</p>
                        <p className="text-sm text-muted-foreground">Add components from the sidebar to begin</p>
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-4xl mx-auto space-y-8">
                        {sections.map((section) => {
                          const config = sectionComponents[section.type];
                          const Icon = config.icon;
                          
                          // Apply style settings
                          const fontSize = section.style?.fontSize || 'medium';
                          const spacing = section.style?.spacing || 'normal';
                          
                          const headingSizeClasses = {
                            small: 'text-xl',
                            medium: 'text-2xl',
                            large: 'text-3xl'
                          };
                          
                          const textSizeClasses = {
                            small: 'text-xs',
                            medium: 'text-sm',
                            large: 'text-base'
                          };
                          
                          const spacingClasses = {
                            compact: 'p-3 space-y-2',
                            normal: 'p-4 space-y-3',
                            spacious: 'p-6 space-y-4'
                          };
                          
                          return (
                            <div 
                              key={section.id}
                              className={`bg-background/80 backdrop-blur rounded-lg shadow-sm transition-all cursor-pointer hover:shadow-md ${
                                selectedSection?.id === section.id ? 'ring-2 ring-primary shadow-lg' : ''
                              } ${spacingClasses[spacing]}`}
                              onClick={() => setSelectedSection(section)}
                            >
                              {/* Section Header Preview */}
                              {section.type === 'header' && resumeData && (
                                <div className={
                                  section.layout === 'centered' ? 'text-center' :
                                  section.layout === 'split' ? 'flex justify-between items-center' :
                                  section.layout === 'cards' ? 'bg-card p-4 rounded-lg border text-center' :
                                  'text-left'
                                }>
                                  <div className={section.layout === 'split' ? 'flex-1' : ''}>
                                    <Input
                                      value={resumeData.personal_information?.full_name || ''}
                                      onChange={(e) => handleTextEdit(section.id, 'name', e.target.value)}
                                      className={`font-bold mb-2 border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0 ${
                                        fontSize === 'small' ? 'text-2xl' : fontSize === 'large' ? 'text-5xl' : 'text-4xl'
                                      }`}
                                      style={{ color: selectedColor }}
                                      placeholder="Your Name"
                                    />
                                    <Input
                                      value={resumeData.overview?.career_name || ''}
                                      onChange={(e) => handleTextEdit(section.id, 'title', e.target.value)}
                                      className={`text-muted-foreground border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0 ${
                                        fontSize === 'small' ? 'text-base' : fontSize === 'large' ? 'text-2xl' : 'text-xl'
                                      }`}
                                      placeholder="Your Title"
                                    />
                                  </div>
                                  {section.layout === 'split' && (
                                    <div className={`text-right ${textSizeClasses[fontSize]}`}>
                                      <p>{resumeData.personal_information?.contact_info?.email}</p>
                                      <p>{resumeData.personal_information?.contact_info?.phone}</p>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* About Section Preview */}
                              {section.type === 'about' && resumeData && (
                                <div>
                                  <h2 className={`font-bold flex items-center gap-2 ${headingSizeClasses[fontSize]} ${
                                    section.layout === 'centered' ? 'justify-center' : ''
                                  }`} style={{ color: selectedColor }}>
                                    <Icon className="w-6 h-6" />
                                    About
                                  </h2>
                                  <Textarea
                                    value={resumeData.overview?.resume_summary || ''}
                                    onChange={(e) => handleTextEdit(section.id, 'summary', e.target.value)}
                                    className={`text-muted-foreground leading-relaxed min-h-[100px] border-0 bg-transparent px-0 focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 resize-none ${textSizeClasses[fontSize]} ${
                                      section.layout === 'centered' ? 'text-center' :
                                      section.layout === 'cards' ? 'bg-card p-4 rounded-lg border' :
                                      ''
                                    }`}
                                    placeholder="Your professional summary will appear here..."
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                              )}

                              {/* Experience Section Preview */}
                              {section.type === 'experience' && resumeData && (
                                <div>
                                  <h2 className={`font-bold flex items-center gap-2 ${headingSizeClasses[fontSize]}`} style={{ color: selectedColor }}>
                                    <Icon className="w-6 h-6" />
                                    Experience
                                  </h2>
                                  <div className={
                                    section.layout === 'cards' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' :
                                    section.layout === 'split' ? 'grid grid-cols-2 gap-4' :
                                    'space-y-4'
                                  }>
                                    {resumeData.experience?.slice(0, 2).map((exp, i) => (
                                      <div 
                                        key={i} 
                                        className={
                                          section.layout === 'cards' ? 'p-4 border rounded-lg bg-card shadow-sm' : 
                                          section.layout === 'centered' ? 'text-center p-3 border-b' :
                                          'border-l-2 pl-4'
                                        } 
                                        style={{ borderColor: section.layout !== 'cards' ? selectedColor : undefined }}
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <Input
                                          value={exp.company}
                                          className={`font-semibold border-0 bg-transparent px-0 focus-visible:ring-1 focus-visible:ring-primary ${textSizeClasses[fontSize]}`}
                                          onChange={(e) => {
                                            const newData = {...resumeData};
                                            newData.experience[i].company = e.target.value;
                                            setResumeData(newData);
                                            localStorage.setItem('resumeData', JSON.stringify(newData));
                                          }}
                                        />
                                        <Input
                                          value={exp.employed_dates}
                                          className="text-muted-foreground border-0 bg-transparent px-0 text-xs focus-visible:ring-1 focus-visible:ring-primary"
                                          onChange={(e) => {
                                            const newData = {...resumeData};
                                            newData.experience[i].employed_dates = e.target.value;
                                            setResumeData(newData);
                                            localStorage.setItem('resumeData', JSON.stringify(newData));
                                          }}
                                        />
                                        <Textarea
                                          value={exp.description}
                                          className={`mt-2 border-0 bg-transparent px-0 focus-visible:ring-1 focus-visible:ring-primary resize-none min-h-[60px] ${textSizeClasses[fontSize]}`}
                                          onChange={(e) => {
                                            const newData = {...resumeData};
                                            newData.experience[i].description = e.target.value;
                                            setResumeData(newData);
                                            localStorage.setItem('resumeData', JSON.stringify(newData));
                                          }}
                                        />
                                      </div>
                                    )) || <p className="text-muted-foreground">No experience data yet</p>}
                                  </div>
                                </div>
                              )}

                              {/* Projects Section Preview */}
                              {section.type === 'projects' && resumeData && (
                                <div>
                                  <h2 className={`font-bold flex items-center gap-2 ${headingSizeClasses[fontSize]}`} style={{ color: selectedColor }}>
                                    <Icon className="w-6 h-6" />
                                    Projects
                                  </h2>
                                  <div className={
                                    section.layout === 'cards' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' :
                                    section.layout === 'split' ? 'grid grid-cols-2 gap-4' :
                                    'space-y-3'
                                  }>
                                    {resumeData.projects?.slice(0, 2).map((proj, i) => (
                                      <div 
                                        key={i} 
                                        className={
                                          section.layout === 'cards' ? 'p-4 border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow' : 
                                          section.layout === 'centered' ? 'text-center p-3' :
                                          'p-2'
                                        }
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <Input
                                          value={proj.title}
                                          className={`font-semibold border-0 bg-transparent px-0 focus-visible:ring-1 focus-visible:ring-primary ${textSizeClasses[fontSize]}`}
                                          style={{ color: selectedColor }}
                                          onChange={(e) => {
                                            const newData = {...resumeData};
                                            newData.projects[i].title = e.target.value;
                                            setResumeData(newData);
                                            localStorage.setItem('resumeData', JSON.stringify(newData));
                                          }}
                                        />
                                        <Textarea
                                          value={proj.description}
                                          className={`text-muted-foreground mt-1 border-0 bg-transparent px-0 focus-visible:ring-1 focus-visible:ring-primary resize-none min-h-[50px] ${textSizeClasses[fontSize]}`}
                                          onChange={(e) => {
                                            const newData = {...resumeData};
                                            newData.projects[i].description = e.target.value;
                                            setResumeData(newData);
                                            localStorage.setItem('resumeData', JSON.stringify(newData));
                                          }}
                                        />
                                      </div>
                                    )) || <p className="text-muted-foreground">No projects data yet</p>}
                                  </div>
                                </div>
                              )}

                              {/* Skills Section Preview */}
                              {section.type === 'skills' && resumeData && (
                                <div>
                                  <h2 className={`font-bold flex items-center gap-2 ${headingSizeClasses[fontSize]}`} style={{ color: selectedColor }}>
                                    <Icon className="w-6 h-6" />
                                    Skills
                                  </h2>
                                  <div 
                                    className={
                                      section.layout === 'cards' ? 'grid grid-cols-3 md:grid-cols-4 gap-2' :
                                      section.layout === 'centered' ? 'flex flex-wrap gap-2 justify-center' :
                                      section.layout === 'split' ? 'grid grid-cols-2 gap-2' :
                                      'flex flex-wrap gap-2'
                                    }
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {resumeData.skills?.map((skill, i) => (
                                      <div key={i} className="relative group">
                                        <Input
                                          value={skill}
                                          className={`border rounded-md px-2 py-1 pr-6 text-center focus-visible:ring-1 focus-visible:ring-primary ${textSizeClasses[fontSize]}`}
                                          style={{ 
                                            backgroundColor: `${selectedColor}20`,
                                            color: selectedColor,
                                            borderColor: selectedColor
                                          }}
                                          onChange={(e) => {
                                            const newData = {...resumeData};
                                            newData.skills[i] = e.target.value;
                                            setResumeData(newData);
                                            localStorage.setItem('resumeData', JSON.stringify(newData));
                                          }}
                                        />
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const newData = {...resumeData};
                                            newData.skills = newData.skills.filter((_, index) => index !== i);
                                            setResumeData(newData);
                                            localStorage.setItem('resumeData', JSON.stringify(newData));
                                          }}
                                          className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                                          style={{ color: selectedColor }}
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    )) || <p className="text-muted-foreground">No skills data yet</p>}
                                    
                                    {/* Add Skill Button */}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className={`border-dashed ${textSizeClasses[fontSize]}`}
                                      style={{ borderColor: selectedColor, color: selectedColor }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const newData = {...resumeData};
                                        if (!newData.skills) newData.skills = [];
                                        newData.skills.push('New Skill');
                                        setResumeData(newData);
                                        localStorage.setItem('resumeData', JSON.stringify(newData));
                                      }}
                                    >
                                      <Plus className="w-3 h-3 mr-1" />
                                      Add Skill
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {/* Education Section Preview */}
                              {section.type === 'education' && resumeData && (
                                <div>
                                  <h2 className={`font-bold flex items-center gap-2 ${headingSizeClasses[fontSize]}`} style={{ color: selectedColor }}>
                                    <Icon className="w-6 h-6" />
                                    Education
                                  </h2>
                                  <div className={section.layout === 'centered' ? 'text-center' : ''} onClick={(e) => e.stopPropagation()}>
                                    <Input
                                      value={resumeData.personal_information?.education?.school || ''}
                                      className={`font-semibold border-0 bg-transparent px-0 focus-visible:ring-1 focus-visible:ring-primary ${textSizeClasses[fontSize]}`}
                                      placeholder="School Name"
                                      onChange={(e) => {
                                        const newData = {...resumeData};
                                        if (!newData.personal_information.education) {
                                          newData.personal_information.education = { school: '', majors: [], minors: [], expected_grad: '' };
                                        }
                                        newData.personal_information.education.school = e.target.value;
                                        setResumeData(newData);
                                        localStorage.setItem('resumeData', JSON.stringify(newData));
                                      }}
                                    />
                                    <Input
                                      value={resumeData.personal_information?.education?.majors?.join(', ') || ''}
                                      className={`text-muted-foreground border-0 bg-transparent px-0 focus-visible:ring-1 focus-visible:ring-primary ${textSizeClasses[fontSize]}`}
                                      placeholder="Major(s)"
                                      onChange={(e) => {
                                        const newData = {...resumeData};
                                        if (!newData.personal_information.education) {
                                          newData.personal_information.education = { school: '', majors: [], minors: [], expected_grad: '' };
                                        }
                                        newData.personal_information.education.majors = e.target.value.split(',').map(m => m.trim());
                                        setResumeData(newData);
                                        localStorage.setItem('resumeData', JSON.stringify(newData));
                                      }}
                                    />
                                    <Input
                                      value={resumeData.personal_information?.education?.expected_grad || ''}
                                      className={`text-muted-foreground border-0 bg-transparent px-0 focus-visible:ring-1 focus-visible:ring-primary ${textSizeClasses[fontSize]}`}
                                      placeholder="Graduation Date"
                                      onChange={(e) => {
                                        const newData = {...resumeData};
                                        if (!newData.personal_information.education) {
                                          newData.personal_information.education = { school: '', majors: [], minors: [], expected_grad: '' };
                                        }
                                        newData.personal_information.education.expected_grad = e.target.value;
                                        setResumeData(newData);
                                        localStorage.setItem('resumeData', JSON.stringify(newData));
                                      }}
                                    />
                                  </div>
                                </div>
                              )}

                              {/* Contact Section Preview */}
                              {section.type === 'contact' && resumeData && (
                                <div>
                                  <h2 className={`font-bold flex items-center gap-2 ${headingSizeClasses[fontSize]}`} style={{ color: selectedColor }}>
                                    <Icon className="w-6 h-6" />
                                    Contact
                                  </h2>
                                  <div className={section.layout === 'split' ? 'grid grid-cols-2 gap-4' : 'space-y-2'} onClick={(e) => e.stopPropagation()}>
                                    <Input
                                      value={resumeData.personal_information?.contact_info?.email || ''}
                                      className={`border-0 bg-transparent px-0 focus-visible:ring-1 focus-visible:ring-primary ${textSizeClasses[fontSize]}`}
                                      placeholder="email@example.com"
                                      onChange={(e) => {
                                        const newData = {...resumeData};
                                        newData.personal_information.contact_info.email = e.target.value;
                                        setResumeData(newData);
                                        localStorage.setItem('resumeData', JSON.stringify(newData));
                                      }}
                                    />
                                    <Input
                                      value={resumeData.personal_information?.contact_info?.phone || ''}
                                      className={`border-0 bg-transparent px-0 focus-visible:ring-1 focus-visible:ring-primary ${textSizeClasses[fontSize]}`}
                                      placeholder="Phone"
                                      onChange={(e) => {
                                        const newData = {...resumeData};
                                        newData.personal_information.contact_info.phone = e.target.value;
                                        setResumeData(newData);
                                        localStorage.setItem('resumeData', JSON.stringify(newData));
                                      }}
                                    />
                                    <Input
                                      value={resumeData.personal_information?.contact_info?.address || ''}
                                      className={`border-0 bg-transparent px-0 focus-visible:ring-1 focus-visible:ring-primary ${textSizeClasses[fontSize]}`}
                                      placeholder="Address"
                                      onChange={(e) => {
                                        const newData = {...resumeData};
                                        newData.personal_information.contact_info.address = e.target.value;
                                        setResumeData(newData);
                                        localStorage.setItem('resumeData', JSON.stringify(newData));
                                      }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Toggle Right Sidebar Button */}
            {!rightSidebarOpen && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRightSidebarOpen(true)}
                className="absolute right-0 top-1/2 -translate-y-1/2 rounded-l-md rounded-r-none h-16 w-8 p-0 z-10"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}

            {/* Right Sidebar - Section Editor */}
            <div className={`transition-all duration-300 bg-background border-l ${rightSidebarOpen ? 'w-80' : 'w-0'} overflow-hidden`}>
              <div className="h-full flex flex-col">
                {/* Section Editor - Fixed Position */}
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Properties
                    </h3>
                  </div>
                  
                  {selectedSection ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-medium mb-2 text-muted-foreground">EDITING</p>
                        <p className="text-sm font-semibold">{sectionComponents[selectedSection.type].label}</p>
                      </div>

                      {/* Layout Options */}
                      <div>
                        <Label className="text-xs font-semibold mb-2 block">Layout</Label>
                        <div className="grid grid-cols-2 gap-2" key={`layout-${selectedSection.layout}`}>
                          {['default', 'centered', 'split', 'cards'].map((layout) => {
                            const isSelected = selectedSection.layout === layout;
                            return (
                              <Button
                                key={`${layout}-${isSelected}`}
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleLayoutChange(selectedSection.id, layout as Section['layout']);
                                }}
                                className="capitalize text-xs h-8 transition-all"
                                style={{
                                  backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
                                  color: isSelected ? '#fff' : 'inherit',
                                  borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)'
                                }}
                              >
                                {layout}
                              </Button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Size Options */}
                      <div>
                        <Label className="text-xs font-semibold mb-2 block">Text Size</Label>
                        <div className="grid grid-cols-3 gap-2" key={`size-${selectedSection.style?.fontSize || 'medium'}`}>
                          {['small', 'medium', 'large'].map((size) => {
                            const isSelected = (selectedSection.style?.fontSize || 'medium') === size;
                            return (
                              <Button
                                key={`${size}-${isSelected}`}
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleStyleChange(selectedSection.id, 'fontSize', size);
                                }}
                                className="capitalize text-xs h-8 transition-all"
                                style={{
                                  backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
                                  color: isSelected ? '#fff' : 'inherit',
                                  borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)'
                                }}
                              >
                                {size}
                              </Button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Spacing Options */}
                      <div>
                        <Label className="text-xs font-semibold mb-2 block">Spacing</Label>
                        <div className="grid grid-cols-3 gap-2" key={`spacing-${selectedSection.style?.spacing || 'normal'}`}>
                          {['compact', 'normal', 'spacious'].map((spacing) => {
                            const isSelected = (selectedSection.style?.spacing || 'normal') === spacing;
                            return (
                              <Button
                                key={`${spacing}-${isSelected}`}
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleStyleChange(selectedSection.id, 'spacing', spacing);
                                }}
                                className="capitalize text-xs h-8 transition-all"
                                style={{
                                  backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
                                  color: isSelected ? '#fff' : 'inherit',
                                  borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)'
                                }}
                              >
                                {spacing}
                              </Button>
                            );
                          })}
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedSection(null)}
                        className="w-full"
                      >
                        Deselect
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-xs text-muted-foreground">
                      Click a section in the canvas to edit its properties
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
      </main>
    </div>
  );
}

