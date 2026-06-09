import type { HomeworkItem } from "@/entities/homework";

export function matchesHomeworkSearch(item: HomeworkItem, query: string) {
	const normalizedQuery = query.trim().toLocaleLowerCase("ru");
	if (!normalizedQuery) return true;

	const searchable = [
		item.theme,
		item.spec_name,
		item.teacher,
		item.comment,
		item.stud_answer,
		item.issued_date,
		item.deadline,
	]
		.filter(Boolean)
		.join(" ")
		.toLocaleLowerCase("ru");

	return searchable.includes(normalizedQuery);
}
