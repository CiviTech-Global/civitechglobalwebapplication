import { InlineKeyboard, Keyboard } from 'grammy';
import type { InsuranceCategory, InsuranceSubcategory } from '@prisma/client';

export const persianKeyboards = {
  categories: (categories: InsuranceCategory[]): InlineKeyboard => {
    const keyboard = new InlineKeyboard();
    categories.forEach((category, index) => {
      const buttonText = `${category.emoji ? `${category.emoji} ` : ''}${category.title}`;
      keyboard.text(buttonText, `category:${category.id}`);
      if ((index + 1) % 2 === 0) {
        keyboard.row();
      }
    });
    return keyboard;
  },

  subcategories: (subcategories: InsuranceSubcategory[]): InlineKeyboard => {
    const keyboard = new InlineKeyboard();
    subcategories.forEach((subcategory, index) => {
      keyboard.text(subcategory.title, `subcategory:${subcategory.id}`);
      if ((index + 1) % 2 === 0) {
        keyboard.row();
      }
    });
    keyboard.row();
    keyboard.text('⬅️ بازگشت به دسته‌ها', 'back:categories');
    return keyboard;
  },

  contactTime: (): InlineKeyboard => {
    return new InlineKeyboard()
      .text('🌅 صبح', 'contact_time:صبح')
      .text('☀️ ظهر', 'contact_time:ظهر')
      .text('🌙 عصر', 'contact_time:عصر');
  },

  skipNotes: (): Keyboard => {
    return new Keyboard().text('⏭ رد کردن').oneTime().resized();
  },

  confirmation: (): InlineKeyboard => {
    return new InlineKeyboard()
      .text('✅ تایید', 'confirm:yes')
      .text('✏️ ویرایش', 'confirm:edit')
      .text('❌ لغو', 'confirm:cancel');
  },

  editOptions: (): InlineKeyboard => {
    return new InlineKeyboard()
      .text('دسته‌بندی', 'edit:category')
      .text('زیرشاخه', 'edit:subcategory')
      .row()
      .text('نام', 'edit:full_name')
      .text('شماره تماس', 'edit:phone')
      .row()
      .text('شهر', 'edit:city')
      .text('زمان تماس', 'edit:contact_time')
      .row()
      .text('توضیحات', 'edit:notes')
      .row()
      .text('⬅️ بازگشت به تایید', 'edit:back');
  },
};
