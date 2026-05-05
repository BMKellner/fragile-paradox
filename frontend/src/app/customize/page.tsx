'use client';

import { useEffect, useMemo, useRef, useState, type DragEvent as ReactDragEvent, type MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useUser } from '@/hooks/use-user';
import { ParsedResume } from '@/constants/ResumeFormat';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DesignOverlay } from '@/components/design/DesignOverlay';
import { DesignSidebar } from '@/components/design/DesignSidebar';
import { SelectedSectionOverlay } from '@/components/design/SelectedSectionOverlay';
import {
  Plus,
  GripVertical,
  Eye,
  Loader2,
  Save,
  X,
  ArrowLeft,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import {
  SectionType,
  canAddSectionType,
  createSectionConfig,
  createDefaultTemplateConfig,
  deserializeTemplateConfig,
  getAddableSectionTypes,
  hasRenderableSectionContent,
  normalizeTemplateConfig,
  reorderSections,
  sectionTitle,
  serializeTemplateConfig,
  updateSectionContent,
  validateTemplateConfig,
  type AboutSectionContent,
  type BlogSectionContent,
  type CertificationsSectionContent,
  type ContactSectionContent,
  type EducationSectionContent,
  type ExperienceSectionContent,
  type HeroSectionContent,
  type ProjectsSectionContent,
  type SectionConfig,
  type SkillsSectionContent,
  type TemplateConfig,
  type TestimonialsSectionContent,
} from '@/lib/template-config';
import { fetchTemplateConfig, saveTemplateConfig } from '@/lib/template-config-api';
import { PortfolioDataWithCustomTemplate } from '@/lib/custom-template';
import { templateComponentMap, templateNames } from '@/lib/template-map';
import { useDesignEditorState } from '@/hooks/use-design-editor-state';
import { isDesignModeAvailableForRuntime, isDesignModeEnabledForUser } from '@/lib/feature-flags';
import { trackTelemetryEvent } from '@/lib/telemetry';
import { createUserTemplate, updateUserTemplate } from '@/lib/user-template-api';
import { findPreviewSectionElement } from '@/lib/preview-section-target';

const LIGHT_BG = '#F8FAFC';
const DARK_BG = '#111111';

const modeBackground = (mode: 'light' | 'dark'): string => (mode === 'light' ? LIGHT_BG : DARK_BG);

const TEMPLATE_RENDERED_SECTIONS: Partial<Record<string, SectionType[]>> = {
  '2': [SectionType.Hero, SectionType.About, SectionType.Projects, SectionType.Experience, SectionType.Contact],
};

const sectionRenderedByTemplate = (templateId: string, type: SectionType): boolean => {
  const allowed = TEMPLATE_RENDERED_SECTIONS[templateId];
  if (!allowed) return true;
  return allowed.includes(type);
};

const parseCommaList = (value: string): string[] =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const parseLineList = (value: string): string[] =>
  value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);

const PREVIEW_SECTION_SELECTOR = '[data-customize-section-id], [data-customize-section-type], section[id]';
const SECTION_TYPE_LOOKUP = new Set<SectionType>(Object.values(SectionType));

const parseSectionType = (candidate: string | undefined): SectionType | null => {
  const normalized = candidate?.trim().toLowerCase();
  if (!normalized) return null;

  if (SECTION_TYPE_LOOKUP.has(normalized as SectionType)) {
    return normalized as SectionType;
  }

  const withoutSuffix = normalized.split(/[-_]/)[0];
  if (SECTION_TYPE_LOOKUP.has(withoutSuffix as SectionType)) {
    return withoutSuffix as SectionType;
  }

  const withoutTrailingDigits = normalized.replace(/[\d\-_]+$/, '');
  if (SECTION_TYPE_LOOKUP.has(withoutTrailingDigits as SectionType)) {
    return withoutTrailingDigits as SectionType;
  }

  return null;
};

const sectionMatchFromPreviewTarget = (
  target: EventTarget | null
): {
  sectionId: string | null;
  sectionType: SectionType | null;
  editPath: string | null;
} | null => {
  if (!(target instanceof HTMLElement)) return null;

  const section = target.closest<HTMLElement>(PREVIEW_SECTION_SELECTOR);
  if (!section) return null;

  const editableTarget = target.closest<HTMLElement>('[data-edit-path]');
  const sectionId = section.dataset.customizeSectionId?.trim() || section.id?.trim() || null;
  const sectionType = parseSectionType(section.dataset.customizeSectionType || sectionId || undefined);
  const editPath = editableTarget?.dataset.editPath?.trim() || null;

  if (!sectionId && !sectionType && !editPath) return null;

  return {
    sectionId,
    sectionType,
    editPath,
  };
};

export default function CustomizePage() {
  const router = useRouter();
  const info = useUser();
  const session = useMemo(() => createClient(), []);
  const editorPanelRef = useRef<HTMLDivElement | null>(null);
  const previewRootRef = useRef<HTMLDivElement | null>(null);

  const [resumeData, setResumeData] = useState<ParsedResume | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('1');
  const [config, setConfig] = useState<TemplateConfig | null>(null);
  const [previewConfig, setPreviewConfig] = useState<TemplateConfig | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);
  const [previewDraggedSectionId, setPreviewDraggedSectionId] = useState<string | null>(null);
  const [previewDropTargetSectionId, setPreviewDropTargetSectionId] = useState<string | null>(null);
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);
  const [designModeEnabled, setDesignModeEnabled] = useState(false);
  const [userTemplateId, setUserTemplateId] = useState<string | null>(null);
  const canUseDesignMode = isDesignModeAvailableForRuntime();

  useEffect(() => {
    const enabled = isDesignModeEnabledForUser();
    setDesignModeEnabled(enabled);
    if (enabled) {
      trackTelemetryEvent({ event: 'design_mode_opened' });
    }

    return () => {
      if (enabled) {
        trackTelemetryEvent({ event: 'design_mode_closed' });
      }
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const load = async () => {
      const storedResume = localStorage.getItem('resumeData');
      const storedTemplate = localStorage.getItem('selectedTemplate') || '1';
      const storedColor = localStorage.getItem('selectedColor') || '#2563EB';
      const storedMode = (localStorage.getItem('selectedMode') as 'light' | 'dark' | null) || 'light';
      const localTemplateConfig = deserializeTemplateConfig(localStorage.getItem('templateConfig'));
      const storedUserTemplateId = localStorage.getItem('currentUserTemplateId');

      if (!storedResume) {
        router.push('/upload');
        return;
      }

      let parsedResume: ParsedResume;
      try {
        parsedResume = JSON.parse(storedResume) as ParsedResume;
      } catch {
        router.push('/upload');
        return;
      }

      if (isCancelled) return;

      setResumeData(parsedResume);
      setSelectedTemplate(storedTemplate);
      setUserTemplateId(storedUserTemplateId);

      let nextConfig = normalizeTemplateConfig({
        templateId: storedTemplate,
        resumeData: parsedResume,
        config: localTemplateConfig,
        fallbackTheme: {
          primaryColor: storedColor,
          mode: storedMode,
          backgroundColor: modeBackground(storedMode),
        },
      });

      const existingPortfolioId = localStorage.getItem('currentPortfolioId');
      if (existingPortfolioId) {
        try {
          const supabaseSession = await session.auth.getSession();
          const token = supabaseSession.data.session?.access_token;
          if (token) {
            const portfolioResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/portfolios/${existingPortfolioId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            if (portfolioResponse.ok) {
              const portfolioPayload = (await portfolioResponse.json()) as { user_template_id?: string | null };
              if (portfolioPayload.user_template_id) {
                setUserTemplateId(portfolioPayload.user_template_id);
                localStorage.setItem('currentUserTemplateId', portfolioPayload.user_template_id);
              }
            }

            const remoteConfig = await fetchTemplateConfig({
              portfolioId: existingPortfolioId,
              token,
            });
            if (remoteConfig) {
              nextConfig = normalizeTemplateConfig({
                templateId: storedTemplate,
                resumeData: parsedResume,
                config: remoteConfig,
                fallbackTheme: {
                  primaryColor: storedColor,
                  mode: storedMode,
                  backgroundColor: modeBackground(storedMode),
                },
              });
            }
          }
        } catch (error) {
          console.error('Error loading saved template config:', error);
        }
      }

      if (isCancelled) return;
      setConfig(nextConfig);
      setPreviewConfig(nextConfig);
      setSelectedSectionId(nextConfig.sections[0]?.id ?? null);
      localStorage.setItem('templateConfig', serializeTemplateConfig(nextConfig));
      setIsLoading(false);
    };

    load();

    return () => {
      isCancelled = true;
    };
  }, [router, session]);

  useEffect(() => {
    if (!config) return;
    localStorage.setItem('templateConfig', serializeTemplateConfig(config));
    localStorage.setItem('selectedColor', config.theme.primaryColor);
    localStorage.setItem('selectedMode', config.theme.mode);
  }, [config]);

  const selectedSection = useMemo(
    () => config?.sections.find((section) => section.id === selectedSectionId) ?? null,
    [config, selectedSectionId]
  );

  const editorSeedConfig = useMemo(
    () =>
      config ??
      createDefaultTemplateConfig({
        templateId: selectedTemplate,
        resumeData: resumeData ?? undefined,
      }),
    [config, resumeData, selectedTemplate]
  );

  const designEditor = useDesignEditorState({
    enabled: designModeEnabled && Boolean(config),
    config: editorSeedConfig,
    storageKey: `design-editor:${selectedTemplate}`,
  });
  const isDesignModeActive = designModeEnabled && Boolean(config);
  const renderedPreviewConfig = isDesignModeActive ? designEditor.resolvedConfig : previewConfig ?? config;
  const reorderablePreviewSections = useMemo(
    () => renderedPreviewConfig?.sections ?? [],
    [renderedPreviewConfig]
  );
  const selectedDesignSectionId = useMemo(() => {
    if (!isDesignModeActive) return null;
    const selectedNodeId = designEditor.selectedNodeId?.trim();
    if (!selectedNodeId) return null;

    const candidate = selectedNodeId.includes('::') ? selectedNodeId.split('::')[0]?.trim() : selectedNodeId;
    if (!candidate) return null;

    return reorderablePreviewSections.some((section) => section.id === candidate) ? candidate : null;
  }, [designEditor.selectedNodeId, isDesignModeActive, reorderablePreviewSections]);
  const draggablePreviewSectionId = isDesignModeActive ? selectedDesignSectionId : selectedSectionId;
  const previewOutlineColor =
    renderedPreviewConfig?.theme.primaryColor || config?.theme.primaryColor || '#2563EB';

  useEffect(() => {
    if (!isDesignModeActive || !renderedPreviewConfig) return;
    localStorage.setItem('templateConfig', serializeTemplateConfig(renderedPreviewConfig));
    localStorage.setItem('selectedColor', renderedPreviewConfig.theme.primaryColor);
    localStorage.setItem('selectedMode', renderedPreviewConfig.theme.mode);
  }, [isDesignModeActive, renderedPreviewConfig]);

  const addableSections = useMemo(() => {
    if (!config) return [];
    return getAddableSectionTypes(config);
  }, [config]);

  const visibleSidebarSections = useMemo(() => {
    if (!config) return [];
    return config.sections.filter(
      (section) =>
        section.enabled &&
        sectionRenderedByTemplate(selectedTemplate, section.type) &&
        hasRenderableSectionContent(section)
    );
  }, [config, selectedTemplate]);

  const hiddenRestorableSections = useMemo(() => {
    if (!config) return [];
    return config.sections.filter(
      (section) =>
        !section.enabled &&
        sectionRenderedByTemplate(selectedTemplate, section.type) &&
        hasRenderableSectionContent(section)
    );
  }, [config, selectedTemplate]);

  const SelectedTemplate = templateComponentMap[selectedTemplate];
  const serializedConfig = useMemo(
    () => (config ? serializeTemplateConfig(config) : ''),
    [config]
  );
  const serializedPreviewConfig = useMemo(
    () => (previewConfig ? serializeTemplateConfig(previewConfig) : ''),
    [previewConfig]
  );
  const hasPendingPreviewChanges = Boolean(
    !isDesignModeActive &&
      config &&
      previewConfig &&
      serializedConfig !== serializedPreviewConfig
  );

  const applyPreviewChanges = () => {
    if (!config || isDesignModeActive) return;
    setPreviewConfig(config);
  };

  useEffect(() => {
    if (!visibleSidebarSections.length) {
      setSelectedSectionId(null);
      return;
    }

    if (!selectedSectionId || !visibleSidebarSections.some((section) => section.id === selectedSectionId)) {
      setSelectedSectionId(visibleSidebarSections[0].id);
    }
  }, [visibleSidebarSections, selectedSectionId]);

  useEffect(() => {
    const previewRoot = previewRootRef.current;
    if (!previewRoot) return;

    const sectionNodes = Array.from(previewRoot.querySelectorAll<HTMLElement>(PREVIEW_SECTION_SELECTOR));
    sectionNodes.forEach((sectionNode) => {
      const sectionId = sectionNode.dataset.customizeSectionId?.trim() || sectionNode.id?.trim() || '';
      const normalizedSectionId = sectionId.toLowerCase();
      const normalizedSelectedId = draggablePreviewSectionId?.toLowerCase() || '';
      const normalizedDraggedId = previewDraggedSectionId?.toLowerCase() || '';
      const normalizedDropTargetId = previewDropTargetSectionId?.toLowerCase() || '';

      const isSelectedSection = Boolean(normalizedSectionId && normalizedSectionId === normalizedSelectedId);
      const isDraggedSection = Boolean(normalizedSectionId && normalizedSectionId === normalizedDraggedId);
      const isDropTarget = Boolean(normalizedSectionId && normalizedSectionId === normalizedDropTargetId);

      sectionNode.draggable = isSelectedSection;
      sectionNode.style.cursor = isSelectedSection ? (isDraggedSection ? 'grabbing' : 'grab') : '';
      sectionNode.style.opacity = isDraggedSection ? '0.72' : '';
      sectionNode.style.outline = isDropTarget ? `2px dashed ${previewOutlineColor}` : '';
      sectionNode.style.outlineOffset = isDropTarget ? '6px' : '';
    });

    return () => {
      sectionNodes.forEach((sectionNode) => {
        sectionNode.draggable = false;
        sectionNode.style.cursor = '';
        sectionNode.style.opacity = '';
        sectionNode.style.outline = '';
        sectionNode.style.outlineOffset = '';
      });
    };
  }, [
    draggablePreviewSectionId,
    previewDraggedSectionId,
    previewDropTargetSectionId,
    previewOutlineColor,
    renderedPreviewConfig,
  ]);

  const setSection = (
    sectionId: string,
    updater: (section: SectionConfig) => SectionConfig
  ) => {
    setConfig((previous) => {
      if (!previous) return previous;
      return {
        ...previous,
        sections: previous.sections.map((section) =>
          section.id === sectionId ? updater(section) : section
        ),
      };
    });
  };

  const setTheme = (patch: Partial<TemplateConfig['theme']>) => {
    setConfig((previous) => {
      if (!previous) return previous;
      return {
        ...previous,
        theme: {
          ...previous.theme,
          ...patch,
        },
      };
    });
  };

  const handleToggleSection = (sectionId: string, enabled: boolean) => {
    setConfig((previous) => {
      if (!previous) return previous;
      return {
        ...previous,
        sections: previous.sections.map((section) =>
          section.id === sectionId ? { ...section, enabled } : section
        ),
      };
    });
  };

  const handleAddSection = (type: SectionType) => {
    setConfig((previous) => {
      if (!previous || !canAddSectionType(previous, type)) return previous;

      const section = createSectionConfig({
        templateId: selectedTemplate,
        type,
        existingSections: previous.sections,
        resumeData: resumeData ?? undefined,
      });

      const next = {
        ...previous,
        sections: [...previous.sections, section],
      };

      setSelectedSectionId(section.id);
      setShowAddDrawer(false);

      window.setTimeout(() => {
        document.getElementById(`section-row-${section.id}`)?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }, 0);

      return next;
    });
  };

  const handleDragStart = (sectionId: string) => {
    setDraggedSectionId(sectionId);
  };

  const reorderTemplateSections = (draggedId: string, targetId: string) => {
    if (draggedId === targetId) return;

    setConfig((previous) => {
      if (!previous) return previous;
      return {
        ...previous,
        sections: reorderSections(previous.sections, draggedId, targetId),
      };
    });
  };

  const handleDrop = (targetId: string) => {
    if (!draggedSectionId || !config) return;
    reorderTemplateSections(draggedSectionId, targetId);
    setDraggedSectionId(null);
  };

  const scrollPreviewToSection = (sectionId: string, sectionType: SectionType) => {
    const previewRoot = previewRootRef.current;
    if (!previewRoot) return;

    const target = findPreviewSectionElement(previewRoot, {
      sectionId,
      sectionType,
    });

    target?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const editPathCandidates = (editPath: string): string[] => {
    const trimmed = editPath.trim();
    if (!trimmed) return [];

    const candidates = new Set<string>([trimmed]);
    if (/\[\d+\]$/.test(trimmed)) {
      candidates.add(trimmed.replace(/\[\d+\]$/, ''));
    }

    return Array.from(candidates);
  };

  const focusActiveEditorField = (preferredEditPath?: string | null) => {
    window.setTimeout(() => {
      const editorPanel = editorPanelRef.current;
      if (!editorPanel) return;

      const mappedFields = Array.from(
        editorPanel.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
          'input[data-edit-path]:not([disabled]), textarea[data-edit-path]:not([disabled])'
        )
      );

      if (preferredEditPath) {
        const candidates = editPathCandidates(preferredEditPath);
        const matchingField = mappedFields.find((field) => {
          const fieldPath = field.dataset.editPath?.trim();
          if (!fieldPath) return false;
          return candidates.includes(fieldPath) || candidates.includes(fieldPath.replace(/\[\d+\]$/, ''));
        });

        if (matchingField) {
          matchingField.focus();
          return;
        }
      }

      const firstField =
        mappedFields[0] ??
        editorPanel.querySelector<HTMLInputElement | HTMLTextAreaElement>(
          'input[type="text"]:not([disabled]), textarea:not([disabled])'
        ) ??
        editorPanel.querySelector<HTMLInputElement | HTMLTextAreaElement>(
          'input:not([type="hidden"]):not([disabled]), textarea:not([disabled])'
        );

      firstField?.focus();
    }, 0);
  };

  const handlePreviewClick = (event: MouseEvent<HTMLDivElement>) => {
    if (isDesignModeActive) return;

    const previewMatch = sectionMatchFromPreviewTarget(event.target);
    if (!previewMatch) return;

    const previewSectionId = previewMatch.sectionId?.toLowerCase();
    const targetSection =
      (previewMatch.sectionId
        ? visibleSidebarSections.find((section) => section.id === previewMatch.sectionId) ||
          visibleSidebarSections.find((section) => previewSectionId !== undefined && section.id.toLowerCase() === previewSectionId)
        : undefined) ??
      (previewMatch.sectionType
        ? visibleSidebarSections.find((section) => section.type === previewMatch.sectionType)
        : undefined);

    if (!targetSection) return;

    const clickTarget = event.target as HTMLElement;
    if (clickTarget.closest('a, button')) {
      event.preventDefault();
    }

    setSelectedSectionId(targetSection.id);
    setLeftSidebarCollapsed(false);
    setRightSidebarCollapsed(false);

    window.setTimeout(() => {
      document.getElementById(`section-row-${targetSection.id}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }, 0);

    focusActiveEditorField(previewMatch.editPath);
  };

  const openPreview = () => {
    if (!resumeData || !renderedPreviewConfig) return;

    localStorage.setItem('resumeData', JSON.stringify(resumeData));
    localStorage.setItem('selectedTemplate', selectedTemplate);
    localStorage.setItem('selectedColor', renderedPreviewConfig.theme.primaryColor);
    localStorage.setItem('selectedMode', renderedPreviewConfig.theme.mode);
    localStorage.setItem('templateConfig', serializeTemplateConfig(renderedPreviewConfig));

    router.push('/preview');
  };

  const handleSave = async () => {
    if (!resumeData || !renderedPreviewConfig) return;

    const validation = validateTemplateConfig(renderedPreviewConfig);
    if (!validation.valid) {
      setSaveMessage({
        type: 'error',
        message: validation.errors[0] || 'Template config is invalid.',
      });
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const supabaseSession = await session.auth.getSession();
      const token = supabaseSession.data.session?.access_token;

      if (!token) {
        setSaveMessage({ type: 'error', message: 'Please sign in to save changes.' });
        return;
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) {
        setSaveMessage({ type: 'error', message: 'Backend URL is not configured.' });
        return;
      }

      const portfolioName = `${resumeData.personal_information?.full_name || 'My'} Portfolio - ${templateNames[selectedTemplate] || 'Template'}`;
      let portfolioId = localStorage.getItem('currentPortfolioId');
      let resolvedUserTemplateId = userTemplateId;

      if (isDesignModeActive) {
        const changeSummary = designEditor.isDirty ? 'Saved visual editor changes' : 'Saved design template';
        if (resolvedUserTemplateId) {
          const updatedUserTemplate = await updateUserTemplate({
            token,
            userTemplateId: resolvedUserTemplateId,
            payload: {
              document: designEditor.document,
              schema_version: designEditor.document.schema_version,
              template_id: selectedTemplate,
              increment_version: true,
              change_summary: changeSummary,
            },
          });
          resolvedUserTemplateId = updatedUserTemplate.id;
        } else {
          const createdUserTemplate = await createUserTemplate({
            token,
            payload: {
              name: `${portfolioName} (Design Mode)`,
              template_id: selectedTemplate,
              schema_version: designEditor.document.schema_version,
              document: designEditor.document,
              portfolio_id: portfolioId,
            },
          });
          resolvedUserTemplateId = createdUserTemplate.id;
          setUserTemplateId(createdUserTemplate.id);
          localStorage.setItem('currentUserTemplateId', createdUserTemplate.id);
        }
      }

      const payload = {
        name: portfolioName,
        template_id: selectedTemplate,
        color: renderedPreviewConfig.theme.primaryColor,
        display_mode: renderedPreviewConfig.theme.mode,
        is_published: false,
        user_template_id: resolvedUserTemplateId || undefined,
        data: {
          ...(resumeData as PortfolioDataWithCustomTemplate),
          __template_config: renderedPreviewConfig,
        },
      };

      let response: Response;
      if (portfolioId) {
        response = await fetch(`${backendUrl}/portfolios/${portfolioId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (response.status === 404) {
          localStorage.removeItem('currentPortfolioId');
          portfolioId = null;
        }
      }

      if (!portfolioId) {
        response = await fetch(`${backendUrl}/portfolios/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      if (!response!.ok) {
        const error = await response!.json();
        throw new Error(error.detail || 'Failed to save portfolio');
      }

      const saved = await response!.json();
      const resolvedPortfolioId = saved.id;

      if (isDesignModeActive && resolvedUserTemplateId) {
        await updateUserTemplate({
          token,
          userTemplateId: resolvedUserTemplateId,
          payload: {
            portfolio_id: resolvedPortfolioId,
            increment_version: false,
          },
        });
        setUserTemplateId(resolvedUserTemplateId);
        localStorage.setItem('currentUserTemplateId', resolvedUserTemplateId);
      }

      await saveTemplateConfig({
        portfolioId: resolvedPortfolioId,
        token,
        config: renderedPreviewConfig,
      });

      localStorage.setItem('currentPortfolioId', resolvedPortfolioId);
      localStorage.setItem('templateConfig', serializeTemplateConfig(renderedPreviewConfig));
      trackTelemetryEvent({
        event: 'design_save',
        portfolioId: resolvedPortfolioId,
        userTemplateId: resolvedUserTemplateId || undefined,
        metadata: {
          designMode: isDesignModeActive,
          templateId: selectedTemplate,
        },
      });
      setSaveMessage({ type: 'success', message: 'Template configuration saved.' });
      window.setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error saving template config:', error);
      setSaveMessage({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to save template config.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDesignReorderSections = (draggedSectionId: string, targetSectionId: string) => {
    if (!isDesignModeActive) return;

    const children = Array.isArray(designEditor.document.root.children)
      ? [...designEditor.document.root.children]
      : [];
    const from = children.findIndex((node) => node.id === draggedSectionId);
    const to = children.findIndex((node) => node.id === targetSectionId);
    if (from < 0 || to < 0 || from === to) return;

    const [node] = children.splice(from, 1);
    children.splice(to, 0, node);

    designEditor.setDocument({
      ...designEditor.document,
      root: {
        ...designEditor.document.root,
        children,
      },
      metadata: {
        ...designEditor.document.metadata,
        source: 'editor',
        updated_at: new Date().toISOString(),
      },
    });
  };

  const resolvePreviewSectionId = (target: EventTarget | null): string | null => {
    const previewMatch = sectionMatchFromPreviewTarget(target);
    if (!previewMatch) return null;

    const normalizedPreviewId = previewMatch.sectionId?.trim().toLowerCase();
    if (normalizedPreviewId) {
      const matched = reorderablePreviewSections.find(
        (section) => section.id.toLowerCase() === normalizedPreviewId
      );
      if (matched) return matched.id;
    }

    if (previewMatch.sectionType) {
      const matched = reorderablePreviewSections.find(
        (section) => section.type === previewMatch.sectionType
      );
      if (matched) return matched.id;
    }

    return null;
  };

  const handlePreviewDragStartCapture = (event: ReactDragEvent<HTMLDivElement>) => {
    const dragTarget = event.target;
    if (!(dragTarget instanceof HTMLElement)) {
      event.preventDefault();
      return;
    }

    if (dragTarget.closest('a, button, input, textarea, select, label')) {
      event.preventDefault();
      return;
    }

    const draggedId = resolvePreviewSectionId(event.target);
    if (!draggedId || !draggablePreviewSectionId) {
      event.preventDefault();
      return;
    }

    if (draggedId.toLowerCase() !== draggablePreviewSectionId.toLowerCase()) {
      event.preventDefault();
      return;
    }

    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', draggedId);
    setPreviewDraggedSectionId(draggedId);
    setPreviewDropTargetSectionId(null);
  };

  const handlePreviewDragOverCapture = (event: ReactDragEvent<HTMLDivElement>) => {
    if (!previewDraggedSectionId) return;

    const targetId = resolvePreviewSectionId(event.target);
    if (!targetId || targetId.toLowerCase() === previewDraggedSectionId.toLowerCase()) {
      setPreviewDropTargetSectionId(null);
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setPreviewDropTargetSectionId(targetId);
  };

  const handlePreviewDropCapture = (event: ReactDragEvent<HTMLDivElement>) => {
    if (!previewDraggedSectionId) return;

    event.preventDefault();
    const targetId = resolvePreviewSectionId(event.target);
    if (!targetId || targetId.toLowerCase() === previewDraggedSectionId.toLowerCase()) {
      setPreviewDraggedSectionId(null);
      setPreviewDropTargetSectionId(null);
      return;
    }

    if (isDesignModeActive) {
      handleDesignReorderSections(previewDraggedSectionId, targetId);
    } else {
      reorderTemplateSections(previewDraggedSectionId, targetId);
      setSelectedSectionId(previewDraggedSectionId);
    }

    setPreviewDraggedSectionId(null);
    setPreviewDropTargetSectionId(null);
  };

  const handlePreviewDragEndCapture = () => {
    setPreviewDraggedSectionId(null);
    setPreviewDropTargetSectionId(null);
  };

  const renderContentEditor = (section: SectionConfig) => {
    switch (section.type) {
      case SectionType.Hero: {
        const content = section.content as HeroSectionContent;
        return (
          <div className="space-y-3">
            <div>
              <Label>Eyebrow</Label>
              <Input
                data-edit-path="content.eyebrow"
                value={content.eyebrow}
                onChange={(event) =>
                  setConfig((prev) =>
                    prev
                      ? {
                          ...prev,
                          sections: updateSectionContent(prev.sections, section.id, {
                            eyebrow: event.target.value,
                          }),
                        }
                      : prev
                  )
                }
              />
            </div>
            <div>
              <Label>Full Name</Label>
              <Input
                data-edit-path="content.fullName"
                value={content.fullName}
                onChange={(event) =>
                  setConfig((prev) =>
                    prev
                      ? {
                          ...prev,
                          sections: updateSectionContent(prev.sections, section.id, {
                            fullName: event.target.value,
                          }),
                        }
                      : prev
                  )
                }
              />
            </div>
            <div>
              <Label>Career Name</Label>
              <Input
                data-edit-path="content.careerName"
                value={content.careerName}
                onChange={(event) =>
                  setConfig((prev) =>
                    prev
                      ? {
                          ...prev,
                          sections: updateSectionContent(prev.sections, section.id, {
                            careerName: event.target.value,
                          }),
                        }
                      : prev
                  )
                }
              />
            </div>
            <div>
              <Label>Summary</Label>
              <Textarea
                data-edit-path="content.summary"
                value={content.summary}
                rows={5}
                onChange={(event) =>
                  setConfig((prev) =>
                    prev
                      ? {
                          ...prev,
                          sections: updateSectionContent(prev.sections, section.id, {
                            summary: event.target.value,
                          }),
                        }
                      : prev
                  )
                }
              />
            </div>
            <div>
              <Label>Primary Button</Label>
              <Input
                value={content.primaryCtaLabel}
                onChange={(event) =>
                  setConfig((prev) =>
                    prev
                      ? {
                          ...prev,
                          sections: updateSectionContent(prev.sections, section.id, {
                            primaryCtaLabel: event.target.value,
                          }),
                        }
                      : prev
                  )
                }
              />
            </div>
            <div>
              <Label>Secondary Button</Label>
              <Input
                value={content.secondaryCtaLabel}
                onChange={(event) =>
                  setConfig((prev) =>
                    prev
                      ? {
                          ...prev,
                          sections: updateSectionContent(prev.sections, section.id, {
                            secondaryCtaLabel: event.target.value,
                          }),
                        }
                      : prev
                  )
                }
              />
            </div>
          </div>
        );
      }
      case SectionType.About: {
        const content = section.content as AboutSectionContent;
        return (
          <div className="space-y-3">
            <div>
              <Label>Section Title</Label>
              <Input
                data-edit-path="content.title"
                value={content.title}
                onChange={(event) =>
                  setConfig((prev) =>
                    prev
                      ? {
                          ...prev,
                          sections: updateSectionContent(prev.sections, section.id, {
                            title: event.target.value,
                          }),
                        }
                      : prev
                  )
                }
              />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Textarea
                data-edit-path="content.subtitle"
                value={content.subtitle}
                rows={3}
                onChange={(event) =>
                  setConfig((prev) =>
                    prev
                      ? {
                          ...prev,
                          sections: updateSectionContent(prev.sections, section.id, {
                            subtitle: event.target.value,
                          }),
                        }
                      : prev
                  )
                }
              />
            </div>
            <div>
              <Label>Summary</Label>
              <Textarea
                data-edit-path="content.summary"
                value={content.summary}
                rows={5}
                onChange={(event) =>
                  setConfig((prev) =>
                    prev
                      ? {
                          ...prev,
                          sections: updateSectionContent(prev.sections, section.id, {
                            summary: event.target.value,
                          }),
                        }
                      : prev
                  )
                }
              />
            </div>
            <div>
              <Label>Education Label</Label>
              <Input
                value={content.educationLabel}
                onChange={(event) =>
                  setConfig((prev) =>
                    prev
                      ? {
                          ...prev,
                          sections: updateSectionContent(prev.sections, section.id, {
                            educationLabel: event.target.value,
                          }),
                        }
                      : prev
                  )
                }
              />
            </div>
            <div>
              <Label>Education Details</Label>
              <Textarea
                data-edit-path="content.educationDetails"
                value={content.educationDetails}
                rows={3}
                onChange={(event) =>
                  setConfig((prev) =>
                    prev
                      ? {
                          ...prev,
                          sections: updateSectionContent(prev.sections, section.id, {
                            educationDetails: event.target.value,
                          }),
                        }
                      : prev
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Stats</Label>
              {content.stats.map((stat, index) => (
                <div key={`${stat.label}-${index}`} className="grid grid-cols-2 gap-2">
                  <Input
                    value={stat.label}
                    placeholder="Label"
                    onChange={(event) =>
                      setSection(section.id, (current) => {
                        if (current.type !== SectionType.About) return current;
                        const nextStats = [...current.content.stats];
                        nextStats[index] = { ...nextStats[index], label: event.target.value };
                        return {
                          ...current,
                          content: {
                            ...current.content,
                            stats: nextStats,
                          },
                        };
                      })
                    }
                  />
                  <Input
                    value={stat.value}
                    placeholder="Value"
                    onChange={(event) =>
                      setSection(section.id, (current) => {
                        if (current.type !== SectionType.About) return current;
                        const nextStats = [...current.content.stats];
                        nextStats[index] = { ...nextStats[index], value: event.target.value };
                        return {
                          ...current,
                          content: {
                            ...current.content,
                            stats: nextStats,
                          },
                        };
                      })
                    }
                  />
                </div>
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setSection(section.id, (current) => {
                    if (current.type !== SectionType.About) return current;
                    return {
                      ...current,
                      content: {
                        ...current.content,
                        stats: [...current.content.stats, { label: 'Label', value: 'Value' }],
                      },
                    };
                  })
                }
              >
                Add Stat
              </Button>
            </div>
          </div>
        );
      }
      case SectionType.Projects: {
        const content = section.content as ProjectsSectionContent;
        return (
          <div className="space-y-3">
            <div>
              <Label>Section Title</Label>
              <Input
                data-edit-path="content.title"
                value={content.title}
                onChange={(event) =>
                  setConfig((prev) =>
                    prev
                      ? {
                          ...prev,
                          sections: updateSectionContent(prev.sections, section.id, {
                            title: event.target.value,
                          }),
                        }
                      : prev
                  )
                }
              />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Textarea
                data-edit-path="content.subtitle"
                rows={3}
                value={content.subtitle}
                onChange={(event) =>
                  setConfig((prev) =>
                    prev
                      ? {
                          ...prev,
                          sections: updateSectionContent(prev.sections, section.id, {
                            subtitle: event.target.value,
                          }),
                        }
                      : prev
                  )
                }
              />
            </div>
            {content.items.map((project, index) => (
              <div key={`${project.title}-${index}`} className="rounded-md border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Project {index + 1}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setSection(section.id, (current) => {
                        if (current.type !== SectionType.Projects) return current;
                        return {
                          ...current,
                          content: {
                            ...current.content,
                            items: current.content.items.filter((_, itemIndex) => itemIndex !== index),
                          },
                        };
                      })
                    }
                  >
                    Remove
                  </Button>
                </div>
                <Input
                  data-edit-path={`content.items[${index}].title`}
                  value={project.title}
                  placeholder="Project title"
                  onChange={(event) =>
                    setSection(section.id, (current) => {
                      if (current.type !== SectionType.Projects) return current;
                      const items = [...current.content.items];
                      items[index] = { ...items[index], title: event.target.value };
                      return {
                        ...current,
                        content: {
                          ...current.content,
                          items,
                        },
                      };
                    })
                  }
                />
                <Textarea
                  data-edit-path={`content.items[${index}].description`}
                  value={project.description}
                  rows={3}
                  placeholder="Description"
                  onChange={(event) =>
                    setSection(section.id, (current) => {
                      if (current.type !== SectionType.Projects) return current;
                      const items = [...current.content.items];
                      items[index] = { ...items[index], description: event.target.value };
                      return {
                        ...current,
                        content: {
                          ...current.content,
                          items,
                        },
                      };
                    })
                  }
                />
                <Textarea
                  data-edit-path={`content.items[${index}].highlights`}
                  value={project.highlights.join('\n')}
                  rows={3}
                  placeholder="Highlights (one per line)"
                  onChange={(event) =>
                    setSection(section.id, (current) => {
                      if (current.type !== SectionType.Projects) return current;
                      const items = [...current.content.items];
                      items[index] = { ...items[index], highlights: parseLineList(event.target.value) };
                      return {
                        ...current,
                        content: {
                          ...current.content,
                          items,
                        },
                      };
                    })
                  }
                />
                <Input
                  data-edit-path={`content.items[${index}].tags`}
                  value={project.tags.join(', ')}
                  placeholder="Tags (comma separated)"
                  onChange={(event) =>
                    setSection(section.id, (current) => {
                      if (current.type !== SectionType.Projects) return current;
                      const items = [...current.content.items];
                      items[index] = { ...items[index], tags: parseCommaList(event.target.value) };
                      return {
                        ...current,
                        content: {
                          ...current.content,
                          items,
                        },
                      };
                    })
                  }
                />
                <Input
                  value={project.links.demo || ''}
                  placeholder="Demo URL"
                  onChange={(event) =>
                    setSection(section.id, (current) => {
                      if (current.type !== SectionType.Projects) return current;
                      const items = [...current.content.items];
                      items[index] = {
                        ...items[index],
                        links: {
                          ...items[index].links,
                          demo: event.target.value,
                        },
                      };
                      return {
                        ...current,
                        content: {
                          ...current.content,
                          items,
                        },
                      };
                    })
                  }
                />
                <Input
                  value={project.links.code || ''}
                  placeholder="Code URL"
                  onChange={(event) =>
                    setSection(section.id, (current) => {
                      if (current.type !== SectionType.Projects) return current;
                      const items = [...current.content.items];
                      items[index] = {
                        ...items[index],
                        links: {
                          ...items[index].links,
                          code: event.target.value,
                        },
                      };
                      return {
                        ...current,
                        content: {
                          ...current.content,
                          items,
                        },
                      };
                    })
                  }
                />
              </div>
            ))}
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setSection(section.id, (current) => {
                  if (current.type !== SectionType.Projects) return current;
                  return {
                    ...current,
                    content: {
                      ...current.content,
                      items: [
                        ...current.content.items,
                        {
                          title: 'New Project',
                          description: 'Describe the project.',
                          highlights: ['Key result'],
                          tags: [],
                          links: {},
                        },
                      ],
                    },
                  };
                })
              }
            >
              Add Project
            </Button>
          </div>
        );
      }
      case SectionType.Skills: {
        const content = section.content as SkillsSectionContent;
        return (
          <div className="space-y-3">
            <div>
              <Label>Section Title</Label>
              <Input
                data-edit-path="content.title"
                value={content.title}
                onChange={(event) =>
                  setConfig((prev) =>
                    prev
                      ? {
                          ...prev,
                          sections: updateSectionContent(prev.sections, section.id, {
                            title: event.target.value,
                          }),
                        }
                      : prev
                  )
                }
              />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Textarea
                data-edit-path="content.subtitle"
                rows={3}
                value={content.subtitle}
                onChange={(event) =>
                  setConfig((prev) =>
                    prev
                      ? {
                          ...prev,
                          sections: updateSectionContent(prev.sections, section.id, {
                            subtitle: event.target.value,
                          }),
                        }
                      : prev
                  )
                }
              />
            </div>
            {content.categories.map((category, index) => (
              <div key={`${category.title}-${index}`} className="rounded-md border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Category {index + 1}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setSection(section.id, (current) => {
                        if (current.type !== SectionType.Skills) return current;
                        return {
                          ...current,
                          content: {
                            ...current.content,
                            categories: current.content.categories.filter((_, itemIndex) => itemIndex !== index),
                          },
                        };
                      })
                    }
                  >
                    Remove
                  </Button>
                </div>
                <Input
                  data-edit-path={`content.categories[${index}].title`}
                  value={category.title}
                  placeholder="Category title"
                  onChange={(event) =>
                    setSection(section.id, (current) => {
                      if (current.type !== SectionType.Skills) return current;
                      const categories = [...current.content.categories];
                      categories[index] = { ...categories[index], title: event.target.value };
                      return {
                        ...current,
                        content: {
                          ...current.content,
                          categories,
                        },
                      };
                    })
                  }
                />
                <Input
                  data-edit-path={`content.categories[${index}].skills`}
                  value={category.skills.join(', ')}
                  placeholder="Skills (comma separated)"
                  onChange={(event) =>
                    setSection(section.id, (current) => {
                      if (current.type !== SectionType.Skills) return current;
                      const categories = [...current.content.categories];
                      categories[index] = { ...categories[index], skills: parseCommaList(event.target.value) };
                      return {
                        ...current,
                        content: {
                          ...current.content,
                          categories,
                        },
                      };
                    })
                  }
                />
              </div>
            ))}
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setSection(section.id, (current) => {
                  if (current.type !== SectionType.Skills) return current;
                  return {
                    ...current,
                    content: {
                      ...current.content,
                      categories: [
                        ...current.content.categories,
                        {
                          title: 'Category',
                          skills: [],
                        },
                      ],
                    },
                  };
                })
              }
            >
              Add Category
            </Button>
          </div>
        );
      }
      case SectionType.Experience: {
        const content = section.content as ExperienceSectionContent;
        return (
          <div className="space-y-3">
            <div>
              <Label>Section Title</Label>
              <Input
                data-edit-path="content.title"
                value={content.title}
                onChange={(event) =>
                  setConfig((prev) =>
                    prev
                      ? {
                          ...prev,
                          sections: updateSectionContent(prev.sections, section.id, {
                            title: event.target.value,
                          }),
                        }
                      : prev
                  )
                }
              />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Textarea
                data-edit-path="content.subtitle"
                rows={3}
                value={content.subtitle}
                onChange={(event) =>
                  setConfig((prev) =>
                    prev
                      ? {
                          ...prev,
                          sections: updateSectionContent(prev.sections, section.id, {
                            subtitle: event.target.value,
                          }),
                        }
                      : prev
                  )
                }
              />
            </div>
            {content.items.map((item, index) => (
              <div key={`${item.company}-${index}`} className="rounded-md border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Role {index + 1}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setSection(section.id, (current) => {
                        if (current.type !== SectionType.Experience) return current;
                        return {
                          ...current,
                          content: {
                            ...current.content,
                            items: current.content.items.filter((_, itemIndex) => itemIndex !== index),
                          },
                        };
                      })
                    }
                  >
                    Remove
                  </Button>
                </div>
                <Input
                  data-edit-path={`content.items[${index}].company`}
                  value={item.company}
                  placeholder="Company"
                  onChange={(event) =>
                    setSection(section.id, (current) => {
                      if (current.type !== SectionType.Experience) return current;
                      const items = [...current.content.items];
                      items[index] = { ...items[index], company: event.target.value };
                      return {
                        ...current,
                        content: {
                          ...current.content,
                          items,
                        },
                      };
                    })
                  }
                />
                <Input
                  data-edit-path={`content.items[${index}].employedDates`}
                  value={item.employedDates}
                  placeholder="Dates"
                  onChange={(event) =>
                    setSection(section.id, (current) => {
                      if (current.type !== SectionType.Experience) return current;
                      const items = [...current.content.items];
                      items[index] = { ...items[index], employedDates: event.target.value };
                      return {
                        ...current,
                        content: {
                          ...current.content,
                          items,
                        },
                      };
                    })
                  }
                />
                <Textarea
                  data-edit-path={`content.items[${index}].bullets`}
                  rows={3}
                  value={item.bullets.join('\n')}
                  placeholder="Bullets (one per line)"
                  onChange={(event) =>
                    setSection(section.id, (current) => {
                      if (current.type !== SectionType.Experience) return current;
                      const items = [...current.content.items];
                      items[index] = { ...items[index], bullets: parseLineList(event.target.value) };
                      return {
                        ...current,
                        content: {
                          ...current.content,
                          items,
                        },
                      };
                    })
                  }
                />
                <Input
                  value={item.tags.join(', ')}
                  placeholder="Tags (comma separated)"
                  onChange={(event) =>
                    setSection(section.id, (current) => {
                      if (current.type !== SectionType.Experience) return current;
                      const items = [...current.content.items];
                      items[index] = { ...items[index], tags: parseCommaList(event.target.value) };
                      return {
                        ...current,
                        content: {
                          ...current.content,
                          items,
                        },
                      };
                    })
                  }
                />
              </div>
            ))}
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setSection(section.id, (current) => {
                  if (current.type !== SectionType.Experience) return current;
                  return {
                    ...current,
                    content: {
                      ...current.content,
                      items: [
                        ...current.content.items,
                        {
                          company: 'Company',
                          employedDates: '2024 - Present',
                          bullets: ['Impact bullet'],
                          tags: [],
                        },
                      ],
                    },
                  };
                })
              }
            >
              Add Experience
            </Button>
          </div>
        );
      }
      case SectionType.Education: {
        const content = section.content as EducationSectionContent;
        return (
          <div className="space-y-3">
            <div>
              <Label>Section Title</Label>
              <Input
                data-edit-path="content.title"
                value={content.title}
                onChange={(event) =>
                  setConfig((prev) =>
                    prev
                      ? {
                          ...prev,
                          sections: updateSectionContent(prev.sections, section.id, {
                            title: event.target.value,
                          }),
                        }
                      : prev
                  )
                }
              />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Textarea
                data-edit-path="content.subtitle"
                rows={3}
                value={content.subtitle}
                onChange={(event) =>
                  setConfig((prev) =>
                    prev
                      ? {
                          ...prev,
                          sections: updateSectionContent(prev.sections, section.id, {
                            subtitle: event.target.value,
                          }),
                        }
                      : prev
                  )
                }
              />
            </div>
            {content.entries.map((entry, index) => (
              <div key={`${entry.school}-${index}`} className="rounded-md border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Education {index + 1}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setSection(section.id, (current) => {
                        if (current.type !== SectionType.Education) return current;
                        return {
                          ...current,
                          content: {
                            ...current.content,
                            entries: current.content.entries.filter((_, itemIndex) => itemIndex !== index),
                          },
                        };
                      })
                    }
                  >
                    Remove
                  </Button>
                </div>
                <Input
                  data-edit-path={`content.entries[${index}].school`}
                  value={entry.school}
                  placeholder="School"
                  onChange={(event) =>
                    setSection(section.id, (current) => {
                      if (current.type !== SectionType.Education) return current;
                      const entries = [...current.content.entries];
                      entries[index] = { ...entries[index], school: event.target.value };
                      return {
                        ...current,
                        content: {
                          ...current.content,
                          entries,
                        },
                      };
                    })
                  }
                />
                <Input
                  data-edit-path={`content.entries[${index}].majors`}
                  value={entry.majors.join(', ')}
                  placeholder="Majors (comma separated)"
                  onChange={(event) =>
                    setSection(section.id, (current) => {
                      if (current.type !== SectionType.Education) return current;
                      const entries = [...current.content.entries];
                      entries[index] = { ...entries[index], majors: parseCommaList(event.target.value) };
                      return {
                        ...current,
                        content: {
                          ...current.content,
                          entries,
                        },
                      };
                    })
                  }
                />
                <Input
                  data-edit-path={`content.entries[${index}].minors`}
                  value={entry.minors.join(', ')}
                  placeholder="Minors (comma separated)"
                  onChange={(event) =>
                    setSection(section.id, (current) => {
                      if (current.type !== SectionType.Education) return current;
                      const entries = [...current.content.entries];
                      entries[index] = { ...entries[index], minors: parseCommaList(event.target.value) };
                      return {
                        ...current,
                        content: {
                          ...current.content,
                          entries,
                        },
                      };
                    })
                  }
                />
                <Input
                  data-edit-path={`content.entries[${index}].expectedGrad`}
                  value={entry.expectedGrad}
                  placeholder="Expected graduation"
                  onChange={(event) =>
                    setSection(section.id, (current) => {
                      if (current.type !== SectionType.Education) return current;
                      const entries = [...current.content.entries];
                      entries[index] = { ...entries[index], expectedGrad: event.target.value };
                      return {
                        ...current,
                        content: {
                          ...current.content,
                          entries,
                        },
                      };
                    })
                  }
                />
              </div>
            ))}
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setSection(section.id, (current) => {
                  if (current.type !== SectionType.Education) return current;
                  return {
                    ...current,
                    content: {
                      ...current.content,
                      entries: [
                        ...current.content.entries,
                        {
                          school: 'School',
                          majors: [],
                          minors: [],
                          expectedGrad: '',
                        },
                      ],
                    },
                  };
                })
              }
            >
              Add Education
            </Button>
          </div>
        );
      }
      case SectionType.Certifications: {
        const content = section.content as CertificationsSectionContent;
        return (
          <div className="space-y-3">
            <div>
              <Label>Section Title</Label>
              <Input
                data-edit-path="content.title"
                value={content.title}
                onChange={(event) =>
                  setConfig((prev) =>
                    prev
                      ? {
                          ...prev,
                          sections: updateSectionContent(prev.sections, section.id, {
                            title: event.target.value,
                          }),
                        }
                      : prev
                  )
                }
              />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Textarea
                data-edit-path="content.subtitle"
                rows={3}
                value={content.subtitle}
                onChange={(event) =>
                  setConfig((prev) =>
                    prev
                      ? {
                          ...prev,
                          sections: updateSectionContent(prev.sections, section.id, {
                            subtitle: event.target.value,
                          }),
                        }
                      : prev
                  )
                }
              />
            </div>
            {content.entries.map((entry, index) => (
              <div key={`${entry.name}-${index}`} className="rounded-md border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Certification {index + 1}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setSection(section.id, (current) => {
                        if (current.type !== SectionType.Certifications) return current;
                        return {
                          ...current,
                          content: {
                            ...current.content,
                            entries: current.content.entries.filter((_, itemIndex) => itemIndex !== index),
                          },
                        };
                      })
                    }
                  >
                    Remove
                  </Button>
                </div>
                <Input
                  data-edit-path={`content.entries[${index}].name`}
                  value={entry.name}
                  placeholder="Certification name"
                  onChange={(event) =>
                    setSection(section.id, (current) => {
                      if (current.type !== SectionType.Certifications) return current;
                      const entries = [...current.content.entries];
                      entries[index] = { ...entries[index], name: event.target.value };
                      return {
                        ...current,
                        content: {
                          ...current.content,
                          entries,
                        },
                      };
                    })
                  }
                />
                <Input
                  data-edit-path={`content.entries[${index}].issuer`}
                  value={entry.issuer}
                  placeholder="Issuer"
                  onChange={(event) =>
                    setSection(section.id, (current) => {
                      if (current.type !== SectionType.Certifications) return current;
                      const entries = [...current.content.entries];
                      entries[index] = { ...entries[index], issuer: event.target.value };
                      return {
                        ...current,
                        content: {
                          ...current.content,
                          entries,
                        },
                      };
                    })
                  }
                />
                <Input
                  data-edit-path={`content.entries[${index}].year`}
                  value={entry.year}
                  placeholder="Year"
                  onChange={(event) =>
                    setSection(section.id, (current) => {
                      if (current.type !== SectionType.Certifications) return current;
                      const entries = [...current.content.entries];
                      entries[index] = { ...entries[index], year: event.target.value };
                      return {
                        ...current,
                        content: {
                          ...current.content,
                          entries,
                        },
                      };
                    })
                  }
                />
              </div>
            ))}
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setSection(section.id, (current) => {
                  if (current.type !== SectionType.Certifications) return current;
                  return {
                    ...current,
                    content: {
                      ...current.content,
                      entries: [
                        ...current.content.entries,
                        {
                          name: 'Certification',
                          issuer: 'Issuer',
                          year: '',
                        },
                      ],
                    },
                  };
                })
              }
            >
              Add Certification
            </Button>
          </div>
        );
      }
      case SectionType.Blog: {
        const content = section.content as BlogSectionContent;
        return (
          <div className="space-y-3">
            <div>
              <Label>Section Title</Label>
              <Input
                data-edit-path="content.title"
                value={content.title}
                onChange={(event) =>
                  setConfig((prev) =>
                    prev
                      ? {
                          ...prev,
                          sections: updateSectionContent(prev.sections, section.id, {
                            title: event.target.value,
                          }),
                        }
                      : prev
                  )
                }
              />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Textarea
                data-edit-path="content.subtitle"
                rows={3}
                value={content.subtitle}
                onChange={(event) =>
                  setConfig((prev) =>
                    prev
                      ? {
                          ...prev,
                          sections: updateSectionContent(prev.sections, section.id, {
                            subtitle: event.target.value,
                          }),
                        }
                      : prev
                  )
                }
              />
            </div>
            <Input
              value={content.date}
              placeholder="Date"
              onChange={(event) =>
                setConfig((prev) =>
                  prev
                    ? {
                        ...prev,
                        sections: updateSectionContent(prev.sections, section.id, {
                          date: event.target.value,
                        }),
                      }
                    : prev
                )
              }
            />
            <Input
              value={content.readingTime}
              placeholder="Reading time"
              onChange={(event) =>
                setConfig((prev) =>
                  prev
                    ? {
                        ...prev,
                        sections: updateSectionContent(prev.sections, section.id, {
                          readingTime: event.target.value,
                        }),
                      }
                    : prev
                )
              }
            />
            <Input
              value={content.postTitle}
              placeholder="Post title"
              onChange={(event) =>
                setConfig((prev) =>
                  prev
                    ? {
                        ...prev,
                        sections: updateSectionContent(prev.sections, section.id, {
                          postTitle: event.target.value,
                        }),
                      }
                    : prev
                )
              }
            />
            <Textarea
              rows={4}
              value={content.excerpt}
              placeholder="Post excerpt"
              onChange={(event) =>
                setConfig((prev) =>
                  prev
                    ? {
                        ...prev,
                        sections: updateSectionContent(prev.sections, section.id, {
                          excerpt: event.target.value,
                        }),
                      }
                    : prev
                )
              }
            />
            <Input
              value={content.tags.join(', ')}
              placeholder="Tags (comma separated)"
              onChange={(event) =>
                setConfig((prev) =>
                  prev
                    ? {
                        ...prev,
                        sections: updateSectionContent(prev.sections, section.id, {
                          tags: parseCommaList(event.target.value),
                        }),
                      }
                    : prev
                )
              }
            />
            <Input
              value={content.ctaLabel}
              placeholder="CTA label"
              onChange={(event) =>
                setConfig((prev) =>
                  prev
                    ? {
                        ...prev,
                        sections: updateSectionContent(prev.sections, section.id, {
                          ctaLabel: event.target.value,
                        }),
                      }
                    : prev
                )
              }
            />
          </div>
        );
      }
      case SectionType.Testimonials: {
        const content = section.content as TestimonialsSectionContent;
        return (
          <div className="space-y-3">
            <div>
              <Label>Section Title</Label>
              <Input
                data-edit-path="content.title"
                value={content.title}
                onChange={(event) =>
                  setConfig((prev) =>
                    prev
                      ? {
                          ...prev,
                          sections: updateSectionContent(prev.sections, section.id, {
                            title: event.target.value,
                          }),
                        }
                      : prev
                  )
                }
              />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Textarea
                data-edit-path="content.subtitle"
                rows={3}
                value={content.subtitle}
                onChange={(event) =>
                  setConfig((prev) =>
                    prev
                      ? {
                          ...prev,
                          sections: updateSectionContent(prev.sections, section.id, {
                            subtitle: event.target.value,
                          }),
                        }
                      : prev
                  )
                }
              />
            </div>
            {content.items.map((item, index) => (
              <div key={`${item.author}-${index}`} className="rounded-md border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Testimonial {index + 1}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setSection(section.id, (current) => {
                        if (current.type !== SectionType.Testimonials) return current;
                        return {
                          ...current,
                          content: {
                            ...current.content,
                            items: current.content.items.filter((_, itemIndex) => itemIndex !== index),
                          },
                        };
                      })
                    }
                  >
                    Remove
                  </Button>
                </div>
                <Textarea
                  rows={3}
                  value={item.quote}
                  placeholder="Quote"
                  onChange={(event) =>
                    setSection(section.id, (current) => {
                      if (current.type !== SectionType.Testimonials) return current;
                      const items = [...current.content.items];
                      items[index] = { ...items[index], quote: event.target.value };
                      return {
                        ...current,
                        content: {
                          ...current.content,
                          items,
                        },
                      };
                    })
                  }
                />
                <Input
                  value={item.author}
                  placeholder="Author"
                  onChange={(event) =>
                    setSection(section.id, (current) => {
                      if (current.type !== SectionType.Testimonials) return current;
                      const items = [...current.content.items];
                      items[index] = { ...items[index], author: event.target.value };
                      return {
                        ...current,
                        content: {
                          ...current.content,
                          items,
                        },
                      };
                    })
                  }
                />
                <Input
                  value={item.role}
                  placeholder="Role"
                  onChange={(event) =>
                    setSection(section.id, (current) => {
                      if (current.type !== SectionType.Testimonials) return current;
                      const items = [...current.content.items];
                      items[index] = { ...items[index], role: event.target.value };
                      return {
                        ...current,
                        content: {
                          ...current.content,
                          items,
                        },
                      };
                    })
                  }
                />
                <Input
                  value={item.company}
                  placeholder="Company"
                  onChange={(event) =>
                    setSection(section.id, (current) => {
                      if (current.type !== SectionType.Testimonials) return current;
                      const items = [...current.content.items];
                      items[index] = { ...items[index], company: event.target.value };
                      return {
                        ...current,
                        content: {
                          ...current.content,
                          items,
                        },
                      };
                    })
                  }
                />
              </div>
            ))}
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setSection(section.id, (current) => {
                  if (current.type !== SectionType.Testimonials) return current;
                  return {
                    ...current,
                    content: {
                      ...current.content,
                      items: [
                        ...current.content.items,
                        {
                          quote: 'Add a testimonial quote.',
                          author: 'Author',
                          role: 'Role',
                          company: 'Company',
                        },
                      ],
                    },
                  };
                })
              }
            >
              Add Testimonial
            </Button>
          </div>
        );
      }
      case SectionType.Contact: {
        const content = section.content as ContactSectionContent;
        return (
          <div className="space-y-3">
            <div>
              <Label>Section Title</Label>
              <Input
                data-edit-path="content.title"
                value={content.title}
                onChange={(event) =>
                  setConfig((prev) =>
                    prev
                      ? {
                          ...prev,
                          sections: updateSectionContent(prev.sections, section.id, {
                            title: event.target.value,
                          }),
                        }
                      : prev
                  )
                }
              />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Textarea
                data-edit-path="content.subtitle"
                rows={3}
                value={content.subtitle}
                onChange={(event) =>
                  setConfig((prev) =>
                    prev
                      ? {
                          ...prev,
                          sections: updateSectionContent(prev.sections, section.id, {
                            subtitle: event.target.value,
                          }),
                        }
                      : prev
                  )
                }
              />
            </div>
              <Input
                data-edit-path="content.email"
                value={content.email}
                placeholder="Email"
              onChange={(event) =>
                setConfig((prev) =>
                  prev
                    ? {
                        ...prev,
                        sections: updateSectionContent(prev.sections, section.id, {
                          email: event.target.value,
                        }),
                      }
                    : prev
                )
              }
            />
              <Input
                data-edit-path="content.phone"
                value={content.phone}
                placeholder="Phone"
              onChange={(event) =>
                setConfig((prev) =>
                  prev
                    ? {
                        ...prev,
                        sections: updateSectionContent(prev.sections, section.id, {
                          phone: event.target.value,
                        }),
                      }
                    : prev
                )
              }
            />
              <Input
                data-edit-path="content.address"
                value={content.address}
                placeholder="Add Location"
              onChange={(event) =>
                setConfig((prev) =>
                  prev
                    ? {
                        ...prev,
                        sections: updateSectionContent(prev.sections, section.id, {
                          address: event.target.value,
                        }),
                      }
                    : prev
                )
              }
            />
              <Input
                data-edit-path="content.linkedin"
                value={content.linkedin}
                placeholder="LinkedIn URL"
              onChange={(event) =>
                setConfig((prev) =>
                  prev
                    ? {
                        ...prev,
                        sections: updateSectionContent(prev.sections, section.id, {
                          linkedin: event.target.value,
                        }),
                      }
                    : prev
                )
              }
            />
            <Input
              value={content.ctaLabel}
              placeholder="CTA label"
              onChange={(event) =>
                setConfig((prev) =>
                  prev
                    ? {
                        ...prev,
                        sections: updateSectionContent(prev.sections, section.id, {
                          ctaLabel: event.target.value,
                        }),
                      }
                    : prev
                )
              }
            />
          </div>
        );
      }
      default:
        return (
          <div className="text-sm text-muted-foreground">
            No editor is available for this section.
          </div>
        );
    }
  };

  if (info.loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)] mx-auto mb-3" />
          <p className="text-muted-foreground">Loading template editor...</p>
        </div>
      </div>
    );
  }

  if (!info.user) {
    router.push('/signin?next=/customize');
    return null;
  }

  if (!resumeData || !config) {
    return (
      <div className="min-h-screen">
        <Header currentPage="customize" />
        <div className="container-base py-8">
          <p className="text-muted-foreground">Missing resume or template data.</p>
          <Button className="mt-4" onClick={() => router.push('/templates')}>
            Back to Templates
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-dvh overflow-hidden flex flex-col">
      <Header currentPage="customize" />

      <main className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full min-h-0 flex flex-col lg:flex-row">
          <aside
            className={`relative w-full min-h-0 border-b bg-background flex flex-col overflow-hidden transition-[width,opacity,border-color] duration-300 ease-in-out lg:border-b-0 lg:border-r ${
              leftSidebarCollapsed || isDesignModeActive
                ? 'lg:w-0 lg:min-w-0 lg:opacity-0 lg:pointer-events-none lg:border-r-transparent'
                : 'lg:w-80 lg:opacity-100'
            }`}
          >
            <div className="p-4 border-b space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Template Editor</p>
                  <h2 className="text-lg font-semibold">Sections</h2>
                </div>
                <Badge variant="secondary">{templateNames[selectedTemplate] || `Template ${selectedTemplate}`}</Badge>
              </div>

              <div className="space-y-2">
                <Label>Primary Color</Label>
                <Input
                  type="color"
                  value={config.theme.primaryColor}
                  onChange={(event) =>
                    setTheme({
                      primaryColor: event.target.value,
                    })
                  }
                  className="h-10 p-1"
                />
              </div>

              <div className="space-y-2">
                <Label>Display Mode</Label>
                <div className="inline-flex rounded-md border p-1">
                  {(['light', 'dark'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() =>
                        setTheme({
                          mode,
                          backgroundColor: modeBackground(mode),
                        })
                      }
                      className={`px-3 py-1 text-sm rounded ${
                        config.theme.mode === mode
                          ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {mode[0].toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" onClick={() => setShowAddDrawer(true)} className="flex-1 gap-1">
                  <Plus className="w-4 h-4" />
                  Add Section
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {visibleSidebarSections.map((section) => (
                <div
                  id={`section-row-${section.id}`}
                  key={section.id}
                  draggable
                  onDragStart={() => handleDragStart(section.id)}
                  onDragOver={(event) => {
                    event.preventDefault();
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    handleDrop(section.id);
                  }}
                  onDragEnd={() => setDraggedSectionId(null)}
                  className={`rounded-md border p-2 transition-colors ${
                    selectedSectionId === section.id
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                      : 'hover:bg-muted/50'
                  } ${draggedSectionId === section.id ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSectionId(section.id);
                        scrollPreviewToSection(section.id, section.type);
                        focusActiveEditorField();
                      }}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="text-sm font-medium truncate">{sectionTitle(section)}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        Nav: {section.navLabel || sectionTitle(section)}
                      </p>
                    </button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleToggleSection(section.id, false);
                      }}
                      title="Hide section"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t space-y-2">
              <Button variant="outline" size="sm" className="w-full gap-2" onClick={openPreview}>
                <Eye className="w-4 h-4" />
                Open Preview
              </Button>
              <Button size="sm" className="w-full gap-2" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save
              </Button>
            </div>
          </aside>

          <section className="relative flex-1 min-h-0 overflow-hidden bg-muted/30 transition-all duration-300 ease-in-out">
            <button
              type="button"
              onClick={() => setLeftSidebarCollapsed((value) => !value)}
              className="absolute left-5 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full border bg-background/90 p-2 shadow-sm backdrop-blur-sm transition-colors hover:bg-muted lg:inline-flex"
              aria-label={leftSidebarCollapsed ? 'Expand sections sidebar' : 'Collapse sections sidebar'}
              title={leftSidebarCollapsed ? 'Expand sections sidebar' : 'Collapse sections sidebar'}
            >
              {leftSidebarCollapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
            </button>

            <button
              type="button"
              onClick={() => setRightSidebarCollapsed((value) => !value)}
              className="absolute right-5 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full border bg-background/90 p-2 shadow-sm backdrop-blur-sm transition-colors hover:bg-muted lg:inline-flex"
              aria-label={rightSidebarCollapsed ? 'Expand content sidebar' : 'Collapse content sidebar'}
              title={rightSidebarCollapsed ? 'Expand content sidebar' : 'Collapse content sidebar'}
            >
              {rightSidebarCollapsed ? <ChevronsLeft className="h-4 w-4" /> : <ChevronsRight className="h-4 w-4" />}
            </button>

            <div className="h-full min-h-0 flex flex-col">
              <div className="shrink-0 border-b bg-background/90 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:px-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="ghost" size="sm" className="gap-2" onClick={() => router.push('/templates')}>
                      <ArrowLeft className="w-4 h-4" />
                      Back to Templates
                    </Button>
                    {canUseDesignMode ? (
                      <Button
                        type="button"
                        size="sm"
                        variant={isDesignModeActive ? 'default' : 'outline'}
                        onClick={() => {
                          setDesignModeEnabled((value) => {
                            const next = !value;
                            trackTelemetryEvent({ event: next ? 'design_mode_opened' : 'design_mode_closed' });
                            return next;
                          });
                        }}
                      >
                        {isDesignModeActive ? 'Exit Design Mode' : 'Design Mode'}
                      </Button>
                    ) : null}
                    <div className="hidden items-center gap-1 lg:flex">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setLeftSidebarCollapsed((value) => !value)}
                        title={leftSidebarCollapsed ? 'Expand sections sidebar' : 'Collapse sections sidebar'}
                        aria-label={leftSidebarCollapsed ? 'Expand sections sidebar' : 'Collapse sections sidebar'}
                      >
                        {leftSidebarCollapsed ? (
                          <ChevronsRight className="h-4 w-4" />
                        ) : (
                          <ChevronsLeft className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setRightSidebarCollapsed((value) => !value)}
                        title={rightSidebarCollapsed ? 'Expand content sidebar' : 'Collapse content sidebar'}
                        aria-label={rightSidebarCollapsed ? 'Expand content sidebar' : 'Collapse content sidebar'}
                      >
                        {rightSidebarCollapsed ? (
                          <ChevronsLeft className="h-4 w-4" />
                        ) : (
                          <ChevronsRight className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-muted-foreground">
                      {isDesignModeActive ? 'Live preview updates instantly in Design Mode' : 'Preview updates when you apply changes'}
                    </div>
                    {!isDesignModeActive ? (
                      <Button
                        type="button"
                        size="sm"
                        variant={hasPendingPreviewChanges ? 'default' : 'outline'}
                        className="gap-2"
                        onClick={applyPreviewChanges}
                        disabled={!hasPendingPreviewChanges}
                      >
                        <Save className="w-4 h-4" />
                        Apply changes
                      </Button>
                    ) : (
                      <Badge variant="secondary">Design Mode</Badge>
                    )}
                  </div>
                </div>

                {saveMessage ? (
                  <div
                    className={`mt-3 rounded-md border px-3 py-2 text-sm ${
                      saveMessage.type === 'success'
                        ? 'border-green-200 bg-green-50 text-green-700'
                        : 'border-red-200 bg-red-50 text-red-700'
                    }`}
                  >
                    {saveMessage.message}
                  </div>
                ) : null}
              </div>

              <div className="flex-1 min-h-0 overflow-hidden p-4 lg:p-6">
                <div
                  ref={previewRootRef}
                  className="relative h-full min-h-0 rounded-lg border bg-background shadow-sm overflow-y-auto overscroll-contain"
                  onClickCapture={handlePreviewClick}
                  onDragStartCapture={handlePreviewDragStartCapture}
                  onDragOverCapture={handlePreviewDragOverCapture}
                  onDropCapture={handlePreviewDropCapture}
                  onDragEndCapture={handlePreviewDragEndCapture}
                >
                  {SelectedTemplate ? (
                    <SelectedTemplate
                      personalInformation={resumeData.personal_information}
                      overviewData={resumeData.overview}
                      projects={resumeData.projects}
                      experience={resumeData.experience}
                      skills={resumeData.skills}
                      mainColor={renderedPreviewConfig?.theme.primaryColor || config.theme.primaryColor}
                      backgroundColor={renderedPreviewConfig?.theme.backgroundColor || config.theme.backgroundColor}
                      templateConfig={renderedPreviewConfig || config}
                    />
                  ) : (
                    <div className="p-6 text-sm text-muted-foreground">Template not found.</div>
                  )}
                </div>
                <DesignOverlay
                  enabled={isDesignModeActive}
                  previewRoot={previewRootRef.current}
                  selectedNodeId={designEditor.selectedNodeId}
                  onSelectNode={(nodeId) => {
                    designEditor.setSelectedNodeId(nodeId);
                    trackTelemetryEvent({
                      event: 'design_edit_start',
                      metadata: { nodeId },
                      userTemplateId: userTemplateId || undefined,
                      portfolioId: localStorage.getItem('currentPortfolioId') || undefined,
                    });
                  }}
                />
                <SelectedSectionOverlay
                  enabled={!isDesignModeActive}
                  previewRoot={previewRootRef.current}
                  selectedSectionId={selectedSectionId}
                  selectedSectionType={selectedSection?.type ?? null}
                  outlineColor={renderedPreviewConfig?.theme.primaryColor || config.theme.primaryColor}
                />
              </div>
            </div>
          </section>

          {isDesignModeActive ? (
            <DesignSidebar
              document={designEditor.document}
              selectedNodeId={designEditor.selectedNodeId}
              onSelectNode={designEditor.setSelectedNodeId}
              onUpdateNode={(nodeId, updater) => {
                designEditor.updateNode(nodeId, updater);
                trackTelemetryEvent({
                  event: 'design_edit_applied',
                  metadata: { nodeId },
                  userTemplateId: userTemplateId || undefined,
                  portfolioId: localStorage.getItem('currentPortfolioId') || undefined,
                });
              }}
              onReorderSections={handleDesignReorderSections}
              onUndo={designEditor.undo}
              onRedo={designEditor.redo}
              canUndo={designEditor.canUndo}
              canRedo={designEditor.canRedo}
            />
          ) : (
            <aside
              className={`relative w-full min-h-0 border-t bg-background overflow-hidden flex flex-col transition-[width,opacity,border-color] duration-300 ease-in-out lg:border-t-0 lg:border-l ${
                rightSidebarCollapsed
                  ? 'lg:w-0 lg:min-w-0 lg:opacity-0 lg:pointer-events-none lg:border-l-transparent'
                  : 'lg:w-96 lg:opacity-100'
              }`}
            >
              <div className="p-4 border-b">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold">Content</h3>
                    <p className="text-sm text-muted-foreground">Edit the selected section content.</p>
                  </div>
                </div>
              </div>
              <div
                ref={editorPanelRef}
                className="flex-1 overflow-y-auto p-4 [&_label]:mb-1.5 [&_label]:block [&_input]:mt-1.5 [&_textarea]:mt-1.5"
              >
                {selectedSection ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Selected</p>
                      <p className="font-medium">{sectionTitle(selectedSection)}</p>
                      <p className="text-xs text-muted-foreground capitalize">{selectedSection.type}</p>
                    </div>
                    <div>
                      <Label>Navbar Label</Label>
                      <Input
                        value={selectedSection.navLabel || ''}
                        placeholder="Navbar text"
                        onChange={(event) =>
                          setSection(selectedSection.id, (current) => ({
                            ...current,
                            navLabel: event.target.value,
                          }))
                        }
                      />
                    </div>
                    {renderContentEditor(selectedSection)}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Select a section from the left panel.</p>
                )}
              </div>
            </aside>
          )}
        </div>
      </main>

      {showAddDrawer && config ? (
        <div className="fixed inset-0 z-50 bg-black/40">
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-background border-l shadow-lg p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Add Section</h3>
                <p className="text-sm text-muted-foreground">Choose from curated section types.</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowAddDrawer(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {hiddenRestorableSections.length ? (
                <div className="rounded-md border border-dashed p-3">
                  <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Hidden Sections</p>
                  <div className="space-y-2">
                    {hiddenRestorableSections.map((section) => (
                      <button
                        key={`restore-${section.id}`}
                        type="button"
                        onClick={() => {
                          handleToggleSection(section.id, true);
                          setSelectedSectionId(section.id);
                          setShowAddDrawer(false);
                        }}
                        className="w-full rounded-md border p-2 text-left transition-colors hover:bg-muted/60"
                      >
                        <p className="text-sm font-medium">Restore {sectionTitle(section)}</p>
                        <p className="text-xs text-muted-foreground">Re-enable this section in the sidebar and preview.</p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {addableSections.length ? (
                addableSections.map((entry) => (
                  <button
                    key={entry.type}
                    type="button"
                    onClick={() => handleAddSection(entry.type)}
                    className="w-full rounded-md border p-3 text-left hover:bg-muted/60 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{entry.label}</p>
                      <div className="flex items-center gap-1">
                        {!sectionRenderedByTemplate(selectedTemplate, entry.type) ? (
                          <Badge variant="outline">Saved only</Badge>
                        ) : null}
                        {entry.allowMultiple ? (
                          <Badge variant="secondary">Multiple</Badge>
                        ) : (
                          <Badge variant="outline">Single</Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{entry.description}</p>
                    {!sectionRenderedByTemplate(selectedTemplate, entry.type) ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        This section is stored in your config/resume data but not rendered by this template.
                      </p>
                    ) : null}
                  </button>
                ))
              ) : (
                <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                  No additional sections available for this template configuration.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
