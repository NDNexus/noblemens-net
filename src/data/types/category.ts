/**
 * This file contains TypeScript type definitions for the Category schema in Sanity. 
 */
export interface CategoryNode {
  _id: string
  slug: string
  parent: string | null
}