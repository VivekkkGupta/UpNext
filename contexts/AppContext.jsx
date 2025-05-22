'use client'

import { useAuth } from "@clerk/nextjs"
import { useState, useEffect, useContext, createContext } from "react"
import axios from "axios"

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
    const [spaces, setSpaces] = useState([])
    const [spacesLoading, setSpacesLoading] = useState(true)

    // Fetch all spaces once on mount and expose the function
    const fetchSpaces = async () => {
        setSpacesLoading(true)
        try {
            const res = await axios.get("/api/space")
            setSpaces(res.data.spaces || [])
            console.log("Spaces fetched:", res.data.spaces)
        } catch {
            setSpaces([])
        } finally {
            setSpacesLoading(false)
        }
    }

    useEffect(() => {
        fetchSpaces()
    }, [])

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
        spaces,
        setSpaces,
        spacesLoading,
        setSpacesLoading,
        fetchSpaces, // <-- expose this
    }

    return (
        <AppContext.Provider value={values}>
            {children}
        </AppContext.Provider>
    )
}