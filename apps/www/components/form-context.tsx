'use client'

import { session } from "@/lib/database"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

type FormContextValue = {
    formId: string
    setFormId: (id: string) => void
    formData: any
    setFormData: (d: any) => void
    handleChange: (name: string, value: any) => void
    pending: boolean
    validate: () => boolean,
    onValidate: (fn: CallableFunction) => void
}

const FormContext = createContext<FormContextValue>({
    formId: '',
    setFormId: (d: string) => {},
    formData: {},
    setFormData: (d: any) => {},
    handleChange: (name: string, value: any) => {},
    pending: false,
    validate: () => true,
    onValidate: (fn: CallableFunction) => {}
})

export function FormProvider({ children }: { children: ReactNode }) {
    const [formData, setFormData] = useState<any>({})
    const [formId, setFormId] = useState<string>('')
    const [pending, setPending] = useState(false)
    const [validationFunctions, setValidationFunctions] = useState<CallableFunction[]>([])

    const handleChange = (name: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [name]: value }))
    }

    const validate = () => {
        let result = true
        for(const fn of validationFunctions) {
            result &&= fn()
        }
        return result
    }

    const onValidate = (fn: CallableFunction) => {
        setValidationFunctions(fns=>[...fns, fn])
    }

    useEffect(() => {
        if (!formId) return
        session(formId).then((fdata) => {
            if (fdata) {
                setFormData((prev: any) => ({ ...prev, ...fdata }))
            }
        })
    }, [formId])

    return (
        <FormContext.Provider value={{ formId, setFormId, formData, setFormData, handleChange, pending, validate, onValidate }}>
            {children}
        </FormContext.Provider>
    )
}

export function useForm(formId: string, initialFormData: any) {
    const ctx = useContext(FormContext)
    if (!ctx) throw new Error('useContext must be used within a FormProvider')

    useEffect(() => {
        ctx.setFormId(formId)
        ctx.setFormData((prev: any) => ({ ...initialFormData, ...prev }))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formId])

    return ctx
}

export default FormContext
