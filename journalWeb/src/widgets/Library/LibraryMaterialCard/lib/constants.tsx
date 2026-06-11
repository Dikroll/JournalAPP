import {
	BookMarked,
	BookOpen,
	FileText,
	FlaskConical,
	Presentation,
	TestTube,
	Video,
} from "lucide-react";

export const TYPE_PLACEHOLDER_ICONS: Record<number, React.ReactNode> = {
	1: <BookOpen size={28} />,
	2: <FileText size={28} />,
	3: <FlaskConical size={28} />,
	4: <BookMarked size={28} />,
	5: <Video size={28} />,
	6: <Presentation size={28} />,
	7: <TestTube size={28} />,
	8: <FileText size={28} />,
};

export const TYPE_PLACEHOLDER_ICONS_LG: Record<number, React.ReactNode> = {
	1: <BookOpen size={96} />,
	2: <FileText size={96} />,
	3: <FlaskConical size={96} />,
	4: <BookMarked size={96} />,
	5: <Video size={96} />,
	6: <Presentation size={96} />,
	7: <TestTube size={96} />,
	8: <FileText size={96} />,
};
