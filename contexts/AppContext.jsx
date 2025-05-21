'use client'

import { useAuth } from "@clerk/nextjs"
import { useState } from "react"
import { useContext, createContext } from "react"

const AppContext = createContext()

export const useAppContext = () => {
    const context = useContext(AppContext)
    if (!context) {
        throw new Error("useAppContext must be used within an AppProvider")
    }
    return context
}

export const AppProvider = ({ children }) => {

    const { isSignedIn } = useAuth()
    const [isDarkMode, setIsDarkMode] = useState(true)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isSignInModalOpen, setIsSignInModalOpen] = useState(false)
    const [isCreateSpaceModalOpen, setIsCreateSpaceModalOpen] = useState(false)

    const values = {
        isDarkMode,
        setIsDarkMode,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        isSignInModalOpen,
        setIsSignInModalOpen,
        isCreateSpaceModalOpen,
        setIsCreateSpaceModalOpen,
        isSignedIn,
    }

    return (
        <AppContext.Provider value={values}>
            {children}
        </AppContext.Provider>
    )
}

