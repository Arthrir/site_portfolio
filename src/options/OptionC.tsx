import App from "../App";
import PreviewBar from "./PreviewBar";
import "./options.css";

export default function OptionC({ onNavigate }: { onNavigate?: (theme: string) => void }) {
  return (
    <div className="relative">
      <App theme="option-c" />
      <PreviewBar
        currentTheme="option-c"
        onSelectTheme={(id) => {
          if (onNavigate) {
            onNavigate(id);
          } else {
            window.location.href = id === "original" ? "/" : `/${id === "option-a" ? "optionA" : id === "option-b" ? "optionB" : "optionC"}`;
          }
        }}
      />
    </div>
  );
}
