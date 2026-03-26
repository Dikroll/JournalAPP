import { LoginForm } from '@/features/auth'
import { OnboardingSlider, useOnboardingStore } from '@/features/showOnboarding'

export function LoginPage() {
	const isDone = useOnboardingStore(s => s.isDone)
	const setDone = useOnboardingStore(s => s.setDone)

	if (!isDone) {
		return <OnboardingSlider onDone={setDone} />
	}

	return <LoginForm />
}
