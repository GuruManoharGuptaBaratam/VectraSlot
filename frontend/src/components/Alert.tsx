interface AlertProps {
    kind: "error" | "success" | "info";
    message: string;
}

export default function Alert({ kind, message }: AlertProps) {
    const styles = {
        error: "border-red-200 bg-red-50 text-red-700",
        success: "border-emerald-200 bg-emerald-50 text-emerald-700",
        info: "border-sky-200 bg-sky-50 text-sky-700",
    };

    return (
        <div className={`rounded-2xl border px-4 py-4 text-sm font-medium shadow-sm transition-all animate-rise-fade ${styles[kind]}`}>
            <div className="flex items-center gap-3">
                <div className={`h-2 w-2 rounded-full ${kind === 'error' ? 'bg-red-500' : kind === 'success' ? 'bg-emerald-500' : 'bg-sky-500'} animate-pulse`} />
                {message}
            </div>
        </div>
    );
}
