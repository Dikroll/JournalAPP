export interface ApiError {
	detail: string;
}

export type LoadingState = "idle" | "loading" | "success" | "error";
