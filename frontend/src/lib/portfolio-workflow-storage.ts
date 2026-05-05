import { ParsedResume } from "@/constants/ResumeFormat";

const WORKFLOW_KEYS = {
  resumeData: "resumeData",
  currentPortfolioId: "currentPortfolioId",
  currentUserTemplateId: "currentUserTemplateId",
  selectedTemplate: "selectedTemplate",
  templateConfig: "templateConfig",
  customSections: "customSections",
  customLayoutSerialized: "customLayoutSerialized",
} as const;

const removeKeys = (keys: readonly string[]) => {
  keys.forEach((key) => localStorage.removeItem(key));
};

export function clearPortfolioSessionForNewDraft() {
  removeKeys([
    WORKFLOW_KEYS.resumeData,
    WORKFLOW_KEYS.currentPortfolioId,
    WORKFLOW_KEYS.currentUserTemplateId,
    WORKFLOW_KEYS.selectedTemplate,
    WORKFLOW_KEYS.templateConfig,
    WORKFLOW_KEYS.customSections,
    WORKFLOW_KEYS.customLayoutSerialized,
  ]);
}

export function clearPortfolioLinkageKeepTemplateChoice() {
  removeKeys([
    WORKFLOW_KEYS.currentPortfolioId,
    WORKFLOW_KEYS.currentUserTemplateId,
    WORKFLOW_KEYS.templateConfig,
    WORKFLOW_KEYS.customSections,
    WORKFLOW_KEYS.customLayoutSerialized,
  ]);
}

export function seedResumeForNewDraft(parsedResume: ParsedResume) {
  clearPortfolioSessionForNewDraft();
  localStorage.setItem(WORKFLOW_KEYS.resumeData, JSON.stringify(parsedResume));
}
