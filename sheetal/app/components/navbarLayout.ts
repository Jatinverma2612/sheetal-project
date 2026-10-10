import { Category } from "../services/categoryService";

export type NavbarLayoutItem = {
  id: string;
  label: string;
  href?: string;
  hidden?: boolean;
  itemType?: "category" | "static" | "custom" | "link";
  categoryId?: string;
  categorySlug?: string;
};

export type NavbarNavItem = Partial<Category> & {
  id: string;
  label: string;
  href?: string;
  hidden?: boolean;
  isCategory?: boolean;
  children?: NavbarNavItem[];
};

const ABOUT_ITEM_ID = "about";

const buildMenuTree = (
  parent: Category | null,
  categories: Category[],
): NavbarNavItem[] => {
  return categories
    .filter((category) => {
      if (!parent) return !category.parentCategory;
      if (!category.parentCategory || typeof category.parentCategory !== "object") {
        return false;
      }

      return (category.parentCategory as { _id?: string })._id === parent._id;
    })
    .map((category) => ({
      ...category,
      id: category._id,
      label: category.name,
      href: `/${category.slug}`,
      isCategory: true,
      children: buildMenuTree(category, categories),
    }));
};

export const buildDefaultNavbarLayout = (
  categories: Category[],
): NavbarLayoutItem[] => {
  const topLevelCategories = categories.filter((category) => !category.parentCategory);

  return [
    ...topLevelCategories.map((category) => ({
      id: category._id,
      label: category.name,
      href: `/${category.slug}`,
      itemType: "category" as const,
      categoryId: category._id,
      categorySlug: category.slug,
      hidden: false,
    })),
    {
      id: ABOUT_ITEM_ID,
      label: "Our Story",
      href: "/about-us#our-story",
      itemType: "static" as const,
      hidden: false,
    },
  ];
};

export const buildNavbarNavItems = (
  categories: Category[],
  savedLayout?: NavbarLayoutItem[] | null,
): NavbarNavItem[] => {
  const categoryNavItems = buildMenuTree(null, categories);
  const categoryMap = new Map(categoryNavItems.map((item) => [item.id, item]));
  const staticItems = new Map<string, NavbarNavItem>([
    [ABOUT_ITEM_ID, { id: ABOUT_ITEM_ID, label: "Our Story", href: "/about-us#our-story" }],
  ]);

  const defaultLayout = buildDefaultNavbarLayout(categories);
  const layout = savedLayout && savedLayout.length > 0 ? savedLayout : defaultLayout;
  const consumedIds = new Set<string>();

  const resolvedItems = layout
    .map((layoutItem) => {
      const categoryId = layoutItem.categoryId || layoutItem.id;
      if (layoutItem.itemType === "category" || categoryMap.has(categoryId)) {
        const categoryItem = categoryMap.get(categoryId);
        if (!categoryItem) return null;

        consumedIds.add(categoryItem.id);
        return {
          ...categoryItem,
          hidden: Boolean(layoutItem.hidden),
        };
      }

      const staticItem = staticItems.get(layoutItem.id);
      if (!staticItem) return null;

      consumedIds.add(layoutItem.id);
      return {
        ...staticItem,
        hidden: Boolean(layoutItem.hidden),
      };
    })
    .filter(Boolean) as NavbarNavItem[];

  const remainingCategoryItems = categoryNavItems.filter(
    (item) => !consumedIds.has(item.id),
  );
  const remainingStaticItems = [...staticItems.values()].filter(
    (item) => !consumedIds.has(item.id),
  );

  return [...resolvedItems, ...remainingCategoryItems, ...remainingStaticItems];
};
