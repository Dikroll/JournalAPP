import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { authApi } from "../api"
import { useAuthStore } from "../model/store"
import type { LoginRequest } from "../model/types"

export function useLogin() {
	const [username, setUsername] = useState("")
	const [password, setPassword] = useState("")
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)

	const setToken = useAuthStore((s) => s.setToken)
	const navigate = useNavigate()

	const submit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)
		setLoading(true)

		const payload: LoginRequest = { username, password }

		try {
			const { access_token } = await authApi.login(payload)
			setToken(access_token)
			navigate("/")
		} catch (err: unknown) {
			const msg =
				(err as { response?: { data?: { detail?: string } } })?.response?.data
					?.detail ?? "Ошибка входа"
			setError(msg)
		} finally {
			setLoading(false)
		}
	}

	return {
		username,
		password,
		error,
		loading,
		setUsername,
		setPassword,
		submit,
	}
}