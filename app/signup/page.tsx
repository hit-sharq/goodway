'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'

export default function SignUpPage() {
  const [error, setError] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Registration failed')
        return
      }

      const result = await signIn('credentials', { email, password, redirect: false })

      if (result?.error) {
        setError('Account created, but sign in failed')
        return
      }

      window.location.href = '/'
    } catch {
      setError('Something went wrong')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Join Goodway</h1>
          <p className="text-muted-foreground">Create an account to save places and suggest corrections</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-lg bg-destructive p-4 text-destructive-foreground">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full name</label>
              <input
                type="text"
                name="name"
                required
                className="w-full rounded-lg border bg-input px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                required
                className="w-full rounded-lg border bg-input px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                name="password"
                required
                minLength={8}
                className="w-full rounded-lg border bg-input px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            Create account
          </button>
          <p className="text-sm text-center">
            Already have an account?{' '}
            <a href="/signin" className="text-primary hover:underline">
              Sign in
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}
