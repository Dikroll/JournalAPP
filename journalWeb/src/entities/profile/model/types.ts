export interface ProfilePhone {
	type: number
	number: string
}

export interface ProfileRelative {
	full_name: string
	relationship: string
	address: string
	phones: ProfilePhone[]
	emails: string[]
}

export interface ProfileDetails {
	id: number
	full_name: string
	address: string
	birthday: string
	email: string
	photo_url: string | null
	is_email_verified: boolean
	is_phone_verified: boolean
	fill_percentage: number
	phones: ProfilePhone[]
	socials: string[]
	relatives: ProfileRelative[]
}
