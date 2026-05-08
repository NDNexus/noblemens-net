
/**
 * Resolved App ready category data.
 */
export interface Category {
  id: string

  title: string

  slug: string

  hierarchy: string[]

  urlPath: string

  depth: number

  parent?: string | null
}