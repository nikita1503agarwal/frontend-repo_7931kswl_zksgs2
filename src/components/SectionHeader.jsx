export default function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-end justify-between mb-4">
      <div>
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        {subtitle && <p className="text-sm text-blue-200/70">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
