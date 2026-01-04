export interface Customer {
    id: number
    accountNumber: string
    name: string
    nationalCode: string
    phone: string
    email: string
    status: 'active' | 'inactive' | 'pending'
    balance: string
    customerType: 'حقیقی' | 'حقوقی'
}

export interface CustomerFilters {
    nationalCode: string
    accountNumber: string
    name: string
    lastName: string
    accountType: string
    status: string
    customerType: string
    phone: string
}

export interface SelectOption {
    value: string
    label: string
}

