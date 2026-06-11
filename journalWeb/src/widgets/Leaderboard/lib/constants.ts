export const RANK_COLORS: Record<number, string> = {
	1: "#FBBF24",
	2: "#CBD5E1",
	3: "#D97706",
};

export const RANK_SURFACES: Record<
	number,
	{
		bg: string;
		border: string;
		badgeBg: string;
		badgeBorder: string;
		text: string;
	}
> = {
	1: {
		bg: "linear-gradient(180deg, rgba(251, 191, 36, 0.18), rgba(251, 191, 36, 0.07))",
		border: "rgba(251, 191, 36, 0.42)",
		badgeBg: "rgba(251, 191, 36, 0.14)",
		badgeBorder: "rgba(251, 191, 36, 0.36)",
		text: "#FBBF24",
	},
	2: {
		bg: "linear-gradient(180deg, rgba(203, 213, 225, 0.16), rgba(203, 213, 225, 0.06))",
		border: "rgba(203, 213, 225, 0.34)",
		badgeBg: "rgba(203, 213, 225, 0.12)",
		badgeBorder: "rgba(203, 213, 225, 0.28)",
		text: "#CBD5E1",
	},
	3: {
		bg: "linear-gradient(180deg, rgba(217, 119, 6, 0.18), rgba(217, 119, 6, 0.07))",
		border: "rgba(217, 119, 6, 0.38)",
		badgeBg: "rgba(217, 119, 6, 0.13)",
		badgeBorder: "rgba(217, 119, 6, 0.32)",
		text: "#D97706",
	},
};

export const HIGHLIGHT = {
	bg: "var(--color-highlight-bg)",
	border: "var(--color-highlight-border)",
	text: "var(--color-highlight-text)",
	badgeBg: "var(--color-highlight-badge-bg)",
	badgeBorder: "var(--color-highlight-badge-border)",
	coin: "var(--color-highlight-coin)",
	shadow: "var(--color-highlight-shadow)",
};

export const getRankColor = (rank: number) => {
	return RANK_COLORS[rank] ?? "var(--color-text-muted)";
};
