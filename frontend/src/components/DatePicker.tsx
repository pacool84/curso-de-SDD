interface DatePickerProps {
  date: string;
  onChange: (date: string) => void;
}

export function DatePicker({ date, onChange }: DatePickerProps) {
  return (
    <label className="block font-medium">
      Fecha
      <input
        type="date"
        value={date}
        onChange={(event) => onChange(event.target.value)}
        className="ml-3 rounded border p-2"
      />
    </label>
  );
}
