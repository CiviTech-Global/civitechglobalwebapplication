import { z } from 'zod';
import { normalizePersianDigits } from '../utils/persian-digits.js';

export const fullNameSchema = z
  .string({ required_error: 'نام و نام خانوادگی خود را وارد کنید.' })
  .min(3, 'نام و نام خانوادگی باید حداقل ۳ کاراکتر باشد.')
  .max(100, 'نام و نام خانوادگی نباید بیشتر از ۱۰۰ کاراکتر باشد.')
  .transform((value) => value.trim());

export const phoneNumberSchema = z
  .string({ required_error: 'شماره تماس خود را وارد کنید.' })
  .transform((value) => normalizePersianDigits(value.trim()))
  .refine((value) => /^09\d{9}$/.test(value), {
    message: 'شماره تماس باید به فرمت ۰۹xxxxxxxxx باشد.',
  });

export const citySchema = z
  .string({ required_error: 'شهر محل سکونت خود را وارد کنید.' })
  .min(2, 'نام شهر باید حداقل ۲ کاراکتر باشد.')
  .max(100, 'نام شهر نباید بیشتر از ۱۰۰ کاراکتر باشد.')
  .transform((value) => value.trim());

export const preferredContactTimeSchema = z.enum(['صبح', 'ظهر', 'عصر'], {
  errorMap: () => ({ message: 'زمان تماس نامعتبر است.' }),
});

export const notesSchema = z
  .string()
  .max(500, 'توضیحات نباید بیشتر از ۵۰۰ کاراکتر باشد.')
  .optional()
  .transform((value) => (value ? value.trim() : undefined));

export function parseFullName(value: string): string {
  return fullNameSchema.parse(value);
}

export function parsePhoneNumber(value: string): string {
  return phoneNumberSchema.parse(value);
}

export function parseCity(value: string): string {
  return citySchema.parse(value);
}

export function parsePreferredContactTime(value: string): 'صبح' | 'ظهر' | 'عصر' {
  return preferredContactTimeSchema.parse(value);
}

export function parseNotes(value?: string): string | undefined {
  if (!value || value.trim() === '') return undefined;
  return notesSchema.parse(value);
}
