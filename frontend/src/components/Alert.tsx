interface AlertProps {
    kind: "success" | "error";
    message: string;
}

function Alert({ kind, message }: AlertProps) {
    const tone =
        kind === "success"
            ? "border-mint/60 bg-mint/15 text-emerald-900"
            : "border-red-300 bg-red-50 text-red-700";

    return <p className={`rounded-xl border px-4 py-3 text-sm ${tone}`}>{message}</p>;
}

export default Alert;
