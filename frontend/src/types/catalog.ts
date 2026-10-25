export interface CustomizationOption { optionId: string; label: string; priceModifier: number; }
export interface CustomizationGroup { groupId: string; name: string; selectionType: "single" | "multi"; isRequired: boolean; minSelections: number; maxSelections: number; options: CustomizationOption[]; }
export interface CakeTextField { label: string; maxLength: number; isRequired: boolean; }
export interface CakeSummary { cakeId: string; name: string; description: string | null; basePrice: number; baseImageUrl: string; isFeatured: boolean; categoryName: string | null; isActive: boolean; }
export interface CakeDetail extends CakeSummary { groups: CustomizationGroup[]; freeTextField: CakeTextField | null; images?: string[]; }
