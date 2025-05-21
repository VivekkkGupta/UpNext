"use client"

import { useState } from "react"
import { SignIn } from "@clerk/nextjs"

export default function SignInModal({ children }) {
  const [showSignIn, setShowSignIn] = useState(false)

  return (
    <>
      <span onClick={() => setShowSignIn(true)} style={{ display: "inline-block" }}>
        {children}
      </span>
      {showSignIn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="relative">
            <button
              onClick={() => setShowSignIn(false)}
              className="absolute top-2 right-2 z-10 text-white bg-gray-700 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-600"
              aria-label="Close"
            >
              ×
            </button>
            <SignIn
              appearance={{
                elements: {
                  card: "bg-gray-900 text-white border-2 shadow-lg",
                  headerTitle: "text-xl mb-2 text-white",
                  headerSubtitle: "text-gray-400 mb-4",
                  socialButtonsBlockButton: "w-full py-2 rounded bg-white text-gray-900 hover:bg-gray-100 mb-2",
                  socialButtonsBlockButtonText: "text-white",
                },
                variables: {
                  colorPrimary: "#9333ea",
                  colorText: "#fff",
                  colorBackground: "#1f2937",
                },
              }}
              routing="hash"
              redirectUrl="/"
              only="oauth_google,oauth_github"
            />
          </div>
        </div>
      )}
    </>
  )
}