import { useMemo } from "react";
import { VariableForm } from "./takeoff-variables-row";
import { useMonday } from "@/components/monday-context-provider";
import { useVariables } from "@/hooks/queries/use-variables";

function SettingsVariables() {
    const { context } = useMonday()
    const { data: variables } = useVariables(context?.itemId)

    const variableComponents = useMemo(() => {
        if (!variables || variables.length === 0) {
            return <div className="text-sm text-muted-foreground">Aucune variable trouvée pour cette estimation 🤷. Créer votre première variable.</div>
        }    
        
        return variables.map((variable) => (
            <VariableForm key={variable.id} variable={variable} />
        ))
    }, [variables])

    return variableComponents
}

export default SettingsVariables