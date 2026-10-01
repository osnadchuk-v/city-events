import { EventCategory } from '@/db/schema';

export interface CategoryStyle {
  label: string;
  badgeClass: string;
}

export const CATEGORY_STYLES: Record<EventCategory, CategoryStyle> = {
  [EventCategory.CONCERTS]: { label: 'Концерт', badgeClass: 'bg-[#5046e5]/90 text-white' },
  [EventCategory.EXHIBITIONS]: { label: 'Виставка', badgeClass: 'bg-[#0284c7]/90 text-white' },
  [EventCategory.PARTIES]: { label: 'Вечірка', badgeClass: 'bg-[#7c3aed]/90 text-white' },
  [EventCategory.SPORTS]: { label: 'Спорт', badgeClass: 'bg-[#0d9488]/90 text-white' },
  [EventCategory.THEATRE]: { label: 'Театр', badgeClass: 'bg-[#db2777]/90 text-white' },
  [EventCategory.CINEMA]: { label: 'Кіно', badgeClass: 'bg-[#ea580c]/90 text-white' },
  [EventCategory.FAMILY]: { label: "Для сім'ї", badgeClass: 'bg-[#06b6d4]/90 text-white' },
  [EventCategory.EDUCATION]: { label: 'Освіта', badgeClass: 'bg-[#6366f1]/90 text-white' },
  [EventCategory.BUSINESS]: { label: 'Бізнес', badgeClass: 'bg-[#475569]/90 text-white' },
  [EventCategory.FOOD]: { label: 'Їжа', badgeClass: 'bg-[#d97706]/90 text-white' },
  [EventCategory.ACTIVITIES]: { label: 'Активності', badgeClass: 'bg-[#059669]/90 text-white' },
  [EventCategory.COMMUNITY]: { label: "Ком'юніті", badgeClass: 'bg-[#4f46e5]/90 text-white' },
  [EventCategory.FESTIVALS]: { label: 'Фестиваль', badgeClass: 'bg-[#c026d3]/90 text-white' },
  [EventCategory.OTHER]: { label: 'Інше', badgeClass: 'bg-gray-700/90 text-gray-200' },
};

export const DEFAULT_CATEGORY_STYLE: CategoryStyle = {
  label: 'Інше',
  badgeClass: 'bg-gray-700/90 text-gray-200',
};
