import { fixUrl } from "@/shared/lib/imageCache";

function normalizeSrc(value: string): string {
	return fixUrl(value) ?? value;
}

function normalizeSrcset(value: string): string {
	return value
		.split(",")
		.map((part) => {
			const trimmed = part.trim();
			if (!trimmed) return trimmed;

			const [url, ...descriptors] = trimmed.split(/\s+/);
			const normalizedUrl = normalizeSrc(url);

			return [normalizedUrl, ...descriptors].filter(Boolean).join(" ");
		})
		.join(", ");
}

export function normalizeNewsHtml(html: string): string {
	return html
		.replace(/\bsrc=(["'])(.*?)\1/g, (_, quote: string, value: string) => {
			return `src=${quote}${normalizeSrc(value)}${quote}`;
		})
		.replace(/\bsrcset=(["'])(.*?)\1/g, (_, quote: string, value: string) => {
			return `srcset=${quote}${normalizeSrcset(value)}${quote}`;
		});
}
