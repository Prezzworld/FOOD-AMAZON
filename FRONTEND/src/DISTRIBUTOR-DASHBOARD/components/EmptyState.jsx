// Reusable empty / no-data state, modeled on the Reviews page design:
// icon in a bordered circle, heading, helper text, optional action buttons.
//
// Props:
//   icon        — react-icons component shown in the circle
//   title       — short heading ("No reviews found")
//   description — one or two sentences explaining what will appear here
//   actions     — [{ label, onClick, variant }] buttons under the text
//                 (variant: "primary" | "secondary")
//   compact     — smaller icon + tighter spacing for use inside cards,
//                 tables and side panels; default (false) = page-level state
const EmptyState = ({
  icon: Icon,
  title,
  description,
  actions = [],
  compact = false,
}) => (
  <div
    className={`d-flex flex-column justify-content-center align-items-center text-center ${
      compact ? "py-4 px-3" : "py-5"
    }`}
  >
    {Icon && (
      <div
        className={`state-icon-circle d-flex justify-content-center align-items-center rounded-circle bg-white border border-2 border-primary mb-4 ${
          compact ? "state-icon-circle--compact" : ""
        }`}
      >
        <Icon size={compact ? 20 : 36} className="text-primary-normal" />
      </div>
    )}
    <h3 className={`fw-bold mb-2 ${compact ? "fs-5" : ""}`}>{title}</h3>
    {description && (
      <p
        className="font-archivo text-content-dark mb-0"
        style={{ maxWidth: 480 }}
      >
        {description}
      </p>
    )}
    {actions.length > 0 && (
      <div className="d-flex flex-column flex-sm-row gap-2 mt-4">
        {actions.map(({ label, onClick, variant = "primary" }) => (
          <button
            key={label}
            type="button"
            onClick={onClick}
            className={`border-0 text-white fw-medium rounded-3 py-3 px-5 font-archivo ${
              variant === "primary"
                ? "bg-primary-normal"
                : "bg-secondary-normal"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    )}
  </div>
);

export default EmptyState;
