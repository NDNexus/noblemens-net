import type { CategoryNode } from "@/data/types/category"


export function buildCategoryPath(
    categoryId: string,
    allCategories: CategoryNode[]
) {
    const map = new Map(allCategories.map(c => [c._id, c]))

    const path: string[] = []
    const visited = new Set<string>()

    let current: CategoryNode | null | undefined = map.get(categoryId)

    while (current && !visited.has(current._id)) {
        visited.add(current._id)

        path.unshift(current.slug)
        current = current.parent ? map.get(current.parent) : null
    }

    console.log("Built category path:", path)
    return path
}