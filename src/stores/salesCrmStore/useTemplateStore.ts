import { create } from 'zustand';
import {
  addTemplate as apiAddTemplate,
  updateTemplate as apiUpdateTemplate,
  deleteTemplate as apiDeleteTemplate,
  getAllTemplates as apiGetAllTemplates,
  getTemplateById as apiGetTemplateById,
  AddTemplateRequest,
  Template as ApiTemplate
} from '@/api/templateApi';

export interface EmailTemplate {
  id: string;
  templateId?: string;
  name: string;
  subject: string;
  html?: string;
  updatedAt?: string;
  createdAt?: string;
}

interface TemplateStore {
  templates: EmailTemplate[];
  fetchTemplates: () => Promise<void>;
  getTemplateById: (templateId: string) => Promise<EmailTemplate>;
  addTemplate: (template: AddTemplateRequest) => Promise<void>;
  updateTemplate: (id: string, data: Partial<AddTemplateRequest>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
}

export const useTemplateStore = create<TemplateStore>((set, get) => ({
  templates: [],
  fetchTemplates: async () => {
    try {
      const response = await apiGetAllTemplates();
      const templates = response.result.templates.map((t: ApiTemplate) => ({
        id: t._id,
        templateId: t.templateId,
        name: t.name,
        subject: t.subject,
        html: t.html,
        updatedAt: t.updatedAt,
        createdAt: t.createdAt
      }));
      set({ templates });
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      throw error;
    }
  },
  getTemplateById: async (templateId: string) => {
    try {
      // First check if we already have the template in our state
      const existingTemplate = get().templates.find(t => 
        t.id === templateId || t.templateId === templateId
      );
      
      if (existingTemplate) {
        console.log('Found template in store:', existingTemplate);
        return existingTemplate;
      }
      
      // If not found in store, fetch from API
      console.log(`Fetching template with ID ${templateId} from API`);
      const response = await apiGetTemplateById(templateId);
      const template = response.result;
      
      const formattedTemplate = {
        id: template._id,
        templateId: template.templateId,
        name: template.name,
        subject: template.subject,
        html: template.html,
        updatedAt: template.updatedAt,
        createdAt: template.createdAt
      };
      
      // Add to our templates array for future reference
      set(state => ({
        templates: [...state.templates, formattedTemplate]
      }));
      
      return formattedTemplate;
    } catch (error) {
      console.error(`Failed to fetch template with ID ${templateId}:`, error);
      throw error;
    }
  },
  addTemplate: async (template) => {
    try {
      const response = await apiAddTemplate(template);
      const apiTemplate = response.result;
      
      const newTemplate: EmailTemplate = {
        id: apiTemplate._id,
        templateId: apiTemplate.templateId,
        name: apiTemplate.name,
        subject: apiTemplate.subject,
        html: apiTemplate.html,
        updatedAt: apiTemplate.updatedAt,
        createdAt: apiTemplate.createdAt
      };
      set((state) => ({ templates: [newTemplate, ...state.templates] }));
    } catch (error) {
      console.error('Failed to add template:', error);
      throw error;
    }
  },
  updateTemplate: async (id, data) => {
    try {
      // Find the template to get its templateId
      const template = get().templates.find(t => t.id === id);
      if (!template || !template.templateId) {
        throw new Error(`Template with ID ${id} not found or has no templateId`);
      }
      
      // Use templateId for the API call instead of MongoDB _id
      const response = await apiUpdateTemplate(template.templateId, data);
      const updated = response.result;
      
      set((state) => ({
        templates: state.templates.map((t) =>
          t.id === id
            ? {
                ...t,
                name: updated.name,
                subject: updated.subject,
                html: updated.html,
                updatedAt: updated.updatedAt,
              }
            : t
        ),
      }));
    } catch (error) {
      console.error('Failed to update template:', error);
      throw error;
    }
  },
  deleteTemplate: async (id) => {
    try {
      // Find the template to get its templateId
      const template = get().templates.find(t => t.id === id);
      if (!template || !template.templateId) {
        throw new Error(`Template with ID ${id} not found or has no templateId`);
      }
      
      // Use templateId for the API call instead of MongoDB _id
      await apiDeleteTemplate(template.templateId);
      
      set((state) => ({ templates: state.templates.filter((t) => t.id !== id) }));
    } catch (error) {
      console.error('Failed to delete template:', error);
      throw error;
    }
  },
}));
