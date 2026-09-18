import { z } from 'zod';

export const departmentSchema = z.object({
  name: z.string().min(3, 'Department name must be at least 3 characters'),
  code: z
    .string()
    .min(2, 'Department code must be at least 2 characters')
    .max(10, 'Code cannot exceed 10 characters')
    .regex(/^[A-Z0-9_-]+$/, 'Code must contain only uppercase letters, numbers, hyphens or underscores'),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

export type DepartmentFormData = z.infer<typeof departmentSchema>;

export const designationSchema = z.object({
  title: z.string().min(2, 'Designation title must be at least 2 characters'),
  code: z
    .string()
    .min(2, 'Designation code must be at least 2 characters')
    .max(15, 'Code cannot exceed 15 characters'),
  departmentId: z.string().min(1, 'Please select a department'),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

export type DesignationFormData = z.infer<typeof designationSchema>;

export const officerSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters'),
  employeeId: z.string().min(3, 'Employee ID is required'),
  email: z.string().email('Please enter a valid government email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^[+]?[0-9\s-]+$/, 'Invalid phone number format'),
  departmentId: z.string().min(1, 'Department selection is mandatory'),
  designationId: z.string().min(1, 'Designation selection is mandatory'),
  roleId: z.string().optional(),
  state: z.string().min(1, 'State jurisdiction is mandatory'),
  district: z.string().min(1, 'District jurisdiction is mandatory'),
  taluk: z.string().min(1, 'Taluk / Sub-District is mandatory'),
  village: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
});

export type OfficerFormData = z.infer<typeof officerSchema>;

export const roleSchema = z.object({
  name: z.string().min(3, 'Role name must be at least 3 characters'),
  departmentId: z.string().min(1, 'Please select a department'),
  designationId: z.string().optional(),
  description: z.string().min(5, 'Please provide a descriptive explanation of this role'),
  permissions: z.array(z.string()).min(1, 'Assign at least one permission'),
});

export type RoleFormData = z.infer<typeof roleSchema>;

export const verificationUpdateSchema = z.object({
  status: z.enum(['VERIFIED', 'PENDING', 'REJECTED', 'NOT_APPLICABLE']),
  comments: z.string().min(5, 'Please provide official verification remarks or reasoning'),
  verifiedBy: z.string().min(2, 'Verifying Officer / Authority name is required'),
  referenceDocId: z.string().optional(),
});

export type VerificationUpdateFormData = z.infer<typeof verificationUpdateSchema>;

export const documentUploadSchema = z.object({
  documentName: z.string().min(3, 'Document title is required'),
  documentType: z.enum([
    'SALE_DEED',
    'PATTA_CHITTA',
    '7_12_EXTRACT',
    'SURVEY_FMB',
    'ENCUMBRANCE_CERTIFICATE',
    'TAX_RECEIPT',
    'MUTATION_ORDER'
  ]),
  landId: z.string().min(3, 'Land Parcel ID is required (e.g. TN-CHE-101)'),
  departmentId: z.string().min(1, 'Department is required'),
});

export type DocumentUploadFormData = z.infer<typeof documentUploadSchema>;
