// The Exams page renders the exact same exam engine and card UI as the Dashboard.
// Zero logic duplication — all state, handlers, timers and dialogs live in Dashboard.
import DashboardContent from "./dashboard";

export default function ExamsPage() {
  return <DashboardContent />;
}
