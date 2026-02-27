export interface UserInfo {
	student_id: number;
	full_name: string;
	photo_url: string | null;
	age: number;
	group: { id: number; name: string; status: number };
	stream: { id: number; name: string };
	points: {
		diamonds: { earned: number; spent: number; balance: number };
		coins: { earned: number; spent: number; balance: number };
	};
	level: number;
	is_debtor: boolean;
	has_homework_issues: boolean;
}
