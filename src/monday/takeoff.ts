import { MondayClient } from "@ntr.dev/monday-kit"

export const getTakeoffData = async (itemId: string, boardId: string) => {
    try {
        const mondayClient = new MondayClient()
        
        const settings = await (async () => {
            const response = await mondayClient.boards.listColumns({
                boardId,
            })
            const columns = response.filter((col) => col.description?.includes('{{{ntr')).map((col) => ({
                id: col.id,
                name: col.title,
                description: col.description
            }))
            const output = {
                total: columns.find((col) => col.description?.includes("{{{ntr.takeoff.total}}}"))?.id,
                linked_project: columns.find((col) => col.description?.includes("{{{ntr.takeoff.linked_project}}}"))?.id,
                linked_price_request: columns.find((col) => col.description?.includes("{{{ntr.takeoff.linked_price_request}}}"))?.id,
                linked_quote: columns.find((col) => col.description?.includes("{{{ntr.takeoff.linked_quote}}}"))?.id,
                fees: columns.filter((col) => col.description?.includes("{{{ntr.takeoff.fee}}}")).reduce((acc, col) => {
                    return {
                        ...acc,
                        [col.name]: col.id
                    }
                }, {}),
                columns: columns.filter((col) => col.description?.includes("{{{ntr.takeoff")).map((col) => col.id)
            }
            return output
        })()

        const data = await (async () => {

            const response = await mondayClient.items.get({
                itemId
            }).then((res) => res?.[0])

            const output = {
                total: response[settings?.total] || 0,
                linked_project: response[settings?.linked_project],
                linked_price_request: response[settings?.linked_price_request],
                linked_quote: response[settings?.linked_quote],
                fees: Object.entries(settings?.fees).map(([key, value]: [string, string]) => ({
                    name: key,
                    id: value,
                    value: response[value]
                }))
            }
            return output
        })()

        return data


    } catch (err) {
        console.error(err)
    }
}