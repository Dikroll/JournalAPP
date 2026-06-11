import type React from "react";

interface SkeletonCardProps {
	className?: string;
	height?: string | number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
	className = "",
	height = "6rem", // default h-24 equivalent
}) => {
	return (
		<div
			className={`bg-app-surface rounded-3xl animate-pulse border border-app-border ${className}`.trim()}
			style={{ height }}
		/>
	);
};
