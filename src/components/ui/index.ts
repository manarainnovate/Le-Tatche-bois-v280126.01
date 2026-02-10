// ═══════════════════════════════════════════════════════════
// UI COMPONENTS BARREL EXPORT
// ═══════════════════════════════════════════════════════════

// Button
export { Button, buttonVariants, type ButtonProps } from "./Button";

// Input Components
export { Input, type InputProps } from "./Input";
export { Textarea, type TextareaProps } from "./Textarea";
export { Select, type SelectProps, type SelectOption } from "./Select";
export { Checkbox, type CheckboxProps } from "./Checkbox";
export { Radio, type RadioProps, type RadioOption } from "./Radio";

// Form Helpers
export {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormHint,
  type FormFieldProps,
} from "./FormField";

// Card (Compound Component)
export {
  Card,
  type CardProps,
  type CardImageProps,
  type CardBadgeProps,
  type CardContentProps,
  type CardTitleProps,
  type CardSubtitleProps,
  type CardDescriptionProps,
  type CardPriceProps,
  type CardFooterProps,
} from "./Card";

// Modal
export {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  type ModalProps,
} from "./Modal";

// Toast
export { Toast, type ToastProps } from "./Toast";
export { ToastContainer, type ToastContainerProps } from "./ToastContainer";

// Skeleton
export {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonImage,
  SkeletonTable,
  type SkeletonProps,
  type SkeletonTextProps,
  type SkeletonCardProps,
  type SkeletonImageProps,
  type SkeletonTableProps,
} from "./Skeleton";

// Image Gallery
export {
  ImageGallery,
  type ImageGalleryProps,
  type GalleryImage,
} from "./ImageGallery";

// Accordion (Compound Component)
export {
  Accordion,
  type AccordionProps,
  type AccordionItemProps,
  type AccordionTriggerProps,
  type AccordionContentProps,
} from "./Accordion";

// DataTable
export {
  DataTable,
  type DataTableProps,
  type Column,
  type SortDirection,
} from "./DataTable";

// Pagination
export { Pagination, type PaginationProps } from "./Pagination";

// Badge
export { Badge, badgeVariants, type BadgeProps } from "./Badge";

// Dropdown (Compound Component)
export {
  Dropdown,
  type DropdownProps,
  type DropdownTriggerProps,
  type DropdownContentProps,
  type DropdownItemProps,
  type DropdownLabelProps,
} from "./Dropdown";

// QuantitySelector (E-commerce)
export { QuantitySelector, type QuantitySelectorProps } from "./QuantitySelector";

// Price (E-commerce)
export {
  Price,
  PriceCompact,
  PriceRange,
  type PriceProps,
  type PriceCompactProps,
  type PriceRangeProps,
} from "./Price";

// Language Switcher
export {
  LanguageSwitcher,
  type LanguageSwitcherProps,
} from "./LanguageSwitcher";

// Currency Switcher
export {
  CurrencySwitcher,
  LocaleSwitcher,
  type CurrencySwitcherProps,
  type LocaleSwitcherProps,
} from "./CurrencySwitcher";
