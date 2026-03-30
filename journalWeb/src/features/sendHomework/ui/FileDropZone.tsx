import { FileText, Upload, X } from 'lucide-react'
import { useRef, useState } from 'react'

function fmtSize(b: number) {
	if (b < 1024) return `${b} Б`
	if (b < 1048576) return `${(b / 1024).toFixed(0)} КБ`
	return `${(b / 1048576).toFixed(1)} МБ`
}

export function FileDropZone({
	file,
	onChange,
}: {
	file: File | null
	onChange: (f: File | null) => void
}) {
	const ref = useRef<HTMLInputElement>(null)
	const [drag, setDrag] = useState(false)

	if (file)
		return (
			<div className='flex items-center gap-3 px-4 py-3 bg-white/5 rounded-2xl border border-white/10'>
				<FileText size={18} className='text-[#F29F05] shrink-0' />
				<div className='flex-1 min-w-0'>
					<p className='text-sm text-[#F2F2F2] truncate'>{file.name}</p>
					<p className='text-xs text-[#9CA3AF] mt-0.5'>{fmtSize(file.size)}</p>
				</div>
				<button
					type='button'
					onClick={e => {
						e.preventDefault()
						onChange(null)
					}}
					className='shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/10'
				>
					<X size={13} className='text-[#9CA3AF]' />
				</button>
			</div>
		)

	return (
		<>
			<button
				type='button'
				onClick={e => {
					e.preventDefault()
					ref.current?.click()
				}}
				onDragOver={e => {
					e.preventDefault()
					setDrag(true)
				}}
				onDragLeave={() => setDrag(false)}
				onDrop={e => {
					e.preventDefault()
					setDrag(false)
					const f = e.dataTransfer.files[0]
					if (f) onChange(f)
				}}
				className={`w-full flex flex-col items-center gap-2 py-5 rounded-2xl border border-dashed ${
					drag
						? 'border-[#F29F05]/50 bg-[#F29F05]/5'
						: 'border-white/15 bg-white/3 hover:border-white/25 hover:bg-white/5'
				}`}
			>
				<Upload
					size={20}
					className={drag ? 'text-[#F29F05]' : 'text-[#9CA3AF]'}
				/>
				<p className='text-sm text-[#9CA3AF]'>
					Перетащите или <span className='text-[#F2F2F2]'>выберите файл</span>
				</p>
				<p className='text-xs text-[#6B7280]'>Без .txt и .csv</p>
			</button>
			<input
				ref={ref}
				type='file'
				className='hidden'
				accept='image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.py,.js,.ts'
				onChange={e => {
					const f = e.target.files?.[0]
					if (f) onChange(f)
					e.target.value = ''
				}}
			/>
		</>
	)
}
