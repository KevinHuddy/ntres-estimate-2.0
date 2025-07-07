import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"

const EditableCell = ({ getValue, row, column, table }) => {
    const initialValue = getValue()
    const [value, setValue] = useState(initialValue)

    const onBlur = () => {
        table.options.meta?.updateData(
            row.index,
            column.id,
            value
        )
    }

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue])

    return (
        <Input
            value={value}
            onBlur={onBlur}
            onChange={(e) =>
                setValue(
                    e.target.value
                )
            }
         />
    )
}

export default EditableCell