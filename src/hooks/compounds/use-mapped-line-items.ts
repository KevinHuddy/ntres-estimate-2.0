import { useMemo } from "react"
import { useLineItems } from "../queries/use-line-items"
import { useTemplateLineItems } from "../queries/use-template-line-items"
import { useRenderTracker } from "../use-render-tracker"


export const useMappedLineItems = (takeoffId: string) => {
    const { data: templates, isLoading: templatesLoading } = useTemplateLineItems()
    const { data: lineItems, isLoading: lineItemsLoading } = useLineItems(takeoffId)

    // Track this hook's re-renders
    useRenderTracker('useMappedLineItems', {
        takeoffId,
        templatesLength: templates?.length || 0,
        lineItemsLength: lineItems?.length || 0,
        templatesLoading,
        lineItemsLoading,
        hasTemplates: !!templates,
        hasLineItems: !!lineItems
    });

    const mappedItems = useMemo(() => {
        if (!templates || !lineItems || !takeoffId) return []

        const usedTemplates = lineItems.filter(item => item.linked_template_line_item).map(item => item.linked_template_line_item)

        const mappedLineItems = [
            ...lineItems,
            ...templates.filter(template => !usedTemplates.includes(template.id)).map(template => {
                return {
                    ...template,
                    id: null,
                    cost_takeoff: template.price || template.linked_product_cost || 0,
                    linked_takeoff: takeoffId,
                    linked_template_line_item: template.id,
                    qty_takeoff: 0,
                    values: [],
                    mo_hours: 0,
                    mo_qty: 0,
                    mo_days: 0
                }
            })
        ]

        return mappedLineItems
    }, [templates, lineItems, takeoffId])

    return {
        data: mappedItems,
        isLoading: templatesLoading || lineItemsLoading,
        templates,
        lineItems
    }
}

export default useMappedLineItems